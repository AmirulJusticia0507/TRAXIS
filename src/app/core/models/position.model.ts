import type { PositionStatus } from './api.types';
import type { Station } from './station.model';
import type { Train } from './train.model';

export interface TrainPosition {
  train: Train;
  currentStation: Station | null;
  latitude: number;
  longitude: number;
  speedKmh: number;
  status: PositionStatus;
  lastUpdatedAt: string;
}
