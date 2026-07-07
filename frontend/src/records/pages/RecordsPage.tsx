import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import EmptyState from "@/common/component/EmptyState";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import { recordsApi } from "@/records/api/recordsApi";

/**
 * 나의기록 (여행일지) 페이지
 * - 새 일지 생성
 * - 이미지 일괄 업로드 (mock: base64로 브라우저에 저장)
 * TODO: EXIF 위치/시간 추출 → 지도 기반 타임라인, 영수증 OCR 연동
 */
export default function RecordsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMemo, setNewMemo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["records"],
    queryFn: recordsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: () => recordsApi.create(newTitle, newMemo),
    onSuccess: () => {
      setShowNewForm(false);
      setNewTitle("");
      setNewMemo("");
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ logId, files }: { logId: number; files: File[] }) =>
      recordsApi.addPhotos(logId, files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["records"] }),
  });

  const logs = data?.data?.data ?? [];

  const handleFileSelect = (logId: number) => {
    setActiveLogId(logId);
    fileInputRef.current?.click();
  };

  const handleFilesChosen: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length && activeLogId !== null) {
      uploadMutation.mutate({ logId: activeLogId, files });
    }
    e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">나의기록</h1>
        <button onClick={() => setShowNewForm((v) => !v)} className="btn-primary">
          + 새 일지
        </button>
      </div>

      {/* 숨겨진 파일 인풋 (여러 장 선택 가능) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesChosen}
      />

      {showNewForm && (
        <div className="card-base p-stack-lg flex flex-col gap-3 mb-stack-lg">
          <input
            type="text"
            placeholder="일지 제목 (예: 오사카 3박 4일)"
            className="input-base"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="여행에 대한 기록을 남겨보세요"
            rows={3}
            className="input-base resize-none"
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNewForm(false)} className="btn-ghost text-sm py-2 px-4">
              취소
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!newTitle || createMutation.isPending}
              className="btn-primary text-sm py-2 px-4"
            >
              {createMutation.isPending ? "생성 중..." : "일지 만들기"}
            </button>
          </div>
        </div>
      )}

      {logs.length === 0 && !showNewForm ? (
        <EmptyState
          icon="📷"
          title="아직 기록이 없어요"
          description="다녀온 여행을 기록하고 추억을 모아보세요!"
          action={
            <button onClick={() => setShowNewForm(true)} className="btn-primary">
              첫 일지 작성하기
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-stack-lg">
          {logs.map((log) => (
            <div key={log.id} className="card-base p-stack-lg flex flex-col gap-stack-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-headline-sm font-bold">{log.title}</h3>
                  <p className="text-label-sm text-on-surface-variant">
                    {dayjs(log.createdAt).format("YYYY.MM.DD")}
                  </p>
                </div>
                <button
                  onClick={() => handleFileSelect(log.id)}
                  className="btn-ghost text-sm py-2 px-4 flex items-center gap-1.5"
                  disabled={uploadMutation.isPending && activeLogId === log.id}
                >
                  <span className="material-symbols-outlined text-base">add_a_photo</span>
                  {uploadMutation.isPending && activeLogId === log.id
                    ? "업로드 중..."
                    : "사진 추가"}
                </button>
              </div>

              {log.memo && (
                <p className="text-body-md text-on-surface-variant">{log.memo}</p>
              )}

              {log.photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {log.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-xl overflow-hidden bg-surface-container"
                    >
                      <img
                        src={photo.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
