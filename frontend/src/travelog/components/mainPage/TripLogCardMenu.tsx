import { useEffect, useRef, useState } from "react";

interface TripLogCardMenuProps {
  onDetail: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const TripLogCardMenu = ({
  onDetail,
  onDelete,
  onShare,
}: TripLogCardMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-variant"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>

      {open && (
        <div className="traveler-glow absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1">
          <button
            className="w-full px-4 py-2 text-left text-label-md text-on-surface transition hover:bg-surface-variant"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDetail();
            }}
          >
            상세 정보
          </button>

          <button
            className="w-full px-4 py-2 text-left text-label-md text-on-surface transition hover:bg-surface-variant"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onShare();
            }}
          >
            공유하기
          </button>

          <button
            className="w-full px-4 py-2 text-left text-label-md text-error transition hover:bg-error-container"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default TripLogCardMenu;
