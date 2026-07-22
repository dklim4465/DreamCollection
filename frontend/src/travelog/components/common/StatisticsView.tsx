import { useTripLogStatistics } from "@/travelog/hooks/useTripLogStatistics";
import { MapPinned, Images, Route, Globe, Receipt } from "lucide-react";

interface StatisticsViewProps {
  tno: number;
}

const formatDistance = (meter: number) => {
  if (meter < 1000) return `${meter} m`;
  return `${(meter / 1000).toFixed(1)} km`;
};

const getFlagEmoji = (country: string) =>
  String.fromCodePoint(
    ...country
      .toUpperCase()
      .split("")
      .map((c) => 127397 + c.charCodeAt(0)),
  );

const StatisticsView = ({ tno }: StatisticsViewProps) => {
  const { data, isLoading } = useTripLogStatistics(tno);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        통계를 불러오는 중...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        통계를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPinned size={16} />
            <span className="text-sm">스팟 수</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{data.spotCount}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Images size={16} />
            <span className="text-sm">사진 수</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{data.mediaCount}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Route size={16} />
            <span className="text-sm">총 이동거리</span>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {formatDistance(data.totalDistance)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt size={16} />
            <span className="text-sm">총 지출</span>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {data.totalAmount.toLocaleString()}원
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          <Globe size={16} />
          <span className="text-sm">방문 국가</span>
        </div>

        {data.countries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            방문 국가 정보가 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.countries.map((country) => (
              <div
                key={country}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1"
              >
                <span className="text-lg">{getFlagEmoji(country)}</span>
                <span className="text-sm font-medium">{country}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsView;
