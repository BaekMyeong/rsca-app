import { useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { RSCA_QUESTIONS } from './data/rscaQuestions';
import { calculateScores, getLevelInfo, getThreeSkills, getPersonaAndPrescription } from './logic/rscaLogic';
import html2canvas from 'html2canvas';

export const ReachEmblem = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
      <style>{`
        @keyframes rscaSpinAndBreathe {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.88;
          }
          50% {
            transform: scale(1.04) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0.88;
          }
        }
        .breathe-animation {
          animation: rscaSpinAndBreathe 20s linear infinite;
          transform-origin: center center;
        }
      `}</style>
      <img
        src="/reach-emblem-circle.png"
        alt="REACH 5대 영역 순환 심볼"
        className="breathe-animation"
        style={{ 
          width: '220px', 
          height: '220px', 
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

function RSCADeepApp() {
  // Load initial state from sessionStorage
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('rsca_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [name, setName] = useState(() => {
    return sessionStorage.getItem('rsca_name') || '';
  });
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem('rsca_answers');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [result, setResult] = useState(null);
  const questionRefs = useRef({});
  const resultRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true, backgroundColor: '#FDFBF7' });
      const link = document.createElement('a');
      link.download = `RSCA_진단결과_${name || 'report'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('이미지 저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // Test mode: auto-fill and jump to result if URL has ?test=true
  useEffect(() => {
    if (window.location.search.includes('test=true') && step === 0) {
      const mockAnswers = {};
      for (let i = 1; i <= 30; i++) {
        mockAnswers[i] = Math.floor(Math.random() * 5) + 1; // 1~5 random
      }
      setAnswers(mockAnswers);
      setName('테스터');
      
      const res = calculateScores(mockAnswers);
      const levelInfo = getLevelInfo(res.totalScore);
      const threeSkills = getThreeSkills(res.processedScores);
      const persona = getPersonaAndPrescription(res.domainScores, res.totalScore);

      setResult({ ...res, levelInfo, threeSkills, persona });
      setStep(6);
      
      // Clean up URL to avoid looping on refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [step]);

  // Auto-save to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('rsca_step', step.toString());
    sessionStorage.setItem('rsca_name', name);
    sessionStorage.setItem('rsca_answers', JSON.stringify(answers));
  }, [step, name, answers]);

  const handleTestPreview = () => {
    const mockAnswers = {};
    for (let i = 1; i <= 30; i++) {
      mockAnswers[i] = Math.floor(Math.random() * 5) + 1; // 1~5 random
    }
    setAnswers(mockAnswers);
    setName(name.trim() || '테스터');
    
    const res = calculateScores(mockAnswers);
    const levelInfo = getLevelInfo(res.totalScore);
    const threeSkills = getThreeSkills(res.processedScores);
    const persona = getPersonaAndPrescription(res.domainScores, res.totalScore);

    setResult({ ...res, levelInfo, threeSkills, persona });
    setStep(6);
    window.scrollTo(0, 0);
  };

  const handleStart = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("진단을 시작하려면 먼저 이름을 입력해 주세요.");
      return;
    }
    
    // 유효성 검사: 완성형 한글 또는 영문 대소문자, 2자~20자 (자음/모음 단독 불가)
    const nameRegex = /^[가-힣a-zA-Z\s]{2,20}$/;
    if (!nameRegex.test(trimmedName)) {
      alert("정확한 이름(또는 닉네임)을 2글자 이상 입력해 주세요.\n(자음/모음 단독 사용이나 특수문자는 불가능합니다.)");
      return;
    }

    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleNextStep = (currentStep) => {
    // Check if all 6 questions in the current step are answered
    const startIndex = (currentStep - 1) * 6;
    const currentQuestions = RSCA_QUESTIONS.slice(startIndex, startIndex + 6);
    
    for (const q of currentQuestions) {
      if (!answers[q.id]) {
        alert(`${q.id}번 문항에 응답해 주세요.`);
        questionRefs.current[q.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    if (currentStep < 5) {
      setStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Final step submit
      const res = calculateScores(answers);
      const levelInfo = getLevelInfo(res.totalScore);
      const threeSkills = getThreeSkills(res.processedScores);
      const persona = getPersonaAndPrescription(res.domainScores, res.totalScore);

      setResult({ ...res, levelInfo, threeSkills, persona });
      setStep(6); // Step 6 is Result
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    } else {
      setStep(0);
    }
  };

  const handleReset = () => {
    sessionStorage.clear();
    setStep(0);
    setAnswers({});
    setResult(null);
    setName('');
    window.scrollTo(0, 0);
  };

  // Step 0: Intro
  if (step === 0) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(16px, 3vh, 32px) 16px',
          boxSizing: 'border-box',
          backgroundColor: '#F7F5F0'
        }}
      >
        {/* 상단 텍스트 및 그래픽 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 2.5vh, 24px)' }}>
          <ReachEmblem />

          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <span
              style={{
                backgroundColor: '#1A2433',
                color: '#FFFFFF',
                fontSize: '15.5px', // 22px에서 약 30% 축소
                fontWeight: '600',
                letterSpacing: '0.04em',
                padding: '8px 24px',
                borderRadius: '9999px'
              }}
            >
              REACH Self-Care Assessment
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(22px, 3.5vw, 26px)',
              fontWeight: '700',
              color: '#1A2433',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}
          >
            RSCA 자가진단
          </h1>

          <p
            style={{
              fontSize: '13.5px',
              color: '#4B5563',
              lineHeight: '1.5',
              margin: 0
            }}
          >
            나의 셀프케어 상태를 진단합니다.<br />
            모든 문항은 직관적으로 솔직하게 답해 주세요.
          </p>
        </div>

        {/* 일체형 입력 카드 */}
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: 'clamp(20px, 3vh, 28px)',
            boxShadow: '0 10px 25px -5px rgba(26, 36, 51, 0.05)',
            boxSizing: 'border-box'
          }}
        >
          <label
            htmlFor="user-name"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#1A2433',
              marginBottom: '8px'
            }}
          >
            이름 (필수)
          </label>

          <input
            id="user-name"
            type="text"
            placeholder="이름이나 닉네임을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FAFAFA',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '6px'
            }}
          />

          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 18px 2px' }}>
            결과지에 성함이 함께 표기됩니다.
          </p>

          <button
            type="button"
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '17px',
              fontWeight: '700',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #1A2433 0%, #2A374A 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(26, 36, 51, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.02em',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(26, 36, 51, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 36, 51, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1px)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(26, 36, 51, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
            }}
          >
            진단 시작하기
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Step 1~5: Quiz
  if (step >= 1 && step <= 5) {
    const startIndex = (step - 1) * 6;
    const currentQuestions = RSCA_QUESTIONS.slice(startIndex, startIndex + 6);
    const progressPercent = (step / 5) * 100;

    return (
      <div className="container">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-header">
            <span>진행률</span>
            <span>[{step}/5 단계] {progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        
        {currentQuestions.map((q) => (
          <div 
            key={q.id} 
            ref={el => questionRefs.current[q.id] = el}
            className={`question-card ${answers[q.id] ? 'answered' : ''}`}
          >
            <div className="question-title">{q.id}. {q.text}</div>
            <div className="options-grid">
              {[
                { val: 1, label: '1 (전혀 아니다)' },
                { val: 2, label: '2 (그렇지 않다)' },
                { val: 3, label: '3 (보통이다)' },
                { val: 4, label: '4 (그렇다)' },
                { val: 5, label: '5 (매우 그렇다)' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  className={`option-btn ${answers[q.id] === opt.val ? 'selected' : ''}`}
                  onClick={() => handleAnswer(q.id, opt.val)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingBottom: '40px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={handlePrevStep}>
            이전
          </button>
          <button className="btn-primary" style={{ flex: 2 }} onClick={() => handleNextStep(step)}>
            {step === 5 ? '결과 확인하기' : '다음'}
          </button>
        </div>
      </div>
    );
  }

  // Step 6: Result
  if (step === 6 && result) {
    const chartData = [
      { subject: 'R (주도적 충전)', A: result.domainScores.R, fullMark: 30 },
      { subject: 'E (감정 수용)', A: result.domainScores.E, fullMark: 30 },
      { subject: 'A (풍요 마인드)', A: result.domainScores.A, fullMark: 30 },
      { subject: 'C (자기 자비)', A: result.domainScores.C, fullMark: 30 },
      { subject: 'H (건강한 경계선)', A: result.domainScores.H, fullMark: 30 },
    ];

    const maxScore = Math.max(...chartData.map(d => d.A));
    const minScore = Math.min(...chartData.map(d => d.A));

    return (
      <div className="container" style={{ paddingBottom: '60px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px', margin: '0 0 4px 0' }}>
            {name ? `${name} 님의 셀프케어 리포트` : '셀프케어 리포트'}
          </p>
          <p style={{ fontSize: '16px', color: '#1A2433', fontWeight: '500', lineHeight: '1.6', margin: 0, padding: '0 16px', wordBreak: 'keep-all' }}>
            "{result.levelInfo.quote}"
          </p>
        </div>
        
        <div ref={resultRef} style={{ backgroundColor: '#FDFBF7', padding: '16px', margin: '-16px', borderRadius: '24px' }}>
          {/* Total Score & Level */}
          <div className="card-wrapper" style={{ textAlign: 'center', backgroundColor: 'var(--color-navy-primary)', color: '#fff', border: 'none' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', opacity: 0.9, marginBottom: '12px', letterSpacing: '0.02em' }}>총점: {result.totalScore} / 150</div>
          <h2 style={{ color: '#fff', fontSize: '28px', margin: '0 0 16px 0' }}>{result.levelInfo.title}</h2>
          <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '16px', fontSize: '14px', marginBottom: '16px' }}>
            Level {result.levelInfo.level}
          </div>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '16px', opacity: 0.9, wordBreak: 'keep-all', padding: '0 10px', whiteSpace: 'pre-line' }}>{result.levelInfo.description}</p>
        </div>
        
        {/* Radar Chart */}
        <div className="card-wrapper">
          <div className="result-section-title">REACH 영역별 역량</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#415A77" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#1A2433" stopOpacity={0.8} />
                  </linearGradient>
                  <filter id="radarShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
                  </filter>
                </defs>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#1A2433', fontSize: 14, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#1A2433" strokeWidth={3} fill="url(#radarGradient)" style={{ filter: 'url(#radarShadow)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', position: 'relative', marginTop: '16px' }}>
            {chartData.map(d => {
              const isLowest = d.A === minScore;
              const isHighest = d.A === maxScore && d.A !== minScore; // 모든 점수가 동점일 땐 표시 안 함
              
              const bg = isLowest ? '#FFF8F5' : isHighest ? '#F4F6F8' : 'var(--color-beige-bg)';
              const textColor = isLowest ? '#C86245' : isHighest ? '#475569' : 'var(--color-text-muted)';
              const scoreColor = isLowest ? '#B34A2E' : isHighest ? '#1A2433' : 'var(--color-navy-primary)';
              const border = isLowest ? '1.5px solid #E27D60' : isHighest ? '1.5px solid #334155' : '1px solid rgba(26, 36, 51, 0.05)';

              return (
                <div key={d.subject} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0', backgroundColor: bg, borderRadius: '12px', border: border, transition: 'all 0.3s', position: 'relative' }}>
                  {isLowest && (
                    <div style={{ position: 'absolute', top: '-12px', backgroundColor: '#E27D60', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', letterSpacing: '-0.02em', boxShadow: '0 2px 4px rgba(226, 125, 96, 0.2)', whiteSpace: 'nowrap' }}>
                      집중 케어
                    </div>
                  )}
                  {isHighest && (
                    <div style={{ position: 'absolute', top: '-12px', backgroundColor: '#1A2433', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', letterSpacing: '-0.02em', boxShadow: '0 2px 4px rgba(26, 36, 51, 0.2)', whiteSpace: 'nowrap' }}>
                      최고 영역
                    </div>
                  )}
                  <span style={{ color: textColor, fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>{d.subject.split(' ')[0]}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <strong style={{ color: scoreColor, fontSize: '18px' }}>{d.A}</strong>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>/30</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div> {/* Close Radar Chart card-wrapper */}
        
        </div> {/* Close resultRef div */}
          
        {/* REACH 5대 영역 해설 */}
        <div style={{ marginTop: '16px', borderRadius: '12px', border: '1px solid rgba(26, 36, 51, 0.08)', overflow: 'hidden', backgroundColor: '#fff' }}>
          <div style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--color-navy-primary)', borderBottom: '1px solid rgba(26, 36, 51, 0.04)' }}>
            REACH 5대 영역이란?
          </div>
          
          <div style={{ padding: '16px' }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-main)' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#1A2433' }}>R (주도적 충전):</strong> 방전되기 전 스스로 멈추고 에너지를 회복하는 의도적 쉼
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#1A2433' }}>E (감정 수용):</strong> 불편한 감정을 억압하지 않고 파도처럼 흘려보내는 직시의 힘
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#1A2433' }}>A (풍요 마인드):</strong> 결핍과 비교에서 벗어나 이미 존재하는 내면 자원에 머무는 태도
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#1A2433' }}>C (자기 자비):</strong> 실수나 한계 앞에서도 가혹한 비난 대신 따뜻한 벗이 되어주는 태도
              </li>
              <li>
                <strong style={{ color: '#1A2433' }}>H (건강한 경계선):</strong> 타인의 감정에 휘둘리지 않고 나만의 심리적 안전거리를 지키는 힘
              </li>
            </ul>
          </div>
        </div>

        {/* Persona & Prescription */}
        <div className="card-wrapper" style={{ marginTop: '16px' }}>
          <div className="result-section-title">감정 패턴분석과 맞춤 셀프케어</div>
          {result.persona.minDomain && (
            <div style={{ fontSize: '13px', color: '#3B82F6', backgroundColor: '#EFF6FF', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', marginBottom: '12px', fontWeight: '600' }}>
              * 가장 집중적인 충전이 필요한 {result.persona.minDomain} 영역을 중심으로 안내합니다.
            </div>
          )}
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{result.persona.persona}</h3>
          <p style={{ lineHeight: 1.6, marginBottom: '24px', color: 'var(--color-text-muted)', fontSize: '15px' }}>{result.persona.personaDesc}</p>
          
          <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--color-navy-primary)', fontSize: '16px' }}>추천 셀프케어 가이드</h4>
            
            <div style={{ position: 'relative', paddingLeft: '24px' }}>
              {/* 세로 실선 */}
              <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: '24px', width: '2px', backgroundColor: '#E2E8F0' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Step 1: Trigger */}
                <div style={{ position: 'relative' }}>
                  {/* 점(●) */}
                  <div style={{ position: 'absolute', left: '-22.5px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6B7280', border: '2px solid #F8FAFC' }}></div>
                  <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '700', marginBottom: '6px' }}>1. 신호 (Trigger)</div>
                  <div style={{ fontSize: '15px', color: 'var(--color-text-main)', lineHeight: '1.6' }}>{result.persona.mvr.trigger}</div>
                </div>
                
                {/* Step 2: Action */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22.5px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3B82F6', border: '2px solid #F8FAFC' }}></div>
                  <div style={{ fontSize: '14px', color: '#3B82F6', fontWeight: '700', marginBottom: '6px' }}>2. 행동 (Action)</div>
                  <div style={{ fontSize: '15px', color: 'var(--color-navy-primary)', lineHeight: '1.6', fontWeight: '600' }}>{result.persona.mvr.action}</div>
                </div>

                {/* Step 3: Effect */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22.5px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #F8FAFC' }}></div>
                  <div style={{ fontSize: '14px', color: '#10B981', fontWeight: '700', marginBottom: '6px' }}>3. 변화 (Effect)</div>
                  <div style={{ fontSize: '15px', color: 'var(--color-text-main)', lineHeight: '1.6' }}>{result.persona.mvr.effect}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Skills */}
        <div className="card-wrapper">
          <div className="result-section-title">실전 대처 스킬</div>
          <p style={{ fontSize: '15.5px', color: 'var(--color-navy-primary)', fontWeight: '500', marginBottom: '20px', lineHeight: '1.6', wordBreak: 'keep-all' }}>일상의 자극으로부터 나를 지키는 3가지 핵심 감정 스킬</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.threeSkills.map(skill => {
              const isGood = skill.score >= 3.5;
              const badgeColor = isGood ? '#10B981' : '#F43F5E'; // Emerald for good, Rose for needs care
              const badgeBg = isGood ? '#ECFDF5' : '#FFF1F2';
              const badgeText = isGood ? '양호' : '보완 필요';
              const percent = (skill.score / 5) * 100;

              return (
                <div key={skill.id} style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #F3F4F6', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--color-navy-primary)', fontWeight: '700' }}>{skill.title}</h4>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: badgeBg, color: badgeColor, letterSpacing: '-0.02em' }}>
                          {badgeText}
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-main)', fontSize: '14px', marginTop: '2px' }}>{skill.subtitle}</div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-navy-primary)', textAlign: 'right' }}>
                      {skill.score.toFixed(1)} <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>/ 5.0</span>
                    </div>
                  </div>
                  
                  {/* Gauge Bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: badgeColor, borderRadius: '3px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                  
                  <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--color-text-main)', lineHeight: '1.6' }}>{skill.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleDownloadImage}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', border: 'none', color: '#475569', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '10px 16px', borderRadius: '10px', transition: 'background 0.2s' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              진단 리포트 이미지로 저장하기
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="https://product.kyobobook.co.kr/detail/S000217178170" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ flex: 1, backgroundColor: '#fff', borderRadius: '16px', padding: '20px 16px', textDecoration: 'none', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }}
            >
              <div style={{ fontSize: '28px' }}>📖</div>
              <div style={{ color: 'var(--color-navy-primary)', fontWeight: '700', fontSize: '15px', textAlign: 'center', lineHeight: '1.4' }}>도서 『셀프케어』<br/>자세히 보기</div>
            </a>
            <a 
              href="https://www.mcoaching.net/programs/intro" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ flex: 1, backgroundColor: '#fff', borderRadius: '16px', padding: '20px 16px', textDecoration: 'none', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }}
            >
              <div style={{ fontSize: '28px' }}>🧭</div>
              <div style={{ color: 'var(--color-navy-primary)', fontWeight: '700', fontSize: '15px', textAlign: 'center', lineHeight: '1.4' }}>셀프케어 프로그램<br/>알아보기</div>
            </a>
          </div>

          <button className="btn-secondary" onClick={handleReset} style={{ width: '100%', padding: '16px', borderRadius: '12px' }}>
            다시 진단하기 (초기화)
          </button>
        </div>
      </div>
    );
  }

  return null;
}

import RSCA5App from './components/RSCA5App';

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const typeParam = searchParams.get('type');
  
  if (typeParam === 'short') {
    return <RSCA5App onGoToDeepAssessment={() => { window.location.href = window.location.pathname; }} />;
  }

  return <RSCADeepApp />;
}
