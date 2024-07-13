const AWS = require('aws-sdk');
const axios = require('axios');
const { PutParameterCommand, SSMClient } = require("@aws-sdk/client-ssm");

exports.handler = async (event) => {
    const ssmClient = new SSMClient();
    try {
        const response = await axios.get('https://status.openai.com/api/v2/summary.json');
        const components = response.data.components;

        const apiComponent = components.find(component => component.name === "API");
        let status;

        if (apiComponent) {
            status = apiComponent.status
            console.log(`The status of the API is: ${apiComponent.status}`);
        } else {
            throw new Error('Status not found in API component');
        }

        const parameterName = '/openai/api/status';

        const input = { // PutParameterRequest
            Name: parameterName,
            Value: status,
            Type: "String",
            Overwrite: true,
        };
        const command = new PutParameterCommand(input);
        const ppmResponse = await ssmClient.send(command);
        console.log(ppmResponse)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Status updated successfully', status }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to check status or update parameter store', error: error.message }),
        };
    }
}
