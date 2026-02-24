// ============================
// 타로카드 마스터 - app.js (78장 버전)
// ============================

// === 전역 상태 ===
let appMode = 'generator';
let currentFormat = 'youtube';
let currentBg = 'bg1';
let currentTextColor = '#FFFFFF';
let currentStyle = 'elegant';

// 리딩 모드 상태
let readingCards = [];
let selectedCardsCount = 0;
let readingStep = 'idle';

// === 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setBg('bg1');
    setStyle('elegant');
    updatePreview();
});

// === 모드 전환 ===
function setMode(mode) {
    appMode = mode;
    document.getElementById('mode-gen').classList.toggle('active', mode === 'generator');
    document.getElementById('mode-read').classList.toggle('active', mode === 'reading');

    document.getElementById('generator-controls').style.display = mode === 'generator' ? 'block' : 'none';
    document.getElementById('reading-controls').style.display = mode === 'reading' ? 'block' : 'none';

    document.getElementById('canvas-container').style.display = mode === 'generator' ? 'block' : 'none';
    document.getElementById('reading-container').style.display = mode === 'reading' ? 'flex' : 'none';

    if (mode === 'reading') {
        initReadingSpread();
    }
    updatePreview();
}

// === 생성기 기능 ===
function setFormat(format) {
    currentFormat = format;
    const container = document.getElementById('canvas-container');
    const btnYoutube = document.getElementById('btn-youtube');
    const btnReels = document.getElementById('btn-reels');

    if (btnYoutube) btnYoutube.classList.toggle('active', format === 'youtube');
    if (btnReels) btnReels.classList.toggle('active', format === 'reels');

    if (container) {
        container.classList.remove('youtube-format', 'reels-format');
        container.classList.add(format + '-format');
    }
    updatePreview();
}

function setStyle(style) {
    currentStyle = style;
    const hookDisplay = document.getElementById('hook-display');
    hookDisplay.classList.remove('elegant-style', 'bold-style', 'mystic-style');
    hookDisplay.classList.add(style + '-style');
    updatePreview();
}

function setBg(bg) {
    currentBg = bg;
    const bgImage = document.getElementById('bg-image');
    if (!bgImage) return;

    document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('active'));
    const targetOpt = document.querySelector(`.bg-option[data-bg="${bg}"]`);
    if (targetOpt) targetOpt.classList.add('active');

    const bgMap = {
        'bg1': 'assets/bg-original.png',
        'bg2': 'assets/bg-thumbnail.png',
        'bg3': 'assets/bg-reels.png',
        'bg4': 'assets/bg-dungeon.png'
    };

    if (typeof ASSETS !== 'undefined' && ASSETS[bg]) {
        bgImage.src = ASSETS[bg];
    } else if (bgMap[bg]) {
        bgImage.src = bgMap[bg];
    }
}

function triggerCustomBg() { document.getElementById('custom-bg-input').click(); }
function handleCustomBg(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('bg-image').src = e.target.result;
        currentBg = 'custom';
    };
    reader.readAsDataURL(file);
}

function updatePreview() {
    const hookText = document.getElementById('hook-text').value;

    // 생성기 모드 업데이트
    const hookDisplay = document.getElementById('hook-display');
    if (hookDisplay) {
        hookDisplay.innerHTML = hookText.replace(/\n/g, '<br>');
        hookDisplay.style.color = currentTextColor;
    }

    // 리딩 모드 훅 업데이트 (마녀 스타일)
    const readingHookDisplay = document.getElementById('reading-hook-display');
    if (readingHookDisplay) {
        readingHookDisplay.innerHTML = hookText.replace(/\n/g, '<br>');
    }

    if (appMode !== 'generator') return;

    const fontSizeSlider = document.getElementById('font-size-slider');
    const positionSlider = document.getElementById('position-slider');
    const vignetteToggle = document.getElementById('toggle-vignette');
    const particlesToggle = document.getElementById('toggle-particles');

    if (fontSizeSlider) {
        const fontSize = fontSizeSlider.value;
        const scale = currentFormat === 'youtube' ? 0.6 : 0.45;
        hookDisplay.style.fontSize = (fontSize * scale) + 'px';
        const labelFont = document.getElementById('label-font');
        if (labelFont) labelFont.textContent = fontSize + '%';
    }

    if (positionSlider) {
        const position = positionSlider.value;
        const contentLayer = document.querySelector('.content-layer');
        const basePadding = currentFormat === 'youtube' ? 60 : 50; // Updated base padding for better layout
        const moveFactor = currentFormat === 'youtube' ? 2 : 5;
        if (contentLayer) contentLayer.style.paddingBottom = (basePadding + (position * moveFactor)) + 'px';
        const labelPos = document.getElementById('label-pos');
        if (labelPos) labelPos.textContent = position;
    }

    const vignetteOverlay = document.getElementById('vignette-overlay');
    if (vignetteOverlay && vignetteToggle) {
        vignetteOverlay.style.display = vignetteToggle.checked ? 'block' : 'none';
    }

    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer && particlesToggle) {
        particlesContainer.style.display = particlesToggle.checked ? 'block' : 'none';
    }
}

