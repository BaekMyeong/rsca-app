import { RSCA_QUESTIONS } from '../data/rscaQuestions';

export const calculateScores = (answers) => {
  let totalScore = 0;
  const domainScores = { R: 0, E: 0, A: 0, C: 0, H: 0 };
  const processedScores = {};

  RSCA_QUESTIONS.forEach((q) => {
    // 30문항이 모두 응답되어야만 유효한 로직이 되도록 컴포넌트단에서 검증할 것이므로 
    // 여기서는 기본값 3을 주긴 하지만 실제로는 모두 입력된 값이 들어옴
    const rawVal = answers[q.id] || 3;
    const finalVal = q.isReverse ? (6 - rawVal) : rawVal;
    processedScores[q.id] = finalVal;
    totalScore += finalVal;
    domainScores[q.domain] += finalVal;
  });

  const sci = Number((totalScore / 30).toFixed(2));
  return { totalScore, sci, domainScores, processedScores };
};

export const getLevelInfo = (totalScore) => {
  if (totalScore <= 59) {
    return { level: 1, title: "번아웃 및 고갈 위기", badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
      quote: "애써 버텨온 내면의 신호에 귀 기울일 때입니다. 지금은 다른 어떤 과업보다 나를 돌보는 일이 가장 안전한 선택입니다.",
      description: "감정 에너지가 심각하게 방전된 상태입니다.\n무리한 과업을 멈추고 자율신경계를 안정시키는 깊은 쉼이 우선입니다." };
  } else if (totalScore <= 89) {
    return { level: 2, title: "감정 마모 및 불균형", badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      quote: "바쁜 일상 속에서 나도 모르게 에너지가 새어 나가고 있었습니다. 감정 울타리를 가만히 점검해 줄 시간입니다.",
      description: "일상의 자극으로 감정 소진이 누적된 상태입니다.\n감정 누수 요인을 차단하고 감정 울타리를 점검할 때입니다." };
  } else if (totalScore <= 119) {
    return { level: 3, title: "감정적 안정", badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      quote: "일상의 흔들림 속에서도 중심을 잘 지켜내고 있습니다. 지금의 유연한 회복 리듬을 편안하게 유지해 보세요.",
      description: "스스로 감정의 중심을 잘 잡고\n일상의 회복 탄력성을 원활하게 유지하고 있는 상태입니다." };
  } else {
    return { level: 4, title: "감정적 활력과 충만", badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      quote: "내면의 에너지가 따뜻하게 차올라 있습니다. 스스로를 깊이 돌보는 힘이 주변에도 건강한 온기로 전해집니다.",
      description: "내면의 감정 에너지가 풍부하여 스스로를 깊이 돌볼 뿐 아니라\n주변에 건강한 온기를 전하는 상태입니다." };
  }
};

export const getThreeSkills = (p) => {
  const defusion = Number(((p[7] + p[10] + p[11]) / 3).toFixed(1));
  const selfSoothing = Number(((p[19] + p[22] + p[23] + p[24]) / 4).toFixed(1));
  const boundaryFirewall = Number(((p[25] + p[26] + p[29] + p[30]) / 4).toFixed(1));

  return [
    { id: "defusion", title: "감정과 거리두기", subtitle: "감정 관찰력", score: defusion,
      desc: defusion >= 3.5 ? "격한 감정이 올라와도 매몰되지 않고 한 발 물러서서 바라보는 힘이 우수합니다."
        : "감정에 통째로 휩쓸리거나 논리로 억누르기 쉽습니다. 감정에 이름을 붙여주는 연습이 필요합니다." },
    { id: "selfSoothing", title: "스스로 다독이기", subtitle: "내 감정 편 되어주기", score: selfSoothing,
      desc: selfSoothing >= 3.5 ? "실수나 좌절 상황에서도 스스로를 가혹하게 탓하지 않고 따뜻하게 감싸 안아줍니다."
        : "내부 비판자가 강하게 작동해 자책이 잦습니다. 가장 좋은 벗을 대하듯 다독이는 연습이 필요합니다." },
    { id: "boundaryFirewall", title: "감정 울타리 치기", subtitle: "감정 방파제", score: boundaryFirewall,
      desc: boundaryFirewall >= 3.5 ? "타인의 부정적 감정이 내 안으로 넘어오지 못하도록 안전거리를 잘 유지합니다."
        : "남의 기분과 부탁에 쉽게 휘둘려 에너지가 새어 나갑니다. 3초간 멈추고 거절하는 완충 지대가 필요합니다." }
  ];
};

