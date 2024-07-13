import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LmApiGateway } from "./apigateway";
import { LmDatabase } from "./database";
import { LmMicroservices } from "./microservice";
import { LmEventBus } from "./eventbus";
import { LmQueue } from "./queue";
import { LmCoginto } from "./cognito";
import { LmBucket } from "./bucket";
import { LmDistribution } from "./distribution";
import { LmLambda } from "./lambda";
import { LmParameter } from "./parameter";

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new LmDatabase(this, "Database");

    const cognito = new LmCoginto(this, "Cognito");

    const bucket = new LmBucket(this, "Bucket");

    const parameter = new LmParameter(this, "parameter");

    const lambda = new LmLambda(this, "Lambda", {
      openAiStatusParameter: parameter.openAiStatusParameter,
    });

    const distribution = new LmDistribution(this, "Distribution", {
      videosBucket: bucket.videosBucket,
      transcribeBucket: bucket.transcribeBucket,
    });

    const microservices = new LmMicroservices(this, "Microservices", {
      courseTable: database.courseTable,
      videosBucket: bucket.videosBucket,
      transcribeBucket: bucket.transcribeBucket,
      contentCloudfrontURL: distribution.videosAndTranscriptCloudFrontURL,
      openAiStatusParameter: parameter.openAiStatusParameter,
    });

    const apigateway = new LmApiGateway(this, "ApiGateway", {
      messageMicroservices: microservices.messageMicroservice,
      courseMicroservices: microservices.courseMicroservice,
      videosMicroservices: microservices.videosMicroservice,
      userPool: cognito.userPool,
    });

    const queue = new LmQueue(this, "Queue", {
      coursesConsumer: microservices.courseMicroservice,
      transcribeConsumer: microservices.transcribeMicroservice,
      videosConsumer: microservices.videosMicroservice,
    });

    const eventbus = new LmEventBus(this, "EventBus", {
      videosBucket: bucket.videosBucket,
      coursesQueue: queue.coursesQueue,
      transcribeQueue: queue.transcribeQueue,
      videosQueue: queue.videosQueue,
      transcribeBucket: bucket.transcribeBucket,
      checkOpenAiLambda: lambda.checkOpenAiLambdaFunction,
      courseFunction: microservices.courseMicroservice,
    });
  }
}
