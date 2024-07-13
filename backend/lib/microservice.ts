import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { PolicyStatement, Effect, Policy } from "aws-cdk-lib/aws-iam";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Duration } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface LmMicroservicesProps {
  courseTable: ITable;
  videosBucket: IBucket;
  transcribeBucket: IBucket;
  contentCloudfrontURL: string;
  openAiStatusParameter: StringParameter;
}

export class LmMicroservices extends Construct {
  public readonly messageMicroservice: NodejsFunction;
  public readonly courseMicroservice: NodejsFunction;
  public readonly transcribeMicroservice: NodejsFunction;
  public readonly videosMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: LmMicroservicesProps) {
    super(scope, id);

    this.messageMicroservice = this.createMessageFunction(
      props.openAiStatusParameter
    );
    this.courseMicroservice = this.createCourseFunction(
      props.courseTable,
      props.videosBucket,
      props.transcribeBucket,
      props.contentCloudfrontURL
    );
    this.transcribeMicroservice = this.createTranscribeFunction(
      props.videosBucket,
      props.transcribeBucket
    );
    this.videosMicroservice = this.createVideoFunction(props.videosBucket);
  }

  private createMessageFunction(
    openAiStatusParameter: StringParameter
  ): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
    };

    // Product microservices lambda function
    const messageFunction = new NodejsFunction(this, "messageLambdaFunction", {
      entry: join(__dirname, `/../src/message/index.js`),
      ...nodeJsFunctionProps,
    });

    openAiStatusParameter.grantRead(messageFunction);

    // const policyStatement = new PolicyStatement({
    //   actions: ["ssm:GetParameter"],
    //   resources: [openAiStatusParameter.parameterArn],
    // });

    // messageFunction.addToRolePolicy(policyStatement);

    return messageFunction;
  }

  private createCourseFunction(
    courseTable: ITable,
    videoBucket: IBucket,
    transcribeBucket: IBucket,
    contentCloudfrontURL: string
  ): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        TRANSCRIBE_BUCKET_NAME: transcribeBucket.bucketName,
        VIDEOS_BUCKET_NAME: videoBucket.bucketName,
        PRIMARY_KEY: "PK",
        SORT_KEY: "SK",
        DYNAMODB_TABLE_NAME: courseTable.tableName,
        CLOUDFRONT_URL: contentCloudfrontURL,
        EVENT_SOURCE: "com.lm.course.deletelesson",
        EVENT_DETAILTYPE: "DeleteLesson",
        EVENT_BUSNAME: "LmEventBus",
      },
      runtime: Runtime.NODEJS_16_X,
    };

    // Course microservices lambda function
    const courseFunction = new NodejsFunction(this, "courseLambdaFunction", {
      entry: join(__dirname, `/../src/course/index.js`),
      ...nodeJsFunctionProps,
    });

    courseTable.grantReadWriteData(courseFunction);

    const cognitoGetUserStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["cognito-idp:ListUsers"],
      resources: [
        `arn:aws:cognito-idp:ap-southeast-1:317103558684:userpool/ap-southeast-1_3NAnlnDaZ`,
      ],
    });

    courseFunction.role?.attachInlinePolicy(
      new Policy(this, "CognitoGetUserPolicy", {
        statements: [cognitoGetUserStatement],
      })
    );

    return courseFunction;
  }

  private createVideoFunction(videoBucket: IBucket): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        VIDEOS_BUCKET_NAME: videoBucket.bucketName,
        EVENT_SOURCE: "com.lm.course.deletelesson",
        EVENT_DETAILTYPE: "DeleteLesson",
        EVENT_BUSNAME: "LmEventBus",
      },
      runtime: Runtime.NODEJS_16_X,
    };

    // Course microservices lambda function
    const videosFunction = new NodejsFunction(this, "videosLambdaFunction", {
      entry: join(__dirname, `/../src/video/index.js`),
      ...nodeJsFunctionProps,
    });

    videoBucket.grantPut(videosFunction);
    videoBucket.grantPutAcl(videosFunction);
    videoBucket.grantRead(videosFunction);
    videoBucket.grantDelete(videosFunction);

    return videosFunction;
  }

  private createTranscribeFunction(
    videoBucket: IBucket,
    transcribeBucket: IBucket
  ): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        TRANSCRIBE_BUCKET_NAME: transcribeBucket.bucketName,
        EVENT_SOURCE: "com.lm.course.deletelesson",
        EVENT_DETAILTYPE: "DeleteLesson",
        EVENT_BUSNAME: "LmEventBus",
      },
      runtime: Runtime.NODEJS_16_X,
    };

    // Product microservices lambda function
    const transcribeFunction = new NodejsFunction(
      this,
      "transcribeLambdaFunction",
      {
        entry: join(__dirname, `/../src/transcribe/index.js`),
        ...nodeJsFunctionProps,
      }
    );

    transcribeFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ["transcribe:StartTranscriptionJob"],
        resources: ["*"], // You can restrict this to specific resources if needed
      })
    );

    videoBucket.grantRead(transcribeFunction);
    transcribeBucket.grantPut(transcribeFunction);
    transcribeBucket.grantRead(transcribeFunction);
    transcribeBucket.grantDelete(transcribeFunction);

    return transcribeFunction;
  }
}
