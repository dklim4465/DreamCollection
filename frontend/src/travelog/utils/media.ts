import {
  MediaDetailDTO,
  MediaSummaryDTO,
  SpotDetailDTO,
  TripLogResponseDTO,
} from "@/travelog/types/tripLog";

const baseUrl = "http://localhost:8080";

export const getMediaThumbnailUrl = (media: MediaSummaryDTO | MediaDetailDTO) =>
  `${baseUrl}/${media.mediaPath}/thumbnail/${media.storedFileName}`;

export const getMediaUrl = (media: MediaSummaryDTO | MediaDetailDTO) =>
  `${baseUrl}/${media.mediaPath}/${media.storedFileName}`;

export const getSpotThumbnailUrl = (spot: SpotDetailDTO) =>
  `${baseUrl}/${spot.coverImagePath}`;

export const getTripLogThumbnailUrl = (tripLog: TripLogResponseDTO) =>
  `${baseUrl}/${tripLog.thumbnailPath}`;
