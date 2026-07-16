interface Props {
  adultCount: number;
  onChange: (count: number) => void;
}

export default function AdultCountField({ adultCount, onChange }: Props) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-title-md font-semibold">인원</h2>
      <label className="flex items-center gap-3">
        <span className="text-body-md">성인</span>
        <input
          type="number"
          min={1}
          max={9}
          value={adultCount}
          onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
          className="input-base w-24"
        />
      </label>
    </section>
  );
}
