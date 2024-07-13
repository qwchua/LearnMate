import {
  Bucket,
  IBucket,
  HttpMethods,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class LmBucket extends Construct {
  public readonly videosBucket: IBucket;
  public readonly transcribeBucket: IBucket;
  public readonly deploymentBucket: IBucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.videosBucket = this.createVideosBucket();
    this.transcribeBucket = this.createTranscribeBucket();
  }

  private createVideosBucket(): IBucket {
    const videoBucket = new Bucket(this, "videos", {
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      eventBridgeEnabled: true,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    return videoBucket;
  }

  private createTranscribeBucket(): IBucket {
    const transcribeBucket = new Bucket(this, "transcribe", {
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      eventBridgeEnabled: true,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    return transcribeBucket;
  }
}
