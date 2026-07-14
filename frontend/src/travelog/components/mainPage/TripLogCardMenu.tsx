import { useEffect, useRef, useState } from "react";

interface TripLogCardMenuProps {
  onDetail: () => void;
  onDelete: () => void;
}

const TripLogCardMenu = ({ onDetail, onDelete }: TripLogCardMenuProps) => {
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
        className="rounded-md p-2 hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border bg-white py-1 shadow-lg">
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
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
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
