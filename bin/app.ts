#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { TranscriptionCdkStack } from "../lib/transcription-cdk-stack"

const app = new cdk.App()
new TranscriptionCdkStack(app, "transcription-cdk-stack", {})
