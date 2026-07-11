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
import { uploadMediaInChunks } from "@/travelog/utils/uploadMediaInChunks";

const TripLogMainPage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sort, setSort] = useState<"modified" | "created">("modified");

  const [selectedTripLog, setSelectedTripLog] =
    useState<TripLogResponseDTO | null>(null);
  const [modalType, setModalType] = useState<"create" | "delete" | null>(null);

  const debouncedKeyword = useDebounce(searchKeyword, 300);

  const createMutation = useCreateTripLog();
  const deleteMutation = useDeleteTripLog();

  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    data: tripLogs = [],
    isLoading,
    error,
  } = useTripLogList(debouncedKeyword, sort);

  const handleDetailClick = (tripLog: TripLogResponseDTO) => {
    setSelectedTripLog(tripLog);
  };

  const handleDeleteClick = (tripLog: TripLogResponseDTO) => {
    setSelectedTripLog(tripLog);
    setModalType("delete");
  };

  const handleCreate = async (request: TripLogRequestDTO, files: File[]) => {
    try {
      setUploadProgress(0);

      const tno = await createMutation.mutateAsync(request);

      if (files.length > 0) {
        await uploadMediaInChunks(tno, files, setUploadProgress);
      }

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

  if (isLoading) {
    return <div>불러오는 중...</div>;
  }

  if (error) {
    return <div>여행 기록을 불러오지 못했습니다.</div>;
  }

  return (
    <div className="relative flex h-screen bg-gray-100">
      <div className="flex-1 overflow-hidden">
        <TripLogListComponent
          tripLogs={tripLogs}
          searchKeyword={searchKeyword}
          sort={sort}
          onSearchChange={setSearchKeyword}
          onSortChange={setSort}
          onDetailClick={handleDetailClick}
          onDeleteClick={handleDeleteClick}
          onCreateClick={() => setModalType("create")}
        />
      </div>

      <TripLogSidebarComponent
        open={selectedTripLog !== null}
        tripLog={selectedTripLog}
        onClose={() => setSelectedTripLog(null)}
      />

      <TripLogModalComponent
        open={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
        onCreate={handleCreate}
        onDelete={handleDelete}
        progress={uploadProgress}
      />
    </div>
  );
};

export default TripLogMainPage;
