const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

canvas.width = 500;
canvas.height = 700;

let gameStarted = false;
let isGameOver = false;
let frames = 0;
let score = 0;
const gravity = 0.3; // Сила гравитации
const jumpPower = -6; // Сила прыжка
let velocity = 0;

// Изображение для птицы
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    image: new Image(),
    jump() {
        velocity = jumpPower;
    },
    update() {
        velocity += gravity;
        this.y += velocity;

        // Проверка на границы канваса
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            velocity = 0;
        } else if (this.y < 0) {
            this.y = 0;
            velocity = 0;
        }
    },
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    },
};

bird.image.src = 'image.png'; // Птица

// Изображение для труб
const pipeImage = new Image();
pipeImage.src = 'image.png'; // Используем одно изображение для труб

const pipes = [];
const pipeWidth = 60; // Ширина труб
const pipeGap = 250; // Расстояние между верхней и нижней трубой
const pipeSpacing = 300; // Интервал между трубами по оси X

let passedPipes = 0; // Переменная для отслеживания пройденных труб

// Генерация новых труб с улучшенной логикой
function generatePipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    const topPipeHeight = pipeHeight;
    const bottomPipeHeight = canvas.height - pipeGap - topPipeHeight;

    pipes.push({
        x: canvas.width + pipeSpacing,
        top: topPipeHeight,
        bottom: bottomPipeHeight,
        passed: false, // Флаг, чтобы отслеживать, пройдена ли труба
    });
}

// Отрисовка труб
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImage, pipe.x, 0, pipeWidth, pipe.top);
        ctx.drawImage(pipeImage, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

// Обновление положения труб
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;

        // Убираем трубы, которые уже вышли за экран
        if (pipe.x < -pipeWidth) {
            pipes.shift();
        }
    });
}

// Проверка на столкновение
function checkCollision() {
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver();
    }

    pipes.forEach(pipe => {
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
            if (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom) {
                gameOver();
            }
        }
    });
}

function gameOver() {
    isGameOver = true;
    gameOverScreen.style.display = "block";
    gameStarted = false;
    cancelAnimationFrame(frameId);
}

function resetGame() {
    bird.y = canvas.height / 2;
    pipes.length = 0;
    passedPipes = 0;
    velocity = 0;
    score = 0;
    isGameOver = false;
    gameOverScreen.style.display = "none";
    startGame();
}

function drawScore() {
    ctx.font = "40px Smooth Relief";
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#FFF";
    ctx.strokeText("Счёт: " + score, 200, 50);
    ctx.fillStyle = "#000";
    ctx.fillText("Счёт: " + score, 200, 50);
}

function startGame() {
    gameStarted = true;
    startScreen.style.display = "none";
    startMusic();
    gameLoop();
}

function gameLoop() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;
    bird.update();
    bird.draw();
    drawPipes();
    updatePipes();
    checkCollision();
    drawScore();

    pipes.forEach(pipe => {
        if (!pipe.passed && bird.x + bird.width > pipe.x + pipeWidth) {
            score++;
            pipe.passed = true;
        }
    });

    if (frames % 90 === 0) {
        generatePipe();
    }

    if (!isGameOver) {
        frameId = requestAnimationFrame(gameLoop);
    }
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);
exitBtn.addEventListener("click", () => {
    window.close();
});

window.addEventListener("keydown", event => {
    if (event.code === "Space" && !isGameOver) {
        bird.jump();
    }
});

window.addEventListener("click", event => {
    if (!isGameOver) {
        bird.jump();
    }
});

// Настройка и запуск музыки
const backgroundMusic = new Audio('music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2;

function startMusic() {
    backgroundMusic.play().catch(error => {
        console.error("Ошибка воспроизведения музыки:", error);
    });
}

function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function gameOver() {
    isGameOver = true;
    gameOverScreen.style.display = "block";
    stopMusic();
    cancelAnimationFrame(frameId);
}
