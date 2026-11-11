import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private counter = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3500) {
    const id = ++this.counter;
    this.toasts.update((current) => [...current, { id, text, type }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(text: string) {
    this.show(text, 'success');
  }

  error(text: string) {
    this.show(text, 'error', 4500);
  }

  warning(text: string) {
    this.show(text, 'warning');
  }

  info(text: string) {
    this.show(text, 'info');
  }

  remove(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
