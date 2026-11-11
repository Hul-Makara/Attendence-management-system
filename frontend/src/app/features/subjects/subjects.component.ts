import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../core/services/subject.service';
import { ClassService } from '../../core/services/class.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Subject } from '../../core/models/subject.model';
import { ClassGroup } from '../../core/models/class.model';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subjects-page">
      <div class="page-header">
        <div>
          <h2>Subject Management</h2>
          <p class="text-muted">Manage academic subjects, credits, and class group assignments</p>
        </div>
        <div class="header-actions" *ngIf="authService.isAdmin()">
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fa-solid fa-plus"></i> Add Subject
          </button>
        </div>
      </div>

      <!-- Subjects Table Card -->
      <div class="card mt-3">
        <div class="card-header">
          <span class="card-title">Subject Directory ({{ subjects().length }})</span>
        </div>

        <div class="table-container" style="border: none;">
          <table class="table" *ngIf="subjects().length > 0; else noSubjects">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Credit</th>
                <th>Assigned Teacher</th>
                <th>Class Groups</th>
                <th *ngIf="authService.isAdmin()" style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sub of subjects()">
                <td>
                  <strong>{{ sub.subjectName }}</strong>
                  <div class="text-muted" style="font-size: 0.775rem;">{{ sub.description || 'No description' }}</div>
                </td>
                <td>
                  <span class="badge badge-role">{{ sub.subjectCode || '—' }}</span>
                </td>
                <td>{{ sub.credit || 1 }} Credit(s)</td>
                <td>
                  <span *ngIf="sub.teacherId?.name">{{ sub.teacherId.name }}</span>
                  <span *ngIf="!sub.teacherId?.name" class="text-muted">Unassigned</span>
                </td>
                <td>
                  <div class="class-tags" *ngIf="sub.classGroups && sub.classGroups.length > 0; else noGroups">
                    <span *ngFor="let g of sub.classGroups" class="class-tag">
                      {{ getGroupName(g) }}
                    </span>
                  </div>
                  <ng-template #noGroups>
                    <span class="text-muted">All Classes</span>
                  </ng-template>
                </td>
                <td *ngIf="authService.isAdmin()" style="text-align: right;">
                  <div class="action-buttons">
                    <button class="btn btn-outline btn-sm" (click)="openEditModal(sub)" title="Edit">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" (click)="confirmDelete(sub)" title="Delete">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noSubjects>
            <div class="empty-state">
              <i class="fa-solid fa-book-bookmark empty-icon"></i>
              <p>No subjects added yet.</p>
              <button *ngIf="authService.isAdmin()" class="btn btn-primary btn-sm mt-2" (click)="openAddModal()">
                Add Subject
              </button>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ editingId() ? 'Edit Subject' : 'Add New Subject' }}
            </h3>
            <button class="modal-close" (click)="closeModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form (ngSubmit)="saveSubject()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Subject Name *</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Mathematics"
                  [(ngModel)]="subjectForm.subjectName"
                  name="subjectName"
                  required
                />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Subject Code</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. MATH101"
                    [(ngModel)]="subjectForm.subjectCode"
                    name="subjectCode"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Credit Units (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    class="form-control"
                    [(ngModel)]="subjectForm.credit"
                    name="credit"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="Brief summary of syllabus..."
                  [(ngModel)]="subjectForm.description"
                  name="description"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Assign to Class Group</label>
                <select
                  class="form-select"
                  [(ngModel)]="subjectForm.classGroupId"
                  name="classGroupId"
                >
                  <option value="">All / None</option>
                  <option *ngFor="let cls of classGroups()" [value]="cls._id">
                    {{ cls.groupName }}
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
                Save Subject
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subjects-page { display: flex; flex-direction: column; gap: 1.25rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .page-header h2 { font-size: 1.45rem; font-weight: 700; }
    .mt-3 { margin-top: 1rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .class-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .class-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      background: #eff6ff;
      color: #2563eb;
      border-radius: var(--radius-sm);
      font-weight: 500;
    }
    .action-buttons { display: inline-flex; gap: 0.4rem; }
    .empty-state { text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.5rem; }
  `],
})
export class SubjectsComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly subjectService = inject(SubjectService);
  private readonly classService = inject(ClassService);
  private readonly toast = inject(ToastService);

  readonly subjects = signal<Subject[]>([]);
  readonly classGroups = signal<ClassGroup[]>([]);
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly isSaving = signal(false);

  subjectForm = {
    subjectName: '',
    subjectCode: '',
    credit: 3,
    description: '',
    classGroupId: '',
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.subjectService.getSubjects().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.subjects.set(res.data);
        }
      },
    });

    this.classService.getClassGroups().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.classGroups.set(res.data);
        }
      },
    });
  }

  getGroupName(g: any): string {
    if (typeof g === 'object' && g?.groupName) return g.groupName;
    const found = this.classGroups().find((c) => c._id === g);
    return found ? found.groupName : 'Class';
  }

  openAddModal() {
    this.editingId.set(null);
    this.subjectForm = {
      subjectName: '',
      subjectCode: '',
      credit: 3,
      description: '',
      classGroupId: this.classGroups()[0]?._id || '',
    };
    this.showModal.set(true);
  }

  openEditModal(sub: Subject) {
    this.editingId.set(sub._id);
    const firstGroup = (sub.classGroups && sub.classGroups.length > 0)
      ? (typeof sub.classGroups[0] === 'object' ? (sub.classGroups[0] as any)._id : sub.classGroups[0])
      : '';

    this.subjectForm = {
      subjectName: sub.subjectName,
      subjectCode: sub.subjectCode || '',
      credit: sub.credit || 3,
      description: sub.description || '',
      classGroupId: firstGroup,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveSubject() {
    if (!this.subjectForm.subjectName.trim()) {
      this.toast.warning('Please enter a subject name');
      return;
    }

    this.isSaving.set(true);
    const id = this.editingId();
    const payload: Partial<Subject> = {
      subjectName: this.subjectForm.subjectName.trim(),
      subjectCode: this.subjectForm.subjectCode.trim(),
      credit: this.subjectForm.credit,
      description: this.subjectForm.description.trim(),
      classGroups: this.subjectForm.classGroupId ? [this.subjectForm.classGroupId] : [],
    };

    if (id) {
      this.subjectService.updateSubject(id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('Subject updated successfully');
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.error(err.error?.message || 'Failed to update subject');
        },
      });
    } else {
      this.subjectService.createSubject(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('Subject created successfully');
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.error(err.error?.message || 'Failed to create subject');
        },
      });
    }
  }

  confirmDelete(sub: Subject) {
    if (confirm(`Are you sure you want to delete subject "${sub.subjectName}"?`)) {
      this.subjectService.deleteSubject(sub._id).subscribe({
        next: () => {
          this.toast.success('Subject deleted successfully');
          this.loadData();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to delete subject');
        },
      });
    }
  }
}
