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
let selectedCategory = 'love'; // 기본: 애정운

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
const TOTAL_FAN_CARDS = 22; // 부채꼴에 표시할 카드 수

function initReadingSpread() {
    const spread = document.getElementById('card-spread');
    if (spread) {
        spread.innerHTML = '';
        spread.style.opacity = '1'; // 부채꼴 다시 보이게 리셋
    }
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
    const pickCounter = document.getElementById('pick-counter');
    if (pickCounter) pickCounter.style.display = 'none';
    readingCards = [];

    // 슬롯 초기화
    for (let s = 0; s < 3; s++) {
        const slot = document.getElementById('slot-' + s);
        if (slot) {
            slot.classList.remove('filled');
            slot.innerHTML = `<span class="slot-number">${s + 1}</span><span class="slot-label">${['원인', '현재상황', '방향'][s]}</span>`;
        }
    }

    // 22장의 카드를 부채꼴(fan/arc)로 생성
    for (let i = 0; i < TOTAL_FAN_CARDS; i++) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'tarot-card';
        cardContainer.dataset.index = i;

        // 부채꼴 초기 위치: 모두 중앙에 겹쳐진 상태
        cardContainer.style.transform = `rotate(0deg)`;
        cardContainer.style.opacity = '0';

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

function fanOutCards() {
    const spread = document.getElementById('card-spread');
    const cards = document.querySelectorAll('.tarot-card');
    const totalCards = cards.length;

    const containerWidth = spread.offsetWidth;
    const containerHeight = spread.offsetHeight;

    const centerX = containerWidth / 2;
    const centerY = containerHeight + 100;
    const radius = 520;

    const totalAngle = 80;
    const startAngle = -90 - totalAngle / 2;
    const angleStep = totalAngle / (totalCards - 1);

    cards.forEach((card, i) => {
        const angleDeg = startAngle + (angleStep * i);
        const angleRad = angleDeg * (Math.PI / 180);

        const x = centerX + radius * Math.cos(angleRad) - 58; // 58 = 117/2
        const y = centerY + radius * Math.sin(angleRad) - 93; // 93 = 186/2
        const cardRotation = angleDeg + 90;

        const delay = i * 30;

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
            card.style.transform = `rotate(${cardRotation}deg)`;
            card.style.zIndex = i;
            // CSS 변수로 hover 시 원래 위치 기억
            card.style.setProperty('--tx', '0px');
            card.style.setProperty('--ty', '0px');
            card.style.setProperty('--rot', `${cardRotation}deg`);
        }, delay);
    });
}

function startReadingFlow() {
    if (readingStep !== 'idle') return;

    readingStep = 'counting';
    document.getElementById('btn-start-reading').disabled = true;
    const timerEl = document.getElementById('countdown-timer');
    timerEl.style.display = 'block';

    let count = 3;
    timerEl.textContent = count;

    // 셔플 효과: 카드가 중앙에 모여들었다가 흩어지는 애니메이션
    const spread = document.getElementById('card-spread');
    const cards = document.querySelectorAll('.tarot-card');
    const cx = spread.offsetWidth / 2 - 58;
    const cy = spread.offsetHeight / 2 - 93;

    cards.forEach((c) => {
        c.style.opacity = '1';
        c.style.transition = 'all 0.4s ease-in-out';
        c.style.left = `${cx + Math.random() * 60 - 30}px`;
        c.style.top = `${cy + Math.random() * 60 - 30}px`;
        c.style.transform = `rotate(${Math.random() * 360}deg)`;
    });

    const interval = setInterval(() => {
        count--;
        timerEl.textContent = count;

        // 셔플 중 미세 움직임
        cards.forEach((c) => {
            c.style.left = `${cx + Math.random() * 40 - 20}px`;
            c.style.top = `${cy + Math.random() * 40 - 20}px`;
            c.style.transform = `rotate(${Math.random() * 360}deg)`;
        });

        if (count <= 0) {
            clearInterval(interval);
            timerEl.style.display = 'none';
            spreadFanCards();
        }
    }, 1000);
}

