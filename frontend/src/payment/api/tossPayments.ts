// 토스페이먼츠 SDK(CDN)를 동적으로 로드합니다.
// npm 패키지(@tosspayments/payment-sdk) 대신 CDN 스크립트 방식을 쓰면
// 별도 설치 없이 바로 사용할 수 있습니다.

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

interface TossPaymentsInstance {
  requestBillingAuth: (
    method: "카드",
    options: {
      customerKey: string;
      successUrl: string;
      failUrl: string;
    },
  ) => Promise<void>;
}

let loadingPromise: Promise<void> | null = null;

function loadTossScript(): Promise<void> {
  if (window.TossPayments) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("토스페이먼츠 SDK 로드 실패"));
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export async function requestCardBillingAuth(
  clientKey: string,
  customerKey: string,
): Promise<void> {
  await loadTossScript();
  if (!window.TossPayments) throw new Error("토스페이먼츠 SDK를 불러오지 못했습니다.");

  const tossPayments = window.TossPayments(clientKey);

  await tossPayments.requestBillingAuth("카드", {
    customerKey,
    successUrl: `${window.location.origin}/billing/success`,
    failUrl: `${window.location.origin}/billing/fail`,
  });
  // 성공/실패 시 토스가 successUrl/failUrl로 브라우저를 리다이렉트하므로
  // 이 함수는 리다이렉트 전까지만 실행되고 이후 흐름은 해당 페이지에서 처리됨
}
