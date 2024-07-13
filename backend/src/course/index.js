import { BatchGetItemCommand, DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";
import { v4 as uuidv4 } from 'uuid';
import { CognitoIdentityProviderClient, ListUsersCommand, } from "@aws-sdk/client-cognito-identity-provider";
import { ebClient } from "./eventBridgeClient";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";

exports.handler = async function (event) {
    // console.log("request:", JSON.stringify(event, undefined, 2));

    if (event.Records != null) {
        // SQS Invocation
        await sqsInvocation(event);
    } else {
        // API Gateway Invocation -- return sync response
        return await apiGatewayInvocation(event);
    }
};

const sqsInvocation = async (event) => {

    for (const record of event.Records) {
        // console.log('Record: ', record);

        // expected request : { "detail-type\":\"CheckoutBasket\",\"source\":\"com.swn.basket.checkoutbasket\", "detail\":{\"userName\":\"swn\",\"totalPrice\":1820, .. }
        const eventRequest = JSON.parse(record.body);
        const bucketName = eventRequest.detail.bucket.name;
        // const key = eventRequest.detail.object.key
        // const cdn_url = process.env.CLOUDFRONT_URL
        // const fullURLWithKey = "https://" + cdn_url + "/" + key

        if (bucketName == process.env.TRANSCRIBE_BUCKET_NAME || bucketName == process.env.VIDEOS_BUCKET_NAME) {
            await updateLesson(eventRequest)
        }

        // console.log(eventRequest)

        // const filename = eventRequest.detail.object.key
        // console.log("filename: ", filename)
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            message: `Successfully finished operation: "${event.httpMethod}"`,
        })
    };

    // event.Records.forEach(async (record) => {
    //     console.log('Record: %j', record);

    //     // expected request : { "detail-type\":\"CheckoutBasket\",\"source\":\"com.swn.basket.checkoutbasket\", "detail\":{\"userName\":\"swn\",\"totalPrice\":1820, .. }
    //     const uploadEventRequest = JSON.parse(record.body);
    //     const filename = uploadEventRequest.detail.object.key
    //     console.log("filename: ", filename)

    //     // create order item into db
    //     // await createOrder(checkoutEventRequest.detail);
    //     // detail object should be checkoutbasket json object
    // });
}

