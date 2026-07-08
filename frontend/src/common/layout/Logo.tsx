/**
 * 팀 로고 컴포넌트
 * 로고 이미지: /public/logo.png (Dream Collection)
 */
export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="Dream Collection 로고" className="h-16 w-auto object-contain" />
    </div>
  );
}
