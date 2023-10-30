import * as cdk from "aws-cdk-lib"
import {
  aws_s3 as s3,
  aws_s3_deployment as s3Deploy,
  aws_cloudfront as cloudfront,
  aws_iam as iam,
  aws_route53 as route53,
  aws_certificatemanager as acm,
  aws_cloudfront_origins,
} from "aws-cdk-lib"
import * as targets from "aws-cdk-lib/aws-route53-targets"

export class TranscriptionCdkStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    domain: string,
    subDomain: string,
    hostZoneId: string,
    certificate: acm.Certificate,
    props?: cdk.StackProps
  ) {
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

    // // cloudnfrontを作成してバケットと紐付ける。
    // // https://qiita.com/piz032/items/789c60700d0573b925fd
    // const distribution = new cloudfront.CloudFrontWebDistribution(
    //   this,
    //   `cloudfront-${id}`,
    //   {
    //     originConfigs: [
    //       {
    //         s3OriginSource: {
    //           s3BucketSource: bucket,
    //           originAccessIdentity: oai,
    //         },
    //         behaviors: [{ isDefaultBehavior: true }],
    //       },
    //     ],
    //     viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
    //       certificate,
    //       {
    //         aliases: [subDomain], // Your subdomain name
    //       }
    //     ),
    //   }
    // )

    const headersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      `xxxx-cf-header-policy-${id}`,
      {
        customHeadersBehavior: {
          customHeaders: [
            {
              header: "Cross-Origin-Opener-Policy",
              value: "same-origin",
              override: false,
            },
            {
              header: "Cross-Origin-Embedder-Policy",
              value: "require-corp",
              override: false,
            },
          ],
        },
      }
    )

    const distribution2 = new cloudfront.Distribution(
      this,
      `xxxx-cf-dist-${id}`,
      {
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: new aws_cloudfront_origins.S3Origin(bucket, {
            originAccessIdentity: oai,
          }),
          // viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          responseHeadersPolicy: headersPolicy,
        },
        certificate: certificate,
        domainNames: [subDomain],
      }
    )

    // Route 53 DNS Zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      `MyHostedZone-${id}`,
      {
        hostedZoneId: hostZoneId,
        zoneName: domain, // Your domain name
      }
    )

    // Create a record set for the subdomain
    new route53.ARecord(this, `SubdomainRecord-${id}`, {
      zone: hostedZone,
      recordName: subDomain, // Your subdomain
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution2)
      ),
    })
  }
}
