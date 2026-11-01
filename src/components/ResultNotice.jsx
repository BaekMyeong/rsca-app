// 결과 화면 하단 안내문: 의학적 진단이 아님을 알리고, 필요 시 전문가 상담을 권함.
export const NOTICE_SHORT = '자기점검·교육용 참고 자료이며 의학적 진단이 아닙니다.';

export default function ResultNotice() {
  return (
    <div
      style={{
        marginTop: '16px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        fontSize: '13px',
        lineHeight: 1.7,
        color: '#475569',
        wordBreak: 'keep-all'
      }}
    >
      <div style={{ fontWeight: '700', color: '#1A2433', marginBottom: '6px' }}>결과를 읽기 전에</div>
      <div>
        이 결과는 의학적 진단이 아닌 자기점검·교육용 참고 자료입니다. 점수 구간과 기준점은 검증된 규준이 아니라
        교육용 참고 기준이며, 응답한 시점의 상태에 따라 달라질 수 있습니다.
      </div>
      <div style={{ marginTop: '6px' }}>
        마음이 많이 힘들거나 일상이 어려운 상태가 이어진다면 혼자 견디지 말고 전문가와 상담해 보세요.
      </div>
    </div>
  );
}
