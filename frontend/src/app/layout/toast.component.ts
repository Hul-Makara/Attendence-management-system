import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
      >
        <span class="toast-icon">
          <i *ngIf="toast.type === 'success'" class="fa-solid fa-circle-check"></i>
          <i *ngIf="toast.type === 'error'" class="fa-solid fa-circle-exclamation"></i>
          <i *ngIf="toast.type === 'warning'" class="fa-solid fa-triangle-exclamation"></i>
          <i *ngIf="toast.type === 'info'" class="fa-solid fa-circle-info"></i>
        </span>
        <span class="toast-text">{{ toast.text }}</span>
        <button class="toast-close" (click)="toastService.remove(toast.id)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 280px;
      max-width: 420px;
      padding: 0.85rem 1.15rem;
      border-radius: var(--radius-sm, 6px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
      font-size: 0.875rem;
      color: #ffffff;
      animation: slideIn 0.25s ease-out;
    }
    .toast-success { background-color: #15803d; }
    .toast-error { background-color: #b91c1c; }
    .toast-warning { background-color: #b45309; }
    .toast-info { background-color: #0369a1; }
    .toast-text { flex: 1; font-weight: 500; }
    .toast-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      font-size: 0.95rem;
    }
    .toast-close:hover { color: #ffffff; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
