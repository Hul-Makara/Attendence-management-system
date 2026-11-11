import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-brand">
          <div class="brand-icon">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <h2>Student Attendance System</h2>
          <p class="brand-subtitle">Sign in to your account</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <div class="input-icon-wrapper">
              <i class="fa-solid fa-user input-icon"></i>
              <input
                type="text"
                id="username"
                name="username"
                [(ngModel)]="username"
                required
                class="form-control with-icon"
                placeholder="Enter username"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="input-icon-wrapper">
              <i class="fa-solid fa-lock input-icon"></i>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="form-control with-icon"
                placeholder="Enter password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="btn-eye"
                (click)="toggleShowPassword()"
                tabindex="-1"
              >
                <i class="fa-solid" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="isLoading() || !loginForm.form.valid"
          >
            <i *ngIf="isLoading()" class="fa-solid fa-circle-notch fa-spin"></i>
            <span>{{ isLoading() ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="quick-credentials">
          <span class="quick-title">Quick Demo Login:</span>
          <div class="quick-buttons">
            <button
              type="button"
              class="quick-pill pill-admin"
              (click)="fillCredentials('admin', 'Password123!')"
            >
              <i class="fa-solid fa-shield-halved"></i> Admin
            </button>
            <button
              type="button"
              class="quick-pill pill-teacher"
              (click)="fillCredentials('teacher_dara', 'Password123!')"
            >
              <i class="fa-solid fa-chalkboard-user"></i> Teacher
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 1.5rem;
    }
    .login-card {
      background: #ffffff;
      border-radius: var(--radius-lg, 16px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 420px;
      padding: 2.5rem 2rem;
    }
    .login-brand {
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-icon {
      width: 56px;
      height: 56px;
      background-color: var(--primary-light, #eff6ff);
      color: var(--primary, #2563eb);
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 0.85rem;
    }
    .login-brand h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main, #0f172a);
    }
    .brand-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted, #64748b);
      margin-top: 0.25rem;
    }
    .input-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 0.85rem;
      color: #94a3b8;
      font-size: 0.95rem;
      pointer-events: none;
    }
    .with-icon {
      padding-left: 2.35rem;
      padding-right: 2.35rem;
    }
    .btn-eye {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .btn-eye:hover { color: var(--text-main); }
    .btn-block {
      width: 100%;
      padding: 0.75rem;
      font-size: 0.95rem;
      margin-top: 0.75rem;
    }
    .quick-credentials {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px dashed var(--border-color, #e2e8f0);
      text-align: center;
    }
    .quick-title {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 0.65rem;
      letter-spacing: 0.05em;
    }
    .quick-buttons {
      display: flex;
      gap: 0.65rem;
      justify-content: center;
    }
    .quick-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }
    .pill-admin {
      background-color: #e0e7ff;
      color: #3730a3;
      border-color: #c7d2fe;
    }
    .pill-admin:hover { background-color: #c7d2fe; }
    .pill-teacher {
      background-color: #d1fae5;
      color: #065f46;
      border-color: #a7f3d0;
    }
    .pill-teacher:hover { background-color: #a7f3d0; }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  toggleShowPassword() {
    this.showPassword.update((v) => !v);
  }

  fillCredentials(u: string, p: string) {
    this.username = u;
    this.password = p;
  }

  onSubmit() {
    if (!this.username || !this.password) return;

    this.isLoading.set(true);
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success(`Welcome back, ${res.data.user.username}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Invalid username or password';
        this.toast.error(msg);
      },
    });
  }
}
