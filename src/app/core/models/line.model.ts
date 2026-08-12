import type { LineType } from './api.types';

export interface Line {
  id: number;
  code: string;
  name: string;
  type: LineType;
  colorHex: string;
  isActive: boolean;
}
