import { DeleteObjectCommand, DeleteObjectsCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";


exports.handler = async function (event) {
    if (event.Records != null) {
        // SQS Invocation
        return await sqsInvocation(event);
    } else {
        // API Gateway Invocation -- return sync response
        return await apiGatewayInvocation(event);
    }
};

const sqsInvocation = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    try {
        for (const record of event.Records) {
            const eventRequest = JSON.parse(record.body);
            const eventType = eventRequest["detail-type"]

            if (eventType === "DeleteLesson") {
                await deleteLesson(eventRequest.detail)
            }

            if (eventType === "DeleteCourse") {
                await deleteCourse(eventRequest.detail)
            }
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

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to perform operation.",
                errorMsg: error.message,
                errorStack: error.stack,
            })
        };
    }
}

const apiGatewayInvocation = async (event) => {
    let body;

    try {
        switch (event.httpMethod) {
            case "GET":
                if (event.resource == "/videos/upload-url/courses/{courseId}/lessons/{lessonId}") {
                    await checkifTeacherIsOwner(event)
                    body = await getUploadURL(event);
                }
                break;
            default:
                const error = new Error(`Unsupported route: "${event.httpMethod}"`);
                error.statusCode = 404;
                throw error;
        }

        console.log(body);
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
                uploadURL: body
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

const getUploadURL = async (event) => {
    console.log(`getUploadURL function. event : "${event}"`);

    try {
        const courseId = event.pathParameters.courseId
        const lessonId = event.pathParameters.lessonId

        const command = new PutObjectCommand({ Bucket: process.env.VIDEOS_BUCKET_NAME, Key: `videos/${courseId}/${lessonId}.mp4` })
        return getSignedUrl(s3Client, command, { expiresIn: 3600 })

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const deleteLesson = async (eventDetail) => {
    console.log("deleteLesson:", eventDetail);

    const { courseId, lessonId } = eventDetail;
    const bucketName = process.env.VIDEOS_BUCKET_NAME;
    const key = `videos/${courseId}/${lessonId}.mp4`;

    try {
        await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
        console.log(`Object ${key} exists, proceeding to delete.`);

        // Proceed to delete the object
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
        console.log(`Object ${key} successfully deleted.`);
    } catch (error) {
        if (error.name === 'NotFound') {
            console.error(`Object ${key} does not exist.`);
        } else {
            console.error(`Failed to delete object ${key}:`, error);
        }
    }
}


const deleteCourse = async (eventDetail) => {
    console.log("deleteCourse:", eventDetail);

    const { courseId } = eventDetail;
    const bucketName = process.env.VIDEOS_BUCKET_NAME;
    const prefix = `videos/${courseId}/`;

    try {
        // List all objects under the specified prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: prefix,
        };

        const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log("No objects found under the specified prefix.");
            return;
        }

        // Prepare the objects to delete
        const deleteParams = {
            Bucket: bucketName,
            Delete: {
                Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
                Quiet: true, // Optional: to suppress response details
            },
        };

        // Delete the objects
        await s3Client.send(new DeleteObjectsCommand(deleteParams));

        console.log(`All objects under the prefix "${prefix}" have been deleted.`);
    } catch (error) {
        console.error("Error deleting objects:", error);
    }
}

const checkifTeacherIsOwner = async (event) => {
    try {
        const courseId = event.pathParameters.courseId
        const token = event.headers.Authorization;
        const response = await axios.get(`https://zgf87nozwi.execute-api.ap-southeast-1.amazonaws.com/prod/courses/${courseId}/students`, {
            headers: {
                'Authorization': token
            }
        })

    } catch (error) {
        console.log(error.response)
        if (error.response) {
            if (error.response.status === 403) {
                error.statusCode = 403;
                error.message = `Not authorized`;
                throw error;
            }

            if (error.response.status === 404) {
                error.statusCode = 404;
                error.message = `Not found`;
                throw error;
            }
        }

        else {
            error.statusCode = 500;
            error.message = `Internal Server Error`;
            throw error;
        }


        // if (!error.statusCode) {
        //     error.statusCode = 403; // Set default status code if not already set
        //     error.message = `Not authorized`;
        // }
        // throw error;
    }
}