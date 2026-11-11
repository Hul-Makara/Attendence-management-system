import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Role, UserItem } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-page">
      <div class="page-header">
        <div>
          <h2>User & Role Management</h2>
          <p class="text-muted">Manage system users, login credentials, and assigned roles (Admin Only)</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fa-solid fa-user-plus"></i> Add User Account
          </button>
        </div>
      </div>

      <!-- Users Table Card -->
      <div class="card mt-3">
        <div class="card-header">
          <span class="card-title">Registered Accounts ({{ users().length }})</span>
          <span *ngIf="isLoading()" class="text-muted">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading...
          </span>
        </div>

        <div class="table-container" style="border: none;">
          <table class="table" *ngIf="users().length > 0; else noUsers">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Created At</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users()">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-sm">
                      <i class="fa-solid fa-user"></i>
                    </div>
                    <strong>{{ u.username }}</strong>
                  </div>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="badge" [ngClass]="getRoleBadgeClass(u)">
                    {{ getRoleName(u) }}
                  </span>
                </td>
                <td>
                  <span class="badge" [ngClass]="u.isActive ? 'badge-success' : 'badge-danger'">
                    <i class="fa-solid" [ngClass]="u.isActive ? 'fa-check' : 'fa-xmark'"></i>
                    {{ u.isActive ? 'Active' : 'Deactivated' }}
                  </span>
                </td>
                <td>{{ u.createdAt ? (u.createdAt | date: 'mediumDate') : '—' }}</td>
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button
                      class="btn btn-outline btn-sm"
                      [title]="u.isActive ? 'Deactivate Account' : 'Activate Account'"
                      (click)="toggleStatus(u)"
                    >
                      <i class="fa-solid" [ngClass]="u.isActive ? 'fa-user-slash text-danger' : 'fa-user-check text-success'"></i>
                    </button>
                    <button
                      class="btn btn-danger btn-sm"
                      title="Delete User"
                      [disabled]="u._id === authService.currentUser()?.id"
                      (click)="confirmDelete(u)"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noUsers>
            <div class="empty-state">
              <i class="fa-solid fa-users-slash empty-icon"></i>
              <p>No user accounts found.</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Add User Modal -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Create New User Account</h3>
            <button class="modal-close" (click)="closeModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form (ngSubmit)="saveUser()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Username *</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. teacher_sok"
                  [(ngModel)]="userForm.username"
                  name="username"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="e.g. teacher@school.com"
                  [(ngModel)]="userForm.email"
                  name="email"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Initial Password *</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Minimum 6 characters"
                  [(ngModel)]="userForm.password"
                  name="password"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">User Role *</label>
                <select
                  class="form-select"
                  [(ngModel)]="userForm.roleId"
                  name="roleId"
                  required
                >
                  <option value="">Select Role</option>
                  <option *ngFor="let r of roles()" [value]="r._id">
                    {{ r.roleName }} — {{ r.roleDescription }}
                  </option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
                <i *ngIf="isSaving()" class="fa-solid fa-spinner fa-spin"></i>
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-page { display: flex; flex-direction: column; gap: 1.25rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .page-header h2 { font-size: 1.45rem; font-weight: 700; }
    .mt-3 { margin-top: 1rem; }
    .user-cell { display: flex; align-items: center; gap: 0.65rem; }
    .user-avatar-sm {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }
    .text-danger { color: #dc2626; }
    .text-success { color: #16a34a; }
    .action-buttons { display: inline-flex; gap: 0.4rem; }
    .empty-state { text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.5rem; }
  `],
})
export class UsersComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  readonly users = signal<UserItem[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly isLoading = signal(false);
  readonly showModal = signal(false);
  readonly isSaving = signal(false);

  userForm = {
    username: '',
    email: '',
    password: '',
    roleId: '',
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.users.set(res.data);
        }
      },
      error: () => this.isLoading.set(false),
    });

    this.userService.getRoles().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.roles.set(res.data);
        }
      },
    });
  }

  getRoleName(u: UserItem): string {
    if (u.role && typeof u.role === 'object') return u.role.roleName;
    return 'User';
  }

  getRoleBadgeClass(u: UserItem): string {
    const role = this.getRoleName(u).toLowerCase();
    if (role === 'admin') return 'badge-role bg-admin';
    if (role === 'teacher') return 'badge-present';
    return 'badge-role';
  }

  openAddModal() {
    this.userForm = {
      username: '',
      email: '',
      password: '',
      roleId: this.roles().find((r) => r.roleName.toLowerCase() === 'teacher')?._id || this.roles()[0]?._id || '',
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveUser() {
    if (!this.userForm.username || !this.userForm.email || !this.userForm.password || !this.userForm.roleId) {
      this.toast.warning('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    this.userService
      .createUser({
        username: this.userForm.username.trim(),
        email: this.userForm.email.trim(),
        password: this.userForm.password,
        role: this.userForm.roleId,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('User account created successfully');
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.error(err.error?.message || 'Failed to create user');
        },
      });
  }

  toggleStatus(u: UserItem) {
    this.userService.toggleStatus(u._id).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Status updated');
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to toggle status');
      },
    });
  }

  confirmDelete(u: UserItem) {
    if (confirm(`Delete user account "${u.username}"?`)) {
      this.userService.deleteUser(u._id).subscribe({
        next: () => {
          this.toast.success('User deleted');
          this.loadData();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to delete user');
        },
      });
    }
  }
}
