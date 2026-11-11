import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject } from '../models/subject.model';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/subjects`;

  getSubjects(classGroup?: string): Observable<{ success: boolean; data: Subject[] }> {
    let params = new HttpParams();
    if (classGroup) {
      params = params.set('classGroup', classGroup);
    }
    return this.http.get<{ success: boolean; data: Subject[] }>(this.url, { params });
  }

  getSubjectById(id: string): Observable<{ success: boolean; data: Subject }> {
    return this.http.get<{ success: boolean; data: Subject }>(`${this.url}/${id}`);
  }

  createSubject(data: Partial<Subject>): Observable<{ success: boolean; data: Subject }> {
    return this.http.post<{ success: boolean; data: Subject }>(this.url, data);
  }

  updateSubject(id: string, data: Partial<Subject>): Observable<{ success: boolean; data: Subject }> {
    return this.http.put<{ success: boolean; data: Subject }>(`${this.url}/${id}`, data);
  }

  deleteSubject(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`);
  }
}
