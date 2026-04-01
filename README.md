# IGPT - Enterprise Agentic AI Platform

## Features
- Multi-provider LLM support (AWS Bedrock, OpenAI, Google, Qwen)
- Multi-file upload (20 files/conversation, PDF/DOCX extraction)
- Real-time streaming responses
- Professional template library (HR, Technical, Business)
- 6 response styles (Normal, Concise, Explanatory, Formal, Creative, Technical)

## Tech Stack
- Next.js 16 + React 19
- TypeScript
- Tailwind CSS v4
- Zustand (state management)
- AWS Bedrock, OpenAI, Google AI APIs
- unpdf, mammoth (document processing)

## Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables (see .env.example)
4. Run development server: `npm run dev`

## Authentication

# Core Amplify dependencies
npm install aws-amplify @aws-amplify/ui-react

# Additional utilities
npm install libphonenumber-js
npm install zod

# Development
npm install -D @aws-amplify/cli

## Environment Variables
See `.env.example` for required API keys

## Deployment
AWS Amplify configuration in `.amplify.yml`