const apiGatewayInvocation = async (event) => {
    let body;

    try {
        switch (event.httpMethod) {
            case "GET":

                if (event.resource == "/courses/enrolled") {
                    // Student getting their enrolled courses
                    body = await getCoursesEnrolled(event); // GET /courses/enrolled
                    break;
                }

                if (event.resource == "/courses/{id}/lessons") {
                    // Teacher or Student getting the course's lessons
                    await checkCourseExists(event)

                    if (isTeacher(event)) {
                        await checkifTeacherIsOwner(event)
                    } else {
                        await checkisEnrolledInCourse(event)
                    }

                    body = await getLessonsByTeacher(event.pathParameters.id); // GET /courses/{id}/lessons
                    break;
                }

                if (event.resource == "/courses/{id}/students") {
                    // Teacher getting the course's students
                    await checkCourseExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await getStudentsFromCourse(event.pathParameters.id); // GET //courses/{id}/students
                    break;
                }

                if (event.resource == "/courses/{id}/lessons/{lessonId}") {
                    //  Teacher or student getting the lesson's details
                    await checkLessonExists(event)

                    if (isTeacher(event)) {
                        await checkifTeacherIsOwner(event)
                    } else {
                        await checkisEnrolledInCourse(event)
                    }
                    body = await getLesson(event); // GET //courses/{id}/students
                    break;
                }

                if (event.resource == "/courses") {
                    // Teacher getting the courses they teached
                    body = await getTeacherCourses(event); // GET /courses
                    break;
                }
                if (event.resource == "/courses/{id}") {
                    // Teacher or student getting the course details
                    await checkCourseExists(event)

                    if (isTeacher(event)) {
                        await checkifTeacherIsOwner(event)
                    } else {
                        await checkisEnrolledInCourse(event)
                    }

                    body = await getCourse(event.pathParameters.id); // GET /courses/{id}
                }
                break;
            case "POST":
                if (event.resource == "/courses") {
                    if (!isTeacher(event)) {
                        const error = new Error('You are not authorized');
                        error.statusCode = 403;
                        throw error;
                    }

                    body = await createCourse(event); // POST /courses
                    break;
                }

                if (event.resource == "/courses/{id}/lessons") {
                    await checkCourseExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await createLesson(event); // POST //courses/{id}/lessons
                    break;
                }

                if (event.resource == "/courses/{id}/students") {
                    await checkCourseExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await enrollStudent(event); // POST //courses/{id}/lessons
                    break;
                }
                break;

            case "PATCH":
                if (event.resource == "/courses/{id}/lessons/{lessonId}") {
                    await checkLessonExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await apiInvokeUpdateLesson(event); // GET //courses/{id}/students
                    break;
                }
                if (event.pathParameters != null) {
                    await checkCourseExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await updateCourse(event); // PATCH courses/{id}
                }
                break;

            case "DELETE":
                if (event.resource == "/courses/{id}/lessons/{lessonId}") {
                    await checkLessonExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await deleteLesson(event);
                    break;
                }

                if (event.resource == "/courses/{id}/students/{studentId}") {
                    await checkCourseExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await deleteStudent(event);
                    break;
                }

                if (event.resource == "/courses/{id}") {
                    await checkCourseExists(event)
                    await checkifTeacherIsOwner(event)
                    body = await deleteCourse(event);
                    break;
                }
                break;
            default:
                const error = new Error(`Unsupported route: "${event.httpMethod}"`);
                error.statusCode = 404;
                throw error;
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                message: `Successfully finished operation: "${event.httpMethod}"`,
                ...body
            })
        };

    } catch (error) {

        console.error('Error:', error.message);
        console.error('Error stack', error.stack)

        return {
            statusCode: error.statusCode || 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({
                message: error.message || "Failed to perform operation.",
            }),
        };
    }
}


// GET /order	

