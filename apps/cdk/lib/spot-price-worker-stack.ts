import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as events from "aws-cdk-lib/aws-events";
import * as eventtargets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as stepfunctions from "aws-cdk-lib/aws-stepfunctions";
import * as stepfunctions_tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import type { Construct } from "constructs";

export class SpotPriceWorkerStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "PricesBucket", {
      bucketName: "spot-price-data-bucket",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const lambdaLogGroup = new logs.LogGroup(this, "WorkerLambdaLogGroup", {
      logGroupName: "WorkerLambdas",
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const worker = this.createDailyWorker(this.bucket, lambdaLogGroup);
    const aggregator = this.createAggregatorWorker(this.bucket, lambdaLogGroup);

    this.createScheduledMachine(worker, aggregator);
    this.createCfnDistribution(this.bucket);
  }

  createScheduledMachine(
    dailyWorkerLambda: cdk.aws_lambda_nodejs.NodejsFunction,
    aggregatorWorkerLambda: cdk.aws_lambda_nodejs.NodejsFunction,
  ) {
    const dailyWorkerLambdaTask = new stepfunctions_tasks.LambdaInvoke(
      this,
      "InvokeDailyWorkerLambda",
      {
        lambdaFunction: dailyWorkerLambda,
        inputPath: "$",
        outputPath: "$",
      },
    );

    dailyWorkerLambdaTask.addRetry({
      maxAttempts: 12,
      interval: cdk.Duration.minutes(10),
      backoffRate: 1.0,
    });

    const aggregatorLambdaTask = new stepfunctions_tasks.LambdaInvoke(
      this,
      "InvokeAggregatorLambda",
      {
        lambdaFunction: aggregatorWorkerLambda,
        inputPath: "$",
        outputPath: "$",
      },
    );

    const definition = dailyWorkerLambdaTask.next(aggregatorLambdaTask);

    const stateMachine = new stepfunctions.StateMachine(
      this,
      "SpotPriceWorkflow",
      {
        definition,
        timeout: cdk.Duration.hours(2),
      },
    );

    new events.Rule(this, "TriggerDailyWorker", {
      schedule: events.Schedule.cron({ minute: "0", hour: "12" }),
      targets: [new eventtargets.SfnStateMachine(stateMachine)],
    });
  }

  createDailyWorker(bucket: s3.Bucket, logGroup: logs.LogGroup) {
    const entsoeApiKey = ssm.StringParameter.fromStringParameterName(
      this,
      "EntsoeApiKey",
      "/spot-prices/entsoe-api-key",
    );

    const workerLambda = new NodejsFunction(this, "DailyWorkerLambda", {
      logGroup,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "lambdas/spot-price-workers/fetcher.ts",
      environment: {
        ENTSOE_API_KEY: entsoeApiKey.stringValue,
        BUCKET_NAME: bucket.bucketName,
      },
      bundling: {
        minify: true,
      },
      timeout: cdk.Duration.minutes(2),
      memorySize: 512,
    });

    bucket.grantReadWrite(workerLambda);
    return workerLambda;
  }

  createAggregatorWorker(bucket: s3.Bucket, logGroup: logs.LogGroup) {
    const aggregatorLambda = new NodejsFunction(
      this,
      "AggregatorWorkerLambda",
      {
        logGroup,
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: "lambdas/spot-price-workers/aggregator.ts",
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
        bundling: {
          minify: true,
        },
        timeout: cdk.Duration.minutes(2),
        memorySize: 512,
      },
    );

    bucket.grantReadWrite(aggregatorLambda);
    return aggregatorLambda;
  }

  createCfnDistribution(bucket: s3.Bucket) {
    const cfnDistribution = new cloudfront.Distribution(
      this,
      "PricesCfnDistribution",
      {
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
          compress: true,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    );

    new cdk.CfnOutput(this, "CfnUrl", {
      value: cfnDistribution.domainName,
    });
  }
}
