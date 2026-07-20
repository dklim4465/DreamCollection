interface Props { message?: string; }
export default function LoadingSpinner({ message = '불러오는 중...' }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant">
      <div className="w-9 h-9 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      <p className="text-label-md">{message}</p>
    </div>
  );
}