function spreadFanCards() {
    readingStep = 'picking';
    const cards = document.querySelectorAll('.tarot-card');

    // 부채꼴로 부드럽게 전개
    cards.forEach((c) => {
        c.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });

    fanOutCards();

    // 카운터 표시
    const pickCounter = document.getElementById('pick-counter');
    if (pickCounter) {
        pickCounter.style.display = 'block';
        pickCounter.textContent = '직감으로 카드를 선택하세요 (0/3)';
    }
}

function pickCard(card) {
    if (readingStep !== 'picking') return;
    if (selectedCardsCount >= 3) return;
    if (card.classList.contains('picked')) return;

    selectedCardsCount++;

    // 78장 중 랜덤 선택 + 정/역방향 랜덤 결정
    const randomIdx = Math.floor(Math.random() * TAROT_DATA.length);
    const cardData = TAROT_DATA[randomIdx];
    const isReversed = Math.random() > 0.5;

    // 선택된 카드 정보 저장
    readingCards.push({
        data: cardData,
        isReversed: isReversed,
        position: selectedCardsCount
    });

    // 카드를 부채꼴에서 제거 (애니메이션)
    card.classList.add('picked');

    // 슬롯에 카드 이미지 배치
    const slotIdx = selectedCardsCount - 1;
    const slot = document.getElementById('slot-' + slotIdx);
    if (slot) {
        slot.classList.add('filled');
        const imgUrl = getCardImageUrl(cardData);
        const slotImg = document.createElement('img');
        slotImg.src = imgUrl;
        slotImg.alt = cardData.name;
        if (isReversed) {
            slotImg.style.transform = 'rotate(180deg)';
        }
        // 기존 내용 제거 후 이미지 넣기
        const slotLabel = slot.querySelector('.slot-label');
        const labelText = slotLabel ? slotLabel.textContent : '';
        slot.innerHTML = '';
        slot.appendChild(slotImg);
        // 라벨 다시 추가
        const newLabel = document.createElement('span');
        newLabel.className = 'slot-label';
        newLabel.textContent = labelText;
        slot.appendChild(newLabel);
    }

    // 카운터 업데이트
    const pickCounter = document.getElementById('pick-counter');
    if (pickCounter) {
        const labels = ['원인', '현재상황', '앞으로의 방향'];
        if (selectedCardsCount < 3) {
            pickCounter.textContent = `✨ ${labels[slotIdx]} 카드 선택 완료! 다음은 ${labels[selectedCardsCount]}입니다 (${selectedCardsCount}/3)`;
        } else {
            pickCounter.textContent = '✨ 모든 카드가 선택되었습니다. 카드를 해석합니다...';
        }
    }

    // 3장을 모두 뽑았을 때 결과 표시
    if (selectedCardsCount === 3) {
        // 나머지 카드들 서서히 사라지기
        setTimeout(() => {
            const allCards = document.querySelectorAll('.tarot-card');
            allCards.forEach(c => {
                if (!c.classList.contains('picked')) {
                    c.classList.add('unselected');
                }
            });
        }, 300);

        setTimeout(() => {
            // 부채꼴 카드 전체 숨기기
            const spread = document.getElementById('card-spread');
            if (spread) spread.style.opacity = '0';
            const counter = document.getElementById('pick-counter');
            if (counter) counter.style.display = 'none';

            showInterpretations();
        }, 1500);
    }
}