const getCourse = async (courseId) => {
    console.log("getCourse");

    const courseIdwithPrefix = "c#" + courseId

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: courseIdwithPrefix },
                SK: { S: courseIdwithPrefix }
            }
        };

        const { Item } = await ddbClient.send(new GetItemCommand(params));


        const item = unmarshall(Item)

        const newItem = {
            courseId: item.PK.replace('c#', ''),
            title: item.title,
            description: item.description,
        };


        const output = {
            course: newItem
        }
        return (Item) ? output : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getAllProducts = async () => {
    console.log("getAllProducts");
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME
        };

        const { Items } = await ddbClient.send(new ScanCommand(params));

        console.log(Items);
        return (Items) ? Items.map((item) => unmarshall(item)) : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const createCourse = async (event) => {
    console.log(`createCourse function. event : "${event}"`);
    try {
        const courseRequest = JSON.parse(event.body);

        const courseId = uuidv4();
        const courseIdWithPrefix = "c#" + courseId;

        const cognitoIdentityId = event.requestContext?.authorizer?.claims?.sub;
        const teacherIdWithPrefix = "t#" + cognitoIdentityId;

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: { S: courseIdWithPrefix },
                SK: { S: courseIdWithPrefix },
                ownerUserId: { S: cognitoIdentityId },
                title: { S: courseRequest.title }
            },
        };

        const createResult = await ddbClient.send(new PutItemCommand(params));

        const params2 = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: { S: teacherIdWithPrefix },
                SK: { S: courseIdWithPrefix },
            },
        };

        const createResult2 = await ddbClient.send(new PutItemCommand(params2));

        const studentIdWithPrefix = "s#" + cognitoIdentityId;

        const params3 = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: { S: studentIdWithPrefix },
                SK: { S: courseIdWithPrefix },
            },
        };

        const createResult3 = await ddbClient.send(new PutItemCommand(params3));

        createResult.id = courseId

        console.log(createResult);
        return createResult;

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const deleteProduct = async (productId) => {
    console.log(`deleteProduct function. productId : "${productId}"`);

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: productId }),
        };

        const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

        console.log(deleteResult);
        return deleteResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const updateCourse = async (event) => {
    console.log(`updateProduct function. event : "${event}"`);
    try {
        const courseIdWithPrefix = "c#" + event.pathParameters.id
        const requestBody = JSON.parse(event.body);
        const objKeys = Object.keys(requestBody);
        console.log(`updateCourse function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: courseIdWithPrefix },
                SK: { S: courseIdWithPrefix }
            },
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
        };

        const updateResult = await ddbClient.send(new UpdateItemCommand(params));

        console.log(updateResult);
        return updateResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getProductsByCategory = async (event) => {
    console.log("getProductsByCategory");
    try {
        // GET product/1234?category=Phone
        const productId = event.pathParameters.id;
        const category = event.queryStringParameters.category;

        const params = {
            KeyConditionExpression: "id = :productId",
            FilterExpression: "contains (category, :category)",
            ExpressionAttributeValues: {
                ":productId": { S: productId },
                ":category": { S: category }
            },
            TableName: process.env.DYNAMODB_TABLE_NAME
        };

        const { Items } = await ddbClient.send(new QueryCommand(params));

        console.log(Items);
        return Items.map((item) => unmarshall(item));
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const createLesson = async (event) => {
    console.log(`createLesson function. event : "${event}"`);
    try {
        const lessonRequest = JSON.parse(event.body);
        const courseIdWithPrefix = "c#" + event.pathParameters.id

        const lessonId = uuidv4();
        const lessonIdWithPrefix = "l#" + lessonId;
        const date = new Date().toISOString()

        const cognitoIdentityId = event.requestContext?.authorizer?.claims?.sub;

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: { S: courseIdWithPrefix },
                SK: { S: lessonIdWithPrefix },
                ownerUserId: { S: cognitoIdentityId },
                title: { S: lessonRequest.title },
                createdAt: { S: date },
            },
        };

        const createResult = await ddbClient.send(new PutItemCommand(params));
        // createResult.id = courseId

        console.log(createResult);
        return createResult;

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getLessonsByTeacher = async (courseId) => {
    console.log("getLessonsByTeacher");
    const pk = "c#" + courseId
    const skPrefix = "l#"

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            KeyConditionExpression: "PK = :pk_value and begins_with(SK, :sk_prefix)",
            ExpressionAttributeValues: {
                ":pk_value": { S: pk },
                ":sk_prefix": { S: skPrefix },
            },
        };

        const { Items } = await ddbClient.send(new QueryCommand(params));

        const lessons = Items.map(item => unmarshall(item));

        const final_array = lessons.map(item => ({
            courseId: item.PK.replace('c#', ''),
            lessonId: item.SK.replace('l#', ''),
            title: item.title,
            createdAt: item.createdAt
        }));

        return (Items) ? { lessons: final_array } : {}
        // return (response.Items) ? { students: final_array } : {};

        // return (response.Items) ? response : {};

        // return (Items) ? unmarshall(Items) : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const enrollStudent = async (event) => {
    console.log(`enrollStudent function. event : "${event}"`);
    try {
        const request = JSON.parse(event.body);
        const courseIdWithPrefix = "c#" + event.pathParameters.id

        const teacherId = event.requestContext?.authorizer?.claims?.sub;
        const date = new Date().toISOString()

        const email = request.email

        let url = event.requestContext.authorizer.claims.iss
        const parts = url.split('/');
        const userPoolId = parts.pop();

        const getUserParams = {
            UserPoolId: userPoolId,
            Filter: `email = "${email}"`,
        };

        let data;

        try {
            const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-southeast-1" });
            const command = new ListUsersCommand(getUserParams);
            data = await cognitoClient.send(command);

            console.log(data)

            if (data.Users.length === 0) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'User not found' }),
                }
            }
        } catch (e) {
            console.error(e);
            throw e;
        }

        const user = data.Users[0];
        console.log(user)
        const studentId = user.Username;
        const studentIdWithPrefix = "s#" + studentId;

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: { S: studentIdWithPrefix },
                SK: { S: courseIdWithPrefix },
                createdAt: { S: date },
            },
        };

        const createResult = await ddbClient.send(new PutItemCommand(params));

        const params2 = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: { S: courseIdWithPrefix },
                SK: { S: studentIdWithPrefix },
                email: { S: email },
                createdAt: { S: date },
            },
        };

        const createResult2 = await ddbClient.send(new PutItemCommand(params2));

        // createResult.id = courseId

        console.log(createResult);
        console.log(createResult2);
        return createResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getStudentsFromCourse = async (courseId) => {
    console.log("getStudentsFromCourse");
    const pk = "c#" + courseId
    const skPrefix = "s#"

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            KeyConditionExpression: "PK = :pk_value and begins_with(SK, :sk_prefix)",
            ExpressionAttributeValues: {
                ":pk_value": { S: pk },
                ":sk_prefix": { S: skPrefix },
            },
        };

        const response = await ddbClient.send(new QueryCommand(params));

        const final_array = response.Items.map(item => ({
            courseId: item.PK.S.replace('c#', ''),
            studentId: item.SK.S.replace('s#', ''),
            email: item.email.S
        }));

        return (response.Items) ? { students: final_array } : {};

        // return (Items) ? unmarshall(Items) : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const updateLesson = async (eventRequest) => {
    console.log(`updateLesson function. event : "${eventRequest}"`);
    try {
        const bucketName = eventRequest.detail.bucket.name;
        const key = eventRequest.detail.object.key
        const cdn_url = process.env.CLOUDFRONT_URL
        const fullURLWithKey = "https://" + cdn_url + "/" + key

        console.log("KEYY: ", key)
        const parts = key.split('/');

        // Extract the courseId and lessonId
        const courseId = parts[1];
        const lessonId = parts[2].split('.')[0]; // Removing the .json extension

        const courseIdWithPrefix = "c#" + courseId
        const lessonIdWithPrefix = "l#" + lessonId

        let requestBody;

        if (key.startsWith('transcriptions')) {
            requestBody = {
                transcriptionURL: fullURLWithKey
            }
        }

        if (key.startsWith('videos')) {
            requestBody = {
                videoURL: fullURLWithKey
            }
        }

        const objKeys = Object.keys(requestBody);
        console.log(`updateLesson function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: courseIdWithPrefix },
                SK: { S: lessonIdWithPrefix }
            },
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
        };

        const updateResult = await ddbClient.send(new UpdateItemCommand(params));

        console.log(updateResult);
        return updateResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}


