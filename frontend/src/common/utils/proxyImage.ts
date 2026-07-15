/**
 * 외부 이미지 URL(Unsplash 등)을 우리 백엔드 프록시(/api/images/proxy)를 거치도록 바꿔주는 헬퍼.
 *
 * 일부 브라우저 광고 차단 확장 프로그램이 images.unsplash.com 같은 외부 이미지 CDN에서
 * 페이지 안에 삽입된 요청만 조용히 차단하는 경우가 있어서, 같은 출처(same-origin) API 호출로
 * 감싸서 그런 차단을 우회한다. (백엔드: ImageProxyController)
 */
export function proxyImage(url: string | null | undefined): string | null {
  if (!url) return null;
  return `/api/images/proxy?url=${encodeURIComponent(url)}`;
}