function showInterpretations() {
    readingStep = 'revealed';
    const resultPanel = document.getElementById('reading-result-panel');
    const resultText = document.getElementById('reading-text');
    const question = document.getElementById('hook-text').value;
    const catNames = {
        love: '애정운', money: '금전운', reunion: '재회운',
        career: '직업운', health: '건강운', general: '종합운'
    };
    const catName = catNames[selectedCategory] || '종합운';

    resultPanel.style.display = 'block';

    let html = `
        <div class="professional-reading">
            <p class="reading-intro">"원인과 현재상황, 그리고 앞으로의 방향을 보여드리겠습니다. 다 보여드린 후, 마지막으로 제가 조언을 해드리겠습니다."</p>
    `;

    readingCards.forEach((item, idx) => {
        const posName = idx === 0 ? '원인' : (idx === 1 ? '현재상황' : '앞으로의 방향');
        const posClass = idx === 0 ? 'past' : (idx === 1 ? 'present' : 'future');
        const card = item.data;
        const meaning = item.isReversed ? card.reversed : card.upright;
        const pureName = card.name.split('(')[1] ? card.name.split('(')[1].replace(')', '') : card.name;
        const direction = item.isReversed ? '역방향' : '정방향';

        html += `
            <div class="reading-entry ${posClass}">
                <div class="entry-header">
                    <span class="entry-pos">[${posName}]</span>
                    <span class="entry-card">${pureName} (${direction})</span>
                </div>
                <div class="entry-content">
                    ${getHumanExplanation(posName, pureName, meaning, item.isReversed, selectedCategory)}
                </div>
            </div>
        `;
    });

    html += `
            <div class="reading-summary">
                <div class="summary-label">✨ 마스터의 조언</div>
                <p class="summary-text">${generateHumanAdvice(readingCards, selectedCategory)}</p>
                <p class="summary-disclaimer" style="margin-top:12px; font-size:0.85rem; color:rgba(212,168,83,0.7); font-style:italic; text-align:center;">조언일 뿐, 선택은 그대의 몫입니다.</p>
            </div>
        </div>
    `;

    resultText.innerHTML = html;
    resultPanel.scrollIntoView({ behavior: 'smooth' });
}

