export type PeriodType =
  | 'available'
  | 'unavailable'
  | 'booked'
  | 'unpublished'
  | 'booked-on-other-schedule';

export interface BreakPeriod {
  from: number;
  to: number;
}

export interface Period {
  id: number | string;
  type: PeriodType;
  editable: boolean;
  from: number;
  to: number;
  break: BreakPeriod | void;
}

export interface Employee {
  id: number | string;
  name: string;
  periods: Period[];
}

export const colorMap: Record<PeriodType | 'break', string> = {
  booked: '#82C972',
  break: 'rgba(199,199,199,0.64)',
  available: '#9370db',
  unavailable: '#e0e0e0',
  'booked-on-other-schedule': '#000',
  unpublished: '#000'
};
