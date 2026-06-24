const GRID_SIZE = 4;
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;

let pieces = [];
let emptyIndex = TOTAL_PIECES - 1;
let moves = 0;
let isWin = false;
let currentImage = null;

const grid = document.getElementById('puzzle-grid');
const movesDisplay = document.getElementById('moves');
const winMessage = document.getElementById('win-message');
const shuffleBtn = document.getElementById('shuffle-btn');
const resetBtn = document.getElementById('reset-btn');

const IMAGE_URL = 'img/hamster.jpg';

function loadImage() {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            console.log('✅ Фото загружено!', img.width, 'x', img.height);
            resolve(img);
        };
        img.onerror = () => {
            console.warn('❌ Не удалось загрузить картинку');
            resolve(null);
        };
        img.src = IMAGE_URL;
    });
}

function initPuzzle(img) {
    grid.innerHTML = '';
    grid.classList.remove('win');
    winMessage.classList.add('hidden');
    moves = 0;
    movesDisplay.textContent = 'Ходов: 0';
    isWin = false;

    pieces = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
    emptyIndex = TOTAL_PIECES - 1;
    
    shufflePuzzle();

    grid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

    renderPuzzle(img);
}

function shufflePuzzle() {
    for (let i = 0; i < 200; i++) {
        const neighbors = getNeighbors(emptyIndex);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        swapPieces(emptyIndex, randomNeighbor);
    }
    if (isSolved()) {
        [pieces[0], pieces[1]] = [pieces[1], pieces[0]];
        emptyIndex = pieces.indexOf(TOTAL_PIECES - 1);
    }
}

function getNeighbors(index) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const neighbors = [];
    
    if (row > 0) neighbors.push(index - GRID_SIZE);
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
    if (col > 0) neighbors.push(index - 1);
    if (col < GRID_SIZE - 1) neighbors.push(index + 1);
    
    return neighbors;
}

function swapPieces(i, j) {
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    if (emptyIndex === i) emptyIndex = j;
    else if (emptyIndex === j) emptyIndex = i;
}

function isSolved() {
    return pieces.every((val, idx) => val === idx);
}

function renderPuzzle(img) {
    grid.innerHTML = '';

    // 🔥 НОВЫЙ ПОДХОД: используем canvas для идеальной нарезки
    if (img) {
        // Создаём canvas, чтобы нарезать картинку на кусочки
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Размер одного кусочка
        const pieceSize = 100 / GRID_SIZE;
        
        pieces.forEach((pieceIndex, position) => {
            const cell = document.createElement('div');
            cell.className = 'puzzle-piece';
            
            if (pieceIndex === TOTAL_PIECES - 1) {
                cell.classList.add('empty');
                cell.dataset.index = position;
                grid.appendChild(cell);
                return;
            }

            // Вычисляем позицию кусочка в исходной картинке
            const row = Math.floor(pieceIndex / GRID_SIZE);
            const col = pieceIndex % GRID_SIZE;
            
            // Рисуем кусочек на canvas
            const pieceCanvas = document.createElement('canvas');
            const pCtx = pieceCanvas.getContext('2d');
            
            // 🔥 Берём точный фрагмент картинки
            const sourceX = col * (img.width / GRID_SIZE);
            const sourceY = row * (img.height / GRID_SIZE);
            const sourceW = img.width / GRID_SIZE;
            const sourceH = img.height / GRID_SIZE;
            
            pieceCanvas.width = sourceW;
            pieceCanvas.height = sourceH;
            
            pCtx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
            
            // Превращаем canvas в картинку
            cell.style.backgroundImage = `url(${pieceCanvas.toDataURL('image/jpeg')})`;
            cell.style.backgroundSize = 'cover';
            cell.style.backgroundPosition = 'center';
            
            cell.dataset.index = position;
            cell.addEventListener('click', () => onCellClick(position));
            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                onCellClick(position);
            });
            
            grid.appendChild(cell);
        });
    } else {
        // Заглушка если нет фото
        pieces.forEach((_, position) => {
            const cell = document.createElement('div');
            cell.className = 'puzzle-piece';
            if (position === emptyIndex) {
                cell.classList.add('empty');
            }
            cell.dataset.index = position;
            cell.addEventListener('click', () => onCellClick(position));
            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                onCellClick(position);
            });
            grid.appendChild(cell);
        });
    }
    
    if (isSolved() && !isWin) {
        isWin = true;
        grid.classList.add('win');
        winMessage.classList.remove('hidden');
    }
}

function onCellClick(index) {
    if (isWin) return;
    
    const neighbors = getNeighbors(emptyIndex);
    if (neighbors.includes(index)) {
        swapPieces(index, emptyIndex);
        moves++;
        movesDisplay.textContent = `Ходов: ${moves}`;
        renderPuzzle(currentImage);
    }
}

function startGame(img) {
    currentImage = img;
    initPuzzle(img);
}

shuffleBtn.addEventListener('click', () => {
    if (currentImage) {
        shufflePuzzle();
        renderPuzzle(currentImage);
        moves = 0;
        movesDisplay.textContent = 'Ходов: 0';
        grid.classList.remove('win');
        winMessage.classList.add('hidden');
        isWin = false;
    }
});

resetBtn.addEventListener('click', () => {
    if (currentImage) {
        initPuzzle(currentImage);
    }
});

async function main() {
    const img = await loadImage();
    startGame(img);
}

main();
