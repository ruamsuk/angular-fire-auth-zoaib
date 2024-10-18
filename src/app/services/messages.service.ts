import { Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  loading = signal(false);

  constructor(private messageService: MessageService) {}

  /** Toast */
  showSuccess(msg: string): void {
    return this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${msg}`,
      life: 4000,
    });
  }

  showError(msg: string) {
    return this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `${msg}`,
      life: 4000,
    });
  }

  showWarn(msg: string) {
    return this.messageService.add({
      severity: 'warn',
      summary: 'Warn Message',
      detail: `${msg}`,
      life: 4000,
    });
  }

  /** loading */
  showLoading() {
    this.loading.set(true);
  }

  hideLoading() {
    this.loading.set(false);
  }
}
