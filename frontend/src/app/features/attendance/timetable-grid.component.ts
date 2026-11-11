import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimetableSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: 1 | 2 | 3;
  timeSlot: '5.45-6.45PM' | '6.45-7.45PM' | '7.45-8.45PM';
  subjectName: string;
  subjectCode: string;
  teacher: string;
  room: string;
  isRoomAlert?: boolean;
  isCyan?: boolean;
}

@Component({
  selector: 'app-timetable-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card timetable-card">
      <!-- Timetable Top Banner -->
      <div class="timetable-top-banner">
        <div class="banner-left-box">
          <span class="class-title">{{ className }}</span>
        </div>
        <div class="banner-center-box">
          <span class="semester-date">Schedule Starting: 28/09/2026</span>
        </div>
        <div class="banner-right-box">
          <span class="period-count">P15 • 3 Periods / Day (5:45 PM - 8:45 PM)</span>
        </div>
      </div>

      <!-- Schedule Grid -->
      <div class="table-container timetable-grid-container">
        <table class="table timetable-table">
          <thead>
            <tr>
              <th class="time-header-col">TIME / DAY</th>
              <th class="day-col">MONDAY</th>
              <th class="day-col cyan-col">TUESDAY</th>
              <th class="day-col cyan-col">WEDNESDAY</th>
              <th class="day-col">THURSDAY</th>
              <th class="day-col cyan-col">FRIDAY</th>
              <th class="day-col">SATURDAY</th>
            </tr>
          </thead>
          <tbody>
            <!-- Period 1: 5.45-6.45PM -->
            <tr>
              <td class="time-label-cell">
                <strong>5.45 - 6.45 PM</strong>
                <div class="period-sub">Period 1</div>
              </td>
              <td
                *ngFor="let slot of getPeriodSlots(1)"
                class="timetable-cell"
                [class.cyan-cell]="slot.isCyan"
                (click)="onSessionClick(slot)"
              >
                <div class="cell-time">{{ slot.timeSlot }}</div>
                <div class="cell-subject">{{ slot.subjectName }}</div>
                <div class="cell-teacher-room">
                  <span class="teacher-name">{{ slot.teacher }}</span>
                  <span class="room-pill" [class.room-alert]="slot.isRoomAlert">({{ slot.room }})</span>
                </div>
                <div class="cell-action-hint">
                  <i class="fa-solid fa-arrow-right-to-bracket"></i> Take Attendance
                </div>
              </td>
            </tr>

            <!-- Period 2: 6.45-7.45PM -->
            <tr>
              <td class="time-label-cell">
                <strong>6.45 - 7.45 PM</strong>
                <div class="period-sub">Period 2</div>
              </td>
              <td
                *ngFor="let slot of getPeriodSlots(2)"
                class="timetable-cell"
                [class.cyan-cell]="slot.isCyan"
                (click)="onSessionClick(slot)"
              >
                <div class="cell-time">{{ slot.timeSlot }}</div>
                <div class="cell-subject">{{ slot.subjectName }}</div>
                <div class="cell-teacher-room">
                  <span class="teacher-name">{{ slot.teacher }}</span>
                  <span class="room-pill" [class.room-alert]="slot.isRoomAlert">({{ slot.room }})</span>
                </div>
                <div class="cell-action-hint">
                  <i class="fa-solid fa-arrow-right-to-bracket"></i> Take Attendance
                </div>
              </td>
            </tr>

            <!-- Period 3: 7.45-8.45PM -->
            <tr>
              <td class="time-label-cell">
                <strong>7.45 - 8.45 PM</strong>
                <div class="period-sub">Period 3</div>
              </td>
              <td
                *ngFor="let slot of getPeriodSlots(3)"
                class="timetable-cell"
                [class.cyan-cell]="slot.isCyan"
                (click)="onSessionClick(slot)"
              >
                <div class="cell-time">{{ slot.timeSlot }}</div>
                <div class="cell-subject">{{ slot.subjectName }}</div>
                <div class="cell-teacher-room">
                  <span class="teacher-name">{{ slot.teacher }}</span>
                  <span class="room-pill" [class.room-alert]="slot.isRoomAlert">({{ slot.room }})</span>
                </div>
                <div class="cell-action-hint">
                  <i class="fa-solid fa-arrow-right-to-bracket"></i> Take Attendance
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Timetable Footer Legend -->
      <div class="timetable-legend">
        <div class="legend-item">
          <span class="legend-badge cyan-box"></span>
          <span>Light Blue: Lab / Computer Sessions</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge red-text">2B / 2E / 5D</span>
          <span>Red Text: Specialized Lab / Building Rooms</span>
        </div>
        <div class="legend-item">
          <i class="fa-solid fa-circle-info text-primary"></i>
          <span>Click on any session slot to take attendance or filter</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
    .room-alert {
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
  `],
})
export class TimetableGridComponent {
  @Input() className = 'SV50 (E-N)';
  @Input() timetableSchedule: TimetableSlot[] = [];
  @Output() sessionSelected = new EventEmitter<TimetableSlot>();

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

  onSessionClick(slot: TimetableSlot) {
    if (slot.subjectName !== '—') {
      this.sessionSelected.emit(slot);
    }
  }
}
