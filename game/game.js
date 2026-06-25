const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 90;
const COLS = 10;
const ROWS = 6;

let sun = 50;
let selectedPlant = null;
let plants = [];
let zombies = [];
let bullets = [];
let suns = [];
let gameLoopId = null;
let lastSunTime = 0;
let sunFlowerId = 0;
let peashooterId = 0;
let zombieId = 0;

const PLANT_COSTS = {
    sunflower: 50,
    peashooter: 100
};

// 卡片图片
const CARD_IMAGES = {
    sunflower: new Image(),
    peashooter: new Image()
};

CARD_IMAGES.sunflower.src = 'cards/card_sunflower.png';
CARD_IMAGES.peashooter.src = 'cards/card_peashooter.png';

// 种植后的植物图片
const PLANT_IMAGES = {
    sunflower: new Image(),
    peashooter: new Image()
};

PLANT_IMAGES.sunflower.src = 'plants/SunFlower_1.png';
PLANT_IMAGES.peashooter.src = 'plants/Peashooter_1.png';

// 僵尸图片
const ZOMBIE_IMAGE = new Image();
ZOMBIE_IMAGE.src = 'zombies/Zombie2_5.png';

// 阳光图片
const SUN_IMAGE = new Image();
SUN_IMAGE.src = 'sun/Sun_1.png';

// 背景图片
const BACKGROUND_IMAGE = new Image();
BACKGROUND_IMAGE.src = 'background/background1.jpg';

const COLORS = {
    grass: '#4a8f40',
    grassDark: '#3d7a35',
    soil: '#8b4513',
    sunflower: '#ffd700',
    peashooter: '#228b22',
    bullet: '#32cd32',
    zombie: '#556b2f',
    zombieDark: '#4a5d23'
};

