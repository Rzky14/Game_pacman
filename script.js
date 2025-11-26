const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Game constants
const CELL_SIZE = 20;
const COLS = 28;
const ROWS = 31;
const PACMAN_SPEED = 2;
const GHOST_SPEED = 1.5;

// Game state
let gameStarted = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let animationId = null;

// Pac-Man
let pacman = {
    x: 13.5 * CELL_SIZE,
    y: 23 * CELL_SIZE,
    radius: 8,
    speed: PACMAN_SPEED,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    mouthOpen: 0
};

// Ghosts
let ghosts = [
    { x: 13.5 * CELL_SIZE, y: 11 * CELL_SIZE, color: '#FF0000', direction: { x: 1, y: 0 }, name: 'Blinky' },
    { x: 11.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB8FF', direction: { x: 0, y: -1 }, name: 'Pinky' },
    { x: 13.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#00FFFF', direction: { x: 0, y: -1 }, name: 'Inky' },
    { x: 15.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB852', direction: { x: 0, y: -1 }, name: 'Clyde' }
];

// Simplified maze (0 = path, 1 = wall, 2 = dot, 3 = power pellet)
const originalMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let maze = JSON.parse(JSON.stringify(originalMaze));

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    if (!gameStarted || gamePaused) return;

    switch(e.key) {
        case 'ArrowUp':
            pacman.nextDirection = { x: 0, y: -PACMAN_SPEED };
            break;
        case 'ArrowDown':
            pacman.nextDirection = { x: 0, y: PACMAN_SPEED };
            break;
        case 'ArrowLeft':
            pacman.nextDirection = { x: -PACMAN_SPEED, y: 0 };
            break;
        case 'ArrowRight':
            pacman.nextDirection = { x: PACMAN_SPEED, y: 0 };
            break;
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gamePaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        gameLoop();
    }
}

function togglePause() {
    if (gameStarted) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
        if (!gamePaused) {
            gameLoop();
        }
    }
}

function restartGame() {
    // Reset game state
    gameStarted = false;
    gamePaused = false;
    score = 0;
    lives = 3;
    
    // Reset maze
    maze = JSON.parse(JSON.stringify(originalMaze));
    
    // Reset Pac-Man
    pacman = {
        x: 13.5 * CELL_SIZE,
        y: 23 * CELL_SIZE,
        radius: 8,
        speed: PACMAN_SPEED,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        mouthOpen: 0
    };
    
    // Reset ghosts
    ghosts = [
        { x: 13.5 * CELL_SIZE, y: 11 * CELL_SIZE, color: '#FF0000', direction: { x: 1, y: 0 }, name: 'Blinky' },
        { x: 11.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB8FF', direction: { x: 0, y: -1 }, name: 'Pinky' },
        { x: 13.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#00FFFF', direction: { x: 0, y: -1 }, name: 'Inky' },
        { x: 15.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB852', direction: { x: 0, y: -1 }, name: 'Clyde' }
    ];
    
    updateScore();
    updateLives();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    drawGame();
}

function gameLoop() {
    if (!gameStarted || gamePaused) return;
    
    update();
    drawGame();
    
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    // Try to change direction
    if (canMove(pacman.x + pacman.nextDirection.x, pacman.y + pacman.nextDirection.y)) {
        pacman.direction = pacman.nextDirection;
    }
    
    // Move Pac-Man
    if (canMove(pacman.x + pacman.direction.x, pacman.y + pacman.direction.y)) {
        pacman.x += pacman.direction.x;
        pacman.y += pacman.direction.y;
    }
    
    // Animate mouth
    pacman.mouthOpen = (pacman.mouthOpen + 0.1) % (Math.PI / 4);
    
    // Check for dots
    collectDots();
    
    // Move ghosts
    moveGhosts();
    
    // Check collision with ghosts
    checkGhostCollision();
    
    // Check win condition
    checkWin();
}

function canMove(x, y) {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return false;
    }
    
    return maze[row][col] !== 1;
}

function collectDots() {
    const col = Math.floor(pacman.x / CELL_SIZE);
    const row = Math.floor(pacman.y / CELL_SIZE);
    
    if (maze[row][col] === 2) {
        maze[row][col] = 0;
        score += 10;
        updateScore();
    } else if (maze[row][col] === 3) {
        maze[row][col] = 0;
        score += 50;
        updateScore();
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        // Simple AI: try to move towards Pac-Man
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        
        let possibleDirections = [];
        
        // Try different directions
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) possibleDirections.push({ x: GHOST_SPEED, y: 0 });
            else possibleDirections.push({ x: -GHOST_SPEED, y: 0 });
            
            if (dy > 0) possibleDirections.push({ x: 0, y: GHOST_SPEED });
            else possibleDirections.push({ x: 0, y: -GHOST_SPEED });
        } else {
            if (dy > 0) possibleDirections.push({ x: 0, y: GHOST_SPEED });
            else possibleDirections.push({ x: 0, y: -GHOST_SPEED });
            
            if (dx > 0) possibleDirections.push({ x: GHOST_SPEED, y: 0 });
            else possibleDirections.push({ x: -GHOST_SPEED, y: 0 });
        }
        
        // Add current direction as fallback
        possibleDirections.push(ghost.direction);
        
        // Find first valid direction
        let moved = false;
        for (let dir of possibleDirections) {
            if (canMove(ghost.x + dir.x, ghost.y + dir.y)) {
                ghost.direction = dir;
                ghost.x += dir.x;
                ghost.y += dir.y;
                moved = true;
                break;
            }
        }
        
        // If can't move in any direction, try random
        if (!moved) {
            const randomDirs = [
                { x: GHOST_SPEED, y: 0 },
                { x: -GHOST_SPEED, y: 0 },
                { x: 0, y: GHOST_SPEED },
                { x: 0, y: -GHOST_SPEED }
            ];
            
            for (let dir of randomDirs) {
                if (canMove(ghost.x + dir.x, ghost.y + dir.y)) {
                    ghost.direction = dir;
                    ghost.x += dir.x;
                    ghost.y += dir.y;
                    break;
                }
            }
        }
    });
}

