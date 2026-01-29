# Image Restoration Application

A full-stack application for AI-powered image restoration and analysis using Google's Gemini API.

## Overview

This project provides tools to restore, analyze, and compare images using advanced AI capabilities. The application features a modern React frontend and a Node.js backend.

## Project Structure

```
restore/
├── backend/          # Node.js server and API
├── frontend/         # React TypeScript application
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Gemini API key

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```bash
   touch .env
   ```

4. Add your Gemini API key to `.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

5. Start the server:
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:3001` (or your configured port)

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000` (or the URL shown in terminal)

## Usage

1. Ensure both backend and frontend servers are running
2. Open the frontend application in your browser
3. Upload images for restoration and analysis
4. View restoration results and comparisons

## Features

- Image restoration using AI
- Image analysis and validation
- Before/after comparison with slider
- Restoration options customization

## Environment Variables

### Backend (.env)

- `GEMINI_API_KEY` - Your Google Gemini API key

## Troubleshooting

- **Backend won't start**: Verify Node.js is installed and `.env` file contains a valid API key
- **Frontend connection issues**: Check that backend is running on the correct port
- **API errors**: Ensure your Gemini API key is valid and has sufficient quota
