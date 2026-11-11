import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  template: `
    <div class="app-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="isCollapsed()">
        <div class="sidebar-header">
          <div class="brand-logo">
            <i class="fa-solid fa-graduation-cap"></i>
            <span class="brand-name" *ngIf="!isCollapsed()">AttendTrack</span>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()" title="Toggle Sidebar">
            <i class="fa-solid" [ngClass]="isCollapsed() ? 'fa-angles-right' : 'fa-angles-left'"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            class="nav-link"
            title="Dashboard"
          >
            <i class="fa-solid fa-chart-pie"></i>
            <span *ngIf="!isCollapsed()">Dashboard</span>
          </a>

          <a
            routerLink="/students"
            routerLinkActive="active"
            class="nav-link"
            title="Students"
          >
            <i class="fa-solid fa-user-graduate"></i>
            <span *ngIf="!isCollapsed()">Students</span>
          </a>

          <a
            routerLink="/attendance"
            routerLinkActive="active"
            class="nav-link"
            title="Attendance"
          >
            <i class="fa-solid fa-clipboard-check"></i>
            <span *ngIf="!isCollapsed()">Attendance</span>
          </a>

          <a
            routerLink="/classes"
            routerLinkActive="active"
            class="nav-link"
            title="Classes"
          >
            <i class="fa-solid fa-chalkboard-user"></i>
            <span *ngIf="!isCollapsed()">Classes</span>
          </a>

          <a
            routerLink="/subjects"
            routerLinkActive="active"
            class="nav-link"
            title="Subjects"
          >
            <i class="fa-solid fa-book-open"></i>
            <span *ngIf="!isCollapsed()">Subjects</span>
          </a>

          <!-- Admin Only Menu Item -->
          <a
            *ngIf="authService.isAdmin()"
            routerLink="/users"
            routerLinkActive="active"
            class="nav-link"
            title="User Management"
          >
            <i class="fa-solid fa-users-gear"></i>
            <span *ngIf="!isCollapsed()">Users & Roles</span>
          </a>
        </nav>

        <div class="sidebar-footer" *ngIf="!isCollapsed()">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="user-details">
              <div class="user-name">{{ authService.currentUser()?.username }}</div>
              <span class="role-badge" [ngClass]="authService.isAdmin() ? 'role-admin' : 'role-teacher'">
                {{ authService.currentUser()?.role }}
              </span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()" title="Logout">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      <!-- Main Layout -->
      <div class="main-container">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <h1 class="page-title">Student Management System</h1>
          </div>
          <div class="topbar-right">
            <div class="profile-pill">
              <span class="online-indicator"></span>
              <span class="profile-name">{{ authService.currentUser()?.username }}</span>
              <span class="profile-role">({{ authService.currentUser()?.role }})</span>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="logout()">
              <i class="fa-solid fa-power-off"></i> Logout
            </button>
          </div>
        </header>

        <!-- Main Body -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-main);
    }
    .sidebar {
      width: 250px;
      background-color: var(--sidebar-bg);
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease-in-out;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 100;
    }
    .sidebar.collapsed {
      width: 72px;
    }
    .sidebar-header {
      padding: 1.25rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      color: #60a5fa;
      font-weight: 700;
    }
    .toggle-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.95rem;
      padding: 0.25rem;
      border-radius: 4px;
    }
    .toggle-btn:hover { color: #ffffff; }
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      overflow-y: auto;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm, 6px);
      color: #94a3b8;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.15s ease-in-out;
    }
    .nav-link i { font-size: 1.1rem; width: 20px; text-align: center; }
    .nav-link:hover {
      color: #ffffff;
      background-color: var(--sidebar-hover);
    }
    .nav-link.active {
      color: #ffffff;
      background-color: var(--primary);
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);
    }
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      overflow: hidden;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #93c5fd;
      flex-shrink: 0;
    }
    .user-details {
      overflow: hidden;
    }
    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .role-badge {
      display: inline-block;
      font-size: 0.65rem;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .role-admin { background-color: #818cf8; color: #1e1b4b; }
    .role-teacher { background-color: #34d399; color: #064e3b; }
    .btn-logout {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.4rem;
      border-radius: 4px;
    }
    .btn-logout:hover { color: #f87171; }

    /* Main Container */
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }
    .topbar {
      height: 64px;
      background-color: #ffffff;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      position: sticky;
      top: 0;
      z-index: 90;
    }
    .page-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .profile-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      background-color: #f1f5f9;
      border-radius: 9999px;
      font-size: 0.8rem;
    }
    .online-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #22c55e;
    }
    .profile-name { font-weight: 600; color: var(--text-main); }
    .profile-role { color: var(--text-muted); }
    .page-content {
      flex: 1;
      padding: 1.75rem;
    }
  `],
})
export class LayoutComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly isCollapsed = signal(false);

  toggleSidebar() {
    this.isCollapsed.update((v) => !v);
  }

  logout() {
    this.authService.logout();
  }
}
