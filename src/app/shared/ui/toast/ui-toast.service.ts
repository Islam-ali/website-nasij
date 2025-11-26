import { Injectable, signal } from '@angular/core';
import { UiToastInput, UiToastMessage, UiToastSeverity } from './ui-toast.types';

@Injectable({ providedIn: 'root' })
export class UiToastService {
  private readonly messagesSignal = signal<UiToastMessage[]>([]);
  readonly messages = this.messagesSignal.asReadonly();

  add(message: UiToastInput) {
    const id = message.id ?? crypto.randomUUID();
    const toast: UiToastMessage = {
      id,
      severity: message.severity ?? 'info',
      detail: message.detail,
      summary: message.summary,
      life: message.life ?? 3000,
    };

    this.messagesSignal.update(list => [...list, toast]);
    setTimeout(() => this.remove(id), toast.life);
  }

  success(detail: string, summary?: string, life?: number) {
    this.add({ severity: 'success', detail, summary, life });
  }

  error(detail: string, summary?: string, life?: number) {
    this.add({ severity: 'error', detail, summary, life });
  }

  warn(detail: string, summary?: string, life?: number) {
    this.add({ severity: 'warn', detail, summary, life });
  }

  info(detail: string, summary?: string, life?: number) {
    this.add({ severity: 'info', detail, summary, life });
  }

  remove(id: string) {
    this.messagesSignal.update(list => list.filter(msg => msg.id !== id));
  }

  clear() {
    this.messagesSignal.set([]);
  }
}


