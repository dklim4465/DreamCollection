/**
 * 팀 로고 컴포넌트
 * 로고 이미지: /public/logo.png (Dream Collection)
 */
export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* 💡 이미지를 정사각형(h-10 w-10)으로 제한하고 object-cover를 주어 상단 아이콘만 보이게 자릅니다 */}
      <img 
        src="/logo.png" 
        alt="Dream Collection 로고" 
        className="h-10 w-10 object-cover object-top shrink-0" 
      />
      
      {/* 💡 어두운 배경에서도 잘 보이도록 흰색(text-white) 텍스트를 코드로 직접 추가합니다 */}
      <span className="text-headline-sm font-bold text-white whitespace-nowrap">
        Dream Collection
      </span>
    </div>
  );
}