import { StartTranscriptionJobCommand, ListTranscriptionJobsCommand } from "@aws-sdk/client-transcribe";
import { DeleteObjectCommand, DeleteObjectsCommand, HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { transcribeClient } from "./transcribeClient";
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from "./s3Client";

exports.handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    if (event.Records != null) {
        // SQS Invocation
        await sqsInvocation(event);
    } else {
        // API Gateway Invocation -- return sync response
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to perform operation.",
                errorMsg: e.message,
                errorStack: e.stack,
            })
        };
    }
};

const sqsInvocation = async (event) => {
    console.log(`sqsInvocation function. event : "${event}"`);

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

            if (eventType === "Object Created") {
                await createTranscribe(eventRequest.detail);
            }
        }
        return {
            statusCode: 200,
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

    // const uploadEventRequest = JSON.parse(event.Records[0].body);

    // console.log(uploadEventRequest);

    // await createTranscribe(uploadEventRequest.detail);

}

const createTranscribe = async (videoUploadEvent) => {
    try {
        const key = videoUploadEvent.object.key
        const bucketname = videoUploadEvent.bucket.name
        const jobId = uuidv4();

        const parts = key.split('/');
        const courseId = parts[1];
        const lessonIdWithExtension = parts[2];
        const lessonId = lessonIdWithExtension.split('.')[0];
        const result = `${courseId}/${lessonId}`;

        const params = {
            TranscriptionJobName: jobId,
            LanguageCode: "en-US", // For example, 'en-US'
            Media: {
                MediaFileUri: `s3://${bucketname}/${key}`,
                // example, "s3://DOC-EXAMPLE-BUCKET/my-media-file.flac"
                // For example, "https://transcribe-demo.s3-REGION.amazonaws.com/hello_world.wav"
            },
            OutputBucketName: process.env.TRANSCRIBE_BUCKET_NAME,
            OutputKey: `transcriptions/${result}.json`,
        };

        try {
            const data = await transcribeClient.send(
                new StartTranscriptionJobCommand(params)
            );
            console.log("Success - put", data);
            return data; // For unit tests.
        } catch (err) {
            console.log("Error", err);
        }

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const deleteLesson = async (eventDetail) => {
    console.log("deleteLesson:", eventDetail);

    const { courseId, lessonId } = eventDetail;
    const bucketName = process.env.TRANSCRIBE_BUCKET_NAME;
    const key = `transcriptions/${courseId}/${lessonId}.json`;

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
    const bucketName = process.env.TRANSCRIBE_BUCKET_NAME;
    const prefix = `transcriptions/${courseId}/`;

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
