const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bubbles = [];
const bubbleColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
const bubbleRadius = 20;
const rows = 5;
const columns = 8;
const shooter = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    color: '#ffffff',
    angle: 0
};
let currentBubble = createBubble(canvas.width / 2, canvas.height - 60, getRandomColor());
let isShooting = false;
let dx = 0;
let dy = 0;
let score = 0;

function createBubble(x, y, color) {
    return { x, y, radius: bubbleRadius, color };
}

function getRandomColor() {
    return bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.fill();
    ctx.closePath();
}

function drawShooter() {
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(shooter.x + Math.cos(shooter.angle) * 30, shooter.y + Math.sin(shooter.angle) * 30);
    ctx.strokeStyle = shooter.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let bubble of bubbles) {
        drawBubble(bubble);
    }
    
    drawShooter();
    drawBubble(currentBubble);
}

function detectCollision(bubble1, bubble2) {
    const dx = bubble1.x - bubble2.x;
    const dy = bubble1.y - bubble2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bubble1.radius + bubble2.radius;
}

function getConnectedBubbles(startBubble, color, checkedBubbles = new Set()) {
    const queue = [startBubble];
    const connectedBubbles = [];
    
    while (queue.length > 0) {
        const bubble = queue.pop();
        if (checkedBubbles.has(bubble)) continue;
        checkedBubbles.add(bubble);
        connectedBubbles.push(bubble);
        
        for (let otherBubble of bubbles) {
            if (otherBubble !== bubble && otherBubble.color === color && !checkedBubbles.has(otherBubble) && detectCollision(bubble, otherBubble)) {
                queue.push(otherBubble);
            }
        }
    }
    
    return connectedBubbles;
}

function removeBubbles(bubblesToRemove) {
    for (let bubble of bubblesToRemove) {
        const index = bubbles.indexOf(bubble);
        if (index > -1) {
            bubbles.splice(index, 1);
        }
    }
}

function updateScore(points) {
    score += points;
    document.getElementById('score').innerText = `Score: ${score}`;
}

function update() {
    if (isShooting) {
        currentBubble.x += dx;
        currentBubble.y += dy;
        
        // Collision detection with the walls
        if (currentBubble.x - currentBubble.radius <= 0 || currentBubble.x + currentBubble.radius >= canvas.width) {
            dx = -dx;
        }
        
        if (currentBubble.y - currentBubble.radius <= 0) {
            dy = -dy;
        }
        
        // Collision detection with bubbles
        for (let bubble of bubbles) {
            if (detectCollision(currentBubble, bubble)) {
                isShooting = false;
                bubbles.push(currentBubble);
                
                const connectedBubbles = getConnectedBubbles(currentBubble, currentBubble.color);
                if (connectedBubbles.length >= 3) {
                    updateScore(connectedBubbles.length);
                    removeBubbles(connectedBubbles);
                }
                
                currentBubble = createBubble(canvas.width / 2, canvas.height - 60, getRandomColor());
                break;
            }
        }
    }
}

function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop);
}

function setupGame() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            let bubble = createBubble(
                col * (bubbleRadius * 2 + 5) + bubbleRadius + 5,
                row * (bubbleRadius * 2 + 5) + bubbleRadius + 5,
                getRandomColor()
            );
            bubbles.push(bubble);
        }
    }
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
});

canvas.addEventListener('click', (event) => {
    if (!isShooting) {
        dx = Math.cos(shooter.angle) * 5;
        dy = Math.sin(shooter.angle) * 5;
        isShooting = true;
    }
});

setupGame();
gameLoop();
