// Create service client module using ES6 syntax.
import { S3Client } from "@aws-sdk/client-s3";
// Create an Amazon DynamoDB service client object.
const s3Client = new S3Client();
export { s3Client };