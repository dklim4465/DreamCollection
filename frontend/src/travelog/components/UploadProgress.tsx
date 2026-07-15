import { useUploadStore } from "@/travelog/store/useUploadStore";

const UploadProgress = () => {
  const { uploading, uploadedFiles, totalFiles } = useUploadStore();

  if (!uploading) return null;

  const progress = totalFiles === 0 ? 0 : (uploadedFiles / totalFiles) * 100;

  return (
    <div
      className="
        fixed
        bottom-6
        right-6
        z-50
        w-80
        rounded-2xl
        bg-surface-container-lowest
        p-4
        traveler-glow
      "
    >
      <div
        className="
          mb-3
          flex
          justify-between
          text-label-md
        "
      >
        <span className="font-semibold text-on-surface">사진 업로드 중...</span>

        <span className="text-on-surface-variant">
          {uploadedFiles} / {totalFiles}
        </span>
      </div>

      <div
        className="
          h-2
          overflow-hidden
          rounded-full
          bg-surface-variant
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-primary
            transition-all
            duration-300
          "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div
        className="
          mt-2
          text-right
          text-label-sm
          text-on-surface-variant
        "
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default UploadProgress;
