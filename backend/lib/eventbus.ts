import { Duration } from "aws-cdk-lib";
import { EventBus, Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction, SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface LmEventBusProps {
  videosBucket: IBucket;
  coursesQueue: IQueue;
  transcribeQueue: IQueue;
  videosQueue: IQueue;
  transcribeBucket: IBucket;
  checkOpenAiLambda: IFunction;
  courseFunction: IFunction;
  // publisherFunction: IFunction;
  // targetQueue: IQueue;
}

export class LmEventBus extends Construct {
  constructor(scope: Construct, id: string, props: LmEventBusProps) {
    super(scope, id);

    //eventbus
    const bus = EventBus.fromEventBusName(this, "DefaultEventBus", "default");

    const lmBus = new EventBus(this, "LmEventBus", {
      eventBusName: "LmEventBus",
    });

    lmBus.grantPutEventsTo(props.courseFunction);

    const deleteLessonRule = new Rule(this, "deleteLessonRule", {
      eventBus: lmBus,
      enabled: true,
      description: "When course microservice deletes a lesson",
      eventPattern: {
        source: ["com.lm.course.deletelesson"],
        detailType: ["DeleteLesson"],
      },
      ruleName: "DeleteLessonRule",
    });

    deleteLessonRule.addTarget(new SqsQueue(props.videosQueue));
    deleteLessonRule.addTarget(new SqsQueue(props.transcribeQueue));

    const deleteCourseRule = new Rule(this, "deleteCourseRule", {
      eventBus: lmBus,
      enabled: true,
      description: "When course microservice deletes a course",
      eventPattern: {
        source: ["com.lm.course.deletecourse"],
        detailType: ["DeleteCourse"],
      },
      ruleName: "DeleteCourseRule",
    });

    deleteCourseRule.addTarget(new SqsQueue(props.videosQueue));
    deleteCourseRule.addTarget(new SqsQueue(props.transcribeQueue));

    const videoUploadedRule = new Rule(this, "videoUploadedRule", {
      eventBus: bus,
      enabled: true,
      description: "When Video is uploaded to videos S3 bucket",
      eventPattern: {
        source: ["aws.s3"],
        detailType: ["Object Created"],
        detail: {
          bucket: {
            name: [props.videosBucket.bucketName],
          },
        },
      },
    });

    // need to pass target to Ordering Lambda service
    videoUploadedRule.addTarget(new SqsQueue(props.coursesQueue));
    videoUploadedRule.addTarget(new SqsQueue(props.transcribeQueue));

    const transcibeCompletedRule = new Rule(this, "transcibeCompletedRule", {
      eventBus: bus,
      enabled: true,
      description: "When transcription is uploaded to transcribe S3 bucket",
      eventPattern: {
        source: ["aws.s3"],
        detailType: ["Object Created"],
        detail: {
          bucket: {
            name: [props.transcribeBucket.bucketName],
          },
          object: {
            key: [
              {
                suffix: ".json",
              },
            ],
          },
        },
      },
    });

    transcibeCompletedRule.addTarget(new SqsQueue(props.coursesQueue));

    const checkOpenAIRule = new Rule(this, "checkOpenAIRule", {
      schedule: Schedule.rate(Duration.hours(24)),
      // schedule: Schedule.rate(Duration.minutes(5)),
    });

    checkOpenAIRule.addTarget(new LambdaFunction(props.checkOpenAiLambda));
  }
}