export const getPersonaAndPrescription = (domainScores, totalScore) => {
  const domains = ['R', 'E', 'A', 'C', 'H'];
  let minDomain = 'R';
  let minScore = 999;
  domains.forEach((d) => {
    if (domainScores[d] < minScore) { minScore = domainScores[d]; minDomain = d; }
  });

  const isAllBalanced = domains.every((d) => domainScores[d] >= 24) && totalScore >= 120;
  if (isAllBalanced) {
    return {
      persona: "감정 회복탄력형",
      personaDesc: "5개 감정 축이 고르게 발달하여 스트레스 상황에서도 스스로 빠르게 회복하는 균형 잡힌 상태입니다.",
      mvr: { trigger: "스트레스가 시작될 때", action: "지금 상태를 가만히 자각하고 호흡 3회 하기", effect: "탁월한 감정 회복력을 지속 유지" },
      minDomain: null
    };
  }

  const map = {
    E: { persona: "감정 과열 억압형",
      personaDesc: "불편한 감정을 논리로 덮어두려다 한순간에 폭발하거나 감정적 침체에 빠지기 쉬운 유형입니다.",
      mvr: { trigger: "가슴이 답답하고 짜증이나 무력감이 치밀 때", action: "손을 명치에 대고 '지금 내 안에 서운함(불안)의 파도가 인다'고 소리 내어 말하기", effect: "감정 명명화를 통해 뇌의 과열을 진정시키고 조율 센터를 켭니다." } },
    R: { persona: "만성 감정 방전형",
      personaDesc: "바쁜 일정에 치여 자신의 쉼을 가장 먼저 희생시키다 배터리가 완전히 고갈된 유형입니다.",
      mvr: { trigger: "턱에 힘이 들어가고 목덜미와 어깨가 굳어질 때", action: "창밖 먼 곳을 바라보며 날숨을 2배 길게 내쉬는 호흡 3회 하기", effect: "미주신경을 자극하여 긴장된 신경계를 즉시 이완 상태로 돌립니다." } },
    H: { persona: "무경계 소진형",
      personaDesc: "타인의 요청을 거절하지 못해 감정의 경계가 자꾸 허물어지고, 정작 내 에너지는 계속 새어 나가는 유형입니다.",
      mvr: { trigger: "거절하기 미안해 즉시 '네'라고 대답하려 할 때", action: "3초간 멈추고 '일정 확인 후 10분 뒤에 말씀드릴게요'라고 답 유예하기", effect: "감정적 충동 반응을 차단하고 스스로 결정할 안전거리를 확보합니다." } },
    C: { persona: "완벽주의 자책형",
      personaDesc: "작은 실수에도 '왜 이것밖에 못 했을까'라며 스스로에게 가혹한 비난을 쏟아붓는 유형입니다.",
      mvr: { trigger: "머릿속에서 자책의 목소리가 들리기 시작할 때", action: "양손으로 어깨를 감싸 안고(나비 포옹) '많이 애썼다, 괜찮다' 다독이기", effect: "신체 접촉을 통해 스트레스 호르몬을 줄이고 진정 회로를 활성화합니다." } },
    A: { persona: "결핍성 성취 질주형",
      personaDesc: "외적 성과로만 나의 가치를 증명하려 해 늘 초조하고 타인과의 비교에 시달리는 유형입니다.",
      mvr: { trigger: "타인의 소식이나 성과를 보며 속이 쓰리고 불안해질 때", action: "화면을 끄고 지금 내 손안에 있는 소중한 자원 3가지를 적어보기", effect: "뇌의 결핍 경보를 끄고 내 존재 자체의 온전함으로 초점을 되돌립니다." } }
  };

  return { ...map[minDomain], minDomain };
};
