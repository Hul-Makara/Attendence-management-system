import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import { ClassService } from '../../core/services/class.service';
import { StudentService } from '../../core/services/student.service';
import { SubjectService } from '../../core/services/subject.service';
import { ToastService } from '../../core/services/toast.service';
import { ClassGroup } from '../../core/models/class.model';
import { Student } from '../../core/models/student.model';
import { Subject } from '../../core/models/subject.model';
import { AttendanceRecord, AttendanceStatus } from '../../core/models/attendance.model';
import { TimetableGridComponent } from './timetable-grid.component';

export interface TimetableSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: 1 | 2 | 3;
  timeSlot: '5.45-6.45PM' | '6.45-7.45PM' | '7.45-8.45PM';
  subjectName: string;
  subjectCode: string;
  teacher: string;
  room: string;
  isRoomAlert?: boolean; // Red text in the timetable image (2B, 2E, 5D)
  isCyan?: boolean;      // Cyan background cell in the timetable image
}

export const TIMETABLE_SCHEDULE: TimetableSlot[] = [
  // MONDAY
  { day: 'Monday', period: 1, timeSlot: '5.45-6.45PM', subjectName: 'WBD II', subjectCode: 'WBD201', teacher: 'RR', room: '2H', isCyan: false },
  { day: 'Monday', period: 2, timeSlot: '6.45-7.45PM', subjectName: 'MA I', subjectCode: 'MA101', teacher: 'KO', room: '2H', isCyan: false },
  { day: 'Monday', period: 3, timeSlot: '7.45-8.45PM', subjectName: 'J II', subjectCode: 'J201', teacher: 'LIM', room: '2H', isCyan: false },

  // TUESDAY
  { day: 'Tuesday', period: 1, timeSlot: '5.45-6.45PM', subjectName: 'SA II', subjectCode: 'SA201', teacher: 'CS', room: '2B', isRoomAlert: true, isCyan: false },
  { day: 'Tuesday', period: 2, timeSlot: '6.45-7.45PM', subjectName: 'LIN I', subjectCode: 'LIN101', teacher: 'PISA', room: '1G', isCyan: true },
  { day: 'Tuesday', period: 3, timeSlot: '7.45-8.45PM', subjectName: 'MA I', subjectCode: 'MA101', teacher: 'KO', room: '1I', isCyan: true },

  // WEDNESDAY
  { day: 'Wednesday', period: 1, timeSlot: '5.45-6.45PM', subjectName: 'CA I', subjectCode: 'CA101', teacher: 'BORA', room: '2E', isRoomAlert: true, isCyan: true },
  { day: 'Wednesday', period: 2, timeSlot: '6.45-7.45PM', subjectName: 'J II', subjectCode: 'J201', teacher: 'LIM', room: '1F', isCyan: true },
  { day: 'Wednesday', period: 3, timeSlot: '7.45-8.45PM', subjectName: 'CND I', subjectCode: 'CND101', teacher: 'ONG', room: '1G', isCyan: true },

  // THURSDAY
  { day: 'Thursday', period: 1, timeSlot: '5.45-6.45PM', subjectName: 'CA I', subjectCode: 'CA101', teacher: 'BORA', room: '5A', isCyan: false },
  { day: 'Thursday', period: 2, timeSlot: '6.45-7.45PM', subjectName: 'O II', subjectCode: 'O201', teacher: 'MAKARA', room: '5A', isCyan: false },
  { day: 'Thursday', period: 3, timeSlot: '7.45-8.45PM', subjectName: 'LIN I', subjectCode: 'LIN101', teacher: 'PISA', room: '5A', isCyan: false },

  // FRIDAY
  { day: 'Friday', period: 1, timeSlot: '5.45-6.45PM', subjectName: 'O II', subjectCode: 'O201', teacher: 'MAKARA', room: '2E', isCyan: true },
  { day: 'Friday', period: 2, timeSlot: '6.45-7.45PM', subjectName: 'WBD II', subjectCode: 'WBD201', teacher: 'RR', room: '2E', isCyan: true },
  { day: 'Friday', period: 3, timeSlot: '7.45-8.45PM', subjectName: 'SA II', subjectCode: 'SA201', teacher: 'CS', room: '5D', isRoomAlert: true, isCyan: false },

  // SATURDAY
  { day: 'Saturday', period: 1, timeSlot: '5.45-6.45PM', subjectName: 'PP', subjectCode: 'PP101', teacher: 'NARITH', room: '2E', isCyan: false },
  { day: 'Saturday', period: 2, timeSlot: '6.45-7.45PM', subjectName: 'PP', subjectCode: 'PP101', teacher: 'NARITH', room: '1H', isCyan: true },
  { day: 'Saturday', period: 3, timeSlot: '7.45-8.45PM', subjectName: 'CND I', subjectCode: 'CND101', teacher: 'ONG', room: '5D', isRoomAlert: true, isCyan: false },
];

interface StudentAttendanceRow {
  student: Student;
  status: AttendanceStatus;
  note: string;
  recordId?: string;
  isModified?: boolean;
}

