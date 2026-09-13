import React, { useState } from 'react';
import { RSCA5_QUESTIONS } from '../data/rsca5Questions';
import { calculateRSCA5 } from '../logic/rsca5Logic';

export default function RSCA5App({ onGoToDeepAssessment }) {
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = (id, score) => {
    setAnswers((prev) => ({ ...prev, [id]: score }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      <div style={{ maxWidth: '460px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif', color: '#1A2433' }}>
        {/* 상단 헤더 */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.04em' }}>
            RSCA-5 LITE RESULT
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '6px 0 2px 0' }}>
            {userName ? `${userName} 님의 감정 배터리` : '나의 감정 배터리 진단'}
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            핵심 5문항으로 살펴본 현재 마음 잔량입니다.
          </p>
        </header>

        {/* 1. 배터리 게이지 메인 카드 */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px 20px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', backgroundColor: levelInfo.bgColor, color: levelInfo.color, padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
            {levelInfo.title}
          </div>

          <div style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {totalScore} <span style={{ fontSize: '16px', fontWeight: '500', color: '#94A3B8' }}>/ 25점</span>
          </div>

          {/* 배터리 형태 바 게이지 */}
          <div style={{ width: '100%', height: '14px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', margin: '14px 0 8px 0' }}>
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: levelInfo.color,
                borderRadius: '9999px',
                transition: 'width 0.8s ease'
              }}
            />
          </div>

          <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: '1.5', margin: '12px 0 0 0' }}>
            {levelInfo.desc}
          </p>
        </div>

        {/* 2. 가장 시급한 돌봄 영역 하이라이트 */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#BE123C', backgroundColor: '#FFE4E6', padding: '2px 8px', borderRadius: '4px' }}>
              우선 점검 권고
            </span>
            <strong style={{ fontSize: '14px', color: '#1A2433' }}>
              {lowestDomain.name} ({lowestDomain.key})
            </strong>
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
            현재 5대 영역 중 회복 에너지가 가장 낮게 측정되었습니다. 이 영역의 누수를 우선적으로 보살펴주어야 감정 균형이 안정권으로 올라섭니다.
          </p>
        </div>

        {/* 3. RSCA-30 정밀 진단 유도 (잠금 배너 카드) */}
        <div style={{ backgroundColor: '#1A2433', borderRadius: '16px', padding: '22px 20px', color: '#FFFFFF', marginBottom: '16px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', backgroundColor: '#334155', color: '#E2E8F0', padding: '3px 10px', borderRadius: '9999px', marginBottom: '10px' }}>
            DEEP ASSESSMENT
          </span>
          <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
            REACH 5각 균형망과 3대 대처 스킬 확인하기
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 18px 0', lineHeight: '1.4' }}>
            5개 영역 상세 점수와 순간 대처력(거리두기·다독이기·울타리치기)은 30문항 정밀 검사에서 상세 리포트로 제공됩니다.
          </p>

          <button
            type="button"
            onClick={onGoToDeepAssessment}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#FFFFFF',
              color: '#1A2433',
              fontSize: '14.5px',
              fontWeight: '700',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            RSCA-30 정밀 진단 진행하기 (약 3분) →
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#64748B', border: 'none', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          간이 진단 다시하기
        </button>
      </div>
    );
  }

  // --- 설문 입력 화면 ---
  return (
    <div style={{ maxWidth: '460px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif', color: '#1A2433' }}>
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#1A2433', backgroundColor: '#E2E8F0', padding: '3px 10px', borderRadius: '9999px' }}>
          30초 쾌속 점검
        </span>
        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '10px 0 6px 0', letterSpacing: '-0.02em' }}>
          RSCA-5 감정 배터리 체크
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
          나의 내면 에너지 잔량을 5개 핵심 문항으로 확인합니다.
        </p>
      </header>

      {/* 성함 입력 */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '14px 16px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
        <label htmlFor="user-name" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
          성함 (선택)
        </label>
        <input
          id="user-name"
          type="text"
          placeholder="결과지에 표시할 이름을 적어주세요"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', fontSize: '13.5px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {RSCA5_QUESTIONS.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          return (
            <div
              key={q.id}
              id={`rsca5-q-${q.id}`}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: isAnswered ? '1px solid #E2E8F0' : '1px solid #FCA5A5',
                marginBottom: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>0{idx + 1}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#1A2433', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                  {q.domainName} ({q.domain})
                </span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.45', margin: '0 0 14px 0', color: '#1E293B' }}>
                {q.text}
              </p>

              {/* 1~5점 가로 칩 */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((val) => {
                  const selected = answers[q.id] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelect(q.id, val)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        fontSize: '13.5px',
                        fontWeight: selected ? '700' : '500',
                        color: selected ? '#FFFFFF' : '#475569',
                        backgroundColor: selected ? '#1A2433' : '#F8FAFC',
                        border: selected ? '1px solid #1A2433' : '1px solid #E2E8F0',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {val}점
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {errorMsg && (
          <div style={{ padding: '10px', backgroundColor: '#FFE4E6', color: '#BE123C', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', textAlign: 'center', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#1A2433',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(26, 36, 51, 0.12)'
          }}
        >
          결과 확인하기
        </button>
      </form>
    </div>
  );
}
