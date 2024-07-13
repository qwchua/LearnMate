import { App } from "aws-cdk-lib";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import { BackendStack } from "../../lib/backend-stack";

describe("Monitor stack test suite", () => {
  let backendStackTemplate: Template;

  beforeAll(() => {
    const testApp = new App({
      outdir: "cdk.out",
    });
    const backendStack = new BackendStack(testApp, "backendStack");
    backendStackTemplate = Template.fromStack(backendStack);
  });

  test("Lambda properties", () => {
    backendStackTemplate.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "index.handler",
      Runtime: "nodejs16.x",
    });
  });

  test('DynamoDB Table "course" has PK and SK attributes', () => {
    backendStackTemplate.hasResourceProperties("AWS::DynamoDB::Table", {
      TableName: "course",
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
      ],
    });
  });

  test("Parameter store attributes has openai status", () => {
    backendStackTemplate.hasResourceProperties("AWS::SSM::Parameter", {
      Name: "/openai/api/status",
      Type: "String",
      Value: "unknown",
    });
  });

  test("checkOpenAiLambdaFunction policy allows ssm:PutParameter", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "ssm:PutParameter",
            Effect: "Allow",
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "LambdacheckOpenAiLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("MicroservicesmessageLambdaFunction policy allows ssm:GetParameter", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: [
              "ssm:DescribeParameters",
              "ssm:GetParameters",
              "ssm:GetParameter",
              "ssm:GetParameterHistory",
            ],
            Effect: "Allow",
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicesmessageLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("MicroservicescourseLambdaFunction policy allows dynamoDB operations", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              "dynamodb:BatchGetItem",
              "dynamodb:GetRecords",
              "dynamodb:GetShardIterator",
              "dynamodb:Query",
              "dynamodb:GetItem",
              "dynamodb:Scan",
              "dynamodb:ConditionCheckItem",
              "dynamodb:BatchWriteItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
              "dynamodb:DescribeTable",
            ]),
            Effect: "Allow",
            Resource: Match.arrayWith([
              Match.objectLike({
                "Fn::GetAtt": Match.arrayWith([
                  Match.stringLikeRegexp("Databasecourse.*"),
                  "Arn",
                ]),
              }),
              { Ref: "AWS::NoValue" },
            ]),
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicescourseLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("MicroservicescourseLambdaFunction policy allows SQS operations", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              "sqs:ReceiveMessage",
              "sqs:ChangeMessageVisibility",
              "sqs:GetQueueUrl",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
            ]),
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::GetAtt": Match.arrayWith([
                Match.stringLikeRegexp("QueueCoursesQueue.*"),
                "Arn",
              ]),
            }),
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicescourseLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("MicroservicescourseLambdaFunction policy allows eventbridge operations", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "events:PutEvents",
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::GetAtt": Match.arrayWith([
                Match.stringLikeRegexp("EventBusLmEventBus.*"),
                "Arn",
              ]),
            }),
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicescourseLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("MicroservicestranscribeLambdaFunction policy allows start transcription job", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "transcribe:StartTranscriptionJob",
            Effect: "Allow",
            Resource: "*",
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicestranscribeLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("MicroservicestranscribeLambdaFunction policy allows videoBucket operations", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
            Effect: "Allow",
            Resource: Match.arrayWith([
              Match.objectLike({
                "Fn::GetAtt": Match.arrayWith([
                  Match.stringLikeRegexp("Bucketvideos7CC61469.*"),
                  "Arn",
                ]),
              }),
            ]),
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicestranscribeLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("MicroservicestranscribeLambdaFunction policy allows allows Transcribe, S3, and SQS actions", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "transcribe:StartTranscriptionJob",
            Effect: "Allow",
            Resource: "*",
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "s3:GetObject*",
              "s3:GetBucket*",
              "s3:List*",
            ]),
            Effect: "Allow",
            Resource: Match.arrayWith([
              Match.objectLike({
                "Fn::GetAtt": Match.arrayWith([
                  Match.stringLikeRegexp("Bucketvideos.*"),
                  "Arn",
                ]),
              }),
              Match.objectLike({
                "Fn::Join": Match.arrayWith([
                  "",
                  Match.arrayWith([
                    Match.objectLike({
                      "Fn::GetAtt": Match.arrayWith([
                        Match.stringLikeRegexp("Bucketvideos.*"),
                        "Arn",
                      ]),
                    }),
                    "/*",
                  ]),
                ]),
              }),
            ]),
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "s3:PutObject",
              "s3:PutObjectLegalHold",
              "s3:PutObjectRetention",
              "s3:PutObjectTagging",
              "s3:PutObjectVersionTagging",
              "s3:Abort*",
            ]),
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::Join": Match.arrayWith([
                "",
                Match.arrayWith([
                  Match.objectLike({
                    "Fn::GetAtt": Match.arrayWith([
                      Match.stringLikeRegexp("Buckettranscribe.*"),
                      "Arn",
                    ]),
                  }),
                  "/*",
                ]),
              ]),
            }),
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "s3:GetObject*",
              "s3:GetBucket*",
              "s3:List*",
            ]),
            Effect: "Allow",
            Resource: Match.arrayWith([
              Match.objectLike({
                "Fn::GetAtt": Match.arrayWith([
                  Match.stringLikeRegexp("Buckettranscribe.*"),
                  "Arn",
                ]),
              }),
              Match.objectLike({
                "Fn::Join": Match.arrayWith([
                  "",
                  Match.arrayWith([
                    Match.objectLike({
                      "Fn::GetAtt": Match.arrayWith([
                        Match.stringLikeRegexp("Buckettranscribe.*"),
                        "Arn",
                      ]),
                    }),
                    "/*",
                  ]),
                ]),
              }),
            ]),
          }),
          Match.objectLike({
            Action: "s3:DeleteObject*",
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::Join": Match.arrayWith([
                "",
                Match.arrayWith([
                  Match.objectLike({
                    "Fn::GetAtt": Match.arrayWith([
                      Match.stringLikeRegexp("Buckettranscribe.*"),
                      "Arn",
                    ]),
                  }),
                  "/*",
                ]),
              ]),
            }),
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "sqs:ReceiveMessage",
              "sqs:ChangeMessageVisibility",
              "sqs:GetQueueUrl",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
            ]),
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::GetAtt": Match.arrayWith([
                Match.stringLikeRegexp("QueueTranscribeQueue.*"),
                "Arn",
              ]),
            }),
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicestranscribeLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("Transcribe Lambda function event source mapping has correct properties", () => {
    backendStackTemplate.hasResourceProperties(
      "AWS::Lambda::EventSourceMapping",
      {
        BatchSize: 1,
        EventSourceArn: Match.objectLike({
          "Fn::GetAtt": Match.arrayWith([
            Match.stringLikeRegexp("QueueTranscribeQueue.*"),
            "Arn",
          ]),
        }),
        FunctionName: {
          Ref: Match.stringLikeRegexp(
            "MicroservicestranscribeLambdaFunction.*"
          ),
        },
      }
    );
  });

  test("Video Lambda function policy allows S3 and SQS actions", () => {
    backendStackTemplate.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              "s3:PutObject",
              "s3:PutObjectLegalHold",
              "s3:PutObjectRetention",
              "s3:PutObjectTagging",
              "s3:PutObjectVersionTagging",
              "s3:Abort*",
            ]),
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::Join": Match.arrayWith([
                "",
                Match.arrayWith([
                  Match.objectLike({
                    "Fn::GetAtt": Match.arrayWith([
                      Match.stringLikeRegexp("Bucketvideos.*"),
                      "Arn",
                    ]),
                  }),
                  "/*",
                ]),
              ]),
            }),
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "s3:PutObjectAcl",
              "s3:PutObjectVersionAcl",
            ]),
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::Join": Match.arrayWith([
                "",
                Match.arrayWith([
                  Match.objectLike({
                    "Fn::GetAtt": Match.arrayWith([
                      Match.stringLikeRegexp("Bucketvideos.*"),
                      "Arn",
                    ]),
                  }),
                  "/*",
                ]),
              ]),
            }),
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "s3:GetObject*",
              "s3:GetBucket*",
              "s3:List*",
            ]),
            Effect: "Allow",
            Resource: Match.arrayWith([
              Match.objectLike({
                "Fn::GetAtt": Match.arrayWith([
                  Match.stringLikeRegexp("Bucketvideos.*"),
                  "Arn",
                ]),
              }),
              Match.objectLike({
                "Fn::Join": Match.arrayWith([
                  "",
                  Match.arrayWith([
                    Match.objectLike({
                      "Fn::GetAtt": Match.arrayWith([
                        Match.stringLikeRegexp("Bucketvideos.*"),
                        "Arn",
                      ]),
                    }),
                    "/*",
                  ]),
                ]),
              }),
            ]),
          }),
          Match.objectLike({
            Action: "s3:DeleteObject*",
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::Join": Match.arrayWith([
                "",
                Match.arrayWith([
                  Match.objectLike({
                    "Fn::GetAtt": Match.arrayWith([
                      Match.stringLikeRegexp("Bucketvideos.*"),
                      "Arn",
                    ]),
                  }),
                  "/*",
                ]),
              ]),
            }),
          }),
          Match.objectLike({
            Action: Match.arrayWith([
              "sqs:ReceiveMessage",
              "sqs:ChangeMessageVisibility",
              "sqs:GetQueueUrl",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
            ]),
            Effect: "Allow",
            Resource: Match.objectLike({
              "Fn::GetAtt": Match.arrayWith([
                Match.stringLikeRegexp("QueueVideosQueue.*"),
                "Arn",
              ]),
            }),
          }),
        ]),
      }),
      Roles: Match.arrayWith([
        {
          Ref: Match.stringLikeRegexp(
            "MicroservicesvideosLambdaFunctionServiceRole.*"
          ),
        },
      ]),
    });
  });

  test("DeleteLesson EventBridge rule has correct properties", () => {
    backendStackTemplate.hasResourceProperties("AWS::Events::Rule", {
      Description: "When course microservice deletes a lesson",
      EventBusName: {
        Ref: Match.stringLikeRegexp("EventBusLmEventBus.*"),
      },
      EventPattern: {
        source: ["com.lm.course.deletelesson"],
        "detail-type": ["DeleteLesson"],
      },
      Name: "DeleteLessonRule",
      State: "ENABLED",
      Targets: Match.arrayWith([
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("QueueVideosQueue.*"),
              "Arn",
            ]),
          }),
          Id: "Target0",
        }),
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("QueueTranscribeQueue.*"),
              "Arn",
            ]),
          }),
          Id: "Target1",
        }),
      ]),
    });
  });

  test("EventBridge rule for delete course has correct properties", () => {
    backendStackTemplate.hasResourceProperties("AWS::Events::Rule", {
      Description: "When course microservice deletes a course",
      EventBusName: {
        Ref: Match.stringLikeRegexp("EventBusLmEventBus.*"),
      },
      EventPattern: {
        source: ["com.lm.course.deletecourse"],
        "detail-type": ["DeleteCourse"],
      },
      Name: "DeleteCourseRule",
      State: "ENABLED",
      Targets: Match.arrayWith([
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("QueueVideosQueue.*"),
              "Arn",
            ]),
          }),
          Id: "Target0",
        }),
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("QueueTranscribeQueue.*"),
              "Arn",
            ]),
          }),
          Id: "Target1",
        }),
      ]),
    });
  });

  test("EventBridge rule for video uploaded has correct properties", () => {
    backendStackTemplate.hasResourceProperties("AWS::Events::Rule", {
      Description: "When Video is uploaded to videos S3 bucket",
      EventBusName: "default",
      EventPattern: {
        source: ["aws.s3"],
        "detail-type": ["Object Created"],
        detail: {
          bucket: {
            name: [{ Ref: Match.stringLikeRegexp("Bucketvideos.*") }],
          },
        },
      },
      State: "ENABLED",
      Targets: Match.arrayWith([
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("QueueCoursesQueue.*"),
              "Arn",
            ]),
          }),
          Id: "Target0",
        }),
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("QueueTranscribeQueue.*"),
              "Arn",
            ]),
          }),
          Id: "Target1",
        }),
      ]),
    });
  });

  test("EventBridge rule for transcription completed has correct properties", () => {
    backendStackTemplate.hasResourceProperties("AWS::Events::Rule", {
      Description: "When transcription is uploaded to transcribe S3 bucket",
      EventBusName: "default",
      EventPattern: {
        source: ["aws.s3"],
        "detail-type": ["Object Created"],
        detail: {
          bucket: {
            name: [{ Ref: Match.stringLikeRegexp("Buckettranscribe.*") }],
          },
          object: {
            key: [{ suffix: ".json" }],
          },
        },
      },
      State: "ENABLED",
      Targets: Match.arrayWith([
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("QueueCoursesQueue.*"),
              "Arn",
            ]),
          }),
          Id: "Target0",
        }),
      ]),
    });
  });

  test("EventBridge rule for checking OpenAI has correct properties", () => {
    backendStackTemplate.hasResourceProperties("AWS::Events::Rule", {
      ScheduleExpression: "rate(1 day)",
      State: "ENABLED",
      Targets: Match.arrayWith([
        Match.objectLike({
          Arn: Match.objectLike({
            "Fn::GetAtt": Match.arrayWith([
              Match.stringLikeRegexp("LambdacheckOpenAiLambdaFunction.*"),
              "Arn",
            ]),
          }),
          Id: "Target0",
        }),
      ]),
    });
  });

  // test("Sns subscription properties - with matchers", () => {
  //   backendStackTemplate.hasResourceProperties(
  //     "AWS::SNS::Subscription",
  //     Match.objectEquals({
  //       Protocol: "lambda",
  //       TopicArn: {
  //         Ref: Match.stringLikeRegexp("AlarmTopic"),
  //       },
  //       Endpoint: {
  //         "Fn::GetAtt": [Match.stringLikeRegexp("webHookLambda"), "Arn"],
  //       },
  //     })
  //   );
  // });
});
