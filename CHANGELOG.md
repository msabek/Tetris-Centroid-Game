# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-11-19

### Added
- **Project Structure**: Split the original single-file game into a modular architecture with separate frontend and backend.
- **Vite Integration**: Initialized a Vite project for the frontend to support modern development workflows.
- **Backend API**: Created an Express.js server (`backend/server.js`) to handle leaderboard data and score submissions.
- **Leaderboard Feature**:
    - Added a "Leaderboard" button to the game UI.
    - Implemented a modal to display Top 10, Top 5, and Personal Rank.
    - Integrated with the backend to fetch and display live scores.
- **Weblet Integration**:
    - Created `lib/weblet-auth.js` to mock authentication flows.
    - Created `lib/weblet-storage.js` to mock storage services for score persistence.
- **Run Script**: Added `run.bat` for one-click local setup and execution.

### Changed
- **Refactoring**: Extracted HTML, CSS, and JavaScript from `Tetris Centroid Game(1).txt` into dedicated files (`index.html`, `style.css`, `game.js`).
- **Game Logic**: Updated `game.js` to use ES6 classes and modules.
- **Game Over**: Modified the Game Over and Victory sequences to automatically submit scores to the backend via the Weblet Storage mock.

### Fixed
- **Dependencies**: Resolved missing backend dependencies (`express`, `cors`) during initial setup.
