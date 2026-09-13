import { useState, useRef } from 'react';
import { RSCA_QUESTIONS } from './data/rscaQuestions';
import { calculateScores, getLevelInfo, getThreeSkills, getPersonaAndPrescription } from './logic/rscaLogic';

function App() {
  const [step, setStep] = useState(0); // 0: Intro, 1: Quiz, 2: Result
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const questionRefs = useRef({});

  const handleStart = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    // 30문항 모두 응답했는지 검증
    for (const q of RSCA_QUESTIONS) {
      if (!answers[q.id]) {
        alert(`${q.id}번 문항에 응답해 주세요.`);
        questionRefs.current[q.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    // 결과 계산
    const res = calculateScores(answers);
    const levelInfo = getLevelInfo(res.totalScore);
    const threeSkills = getThreeSkills(res.processedScores);
    const persona = getPersonaAndPrescription(res.domainScores, res.totalScore);

    setResult({ ...res, levelInfo, threeSkills, persona });
    setStep(2);
    window.scrollTo(0, 0);
  };

  if (step === 0) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>RSCA-30 자가진단</h1>
        <p>REACH 5대 영역 진단을 시작합니다.</p>
        
        <div style={{ marginBottom: '20px' }}>
          <label>이름 (선택 사항): </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="이름을 입력하세요"
          />
        </div>

        <button onClick={handleStart} style={{ padding: '10px 20px', fontSize: '16px' }}>
          진단 시작하기
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>RSCA-30 진단</h1>
        <p>총 30문항입니다. 모든 문항에 응답해 주세요.</p>
        
        {RSCA_QUESTIONS.map((q) => (
          <div 
            key={q.id} 
            ref={el => questionRefs.current[q.id] = el}
            style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid #ccc',
              backgroundColor: answers[q.id] ? '#f0f8ff' : '#fff'
            }}
          >
            <p><strong>{q.id}. {q.text}</strong></p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <label key={val} style={{ cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name={`q-${q.id}`} 
                    value={val}
                    checked={answers[q.id] === val}
                    onChange={() => handleAnswer(q.id, val)}
                  />
                  {val === 1 ? '1(전혀 아니다)' : val === 5 ? '5(매우 그렇다)' : val}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSubmit} style={{ padding: '10px 20px', fontSize: '16px', width: '100%', marginTop: '20px' }}>
          결과 확인하기
        </button>
      </div>
    );
  }

  if (step === 2 && result) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>진단 결과</h1>
        {name && <p><strong>{name}</strong>님의 진단 결과입니다.</p>}
        
        <h2>총점: {result.totalScore} / 150</h2>
        <p><strong>레벨:</strong> {result.levelInfo.title} (Level {result.levelInfo.level})</p>
        <p>{result.levelInfo.description}</p>
        
        <hr />
        <h3>도메인별 점수</h3>
        <ul>
          <li>R (주도적 충전): {result.domainScores.R}</li>
          <li>E (감정 수용): {result.domainScores.E}</li>
          <li>A (풍요 마인드): {result.domainScores.A}</li>
          <li>C (자기 자비): {result.domainScores.C}</li>
          <li>H (건강한 경계선): {result.domainScores.H}</li>
        </ul>

        <hr />
        <h3>페르소나 및 처방</h3>
        <p><strong>유형:</strong> {result.persona.persona}</p>
        <p>{result.persona.personaDesc}</p>
        <h4>맞춤형 솔루션</h4>
        <ul>
          <li><strong>트리거:</strong> {result.persona.mvr.trigger}</li>
          <li><strong>액션:</strong> {result.persona.mvr.action}</li>
          <li><strong>효과:</strong> {result.persona.mvr.effect}</li>
        </ul>

        <hr />
        <h2>실전 대처력 스냅샷</h2>
        {result.threeSkills.map(skill => (
          <div key={skill.id} style={{ marginBottom: '15px' }}>
            <h4>{skill.title} ({skill.subtitle}) - 점수: {skill.score}</h4>
            <p>{skill.desc}</p>
          </div>
        ))}

        <button onClick={() => { setStep(0); setAnswers({}); setResult(null); setName(''); }} style={{ marginTop: '30px', padding: '10px' }}>
          다시 하기
        </button>
      </div>
    );
  }

  return null;
}

export default App;
