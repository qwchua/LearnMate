import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaRestApi,
  MethodOptions,
} from "aws-cdk-lib/aws-apigateway";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface LmApiGatewayProps {
  messageMicroservices: IFunction;
  courseMicroservices: IFunction;
  videosMicroservices: IFunction;
  userPool: IUserPool;
}

export class LmApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: LmApiGatewayProps) {
    super(scope, id);

    const messageApi = this.createMessageApi(
      props.messageMicroservices,
      props.userPool
    );
    const courseApi = this.createCourseApi(
      props.courseMicroservices,
      props.userPool
    );

    const videosApi = this.createVideosApi(
      props.videosMicroservices,
      props.userPool
    );
  }

  private createMessageApi(
    productMicroservice: IFunction,
    userPool: IUserPool
  ) {
    // Product microservices api gateway
    // root name = product

    // GET /product
    // POST /product

    // Single product with id parameter
    // GET /product/{id}
    // PUT /product/{id}
    // DELETE /product/{id}

    const apigw = new LambdaRestApi(this, "messageApi", {
      restApiName: "Message Service",
      handler: productMicroservice,
      proxy: false,
    });

    const message = apigw.root.addResource("message");

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "messageApiAuthorizer",
      {
        cognitoUserPools: [userPool],
        identitySource: "method.request.header.Authorization",
      }
    );

    authorizer._attachToApi(apigw);

    const optionsWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.authorizerId,
      },
    };

    message.addMethod("POST", undefined, optionsWithAuth);

    message.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    return apigw;
  }

  private createCourseApi(courseMicroservice: IFunction, userPool: IUserPool) {
    // Product microservices api gateway
    // root name = product

    // GET /product
    // POST /product

    // Single product with id parameter
    // GET /product/{id}
    // PUT /product/{id}
    // DELETE /product/{id}

    const apigw = new LambdaRestApi(this, "courseApi", {
      restApiName: "Course Service",
      handler: courseMicroservice,
      proxy: false,
    });

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "courseApiAuthorizer",
      {
        cognitoUserPools: [userPool],
        identitySource: "method.request.header.Authorization",
      }
    );

    authorizer._attachToApi(apigw);

    const optionsWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.authorizerId,
      },
    };

    const courses = apigw.root.addResource("courses");
    courses.addMethod("GET", undefined, optionsWithAuth); // GET /courses
    courses.addMethod("POST", undefined, optionsWithAuth); // POST /courses

    const enrolled = courses.addResource("enrolled"); // courses/{id}
    enrolled.addMethod("GET", undefined, optionsWithAuth);

    const singleCourse = courses.addResource("{id}"); // courses/{id}
    singleCourse.addMethod("GET", undefined, optionsWithAuth); // GET /courses/{id}
    singleCourse.addMethod("PATCH", undefined, optionsWithAuth); // PATCH /courses/{id}
    singleCourse.addMethod("DELETE", undefined, optionsWithAuth); // DELETE /courses/{id}
    // singleCourse.addMethod("PUT", undefined, optionsWithAuth); // PUT /courses/{id}
    // singleCourse.addMethod("DELETE", undefined, optionsWithAuth); // DELETE /courses/{id}

    const students = singleCourse.addResource("students");
    students.addMethod("GET", undefined, optionsWithAuth); // GET /courses/{id}/students
    students.addMethod("POST", undefined, optionsWithAuth); // POST /courses/{id}/students

    const singlestudent = students.addResource("{studentId}"); // courses/{id}/lessons/{id}
    singlestudent.addMethod("DELETE", undefined, optionsWithAuth);

    const lessons = singleCourse.addResource("lessons");
    lessons.addMethod("GET", undefined, optionsWithAuth); // GET /courses/{id}/lessons
    lessons.addMethod("POST", undefined, optionsWithAuth); // POST /courses/{id}/lessons

    const singleLesson = lessons.addResource("{lessonId}"); // courses/{id}/lessons/{id}
    singleLesson.addMethod("GET", undefined, optionsWithAuth); // GET /courses/{id}/lessons/{id}
    singleLesson.addMethod("POST", undefined, optionsWithAuth); // GET /courses/{id}/lessons/{id}
    singleLesson.addMethod("PATCH", undefined, optionsWithAuth); //PATCH /courses/{id}/lessons/{id}
    singleLesson.addMethod("DELETE", undefined, optionsWithAuth);

    singlestudent.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    singleLesson.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    enrolled.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });
  }

  private createVideosApi(videosMicroservice: IFunction, userPool: IUserPool) {
    const apigw = new LambdaRestApi(this, "videosApi", {
      restApiName: "Videos Service",
      handler: videosMicroservice,
      proxy: false,
    });

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "videosApiAuthorizer",
      {
        cognitoUserPools: [userPool],
        identitySource: "method.request.header.Authorization",
      }
    );

    authorizer._attachToApi(apigw);

    const optionsWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.authorizerId,
      },
    };

    const videos = apigw.root.addResource("videos");
    const upload = videos.addResource("upload-url");
    const courses = upload.addResource("courses");
    const singleCourse = courses.addResource("{courseId}");
    const lessons = singleCourse.addResource("lessons");
    const singleLesson = lessons.addResource("{lessonId}");

    singleLesson.addMethod("GET", undefined, optionsWithAuth); // GET /courses/{id}/lessons/{id}

    videos.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    upload.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    courses.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    lessons.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    singleCourse.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });

    singleLesson.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowHeaders: Cors.DEFAULT_HEADERS,
    });
  }
}
