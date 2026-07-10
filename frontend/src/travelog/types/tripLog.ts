export interface TripLogRequestDTO {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface TripLogResponseDTO {
  tno: number;

  title: string;

  startDate: string;

  endDate: string;

  thumbnailPath: string | null;

  description: string;

  createdAt: string;

  modifiedAt: string;

  tags: string[];
}

export interface UploadResultDTO {
  totalCount: number;

  successCount: number;

  failCount: number;

  failedFiles: string[];
}

export interface GeoJsonPointDTO {
  type: "Point";

  coordinates: number[];
}

export interface MediaDetailDTO {
  mno: number;

  mediaPath: string;

  storedFileName: string;

  takenAt: string;

  location: GeoJsonPointDTO;

  mediaText: string;
}

export interface TripLogOverviewDTO {
  tno: number;

  title: string;

  startDate: string;

  endDate: string;

  spots: SpotDetailDTO[];
}

export interface SpotDetailDTO {
  sno: number;

  name: string;

  description: string;

  centerLocation: GeoJsonPointDTO;

  visitAt: string;

  leaveAt: string;

  coverImagePath: string;

  mediaList: MediaSummaryDTO[];
}

export interface MediaSummaryDTO {
  mno: number;

  mediaPath: string;

  storedFileName: string;

  location: GeoJsonPointDTO;

  takenAt: string;
}