// === 리딩 기능 (인터랙션) ===
function initReadingSpread() {
    const spread = document.getElementById('card-spread');
    if (spread) spread.innerHTML = '';
    selectedCardsCount = 0;
    readingStep = 'idle';
    document.getElementById('reading-result-panel').style.display = 'none';
    const resultBanner = document.getElementById('reading-result-card-name');
    if (resultBanner) {
        resultBanner.classList.remove('show');
        resultBanner.textContent = '';
    }
    document.getElementById('btn-start-reading').disabled = false;
    document.getElementById('countdown-timer').style.display = 'none';

    // 4장의 카드를 생성 (이중 1장 선택)
    for (let i = 0; i < 4; i++) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'tarot-card';

        // 인력 노동의 디테일: 무작위 회전 및 오프셋으로 손배치 느낌 부여
        const randomRot = Math.random() * 4 - 2; // -2~2도
        const randomY = Math.random() * 10 - 5; // -5~5px
        cardContainer.style.transform = `rotate(${randomRot}deg) translateY(${randomY}px)`;

        cardContainer.innerHTML = `
            <div class="card-inner">
                <div class="card-back-face">
                    <div class="card-number-reveal"></div>
                </div>
                <div class="card-front">
                    <img src="" alt="타로 카드">
                </div>
            </div>
        `;
        cardContainer.onclick = () => pickCard(cardContainer);
        spread.appendChild(cardContainer);
    }
}

function startReadingFlow() {
    if (readingStep !== 'idle') return;

    readingStep = 'counting';
    document.getElementById('btn-start-reading').disabled = true;
    const timerEl = document.getElementById('countdown-timer');
    timerEl.style.display = 'block';

    let count = 5;
    timerEl.textContent = count;

    // 카드 애니메이션 효과 (셔플 느낌 강화)
    const cards = document.querySelectorAll('.tarot-card');
    cards.forEach((c, idx) => {
        c.style.transition = 'all 0.5s ease-in-out';
        c.style.transform = `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 20 - 10}deg) scale(1.1)`;
    });

    const interval = setInterval(() => {
        count--;
        timerEl.textContent = count;

        // 셔플 중 지속적인 미세 움직임
        cards.forEach((c) => {
            c.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) rotate(${Math.random() * 10 - 5}deg) scale(1.05)`;
        });

        if (count <= 0) {
            clearInterval(interval);
            timerEl.style.display = 'none';
            revealShuffledNumbers();
        }
    }, 1000);
}

function revealShuffledNumbers() {
    readingStep = 'picking';
    const cards = document.querySelectorAll('.tarot-card');
    let numbers = [1, 2, 3, 4].sort(() => Math.random() - 0.5);

    cards.forEach((card, i) => {
        const numEl = card.querySelector('.card-number-reveal');
        numEl.textContent = numbers[i];
        card.classList.add('show-number');
        card.dataset.number = numbers[i];
    });
}

function pickCard(card) {
    if (readingStep !== 'picking') return;
    if (selectedCardsCount >= 1) return; // 1장만 선택하도록 제한

    selectedCardsCount++;

    // 다른 카드들 흐리게 만들기
    const allCards = document.querySelectorAll('.tarot-card');
    allCards.forEach(c => {
        if (c !== card) {
            c.classList.add('unselected');
        } else {
            c.classList.add('selected-focus');
        }
    });

    // 78장 중 랜덤 선택 + 정/역방향 랜덤 결정
    const randomIdx = Math.floor(Math.random() * TAROT_DATA.length);
    const cardData = TAROT_DATA[randomIdx];
    const isReversed = Math.random() > 0.5;

    const imgEl = card.querySelector('.card-front img');
    imgEl.src = getCardImageUrl(cardData);

    if (isReversed) {
        imgEl.style.transform = 'rotate(180deg)';
    }

    card.classList.add('flipped');

    // 결과 표시
    setTimeout(() => {
        showInterpretations(cardData, isReversed);
    }, 800);
}

function showInterpretations(cardData, isReversed) {
    readingStep = 'revealed';
    const resultPanel = document.getElementById('reading-result-panel');
    const resultText = document.getElementById('reading-text');
    const resultBanner = document.getElementById('reading-result-card-name');

    resultPanel.style.display = 'block';

    if (resultBanner) {
        const pureName = cardData.name.split('(')[1] ? cardData.name.split('(')[1].replace(')', '') : cardData.name;
        resultBanner.textContent = pureName + (isReversed ? ' (역방향)' : ' (정방향)');
        resultBanner.classList.add('show');
    }

    const interpretation = getInterpretation(cardData, isReversed);
    resultText.innerHTML = interpretation;
}

function resetReading() {
    initReadingSpread();
}

// === 유틸리티 ===
function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        const size = 2 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        container.appendChild(particle);
    }
}