// === 감성적 해석 엔진 ===
function getHumanExplanation(pos, cardName, meaning, isReversed, category) {
    const keywords = meaning.replace(/\./g, '').split(',').map(s => s.trim());
    const kw1 = keywords[0] || '';
    const kw2 = keywords[1] || '';

    const catContext = {
        love: { space: '사랑', who: '상대방' },
        money: { space: '재정', who: '돈의 흐름' },
        reunion: { space: '인연', who: '그 사람' },
        career: { space: '직업', who: '당신의 일' },
        health: { space: '건강', who: '당신의 몸' },
        general: { space: '인생', who: '당신의 상황' }
    };
    const ctx = catContext[category] || catContext.general;

    if (pos === '원인') {
        if (isReversed) {
            return pickOne([
                `예전에 좀 힘든 시간이 있었던 것 같아요. <strong>${kw1}</strong>… 이런 에너지가 당신을 무겁게 눌렀었죠. ${kw2 ? '거기에 ' + kw2 + '까지 겹치면서 마음이 많이 지쳤을 거예요.' : ''} 그 시간이 아프긴 했지만, 덕분에 지금의 당신이 더 단단해진 거예요.`,
                `솔직히 말하면, 과거에 ${ctx.space}에서 상처를 받으셨던 것 같아요. <strong>${kw1}</strong>의 그림자가 남아 있거든요. ${kw2 ? kw2 + '도 느꼈을 테고요.' : ''} 그때의 아픔이 지금까지 마음 한 켠에 자리 잡고 있는 거죠. 하지만 그건 당신이 약해서가 아니라, 그만큼 진심이었기 때문이에요.`,
                `과거 카드에서 좀 무거운 기운이 느껴져요. <strong>${kw1}</strong>… 쉽지 않은 시간이었죠. ${kw2 ? kw2 + '까지 있었으니까요.' : ''} 그런데 있잖아요, 그 경험이 없었으면 지금 이 자리에 있지도 않았을 거예요. 다 이유가 있는 거예요.`
            ]);
        } else {
            return pickOne([
                `과거에 참 좋은 에너지가 있었네요. <strong>${kw1}</strong>의 기운이 마음을 채워줬던 때가 있잖아요. ${kw2 ? kw2 + '도 함께 느꼈을 거고요.' : ''} 그 따뜻했던 기억이 지금의 ${ctx.space}에 대한 태도를 만들어준 거예요.`,
                `어… 이 카드 좋다. 예전에 <strong>${kw1}</strong>을 경험하셨던 적이 있죠? ${kw2 ? kw2 + '도 느꼈을 테고요.' : ''} 그때 당신이 느꼈던 감정, 그게 사라진 게 아니에요. 마음 깊은 곳에서 아직도 빛나고 있거든요.`,
                `옛날에 ${ctx.space}에서 <strong>${kw1}</strong> 같은 순간이 있었어요. ${kw2 ? '그리고 ' + kw2 + '도요.' : ''} 그때는 몰랐을 수도 있는데, 사실 그게 지금 상황의 출발점이었어요. 좋은 출발이에요.`
            ]);
        }
    }

    if (pos === '현재상황') {
        if (isReversed) {
            return pickOne([
                `지금 좀 복잡하시죠? <strong>${kw1}</strong>의 에너지가 마음을 어지럽히고 있어요. ${kw2 ? kw2 + '도 느끼고 계실 거예요.' : ''} 불안하고 답이 안 보이는 느낌… 충분히 이해해요. 그런데 이건 폭풍 전 고요함 같은 거예요. 지나가요, 반드시.`,
                `솔직히 지금 쉽지 않은 시기예요. <strong>${kw1}</strong>이라는 무거운 감정이 당신을 짓누르고 있거든요. ${kw2 ? kw2 + '까지 겹치니까 더 그렇죠.' : ''} 그런데 있잖아요, 이렇게 힘든 시기가 올 때가 사실 가장 큰 변화의 직전이에요. 조금만 버텨보세요.`,
                `지금 이 순간, 당신의 마음이 많이 흔들리고 있네요. <strong>${kw1}</strong>… ${kw2 ? '그리고 ' + kw2 + '까지.' : ''} 이런 감정들이 한꺼번에 밀려오니까 숨이 막히겠지만, 이건 ${ctx.space}이 당신에게 중요하다는 증거예요. 중요하지 않으면 이렇게 아프지도 않으니까요.`
            ]);
        } else {
            return pickOne([
                `지금 당신 안에 따뜻한 에너지가 흐르고 있어요. <strong>${kw1}</strong>의 기운이 마음을 채우고 있거든요. ${kw2 ? kw2 + '도 느끼고 계시죠.' : ''} 이건 정말 좋은 신호예요. ${ctx.space}에 대한 당신의 마음이 그만큼 건강하다는 뜻이에요.`,
                `아, 이 카드 나와줘서 다행이다. 지금 <strong>${kw1}</strong>의 에너지가 당신에게 강하게 흐르고 있어요. ${kw2 ? kw2 + '도 함께요.' : ''} 이 흐름을 잘 타면 ${ctx.space}에서 정말 좋은 일이 생길 수 있어요. 지금 이 방향, 맞아요.`,
                `현재 당신의 상태가 참 좋네요. <strong>${kw1}</strong>… 이런 에너지를 가지고 있다는 건 ${ctx.who}과의 관계에서 긍정적인 변화가 가능하다는 거예요. ${kw2 ? kw2 + '의 에너지까지 합쳐지면' : '이 에너지를 잘 살리면'} 더 좋은 결과가 올 거예요.`
            ]);
        }
    }

    // 미래
    if (isReversed) {
        return pickOne([
            `미래를 보면… 약간 주의할 부분이 있어요. <strong>${kw1}</strong>의 기운이 좀 걸리거든요. ${kw2 ? kw2 + '도 조심해야 할 부분이에요.' : ''} 겁을 주려는 게 아니에요. 미리 알고 있으면 피할 수 있다는 뜻이니까요. 조금만 신중하게 가세요.`,
            `앞으로의 길에 <strong>${kw1}</strong> 같은 에너지가 보이는데, 살짝 조심스러워요. ${kw2 ? kw2 + '도 있고요.' : ''} 그런데 이건 '안 된다'가 아니라 '조심하면 된다'예요. 당신이 지금 마음의 준비를 하고 있으니까, 충분히 넘길 수 있어요.`,
            `미래 카드가 좀 묵직하네요. <strong>${kw1}</strong>… ${kw2 ? '그리고 ' + kw2 + '.' : ''} 현실적으로 벽이 느껴질 수 있어요. 하지만 이 카드가 나왔다는 건, 미리 준비하라는 메시지예요. 알고 맞이하는 것과 모르고 맞이하는 건 하늘과 땅 차이니까요.`
        ]);
    } else {
        return pickOne([
            `미래가 밝아요, 진짜로. <strong>${kw1}</strong>의 에너지가 앞에서 기다리고 있거든요. ${kw2 ? kw2 + '도 함께요.' : ''} 지금 당신이 걷고 있는 길, 그 끝에 좋은 것들이 준비되어 있어요. 포기하지 마세요.`,
            `아, 이 카드 보세요. 앞으로 <strong>${kw1}</strong>의 기회가 열리고 있어요. ${kw2 ? kw2 + '까지 따라오고 있고요.' : ''} 가만히 앉아서 기다리라는 건 아니에요. 당신이 한 발짝만 더 내딛으면, ${ctx.space}에서 정말 좋은 변화가 올 거예요.`,
            `미래 카드에서 <strong>${kw1}</strong>이 나왔는데, 이건 희망적이에요. ${kw2 ? kw2 + '의 느낌도 있고요.' : ''} 지금 조금 불안할 수 있지만, 이 카드가 말하고 있어요 — 괜찮아질 거라고요. 당신의 ${ctx.space}은 좋은 방향으로 가고 있어요.`
        ]);
    }
}

function pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}



function generateHumanAdvice(cards, category) {
    const catAdvice = {
        love: [
            `연애라는 게 기다린다고 오는 건 아니지만, 마음을 열어두면 분명 좋은 인연이 찾아와요. 당신이 이렇게 관심을 가지고 있다는 것 자체가 좋은 신호예요.<br>지금은 자기 자신을 가꾸면서, 자연스럽게 다가올 인연을 맞이할 준비를 해보세요.`,
            `좋은 사람을 만나고 싶은 마음, 충분히 이해해요. 그런데 억지로 찾으려 하면 오히려 멀어지더라고요.<br>조금만 여유를 가지세요. 설렘이라는 게 예상치 못한 곳에서 찾아오는 법이거든요.`
        ],
        money: [
            `돈이라는 게 참 예민한 문제죠. 그런데 지금 당신이 통제할 수 있는 부분에 집중하세요. 큰 흐름을 보세요.<br>큰 한 방을 노리기보다, 작은 습관부터 바꿀 때 비로소 변화가 시작돼요.`,
            `재정상의 고민이 있으시다면, 지금은 보수적으로 가세요. 큰 리스크를 잡을 때가 아니에요.<br>조금만 인내하면서 단단히 쌓아가시면, 분명 나아지는 흐름이 보여요.`
        ],
        reunion: [
            `재회라는 게 항상 좋은 결과만 가져오는 건 아니에요. 그런데 당신이 이렇게 물어보는 건, 아직 마음이 정리되지 않았다는 뜻이죠.<br>먼저 나 자신의 마음부터 다시 들여다보세요. 답은 그 다음에 올 거예요.`,
            `이별 후에 다시 만난다는 게, 쉬운 일은 아니죠. 그런데 카드들이 완전히 막히지는 않았어요.<br>다만 서두르지 마세요. 타이밍이 정말 중요해요.`
        ],
        career: [
            `직업이라는 게 평생을 좌우하는 문제니까 고민되실 거예요. 그런데 지금 당신 안에 답이 이미 있는 것 같아요.<br>모두의 의견을 듣되, 결국 선택은 당신이 하는 거예요. 직감을 믿어보세요.`,
            `커리어에 대한 고민, 충분히 이해해요. 지금은 준비의 시기예요. 서두르지 말고 실력을 쌓으세요.<br>기회는 준비된 사람에게 오는 법이니까요.`
        ],
        health: [
            `건강이 제일 중요한 거, 누구나 알지만 잘 안 지키죠. 지금 몸이 보내는 신호에 귀 기울여보세요.<br>거창한 건 아니에요. 작은 변화부터 시작하세요. 당신 몸이 답을 줄 거예요.`,
            `요즘 무리하셨던 거 아니에요? 지금은 좀 쉬어가세요. 충분한 휴식이 엄청난 치유력을 가지고 있어요.<br>몸과 마음이 하나라는 거, 아시죠? 모두 돌봐주세요.`
        ],
        general: [
            `삶이라는 게 사실 정답이 없는 여행 같은 거죠. 그런데 당신은 그 여행을 잘 해내고 있어요.<br>너무 걱정하지 마세요. 당신의 직감을 믿고, 한 발짝 한 발짝 나아가시면 됩니다.`,
            `어떤 상황이든, 가장 중요한 건 당신의 마음가짐이에요. 외부의 상황은 변하지만, 당신 안의 힘은 변하지 않아요.<br>오늘 하루를 소중히 보내세요. 거기서부터 시작이니까요.`
        ]
    };

    const adviceList = catAdvice[category] || catAdvice.general;
    return adviceList[Math.floor(Math.random() * adviceList.length)];
}

