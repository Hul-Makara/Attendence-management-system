import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-shortcuts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card shortcuts-card">
      <div class="card-header">
        <h3 class="card-title">System Modules</h3>
      </div>
      <div class="card-body">
        <div class="module-links">
          <a routerLink="/students" class="module-item">
            <div class="mod-icon" style="background-color: #eff6ff; color: #2563eb;">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
            <div class="mod-info">
              <span class="mod-title">Student Records</span>
              <span class="mod-desc">Search, filter, import & export</span>
            </div>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </a>

          <a routerLink="/attendance" class="module-item">
            <div class="mod-icon" style="background-color: #f0fdf4; color: #16a34a;">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>
            <div class="mod-info">
              <span class="mod-title">Attendance Sheet</span>
              <span class="mod-desc">Daily & weekly table views</span>
            </div>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </a>

          <a routerLink="/classes" class="module-item">
            <div class="mod-icon" style="background-color: #fdf4ff; color: #c026d3;">
              <i class="fa-solid fa-chalkboard-user"></i>
            </div>
            <div class="mod-info">
              <span class="mod-title">Class Management</span>
              <span class="mod-desc">Create and organize grade groups</span>
            </div>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </a>

          <a routerLink="/subjects" class="module-item">
            <div class="mod-icon" style="background-color: #fff7ed; color: #ea580c;">
              <i class="fa-solid fa-book-open"></i>
            </div>
            <div class="mod-info">
              <span class="mod-title">Subjects & Schedule</span>
              <span class="mod-desc">Assign teachers and class times</span>
            </div>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </a>

          <a *ngIf="isAdmin" routerLink="/users" class="module-item">
            <div class="mod-icon" style="background-color: #f1f5f9; color: #475569;">
              <i class="fa-solid fa-users-gear"></i>
            </div>
            <div class="mod-info">
              <span class="mod-title">Users & Permissions</span>
              <span class="mod-desc">Admin and teacher accounts</span>
            </div>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shortcuts-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
    }
    .card-body {
      padding: 1rem 1.25rem;
    }
    .module-links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .module-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm, 6px);
      text-decoration: none;
      color: inherit;
      background: #f8fafc;
      border: 1px solid var(--border-color);
      transition: all 0.15s ease-in-out;
    }
    .module-item:hover {
      background: #f1f5f9;
      transform: translateX(3px);
    }
    .mod-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }
    .mod-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .mod-title {
      font-weight: 600;
      font-size: 0.925rem;
      color: var(--text-main);
    }
    .mod-desc {
      font-size: 0.775rem;
      color: var(--text-muted);
    }
  `],
})
export class DashboardShortcutsComponent {
  @Input() isAdmin = false;
}
