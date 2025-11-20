# Project Structure

This document outlines the file structure of the Tetris Centroid Game project.

## Root Directory
- `run.bat`: Windows batch script to install dependencies and run the project locally.
- `Tetris Centroid Game(1).txt`: The original single-file source code (reference).
- `README.md`: Main project documentation and usage guide.
- `CHANGELOG.md`: History of changes and updates.
- `STRUCTURE.md`: This file.

## /frontend
The client-side application built with Vite.

- `index.html`: The main entry point for the web application.
- `package.json`: Frontend dependencies and scripts.
- `vite.config.js`: Vite configuration (if present, otherwise default).
- `/src`: Source code for the frontend.
    - `main.js`: Application entry point, handles initialization and Weblet service integration.
    - `game.js`: Core game logic, including Tetris mechanics, centroid calculations, and rendering.
    - `style.css`: Global styles for the game, including the leaderboard modal.

## /backend
The server-side API for the leaderboard.

- `server.js`: Express.js server handling API endpoints.
- `package.json`: Backend dependencies and scripts.

## /lib
Shared libraries and mock implementations.

- `weblet-auth.js`: Mock implementation of the Weblet Authentication service.
- `weblet-storage.js`: Mock implementation of the Weblet Storage service for score persistence.