// === 카테고리 선택 ===
function selectCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });

    // 카테고리에 따른 질문 문구 자동 설정
    const catQuestions = {
        love: '나의 연애운,\n좋은 인연이 올까?',
        money: '나의 재정 상황,\n앞으로 어떻게 될까?',
        reunion: '헤어진 그 사람,\n나를 생각하고 있을까?',
        career: '나의 커리어,\n어디로 가고 있는 걸까?',
        health: '나의 건강,\n괜찮아질 수 있을까?',
        general: '오늘 나의 운세,\n어떻게 흐르고 있을까?'
    };

    const hookText = document.getElementById('hook-text');
    if (hookText && catQuestions[cat]) {
        hookText.value = catQuestions[cat];
        updatePreview();
    }

    // 카테고리에 맞는 타이틀 변경
    const catTitles = {
        love: '💕 애정운 리딩', money: '💰 금전운 리딩', reunion: '🔄 재회운 리딩',
        career: '💼 직업운 리딩', health: '🌿 건강운 리딩', general: '✨ 종합운 리딩'
    };
    const readingTitle = document.querySelector('.reading-title');
    if (readingTitle) readingTitle.textContent = catTitles[cat] || '운명의 조언';
}

// === SNS 공유/업로드 ===
function downloadReadingImage() {
    const resultPanel = document.getElementById('reading-result-panel');
    if (!resultPanel) return;

    html2canvas(resultPanel, {
        backgroundColor: '#0a0a14',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `tarot_reading_${selectedCategory}_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

function shareToSocial(platform) {
    // 먼저 이미지를 생성한 후 공유 가이드 제공
    const resultPanel = document.getElementById('reading-result-panel');
    if (!resultPanel) return;

    html2canvas(resultPanel, {
        backgroundColor: '#0a0a14',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        canvas.toBlob(blob => {
            // Web Share API 지원 시
            if (navigator.share) {
                const file = new File([blob], `tarot_${selectedCategory}.png`, { type: 'image/png' });
                navigator.share({
                    title: '🔮 타로 리딩 결과',
                    text: `나의 ${selectedCategory === 'love' ? '애정운' : selectedCategory === 'money' ? '금전운' : '운세'} 타로 리딩 결과를 확인해보세요!`,
                    files: [file]
                }).catch(() => {
                    fallbackShare(platform, canvas);
                });
            } else {
                fallbackShare(platform, canvas);
            }
        }, 'image/png');
    });
}

function fallbackShare(platform, canvas) {
    // 이미지 다운로드 + 플랫폼 안내
    const link = document.createElement('a');
    link.download = `tarot_${selectedCategory}_${platform}.png`;
    link.href = canvas.toDataURL();
    link.click();

    const platformInfo = {
        tiktok: { name: 'TikTok', url: 'https://www.tiktok.com/upload' },
        reels: { name: 'Instagram Reels', url: 'https://www.instagram.com/' },
        shorts: { name: 'YouTube Shorts', url: 'https://www.youtube.com/upload' }
    };
    const info = platformInfo[platform];
    if (info) {
        setTimeout(() => {
            const goTo = confirm(`📱 이미지가 저장되었습니다!\n\n${info.name}에 업로드하러 가시겠습니까?`);
            if (goTo) window.open(info.url, '_blank');
        }, 500);
    }
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
