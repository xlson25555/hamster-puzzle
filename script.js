// Настройки
const GRID_SIZE = 4; // 4x4 = 16 кусочков
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;

let pieces = [];
let emptyIndex = TOTAL_PIECES - 1;
let moves = 0;
let isWin = false;
let imageLoaded = false;

// DOM элементы
const grid = document.getElementById('puzzle-grid');
const movesDisplay = document.getElementById('moves');
const winMessage = document.getElementById('win-message');
const shuffleBtn = document.getElementById('shuffle-btn');
const resetBtn = document.getElementById('reset-btn');

// 📌 ЗДЕСЬ ЗАМЕНИТЕ НА СВОЁ ФОТО!
// Положите фото в папку img/ и укажите путь:
const IMAGE_URL = 'img/hamster.jpg';
// Если фото нет — используем встроенную заглушку с хомячком
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f5e6ca" width="400" height="400"/%3E%3Ccircle cx="200" cy="180" r="80" fill="%23d4a574"/%3E%3Ccircle cx="160" cy="160" r="12" fill="%233d2b1f"/%3E%3Ccircle cx="240" cy="160" r="12" fill="%233d2b1f"/%3E%3Ccircle cx="200" cy="180" r="18" fill="%23b8926a"/%3E%3Cellipse cx="170" cy="140" rx="10" ry="14" fill="%23ffb6c1"/%3E%3Cellipse cx="230" cy="140" rx="10" ry="14" fill="%23ffb6c1"/%3E%3Ccircle cx="200" cy="250" r="30" fill="%23e8c8a0"/%3E%3Crect x="170" y="270" width="60" height="40" rx="5" fill="%23ff6b6b"/%3E%3Crect x="175" y="275" width="12" height="12" fill="%23fff"/%3E%3Crect x="213" y="275" width="12" height="12" fill="%23fff"/%3E%3C/svg%3E';

// Загружаем изображение
function loadImage() {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageLoaded = true;
            resolve(img);
        };
        img.onerror = () => {
            console.warn('Не удалось загрузить картинку, используем заглушку');
            const fallbackImg = new Image();
            fallbackImg.src = FALLBACK_IMAGE;
            fallbackImg.onload = () => resolve(fallbackImg);
            fallbackImg.onerror = () => resolve(null);
        };
        img.src = IMAGE_URL;
    });
}

// Создаём пазл
function initPuzzle(img) {
    grid.innerHTML = '';
    grid.classList.remove('win');
    winMessage.classList.add('hidden');
    moves = 0;
    movesDisplay.textContent = 'Ходов: 0';
    isWin = false;

    // Создаём массив индексов [0, 1, 2, ..., 15]
    pieces = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
    emptyIndex = TOTAL_PIECES - 1;
    
    // Перемешиваем (гарантируем решаемость)
    shufflePuzzle();

    // Устанавливаем размеры сетки
    grid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

    // Рендерим
    renderPuzzle(img);
}

// Перемешивание с проверкой на решаемость
function shufflePuzzle() {
    // Делаем 200 случайных ходов
    for (let i = 0; i < 200; i++) {
        const neighbors = getNeighbors(emptyIndex);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        swapPieces(emptyIndex, randomNeighbor);
    }
    // Убеждаемся, что пазл не собран
    if (isSolved()) {
        // Меняем местами два первых элемента
        [pieces[0], pieces[1]] = [pieces[1], pieces[0]];
        emptyIndex = pieces.indexOf(TOTAL_PIECES - 1);
    }
}

// Получить индексы соседей
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

// Поменять местами два элемента
function swapPieces(i, j) {
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    if (emptyIndex === i) emptyIndex = j;
    else if (emptyIndex === j) emptyIndex = i;
}

// Проверка на победу
function isSolved() {
    return pieces.every((val, idx) => val === idx);
}

// Рендерим сетку
function renderPuzzle(img) {
    grid.innerHTML = '';
    
    pieces.forEach((pieceIndex, position) => {
        const cell = document.createElement('div');
        cell.className = 'puzzle-piece';
        
        if (pieceIndex === TOTAL_PIECES - 1) {
            cell.classList.add('empty');
        } else if (img) {
            // Вычисляем позицию кусочка в исходной картинке
            const row = Math.floor(pieceIndex / GRID_SIZE);
            const col = pieceIndex % GRID_SIZE;
            const pieceSize = 100 / GRID_SIZE;
            
            cell.style.backgroundImage = `url(${img.src})`;
            cell.style.backgroundSize = `${GRID_SIZE * 100}%`;
            cell.style.backgroundPosition = `-${col * pieceSize}% -${row * pieceSize}%`;
        }
        
        cell.dataset.index = position;
        cell.addEventListener('click', () => onCellClick(position));
        cell.addEventListener('touchend', (e) => {
            e.preventDefault();
            onCellClick(position);
        });
        
        grid.appendChild(cell);
    });
    
    // Проверяем победу
    if (isSolved() && !isWin) {
        isWin = true;
        grid.classList.add('win');
        winMessage.classList.remove('hidden');
    }
}

// Обработчик клика по клетке
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

// Обновить игру с новой картинкой
let currentImage = null;

function startGame(img) {
    currentImage = img;
    initPuzzle(img);
}

// Кнопки
shuffleBtn.addEventListener('click', () => {
    if (currentImage) {
        // Перемешиваем без сброса ходов
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

// Запуск
async function main() {
    const img = await loadImage();
    startGame(img);
}

main();

// Для отладки — доступ к API в консоли
window.__puzzle = { pieces, emptyIndex, getNeighbors, swapPieces, isSolved, renderPuzzle };
