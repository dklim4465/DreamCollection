interface Props {
  estimatedTotal: number | null;
  adultCount: number;
  canSubmit: boolean;
  isPaying: boolean;
  onPay: () => void;
}

export default function CheckoutPaymentSidebar({
  estimatedTotal,
  adultCount,
  canSubmit,
  isPaying,
  onPay,
}: Props) {
  const hasAmount = estimatedTotal != null && estimatedTotal > 0;

  return (
    <aside className="card-base p-5 flex flex-col gap-4 lg:sticky lg:top-6">
      <h2 className="text-title-md font-semibold">결제 요약</h2>
      <dl className="flex flex-col gap-2 text-body-md">
        <div className="flex justify-between gap-3">
          <dt className="text-on-surface-variant">인원</dt>
          <dd>성인 {adultCount}명</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-outline-variant/40 pt-3">
          <dt className="font-semibold">총 결제금액</dt>
          <dd className="font-bold text-primary text-title-md">
            {estimatedTotal != null
              ? `${estimatedTotal.toLocaleString("ko-KR")}원`
              : "결제 시 확정"}
          </dd>
        </div>
      </dl>
      <button
        type="button"
        className="btn-primary w-full disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-on-surface-variant disabled:hover:opacity-100 disabled:active:scale-100"
        disabled={!canSubmit || isPaying || !hasAmount}
        onClick={onPay}
      >
        {isPaying ? "결제 중..." : "결제하기"}
      </button>
      <p className="text-label-sm text-on-surface-variant text-center">
        여행자·카드·약관 동의 후 결제할 수 있어요.
      </p>
    </aside>
  );
}
