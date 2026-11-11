import { Student } from './student.model';
import { Subject } from './subject.model';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'on-leave' | 'half-day';

export interface AttendanceRecord {
  _id?: string;
  student: Student | string;
  subject?: Subject | string;
  date: string | Date;
  checkInTime?: string | Date;
  checkOutTime?: string | Date;
  status: AttendanceStatus;
  isLate?: boolean;
  lateBy?: number;
  workHours?: number;
  markedByTeacher?: any;
  note?: string;
  leaveReference?: any;
  createdAt?: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  excused: number;
  attendanceRate: number;
}
