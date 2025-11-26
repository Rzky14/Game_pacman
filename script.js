const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const powerModeElement = document.getElementById('powerMode');
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
let powerMode = false;
let powerModeTimer = 0;
let level = 1;
let ghostEatenCount = 0;
let mapsCompleted = 0;
let totalLivesLost = 0;
let achievementUnlocked = false;

// Pac-Man
let pacman = {
    x: 13.5 * CELL_SIZE,
    y: 23 * CELL_SIZE,
    radius: 8,
    speed: PACMAN_SPEED,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    mouthOpen: 0,
    mouthDirection: 1
};

// Ghosts
let ghosts = [
    { x: 13.5 * CELL_SIZE, y: 11 * CELL_SIZE, color: '#FF0000', direction: { x: 1, y: 0 }, name: 'Blinky', frightened: false, eaten: false },
    { x: 11.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB8FF', direction: { x: 0, y: -1 }, name: 'Pinky', frightened: false, eaten: false },
    { x: 13.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#00FFFF', direction: { x: 0, y: -1 }, name: 'Inky', frightened: false, eaten: false },
    { x: 15.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB852', direction: { x: 0, y: -1 }, name: 'Clyde', frightened: false, eaten: false }
];

// Multiple maze layouts (0 = path, 1 = wall, 2 = dot, 3 = power pellet)
const mazeLayouts = [
    // Map 1: Classic Layout - Fixed ghost house connections
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,0,0,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
        [2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2],
        [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,3,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    // Map 2: Open Corridors - Fixed ghost house and corridors
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1],
        [1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,0,0,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
        [2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2],
        [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,1,1,2,1,1,2,1,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,2,2,2,2,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,3,1],
        [1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    // Map 3: Maze Challenge - Fixed ghost house and maze paths
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,1,1,1,2,2,2,2,1,1,1,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,1,1,2,1,1,2,1,1,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,0,0,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
        [2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2],
        [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,1,1,2,1,1,2,1,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,2,2,2,2,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,3,1],
        [1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
];

let currentMapIndex = 0;
let maze = JSON.parse(JSON.stringify(mazeLayouts[currentMapIndex]));

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

document.addEventListener('keydown', handleKeyPress);

// Achievement modal buttons
document.getElementById('continueBtn').addEventListener('click', continueGame);
document.getElementById('closeAchievement').addEventListener('click', closeAchievement);

// Mobile controls
const mobileButtons = document.querySelectorAll('.mobile-btn');
mobileButtons.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameStarted || gamePaused) return;
        
        const direction = btn.dataset.direction;
        handleDirection(direction);
    });
    
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!gameStarted || gamePaused) return;
        
        const direction = btn.dataset.direction;
        handleDirection(direction);
    });
});

// Touch swipe controls for canvas
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameStarted || gamePaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) {
            handleDirection('right');
        } else if (deltaX < -30) {
            handleDirection('left');
        }
    } else {
        if (deltaY > 30) {
            handleDirection('down');
        } else if (deltaY < -30) {
            handleDirection('up');
        }
    }
});

function handleDirection(direction) {
    switch(direction) {
        case 'up':
            pacman.nextDirection = { x: 0, y: -PACMAN_SPEED };
            break;
        case 'down':
            pacman.nextDirection = { x: 0, y: PACMAN_SPEED };
            break;
        case 'left':
            pacman.nextDirection = { x: -PACMAN_SPEED, y: 0 };
            break;
        case 'right':
            pacman.nextDirection = { x: PACMAN_SPEED, y: 0 };
            break;
    }
}

