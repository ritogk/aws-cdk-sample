import * as cdk from "aws-cdk-lib"
import { aws_s3 as s3, aws_s3_deployment as s3Deploy } from "aws-cdk-lib"
export class TranscriptionCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    const bucket = new s3.Bucket(this, id, {
      // bucketName: "my-first-bucket", // 指定すると怒られる。
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // CDKスタックが削除されたときにバケットを削除する（オプション）
    })

    // s3にsample.txtをアップロードする
    // new s3Deploy.BucketDeployment(this, "DeploySample", {
    //   sources: [s3Deploy.Source.asset("./transcription-cdk-stack/sample.txt")],
    //   destinationBucket: new s3.Bucket(this, "SampleBucket", {
    //     websiteIndexDocument: "index.html",
    //     versioned: true,
    //     removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   }),
    // })

    new s3Deploy.BucketDeployment(this, "DeploySample", {
      sources: [s3Deploy.Source.asset("./lib/transcription-cdk-stack/assets")],
      destinationBucket: bucket,
    })
  }
}
