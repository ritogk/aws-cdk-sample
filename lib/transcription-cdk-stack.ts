import * as cdk from "aws-cdk-lib"
import { aws_s3 as s3 } from "aws-cdk-lib"

export class TranscriptionCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // new s3.Bucket(this, "MyFirstBucket", {
    //   versioned: true,
    // })
    new s3.Bucket(this, id, {
      // bucketName: "my-first-bucket", // 指定すると怒られる。
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // CDKスタックが削除されたときにバケットを削除する（オプション）
    })
  }
}
