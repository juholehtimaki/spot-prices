#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { SpotPriceWorkerStack } from "../lib/spot-price-worker-stack";

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
const spotPriceWorkerStack = new SpotPriceWorkerStack(
  app,
  "SpotPriceWorkerStack",
);
new ApiStack(app, "ApiStack", spotPriceWorkerStack);
