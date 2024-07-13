import { Duration } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { IQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface LmQueueProps {
  coursesConsumer: IFunction;
  transcribeConsumer: IFunction;
  videosConsumer: IFunction;
}

export class LmQueue extends Construct {
  public readonly coursesQueue: IQueue;
  public readonly transcribeQueue: IQueue;
  public readonly videosQueue: IQueue;

  constructor(scope: Construct, id: string, props: LmQueueProps) {
    super(scope, id);

    //courses queue
    this.coursesQueue = new Queue(this, "CoursesQueue", {
      queueName: "CoursesQueue",
      visibilityTimeout: Duration.seconds(30), // default value
    });

    props.coursesConsumer.addEventSource(
      new SqsEventSource(this.coursesQueue, {
        batchSize: 1,
      })
    );

    //transcribe queue
    this.transcribeQueue = new Queue(this, "TranscribeQueue", {
      queueName: "TranscribeQueue",
      visibilityTimeout: Duration.seconds(30), // default value
    });

    props.transcribeConsumer.addEventSource(
      new SqsEventSource(this.transcribeQueue, {
        batchSize: 1,
      })
    );

    //transcribe queue
    this.videosQueue = new Queue(this, "VideosQueue", {
      queueName: "VideosQueue",
      visibilityTimeout: Duration.seconds(30), // default value
    });

    props.videosConsumer.addEventSource(
      new SqsEventSource(this.videosQueue, {
        batchSize: 1,
      })
    );
  }
}
