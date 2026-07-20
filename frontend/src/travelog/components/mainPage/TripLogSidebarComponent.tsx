import { X } from "lucide-react";
import { TripLogResponseDTO } from "@/travelog/types/tripLog";
import { useEffect, useState } from "react";
import useDebounce from "@/travelog/hooks/useDebounce";
import { useUpdateTripLog } from "@/travelog/hooks/useUpdateTripLog";

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
  if (!tripLog) return;

  const [title, setTitle] = useState(tripLog.title ?? "");
  const [description, setDescription] = useState(tripLog.description ?? "");
  const [startDate, setStartDate] = useState(tripLog.startDate ?? "");
  const [endDate, setEndDate] = useState(tripLog.endDate ?? "");

  const debouncedTitle = useDebounce(title, 3000);
  const debouncedDescription = useDebounce(description, 3000);
  const debouncedStartDate = useDebounce(startDate, 3000);
  const debouncedEndDate = useDebounce(endDate, 3000);

  const updateMutation = useUpdateTripLog();

  useEffect(() => {
    if (!tripLog) return;

    if (
      debouncedTitle === tripLog.title &&
      debouncedDescription === (tripLog.description ?? "") &&
      debouncedStartDate === tripLog.startDate &&
      debouncedEndDate === tripLog.endDate
    ) {
      return;
    }

    updateMutation.mutate({
      tno: tripLog.tno,
      request: {
        title: debouncedTitle,
        description: debouncedDescription,
        startDate: debouncedStartDate,
        endDate: debouncedEndDate,
        thumbnailMediaMno: null,
        countryCode: tripLog.countryCode,
      },
    });
  }, [
    debouncedTitle,
    debouncedDescription,
    debouncedStartDate,
    debouncedEndDate,
  ]);

  return (
    <>
      {/* 배경 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      {open && (
        <aside
          className="
            fixed right-0 top-0 z-50
            flex h-full w-full max-w-[380px] flex-col
            bg-surface-container-lowest
            traveler-glow
            transition-transform duration-300
          "
        >
          <div className="flex items-center justify-between border-b border-outline-variant p-5">
            <h2 className="text-title-md font-bold text-on-surface">
              여행 기록
            </h2>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-variant active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {tripLog && (
            <div className="flex-1 overflow-y-auto space-y-6 p-5">
              {/* 썸네일 */}
              {tripLog.thumbnailPath && (
                <img
                  src={tripLog.thumbnailPath}
                  alt={tripLog.title || "No Thumbnail"}
                  className="h-48 w-full rounded-2xl object-cover"
                />
              )}

              {/* 제목 */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-transparent p-2"
              />

              {/* 기간 */}
              <div>
                <p className="mb-1 text-label-sm text-on-surface-variant">
                  여행 기간
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="
                      rounded-md
                      border border-outline-variant
                      bg-surface-container
                      px-3 py-2
                      text-body-md text-on-surface
                      outline-none
                    "
                  />

                  <span>~</span>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="
                      rounded-md
                      border border-outline-variant
                      bg-surface-container
                      px-3 py-2
                      text-body-md text-on-surface
                      outline-none
                    "
                  />
                </div>
              </div>

              {/* 설명 */}
              {tripLog.description && (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32 w-full rounded-lg border border-outline-variant bg-transparent p-2"
                />
              )}

              {/* 태그 */}
              {tripLog.tags && tripLog.tags.length > 0 && (
                <div>
                  <p className="mb-2 text-label-sm text-on-surface-variant">
                    태그
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {tripLog.tags.map((tag) => (
                      <span key={tag} className="chip-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 생성일 */}
              <div>
                <p className="mb-1 text-label-sm text-on-surface-variant">
                  생성일
                </p>
                <p className="text-body-md text-on-surface">
                  {tripLog.createdAt}
                </p>
              </div>

              {/* 수정일 */}
              <div>
                <p className="mb-1 text-label-sm text-on-surface-variant">
                  수정일
                </p>
                <p className="text-body-md text-on-surface">
                  {tripLog.modifiedAt}
                </p>
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
};

export default TripLogSidebarComponent;
