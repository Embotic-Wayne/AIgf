# AI Assistant - Backend & React Client

A full-stack AI assistant application with an Express.js backend and React frontend.

## Features

- AI-powered chat assistant using OpenAI GPT-4o-mini
- CBT/Motivational Interviewing techniques
- Express.js backend server
- React frontend client
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Embotic-Wayne/AIgf.git
cd AIgf
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Environment Setup

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the Application

#### Start the Backend Server

```bash
npm start
```

The backend server will run on `http://localhost:3080`

#### Start the Frontend Client

In a new terminal:

```bash
cd client
npm start
```

The React app will run on `http://localhost:3000`

## API Endpoints

- `POST /` - Send a message to the AI assistant
  - Body: `{ "message": "your message here" }`
  - Response: `{ "reply": "AI response" }`

## Project Structure

```
AIgf/
├── index.js              # Express server
├── package.json          # Backend dependencies
├── package-lock.json     # Backend dependency lock
├── .env                  # Environment variables (create this)
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── client/              # React frontend
    ├── src/
    │   ├── App.js       # Main React component
    │   ├── index.js     # React entry point
    │   └── ...
    ├── package.json     # Frontend dependencies
    └── package-lock.json # Frontend dependency lock
```

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Interact with the AI assistant through the React interface

## Notes

- The AI assistant is designed for supportive, non-judgmental conversations
- It uses CBT/Motivational Interviewing techniques
- For production use, ensure proper security measures and environment variable management
