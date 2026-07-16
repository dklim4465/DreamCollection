import { useUploadStore } from "@/travelog/store/useUploadStore";

const UploadProgress = () => {
  const { uploading, uploadedFiles, totalFiles } = useUploadStore();

  if (!uploading) return null;

  const progress = totalFiles === 0 ? 0 : (uploadedFiles / totalFiles) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg bg-white shadow-lg p-4">
      <div className="mb-2 flex justify-between text-sm">
        <span>사진 업로드 중...</span>
        <span>
          {uploadedFiles} / {totalFiles}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 text-right text-xs text-gray-500">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default UploadProgress;
