import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AttendanceRecord } from '../../core/models/attendance.model';

@Component({
  selector: 'app-recent-attendance-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card recent-card">
      <div class="card-header">
        <h3 class="card-title">Recent Attendance Records</h3>
        <button (click)="viewAll.emit()" class="btn btn-outline btn-sm">
          View All <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-container" style="border: none;">
          <table class="table" *ngIf="records.length > 0; else noRecent">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class / Group</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of records">
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
              <button (click)="viewAll.emit()" class="btn btn-primary btn-sm mt-2">
                Start Recording Now
              </button>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recent-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
    }
    .p-0 { padding: 0 !important; }
    .table-container { overflow-x: auto; }
    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 2.5rem;
      opacity: 0.35;
      margin-bottom: 0.75rem;
      display: block;
    }
    .mt-2 { margin-top: 0.5rem; }
  `],
})
export class RecentAttendanceTableComponent {
  @Input() records: AttendanceRecord[] = [];
  @Output() viewAll = new EventEmitter<void>();

  getStudentName(student: any): string {
    if (!student) return 'Unknown Student';
    if (typeof student === 'object') {
      return (
        student.studentname_en ||
        `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
        'Student'
      );
    }
    return String(student);
  }

  getStudentClass(student: any): string {
    if (!student || typeof student !== 'object') return '—';
    if (student.classGroup && typeof student.classGroup === 'object') {
      return student.classGroup.groupName || '—';
    }
    return '—';
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
