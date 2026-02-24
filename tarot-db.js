/**
 * 타로카드 78장 통합 데이터베이스 (RIDER-WAITE)
 */
const TAROT_DATA = [
    // Major Arcana (0-21) -> majXX.jpg
    { id: 0, name: 'The Fool (광대)', suit: 'maj', num: 0, upright: '새로운 시작, 순수함, 자유로운 영혼, 모험.', reversed: '무모함, 부주의, 위험한 도박, 어리석음.' },
    { id: 1, name: 'The Magician (마법사)', suit: 'maj', num: 1, upright: '창조성, 기술, 의지력, 자아 실현, 능력.', reversed: '조작, 계획의 실패, 서투른 기술, 비현실성.' },
    { id: 2, name: 'The High Priestess (고위 여사제)', suit: 'maj', num: 2, upright: '직관, 무의식, 신성한 지혜, 신비.', reversed: '내면의 목소리 무시, 비밀의 누설, 피상적임.' },
    { id: 3, name: 'The Empress (여황제)', suit: 'maj', num: 3, upright: '풍요, 모성애, 자연, 예술적 영감, 번영.', reversed: '의존성, 창의력 소멸, 낭비, 불임.' },
    { id: 4, name: 'The Emperor (황제)', suit: 'maj', num: 4, upright: '권위, 질서, 안정, 리더십, 통제력.', reversed: '독재적, 무능력, 질서 파괴, 유약함.' },
    { id: 5, name: 'The Hierophant (교황)', suit: 'maj', num: 5, upright: '전통, 가르침, 제도, 신앙, 자비.', reversed: '속박, 도덕적 타락, 비정통적 시각, 완고함.' },
    { id: 6, name: 'The Lovers (연인)', suit: 'maj', num: 6, upright: '사랑, 조화, 연합, 중요한 선택, 신뢰.', reversed: '불균형, 갈등, 선택의 어려움, 변심.' },
    { id: 7, name: 'The Chariot (전차)', suit: 'maj', num: 7, upright: '승리, 도전, 결단력, 추진력, 성공.', reversed: '패배, 통제력 상실, 방향의 혼란, 무모함.' },
    { id: 8, name: 'Strength (힘)', suit: 'maj', num: 8, upright: '용기, 인내, 내면의 힘, 연민, 극복.', reversed: '자기 의심, 비열함, 성급함, 무기력.' },
    { id: 9, name: 'The Hermit (은둔자)', suit: 'maj', num: 9, upright: '은둔, 성찰, 고찰, 지혜, 고독.', reversed: '고립, 외로움, 무관심, 현실 기피.' },
    { id: 10, name: 'Wheel of Fortune (운명의 수레바퀴)', suit: 'maj', num: 10, upright: '운명적 변화, 행운, 순환, 기회.', reversed: '불운, 뜻밖의 저항, 정체기, 운의 하락.' },
    { id: 11, name: 'Justice (정의)', suit: 'maj', num: 11, upright: '정의, 공정, 인과응보, 책임감.', reversed: '불공정, 편견, 결과에 대한 부정, 편파적.' },
    { id: 12, name: 'The Hanged Man (매달린 사람)', suit: 'maj', num: 12, upright: '희생, 새로운 시각, 정체기, 인내.', reversed: '헛된 희생, 고집, 기회의 상실, 무의미함.' },
    { id: 13, name: 'Death (죽음)', suit: 'maj', num: 13, upright: '종결, 변형, 새로운 시작, 전환점.', reversed: '변화에 대한 두려움, 정체, 부활의 지연.' },
    { id: 14, name: 'Temperance (절제)', suit: 'maj', num: 14, upright: '절제, 조화, 인내, 중용, 융합.', reversed: '불균형, 과잉, 조정의 필요성, 조급함.' },
    { id: 15, name: 'The Devil (악마)', suit: 'maj', num: 15, upright: '속박, 중독, 물질주의, 유혹, 탐욕.', reversed: '자유, 분리, 속박으로부터의 탈출, 깨어남.' },
    { id: 16, name: 'The Tower (탑)', suit: 'maj', num: 16, upright: '갑작스러운 변화, 파괴, 각성, 충격.', reversed: '파멸 방지, 변화의 지연, 두려움의 지속.' },
    { id: 17, name: 'The Star (별)', suit: 'maj', num: 17, upright: '희망, 영감, 치유, 평온, 긍정.', reversed: '절망, 실망, 영감의 상실, 비관적 태도.' },
    { id: 18, name: 'The Moon (달)', suit: 'maj', num: 18, upright: '불안, 환상, 직관의 혼란, 모호함.', reversed: '두려움의 극복, 진실의 규명, 혼란 종결.' },
    { id: 19, name: 'The Sun (태양)', suit: 'maj', num: 19, upright: '성공, 활력, 기쁨, 명확함, 축복.', reversed: '일시적 정체, 과장된 자신감, 우울함.' },
    { id: 20, name: 'Judgement (심판)', suit: 'maj', num: 20, upright: '부활, 반성, 중대한 결정, 소명.', reversed: '자기 비판, 결정의 지연, 후회, 미련.' },
    { id: 21, name: 'The World (세계)', suit: 'maj', num: 21, upright: '완성, 여행, 성취, 통합, 조화.', reversed: '미완성, 지연, 미흡한 성취, 한계를 느낌.' },

    // Minor Arcana - Wands -> wandsXX.jpg (01-14)
    { id: 22, name: 'Ace of Wands', suit: 'wands', num: 1, upright: '새로운 열정, 시작, 창조적 영감.', reversed: '의욕 저하, 지연, 창의력 상실.' },
    { id: 35, name: 'King of Wands', suit: 'wands', num: 14, upright: '리더십, 비전, 열정적인 지도자.', reversed: '독불장군, 성급함, 무모함.' },

    // Minor Arcana - Cups -> cupsXX.jpg (01-14)
    { id: 36, name: 'Ace of Cups', suit: 'cups', num: 1, upright: '감정의 시작, 사랑, 기쁨, 직관.', reversed: '감정 소모, 실연, 창의적 정체.' },
    { id: 49, name: 'King of Cups', suit: 'cups', num: 14, upright: '감정적 균형, 연민, 지혜로운 지도자.', reversed: '조작, 감정적 불안정, 냉정함.' },

    // Minor Arcana - Swords -> swordsXX.jpg (01-14)
    { id: 50, name: 'Ace of Swords', suit: 'swords', num: 1, upright: '명확한 결단, 승리, 돌파구 마련.', reversed: '혼란, 불공정, 갈등의 심화.' },
    { id: 63, name: 'King of Swords', suit: 'swords', num: 14, upright: '지적 권위, 진실, 명확한 규율.', reversed: '폭정, 조작, 부도덕한 권력.' },

    // Minor Arcana - Pentacles -> pentsXX.jpg (01-14)
    { id: 64, name: 'Ace of Pentacles', suit: 'pents', num: 1, upright: '물질적 성취, 풍요의 시작, 현실성.', reversed: '금전적 손실, 기회의 상실, 욕심.' },
    { id: 77, name: 'King of Pentacles', suit: 'pents', num: 14, upright: '물질적 완성, 번영, 사업적 수완.', reversed: '탐욕, 완고함, 물질적 집착, 무능력.' }
];

