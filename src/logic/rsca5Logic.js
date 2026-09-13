import { RSCA5_QUESTIONS } from '../data/rsca5Questions';

export const calculateRSCA5 = (answers) => {
  let totalScore = 0;
  const domainScores = { R: 0, E: 0, A: 0, C: 0, H: 0 };

  RSCA5_QUESTIONS.forEach((q) => {
    const val = answers[q.id] || 0;
    totalScore += val;
    domainScores[q.domain] = val;
  });

  // 진단 기준 판정 (5~12점 / 13~18점 / 19~25점)
  let levelInfo = {};
  if (totalScore <= 12) {
    levelInfo = {
      level: 1,
      title: "정서 위기 (감정 고갈 위기)",
      color: "#BE123C",
      bgColor: "#FFE4E6",
      desc: "정서 에너지가 매우 부족한 상태입니다. 즉각적인 휴식과 감정 치유 루틴이 시급합니다."
    };
  } else if (totalScore <= 18) {
    levelInfo = {
      level: 2,
      title: "정서 불균형 (감정 마모 및 불균형)",
      color: "#B45309",
      bgColor: "#FEF3C7",
      desc: "특정 영역의 웰니스가 무너져 있을 가능성이 큽니다. 몸과 마음 챙김을 삶의 우선순위에 둘 때입니다."
    };
  } else {
    levelInfo = {
      level: 3,
      title: "정서적 안정",
      color: "#047857",
      bgColor: "#D1FAE5",
      desc: "감정의 흐름이 매우 원활하고 안정적입니다. 이 상태를 유지하며 셀프케어 루틴을 지속해 보세요."
    };
  }

  // 가장 돌봄이 시급한 최저점 영역 탐색
  let minDomain = 'R';
  let minScore = 99;
  RSCA5_QUESTIONS.forEach((q) => {
    if (domainScores[q.domain] < minScore) {
      minScore = domainScores[q.domain];
      minDomain = q.domain;
    }
  });

  const lowestDomainObj = RSCA5_QUESTIONS.find((q) => q.domain === minDomain);

  return {
    totalScore,
    percentage: Math.round((totalScore / 25) * 100),
    levelInfo,
    domainScores,
    lowestDomain: {
      key: minDomain,
      name: lowestDomainObj.domainName,
      score: minScore
    }
  };
};
