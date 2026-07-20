export interface TripLogRequestDTO {
  title?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  thumbnailMediaMno?: number | null;
}

export interface TripLogResponseDTO {
  tno: number;

  title: string | null;

  startDate: string | null;

  endDate: string | null;

  thumbnailPath: string | null;

  description: string | null;

  createdAt: string;

  modifiedAt: string;

  tags: string[] | null;
}

export interface UploadResultDTO {
  totalCount: number;

  successCount: number;

  failCount: number;

  failedFiles: string[];
}

export interface GeoJsonPointDTO {
  type: "Point";

  coordinates: [number, number];
}

export interface MediaDetailDTO {
  mno: number;

  mediaPath: string;

  storedFileName: string;

  takenAt: string | null;

  location: GeoJsonPointDTO | null;

  mediaText: string | null;
}

export interface TripLogOverviewDTO {
  tno: number;

  title: string | null;

  startDate: string | null;

  endDate: string | null;

  spots: SpotDetailDTO[];

  thumbnailPath?: string | null;
}

export interface SpotDetailDTO {
  sno: number;

  name: string | null;

  description: string | null;

  centerLocation: GeoJsonPointDTO;

  visitAt: string;

  leaveAt: string;

  coverImagePath: string | null;

  timezone: string;

  mediaList: MediaSummaryDTO[];
}

export interface MediaSummaryDTO {
  mno: number;

  mediaPath: string;

  storedFileName: string;

  location: GeoJsonPointDTO | null;

  takenAt: string | null;
}

export interface ShareLinkResponseDTO {
  shareUrl: string;
}
