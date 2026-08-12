// Enum & tipe dasar kontrak API (single source of truth - GOALS.md)
// Sinkron dengan ENUM SQL di schema.sql dan openapi.yaml.

export type LineType = 'MRT' | 'KRL';

export type TrainStatus = 'ACTIVE' | 'MAINTENANCE' | 'DELAYED';

export type ScheduleStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type PositionStatus = 'IN_TRANSIT' | 'AT_STATION' | 'OUT_OF_SERVICE';

export type SortOrder = 'asc' | 'desc';

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiErrorDetails {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: ApiErrorDetails[];
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}