// 나머지 마이너 아르카나 데이터도 패턴에 맞게 채워넣기 (간소화 버전)
const suits = ['wands', 'cups', 'swords', 'pents'];
const suitNames = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const cardValues = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen'];

suits.forEach((suit, sIdx) => {
    cardValues.forEach((val, vIdx) => {
        const id = 23 + (sIdx * 14) + vIdx;
        const num = vIdx + 2;
        // 이미 존재하는 ID면 건너뜀
        if (TAROT_DATA.find(d => d.id === id)) return;

        TAROT_DATA.push({
            id: id,
            name: `${val} of ${suitNames[sIdx]}`,
            suit: suit,
            num: num,
            upright: `${suitNames[sIdx]}의 기운과 ${val}의 속성이 결합된 리딩입니다.`,
            reversed: `${suitNames[sIdx]}의 에너지가 왜곡되거나 지연되는 상황입니다.`
        });
    });
});

/**
 * 78장 이미지 파일명 매핑 (searge/tarot 패턴 적용)
 */
function getCardImageUrl(card) {
    const numStr = card.num.toString().padStart(2, '0');
    return `https://raw.githubusercontent.com/searge/tarot/master/assets/img/big/${card.suit}${numStr}.jpg`;
}

/**
 * 해석 텍스트 생성
 */
function getInterpretation(card, isReversed) {
    const directionStr = isReversed ? ' (역방향)' : ' (정방향)';
    const meaning = isReversed ? card.reversed : card.upright;

    // 조언 스타일로 단어 나열을 문장으로 변환 (심플 버전)
    const cardNameDisplay = card.name.split('(')[1] ? card.name.split('(')[1].replace(')', '') : card.name;

    return `
        <div class="result-card-info">
            <span class="result-card-name">${cardNameDisplay}</span>
            <span class="result-card-direction">${directionStr}</span>
        </div>
        <div class="result-section">
            <div class="result-label">✨ 카드의 핵심 의미</div>
            <p class="result-meaning">${meaning}</p>
        </div>
        <div class="result-section">
            <div class="result-label">🔮 마녀의 조언</div>
            <p class="result-advice">
                이 카드는 지금 당신의 상황에서 <strong>'${meaning.split(',')[0]}'</strong>의 에너지가 아주 강하게 들어와 있음을 말해주고 있어요. <br><br>
                ${isReversed ?
            '현재 조금 정체되거나 왜곡된 에너지가 느껴질 수 있지만, 이건 당신이 잠시 멈춰서 스스로를 돌아보라는 신호일 거예요. 너무 자책하지 마세요.' :
            '긍정적이고 밝은 기운이 당신을 향하고 있네요. 지금 느끼는 그 직감을 믿고 한 걸음 더 나아가 보세요. 당신은 충분히 잘 해내고 있습니다.'
        } <br><br>
                카드가 건네는 메시지인 <em>"${meaning}"</em>을(를) 마음속에 깊이 새기며, 오늘 하루 당신만의 정답을 찾아가길 바랄게요. ✨
            </p>
        </div>
    `;
}
