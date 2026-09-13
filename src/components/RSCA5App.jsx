import React, { useState, useEffect } from 'react';
import { RSCA5_QUESTIONS } from '../data/rsca5Questions';
import { calculateRSCA5 } from '../logic/rsca5Logic';

export default function RSCA5App({ onGoToDeepAssessment }) {
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Test mode: auto-fill and jump to result if URL has ?test=true
  useEffect(() => {
    if (window.location.search.includes('test=true') && !submitted) {
      const mockAnswers = {};
      RSCA5_QUESTIONS.forEach(q => {
        mockAnswers[q.id] = Math.floor(Math.random() * 5) + 1;
      });
      setAnswers(mockAnswers);
      setUserName('테스터');
      setSubmitted(true);
      window.scrollTo(0, 0);
      
      // Clean up URL to avoid looping on refresh
      window.history.replaceState({}, '', window.location.pathname + '?type=short');
    }
  }, [submitted]);

  const handleSelect = (id, score) => {
    setAnswers((prev) => ({ ...prev, [id]: score }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      setErrorMsg('이름을 입력해 주세요.');
      const target = document.getElementById('user-name');
      if (target) target.focus();
      return;
    }

    // 5문항 응답 여부 점검
    const missing = RSCA5_QUESTIONS.find((q) => !answers[q.id]);
    if (missing) {
      setErrorMsg(`문항 ${missing.id}번에 응답해 주세요.`);
      const target = document.getElementById(`rsca5-q-${missing.id}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrorMsg('');
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 결과 화면 ---
  if (submitted) {
    const { totalScore, percentage, levelInfo, lowestDomain } = calculateRSCA5(answers);

    return (
      <div className="container">
        {/* 상단 헤더 */}
        <header style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 4px 0', fontWeight: '600', letterSpacing: '0.02em' }}>
            RSCA-5 CORE RESULT
          </p>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--color-navy-primary)' }}>
            {userName ? `${userName} 님의 코어 에너지 상태` : '나의 코어 에너지 상태'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            5가지 핵심 지표로 스캔한 현재의 내면 에너지 잔량입니다.
          </p>
        </header>

        {/* 1. 배터리 게이지 메인 카드 */}
        <div className="card-wrapper" style={{ textAlign: 'center', backgroundColor: 'var(--color-navy-primary)', color: '#fff', border: 'none', padding: '32px 20px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
            {levelInfo.title}
          </div>

          <div style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {totalScore} <span style={{ fontSize: '18px', fontWeight: '500', opacity: 0.7 }}>/ 25점</span>
          </div>

          {/* 배터리 형태 바 게이지 */}
          <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden', margin: '20px 0 16px 0' }}>
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: levelInfo.color === '#BE123C' ? '#E17055' : levelInfo.color === '#B45309' ? '#FDCB6E' : '#55EFEF', // adjusted to match dark theme better
                borderRadius: '9999px',
                transition: 'width 0.8s ease'
              }}
            />
          </div>

          <p style={{ fontSize: '15px', color: '#CBD5E1', lineHeight: '1.6', margin: '16px 0 0 0', fontWeight: '500' }}>
            {levelInfo.desc}
          </p>
        </div>

        {/* 2. 가장 시급한 돌봄 영역 하이라이트 */}
        <div className="card-wrapper" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#E17055', backgroundColor: '#FDF2F0', padding: '4px 10px', borderRadius: '6px' }}>
              우선 점검 권고
            </span>
            <strong style={{ fontSize: '16px', color: 'var(--color-navy-primary)' }}>
              {lowestDomain.name} ({lowestDomain.key})
            </strong>
          </div>
          <p style={{ fontSize: '14px', color: '#4A5568', margin: 0, lineHeight: '1.6' }}>
            현재 5대 영역 중 회복 에너지가 가장 낮게 측정되었습니다. 이 영역의 누수를 우선적으로 보살펴주어야 감정 균형이 안정권으로 올라섭니다.
          </p>
        </div>

        {/* 3. RSCA-30 정밀 진단 유도 (잠금 배너 카드) */}
        <div className="card-wrapper" style={{ backgroundColor: '#FDFBF7', border: '1px solid var(--color-accent)', padding: '28px 24px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '800', color: 'var(--color-navy-secondary)', backgroundColor: '#E2E8F0', padding: '4px 12px', borderRadius: '9999px', marginBottom: '12px' }}>
            DEEP ASSESSMENT
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 10px 0', color: 'var(--color-navy-primary)' }}>
            나의 내면 에너지를 더 깊이 알고 싶다면?
          </h3>
          <div style={{ backgroundColor: 'rgba(26, 36, 51, 0.04)', padding: '14px', borderRadius: '10px', fontSize: '13.5px', color: 'var(--color-navy-primary)', fontWeight: '700', lineHeight: '1.5' }}>
            ※ 5개 영역 상세 점수와 맞춤형 처방 리포트는<br/>SCF 인증과정에서 제공됩니다.
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn-secondary"
          style={{ marginTop: '8px' }}
        >
          다시 진단하기 (초기화)
        </button>
      </div>
    );
  }

  // --- 설문 입력 화면 ---
  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-navy-primary)', backgroundColor: '#E2E8F0', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block', marginBottom: '12px', letterSpacing: '0.05em' }}>
          CORE ASSESSMENT
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--color-navy-primary)', letterSpacing: '-0.02em' }}>
          RSCA-5 내면 에너지 코어 진단
        </h1>
        <p style={{ fontSize: '15px', color: '#4A5568', margin: 0, lineHeight: '1.6' }}>
          나의 멘탈 에너지 잔량을 5가지 핵심 지표로 정밀하게 스캔합니다.
        </p>
      </header>

      {/* 성함 입력 */}
      <div className="card-wrapper" style={{ padding: '24px' }}>
        <label htmlFor="user-name" style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--color-navy-primary)', marginBottom: '8px' }}>
          이름 (필수)
        </label>
        <input
          id="user-name"
          type="text"
          placeholder="결과지에 표시할 이름을 적어주세요"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '12px', border: '1px solid #CBD5E1', boxSizing: 'border-box', backgroundColor: 'var(--color-input-bg)' }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {RSCA5_QUESTIONS.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          return (
            <div
              key={q.id}
              id={`rsca5-q-${q.id}`}
              className={`question-card ${isAnswered ? 'answered' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-navy-secondary)' }}>0{idx + 1}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-navy-primary)', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                  {q.domainName} ({q.domain})
                </span>
              </div>
              <p className="question-title">
                {q.text}
              </p>

              {/* 1~5점 가로 칩 */}
              <div className="options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {[1, 2, 3, 4, 5].map((val) => {
                  const selected = answers[q.id] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      className={`option-btn ${selected ? 'selected' : ''}`}
                      onClick={() => handleSelect(q.id, val)}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {errorMsg && (
          <div style={{ padding: '16px', backgroundColor: '#FDF2F0', color: '#E17055', borderRadius: '12px', fontSize: '14px', marginBottom: '24px', textAlign: 'center', fontWeight: '700' }}>
            {errorMsg}
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ marginBottom: '40px' }}>
          결과 확인하기
        </button>
      </form>
    </div>
  );
}
