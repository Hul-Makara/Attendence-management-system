import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { ClassService } from '../../core/services/class.service';
import { SubjectService } from '../../core/services/subject.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceRecord } from '../../core/models/attendance.model';
import { RecentAttendanceTableComponent } from './recent-attendance-table.component';
import { DashboardShortcutsComponent } from './dashboard-shortcuts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RecentAttendanceTableComponent,
    DashboardShortcutsComponent,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div>
          <h2>Good day, {{ authService.currentUser()?.username }}! 👋</h2>
          <p class="banner-sub">
            Logged in as <strong>{{ authService.currentUser()?.role }}</strong> — Here is today's overview.
          </p>
        </div>
        <div class="banner-actions">
          <a routerLink="/attendance" class="btn btn-primary">
            <i class="fa-solid fa-clipboard-check"></i> Record Attendance
          </a>
          <a *ngIf="authService.isAdmin()" routerLink="/students" class="btn btn-secondary">
            <i class="fa-solid fa-user-plus"></i> Manage Students
          </a>
        </div>
      </div>

      <!-- Overview Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon icon-students">
            <i class="fa-solid fa-user-graduate"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Students</span>
            <div class="stat-value">{{ totalStudents() }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-classes">
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Classes</span>
            <div class="stat-value">{{ totalClasses() }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-subjects">
            <i class="fa-solid fa-book-open"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Subjects</span>
            <div class="stat-value">{{ totalSubjects() }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-rate">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Today's Attendance Rate</span>
            <div class="stat-value">{{ attendanceRate() }}%</div>
          </div>
        </div>
      </div>

      <!-- Today's Status Breakdown -->
      <div class="breakdown-grid">
        <div class="breakdown-card present-card">
          <div class="breakdown-header">
            <span class="badge badge-present"><i class="fa-solid fa-check"></i> Present</span>
          </div>
          <div class="breakdown-count">{{ todayPresent() }}</div>
          <span class="breakdown-sub">Students in attendance</span>
        </div>

        <div class="breakdown-card absent-card">
          <div class="breakdown-header">
            <span class="badge badge-absent"><i class="fa-solid fa-xmark"></i> Absent</span>
          </div>
          <div class="breakdown-count">{{ todayAbsent() }}</div>
          <span class="breakdown-sub">Unexcused absences</span>
        </div>

        <div class="breakdown-card late-card">
          <div class="breakdown-header">
            <span class="badge badge-late"><i class="fa-solid fa-clock"></i> Late</span>
          </div>
          <div class="breakdown-count">{{ todayLate() }}</div>
          <span class="breakdown-sub">Arrived after start</span>
        </div>

        <div class="breakdown-card excused-card">
          <div class="breakdown-header">
            <span class="badge badge-excused"><i class="fa-solid fa-envelope-open-text"></i> Permission</span>
          </div>
          <div class="breakdown-count">{{ todayExcused() }}</div>
          <span class="breakdown-sub">Approved leave</span>
        </div>
      </div>

      <!-- Quick Shortcuts & Recent Records (Angular Deferrable Views on Viewport) -->
      <div class="dashboard-row">
        <!-- Deferrable Recent Attendance Table (Loaded when scrolled into Viewport) -->
        <div class="dashboard-col">
          @defer (on viewport) {
            <app-recent-attendance-table
              [records]="recentAttendance()"
              (viewAll)="goToAttendance()"
            />
          } @placeholder (minimum 300ms) {
            <div class="card recent-card placeholder-card">
              <div class="card-header">
                <h3 class="card-title">Recent Attendance Records</h3>
              </div>
              <div class="placeholder-body">
                <i class="fa-solid fa-clock-rotate-left placeholder-icon"></i>
                <p>Scroll into view to load recent attendance records...</p>
              </div>
            </div>
          } @loading (minimum 500ms) {
            <div class="card recent-card placeholder-card">
              <div class="placeholder-body">
                <i class="fa-solid fa-spinner fa-spin text-primary placeholder-icon"></i>
                <p class="text-muted">Loading attendance data (lazy-loading view)...</p>
              </div>
            </div>
          } @error {
            <div class="card recent-card placeholder-card">
              <div class="placeholder-body text-danger">
                <i class="fa-solid fa-triangle-exclamation placeholder-icon"></i>
                <p>Failed to load attendance records</p>
              </div>
            </div>
          }
        </div>

        <!-- Deferrable System Modules Shortcuts (Loaded when scrolled into Viewport) -->
        <div class="dashboard-col">
          @defer (on viewport) {
            <app-dashboard-shortcuts [isAdmin]="authService.isAdmin()" />
          } @placeholder (minimum 300ms) {
            <div class="card shortcuts-card placeholder-card">
              <div class="card-header">
                <h3 class="card-title">System Modules</h3>
              </div>
              <div class="placeholder-body">
                <i class="fa-solid fa-cubes placeholder-icon"></i>
                <p>Scroll into view to load shortcuts...</p>
              </div>
            </div>
          } @loading (minimum 500ms) {
            <div class="card shortcuts-card placeholder-card">
              <div class="placeholder-body">
                <i class="fa-solid fa-spinner fa-spin text-primary placeholder-icon"></i>
                <p class="text-muted">Loading system modules (lazy-loading view)...</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .welcome-banner {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
      padding: 1.75rem 2rem;
      border-radius: var(--radius-md, 10px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .banner-sub {
      color: #94a3b8;
      margin-top: 0.25rem;
      font-size: 0.95rem;
    }
    .banner-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      background: #ffffff;
      border-radius: var(--radius-md, 10px);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }
    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md, 10px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      flex-shrink: 0;
    }
    .icon-students { background-color: #eff6ff; color: #2563eb; }
    .icon-classes { background-color: #fdf4ff; color: #c026d3; }
    .icon-subjects { background-color: #fff7ed; color: #ea580c; }
    .icon-rate { background-color: #f0fdf4; color: #16a34a; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; }
    .stat-value { font-size: 1.65rem; font-weight: 700; color: var(--text-main); line-height: 1.2; margin-top: 0.2rem; }

    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }
    .breakdown-card {
      background: #ffffff;
      border-radius: var(--radius-sm, 6px);
      padding: 1rem 1.25rem;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
    }
    .present-card { border-left: 4px solid var(--success); }
    .absent-card { border-left: 4px solid var(--danger); }
    .late-card { border-left: 4px solid var(--warning); }
    .excused-card { border-left: 4px solid var(--info); }
    .breakdown-count { font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin: 0.5rem 0 0.15rem; }
    .breakdown-sub { font-size: 0.775rem; color: var(--text-muted); }

    .dashboard-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 992px) {
      .dashboard-row { grid-template-columns: 1fr; }
    }
    .dashboard-col {
      display: flex;
      flex-direction: column;
    }

    /* Placeholder and loading styles for deferrable views */
    .placeholder-card {
      min-height: 280px;
      display: flex;
      flex-direction: column;
      border: 1px dashed #cbd5e1;
      background: #f8fafc;
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
    .placeholder-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
      text-align: center;
      color: #64748b;
    }
    .placeholder-icon {
      font-size: 2.25rem;
      margin-bottom: 0.75rem;
      opacity: 0.45;
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly studentService = inject(StudentService);
  private readonly classService = inject(ClassService);
  private readonly subjectService = inject(SubjectService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);

  readonly totalStudents = signal(0);
  readonly totalClasses = signal(0);
  readonly totalSubjects = signal(0);
  readonly attendanceRate = signal(0);

  readonly todayPresent = signal(0);
  readonly todayAbsent = signal(0);
  readonly todayLate = signal(0);
  readonly todayExcused = signal(0);

  readonly recentAttendance = signal<AttendanceRecord[]>([]);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.studentService.getStudents().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.totalStudents.set(res.data.length);
        }
      },
    });

    this.classService.getClassGroups().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.totalClasses.set(res.data.length);
        }
      },
    });

    this.subjectService.getSubjects().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.totalSubjects.set(res.data.length);
        }
      },
    });

    this.attendanceService.getTodayAttendance().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const records = res.data;
          this.recentAttendance.set(records.slice(0, 7));

          const present = records.filter((r) => r.status === 'present').length;
          const absent = records.filter((r) => r.status === 'absent').length;
          const late = records.filter((r) => r.status === 'late').length;
          const excused = records.filter((r) => r.status === 'excused' || r.status === 'on-leave').length;

          this.todayPresent.set(present);
          this.todayAbsent.set(absent);
          this.todayLate.set(late);
          this.todayExcused.set(excused);

          if (records.length > 0) {
            const rate = Math.round((present / records.length) * 100);
            this.attendanceRate.set(rate);
          }
        }
      },
    });
  }

  goToAttendance() {
    this.router.navigate(['/attendance']);
  }
}
