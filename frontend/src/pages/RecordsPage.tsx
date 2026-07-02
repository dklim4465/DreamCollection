import EmptyState from "@/components/common/EmptyState";

/**
 * 나의기록 페이지
 * TODO: 지난 여행 기록(사진, 후기, 타임라인) 목록 컴포넌트로 교체
 */
export default function RecordsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">나의기록</h1>
      </div>
      <EmptyState
        icon="📷"
        title="아직 기록이 없어요"
        description="다녀온 여행을 기록하고 추억을 모아보세요!"
      />
    </div>
  );
}