class Plant {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = CELL_SIZE - 10;
        this.height = CELL_SIZE - 10;
        this.centerX = x + CELL_SIZE / 2;
        this.centerY = y + CELL_SIZE / 2;
    }

    draw() {
        ctx.save();
        
        const image = PLANT_IMAGES[this.type];
        if (image && image.complete) {
            ctx.drawImage(image, this.x, this.y, this.width, this.height);
        } else {
            if (this.type === 'sunflower') {
                this.drawSunflowerFallback();
            } else if (this.type === 'peashooter') {
                this.drawPeashooterFallback();
            }
        }
        
        ctx.restore();
    }

    drawSunflowerFallback() {
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 30, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.sunflower;
        ctx.fill();
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ffec8b';
        ctx.fill();

        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const petalX = this.centerX + Math.cos(angle) * 38;
            const petalY = this.centerY + Math.sin(angle) * 38;
            
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 8, 15, angle, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.sunflower;
            ctx.fill();
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawPeashooterFallback() {
        const potX = this.centerX;
        const potY = this.centerY + 15;
        
        ctx.beginPath();
        ctx.ellipse(potX, potY, 25, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#cd853f';
        ctx.fill();
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(potX - 20, potY - 12);
        ctx.lineTo(potX - 5, potY - 30);
        ctx.lineTo(potX + 5, potY - 30);
        ctx.lineTo(potX + 20, potY - 12);
        ctx.closePath();
        ctx.fillStyle = '#228b22';
        ctx.fill();
        ctx.strokeStyle = '#1a6b1a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(potX + 20, potY - 12);
        ctx.lineTo(potX + 45, potY - 8);
        ctx.lineTo(potX + 45, potY + 8);
        ctx.lineTo(potX + 25, potY + 5);
        ctx.closePath();
        ctx.fillStyle = COLORS.peashooter;
        ctx.fill();
        ctx.strokeStyle = '#1a6b1a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(potX + 45, potY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#32cd32';
        ctx.fill();
        ctx.strokeStyle = '#228b22';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(potX - 10, potY - 28);
        ctx.lineTo(potX - 5, potY - 40);
        ctx.lineTo(potX, potY - 28);
        ctx.closePath();
        ctx.fillStyle = '#90ee90';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(potX + 10, potY - 28);
        ctx.lineTo(potX + 5, potY - 40);
        ctx.lineTo(potX, potY - 28);
        ctx.closePath();
        ctx.fillStyle = '#90ee90';
        ctx.fill();
    }
}

class Sunflower extends Plant {
    constructor(x, y) {
        super(x, y, 'sunflower');
        this.id = ++sunFlowerId;
        this.lastProduceTime = Date.now();
        this.produceInterval = 7000;
        this.isProducing = false;
    }

    update() {
        const now = Date.now();
        if (now - this.lastProduceTime >= this.produceInterval) {
            this.produceSun();
            this.lastProduceTime = now;
        }
    }

    produceSun() {
        const sunObj = {
            x: this.centerX,
            y: this.centerY,
            targetY: this.centerY + 50,
            speed: 1,
            collected: false,
            value: 25,
            id: Date.now()
        };
        suns.push(sunObj);
    }
}

class Peashooter extends Plant {
    constructor(x, y) {
        super(x, y, 'peashooter');
        this.id = ++peashooterId;
        this.lastShootTime = Date.now();
        this.shootInterval = 1500;
    }

    update() {
        const now = Date.now();
        if (now - this.lastShootTime >= this.shootInterval) {
            if (this.hasZombieInRow()) {
                this.shoot();
                this.lastShootTime = now;
            }
        }
    }

    hasZombieInRow() {
        const row = Math.floor(this.y / CELL_SIZE);
        return zombies.some(zombie => {
            const zombieRow = Math.floor(zombie.y / CELL_SIZE);
            return zombieRow === row && zombie.x > this.x && zombie.health > 0;
        });
    }

    shoot() {
        const bullet = {
            x: this.centerX + 30,
            y: this.centerY,
            speed: 8,
            damage: 20,
            id: Date.now()
        };
        bullets.push(bullet);
    }
}

class Zombie {
    constructor(row) {
        this.x = canvas.width + 50;
        this.y = row * CELL_SIZE + 5;
        this.width = 60;
        this.height = 80;
        this.speed = 0.5;
        this.health = 100;
        this.maxHealth = 100;
        this.row = row;
        this.id = ++zombieId;
        this.isAlive = true;
    }

    update() {
        if (!this.isAlive) return;
        
        this.x -= this.speed;
        
        if (this.x < -this.width) {
            this.isAlive = false;
            gameOver();
        }

        this.checkPlantCollision();
    }

    checkPlantCollision() {
        const zombieLeft = this.x;
        const zombieRight = this.x + this.width;
        const zombieTop = this.y;
        const zombieBottom = this.y + this.height;

        for (let plant of plants) {
            const plantLeft = plant.x;
            const plantRight = plant.x + plant.width;
            const plantTop = plant.y;
            const plantBottom = plant.y + plant.height;

            if (zombieRight > plantLeft && zombieLeft < plantRight &&
                zombieBottom > plantTop && zombieTop < plantBottom) {
                this.speed = 0;
                return;
            }
        }
        
        this.speed = 0.5;
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    draw() {
        if (!this.isAlive) return;

        ctx.save();

        // 如果僵尸图片加载完成，使用真实图片
        if (ZOMBIE_IMAGE && ZOMBIE_IMAGE.complete) {
            ctx.drawImage(ZOMBIE_IMAGE, this.x, this.y, this.width, this.height);
        } else {
            // 备用方案：绘制Canvas僵尸
            ctx.fillStyle = COLORS.zombie;
            ctx.fillRect(this.x + 15, this.y + 40, 30, 40);

            ctx.fillStyle = '#2d2d2d';
            ctx.fillRect(this.x + 10, this.y + 35, 40, 8);

            ctx.beginPath();
            ctx.arc(this.x + 30, this.y + 25, 20, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.zombie;
            ctx.fill();

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(this.x + 22, this.y + 22, 6, 6);
            ctx.fillRect(this.x + 32, this.y + 22, 6, 6);

            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(this.x + 25, this.y + 30, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 35, this.y + 30, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(this.x + 25, this.y + 38);
            ctx.lineTo(this.x + 30, this.y + 42);
            ctx.lineTo(this.x + 35, this.y + 38);
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#cd853f';
            ctx.fillRect(this.x + 5, this.y + 55, 15, 25);
            ctx.fillRect(this.x + 40, this.y + 55, 15, 25);

            ctx.fillStyle = '#8b4513';
            ctx.fillRect(this.x + 10, this.y + 75, 8, 10);
            ctx.fillRect(this.x + 42, this.y + 75, 8, 10);
        }

        this.drawHealthBar();

        ctx.restore();
    }

    drawHealthBar() {
        const barWidth = 50;
        const barHeight = 6;
        const barX = this.x + 5;
        const barY = this.y - 10;

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

function drawBackground() {
    // 如果背景图片加载完成，使用真实背景
    if (BACKGROUND_IMAGE && BACKGROUND_IMAGE.complete) {
        ctx.drawImage(BACKGROUND_IMAGE, 0, 0, canvas.width, canvas.height);
    } else {
        // 备用方案：绘制格子背景
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                
                ctx.fillStyle = (row + col) % 2 === 0 ? COLORS.grass : COLORS.grassDark;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
}

function drawSuns() {
    suns.forEach(sunObj => {
        if (sunObj.collected) return;

        ctx.save();
        
        // 如果阳光图片加载完成，使用真实图片
        if (SUN_IMAGE && SUN_IMAGE.complete) {
            ctx.drawImage(SUN_IMAGE, sunObj.x - 20, sunObj.y - 20, 40, 40);
        } else {
            // 备用方案：绘制Canvas阳光
            ctx.beginPath();
            ctx.arc(sunObj.x, sunObj.y, 18, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.fill();
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(sunObj.x, sunObj.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffec8b';
            ctx.fill();

            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const petalX = sunObj.x + Math.cos(angle) * 22;
                const petalY = sunObj.y + Math.sin(angle) * 22;
                
                ctx.beginPath();
                ctx.ellipse(petalX, petalY, 4, 8, angle, 0, Math.PI * 2);
                ctx.fillStyle = '#ffd700';
                ctx.fill();
            }
        }

        ctx.restore();
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.bullet;
        ctx.fill();
        ctx.strokeStyle = '#228b22';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(bullet.x - 2, bullet.y - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#90ee90';
        ctx.fill();

        ctx.restore();
    });
}

function updateSuns() {
    suns = suns.filter(sunObj => {
        if (sunObj.collected) return false;
        
        sunObj.y += sunObj.speed;
        if (sunObj.y >= sunObj.targetY) {
            sunObj.speed = 0;
        }
        
        return true;
    });
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.speed;
        
        if (bullet.x > canvas.width) {
            return false;
        }

        for (let zombie of zombies) {
            if (!zombie.isAlive) continue;
            
            const zombieLeft = zombie.x;
            const zombieRight = zombie.x + zombie.width;
            const zombieTop = zombie.y + 20;
            const zombieBottom = zombie.y + 60;

            if (bullet.x >= zombieLeft && bullet.x <= zombieRight &&
                bullet.y >= zombieTop && bullet.y <= zombieBottom) {
                zombie.takeDamage(bullet.damage);
                return false;
            }
        }
        
        return true;
    });
}

function updateZombies() {
    zombies.forEach(zombie => zombie.update());
    zombies = zombies.filter(zombie => zombie.isAlive);
}

function updatePlants() {
    plants.forEach(plant => plant.update());
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawGrid();
    
    updatePlants();
    updateBullets();
    updateZombies();
    updateSuns();
    
    plants.forEach(plant => plant.draw());
    drawBullets();
    zombies.forEach(zombie => zombie.draw());
    drawSuns();
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

function selectPlant(plantType) {
    const cost = PLANT_COSTS[plantType];
    
    if (sun < cost) {
        alert('阳光不足！');
        return;
    }
    
    selectedPlant = plantType;
    
    document.querySelectorAll('.plant-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-plant="${plantType}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    document.getElementById('selected-plant').textContent = `已选择: ${plantType === 'sunflower' ? '向日葵' : '豌豆射手'}`;
}

// 拖拽开始处理
function handleDragStart(event) {
    const plantCard = event.target.closest('.plant-card');
    if (!plantCard) return;
    
    const plantType = plantCard.dataset.plant;
    const cost = PLANT_COSTS[plantType];
    
    if (sun < cost) {
        event.preventDefault();
        alert('阳光不足！');
        return;
    }
    
    selectedPlant = plantType;
    
    // 设置拖拽数据
    event.dataTransfer.setData('text/plain', plantType);
    event.dataTransfer.effectAllowed = 'move';
    
    // 添加拖拽样式
    plantCard.classList.add('selected');
    
    // 更新状态显示
    document.getElementById('selected-plant').textContent = `正在拖拽: ${plantType === 'sunflower' ? '向日葵' : '豌豆射手'}`;
}

// 拖拽结束处理
function handleDragEnd(event) {
    const plantCard = event.target.closest('.plant-card');
    if (plantCard) {
        plantCard.classList.remove('selected');
    }
    
    // 移除canvas的拖拽样式
    canvas.classList.remove('drag-over');
    
    // 重置状态显示
    document.getElementById('selected-plant').textContent = '选择植物';
}

// 拖拽经过处理
function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    canvas.classList.add('drag-over');
}

// 拖拽放下处理
function handleDrop(event) {
    event.preventDefault();
    canvas.classList.remove('drag-over');
    
    const plantType = event.dataTransfer.getData('text/plain');
    if (!plantType || !selectedPlant) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    
    const plantX = col * CELL_SIZE + 5;
    const plantY = row * CELL_SIZE + 5;
    
    const hasPlant = plants.some(plant => 
        Math.abs(plant.x - plantX) < 5 && Math.abs(plant.y - plantY) < 5
    );
    
    if (hasPlant) {
        alert('这里已经有植物了！');
        return;
    }
    
    const cost = PLANT_COSTS[selectedPlant];
    if (sun < cost) {
        alert('阳光不足！');
        return;
    }
    
    sun -= cost;
    updateSunDisplay();
    
    if (selectedPlant === 'sunflower') {
        plants.push(new Sunflower(plantX, plantY));
    } else if (selectedPlant === 'peashooter') {
        plants.push(new Peashooter(plantX, plantY));
    }
    
    // 重置状态
    selectedPlant = null;
    document.getElementById('selected-plant').textContent = '选择植物';
    
    updatePlantCards();
}

function collectSun(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    suns.forEach(sunObj => {
        if (sunObj.collected) return;
        
        const dist = Math.sqrt(Math.pow(x - sunObj.x, 2) + Math.pow(y - sunObj.y, 2));
        if (dist <= 25) {
            sun += sunObj.value;
            sunObj.collected = true;
            updateSunDisplay();
        }
    });
}

function updateSunDisplay() {
    document.getElementById('sun-value').textContent = sun;
    updatePlantCards();
}

function updatePlantCards() {
    document.querySelectorAll('.plant-card').forEach(card => {
        const plantType = card.dataset.plant;
        const cost = PLANT_COSTS[plantType];
        
        if (sun < cost) {
            card.classList.add('disabled');
        } else {
            card.classList.remove('disabled');
        }
    });
}

function startWave() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const row = Math.floor(Math.random() * ROWS);
            zombies.push(new Zombie(row));
        }, i * 1500);
    }
}

function resetGame() {
    sun = 50;
    selectedPlant = null;
    plants = [];
    zombies = [];
    bullets = [];
    suns = [];
    sunFlowerId = 0;
    peashooterId = 0;
    zombieId = 0;
    
    updateSunDisplay();
    document.getElementById('selected-plant').textContent = '选择植物';
    
    document.querySelectorAll('.plant-card').forEach(card => {
        card.classList.remove('selected');
    });
}

function gameOver() {
    alert('僵尸吃掉了你的脑子！游戏结束！');
    resetGame();
}

canvas.addEventListener('click', (event) => {
    collectSun(event);
});

// 添加拖拽离开事件处理
canvas.addEventListener('dragleave', (event) => {
    canvas.classList.remove('drag-over');
});

updatePlantCards();
gameLoop();