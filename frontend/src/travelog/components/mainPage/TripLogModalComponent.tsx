import { TripLogRequestDTO } from "@/travelog/types/tripLog";
import { useState } from "react";

interface TripLogModalProps {
  open: boolean;
  type: "create" | "delete" | null;
  onClose: () => void;
  onCreate: (request: TripLogRequestDTO, files: File[]) => void;
  onDelete: () => void;
}

const TripLogModalComponent = ({
  open,
  type,
  onClose,
  onCreate,
  onDelete,
}: TripLogModalProps) => {
  const [request, setRequest] = useState<TripLogRequestDTO>({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  if (!open || type === null) return null;

  const handleCreate = () => {
    onCreate(request, files);

    setRequest({
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setFiles([]);

    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="traveler-glow fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-surface-container-lowest">
        {/* Header */}
        <div className="border-b border-outline-variant p-5">
          <h2 className="text-title-md font-bold text-on-surface">
            {type === "create" ? "새 여행 기록" : "여행 기록 삭제"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-5">
          {type === "create" && (
            <div className="space-y-4">
              <input
                className="input-base"
                placeholder="여행 제목"
                value={request.title ?? ""}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />

              <textarea
                className="input-base min-h-28 resize-none"
                placeholder="설명"
                value={request.description ?? ""}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="input-base"
                  value={request.startDate ?? ""}
                  onChange={(e) =>
                    setRequest((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />

                <input
                  type="date"
                  className="input-base"
                  value={request.endDate ?? ""}
                  onChange={(e) =>
                    setRequest((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>

              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  if (!e.target.files) return;

                  setFiles(Array.from(e.target.files));
                }}
              />

              <p className="text-body-sm text-on-surface-variant">
                선택된 파일 {files.length}개
              </p>
            </div>
          )}

          {type === "delete" && (
            <div className="space-y-2">
              <p className="text-body-md text-on-surface">
                정말 삭제하시겠습니까?
              </p>

              <p className="text-body-sm text-error">
                삭제된 여행 기록은 복구할 수 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-outline-variant p-5">
          <button onClick={onClose} className="btn-ghost">
            취소
          </button>

          <button
            onClick={type === "create" ? handleCreate : onDelete}
            className={
              type === "create"
                ? "btn-primary"
                : "rounded-xl bg-error px-6 py-3 font-bold text-on-error transition-opacity hover:opacity-90 active:scale-95 text-label-md"
            }
          >
            {type === "create" ? "생성" : "삭제"}
          </button>
        </div>
      </div>
    </>
  );
};

export default TripLogModalComponent;
