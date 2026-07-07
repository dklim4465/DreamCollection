import { useQuery } from "@tanstack/react-query";
import {
  tripApi,
  tripOptionIcons,
  tripOptionLabels,
  type TripOptionType,
} from "@/api/trip";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Props {
  type: TripOptionType;
  value?: string;
  onSelect: (selected: string) => void;
}

// 로딩중이면 로딩창 보여주고, 하니면 쿼리로 하나씩 받아와서 보여주기(누구와, 일정 ~~~ 등등)
export default function TripOptionSelector({ type, value, onSelect }: Props) {
  const { data: options = [], isLoading } = useQuery({
    queryKey: ["tripOptions", type],
    queryFn: () => tripApi.getOptions(type),
  });

  // 로딩창 보여주기
  if (isLoading) {
    return (
      <LoadingSpinner message={`${tripOptionLabels[type]} 불러오는 중...`} />
    );
  }

  // 기본적인 선택지 틀
  return (
    <section className="card-base p-stack-lg">
      <div className="flex items-center gap-stack-sm mb-stack-md">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined">
            {tripOptionIcons[type]}
          </span>
        </div>
        <div>
          <h2 className="text-headline-sm font-bold">
            {tripOptionLabels[type]}
          </h2>
          <p className="text-label-md text-on-surface-variant">
            {tripOptionLabels[type]} 조건을 선택해주세요
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-stack-sm">
        {/* 백엔드에서 데이터를 받아와서 선택지 개수를 처리하기 때문에 map으로 하나씩 보여주게 하기 */}
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={
                selected
                  ? "p-stack-md rounded-2xl bg-primary text-on-primary text-label-md font-semibold"
                  : "p-stack-md rounded-2xl bg-surface-container-low hover:bg-primary-container text-label-md font-semibold"
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
