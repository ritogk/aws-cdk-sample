import * as cdk from "aws-cdk-lib"
import {
  aws_s3 as s3,
  aws_s3_deployment as s3Deploy,
  aws_cloudfront as cloudfront,
  aws_iam as iam,
  aws_route53 as route53,
  aws_certificatemanager as acm,
} from "aws-cdk-lib"
import * as targets from "aws-cdk-lib/aws-route53-targets"

/**
 * サブドメインの署名書を発行する。
 */
export class AcmCdkStack extends cdk.Stack {
  public readonly certificate: acm.Certificate
  constructor(
    scope: cdk.App,
    id: string,
    domain: string,
    subDomain: string,
    hostZoneId: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props)

    // Route 53 DNS Zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "MyHostedZone",
      {
        hostedZoneId: hostZoneId,
        zoneName: domain, // Your domain name
      }
    )

    // // Create a record set for the subdomain
    // new route53.ARecord(this, "SubdomainRecord", {
    //   zone: hostedZone,
    //   recordName: "test.homisoftware.net", // Your subdomain
    //   target: route53.RecordTarget.fromIpAddresses("your_target_ip"),
    // })

    // Create an SSL certificate in ACM
    this.certificate = new acm.Certificate(this, "MyCertificate", {
      domainName: subDomain, // Your subdomain name
      validation: acm.CertificateValidation.fromDns(hostedZone), // Validate using DNS records
    })
  }
}
