import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2_integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";
import type { SpotPriceWorkerStack } from "./spot-price-worker-stack";

export class ApiStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    spotPriceWorkerStack: SpotPriceWorkerStack,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const lambdaLogGroup = new logs.LogGroup(this, "ApiLambdaLogGroup", {
      logGroupName: "ApiLambdas",
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const api = new apigatewayv2.HttpApi(this, "ApiGw", {
      apiName: "SpotPricesAPI",
      description: "API for spot prices",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigatewayv2.CorsHttpMethod.GET],
      },
      disableExecuteApiEndpoint: false,
    });

    const dailyLambda = new NodejsFunction(this, "DailyLambda", {
      logGroup: lambdaLogGroup,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "lambdas/api/daily.ts",
      environment: {
        BUCKET_NAME: spotPriceWorkerStack.bucket.bucketName,
      },
      bundling: {
        minify: true,
      },
      memorySize: 512,
      timeout: cdk.Duration.minutes(2),
    });

    spotPriceWorkerStack.bucket.grantRead(dailyLambda);

    const dailyLambdaIntegration =
      new apigatewayv2_integrations.HttpLambdaIntegration(
        "DailyLambdaIntegration",
        dailyLambda,
      );

    api.addRoutes({
      path: "/daily",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: dailyLambdaIntegration,
    });
  }
}
