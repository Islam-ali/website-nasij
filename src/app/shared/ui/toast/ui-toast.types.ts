export type UiToastSeverity = 'info' | 'success' | 'warn' | 'error';

export interface UiToastMessage {
  id: string;
  severity: UiToastSeverity;
  summary?: string;
  detail: string;
  life?: number;
}

export type UiToastInput = Omit<UiToastMessage, 'id'> & { id?: string };


