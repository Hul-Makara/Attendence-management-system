import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, UserItem } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  getUsers(): Observable<{ success: boolean; data: UserItem[] }> {
    return this.http.get<{ success: boolean; data: UserItem[] }>(this.url);
  }

  getUserById(id: string): Observable<{ success: boolean; data: UserItem }> {
    return this.http.get<{ success: boolean; data: UserItem }>(`${this.url}/${id}`);
  }

  createUser(data: { username: string; email: string; password: string; role: string }): Observable<{ success: boolean; data: UserItem }> {
    return this.http.post<{ success: boolean; data: UserItem }>(this.url, data);
  }

  toggleStatus(id: string): Observable<{ success: boolean; message: string; data: UserItem }> {
    return this.http.patch<{ success: boolean; message: string; data: UserItem }>(`${this.url}/${id}/toggle-status`, {});
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`);
  }

  getRoles(): Observable<{ success: boolean; data: Role[] }> {
    return this.http.get<{ success: boolean; data: Role[] }>(this.rolesUrl);
  }
}
