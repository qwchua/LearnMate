// Create service client module using ES6 syntax.
const { SSMClient } = require("@aws-sdk/client-ssm");
// Create an Amazon DynamoDB service client object.
const ssmClient = new SSMClient();
export { ssmClient };