function handleKeyPress(e) {
    if (!gameStarted || gamePaused) return;

    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            pacman.nextDirection = { x: 0, y: -PACMAN_SPEED };
            break;
        case 'ArrowDown':
            e.preventDefault();
            pacman.nextDirection = { x: 0, y: PACMAN_SPEED };
            break;
        case 'ArrowLeft':
            e.preventDefault();
            pacman.nextDirection = { x: -PACMAN_SPEED, y: 0 };
            break;
        case 'ArrowRight':
            e.preventDefault();
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
    level = 1;
    powerMode = false;
    powerModeTimer = 0;
    currentMapIndex = 0;
    mapsCompleted = 0;
    totalLivesLost = 0;
    achievementUnlocked = false;
    
    // Reset maze
    maze = JSON.parse(JSON.stringify(mazeLayouts[currentMapIndex]));
    
    // Reset Pac-Man
    pacman = {
        x: 13.5 * CELL_SIZE,
        y: 23 * CELL_SIZE,
        radius: 8,
        speed: PACMAN_SPEED,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        mouthOpen: 0,
        mouthDirection: 1
    };
    
    // Reset ghosts
    ghosts = [
        { x: 13.5 * CELL_SIZE, y: 11 * CELL_SIZE, color: '#FF0000', direction: { x: 1, y: 0 }, name: 'Blinky', frightened: false, eaten: false },
        { x: 11.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB8FF', direction: { x: 0, y: -1 }, name: 'Pinky', frightened: false, eaten: false },
        { x: 13.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#00FFFF', direction: { x: 0, y: -1 }, name: 'Inky', frightened: false, eaten: false },
        { x: 15.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB852', direction: { x: 0, y: -1 }, name: 'Clyde', frightened: false, eaten: false }
    ];
    
    updateScore();
    updateLives();
    updateLevel();
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
    
    // Animate mouth with smoother animation
    pacman.mouthOpen += 0.15 * pacman.mouthDirection;
    if (pacman.mouthOpen >= Math.PI / 4 || pacman.mouthOpen <= 0) {
        pacman.mouthDirection *= -1;
    }
    
    // Update power mode
    if (powerMode) {
        powerModeTimer--;
        if (powerModeTimer <= 0) {
            powerMode = false;
            ghosts.forEach(g => g.frightened = false);
            powerModeElement.style.display = 'none';
        }
    }
    
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
        // Activate power mode
        powerMode = true;
        powerModeTimer = 300; // ~5 seconds at 60fps
        ghostEatenCount = 0;
        ghosts.forEach(g => {
            if (!g.eaten) g.frightened = true;
        });
        powerModeElement.style.display = 'block';
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.eaten) return; // Don't move eaten ghosts
        
        const speed = ghost.frightened ? GHOST_SPEED * 0.5 : GHOST_SPEED;
        
        // Initialize direction frame counter if not exists
        if (!ghost.directionFrames) {
            ghost.directionFrames = 0;
        }
        
        ghost.directionFrames++;
        
        // Change direction every 20-40 frames for smooth but random movement
        const shouldChangeDirection = ghost.directionFrames > (20 + Math.random() * 20);
        
        // Check if current direction is blocked
        const isBlocked = !canMove(ghost.x + ghost.direction.x, ghost.y + ghost.direction.y);
        
        if (shouldChangeDirection || isBlocked) {
            // Time to change direction or ghost is blocked
            ghost.directionFrames = 0;
            
            // Get all possible directions
            let possibleDirections = [
                { x: speed, y: 0 },
                { x: -speed, y: 0 },
                { x: 0, y: speed },
                { x: 0, y: -speed }
            ];
            
            // Filter only valid directions
            let validDirections = possibleDirections.filter(dir => 
                canMove(ghost.x + dir.x, ghost.y + dir.y)
            );
            
            // If there are valid directions, pick one randomly
            if (validDirections.length > 0) {
                // Completely random selection
                const randomIndex = Math.floor(Math.random() * validDirections.length);
                ghost.direction = validDirections[randomIndex];
            }
        }
        
        // Move ghost in current direction
        if (canMove(ghost.x + ghost.direction.x, ghost.y + ghost.direction.y)) {
            ghost.x += ghost.direction.x;
            ghost.y += ghost.direction.y;
        }
    });
}

function checkGhostCollision() {
    ghosts.forEach(ghost => {
        if (ghost.eaten) return;
        
        const distance = Math.sqrt(
            Math.pow(pacman.x - ghost.x, 2) + 
            Math.pow(pacman.y - ghost.y, 2)
        );
        
        if (distance < CELL_SIZE) {
            if (ghost.frightened && powerMode) {
                // Eat the ghost
                ghost.eaten = true;
                ghost.frightened = false;
                ghostEatenCount++;
                const points = 200 * Math.pow(2, ghostEatenCount - 1);
                score += points;
                updateScore();
                showPoints(ghost.x, ghost.y, points);
                setTimeout(() => {
                    ghost.eaten = false;
                    ghost.x = 13.5 * CELL_SIZE;
                    ghost.y = 14 * CELL_SIZE;
                }, 3000);
            } else if (!ghost.frightened) {
                // Ghost caught Pac-Man
                lives--;
                totalLivesLost++;
                updateLives();
                
                if (lives <= 0) {
                    gameOver();
                } else {
                    resetPositions();
                }
            }
        }
    });
}

