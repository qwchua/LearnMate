import { CfnOutput, Duration } from "aws-cdk-lib";
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
  ResponseHeadersPolicy,
  OriginRequestPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CanonicalUserPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface LmDistributionProps {
  videosBucket: IBucket;
  transcribeBucket: IBucket;
}

export class LmDistribution extends Construct {
  public readonly videosAndTranscriptDistribution: Distribution;
  public readonly videosAndTranscriptCloudFrontURL: string;

  constructor(scope: Construct, id: string, props: LmDistributionProps) {
    super(scope, id);

    this.videosAndTranscriptDistribution = this.createDistribution(
      props.videosBucket,
      props.transcribeBucket
    );

    this.videosAndTranscriptCloudFrontURL =
      this.videosAndTranscriptDistribution.distributionDomainName;
  }

  private createDistribution(videosBucket: IBucket, transcribeBucket: IBucket) {
    const originIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    const tOriginIdentity = new OriginAccessIdentity(this, "tOriginIdentity");
    transcribeBucket.grantRead(tOriginIdentity);

    videosBucket.grantRead(originIdentity);
    transcribeBucket.grantRead(originIdentity);

    const responseHeadersPolicy = new ResponseHeadersPolicy(
      this,
      "defaultResponseHeadersPolicy",
      {
        corsBehavior: {
          accessControlAllowOrigins: ["*"], // Change this to your specific domain if needed
          accessControlAllowHeaders: ["*"],
          accessControlAllowMethods: ["GET", "PUT", "OPTIONS"],
          accessControlExposeHeaders: [],
          accessControlAllowCredentials: false,
          originOverride: true,
        },
      }
    );

    const distribution = new Distribution(
      this,
      "videosAndTranscriptDistribution",
      {
        defaultBehavior: {
          origin: new S3Origin(videosBucket, {
            originAccessIdentity: originIdentity,
          }),
          responseHeadersPolicy: responseHeadersPolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        }, // Default behavior for videoBucket
        additionalBehaviors: {
          "/videos/*": {
            origin: new S3Origin(videosBucket, {
              originAccessIdentity: originIdentity,
            }),
            responseHeadersPolicy: responseHeadersPolicy,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
          "/transcriptions/*.json": {
            origin: new S3Origin(transcribeBucket, {
              originAccessIdentity: tOriginIdentity,
            }),
            responseHeadersPolicy: responseHeadersPolicy,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
        },
      }
    );

    new CfnOutput(this, "videosAndTranscriptDistributionURL", {
      value: distribution.distributionDomainName,
    });

    return distribution;
  }
}
