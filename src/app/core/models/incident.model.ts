import type { IncidentStatus, LineType } from './api.types';
import type { Train } from './train.model';

export interface Incident {
  id: number;
  lineType: LineType;
  train: Train | null;
  locationStation: string;
  delayDurationMinutes: number;
  description: string;
  status: IncidentStatus;
  reportedAt: string;
  resolvedAt: string | null;
}

export interface IncidentCreate {
  lineType: LineType;
  trainId: number | null;
  locationStation: string;
  delayDurationMinutes: number;
  description: string;
}

export interface IncidentUpdate {
  status: IncidentStatus;
}
