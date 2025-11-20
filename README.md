# Tetris Centroid Game

A web-based educational game that teaches centroid calculations through Tetris-style gameplay. This project has been modernized from a single HTML file into a full-stack web application with a leaderboard.

## Features

- **Educational Gameplay**: Calculate centroids of shapes to advance levels.
- **Interactive Tetris**: Play Tetris while maintaining a target centroid balance.
- **Leaderboard**: Compete for the top spot with a global leaderboard (Top 10, Top 5).
- **Weblet Integration**: Built ready for Weblet Auth and Storage services (currently mocked for local development).
- **Modern UI**: Sleek, responsive design with animations and glassmorphism effects.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)

### Quick Start (Windows)
Simply double-click the `run.bat` file in the root directory. 

This script will:
1. Install all necessary dependencies for both frontend and backend.
2. Start the Backend API server on port 3000.
3. Start the Frontend Vite server on port 5173.
4. Open the game in your default browser.

### Manual Setup

#### Backend
```bash
cd backend
npm install
node server.js
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Frontend**: Built with Vite, Vanilla JS, and CSS.
- **Backend**: Node.js with Express.
- **Services**: Modularized service layer (`lib/`) for Authentication and Storage, designed to be easily swapped with real Weblet SDKs.

## License
© 2025 Dr. Ahmed Mowafy. All rights reserved.
