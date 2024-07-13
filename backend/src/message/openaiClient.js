const { OpenAI } = require('openai');

// Your OpenAI API key
const apiKey = 'XXX';

// Initialize the OpenAI client
const openaiClient = new OpenAI({
    apiKey: apiKey,
});

export { openaiClient };