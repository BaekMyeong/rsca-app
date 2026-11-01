import { RSCA5_QUESTIONS } from '../data/rsca5Questions';

export const calculateRSCA5 = (answers) => {
  let totalScore = 0;
  const domainScores = { R: 0, E: 0, A: 0, C: 0, H: 0 };

  RSCA5_QUESTIONS.forEach((q) => {
    const val = answers[q.id] || 0;
    totalScore += val;
    domainScores[q.domain] = val;
  });

  // 구간 판정 (5~9점 / 10~14점 / 15~25점)
  // RSCA-30과 같은 평균 기준(2.0 미만 / 2.0~3.0 미만 / 3.0 이상)으로 맞춘 구간임.
  let levelInfo = {};
  if (totalScore <= 9) {
    levelInfo = {
      level: 1,
      title: "정서 위기 (감정 고갈 위기)",
      color: "#BE123C",
      bgColor: "#FFE4E6",
      desc: "정서 에너지가 많이 부족한 상태로 보입니다. 충분한 휴식과 감정 돌봄 루틴이 우선입니다."
    };
  } else if (totalScore <= 14) {
    levelInfo = {
      level: 2,
      title: "정서 불균형 (감정 마모 및 불균형)",
      color: "#B45309",
      bgColor: "#FEF3C7",
      desc: "특정 영역의 에너지가 낮아졌을 가능성이 있습니다. 몸과 마음 돌봄을 우선순위에 둘 때입니다."
    };
  } else {
    levelInfo = {
      level: 3,
      title: "정서적 안정",
      color: "#047857",
      bgColor: "#D1FAE5",
      desc: "감정의 흐름이 대체로 안정적인 상태로 보입니다. 이 상태를 유지하며 셀프케어 루틴을 이어가 보세요."
    };
  }

  // 가장 낮은 점수의 영역 탐색(동점은 모두 포함)
  const minScore = Math.min(...RSCA5_QUESTIONS.map((q) => domainScores[q.domain]));
  const lowestList = RSCA5_QUESTIONS
    .filter((q) => domainScores[q.domain] === minScore)
    .map((q) => ({ key: q.domain, name: q.domainName, score: minScore }));
  // 5개 영역 점수가 모두 같으면 특정 영역을 짚지 않는다.
  const allTied = lowestList.length === RSCA5_QUESTIONS.length;
  const lowestDomainObj = lowestList[0];

  return {
    totalScore,
    percentage: Math.round((totalScore / 25) * 100),
    levelInfo,
    domainScores,
    lowestDomain: lowestDomainObj,
    lowestDomains: lowestList,
    allTied,
    // 합계는 안정 구간이어도 한 영역이 2점 이하로 낮으면 따로 안내하기 위한 표시
    hasVeryLowDomain: minScore <= 2
  };
};
