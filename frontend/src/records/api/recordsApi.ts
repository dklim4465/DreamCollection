import type { ApiResponse, TravelLog, LogPhoto } from "@/types";
import { delay, readAll, writeAll, nextId, MOCK_KEYS } from "@/common/api/mockDb";
import { useAuthStore } from "@/auth/store/authStore";

function ok<T>(data: T): { data: ApiResponse<T> } {
  return { data: { success: true, message: "OK", data } };
}

function currentUserId(): number {
  return useAuthStore.getState().user?.id ?? 0;
}

function recordsKey() {
  return `${MOCK_KEYS.RECORDS}_${currentUserId()}`;
}

// 이미지 파일 → base64 Data URL 변환 (mock 단계: 서버 업로드 대신 브라우저에만 저장)
// TODO: 실제 연동 시 presigned URL 등으로 S3/스토리지에 업로드 후 image_url만 저장
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const recordsApi = {
  getAll: async (): Promise<{ data: ApiResponse<TravelLog[]> }> => {
    await delay(150);
    const all = readAll<TravelLog>(recordsKey());
    return ok(all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  },

  create: async (title: string, memo: string, scheduleId?: number): Promise<{ data: ApiResponse<TravelLog> }> => {
    await delay(200);
    const all = readAll<TravelLog>(recordsKey());
    const newLog: TravelLog = {
      id: nextId(all),
      title,
      memo,
      scheduleId,
      photos: [],
      createdAt: new Date().toISOString(),
    };
    all.push(newLog);
    writeAll(recordsKey(), all);
    return ok(newLog);
  },

  // 여러 장 이미지 업로드 → 해당 일지에 사진 추가
  // TODO: EXIF에서 위경도/촬영시간 자동 추출 (exifr 라이브러리 등 도입 시 대체)
  addPhotos: async (
    logId: number,
    files: File[],
  ): Promise<{ data: ApiResponse<TravelLog> }> => {
    const all = readAll<TravelLog>(recordsKey());
    const idx = all.findIndex((l) => l.id === logId);
    if (idx === -1) throw new Error("일지를 찾을 수 없습니다.");

    const newPhotos: LogPhoto[] = [];
    let nextPhotoId = all[idx].photos.length
      ? Math.max(...all[idx].photos.map((p) => p.id)) + 1
      : 1;

    for (const file of files) {
      const dataUrl = await fileToDataUrl(file);
      newPhotos.push({
        id: nextPhotoId++,
        imageUrl: dataUrl,
        takenAt: new Date(file.lastModified).toISOString(),
      });
    }

    all[idx] = { ...all[idx], photos: [...all[idx].photos, ...newPhotos] };
    writeAll(recordsKey(), all);
    return ok(all[idx]);
  },
};
