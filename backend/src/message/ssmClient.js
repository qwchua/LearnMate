import { SSMClient } from "@aws-sdk/client-ssm";
// Create an Amazon DynamoDB service client object.
const ssmClient = new SSMClient();
export { ssmClient };