function showPoints(x, y, points) {
    // Visual feedback for eating ghosts (shown in score)
    console.log(`+${points} points!`);
}

function resetPositions() {
    pacman.x = 13.5 * CELL_SIZE;
    pacman.y = 23 * CELL_SIZE;
    pacman.direction = { x: 0, y: 0 };
    pacman.nextDirection = { x: 0, y: 0 };
    powerMode = false;
    powerModeTimer = 0;
    
    ghosts[0] = { x: 13.5 * CELL_SIZE, y: 11 * CELL_SIZE, color: '#FF0000', direction: { x: 1, y: 0 }, name: 'Blinky', frightened: false, eaten: false };
    ghosts[1] = { x: 11.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB8FF', direction: { x: 0, y: -1 }, name: 'Pinky', frightened: false, eaten: false };
    ghosts[2] = { x: 13.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#00FFFF', direction: { x: 0, y: -1 }, name: 'Inky', frightened: false, eaten: false };
    ghosts[3] = { x: 15.5 * CELL_SIZE, y: 14 * CELL_SIZE, color: '#FFB852', direction: { x: 0, y: -1 }, name: 'Clyde', frightened: false, eaten: false };
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
        level++;
        score += 1000; // Bonus for completing level
        mapsCompleted++;
        updateScore();
        updateLevel();
        
        // Check if all 3 maps completed
        if (mapsCompleted === 3 && !achievementUnlocked) {
            achievementUnlocked = true;
            score += 5000; // Big bonus for completing all maps!
            updateScore();
            showAchievement();
            return;
        }
        
        // Cycle to next map
        currentMapIndex = (currentMapIndex + 1) % mazeLayouts.length;
        const mapNames = ['Classic', 'Open Corridors', 'Maze Challenge'];
        
        alert(`Level ${level - 1} Complete! Bonus: 1000\nMap: ${mapNames[currentMapIndex]}\nStarting Level ${level}...`);
        maze = JSON.parse(JSON.stringify(mazeLayouts[currentMapIndex]));
        resetPositions();
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

function updateLevel() {
    levelElement.textContent = level;
}

function showAchievement() {
    gameStarted = false;
    gamePaused = true;
    
    const modal = document.getElementById('achievementModal');
    const finalScoreElement = document.getElementById('finalScore');
    const livesLostElement = document.getElementById('livesLost');
    
    finalScoreElement.textContent = score;
    livesLostElement.textContent = totalLivesLost;
    
    modal.style.display = 'flex';
    
    // Play celebration animation
    setTimeout(() => {
        modal.querySelector('.achievement-content').classList.add('celebrate');
    }, 100);
}

function continueGame() {
    const modal = document.getElementById('achievementModal');
    modal.style.display = 'none';
    
    // Continue with next cycle
    currentMapIndex = 0;
    mapsCompleted = 0;
    const mapNames = ['Classic', 'Open Corridors', 'Maze Challenge'];
    
    alert(`Continuing to Level ${level}...\nMap: ${mapNames[currentMapIndex]}`);
    maze = JSON.parse(JSON.stringify(mazeLayouts[currentMapIndex]));
    resetPositions();
    
    gameStarted = true;
    gamePaused = false;
    gameLoop();
}

function closeAchievement() {
    const modal = document.getElementById('achievementModal');
    modal.style.display = 'none';
    gameOver();
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
        if (ghost.eaten) return; // Don't draw eaten ghosts
        
        // Body - blue when frightened, normal color otherwise
        if (ghost.frightened) {
            // Flashing blue/white when power mode is ending
            if (powerModeTimer < 90 && Math.floor(powerModeTimer / 15) % 2 === 0) {
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#0000ff';
            }
        } else {
            ctx.fillStyle = ghost.color;
        }
        
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
        
        if (ghost.frightened) {
            // Frightened face
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(ghost.x - 3, ghost.y, 2, 0, Math.PI * 2);
            ctx.arc(ghost.x + 3, ghost.y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Wavy mouth
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ghost.x - 5, ghost.y + 4);
            ctx.quadraticCurveTo(ghost.x - 2, ghost.y + 2, ghost.x, ghost.y + 4);
            ctx.quadraticCurveTo(ghost.x + 2, ghost.y + 6, ghost.x + 5, ghost.y + 4);
            ctx.stroke();
        } else {
            // Normal eyes
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
        }
    });
}

// Initial draw
drawGame();