function checkGhostCollision() {
    ghosts.forEach(ghost => {
        const distance = Math.sqrt(
            Math.pow(pacman.x - ghost.x, 2) + 
            Math.pow(pacman.y - ghost.y, 2)
        );
        
        if (distance < CELL_SIZE) {
            lives--;
            updateLives();
            
            if (lives <= 0) {
                gameOver();
            } else {
                resetPositions();
            }
        }
    });
}

function resetPositions() {
    pacman.x = 13.5 * CELL_SIZE;
    pacman.y = 23 * CELL_SIZE;
    pacman.direction = { x: 0, y: 0 };
    pacman.nextDirection = { x: 0, y: 0 };
    
    ghosts[0] = { x: 13.5 * CELL_SIZE, y: 11 * CELL_SIZE, color: '#FF0000', direction: { x: 1, y: 0 }, name: 'Blinky' };
    ghosts[1] = { x: 11.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB8FF', direction: { x: 0, y: -1 }, name: 'Pinky' };
    ghosts[2] = { x: 13.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#00FFFF', direction: { x: 0, y: -1 }, name: 'Inky' };
    ghosts[3] = { x: 15.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB852', direction: { x: 0, y: -1 }, name: 'Clyde' };
}

function checkWin() {
    let dotsRemaining = false;
    for (let row of maze) {
        for (let cell of row) {
            if (cell === 2 || cell === 3) {
                dotsRemaining = true;
                break;
            }
        }
        if (dotsRemaining) break;
    }
    
    if (!dotsRemaining) {
        gameStarted = false;
        alert('Congratulations! You Win! Score: ' + score);
        restartGame();
    }
}

function gameOver() {
    gameStarted = false;
    alert('Game Over! Final Score: ' + score);
    restartGame();
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateLives() {
    livesElement.textContent = lives;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    drawMaze();
    
    // Draw Pac-Man
    drawPacman();
    
    // Draw ghosts
    drawGhosts();
}

function drawMaze() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;
            
            if (maze[row][col] === 1) {
                // Wall
                ctx.fillStyle = '#1e90ff';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = '#0066cc';
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            } else if (maze[row][col] === 2) {
                // Dot
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (maze[row][col] === 3) {
                // Power pellet
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    
    // Rotate based on direction
    if (pacman.direction.x > 0) ctx.rotate(0);
    else if (pacman.direction.x < 0) ctx.rotate(Math.PI);
    else if (pacman.direction.y > 0) ctx.rotate(Math.PI / 2);
    else if (pacman.direction.y < 0) ctx.rotate(-Math.PI / 2);
    
    // Draw Pac-Man
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(0, 0, pacman.radius, pacman.mouthOpen, Math.PI * 2 - pacman.mouthOpen);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    ctx.restore();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        // Body
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y - 3, 8, Math.PI, 0);
        ctx.lineTo(ghost.x + 8, ghost.y + 8);
        ctx.lineTo(ghost.x + 6, ghost.y + 5);
        ctx.lineTo(ghost.x + 4, ghost.y + 8);
        ctx.lineTo(ghost.x + 2, ghost.y + 5);
        ctx.lineTo(ghost.x, ghost.y + 8);
        ctx.lineTo(ghost.x - 2, ghost.y + 5);
        ctx.lineTo(ghost.x - 4, ghost.y + 8);
        ctx.lineTo(ghost.x - 6, ghost.y + 5);
        ctx.lineTo(ghost.x - 8, ghost.y + 8);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ghost.x - 3, ghost.y - 2, 3, 0, Math.PI * 2);
        ctx.arc(ghost.x + 3, ghost.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(ghost.x - 3, ghost.y - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(ghost.x + 3, ghost.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Initial draw
drawGame();
