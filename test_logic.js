import { calculateScores, getLevelInfo, getThreeSkills, getPersonaAndPrescription } from './src/logic/rscaLogic.js';

// Mock answers for all 30 questions
const answers = {};
for (let i = 1; i <= 30; i++) {
  answers[i] = 3;
}

try {
  const res = calculateScores(answers);
  console.log("calculateScores success");
  
  const levelInfo = getLevelInfo(res.totalScore);
  console.log("getLevelInfo success");
  
  const threeSkills = getThreeSkills(res.processedScores);
  console.log("getThreeSkills success");
  
  const persona = getPersonaAndPrescription(res.domainScores, res.totalScore);
  console.log("getPersonaAndPrescription success");
  
  console.log("All logic passed successfully!");
} catch (error) {
  console.error("Error occurred:", error);
}
