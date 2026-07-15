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
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 z-50 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b p-5">
          <h2 className="text-xl font-semibold">
            {type === "create" ? "새 여행 기록" : "여행 기록 삭제"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-5">
          {type === "create" && (
            <div className="space-y-4">
              <input
                className="w-full rounded-lg border p-2"
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
                className="min-h-28 w-full rounded-lg border p-2"
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
                  className="rounded-lg border p-2"
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
                  className="rounded-lg border p-2"
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

              <p className="text-sm text-gray-500">
                선택된 파일 {files.length}개
              </p>
            </div>
          )}

          {type === "delete" && (
            <div className="space-y-2">
              <p>정말 삭제하시겠습니까?</p>

              <p className="text-sm text-red-500">
                삭제된 여행 기록은 복구할 수 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t p-5">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            취소
          </button>

          <button
            onClick={type === "create" ? handleCreate : onDelete}
            className={`rounded-lg px-4 py-2 text-white ${
              type === "create"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {type === "create" ? "생성" : "삭제"}
          </button>
        </div>
      </div>
    </>
  );
};

export default TripLogModalComponent;
