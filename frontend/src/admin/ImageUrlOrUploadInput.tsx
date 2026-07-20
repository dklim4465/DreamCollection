import { useRef, useState } from "react";
import { adminApi } from "@/admin/api/adminApi";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

/**
 * 관리자 페이지의 이미지 등록 필드 — URL 직접 입력 + 파일 업로드(내 컴퓨터에서 선택) 둘 다 지원.
 * 카카오톡 등에서 받아서 컴퓨터에 저장해둔 사진도 "파일 선택"으로 바로 올릴 수 있다.
 * 배너 / 메인배경 / 이달의 여행지 등록 폼에서 공용으로 사용.
 */
export default function ImageUrlOrUploadInput({ value, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일을 다시 선택해도 onChange가 또 발생하도록 초기화
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data?.data?.url;
      if (url) onChange(url);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "이미지 업로드에 실패했어요.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          className="input-base flex-1"
          placeholder={placeholder ?? "https://... 또는 오른쪽 '파일 선택'으로 내 컴퓨터의 사진 업로드"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={handlePickFile}
          disabled={uploading}
          className="btn-ghost text-sm py-2 px-4 whitespace-nowrap disabled:opacity-50 shrink-0"
        >
          {uploading ? "업로드 중..." : "파일 선택"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-label-sm text-error">{error}</p>}

      {value && (
        <img
          src={value}
          alt="미리보기"
          className="w-24 h-24 object-cover rounded-md border border-outline-variant"
        />
      )}
    </div>
  );
}
