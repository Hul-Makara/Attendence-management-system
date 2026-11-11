import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { ClassService } from '../../core/services/class.service';
import { SubjectService } from '../../core/services/subject.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceRecord } from '../../core/models/attendance.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

      <!-- Quick Shortcuts & Recent Records -->
      <div class="dashboard-row">
        <!-- Recent Attendance Table -->
        <div class="card recent-card">
          <div class="card-header">
            <h3 class="card-title">Recent Attendance Records</h3>
            <a routerLink="/attendance" class="btn btn-outline btn-sm">
              View All <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div class="card-body p-0">
            <div class="table-container" style="border: none;">
              <table class="table" *ngIf="recentAttendance().length > 0; else noRecent">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Class / Group</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let record of recentAttendance()">
                    <td>
                      <strong>{{ getStudentName(record.student) }}</strong>
                    </td>
                    <td>
                      <span class="text-muted">{{ getStudentClass(record.student) }}</span>
                    </td>
                    <td>{{ record.date | date: 'mediumDate' }}</td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="'badge-' + (record.status === 'excused' || record.status === 'on-leave' ? 'excused' : record.status)"
                      >
                        {{ formatStatus(record.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noRecent>
                <div class="empty-state">
                  <i class="fa-regular fa-calendar-xmark empty-icon"></i>
                  <p>No attendance records recorded for today yet.</p>
                  <a routerLink="/attendance" class="btn btn-primary btn-sm mt-2">
                    Start Recording Now
                  </a>
                </div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Quick Links Card -->
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

              <a *ngIf="authService.isAdmin()" routerLink="/users" class="module-item">
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
    .welcome-banner h2 { font-size: 1.45rem; font-weight: 700; }
    .banner-sub { color: #94a3b8; font-size: 0.9rem; margin-top: 0.25rem; }
    .banner-actions { display: flex; gap: 0.75rem; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.35rem;
      display: flex;
      align-items: center;
      gap: 1.15rem;
      box-shadow: var(--shadow-sm);
    }
    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .icon-students { background-color: #eff6ff; color: #2563eb; }
    .icon-classes { background-color: #fdf4ff; color: #c026d3; }
    .icon-subjects { background-color: #fff7ed; color: #ea580c; }
    .icon-rate { background-color: #f0fdf4; color: #16a34a; }

    .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
    .stat-value { font-size: 1.65rem; font-weight: 700; color: var(--text-main); line-height: 1.2; margin-top: 0.2rem; }

    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.15rem;
    }
    .breakdown-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
    }
    .breakdown-header { display: flex; align-items: center; justify-content: space-between; }
    .breakdown-count { font-size: 1.85rem; font-weight: 700; margin-top: 0.65rem; color: var(--text-main); }
    .breakdown-sub { font-size: 0.775rem; color: var(--text-muted); }

    .dashboard-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 992px) {
      .dashboard-row { grid-template-columns: 1fr; }
    }
    .p-0 { padding: 0 !important; }
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5; }
    .mt-2 { margin-top: 0.75rem; }

    .module-links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .module-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      text-decoration: none;
      color: var(--text-main);
      transition: all 0.15s ease-in-out;
    }
    .module-item:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      transform: translateX(2px);
    }
    .mod-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .mod-info { flex: 1; }
    .mod-title { display: block; font-weight: 600; font-size: 0.875rem; }
    .mod-desc { font-size: 0.75rem; color: var(--text-muted); }
  `],
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly studentService = inject(StudentService);
  private readonly classService = inject(ClassService);
  private readonly subjectService = inject(SubjectService);
  private readonly attendanceService = inject(AttendanceService);

  readonly totalStudents = signal(0);
  readonly totalClasses = signal(0);
  readonly totalSubjects = signal(0);
  readonly attendanceRate = signal(100);

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

  getStudentName(student: any): string {
    if (!student) return 'Unknown';
    if (student.studentname_en) return student.studentname_en;
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim();
    }
    return 'Student';
  }

  getStudentClass(student: any): string {
    if (!student) return 'N/A';
    if (student.classGroup && typeof student.classGroup === 'object') {
      return student.classGroup.groupName;
    }
    return 'Class';
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'excused':
      case 'on-leave': return 'Permission';
      default: return status;
    }
  }
}
