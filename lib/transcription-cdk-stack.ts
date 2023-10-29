import * as cdk from "aws-cdk-lib"
import {
  aws_s3 as s3,
  aws_s3_deployment as s3Deploy,
  aws_cloudfront as cloudfront,
  aws_iam as iam,
} from "aws-cdk-lib"
export class TranscriptionCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // バケット作成
    const bucket = new s3.Bucket(this, `bucket-${id}`, {
      // bucketName: "my-first-bucket", // 指定すると怒られる。
      // versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // CDKスタックが削除されたときにバケットを削除する（オプション）
    })

    // バケットに静的ファイルを配置
    new s3Deploy.BucketDeployment(this, `bucket-upload-${id}`, {
      sources: [s3Deploy.Source.asset("./lib/transcription-cdk-stack/assets")],
      destinationBucket: bucket,
    })

    // S3とCloudFrontとの連携用oaiを作成
    const oai = new cloudfront.OriginAccessIdentity(this, `oai-${id}`)

    // CloudFrontからGetObjectできるようにポリシーを追加
    const bucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject"],
      principals: [
        new iam.CanonicalUserPrincipal(
          oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
        ),
      ],
      resources: [`${bucket.bucketArn}/*`],
    })
    bucket.addToResourcePolicy(bucketPolicy)

    // cloudnfrontを作成してバケットと紐付ける。
    // https://qiita.com/piz032/items/789c60700d0573b925fd
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `cloudfront-${id}`,
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    )
  }
}
