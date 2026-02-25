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

    // 78장 중 랜덤 선택 + 정/역방향 랜덤 결정 (정방향 70%, 역방향 30%)
    const randomIdx = Math.floor(Math.random() * TAROT_DATA.length);
    const cardData = TAROT_DATA[randomIdx];
    const isReversed = Math.random() > 0.7;

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

// === 타로 리더 해석 엔진 ===
function getHumanExplanation(pos, cardName, meaning, isReversed, category) {
    const keywords = meaning.replace(/\./g, '').split(',').map(s => s.trim());
    const kw1 = keywords[0] || '';
    const kw2 = keywords[1] || '';

    const catContext = {
        love: { space: '감정', who: '상대방', tema: '마음' },
        money: { space: '재정', who: '돈의 흐름', tema: '풍요' },
        reunion: { space: '관계', who: '그분', tema: '인연' },
        career: { space: '일', who: '당신의 커리어', tema: '성장' },
        health: { space: '건강', who: '당신의 몸과 마음', tema: '회복' },
        general: { space: '삶', who: '당신의 상황', tema: '흐름' }
    };
    const ctx = catContext[category] || catContext.general;

    if (pos === '원인') {
        if (isReversed) {
            return pickOne([
                `이 자리에 <strong>${kw1}</strong>의 기운이 놓여 있습니다. ${kw2 ? kw2 + '의 에너지도 함께 읽히고요.' : ''} 어딘가에서 흐름이 막혔거나, 마음이 무거워졌던 시간이 있었던 것 같습니다. 그 경험이 지금 이 자리까지 영향을 주고 있어요.`,
                `원인을 보니, <strong>${kw1}</strong>이라는 에너지가 자리하고 있네요. ${kw2 ? kw2 + '도 보입니다.' : ''} 어쩌면 당신이 원하는 방향과 현실 사이에 괴리가 있었을 수 있습니다. 그 간극이 지금의 ${ctx.space}에 대한 불안으로 이어진 것이죠.`,
                `<strong>${kw1}</strong>… 이 에너지가 원인 자리에 놓여 있다는 건, 이전에 어떤 것이 뜻대로 흘러가지 않았다는 뜻입니다. ${kw2 ? kw2 + '의 영향도 있고요.' : ''} 하지만 그건 실패가 아니라, 배움이 필요했던 시간이었어요.`
            ]);
        } else {
            return pickOne([
                `이 자리에 <strong>${kw1}</strong>의 기운이 놓여 있네요. ${kw2 ? kw2 + '도 함께 보입니다.' : ''} 이전에 무언가를 향해 나아갔던 힘, 혹은 마음이 움직였던 순간이 있었습니다. 그때의 에너지가 지금 이 상황의 뿌리가 되고 있어요.`,
                `원인을 살펴보니, <strong>${kw1}</strong>이라는 좋은 에너지가 바탕에 깔려 있습니다. ${kw2 ? kw2 + '의 기운도 읽히고요.' : ''} 당신이 진심으로 무언가를 향했던 시간이 있었죠. 그 마음이 지금까지 이어지고 있는 겁니다.`,
                `<strong>${kw1}</strong>의 에너지가 이 상황의 시작점에 있습니다. ${kw2 ? kw2 + '도 함께요.' : ''} 당신 안에 이미 어떤 방향성이 생겼던 거예요. 의식하지 못했을 수도 있지만, 그때의 선택이 지금의 흐름을 만들었습니다.`
            ]);
        }
    }

    if (pos === '현재상황') {
        if (isReversed) {
            return pickOne([
                `지금 <strong>${kw1}</strong>의 에너지가 당신을 감싸고 있습니다. ${kw2 ? kw2 + '도 느끼고 계실 거예요.' : ''} 마음이 복잡하고, 어디로 가야 할지 잘 보이지 않는 시기죠. 하지만 이런 시간은 반드시 지나갑니다. 지금은 멈춰서 자신을 돌보는 것이 필요해요.`,
                `현재 <strong>${kw1}</strong>이라는 무거운 기운이 자리하고 있네요. ${kw2 ? kw2 + '까지 겹쳐 있어서 더 그렇습니다.' : ''} 쉽지 않은 시간이죠. 다만, 이렇게 힘든 순간이 올 때가 오히려 가장 큰 전환점에 가까워진 때이기도 합니다.`,
                `<strong>${kw1}</strong>… 이 에너지가 지금 당신의 마음을 무겁게 하고 있다는 걸 느낍니다. ${kw2 ? kw2 + '의 영향도 있고요.' : ''} 답이 보이지 않아 답답하시겠지만, 이건 ${ctx.space}이 당신에게 깊이 의미 있는 일이기 때문에 느껴지는 감정이에요.`
            ]);
        } else {
            return pickOne([
                `지금 <strong>${kw1}</strong>의 에너지가 당신 안에 흐르고 있습니다. ${kw2 ? kw2 + '의 기운도 함께요.' : ''} 좋은 흐름이에요. ${ctx.space}에 대한 당신의 마음이 건강한 방향을 향하고 있다는 뜻입니다.`,
                `현재 <strong>${kw1}</strong>이라는 따뜻한 기운이 읽힙니다. ${kw2 ? kw2 + '도 느끼고 계실 겁니다.' : ''} 지금 이 흐름을 잘 지켜가시면, ${ctx.who}와의 관계에서도 자연스러운 변화가 찾아올 수 있어요.`,
                `<strong>${kw1}</strong>의 에너지가 지금 당신의 중심에 자리 잡고 있네요. ${kw2 ? kw2 + '까지 함께 흐르고 있고요.' : ''} 이 에너지는 당신이 올바른 방향으로 나아가고 있다는 신호입니다. 그 감각을 믿으셔도 됩니다.`
            ]);
        }
    }

    // 앞으로의 방향
    if (isReversed) {
        return pickOne([
            `앞으로의 흐름에서 <strong>${kw1}</strong>의 기운이 보입니다. ${kw2 ? kw2 + '도 함께 나타나고 있고요.' : ''} 다소 주의가 필요한 부분이 있어요. 다만, 이건 막혀 있다는 뜻이 아니라 '신중하게 가라'는 카드의 메시지입니다.`,
            `방향을 보면, <strong>${kw1}</strong>의 에너지가 좀 걸리는 부분이 있습니다. ${kw2 ? kw2 + '도 함께요.' : ''} 하지만 이 카드가 나왔다는 건, 미리 알고 준비할 수 있다는 뜻이기도 합니다. 알고 맞이하는 것과 모르고 맞이하는 것은 전혀 다르니까요.`,
            `<strong>${kw1}</strong>… 이 에너지가 앞에 놓여 있습니다. ${kw2 ? kw2 + '의 기운도 보이고요.' : ''} 조금은 조심스러운 흐름이에요. 하지만 겁내실 필요는 없습니다. 지금 이 순간 인식하고 계시다는 것 자체가 이미 준비가 시작된 거니까요.`
        ]);
    } else {
        return pickOne([
            `앞으로의 흐름에 <strong>${kw1}</strong>의 기운이 열려 있습니다. ${kw2 ? kw2 + '의 에너지도 함께 따라오고 있고요.' : ''} 좋은 방향이에요. 지금 걸어가고 계신 그 길 위에 의미 있는 변화가 기다리고 있을 가능성이 높습니다.`,
            `방향 카드에 <strong>${kw1}</strong>이 놓여 있네요. ${kw2 ? kw2 + '도 보입니다.' : ''} 이건 희망적인 흐름입니다. 단, 저절로 찾아오는 것은 아니에요. 당신이 한 걸음 내딛을 때, 이 에너지가 비로소 현실이 됩니다.`,
            `<strong>${kw1}</strong>의 에너지가 앞에서 기다리고 있습니다. ${kw2 ? kw2 + '의 기운까지 함께요.' : ''} 지금 느끼는 불안이나 망설임이 있더라도, ${ctx.space}의 흐름은 나쁘지 않습니다. 조급해하지 않으셔도 됩니다.`
        ]);
    }
}

function pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}



function generateHumanAdvice(cards, category) {
    const catAdvice = {
        love: [
            `감정이란 건 억지로 만들 수 있는 것이 아닙니다. 지금 당신이 할 수 있는 가장 좋은 일은, 자기 자신을 먼저 따뜻하게 돌보는 것이에요.<br>마음이 편안해질 때, 인연은 자연스럽게 다가오게 되어 있습니다.`,
            `지금은 상대방보다 당신 자신에게 집중하실 때입니다. 당신의 마음이 안정되고 여유가 생기면, 그때 보이는 것들이 달라질 거예요.<br>서두르지 마세요. 좋은 인연은 준비된 마음에 찾아옵니다.`
        ],
        money: [
            `재정이라는 건 하루아침에 바뀌지 않습니다. 지금 당장 큰 변화를 만들려 하기보다는, 작은 부분부터 하나씩 정리해 나가시는 것이 현명합니다.<br>흐름이 바뀌는 시점이 오고 있으니, 그때를 위해 차분히 준비하세요.`,
            `지금은 무리하게 움직이기보다, 현재 가지고 계신 것을 지키는 데 집중하시는 게 좋겠습니다.<br>단단하게 기반을 다지신 후에 기회가 찾아왔을 때, 그때 움직이셔도 늦지 않습니다.`
        ],
        reunion: [
            `재회라는 건 양쪽 모두의 마음이 준비되어야 가능한 일입니다. 지금은 상대방의 마음보다, 먼저 당신 자신의 마음을 차분히 들여다보시는 것이 필요해요.<br>진심이 정리되면, 그다음에 취해야 할 행동이 자연스럽게 보일 겁니다.`,
            `이별 이후 다시 만남을 생각한다는 건, 그만큼 깊은 감정이 남아 있다는 뜻이겠죠. 그 마음 자체는 소중한 것입니다.<br>다만 서두르지 마세요. 때가 되면, 길은 스스로 열리게 되어 있습니다.`
        ],
        career: [
            `직업에 대한 고민은 누구에게나 무거운 주제입니다. 하지만 지금 당신 안에는 이미 방향에 대한 감각이 있으실 거예요.<br>주변의 말에 흔들리기보다, 당신 내면의 목소리에 한 번 귀를 기울여 보세요.`,
            `지금은 성과를 내야 할 때가 아니라, 준비를 해야 할 때입니다. 조급함을 내려놓고, 실력과 경험을 쌓아가시면 됩니다.<br>기회는 반드시 옵니다. 준비된 사람에게는요.`
        ],
        health: [
            `몸은 거짓말을 하지 않습니다. 지금 몸이 보내는 신호가 있다면, 작은 것이라도 무시하지 마세요.<br>거창한 변화가 아니어도 괜찮습니다. 오늘 하루, 조금 더 자신을 아끼는 것부터 시작해 보세요.`,
            `최근 스스로를 돌보는 일에 소홀하셨던 건 아닌지 한번 떠올려 보세요. 충분한 휴식은 가장 강력한 치유입니다.<br>몸과 마음은 하나로 연결되어 있으니, 둘 다 함께 돌봐주시길 바랍니다.`
        ],
        general: [
            `삶에는 정해진 정답이 없습니다. 하지만 지금 당신이 이렇게 고민하고 있다는 것 자체가, 올바른 방향으로 가고 있다는 증거이기도 합니다.<br>너무 멀리 보려 하지 마시고, 지금 이 한 걸음에 집중해 보세요.`,
            `어떤 상황이든, 가장 중요한 것은 당신의 마음가짐입니다. 외부의 환경은 늘 변하지만, 당신 안에 있는 힘은 변하지 않습니다.<br>오늘 하루를 소중히 보내세요. 모든 변화는 거기서부터 시작됩니다.`
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
