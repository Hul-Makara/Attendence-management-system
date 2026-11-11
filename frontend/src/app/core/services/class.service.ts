import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassGroup } from '../models/class.model';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/class-groups`;

  getClassGroups(): Observable<{ success: boolean; data: ClassGroup[] }> {
    return this.http.get<{ success: boolean; data: ClassGroup[] }>(this.url);
  }

  getClassGroupById(id: string): Observable<{ success: boolean; data: ClassGroup }> {
    return this.http.get<{ success: boolean; data: ClassGroup }>(`${this.url}/${id}`);
  }

  createClassGroup(data: { groupName: string; description?: string }): Observable<{ success: boolean; data: ClassGroup }> {
    return this.http.post<{ success: boolean; data: ClassGroup }>(this.url, data);
  }

  updateClassGroup(id: string, data: { groupName?: string; description?: string }): Observable<{ success: boolean; data: ClassGroup }> {
    return this.http.put<{ success: boolean; data: ClassGroup }>(`${this.url}/${id}`, data);
  }

  deleteClassGroup(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`);
  }
}
