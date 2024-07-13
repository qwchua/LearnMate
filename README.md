# LearnMate: AI-Enhanced Learning Management System

LearnMate is a Learning Management System (LMS) designed to enhance online video lectures with AI-powered assistance. It aims to address common challenges faced by students in online learning environments by providing real-time, context-aware support.

![Project Image](https://github.com/qwchua/checkpoint/blob/main/frontend/public/logo2.png)

![LearnMate Demo](https://github.com/qwchua/checkpoint/blob/main/assets/learnmate.gif)

## Architecture

![Architecture](https://github.com/qwchua/checkpoint/blob/main/assets/architecture.jpg)

## Key Features

- **AI Teaching Assistant**: Utilizes GPT-3.5 and GPT-4o to provide intelligent, context-aware responses to student queries.
- **Video Lecture Streaming**: Seamless playback of course video content.
- **Real-time Transcription**: Automatic generation of lecture transcripts for improved accessibility and context provision.
- **Course Management**: Easy creation and management of courses and lessons for educators.
- **User Authentication**: Secure login and registration system with role-based access control.

## Technology Stack

### Frontend

- React.js
- TanStack Query
- TailwindCSS
- shadcn UI components
- AWS Amplify
- Vite
- TypeScript

### Backend

- AWS Lambda
- Amazon DynamoDB
- Amazon S3
- AWS EventBridge
- AWS SQS
- Node.js
- JavaScript

### DevOps & Infrastructure

- AWS CDK (Cloud Development Kit)
- Docker
- Git

### Testing

- Jest (Unit and Integration Testing)
- Playwright (End-to-End Testing)

## Architecture

LearnMate employs a serverless microservices architecture, leveraging various AWS services for scalability, reliability, and cost-efficiency. Key components include:

- RESTful Microservices
- Fanout pattern for event processing
- Circuit Breaker pattern for API resilience

## Getting Started

Deploy to AWS:

```bash
  cd backend
  npm run deploy
```

## Testing

The project includes comprehensive testing:

- Unit and Integration tests using Jest
- End-to-End tests using Playwright

Run tests with:

```bash
  cd e2e-testing
  npm run test
```

## Documentation
[Docs](https://github.com/qwchua/checkpoint/blob/main/assets/learnmate-docs.pdf)

## License

[MIT](https://choosealicense.com/licenses/mit/)
