import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/students`;

  getStudents(params?: { classGroup?: string; search?: string }): Observable<{ success: boolean; data: Student[] }> {
    let httpParams = new HttpParams();
    if (params?.classGroup) httpParams = httpParams.set('classGroup', params.classGroup);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<{ success: boolean; data: Student[] }>(this.url, { params: httpParams });
  }

  getStudentById(id: string): Observable<{ success: boolean; data: Student }> {
    return this.http.get<{ success: boolean; data: Student }>(`${this.url}/${id}`);
  }

  createStudent(data: Partial<Student>): Observable<{ success: boolean; data: Student }> {
    return this.http.post<{ success: boolean; data: Student }>(this.url, data);
  }

  updateStudent(id: string, data: Partial<Student>): Observable<{ success: boolean; data: Student }> {
    return this.http.put<{ success: boolean; data: Student }>(`${this.url}/${id}`, data);
  }

  deleteStudent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`);
  }

  importStudents(file: File): Observable<{ success: boolean; message: string; data: Student[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; message: string; data: Student[] }>(`${this.url}/import`, formData);
  }

  exportStudentsUrl(classGroup?: string): string {
    const query = classGroup ? `?classGroup=${classGroup}` : '';
    return `${this.url}/export${query}`;
  }
}
