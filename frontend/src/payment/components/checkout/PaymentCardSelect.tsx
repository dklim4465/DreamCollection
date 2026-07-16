import type { PaymentCard } from "@/payment/api/paymentCardApi";

interface Props {
  cards: PaymentCard[];
  cardId: number | null;
  onSelect: (cardId: number) => void;
  onRegisterOther: () => void;
}

export default function PaymentCardSelect({
  cards,
  cardId,
  onSelect,
  onRegisterOther,
}: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-title-md font-semibold">결제 카드</h2>
        <button
          type="button"
          className="btn-ghost text-label-sm"
          onClick={onRegisterOther}
        >
          다른 카드 등록
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          등록된 카드가 없습니다. 카드를 먼저 등록해 주세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cards.map((card) => (
            <li key={card.id}>
              <label className="card-base p-3 flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="card"
                  checked={cardId === card.id}
                  onChange={() => onSelect(card.id)}
                />
                <span>
                  {card.cardCompany ?? "카드"} ······{card.cardLast4}
                  {card.isDefault ? " (기본)" : ""}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
