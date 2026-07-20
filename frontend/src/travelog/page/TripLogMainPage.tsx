import {
  TripLogRequestDTO,
  TripLogResponseDTO,
} from "@/travelog/types/tripLog";
import { useState } from "react";
import { useTripLogList } from "@/travelog/hooks/useTripLogList";
import useDebounce from "@/travelog/hooks/useDebounce";

import TripLogListComponent from "@/travelog/components/mainPage/TripLogListComponent";
import TripLogSidebarComponent from "@/travelog/components/mainPage/TripLogSidebarComponent";
import TripLogModalComponent from "@/travelog/components/mainPage/TripLogModalComponent";
import { useCreateTripLog } from "@/travelog/hooks/useCreateTripLog";
import { useDeleteTripLog } from "@/travelog/hooks/useDeleteTripLog";
import { startUpload } from "@/travelog/service/UploadManager";
import useFilteringTripLogs from "@/travelog/hooks/useFilteringTripLogs";
import { createShareLink, deactiveShareLink } from "@/travelog/api/shareApi";
import { queryClient } from "@/common/config/queryClient";

const TripLogMainPage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sort, setSort] = useState<"modified" | "created" | "startDate">(
    "modified",
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [selectedTripLog, setSelectedTripLog] =
    useState<TripLogResponseDTO | null>(null);
  const [modalType, setModalType] = useState<
    "create" | "delete" | "share" | null
  >(null);

  const debouncedKeyword = useDebounce(searchKeyword, 300);

  const createMutation = useCreateTripLog();
  const deleteMutation = useDeleteTripLog();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: tripLogs = [], isLoading, error } = useTripLogList();

  const [shareUrl, setShareUrl] = useState("");

  const handleDetailClick = (tripLog: TripLogResponseDTO) => {
    setSelectedTripLog(tripLog);
    setSidebarOpen(true);
  };

  const handleDeleteClick = (tripLog: TripLogResponseDTO) => {
    setSelectedTripLog(tripLog);
    setModalType("delete");
  };

  const handleShareClick = async (tripLog: TripLogResponseDTO) => {
    const { shareUrl } = await createShareLink(tripLog.tno);

    setShareUrl(shareUrl);
    setSelectedTripLog(tripLog);
    setModalType("share");
  };

  const handleCreate = async (request: TripLogRequestDTO, files: File[]) => {
    try {
      const tno = await createMutation.mutateAsync(request);

      if (files.length > 0) {
        await startUpload(tno, files);
      }

      await queryClient.invalidateQueries({
        queryKey: ["tripLogList"],
      });

      setModalType(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!selectedTripLog) return;

    try {
      await deleteMutation.mutateAsync(selectedTripLog.tno);

      setSelectedTripLog(null);
      setModalType(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeactivateShare = async () => {
    if (!selectedTripLog) return;

    try {
      await deactiveShareLink(selectedTripLog.tno);

      setShareUrl("");
      setSelectedTripLog(null);
      setModalType(null);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTripLogs = useFilteringTripLogs({
    tripLogs,
    keyword: debouncedKeyword,
    sort,
    order,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-body-md text-on-surface-variant">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return <div>여행 기록을 불러오지 못했습니다.</div>;
  }

  return (
    <div className="relative flex flex-1 min-h-0 bg-background">
      <div className="flex-1 min-w-0 overflow-hidden">
        <TripLogListComponent
          tripLogs={filteredTripLogs}
          searchKeyword={searchKeyword}
          sort={sort}
          order={order}
          onSearchChange={setSearchKeyword}
          onSortChange={setSort}
          onOrderChange={setOrder}
          onDetailClick={handleDetailClick}
          onDeleteClick={handleDeleteClick}
          onCreateClick={() => setModalType("create")}
          onShareClick={handleShareClick}
        />
      </div>

      <TripLogSidebarComponent
        open={sidebarOpen}
        tripLog={selectedTripLog}
        onClose={() => {
          setSelectedTripLog(null);
          setSidebarOpen(false);
        }}
      />

      <TripLogModalComponent
        open={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
        onCreate={handleCreate}
        onDelete={handleDelete}
        shareUrl={shareUrl}
        onShareDeactivate={handleDeactivateShare}
      />
    </div>
  );
};

export default TripLogMainPage;
