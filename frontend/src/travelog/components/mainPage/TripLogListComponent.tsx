import { Search, Plus } from "lucide-react";
import { TripLogResponseDTO } from "@/travelog/types/tripLog";
import TripLogCardMenu from "@/travelog/components/mainPage/TripLogCardMenu";
import { Link } from "react-router-dom";

interface TripLogListProps {
  tripLogs: TripLogResponseDTO[];
  searchKeyword: string;
  sort: "modified" | "created";
  onSearchChange: (keyword: string) => void;
  onSortChange: (sort: "modified" | "created") => void;
  onDetailClick: (tripLog: TripLogResponseDTO) => void;
  onDeleteClick: (tripLog: TripLogResponseDTO) => void;
  onCreateClick: () => void;
}

const TripLogListComponent = ({
  tripLogs,
  searchKeyword,
  sort,
  onSearchChange,
  onSortChange,
  onDetailClick,
  onDeleteClick,
  onCreateClick,
}: TripLogListProps) => {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-white">
      {/* 검색 + 생성 */}
      <div className="flex items-center gap-3 border-b p-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            className="w-full rounded-lg border py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="여행 기록 검색"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select
            value={sort}
            onChange={(e) =>
              onSortChange(e.target.value as "modified" | "created")
            }
          >
            <option value="modified">최근 수정순</option>
            <option value="created">생성순</option>
          </select>
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />새 여행
        </button>
      </div>

      {/* 여행 기록 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tripLogs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            여행 기록이 없습니다.
          </div>
        ) : (
          tripLogs.map((tripLog) => (
            <Link
              key={tripLog.tno}
              to={`/triplog/${tripLog.tno}`}
              className="block"
            >
              <div className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold">
                      {tripLog.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {tripLog.startDate} ~ {tripLog.endDate}
                    </p>
                  </div>

                  <TripLogCardMenu
                    onDetail={() => onDetailClick(tripLog)}
                    onDelete={() => onDeleteClick(tripLog)}
                  />
                </div>

                {tripLog.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {tripLog.description}
                  </p>
                )}

                {tripLog.tags && tripLog.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tripLog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default TripLogListComponent;
