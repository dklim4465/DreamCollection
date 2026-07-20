import { Search, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { TripLogResponseDTO } from "@/travelog/types/tripLog";
import TripLogCardMenu from "@/travelog/components/mainPage/TripLogCardMenu";
import { Link } from "react-router-dom";
import EmptyState from "@/common/component/EmptyState";
import { getTripLogThumbnailUrl } from "@/travelog/utils/media";

interface TripLogListProps {
  tripLogs: TripLogResponseDTO[];
  searchKeyword: string;
  sort: "modified" | "created" | "startDate";
  order: "asc" | "desc";
  onSearchChange: (keyword: string) => void;
  onSortChange: (sort: "modified" | "created") => void;
  onOrderChange: (order: "asc" | "desc") => void;
  onDetailClick: (tripLog: TripLogResponseDTO) => void;
  onDeleteClick: (tripLog: TripLogResponseDTO) => void;
  onCreateClick: () => void;
  onShareClick: (tripLog: TripLogResponseDTO) => void;
}

const TripLogListComponent = ({
  tripLogs,
  searchKeyword,
  sort,
  order,
  onSearchChange,
  onSortChange,
  onOrderChange,
  onDetailClick,
  onDeleteClick,
  onCreateClick,
  onShareClick,
}: TripLogListProps) => {
  return (
    <div className="flex h-full flex-col card-base">
      {/* 검색 + 생성 */}
      <div className="flex items-center gap-stack-md border-b border-outline-variant p-4">
        <div className="relative flex flex-1 items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />

            <input
              className="input-search w-full"
              placeholder="여행 기록 검색"
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <select
            className="bg-surface-container-low rounded-lg px-3 py-2 text-label-md text-on-surface outline-none"
            value={sort}
            onChange={(e) =>
              onSortChange(e.target.value as "modified" | "created")
            }
          >
            <option value="modified">최근 수정순</option>
            <option value="created">생성순</option>
            <option value="startDate">여행시작일순</option>
          </select>

          <button
            type="button"
            onClick={() => onOrderChange(order === "asc" ? "desc" : "asc")}
            className="rounded-lg border border-outline px-3 py-2 text-sm"
          >
            {order === "asc" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
          </button>
        </div>

        <button
          onClick={onCreateClick}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={18} />새 여행
        </button>
      </div>

      {/* 여행 기록 목록 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[600px] p-4 space-y-4">
        {tripLogs.length === 0 ? (
          <EmptyState
            icon="📷"
            title="아직 기록이 없어요"
            description="다녀온 여행을 기록하고 추억을 모아보세요!"
            action={
              <button onClick={onCreateClick} className="btn-primary">
                첫 일지 작성하기
              </button>
            }
          />
        ) : (
          tripLogs.map((tripLog) => (
            <Link
              key={tripLog.tno}
              to={`/triplog/${tripLog.tno}`}
              className="block"
            >
              <div className="card-interactive overflow-visible p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container">
                    {tripLog.thumbnailPath ? (
                      <img
                        src={getTripLogThumbnailUrl(tripLog)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-on-surface-variant">
                        {tripLog.title}
                      </div>
                    )}
                  </div>

                  <div className="card-interactive w-full overflow-visible p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-title-md font-bold text-on-surface">
                          {tripLog.title}
                        </h2>

                        <p className="mt-1 text-body-sm text-on-surface-variant">
                          {tripLog.startDate} ~ {tripLog.endDate}
                        </p>
                      </div>

                      <TripLogCardMenu
                        onDetail={() => onDetailClick(tripLog)}
                        onDelete={() => onDeleteClick(tripLog)}
                        onShare={() => onShareClick(tripLog)}
                      />
                    </div>

                    {tripLog.description && (
                      <p className="mt-3 line-clamp-2 text-body-md text-on-surface-variant">
                        {tripLog.description}
                      </p>
                    )}

                    {tripLog.tags && tripLog.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tripLog.tags.map((tag) => (
                          <span key={tag} className="chip-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default TripLogListComponent;
