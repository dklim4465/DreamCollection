import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  value: string; // "YYYY-MM-DD" 형식
  onChange: (value: string) => void;
  min?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function parseValue(value: string) {
  if (!value) return { year: "", month: "", day: "" };
  const [year, month, day] = value.split("-");
  return { year: year ?? "", month: month ?? "", day: day ?? "" };
}

function parseDateOrNull(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseDateOrUndefined(value: string): Date | undefined {
  return parseDateOrNull(value) ?? undefined;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type ViewMode = "days" | "months" | "years";

export default function DateSelect({ value, onChange, min }: Props) {
  const [year, setYear] = useState(() => parseValue(value).year);
  const [month, setMonth] = useState(() => parseValue(value).month);
  const [day, setDay] = useState(() => parseValue(value).day);

  useEffect(() => {
    const parsed = parseValue(value);
    setYear(parsed.year);
    setMonth(parsed.month);
    setDay(parsed.day);
  }, [value]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("days");
  const [viewDate, setViewDate] = useState<Date>(
    () => parseDateOrNull(value) ?? new Date(),
  );

  const dayOptions =
    year && month
      ? Array.from(
          { length: getDaysInMonth(Number(year), Number(month)) },
          (_, i) => i + 1,
        )
      : Array.from({ length: 31 }, (_, i) => i + 1);

  const applySelection = (
    nextYear: string,
    nextMonth: string,
    nextDay: string,
  ) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(nextDay);
    if (nextYear && nextMonth && nextDay) {
      onChange(`${nextYear}-${nextMonth}-${nextDay}`);
    }
  };

  const openCalendar = () => {
    setViewDate(parseDateOrNull(value) ?? new Date());
    setViewMode("days");
    setShowCalendar(true);
  };

  const minDate = min
    ? parseDateOrUndefined(min)
    : new Date(CURRENT_YEAR, 0, 1);
  const maxDate = new Date(CURRENT_YEAR + 5, 11, 31);

  return (
    <div className="relative flex items-center gap-1.5">
      <select
        className="input-base"
        value={year}
        onChange={(e) => applySelection(e.target.value, month, day)}
      >
        <option value="">연도</option>
        {YEAR_OPTIONS.map((y) => (
          <option key={y} value={y}>
            {y}년
          </option>
        ))}
      </select>

      <select
        className="input-base"
        value={month}
        onChange={(e) => applySelection(year, pad(Number(e.target.value)), day)}
      >
        <option value="">월</option>
        {MONTH_OPTIONS.map((m) => (
          <option key={m} value={pad(m)}>
            {m}월
          </option>
        ))}
      </select>

      <select
        className="input-base"
        value={day}
        onChange={(e) =>
          applySelection(year, month, pad(Number(e.target.value)))
        }
      >
        <option value="">일</option>
        {dayOptions.map((d) => (
          <option key={d} value={pad(d)}>
            {d}일
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => (showCalendar ? setShowCalendar(false) : openCalendar())}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container"
        aria-label="달력에서 날짜 선택"
      >
        <span className="material-symbols-outlined text-lg">
          calendar_month
        </span>
      </button>

      {showCalendar && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-2 w-[280px]">
          {viewMode === "years" && (
            <div>
              <p className="text-center text-label-md font-bold mb-2">
                연도 선택
              </p>
              <div className="grid grid-cols-3 gap-2">
                {YEAR_OPTIONS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewDate((prev) => new Date(y, prev.getMonth(), 1));
                      setViewMode("days");
                    }}
                    className={`py-2 rounded-lg text-label-md ${
                      y === viewDate.getFullYear()
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === "months" && (
            <div>
              <p className="text-center text-label-md font-bold mb-2">
                {viewDate.getFullYear()}년 · 월 선택
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewDate(
                        (prev) => new Date(prev.getFullYear(), m - 1, 1),
                      );
                      setViewMode("days");
                    }}
                    className={`py-2 rounded-lg text-label-md ${
                      m === viewDate.getMonth() + 1
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {m}월
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === "days" && (
            <DatePicker
              selected={parseDateOrNull(value)}
              openToDate={viewDate}
              onChange={(date: Date | null) => {
                if (date) onChange(formatDate(date));
                setShowCalendar(false);
              }}
              minDate={minDate}
              maxDate={maxDate}
              locale={ko}
              inline
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="flex items-center justify-between px-2 pb-2">
                  <button
                    type="button"
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-30"
                    aria-label="이전 달"
                  >
                    <span className="material-symbols-outlined text-lg">
                      chevron_left
                    </span>
                  </button>

                  {/* 연도, 월을 각각 따로 클릭할 수 있게 분리 */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setViewDate(date);
                        setViewMode("years");
                      }}
                      className="text-label-md font-bold text-primary underline decoration-dotted"
                    >
                      {date.getFullYear()}년
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewDate(date);
                        setViewMode("months");
                      }}
                      className="text-label-md font-bold text-primary underline decoration-dotted"
                    >
                      {date.getMonth() + 1}월
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-30"
                    aria-label="다음 달"
                  >
                    <span className="material-symbols-outlined text-lg">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
