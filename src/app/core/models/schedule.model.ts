import type { ScheduleStatus } from './api.types';
import type { Station } from './station.model';
import type { Train } from './train.model';

export interface Schedule {
  id: number;
  train: Train;
  originStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
  status: ScheduleStatus;
}