const getLesson = async (event) => {
    console.log("getLesson");

    // GET product/1234?category=Phone
    const courseId = event.pathParameters.id;
    const lessonId = event.pathParameters.lessonId;

    const courseIdwithPrefix = "c#" + courseId
    const lessonIdwithPrefix = "l#" + lessonId

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: courseIdwithPrefix },
                SK: { S: lessonIdwithPrefix }
            }
        };

        const { Item } = await ddbClient.send(new GetItemCommand(params));

        const item = unmarshall(Item)

        const newItem = {
            videoURL: item.videoURL,
            createdAt: item.createdAt,
            lessonId: item.SK.replace('l#', ''),
            courseId: item.PK.replace('c#', ''),
            title: item.title,
            transcriptionURL: item.transcriptionURL,
            description: item.description,
        };


        const output = {
            lesson: newItem
        }
        return (Item) ? output : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}


const getTeacherCourses = async (event) => {
    console.log("getTeacherCourses");

    const cognitoIdentityId = event.requestContext?.authorizer?.claims?.sub;
    const teacherIdWithPrefix = "t#" + cognitoIdentityId;
    const skPrefix = "c#"

    console.log(teacherIdWithPrefix, skPrefix)

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            KeyConditionExpression: "PK = :pk_value and begins_with(SK, :sk_prefix)",
            ExpressionAttributeValues: {
                ":pk_value": { S: teacherIdWithPrefix },
                ":sk_prefix": { S: skPrefix },
            },
        };
        //const { Item } = await ddbClient.send(new QueryCommand(params));

        const { Items } = await ddbClient.send(new QueryCommand(params));
        const courses = Items.map(item => unmarshall(item));
        const keys = courses.map(item => ({ PK: { "S": item.SK }, SK: { "S": item.SK } }));
        console.log(keys)

        const tableName = process.env.DYNAMODB_TABLE_NAME

        const params2 = {
            RequestItems: {
                [tableName]: {
                    Keys: keys
                }
            }
        };

        const { Responses } = await ddbClient.send(new BatchGetItemCommand(params2))

        const coursesList = Responses.course.map(item => unmarshall(item))

        const final_array = coursesList.map(item => ({
            courseId: item.PK.replace('c#', ''),
            title: item.title
        }));

        const output = {
            courses: final_array
        }

        // console.log(output)
        return (courses) ? output : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getCoursesEnrolled = async (event) => {
    console.log("getCoursesEnrolled");

    const cognitoIdentityId = event.requestContext?.authorizer?.claims?.sub;
    const studentIdWithPrefix = "s#" + cognitoIdentityId;
    const skPrefix = "c#"

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            KeyConditionExpression: "PK = :pk_value and begins_with(SK, :sk_prefix)",
            ExpressionAttributeValues: {
                ":pk_value": { S: studentIdWithPrefix },
                ":sk_prefix": { S: skPrefix },
            },
        };
        //const { Item } = await ddbClient.send(new QueryCommand(params));

        const { Items } = await ddbClient.send(new QueryCommand(params));
        const courses = Items.map(item => unmarshall(item));
        const keys = courses.map(item => ({ PK: { "S": item.SK }, SK: { "S": item.SK } }));

        const tableName = process.env.DYNAMODB_TABLE_NAME

        const params2 = {
            RequestItems: {
                [tableName]: {
                    Keys: keys
                }
            }
        };

        const { Responses } = await ddbClient.send(new BatchGetItemCommand(params2))

        const coursesList = Responses.course.map(item => unmarshall(item))

        const final_array = coursesList.map(item => ({
            courseId: item.PK.replace('c#', ''),
            title: item.title
        }));

        const output = {
            courses: final_array
        }

        // console.log(output)
        return (courses) ? output : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const apiInvokeUpdateLesson = async (event) => {
    console.log(`apiInvokeUpdateLesson function. event : "${event}"`);
    try {
        const courseIdWithPrefix = "c#" + event.pathParameters.id
        const lessonIdWithPrefix = "l#" + event.pathParameters.lessonId

        const requestBody = JSON.parse(event.body);
        const objKeys = Object.keys(requestBody);

        console.log(`apiInvokeUpdateLesson function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: courseIdWithPrefix },
                SK: { S: lessonIdWithPrefix }
            },
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
        };

        const updateResult = await ddbClient.send(new UpdateItemCommand(params));

        console.log(updateResult);
        return updateResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const deleteLesson = async (event) => {
    console.log(`deleteLesson function. event : "${event}"`);
    try {
        const courseIdWithPrefix = "c#" + event.pathParameters.id
        const lessonIdWithPrefix = "l#" + event.pathParameters.lessonId

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: courseIdWithPrefix },
                SK: { S: lessonIdWithPrefix }
            }
        };

        const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

        const checkoutPayload = {
            courseId: event.pathParameters.id,
            lessonId: event.pathParameters.lessonId
        }

        const params2 = {
            Entries: [
                {
                    Source: process.env.EVENT_SOURCE,
                    Detail: JSON.stringify(checkoutPayload),
                    DetailType: process.env.EVENT_DETAILTYPE,
                    Resources: [],
                    EventBusName: process.env.EVENT_BUSNAME
                },
            ],
        };

        const data = await ebClient.send(new PutEventsCommand(params2));

        console.log("Success, event sent; requestID:", data);

        console.log(deleteResult)
        return deleteResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const deleteCourse = async (event) => {
    console.log(`deleteCourse function`);
    console.log("request:", JSON.stringify(event, undefined, 2));
    try {
        //delete enrollment from students   PK: s# , SK: c# , PK: c# , SK: s# 
        const courseIdWithPrefix = "c#" + event.pathParameters.id

        const items1 = await qGetStudentsFromCourseId(courseIdWithPrefix);

        if (items1.length > 0) {
            await dDeleteStudents(items1);
        } else {
            console.log("No items found to delete");
        }

        //delete all lessons from course
        const items2 = await qGetLessonsFromCourseId(courseIdWithPrefix);

        if (items2.length > 0) {
            await dDeleteLessons(items2);
        } else {
            console.log("No items found to delete");
        }

        //delete course managed by teacher  PK: t# , SK: c#
        const teacherIdentityId = event.requestContext?.authorizer?.claims?.sub;

        await dDeleteTeacherFromCourse(courseIdWithPrefix, teacherIdentityId);

        //delete course details             PK: c# , SK: c#
        await dDeleteCourse(courseIdWithPrefix);


        const checkoutPayload = {
            courseId: event.pathParameters.id,
        }

        const params = {
            Entries: [
                {
                    Source: "com.lm.course.deletecourse",
                    Detail: JSON.stringify(checkoutPayload),
                    DetailType: "DeleteCourse",
                    Resources: [],
                    EventBusName: process.env.EVENT_BUSNAME
                },
            ],
        };

        const data = await ebClient.send(new PutEventsCommand(params));

        console.log("Success, event sent; requestID:", data);
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const deleteStudent = async (event) => {
    console.log(`deleteLesson function. event : "${event}"`);
    try {
        const courseIdWithPrefix = "c#" + event.pathParameters.id
        const studentIdWithPrefix = "s#" + event.pathParameters.studentId

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: courseIdWithPrefix },
                SK: { S: studentIdWithPrefix }
            }
        };

        const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

        const params2 = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: { S: studentIdWithPrefix },
                SK: { S: courseIdWithPrefix }
            }
        };

        const deleteResult2 = await ddbClient.send(new DeleteItemCommand(params2));

        return deleteResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}


const qGetStudentsFromCourseId = async (courseIdWithPrefix) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: "#pk = :pkVal AND begins_with(#sk, :skVal)",
        ExpressionAttributeNames: {
            "#pk": "PK",
            "#sk": "SK"
        },
        ExpressionAttributeValues: {
            ":pkVal": { S: courseIdWithPrefix },
            ":skVal": { S: "s#" }
        }
    };

    try {
        const data = await ddbClient.send(new QueryCommand(params));
        return data.Items;
    } catch (err) {
        console.error("Error querying items", err);
        return [];
    }
};

const dDeleteStudents = async (items) => {
    for (const item of items) {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: item.PK,
                SK: item.SK
            }
        };

        try {
            await ddbClient.send(new DeleteItemCommand(params));
            console.log(`Deleted item with PK: ${item.PK.S}, SK: ${item.SK.S}`);
        } catch (err) {
            console.error("Error deleting item", err);
        }

        const params2 = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: item.SK,
                SK: item.PK
            }
        };

        try {
            await ddbClient.send(new DeleteItemCommand(params2));
            console.log(`Deleted item with PK: ${item.SK.S}, SK: ${item.PK.S}`);
        } catch (err) {
            console.error("Error deleting item", err);
        }
    }
    console.log("All items processed");
};

const qGetLessonsFromCourseId = async (courseIdWithPrefix) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: "#pk = :pkVal AND begins_with(#sk, :skVal)",
        ExpressionAttributeNames: {
            "#pk": "PK",
            "#sk": "SK"
        },
        ExpressionAttributeValues: {
            ":pkVal": { S: courseIdWithPrefix },
            ":skVal": { S: "l#" }
        }
    };

    try {
        const data = await ddbClient.send(new QueryCommand(params));
        return data.Items;
    } catch (err) {
        console.error("Error querying items", err);
        return [];
    }
};


const dDeleteLessons = async (items) => {
    for (const item of items) {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                PK: item.PK,
                SK: item.SK
            }
        };

        try {
            await ddbClient.send(new DeleteItemCommand(params));
            console.log(`Deleted item with PK: ${item.PK.S}, SK: ${item.SK.S}`);
        } catch (err) {
            console.error("Error deleting item", err);
        }

    }
    console.log("All items processed");
};

const dDeleteCourse = async (courseId) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: { S: courseId },
            SK: { S: courseId }
        }
    };

    try {
        await ddbClient.send(new DeleteItemCommand(params));
        console.log(`Deleted item with PK: ${courseId}, SK: ${courseId}`);
    } catch (err) {
        console.error("Error deleting item", err);
    }
};

const dDeleteTeacherFromCourse = async (courseId, teacherId) => {
    const teacherIdWithPrefix = "t#" + teacherId;

    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: { S: teacherIdWithPrefix },
            SK: { S: courseId }
        }
    };

    try {
        await ddbClient.send(new DeleteItemCommand(params));
        console.log(`Deleted item with PK: ${teacherId}, SK: ${courseId}`);
    } catch (err) {
        console.error("Error deleting item", err);
    }

    const studentIdWithPrefix = "s#" + teacherId

    const params2 = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: { S: studentIdWithPrefix },
            SK: { S: courseId }
        }
    };

    try {
        await ddbClient.send(new DeleteItemCommand(params2));
        console.log(`Deleted item with PK: ${studentIdWithPrefix}, SK: ${courseId}`);
    } catch (err) {
        console.error("Error deleting item", err);
    }
};


const checkisEnrolledInCourse = async (event) => {
    console.log(`checkisEnrolledInCourse function`);

    const courseId = event.pathParameters.id
    const courseIdWithPrefix = "c#" + courseId;

    const cognitoIdentityId = event.requestContext?.authorizer?.claims?.sub;
    const studentIdWithPrefix = "s#" + cognitoIdentityId;

    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: { S: studentIdWithPrefix },
            SK: { S: courseIdWithPrefix }
        }
    };

    try {
        const data = await ddbClient.send(new GetItemCommand(params));

        if (!data.Item) {
            const error = new Error('You are not authorized');
            error.statusCode = 403;
            throw error;
        }

        return data.Item


    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500; // Set default status code if not already set
            error.message = `Error querying database: ${error.message}`;
        }
        throw error;
    }
};

const checkCourseExists = async (event) => {
    console.log(`checkCourseExists function`);

    const courseId = event.pathParameters.id
    const courseIdWithPrefix = "c#" + courseId;

    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: { S: courseIdWithPrefix },
            SK: { S: courseIdWithPrefix }
        }
    };

    try {
        const data = await ddbClient.send(new GetItemCommand(params));

        if (!data.Item) {
            const error = new Error('Course does not exists');
            error.statusCode = 404;
            throw error;
        }

        return data.Item


    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500; // Set default status code if not already set
            error.message = `Error querying database: ${error.message}`;
        }
        throw error;
    }
};

const checkifTeacherIsOwner = async (event) => {
    console.log(`checkifTeacherIsOwner function`);

    const courseId = event.pathParameters.id
    const courseIdWithPrefix = "c#" + courseId;

    const cognitoIdentityId = event.requestContext?.authorizer?.claims?.sub;
    const teacherIdWithPrefix = "t#" + cognitoIdentityId;

    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: { S: teacherIdWithPrefix },
            SK: { S: courseIdWithPrefix }
        }
    };

    try {
        const data = await ddbClient.send(new GetItemCommand(params));

        if (!data.Item) {
            const error = new Error('You are not authorized');
            error.statusCode = 403;
            throw error;
        }

        return data.Item


    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500; // Set default status code if not already set
            error.message = `Error querying database: ${error.message}`;
        }
        throw error;
    }
};

const checkLessonExists = async (event) => {
    console.log(`checkLessonExists function`);

    const courseId = event.pathParameters.id
    const courseIdWithPrefix = "c#" + courseId;

    const lessonId = event.pathParameters.lessonId
    const lessonIdWithPrefix = "l#" + lessonId;

    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: { S: courseIdWithPrefix },
            SK: { S: lessonIdWithPrefix }
        }
    };

    try {
        const data = await ddbClient.send(new GetItemCommand(params));

        if (!data.Item) {
            const error = new Error('Lesson does not exists');
            error.statusCode = 404;
            throw error;
        }

        return data.Item


    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500; // Set default status code if not already set
            error.message = `Error querying database: ${error.message}`;
        }
        throw error;
    }
};

const isTeacher = (event) => {
    const groups = event.requestContext?.authorizer?.claims['cognito:groups'];
    if (groups) {
        return true
    }
    return false
}


// const items = await queryItems();
//   if (items.length > 0) {
//     await deleteItems(items);
//   } else {
//     console.log("No items found to delete");
//   }