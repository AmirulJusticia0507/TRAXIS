import type { Line } from './line.model';

export interface Station {
  id: number;
  code: string;
  name: string;
  line: Line;
  isActive: boolean;
}
