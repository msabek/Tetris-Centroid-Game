export class CentroidTetris {
    constructor(webletServices) {
        this.webletServices = webletServices;
        this.currentMode = 'level1';
        this.level1Progress = 0;
        this.currentLevel = 2;
        this.score = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.isCelebrating = false;

        this.highestLevelReached = 2;
        this.scoreAtLevelStart = 0;

        this.boardWidth = 10;
        this.boardHeight = 20;
        this.board = this.createEmptyBoard();

        this.currentPiece = null;
        this.currentPiecePos = { x: 0, y: 0 };
        this.upcomingPiece = null;
        this.currentTargetScore = 0;

        this.levelTargets = {
            2: [[5, 1], [5, 2], [5, 3], [5, 4], [5, 5]],
            3: [[3, 2], [7, 2], [5, 4], [5, 6], [5, 8]],
            4: [[2, 3], [8, 3], [5, 6], [3, 8], [7, 8]],
            5: [[4, 2], [6, 2], [5, 5], [3, 7], [7, 7]],
            6: [[5, 3], [3, 5], [7, 5], [5, 8], [5, 9]],
            7: [[4, 4], [6, 4], [5, 7], [3, 9], [7, 9]],
            8: [[5, 5], [3, 3], [7, 3], [5, 8], [5, 9]]
        };
        this.currentTargetIndex = 0;

        this.dropTimer = null;
        this.dropInterval = 1000;

        this.tetrominoes = {
            I: {
                name: 'I-Tetromino',
                shapes: [
                    [[0, 0], [1, 0], [2, 0], [3, 0]],
                    [[0, 0], [0, 1], [0, 2], [0, 3]]
                ],
                color: '#00ffff'
            },
            O: {
                name: 'O-Tetromino',
                shapes: [
                    [[0, 0], [1, 0], [0, 1], [1, 1]]
                ],
                color: '#ffff00'
            },
            T: {
                name: 'T-Tetromino',
                shapes: [
                    [[1, 0], [0, 1], [1, 1], [2, 1]],
                    [[0, 0], [0, 1], [1, 1], [0, 2]],
                    [[0, 0], [1, 0], [2, 0], [1, 1]],
                    [[1, 0], [0, 1], [1, 1], [1, 2]]
                ],
                color: '#800080'
            },
            S: {
                name: 'S-Tetromino',
                shapes: [
                    [[1, 0], [2, 0], [0, 1], [1, 1]],
                    [[0, 0], [0, 1], [1, 1], [1, 2]]
                ],
                color: '#00ff00'
            },
            Z: {
                name: 'Z-Tetromino',
                shapes: [
                    [[0, 0], [1, 0], [1, 1], [2, 1]],
                    [[1, 0], [0, 1], [1, 1], [0, 2]]
                ],
                color: '#ff0000'
            },
            J: {
                name: 'J-Tetromino',
                shapes: [
                    [[0, 0], [0, 1], [1, 1], [2, 1]],
                    [[1, 0], [1, 1], [0, 2], [1, 2]],
                    [[0, 0], [1, 0], [2, 0], [2, 1]],
                    [[0, 0], [1, 0], [0, 1], [0, 2]]
                ],
                color: '#0000ff'
            },
            L: {
                name: 'L-Tetromino',
                shapes: [
                    [[2, 0], [0, 1], [1, 1], [2, 1]],
                    [[0, 0], [0, 1], [0, 2], [1, 2]],
                    [[0, 0], [1, 0], [2, 0], [0, 1]],
                    [[0, 0], [1, 0], [1, 1], [1, 2]]
                ],
                color: '#ffa500'
            }
        };

        this.level1Sequence = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

        this.validateTargets();
        this.initializeGame();
        this.bindEvents();
    }

    validateTargets() {
        for (const level in this.levelTargets) {
            this.levelTargets[level] = this.levelTargets[level].map(target =>
                this.clampTarget(target)
            );
        }
    }

    createEmptyBoard() {
        return Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
    }

    initializeGame() {
        this.initializeLevel1();
        this.initializeGameplay();
        this.showLevel1();
    }

    initializeLevel1() {
        this.displayLevel1Shape();
    }

    displayLevel1Shape() {
        const shapeKey = this.level1Sequence[this.level1Progress];
        const shape = this.tetrominoes[shapeKey];
        const shapeCoords = shape.shapes[0];

        document.getElementById('shapeTitle').textContent = shape.name;
        document.getElementById('progress').textContent = `Shape ${this.level1Progress + 1} of ${this.level1Sequence.length}`;

        const grid = document.getElementById('shapeGrid');
        grid.innerHTML = '';

        for (let y = 3; y >= 0; y--) {
            for (let x = 0; x < 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';

                const hasBlock = shapeCoords.some(([sx, sy]) => sx === x && sy === y);
                if (hasBlock) {
                    cell.classList.add('filled');
                }

                grid.appendChild(cell);
            }
        }

        document.getElementById('centroidX').value = '';
        document.getElementById('centroidY').value = '';
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
    }

    calculateCentroid(coordinates) {
        if (coordinates.length === 0) return { x: 0, y: 0 };

        const sumX = coordinates.reduce((sum, [x, y]) => sum + x, 0);
        const sumY = coordinates.reduce((sum, [x, y]) => sum + y, 0);

        return {
            x: (sumX / coordinates.length) + 0.5,
            y: (sumY / coordinates.length) + 0.5
        };
    }

    checkLevel1Answer() {
        const userXValue = document.getElementById('centroidX').value.trim();
        const userYValue = document.getElementById('centroidY').value.trim();

        if (!userXValue || !userYValue) {
            document.getElementById('feedback').textContent = '';
            document.getElementById('feedback').className = 'feedback';
            return false;
        }

        const userX = parseFloat(userXValue);
        const userY = parseFloat(userYValue);

        if (isNaN(userX) || isNaN(userY)) {
            document.getElementById('feedback').textContent = '';
            document.getElementById('feedback').className = 'feedback';
            return false;
        }

        const shapeKey = this.level1Sequence[this.level1Progress];
        const shapeCoords = this.tetrominoes[shapeKey].shapes[0];
        const correctCentroid = this.calculateCentroid(shapeCoords);

        const tolerance = 0.1;
        const isCorrect = Math.abs(userX - correctCentroid.x) <= tolerance &&
            Math.abs(userY - correctCentroid.y) <= tolerance;

        const feedback = document.getElementById('feedback');
        if (isCorrect) {
            feedback.textContent = `Correct! Centroid is (${correctCentroid.x.toFixed(1)}, ${correctCentroid.y.toFixed(1)})`;
            feedback.className = 'feedback correct';
            return true;
        } else {
            feedback.textContent = `Incorrect. Try again! Expected: (${correctCentroid.x.toFixed(1)}, ${correctCentroid.y.toFixed(1)})`;
            feedback.className = 'feedback incorrect';
            return false;
        }
    }

    nextLevel1Shape() {
        if (this.checkLevel1Answer()) {
            this.level1Progress++;
            if (this.level1Progress >= this.level1Sequence.length) {
                this.startGameplay();
            } else {
                this.displayLevel1Shape();
            }
        }
    }

    initializeGameplay() {
        this.createGameBoard();
        this.createPreviewGrid();
    }

    createGameBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';

        for (let y = this.boardHeight - 1; y >= 0; y--) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                board.appendChild(cell);
            }
        }
    }

    createPreviewGrid() {
        const grid = document.getElementById('previewGrid');
        grid.innerHTML = '';

        for (let y = 3; y >= 0; y--) {
            for (let x = 0; x < 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'preview-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                grid.appendChild(cell);
            }
        }
    }

    getAvailableShapes() {
        const shapeKeys = ['I'];
        if (this.currentLevel >= 3) shapeKeys.push('O');
        if (this.currentLevel >= 4) shapeKeys.push('T');
        if (this.currentLevel >= 5) shapeKeys.push('S');
        if (this.currentLevel >= 6) shapeKeys.push('Z');
        if (this.currentLevel >= 7) shapeKeys.push('J');
        if (this.currentLevel >= 8) shapeKeys.push('L');
        return shapeKeys;
    }

    generateUpcomingPiece() {
        const availableShapes = this.getAvailableShapes();
        const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
        this.upcomingPiece = randomShape;
        this.updateUpcomingPreview();
    }

    updateUpcomingPreview() {
        if (!this.upcomingPiece) return;

        const cells = document.querySelectorAll('.preview-cell');
        cells.forEach(cell => {
            cell.className = 'preview-cell';
            cell.style.backgroundColor = '';
        });

        const shape = this.tetrominoes[this.upcomingPiece];
        const coords = shape.shapes[0];
        const color = shape.color;

        coords.forEach(([x, y]) => {
            const cell = document.querySelector(`.preview-cell[data-x="${x}"][data-y="${y}"]`);
            if (cell) {
                cell.classList.add('filled');
                cell.style.backgroundColor = color;
            }
        });
    }

    spawnNewPiece() {
        let pieceType;
        if (this.upcomingPiece) {
            pieceType = this.upcomingPiece;
        } else {
            const availableShapes = this.getAvailableShapes();
            pieceType = availableShapes[Math.floor(Math.random() * availableShapes.length)];
        }

        this.currentPiece = {
            type: pieceType,
            rotation: 0,
            color: this.tetrominoes[pieceType].color
        };

        this.currentPiecePos = {
            x: Math.floor(this.boardWidth / 2) - 1,
            y: this.boardHeight - 1
        };

        if (this.checkCollision(this.currentPiece, this.currentPiecePos)) {
            this.gameOver();
            return false;
        }

        this.generateUpcomingPiece();
        this.startDropTimer();
        return true;
    }

    getCurrentPieceCoords() {
        if (!this.currentPiece) return [];

        const shape = this.tetrominoes[this.currentPiece.type];
        const coords = shape.shapes[this.currentPiece.rotation];

        return coords.map(([x, y]) => [
            x + this.currentPiecePos.x,
            y + this.currentPiecePos.y
        ]);
    }

    checkCollision(piece, pos) {
        const shape = this.tetrominoes[piece.type];
        const coords = shape.shapes[piece.rotation];

        for (const [x, y] of coords) {
            const newX = x + pos.x;
            const newY = y + pos.y;

            if (newX < 0 || newX >= this.boardWidth || newY < 0) {
                return true;
            }

            if (newY < this.boardHeight && this.board[newY][newX] !== 0) {
                return true;
            }
        }

        return false;
    }

    lockPiece() {
        const coords = this.getCurrentPieceCoords();

        for (const [x, y] of coords) {
            if (y >= 0 && y < this.boardHeight && x >= 0 && x < this.boardWidth) {
                this.board[y][x] = 1;
            }
        }

        this.currentPiece = null;
        this.stopDropTimer();
        this.checkTargetMatch();
    }

    checkTargetMatch() {
        const lockedCoords = this.getLockedPieceCoords();
        if (lockedCoords.length === 0) return;

        const currentCentroid = this.calculateCentroid(lockedCoords);
        const target = this.getCurrentTarget();

        // Calculate Euclidean distance (tolerance)
        const tolerance = Math.sqrt(
            Math.pow(currentCentroid.x - target[0], 2) +
            Math.pow(currentCentroid.y - target[1], 2)
        );

        const maxTolerance = 0.3;
        const matches = tolerance <= maxTolerance;

        if (matches) {
            // NEW SCORING FORMULA: (208 - squares) / 2 + (0.3 - tolerance) * 100 + 70
            const lockedSquares = lockedCoords.length;
            const accuracyBonus = (maxTolerance - tolerance) * 100;
            this.currentTargetScore = Math.round((208 - lockedSquares) / 2 + accuracyBonus + 70);

            // Store tolerance for archery board display
            this.currentTolerance = tolerance;

            this.celebrateTargetMatch();
        }
    }

    celebrateTargetMatch() {
        this.isCelebrating = true;
        this.stopDropTimer();

        this.updateDisplay();

        this.animateTargetMarker();
        this.showScorePopup();
        this.animateScoreCounter();

        // NEW: Show archery board crosshair
        this.showArcheryCrosshair();

        setTimeout(() => {
            this.completeCelebration();
        }, 1000);
    }

    // NEW: Universal flashing function for any element
    flashElement(element, totalFlashes = 3, flashSpeed = 300) {
        let flashCount = 0;

        const doFlash = () => {
            if (flashCount >= totalFlashes) {
                element.style.opacity = '1';
                return;
            }

            // Completely disappear
            element.style.opacity = '0';

            setTimeout(() => {
                // Completely appear
                element.style.opacity = '1';
                flashCount++;

                setTimeout(doFlash, flashSpeed);
            }, flashSpeed);
        };

        doFlash();
    }

    // NEW: Master flashing function for target hits
    flashTargetHit(distance) {
        const crosshair = document.getElementById('archeryCrosshair');
        const scorePopup = document.querySelector('.score-popup');
        const scoreCounter = document.getElementById('score');

        // Determine which ring and hatch to flash
        let ring, hatch;
        if (distance <= 0.1) {
            ring = document.querySelector('.ring-center');
            hatch = document.getElementById('centerHatch');
        } else if (distance <= 0.2) {
            ring = document.querySelector('.ring-first');
            hatch = document.getElementById('firstHatch');
        } else if (distance <= 0.3) {
            ring = document.querySelector('.ring-second');
            hatch = document.getElementById('secondHatch');
        } else {
            ring = document.querySelector('.ring-outer');
            hatch = document.getElementById('outerHatch');
        }

        // Show the hatch
        if (hatch) hatch.style.display = 'block';

        // Flash all elements at the same speed (300ms)
        if (crosshair) this.flashElement(crosshair, 3, 300);
        if (ring) this.flashElement(ring, 3, 300);
        if (hatch) this.flashElement(hatch, 3, 300);
        if (scorePopup) this.flashElement(scorePopup, 3, 300);
        if (scoreCounter) this.flashElement(scoreCounter, 3, 300);

        // Hide hatch after flashing is done (3 flashes × 600ms = 1800ms + buffer)
        setTimeout(() => {
            if (hatch) {
                hatch.style.display = 'none';
                hatch.style.opacity = '1'; // Reset for next time
            }
        }, 2000);
    }

    // NEW: Show crosshair on archery board
    showArcheryCrosshair() {
        if (this.currentLevel < 2) return; // Only show in Level 2+

        const lockedCoords = this.getLockedPieceCoords();
        if (lockedCoords.length === 0) return;

        const currentCentroid = this.calculateCentroid(lockedCoords);
        const target = this.getCurrentTarget();

        // Use the stored tolerance from the scoring calculation
        const distance = this.currentTolerance;

        // Calculate error vector for direction
        const errorX = currentCentroid.x - target[0];
        const errorY = currentCentroid.y - target[1];
        const angle = Math.atan2(errorY, errorX);

        // Map distance to archery board (max radius = 60px for outer ring)
        const maxRadius = 60; // Half of ring-outer diameter (120px)
        const mappedDistance = Math.min(distance * (maxRadius / 0.4), maxRadius); // Scale distance

        // Convert polar to cartesian coordinates
        const centerX = 75; // Center of 150px board
        const centerY = 75;
        const crosshairX = centerX + mappedDistance * Math.cos(angle);
        const crosshairY = centerY - mappedDistance * Math.sin(angle); // Invert Y for screen coordinates

        // Determine color based on distance (using exact thresholds)
        let colorClass;
        if (distance <= 0.1) {
            colorClass = 'crosshair-gold';
        } else if (distance <= 0.2) {
            colorClass = 'crosshair-red';
        } else if (distance <= 0.3) {
            colorClass = 'crosshair-blue';
        } else {
            colorClass = 'crosshair-gray';
        }

        // Position and show the crosshair
        const crosshair = document.getElementById('archeryCrosshair');
        crosshair.className = `archery-crosshair ${colorClass}`;
        crosshair.style.left = `${crosshairX - 6}px`; // Center the 12px crosshair
        crosshair.style.top = `${crosshairY - 6}px`;
        crosshair.style.display = 'block';

        // Start the comprehensive flashing sequence
        this.flashTargetHit(distance);
    }

    animateTargetMarker() {
        const targetMarkers = document.querySelectorAll('.centroid-overlay');
        targetMarkers.forEach(marker => {
            if (marker.style.border && marker.style.border.includes('#FF00FF')) {
                marker.classList.add('target-celebrate');
            }
        });
    }

    showScorePopup() {
        const target = this.getCurrentTarget();
        const popup = document.createElement('div');
        popup.className = 'score-popup';

        // Show detailed score breakdown
        const lockedSquares = this.getLockedPieceCoords().length;
        const accuracyBonus = Math.round((0.3 - this.currentTolerance) * 100);
        const efficiency = Math.round((208 - lockedSquares) / 2);

        popup.innerHTML = `
            <div style="font-size: 24px; color: #FFD700; font-weight: bold;">+${this.currentTargetScore}</div>
            <div style="font-size: 12px; margin-top: 4px; color: #ffffff; opacity: 0.9;">
                Efficiency: ${efficiency} | Accuracy: ${accuracyBonus} | Base: 70
            </div>
            <div style="font-size: 11px; color: #ffffff; opacity: 0.7;">
                Distance: ${this.currentTolerance.toFixed(3)}
            </div>
        `;

        const cellSize = 30;
        const gapSize = 1;
        const x = target[0] * (cellSize + gapSize) - gapSize;
        const y = (this.boardHeight - target[1]) * (cellSize + gapSize) - gapSize;

        popup.style.left = `${x - 40}px`;
        popup.style.top = `${y - 60}px`;
        popup.style.textAlign = 'center';
        popup.style.whiteSpace = 'nowrap';

        const board = document.getElementById('gameBoard');
        board.appendChild(popup);

        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 3000); // Extended to 3 seconds for better celebration
    }

    animateScoreCounter() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.classList.add('score-highlight');

            setTimeout(() => {
                scoreElement.classList.remove('score-highlight');
            }, 400);
        }
    }

    completeCelebration() {
        this.score += this.currentTargetScore;
        this.currentTargetIndex++;

        this.board = this.createEmptyBoard();

        if (this.currentTargetIndex >= this.levelTargets[this.currentLevel].length) {
            this.advanceLevel();
        }

        document.querySelectorAll('.target-celebrate').forEach(marker => {
            marker.classList.remove('target-celebrate');
        });

        // Hide archery crosshair and clean up animations
        const crosshair = document.getElementById('archeryCrosshair');
        crosshair.style.display = 'none';
        crosshair.style.opacity = '1'; // Reset opacity
        crosshair.classList.remove('archery-celebrate');

        // Reset opacity for all rings and hide all hatches
        document.querySelectorAll('.archery-ring').forEach(ring => {
            ring.style.opacity = '1';
        });

        // Hide and reset all hatches
        document.querySelectorAll('[id$="Hatch"]').forEach(hatch => {
            hatch.style.display = 'none';
            hatch.style.opacity = '1';
        });

        this.isCelebrating = false;
        this.updateDisplay();
        this.spawnNewPiece();
    }

    getCurrentTarget() {
        const targets = this.levelTargets[this.currentLevel];
        const target = targets[this.currentTargetIndex] || targets[0];
        return this.clampTarget(target);
    }

    clampTarget(target) {
        if (!target || target.length < 2) return [5, 1];
        return [target[0], Math.min(target[1], 9)];
    }

    advanceLevel() {
        this.currentLevel++;
        this.currentTargetIndex = 0;

        if (this.currentLevel > 8) {
            this.victory();
            return;
        }

        if (this.currentLevel > this.highestLevelReached) {
            this.highestLevelReached = this.currentLevel;
            this.scoreAtLevelStart = this.score;
        }

        if (this.upcomingPiece) {
            const availableShapes = this.getAvailableShapes();
            if (!availableShapes.includes(this.upcomingPiece)) {
                this.generateUpcomingPiece();
            }
        }

        document.getElementById('currentLevel').textContent = this.currentLevel;
        this.updateArcheryBoardVisibility();
    }

    // NEW: Show/hide archery board based on level
    updateArcheryBoardVisibility() {
        const archeryContainer = document.getElementById('archeryContainer');
        if (this.currentLevel >= 2 && this.currentMode === 'gameplay') {
            archeryContainer.classList.add('visible');
        } else {
            archeryContainer.classList.remove('visible');
        }
    }

    getLockedPieceCoords() {
        const coords = [];
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] !== 0) {
                    coords.push([x, y]);
                }
            }
        }
        return coords;
    }

    movePiece(dx, dy) {
        if (!this.currentPiece || this.isPaused || this.isCelebrating) return false;

        const newPos = {
            x: this.currentPiecePos.x + dx,
            y: this.currentPiecePos.y + dy
        };

        if (!this.checkCollision(this.currentPiece, newPos)) {
            this.currentPiecePos = newPos;
            this.updateDisplay();
            return true;
        }

        if (dy < 0) {
            this.lockPiece();
            this.spawnNewPiece();
        }

        return false;
    }

    rotatePiece() {
        if (!this.currentPiece || this.isPaused || this.isCelebrating) return;

        const shape = this.tetrominoes[this.currentPiece.type];
        const newRotation = (this.currentPiece.rotation + 1) % shape.shapes.length;

        const testPiece = { ...this.currentPiece, rotation: newRotation };

        if (!this.checkCollision(testPiece, this.currentPiecePos)) {
            this.currentPiece.rotation = newRotation;
            this.updateDisplay();
        }
    }

    dropPiece() {
        if (!this.currentPiece || this.isPaused || this.isCelebrating) return;

        while (this.movePiece(0, -1)) {
            // Keep dropping until collision
        }
    }

    togglePause() {
        if (this.currentMode !== 'gameplay' || !this.gameRunning) return;

        this.isPaused = !this.isPaused;

        const pauseBtn = document.getElementById('pauseBtn');
        const pauseOverlay = document.getElementById('pauseOverlay');

        if (!pauseBtn) return; // Overlay might not exist yet

        if (this.isPaused) {
            this.stopDropTimer();
            pauseBtn.textContent = '▶ Resume';
            pauseBtn.classList.add('paused');
            if (pauseOverlay) pauseOverlay.classList.remove('hidden');
        } else {
            if (this.currentPiece) {
                this.startDropTimer();
            }
            pauseBtn.textContent = '⏸ Pause';
            pauseBtn.classList.remove('paused');
            if (pauseOverlay) pauseOverlay.classList.add('hidden');
        }
    }

    startDropTimer() {
        this.stopDropTimer();
        this.dropTimer = setInterval(() => {
            this.movePiece(0, -1);
        }, this.dropInterval);
    }

    stopDropTimer() {
        if (this.dropTimer) {
            clearInterval(this.dropTimer);
            this.dropTimer = null;
        }
    }

    updateDisplay() {
        this.clearBoard();
        this.drawLockedPieces();
        this.drawCurrentPiece();
        this.drawCentroids();
        this.updateGameInfo();
    }

    clearBoard() {
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            cell.className = 'board-cell';
        });
    }

    drawLockedPieces() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] !== 0) {
                    const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                    if (cell) {
                        cell.classList.add('filled');
                    }
                }
            }
        }
    }

    drawCurrentPiece() {
        if (!this.currentPiece) return;

        const coords = this.getCurrentPieceCoords();
        coords.forEach(([x, y]) => {
            if (x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight) {
                const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.classList.add('falling');
                }
            }
        });
    }

    drawCentroids() {
        document.querySelectorAll('.centroid-overlay').forEach(el => el.remove());

        if (this.currentPiece) {
            const currentCoords = this.getCurrentPieceCoords();
            const currentCentroid = this.calculateCentroid(currentCoords);
            this.drawCentroidMarker(currentCentroid, 'current');
        }

        const lockedCoords = this.getLockedPieceCoords();
        if (lockedCoords.length > 0) {
            const lockedCentroid = this.calculateCentroid(lockedCoords);
            this.drawCentroidMarker(lockedCentroid, 'locked');
        }

        const target = this.getCurrentTarget();
        this.drawCentroidMarker({ x: target[0], y: target[1] }, 'target');
    }

    drawCentroidMarker(centroid, markerType) {
        const marker = document.createElement('div');
        marker.className = 'centroid-overlay';

        const cellSize = 30;
        const gapSize = 1;
        const borderSize = 3;

        const x = centroid.x * (cellSize + gapSize) - gapSize;
        const y = (this.boardHeight - centroid.y) * (cellSize + gapSize) - gapSize;

        let markerSize, markerStyles;

        switch (markerType) {
            case 'current':
                markerSize = 16;
                markerStyles = {
                    width: '16px',
                    height: '16px',
                    background: 'transparent',
                    border: '2px solid #00BFFF'
                };
                break;

            case 'target':
                markerSize = 20;
                markerStyles = {
                    width: '20px',
                    height: '20px',
                    background: 'rgba(255, 0, 255, 0.3)',
                    border: '2px solid #FF00FF'
                };
                break;

            case 'locked':
                markerSize = 16;
                markerStyles = {
                    width: '16px',
                    height: '16px',
                    background: 'transparent',
                    border: '2px solid #FFD600'
                };
                break;

            default:
                markerSize = 16;
                markerStyles = {
                    width: '16px',
                    height: '16px',
                    background: 'transparent',
                    border: '2px solid #FFFFFF'
                };
        }

        marker.style.left = `${x - markerSize / 2}px`;
        marker.style.top = `${y - markerSize / 2}px`;
        Object.assign(marker.style, markerStyles);

        const hLine = document.createElement('div');
        hLine.style.cssText = `
            position: absolute;
            left: 50%; top: 50%;
            width: ${markerSize - 4}px; height: 2px;
            background: ${markerType === 'current' ? '#00BFFF' : markerType === 'target' ? '#FF00FF' : markerType === 'locked' ? '#FFD600' : '#FFFFFF'};
            transform: translate(-50%, -50%);
        `;
        marker.appendChild(hLine);

        const vLine = document.createElement('div');
        vLine.style.cssText = `
            position: absolute;
            left: 50%; top: 50%;
            width: 2px; height: ${markerSize - 4}px;
            background: ${markerType === 'current' ? '#00BFFF' : markerType === 'target' ? '#FF00FF' : markerType === 'locked' ? '#FFD600' : '#FFFFFF'};
            transform: translate(-50%, -50%);
        `;
        marker.appendChild(vLine);

        const board = document.getElementById('gameBoard');
        board.appendChild(marker);
    }

    updateGameInfo() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('currentLevel').textContent = this.currentLevel;

        const target = this.getCurrentTarget();
        document.getElementById('targetInfo').textContent = `Move to (${target[0].toFixed(1)}, ${target[1].toFixed(1)})`;

        const lockedCoords = this.getLockedPieceCoords();
        const lockedInfoElement = document.getElementById('lockedCentroidInfo');
        if (lockedCoords.length > 0) {
            const lockedCentroid = this.calculateCentroid(lockedCoords);
            lockedInfoElement.textContent = `at (${lockedCentroid.x.toFixed(1)}, ${lockedCentroid.y.toFixed(1)})`;
        } else {
            lockedInfoElement.textContent = 'No pieces';
        }
    }

    startGameplay() {
        this.showGameplay();
        this.gameRunning = true;
        this.isPaused = false;
        this.isCelebrating = false;
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.currentLevel = 2;
        this.currentTargetIndex = 0;
        this.upcomingPiece = null;
        this.currentTargetScore = 0;

        this.highestLevelReached = 2;
        this.scoreAtLevelStart = 0;

        const pauseBtn = document.getElementById('pauseBtn');
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸ Pause';
            pauseBtn.classList.remove('paused');
        }
        if (pauseOverlay) {
            pauseOverlay.classList.add('hidden');
        }

        // Hide archery crosshair
        const crosshair = document.getElementById('archeryCrosshair');
        crosshair.style.display = 'none';
        crosshair.style.opacity = '1'; // Reset opacity
        crosshair.classList.remove('archery-celebrate');

        // Reset opacity for all rings and hide all hatches
        document.querySelectorAll('.archery-ring').forEach(ring => {
            ring.style.opacity = '1';
        });

        // Hide and reset all hatches
        document.querySelectorAll('[id$="Hatch"]').forEach(hatch => {
            hatch.style.display = 'none';
            hatch.style.opacity = '1';
        });

        this.updateArcheryBoardVisibility();
        this.updateDisplay();
        this.generateUpcomingPiece();
        this.spawnNewPiece();
    }

    resetGame() {
        this.stopDropTimer();
        this.gameRunning = true;
        this.isPaused = false;
        this.isCelebrating = false;
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.upcomingPiece = null;
        this.currentTargetScore = 0;

        this.currentLevel = this.highestLevelReached;
        this.score = this.scoreAtLevelStart;
        this.currentTargetIndex = 0;

        document.querySelectorAll('.centroid-overlay').forEach(el => el.remove());
        document.querySelectorAll('.score-popup').forEach(el => el.remove());
        document.querySelectorAll('.target-celebrate').forEach(el => {
            el.classList.remove('target-celebrate');
        });

        const pauseBtn = document.getElementById('pauseBtn');
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸ Pause';
            pauseBtn.classList.remove('paused');
        }
        if (pauseOverlay) {
            pauseOverlay.classList.add('hidden');
        }

        // Hide archery crosshair
        const crosshair = document.getElementById('archeryCrosshair');
        crosshair.style.display = 'none';
        crosshair.style.opacity = '1'; // Reset opacity
        crosshair.classList.remove('archery-celebrate');

        // Reset opacity for all rings and hide all hatches
        document.querySelectorAll('.archery-ring').forEach(ring => {
            ring.style.opacity = '1';
        });

        // Hide and reset all hatches
        document.querySelectorAll('[id$="Hatch"]').forEach(hatch => {
            hatch.style.display = 'none';
            hatch.style.opacity = '1';
        });

        this.updateDisplay();
        this.generateUpcomingPiece();
        this.spawnNewPiece();
    }

    async gameOver() {
        this.stopDropTimer();
        this.gameRunning = false;
        alert(`Game Over! Final Score: ${this.score}`);

        // Submit score to Weblet
        if (this.webletServices && this.webletServices.storage) {
            try {
                await this.webletServices.storage.saveScore(this.score);
                alert('Score submitted to leaderboard!');
            } catch (e) {
                console.error('Failed to submit score:', e);
            }
        }
    }

    async victory() {
        this.stopDropTimer();
        this.gameRunning = false;
        alert(`🎉 Congratulations! You've completed all levels! Final Score: ${this.score}`);

        // Submit score to Weblet
        if (this.webletServices && this.webletServices.storage) {
            try {
                await this.webletServices.storage.saveScore(this.score);
                alert('Score submitted to leaderboard!');
            } catch (e) {
                console.error('Failed to submit score:', e);
            }
        }
    }

    showLevel1() {
        document.getElementById('level1').style.display = 'block';
        document.getElementById('gameplay').style.display = 'none';
        this.currentMode = 'level1';
        this.updateArcheryBoardVisibility();
    }

    showGameplay() {
        document.getElementById('level1').style.display = 'none';
        document.getElementById('gameplay').style.display = 'block';
        this.currentMode = 'gameplay';
        this.updateArcheryBoardVisibility();
    }

    returnToStart() {
        this.stopDropTimer();
        this.gameRunning = false;
        this.isPaused = false;
        this.isCelebrating = false;

        this.currentMode = 'level1';
        this.level1Progress = 0;
        this.currentLevel = 2;
        this.score = 0;
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.upcomingPiece = null;
        this.currentTargetIndex = 0;
        this.highestLevelReached = 2;
        this.scoreAtLevelStart = 0;
        this.currentTargetScore = 0;

        document.querySelectorAll('.centroid-overlay').forEach(el => el.remove());
        document.querySelectorAll('.score-popup').forEach(el => el.remove());
        document.querySelectorAll('.target-celebrate').forEach(el => {
            el.classList.remove('target-celebrate');
        });

        const pauseBtn = document.getElementById('pauseBtn');
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸ Pause';
            pauseBtn.classList.remove('paused');
        }
        if (pauseOverlay) {
            pauseOverlay.classList.add('hidden');
        }

        // Hide archery crosshair
        const crosshair = document.getElementById('archeryCrosshair');
        crosshair.style.display = 'none';
        crosshair.style.opacity = '1'; // Reset opacity
        crosshair.classList.remove('archery-celebrate');

        // Reset opacity for all rings and hide all hatches
        document.querySelectorAll('.archery-ring').forEach(ring => {
            ring.style.opacity = '1';
        });

        // Hide and reset all hatches
        document.querySelectorAll('[id$="Hatch"]').forEach(hatch => {
            hatch.style.display = 'none';
            hatch.style.opacity = '1';
        });

        this.showLevel1();
        this.displayLevel1Shape();
    }

    bindEvents() {
        document.getElementById('backButton').addEventListener('click', () => this.returnToStart());

        document.getElementById('nextShape').addEventListener('click', () => this.nextLevel1Shape());
        document.getElementById('skipToLevel2').addEventListener('click', () => this.startGameplay());

        document.getElementById('centroidX').addEventListener('input', () => this.checkLevel1Answer());
        document.getElementById('centroidY').addEventListener('input', () => this.checkLevel1Answer());

        document.getElementById('moveLeft').addEventListener('click', () => this.movePiece(-1, 0));
        document.getElementById('moveRight').addEventListener('click', () => this.movePiece(1, 0));
        document.getElementById('rotateBtn').addEventListener('click', () => this.rotatePiece());
        document.getElementById('dropBtn').addEventListener('click', () => this.dropPiece());

        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());

        document.addEventListener('keydown', (e) => {
            if (this.currentMode !== 'gameplay' || !this.gameRunning) return;

            if (e.key.toLowerCase() === 'p' && !this.isCelebrating) {
                e.preventDefault();
                this.togglePause();
                return;
            }

            if (this.isPaused || this.isCelebrating) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, -1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    this.dropPiece();
                    break;
            }
        });
    }
}
