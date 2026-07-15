import { X } from "lucide-react";
import { TripLogResponseDTO } from "@/travelog/types/tripLog";

interface TripLogSidebarProps {
  open: boolean;
  tripLog: TripLogResponseDTO | null;
  onClose: () => void;
}

const TripLogSidebarComponent = ({
  open,
  tripLog,
  onClose,
}: TripLogSidebarProps) => {
  return (
    <>
      {/* 배경 */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      )}

      {/* 사이드바 */}
      {open && (
        <aside
          className={`
          fixed right-0 top-0 z-50
          h-full w-[380px]
          bg-white shadow-xl
          transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        >
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-lg font-semibold">여행 기록</h2>

            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {tripLog && (
            <div className="space-y-6 p-5">
              {/* 썸네일 */}
              {tripLog.thumbnailPath && (
                <img
                  src={tripLog.thumbnailPath}
                  alt={tripLog.title || "No Thumbnail"}
                  className="h-48 w-full rounded-lg object-cover"
                />
              )}

              {/* 제목 */}
              <div>
                <p className="mb-1 text-sm text-gray-500">제목</p>
                <p className="text-xl font-semibold">{tripLog.title}</p>
              </div>

              {/* 기간 */}
              <div>
                <p className="mb-1 text-sm text-gray-500">여행 기간</p>
                <p>
                  {tripLog.startDate} ~ {tripLog.endDate}
                </p>
              </div>

              {/* 설명 */}
              {tripLog.description && (
                <div>
                  <p className="mb-1 text-sm text-gray-500">설명</p>
                  <p className="whitespace-pre-wrap">{tripLog.description}</p>
                </div>
              )}

              {/* 태그 */}
              {tripLog.tags && tripLog.tags.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-gray-500">태그</p>

                  <div className="flex flex-wrap gap-2">
                    {tripLog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 생성일 */}
              <div>
                <p className="mb-1 text-sm text-gray-500">생성일</p>
                <p>{tripLog.createdAt}</p>
              </div>

              {/* 수정일 */}
              <div>
                <p className="mb-1 text-sm text-gray-500">수정일</p>
                <p>{tripLog.modifiedAt}</p>
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
};

export default TripLogSidebarComponent;
