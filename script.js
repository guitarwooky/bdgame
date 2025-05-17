// Canvas 및 Context 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// 게임 상태
let score = 0;
let lives = 3;
let gameRunning = false;
let animationId = null;

// 패들 설정
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// 공 설정
const ballRadius = 8;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDx = 2;
let ballDy = -2;

// 벽돌 설정
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 50;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// 벽돌 배열 초기화
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// 키보드 & 마우스 제어
let rightPressed = false;
let leftPressed = false;
let mouseControl = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);
startButton.addEventListener("click", startGame);

// 모바일 터치 컨트롤 이벤트 리스너
if (leftBtn && rightBtn) {
    leftBtn.addEventListener("touchstart", function() {
        leftPressed = true;
    });
    
    leftBtn.addEventListener("touchend", function() {
        leftPressed = false;
    });
    
    rightBtn.addEventListener("touchstart", function() {
        rightPressed = true;
    });
    
    rightBtn.addEventListener("touchend", function() {
        rightPressed = false;
    });
    
    // 마우스 이벤트도 추가 (데스크톱 테스트용)
    leftBtn.addEventListener("mousedown", function() {
        leftPressed = true;
    });
    
    leftBtn.addEventListener("mouseup", function() {
        leftPressed = false;
    });
    
    leftBtn.addEventListener("mouseleave", function() {
        leftPressed = false;
    });
    
    rightBtn.addEventListener("mousedown", function() {
        rightPressed = true;
    });
    
    rightBtn.addEventListener("mouseup", function() {
        rightPressed = false;
    });
    
    rightBtn.addEventListener("mouseleave", function() {
        rightPressed = false;
    });
}

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    if (gameRunning) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > paddleWidth / 2 && relativeX < canvas.width - paddleWidth / 2) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }
}

// 충돌 감지
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ballX > b.x &&
                    ballX < b.x + brickWidth &&
                    ballY > b.y &&
                    ballY < b.y + brickHeight
                ) {
                    ballDy = -ballDy;
                    b.status = 0;
                    score++;
                    document.getElementById("score").textContent = score;

                    // 모든 벽돌을 깼는지 확인
                    if (score === brickRowCount * brickColumnCount) {
                        alert("축하합니다! 게임에서 승리했습니다!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// 요소 그리기 함수
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = getColorByRow(r);
                ctx.fill();
                ctx.strokeStyle = "#000";
                ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
                ctx.closePath();
            }
        }
    }
}

// 벽돌에 색상 적용
function getColorByRow(row) {
    const colors = ["#FF6347", "#FFA500", "#FFD700", "#90EE90", "#87CEFA"];
    return colors[row];
}

// 게임 로직
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    
    // 벽 충돌 체크
    if (ballX + ballDx > canvas.width - ballRadius || ballX + ballDx < ballRadius) {
        ballDx = -ballDx;
    }
    
    // 상단 벽 충돌
    if (ballY + ballDy < ballRadius) {
        ballDy = -ballDy;
    } 
    // 하단 벽/패들 충돌
    else if (ballY + ballDy > canvas.height - ballRadius - paddleHeight) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            // 패들에 부딪히면 방향 바꿈
            ballDy = -ballDy;
            
            // 패들의 어느 부분에 맞았는지에 따라 x 속도 조정
            const hitLocation = ballX - (paddleX + paddleWidth / 2);
            ballDx = hitLocation * 0.05;
        } else if (ballY + ballDy > canvas.height - ballRadius) {
            // 패들을 놓친 경우
            lives--;
            document.getElementById("lives").textContent = lives;
            
            if (lives === 0) {
                alert("게임 오버! 다시 도전하세요.");
                resetGame();
                return;
            } else {
                // 위치 리셋
                ballX = canvas.width / 2;
                ballY = canvas.height - 30;
                ballDx = 2;
                ballDy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }
    
    // 패들 이동
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    
    // 공 이동
    ballX += ballDx;
    ballY += ballDy;
    
    if (gameRunning) {
        animationId = requestAnimationFrame(draw);
    }
}

// 게임 시작
function startGame() {
    if (!gameRunning) {
        resetGame();
        gameRunning = true;
        startButton.textContent = "재시작";
        animationId = requestAnimationFrame(draw);
    } else {
        resetGame();
    }
}

// 게임 리셋
function resetGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    score = 0;
    lives = 3;
    document.getElementById("score").textContent = score;
    document.getElementById("lives").textContent = lives;
    
    // 벽돌 초기화
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
    
    // 위치 초기화
    paddleX = (canvas.width - paddleWidth) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDx = 2;
    ballDy = -2;
    
    gameRunning = startButton.textContent === "재시작";
} 