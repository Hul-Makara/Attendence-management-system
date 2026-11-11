import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendanceRecord, AttendanceStats, AttendanceStatus } from '../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/attendance`;

  getAttendance(filter?: {
    classGroup?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    studentId?: string;
    subjectId?: string;
    status?: string;
  }): Observable<{ success: boolean; data: AttendanceRecord[] }> {
    let params = new HttpParams();
    if (filter?.classGroup) params = params.set('classGroup', filter.classGroup);
    if (filter?.date) params = params.set('date', filter.date);
    if (filter?.startDate) params = params.set('startDate', filter.startDate);
    if (filter?.endDate) params = params.set('endDate', filter.endDate);
    if (filter?.studentId) params = params.set('studentId', filter.studentId);
    if (filter?.subjectId) params = params.set('subjectId', filter.subjectId);
    if (filter?.status) params = params.set('status', filter.status);

    return this.http.get<{ success: boolean; data: AttendanceRecord[] }>(this.url, { params });
  }

  getTodayAttendance(): Observable<{ success: boolean; data: AttendanceRecord[] }> {
    return this.http.get<{ success: boolean; data: AttendanceRecord[] }>(`${this.url}/today`);
  }

  getStudentStats(studentId: string): Observable<{ success: boolean; data: AttendanceStats }> {
    return this.http.get<{ success: boolean; data: AttendanceStats }>(`${this.url}/stats/${studentId}`);
  }

  markAttendance(data: {
    student: string;
    subject?: string;
    date: string;
    status: AttendanceStatus;
    note?: string;
    checkInTime?: string;
    checkOutTime?: string;
  }): Observable<{ success: boolean; data: AttendanceRecord }> {
    return this.http.post<{ success: boolean; data: AttendanceRecord }>(this.url, data);
  }

  bulkMarkAttendance(data: {
    subjectId?: string;
    date: string;
    records: { student: string; status: AttendanceStatus; note?: string }[];
  }): Observable<{ success: boolean; message: string; data: { marked: number } }> {
    return this.http.post<{ success: boolean; message: string; data: { marked: number } }>(`${this.url}/bulk`, data);
  }

  updateAttendance(id: string, data: Partial<AttendanceRecord>): Observable<{ success: boolean; data: AttendanceRecord }> {
    return this.http.put<{ success: boolean; data: AttendanceRecord }>(`${this.url}/${id}`, data);
  }

  deleteAttendance(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`);
  }
}
