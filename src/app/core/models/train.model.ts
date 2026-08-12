import type { TrainStatus } from './api.types';
import type { Line } from './line.model';

export interface Train {
  id: number;
  trainCode: string;
  line: Line;
  capacity: number;
  status: TrainStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrainCreate {
  trainCode: string;
  lineId: number;
  capacity: number;
  status: TrainStatus;
}

export type TrainUpdate = TrainCreate;
