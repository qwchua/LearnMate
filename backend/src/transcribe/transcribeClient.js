import { TranscribeClient } from "@aws-sdk/client-transcribe";

const REGION = "ap-southeast-1"; //e.g. "us-east-1"

const transcribeClient = new TranscribeClient({ region: REGION });

export { transcribeClient };
// snippet-end:[transcribe.JavaScript.createclientv3]