interface WeekDay {
  dateStr: string;
  dayName: string;
  dayShort: string;
  displayDate: string;
  isCyanHeader: boolean;
  sessions: TimetableSlot[];
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, TimetableGridComponent],
  template: `
    <div class="attendance-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>Attendance Recording & Timetable</h2>
          <p class="text-muted">Manage class attendance across daily and weekly schedules with timetable integration</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button
              class="btn-toggle"
              [class.active]="viewMode() === 'daily'"
              (click)="setViewMode('daily')"
            >
              <i class="fa-solid fa-calendar-day"></i> Daily View
            </button>
            <button
              class="btn-toggle"
              [class.active]="viewMode() === 'weekly'"
              (click)="setViewMode('weekly')"
            >
              <i class="fa-solid fa-calendar-week"></i> Weekly View (6 Days)
            </button>
            <button
              class="btn-toggle"
              [class.active]="viewMode() === 'timetable'"
              (click)="setViewMode('timetable')"
            >
              <i class="fa-solid fa-table-cells"></i> Timetable Grid
            </button>
          </div>
        </div>
      </div>

      <!-- Control Toolbar Card -->
      <div class="card toolbar-card">
        <div class="toolbar-flex">
          <!-- Class Selector -->
          <div class="control-group">
            <label class="control-label">Class Group</label>
            <select
              class="form-select control-input"
              [(ngModel)]="selectedClassId"
              (change)="onClassOrDateChange()"
            >
              <option *ngFor="let cls of classGroups()" [value]="cls._id">
                {{ cls.groupName }}
              </option>
            </select>
          </div>

          <!-- Subject Selector -->
          <div class="control-group" *ngIf="viewMode() !== 'timetable'">
            <label class="control-label">Filter by Subject</label>
            <select
              class="form-select control-input"
              [(ngModel)]="selectedSubjectId"
              (change)="onSubjectChange()"
            >
              <option value="">All Subjects (Overview)</option>
              <option *ngFor="let sub of subjects()" [value]="sub._id">
                {{ sub.subjectName }} ({{ sub.description || sub.subjectCode || 'No code' }})
              </option>
            </select>
          </div>

          <!-- Daily View: Date -->
          <div class="control-group" *ngIf="viewMode() === 'daily'">
            <label class="control-label">Attendance Date</label>
            <input
              type="date"
              class="form-control control-input"
              [(ngModel)]="selectedDate"
              (change)="onClassOrDateChange()"
            />
          </div>

          <!-- Weekly View: Week Start Date -->
          <div class="control-group" *ngIf="viewMode() === 'weekly'">
            <label class="control-label">Week Starting (Mon)</label>
            <div class="input-with-action">
              <input
                type="date"
                class="form-control control-input"
                [(ngModel)]="selectedWeekStart"
                (change)="loadWeeklyData()"
              />
              <button
                class="btn-quick-date"
                title="Jump to Semester Start (28/09/2026)"
                (click)="jumpToSemesterStart()"
              >
                <i class="fa-solid fa-clock-rotate-left"></i> 28/09
              </button>
            </div>
          </div>

          <!-- Student Search -->
          <div class="search-box" *ngIf="viewMode() !== 'timetable'">
            <label class="control-label">Search Student</label>
            <input
              type="text"
              class="form-control control-input"
              placeholder="Filter by name..."
              [(ngModel)]="studentSearch"
            />
          </div>
        </div>

        <!-- Subject Badge Strip (Quick Filter) -->
        <div class="subject-strip mt-3" *ngIf="viewMode() === 'weekly'">
          <span class="strip-label"><i class="fa-solid fa-book-bookmark"></i> Timetable Subjects:</span>
          <button
            class="chip"
            [class.chip-active]="selectedSubjectId === ''"
            (click)="selectSubjectFilter('')"
          >
            All Subjects
          </button>
          <button
            *ngFor="let sub of getDistinctSubjects()"
            class="chip"
            [class.chip-active]="isSubjectSelected(sub.name)"
            (click)="selectSubjectByName(sub.name)"
          >
            <strong>{{ sub.name }}</strong>
            <span class="chip-count">{{ sub.count }}x</span>
          </button>
        </div>
      </div>

      <!-- DAILY VIEW -->
      <div *ngIf="viewMode() === 'daily'" class="daily-view">
        <!-- Daily Timetable Session Pills for Selected Date -->
        <div class="day-sessions-banner card" *ngIf="getDaySessions(selectedDate).length > 0">
          <div class="banner-title">
            <i class="fa-solid fa-calendar-day"></i>
            <span>Scheduled Subjects on {{ getDayName(selectedDate) }} ({{ selectedDate }}):</span>
          </div>
          <div class="session-pills">
            <div
              *ngFor="let session of getDaySessions(selectedDate)"
              class="session-pill"
              [class.active-pill]="isSubjectSelected(session.subjectName)"
              (click)="selectSubjectByName(session.subjectName)"
            >
              <div class="pill-time">{{ session.timeSlot }}</div>
              <div class="pill-name">{{ session.subjectName }}</div>
              <div class="pill-info">
                {{ session.teacher }} • Room
                <span [class.text-danger]="session.isRoomAlert">{{ session.room }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Summary Indicators -->
        <div class="summary-cards">
          <div class="summary-card">
            <span class="sm-label">Total in Class</span>
            <span class="sm-value">{{ studentRows().length }}</span>
          </div>
          <div class="summary-card sm-present">
            <span class="sm-label">Present</span>
            <span class="sm-value">{{ countStatus('present') }}</span>
          </div>
          <div class="summary-card sm-absent">
            <span class="sm-label">Absent</span>
            <span class="sm-value">{{ countStatus('absent') }}</span>
          </div>
          <div class="summary-card sm-late">
            <span class="sm-label">Late</span>
            <span class="sm-value">{{ countStatus('late') }}</span>
          </div>
          <div class="summary-card sm-permission">
            <span class="sm-label">Permission</span>
            <span class="sm-value">{{ countStatus('excused') }}</span>
          </div>
          <div class="summary-card sm-rate">
            <span class="sm-label">Attendance Rate</span>
            <span class="sm-value">{{ calcDailyRate() }}%</span>
          </div>
        </div>

        <!-- Attendance Sheet Table -->
        <div class="card mt-3">
          <div class="card-header">
            <div class="header-left">
              <span class="card-title">
                Attendance Sheet: {{ getSelectedClassName() }} — {{ selectedDate }}
                <span *ngIf="getSelectedSubjectName()" class="badge-subject-tag">
                  <i class="fa-solid fa-book"></i> {{ getSelectedSubjectName() }}
                </span>
              </span>
              <span *ngIf="isLoading()" class="text-muted ml-2">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading...
              </span>
            </div>
            <div class="header-right">
              <button class="btn btn-outline btn-sm" (click)="markAllPresent()">
                <i class="fa-solid fa-check-double"></i> Mark All Present
              </button>
              <button
                class="btn btn-primary"
                [disabled]="isSaving() || studentRows().length === 0"
                (click)="saveAttendance()"
              >
                <i *ngIf="isSaving()" class="fa-solid fa-spinner fa-spin"></i>
                <i *ngIf="!isSaving()" class="fa-solid fa-floppy-disk"></i>
                Save Attendance
              </button>
            </div>
          </div>

          <div class="table-container" style="border: none;">
            <table class="table" *ngIf="filteredStudentRows().length > 0; else noRows">
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Student Name</th>
                  <th>Khmer Name</th>
                  <th>Gender</th>
                  <th style="width: 380px;">Attendance Status</th>
                  <th>Note / Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of filteredStudentRows(); let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <strong>{{ getStudentDisplayName(row.student) }}</strong>
                  </td>
                  <td>
                    <span class="khmer-text">{{ row.student.studentname_kh || '—' }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="row.student.gender === 'female' || row.student.gender === 'F' ? 'badge-excused' : 'badge-role'">
                      {{ row.student.gender === 'female' || row.student.gender === 'F' ? 'F' : 'M' }}
                    </span>
                  </td>
                  <td>
                    <div class="status-btn-group">
                      <button
                        type="button"
                        class="status-btn btn-present"
                        [class.active]="row.status === 'present'"
                        (click)="setStatus(row, 'present')"
                      >
                        <i class="fa-solid fa-check"></i> Present
                      </button>

                      <button
                        type="button"
                        class="status-btn btn-absent"
                        [class.active]="row.status === 'absent'"
                        (click)="setStatus(row, 'absent')"
                      >
                        <i class="fa-solid fa-xmark"></i> Absent
                      </button>

                      <button
                        type="button"
                        class="status-btn btn-late"
                        [class.active]="row.status === 'late'"
                        (click)="setStatus(row, 'late')"
                      >
                        <i class="fa-solid fa-clock"></i> Late
                      </button>

                      <button
                        type="button"
                        class="status-btn btn-permission"
                        [class.active]="row.status === 'excused' || row.status === 'on-leave'"
                        (click)="setStatus(row, 'excused')"
                      >
                        <i class="fa-solid fa-envelope-open-text"></i> Permission
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Optional note..."
                      [(ngModel)]="row.note"
                      (change)="row.isModified = true"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noRows>
              <div class="empty-state">
                <i class="fa-solid fa-users-slash empty-icon"></i>
                <p>No students found in this class group.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- WEEKLY VIEW (6 DAYS: MON - SAT) -->
      <div *ngIf="viewMode() === 'weekly'" class="weekly-view">
        <div class="card">
          <div class="card-header">
            <div class="header-left">
              <span class="card-title">
                Weekly Attendance Matrix: {{ getSelectedClassName() }}
                ({{ weekDays()[0]?.displayDate }} — {{ weekDays()[5]?.displayDate }})
              </span>
              <span *ngIf="getSelectedSubjectName()" class="badge-subject-tag ml-2">
                Subject Filter: <strong>{{ getSelectedSubjectName() }}</strong>
              </span>
            </div>
            <div class="header-right">
              <button class="btn btn-outline btn-sm" (click)="setViewMode('timetable')">
                <i class="fa-solid fa-eye"></i> View Full Timetable
              </button>
              <button class="btn btn-outline btn-sm" (click)="loadWeeklyData()">
                <i class="fa-solid fa-rotate-right"></i> Refresh
              </button>
            </div>
          </div>

          <div class="table-container" style="border: none; overflow-x: auto;">
            <table class="table weekly-table">
              <thead>
                <tr>
                  <th style="min-width: 180px;">Student Name</th>
                  <th
                    *ngFor="let day of weekDays()"
                    class="text-center day-header-cell"
                    [class.cyan-header]="day.isCyanHeader"
                    style="min-width: 140px;"
                  >
                    <div class="day-title">{{ day.dayName }}</div>
                    <div class="day-date">{{ day.displayDate }}</div>

                    <!-- Scheduled subjects for this day -->
                    <div class="day-subjects-list">
                      <div
                        *ngFor="let s of day.sessions"
                        class="day-subject-item"
                        [class.highlighted]="isSubjectSelected(s.subjectName)"
                        (click)="selectSubjectByName(s.subjectName)"
                        [title]="s.timeSlot + ' • Room: ' + s.room + ' (' + s.teacher + ')'"
                      >
                        <span class="sub-name">{{ s.subjectName }}</span>
                        <span class="sub-room" [class.text-danger]="s.isRoomAlert">({{ s.room }})</span>
                      </div>
                    </div>
                  </th>
                  <th class="text-center" style="min-width: 120px;">Present / Week</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let student of filteredWeeklyStudents()">
                  <td>
                    <strong>{{ getStudentDisplayName(student) }}</strong>
                    <div class="khmer-text text-muted" style="font-size: 0.775rem;">
                      {{ student.studentname_kh }}
                    </div>
                  </td>
                  <td
                    *ngFor="let day of weekDays()"
                    class="text-center weekly-cell"
                    [class.cyan-cell]="day.isCyanHeader"
                  >
                    <!-- When filtering by a single subject -->
                    <ng-container *ngIf="selectedSubjectId; else allSubjectsCell">
                      <ng-container *ngIf="isSubjectOnDay(day.dayName); else noSubjectOnDay">
                        <span
                          class="badge"
                          [ngClass]="'badge-' + getWeeklyStatusClass(student._id, day.dateStr)"
                        >
                          {{ getWeeklyStatusLabel(student._id, day.dateStr) }}
                        </span>
                      </ng-container>
                      <ng-template #noSubjectOnDay>
                        <span class="text-muted" title="No session for selected subject on this day">—</span>
                      </ng-template>
                    </ng-container>

                    <!-- When viewing All Subjects -->
                    <ng-template #allSubjectsCell>
                      <div class="multi-status-badges">
                        <span
                          class="badge"
                          [ngClass]="'badge-' + getWeeklyStatusClass(student._id, day.dateStr)"
                        >
                          {{ getWeeklyStatusLabel(student._id, day.dateStr) }}
                        </span>
                      </div>
                    </ng-template>
                  </td>
                  <td class="text-center">
                    <strong class="present-count">
                      {{ getWeeklyPresentCount(student._id) }} / 6
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TIMETABLE GRID VIEW (ANGULAR DEFERRABLE VIEW) -->
      @if (viewMode() === 'timetable') {
        <div class="timetable-view">
          @defer (when viewMode() === 'timetable') {
            <app-timetable-grid
              [className]="getSelectedClassName()"
              [timetableSchedule]="timetableSchedule"
              (sessionSelected)="takeAttendanceForSession($event)"
            />
          } @placeholder (minimum 300ms) {
            <div class="card p-5 text-center placeholder-box">
              <i class="fa-solid fa-table-cells fa-2x text-muted mb-2"></i>
              <p class="text-muted">Loading timetable schedule...</p>
            </div>
          } @loading (minimum 600ms) {
            <div class="card p-5 text-center placeholder-box">
              <i class="fa-solid fa-spinner fa-spin fa-2x text-primary mb-2"></i>
              <p class="text-muted">Rendering class timetable (Lazy-loading chunk)...</p>
            </div>
          } @error {
            <div class="card p-5 text-center text-danger placeholder-box">
              <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
              <p>Failed to load timetable view.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .attendance-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .page-header h2 { font-size: 1.45rem; font-weight: 700; }

    .view-toggle {
      display: flex;
      background-color: #e2e8f0;
      padding: 3px;
      border-radius: var(--radius-sm);
    }
    .btn-toggle {
      border: none;
      background: transparent;
      padding: 0.45rem 0.95rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease-in-out;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-toggle.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .toolbar-card { padding: 1.25rem; }
    .toolbar-flex {
      display: flex;
      align-items: flex-end;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 190px;
    }
    .control-label {
      font-size: 0.775rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .control-input { height: 40px; }
    .search-box {
      flex: 1;
      min-width: 200px;
    }

    .input-with-action {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .btn-quick-date {
      height: 40px;
      padding: 0 0.65rem;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid var(--border-color);
      background: #f8fafc;
      border-radius: var(--radius-sm);
      color: var(--primary);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .btn-quick-date:hover {
      background: #e0f2fe;
      border-color: #7dd3fc;
    }

    /* Subject Chip Strip */
    .subject-strip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--border-color);
    }
    .strip-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-right: 0.25rem;
    }
    .chip {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.775rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .chip:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
    .chip.chip-active {
      background: #0284c7;
      border-color: #0284c7;
      color: #ffffff;
    }
    .chip-count {
      background: rgba(0,0,0,0.08);
      font-size: 0.7rem;
      padding: 1px 5px;
      border-radius: 6px;
    }
    .chip.chip-active .chip-count {
      background: rgba(255,255,255,0.25);
      color: #ffffff;
    }

    /* Daily Sessions Banner */
    .day-sessions-banner {
      padding: 0.85rem 1.25rem;
      background: linear-gradient(to right, #f0fdf4, #f8fafc);
      border-left: 4px solid #16a34a;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-bottom: 1rem;
    }
    .banner-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .session-pills {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .session-pill {
      background: #ffffff;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-sm);
      padding: 0.45rem 0.75rem;
      font-size: 0.8rem;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      transition: all 0.15s;
    }
    .session-pill:hover, .session-pill.active-pill {
      background: #16a34a;
      border-color: #16a34a;
      color: #ffffff;
    }
    .session-pill.active-pill .pill-time,
    .session-pill.active-pill .pill-info {
      color: #dcfce7;
    }
    .pill-time { font-size: 0.7rem; color: #64748b; font-weight: 600; }
    .pill-name { font-size: 0.9rem; font-weight: 700; margin: 2px 0; }
    .pill-info { font-size: 0.725rem; color: #475569; }

    /* Summary cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.85rem;
    }
    .summary-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
    }
    .sm-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .sm-value { font-size: 1.45rem; font-weight: 700; color: var(--text-main); margin-top: 0.2rem; }

    .sm-present { border-left: 4px solid var(--success); }
    .sm-absent { border-left: 4px solid var(--danger); }
    .sm-late { border-left: 4px solid var(--warning); }
    .sm-permission { border-left: 4px solid var(--info); }
    .sm-rate { border-left: 4px solid var(--primary); }

    .header-left { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .header-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

    .badge-subject-tag {
      background: #e0f2fe;
      color: #0369a1;
      font-size: 0.775rem;
      font-weight: 700;
      padding: 0.25rem 0.55rem;
      border-radius: 4px;
      border: 1px solid #bae6fd;
    }

    /* 4-button Status Group */
    .status-btn-group {
      display: inline-flex;
      border-radius: var(--radius-sm);
      background-color: #f1f5f9;
      padding: 2px;
      gap: 2px;
    }
    .status-btn {
      border: 1px solid transparent;
      background: transparent;
      padding: 0.35rem 0.65rem;
      font-size: 0.775rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.1s ease-in-out;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .status-btn:hover { background: #e2e8f0; }

    .status-btn.btn-present.active { background-color: #16a34a; color: #ffffff; }
    .status-btn.btn-absent.active { background-color: #dc2626; color: #ffffff; }
    .status-btn.btn-late.active { background-color: #d97706; color: #ffffff; }
    .status-btn.btn-permission.active { background-color: #0284c7; color: #ffffff; }

    /* Weekly Table with Day-Headers and Subject Badges */
    .weekly-table th, .weekly-table td {
      vertical-align: middle;
      border: 1px solid #e2e8f0;
    }
    .day-header-cell {
      padding: 0.65rem 0.45rem !important;
      background: #f8fafc;
    }
    .day-header-cell.cyan-header {
      background: #d8f1fa !important;
      border-bottom: 2px solid #38bdf8;
    }
    .day-title { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
    .day-date { font-size: 0.75rem; color: #64748b; font-weight: 500; margin-bottom: 0.35rem; }

    .day-subjects-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .day-subject-item {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      padding: 2px 4px;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.1s;
      display: flex;
      justify-content: space-between;
      gap: 2px;
    }
    .day-subject-item:hover, .day-subject-item.highlighted {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }
    .day-subject-item.highlighted .sub-room {
      color: #ffedd5 !important;
    }
    .sub-name { font-weight: 700; }
    .sub-room { font-size: 0.65rem; color: #64748b; }

    .weekly-cell.cyan-cell {
      background-color: #f0f9ff;
    }
    .present-count {
      color: var(--primary);
      font-size: 0.95rem;
    }

    /* TIMETABLE VIEW (Replica of the user's uploaded schedule image) */
    .timetable-card {
      border: 2px solid #0f172a;
      border-radius: 4px;
      overflow: hidden;
      padding: 0;
      background: #ffffff;
    }
    .timetable-top-banner {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      background: #f8fafc;
      border-bottom: 2px solid #0f172a;
    }
    .banner-left-box {
      background: #60c5ea;
      padding: 0.65rem 1.5rem;
      font-weight: 800;
      font-size: 1.15rem;
      color: #000000;
      border-right: 2px solid #0f172a;
      letter-spacing: 0.02em;
    }
    .banner-center-box {
      background: #60c5ea;
      padding: 0.65rem 1.5rem;
      font-weight: 700;
      font-size: 0.95rem;
      color: #000000;
      border-left: 2px solid #0f172a;
      border-right: 2px solid #0f172a;
      display: flex;
      align-items: center;
    }
    .banner-right-box {
      padding: 0.65rem 1.25rem;
      font-weight: 700;
      font-size: 0.9rem;
      color: #1e293b;
      display: flex;
      align-items: center;
    }

    .timetable-grid-container {
      overflow-x: auto;
    }
    .timetable-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    .timetable-table th, .timetable-table td {
      border: 2px solid #0f172a;
      text-align: center;
      padding: 0.75rem 0.5rem;
    }
    .timetable-table thead th {
      font-size: 0.9rem;
      font-weight: 800;
      color: #000000;
      background: #ffffff;
      letter-spacing: 0.05em;
    }
    .timetable-table thead th.cyan-col {
      background: #bce7f7 !important;
    }
    .time-header-col {
      width: 130px;
      background: #f1f5f9 !important;
    }

    .time-label-cell {
      background: #f8fafc;
      font-size: 0.85rem;
      color: #0f172a;
    }
    .period-sub {
      font-size: 0.725rem;
      color: #64748b;
      margin-top: 3px;
    }

    .timetable-cell {
      background: #ffffff;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease-in-out;
      min-width: 130px;
    }
    .timetable-cell.cyan-cell {
      background: #bce7f7 !important;
    }
    .timetable-cell:hover {
      box-shadow: inset 0 0 0 2px #0284c7;
      transform: scale(0.99);
    }
    .cell-time {
      font-size: 0.7rem;
      color: #475569;
      font-weight: 600;
    }
    .cell-subject {
      font-size: 1.05rem;
      font-weight: 800;
      color: #000000;
      margin: 3px 0;
    }
    .cell-teacher-room {
      font-size: 0.85rem;
      font-weight: 700;
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .room-pill {
      font-weight: 800;
    }
    .room-alert, .text-danger {
      color: #dc2626 !important;
    }

    .cell-action-hint {
      display: none;
      font-size: 0.65rem;
      font-weight: 700;
      color: #0284c7;
      margin-top: 4px;
    }
    .timetable-cell:hover .cell-action-hint {
      display: block;
    }

    .timetable-legend {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0.85rem 1.25rem;
      background: #f8fafc;
      border-top: 2px solid #0f172a;
      flex-wrap: wrap;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }
    .legend-item { display: flex; align-items: center; gap: 0.45rem; }
    .legend-badge { display: inline-block; width: 16px; height: 16px; border: 1px solid #0f172a; }
    .legend-badge.cyan-box { background: #bce7f7; }
    .red-text { color: #dc2626; font-weight: 800; }

    .text-center { text-align: center; }
    .khmer-text { font-family: 'Kantumruy Pro', sans-serif; }
    .mt-3 { margin-top: 1rem; }
    .ml-2 { margin-left: 0.5rem; }
    .empty-state { text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.5rem; }
  `],
})
export class AttendanceComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly classService = inject(ClassService);
  private readonly studentService = inject(StudentService);
  private readonly subjectService = inject(SubjectService);
  private readonly toast = inject(ToastService);

  readonly viewMode = signal<'daily' | 'weekly' | 'timetable'>('daily');
  readonly classGroups = signal<ClassGroup[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly classStudents = signal<Student[]>([]);
  readonly studentRows = signal<StudentAttendanceRow[]>([]);
  readonly weeklyRecords = signal<AttendanceRecord[]>([]);

  selectedClassId = '';
  selectedSubjectId = '';
  selectedDate = new Date().toISOString().split('T')[0];
  selectedWeekStart = this.getMonday(new Date()).toISOString().split('T')[0];
  studentSearch = '';

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly timetableSchedule: TimetableSlot[] = TIMETABLE_SCHEDULE;

  readonly filteredStudentRows = computed(() => {
    const list = this.studentRows();
    const query = this.studentSearch.trim().toLowerCase();
    if (!query) return list;
    return list.filter((r) => {
      const en = (r.student.studentname_en || `${r.student.firstName} ${r.student.lastName}`).toLowerCase();
      const kh = (r.student.studentname_kh || '').toLowerCase();
      return en.includes(query) || kh.includes(query);
    });
  });

  readonly filteredWeeklyStudents = computed(() => {
    const list = this.classStudents();
    const query = this.studentSearch.trim().toLowerCase();
    if (!query) return list;
    return list.filter((s) => {
      const en = (s.studentname_en || `${s.firstName} ${s.lastName}`).toLowerCase();
      const kh = (s.studentname_kh || '').toLowerCase();
      return en.includes(query) || kh.includes(query);
    });
  });

  // 6 Days Week (Mon - Sat) matching Timetable
  readonly weekDays = computed<WeekDay[]>(() => {
    const days: WeekDay[] = [];
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Cyan highlighted days from timetable image: Tue, Wed, Fri
    const cyanDays = ['Tuesday', 'Wednesday', 'Friday'];
    const start = new Date(this.selectedWeekStart);

    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = names[i];
      const sessions = this.timetableSchedule.filter((s) => s.day === dayName);

      days.push({
        dateStr,
        dayName,
        dayShort: shortNames[i],
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
        isCyanHeader: cyanDays.includes(dayName),
        sessions,
      });
    }
    return days;
  });

  ngOnInit() {
    this.loadClassesAndSubjects();
  }

  loadClassesAndSubjects() {
    this.classService.getClassGroups().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.classGroups.set(res.data);
          // Prefer class SV50 (E-N) if present
          const sv50 = res.data.find((c) => c.groupName.includes('SV50'));
          this.selectedClassId = sv50 ? sv50._id : res.data[0]._id;
          this.loadSubjects();
          this.onClassOrDateChange();
        }
      },
    });
  }

  loadSubjects() {
    this.subjectService.getSubjects().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.subjects.set(res.data);
        }
      },
    });
  }

  setViewMode(mode: 'daily' | 'weekly' | 'timetable') {
    this.viewMode.set(mode);
    if (mode === 'daily') {
      this.onClassOrDateChange();
    } else if (mode === 'weekly') {
      this.loadWeeklyData();
    }
  }

  onSubjectChange() {
    if (this.viewMode() === 'daily') {
      this.onClassOrDateChange();
    } else if (this.viewMode() === 'weekly') {
      this.loadWeeklyData();
    }
  }

  selectSubjectFilter(subjectId: string) {
    this.selectedSubjectId = subjectId;
    this.onSubjectChange();
  }

  selectSubjectByName(subjectName: string) {
    const sub = this.subjects().find(
      (s) => s.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase()
    );
    if (sub) {
      if (this.selectedSubjectId === sub._id) {
        this.selectedSubjectId = ''; // toggle off
      } else {
        this.selectedSubjectId = sub._id;
      }
    }
    this.onSubjectChange();
  }

  isSubjectSelected(subjectName: string): boolean {
    if (!this.selectedSubjectId) return false;
    const sub = this.subjects().find((s) => s._id === this.selectedSubjectId);
    return sub ? sub.subjectName.toLowerCase() === subjectName.toLowerCase() : false;
  }

  jumpToSemesterStart() {
    this.selectedWeekStart = '2026-09-28';
    this.loadWeeklyData();
    this.toast.info('Jumped to timetable semester start date: 28/09/2026');
  }

  onClassOrDateChange() {
    if (!this.selectedClassId) return;
    this.isLoading.set(true);

    // 1. Load students in this class
    this.studentService.getStudents({ classGroup: this.selectedClassId }).subscribe({
      next: (studentsRes) => {
        const students = studentsRes.success && studentsRes.data ? studentsRes.data : [];
        this.classStudents.set(students);

        // 2. Load existing attendance for this class, date and optional subject
        const filter: any = { classGroup: this.selectedClassId, date: this.selectedDate };
        if (this.selectedSubjectId) {
          filter.subjectId = this.selectedSubjectId;
        }

        this.attendanceService.getAttendance(filter).subscribe({
          next: (attRes) => {
            this.isLoading.set(false);
            const existingMap = new Map<string, AttendanceRecord>();
            if (attRes.success && attRes.data) {
              attRes.data.forEach((r) => {
                const sId = typeof r.student === 'object' ? (r.student as any)?._id : r.student;
                existingMap.set(sId, r);
              });
            }

            const rows: StudentAttendanceRow[] = students.map((s) => {
              const ex = existingMap.get(s._id);
              return {
                student: s,
                status: (ex ? ex.status : 'present') as AttendanceStatus,
                note: ex?.note || '',
                recordId: ex?._id,
                isModified: false,
              };
            });

            this.studentRows.set(rows);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadWeeklyData() {
    if (!this.selectedClassId) return;
    this.isLoading.set(true);

    const days = this.weekDays();
    const startDate = days[0].dateStr;
    const endDate = days[5].dateStr; // Saturday

    this.studentService.getStudents({ classGroup: this.selectedClassId }).subscribe({
      next: (sRes) => {
        this.classStudents.set(sRes.success && sRes.data ? sRes.data : []);
      },
    });

    const filter: any = { classGroup: this.selectedClassId, startDate, endDate };
    if (this.selectedSubjectId) {
      filter.subjectId = this.selectedSubjectId;
    }

    this.attendanceService.getAttendance(filter).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.weeklyRecords.set(res.success && res.data ? res.data : []);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setStatus(row: StudentAttendanceRow, status: AttendanceStatus) {
    row.status = status;
    row.isModified = true;
  }

  markAllPresent() {
    this.studentRows.update((rows) =>
      rows.map((r) => ({ ...r, status: 'present', isModified: true }))
    );
    this.toast.info('Marked all students as Present');
  }

  saveAttendance() {
    const rows = this.studentRows();
    if (rows.length === 0) return;

    this.isSaving.set(true);

    const records = rows.map((r) => ({
      student: r.student._id,
      status: r.status,
      note: r.note,
    }));

    this.attendanceService
      .bulkMarkAttendance({
        subjectId: this.selectedSubjectId || undefined,
        date: this.selectedDate,
        records,
      })
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.toast.success(res.message || 'Attendance saved successfully');
          this.onClassOrDateChange();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.error(err.error?.message || 'Failed to save attendance');
        },
      });
  }

  // Summary counts
  countStatus(status: AttendanceStatus): number {
    return this.studentRows().filter((r) => {
      if (status === 'excused') return r.status === 'excused' || r.status === 'on-leave';
      return r.status === status;
    }).length;
  }

  calcDailyRate(): number {
    const total = this.studentRows().length;
    if (total === 0) return 100;
    const present = this.countStatus('present');
    return Math.round((present / total) * 100);
  }

  getSelectedClassName(): string {
    const cls = this.classGroups().find((c) => c._id === this.selectedClassId);
    return cls ? cls.groupName : 'SV50 (E-N)';
  }

  getSelectedSubjectName(): string {
    if (!this.selectedSubjectId) return '';
    const sub = this.subjects().find((s) => s._id === this.selectedSubjectId);
    return sub ? sub.subjectName : '';
  }

  getStudentDisplayName(s: Student): string {
    return s.studentname_en || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
  }

  // Day timetable helpers
  getDayName(dateStr: string): string {
    const d = new Date(dateStr);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[d.getDay()];
  }

  getDaySessions(dateStr: string): TimetableSlot[] {
    const dayName = this.getDayName(dateStr);
    return this.timetableSchedule.filter((s) => s.day === dayName);
  }

  isSubjectOnDay(dayName: string): boolean {
    if (!this.selectedSubjectId) return true;
    const subName = this.getSelectedSubjectName();
    if (!subName) return true;
    return this.timetableSchedule.some(
      (s) => s.day === dayName && s.subjectName.toLowerCase() === subName.toLowerCase()
    );
  }

  getDistinctSubjects(): { name: string; count: number }[] {
    const counts: { [name: string]: number } = {};
    for (const slot of this.timetableSchedule) {
      counts[slot.subjectName] = (counts[slot.subjectName] || 0) + 1;
    }
    return Object.keys(counts).map((name) => ({ name, count: counts[name] }));
  }

  getPeriodSlots(period: 1 | 2 | 3): TimetableSlot[] {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOrder.map((day) => {
      const found = this.timetableSchedule.find((s) => s.day === day && s.period === period);
      return (
        found || {
          day: day as any,
          period,
          timeSlot: period === 1 ? '5.45-6.45PM' : period === 2 ? '6.45-7.45PM' : '7.45-8.45PM',
          subjectName: '—',
          subjectCode: '',
          teacher: '—',
          room: '—',
          isCyan: false,
        }
      );
    });
  }

  takeAttendanceForSession(slot: TimetableSlot) {
    if (slot.subjectName === '—') return;
    this.selectSubjectByName(slot.subjectName);
    this.setViewMode('daily');
    this.toast.info(`Switched to Daily View for subject: ${slot.subjectName} (${slot.timeSlot})`);
  }

  // Weekly matrix helpers
  getWeeklyStatusLabel(studentId: string, dateStr: string): string {
    const rec = this.weeklyRecords().find((r) => {
      const sId = typeof r.student === 'object' ? (r.student as any)?._id : r.student;
      const rDate =
        typeof r.date === 'string'
          ? r.date.split('T')[0]
          : new Date(r.date).toISOString().split('T')[0];
      return sId === studentId && rDate === dateStr;
    });

    if (!rec) return '—';
    switch (rec.status) {
      case 'present': return 'P';
      case 'absent': return 'A';
      case 'late': return 'L';
      case 'excused':
      case 'on-leave': return 'Leave';
      default: return rec.status;
    }
  }

  getWeeklyStatusClass(studentId: string, dateStr: string): string {
    const rec = this.weeklyRecords().find((r) => {
      const sId = typeof r.student === 'object' ? (r.student as any)?._id : r.student;
      const rDate =
        typeof r.date === 'string'
          ? r.date.split('T')[0]
          : new Date(r.date).toISOString().split('T')[0];
      return sId === studentId && rDate === dateStr;
    });
    if (!rec) return 'role';
    return rec.status === 'excused' || rec.status === 'on-leave' ? 'excused' : rec.status;
  }

  getWeeklyPresentCount(studentId: string): number {
    return this.weeklyRecords().filter((r) => {
      const sId = typeof r.student === 'object' ? (r.student as any)?._id : r.student;
      return sId === studentId && r.status === 'present';
    }).length;
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
  }
}
