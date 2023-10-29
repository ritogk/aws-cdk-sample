#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { TranscriptionCdkStack } from "../lib/transcription-cdk-stack"
import { AcmCdkStack } from "../lib/acm-cdk-stack"
import * as dotenv from "dotenv"
dotenv.config()

// 環境変数へのアクセス
const hostedZoneId = process.env.HOST_ZONE_ID ?? ""
const subDomain = process.env.SUB_DOMAIN ?? ""
const domain = process.env.DOMAIN ?? ""

const app = new cdk.App()

const acmCdk = new AcmCdkStack(
  app,
  "acm-cdk-stack",
  domain,
  subDomain,
  hostedZoneId,
  {
    env: { region: "us-east-1" },
    crossRegionReferences: true,
  }
)

new TranscriptionCdkStack(
  app,
  "transcription-cdk-stack",
  domain,
  subDomain,
  hostedZoneId,
  acmCdk.certificate,
  {
    env: {
      region: "ap-northeast-1",
    },
    crossRegionReferences: true,
  }
)
