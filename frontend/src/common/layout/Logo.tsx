/**
 * 팀 로고 컴포넌트
 * 로고 이미지: /public/logo.png (Dream Collection)
 * shrink-0 + max-w-none: 헤더가 flex 레이아웃이라, 화면(창) 너비에 따라
 * 다른 요소들과 공간을 다투면서 로고가 찌그러지듯 작아지는 문제가 있어 크기를 고정함.
 */
export default function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <img
        src="/logo.png"
        alt="Dream Collection 로고"
        className="h-16 w-auto max-w-none shrink-0 object-contain"
      />
    </div>
  );
}
