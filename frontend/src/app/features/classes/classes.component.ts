import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../core/services/class.service';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ClassGroup } from '../../core/models/class.model';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="classes-page">
      <div class="page-header">
        <div>
          <h2>Class Management</h2>
          <p class="text-muted">Create and manage class sections and student allocations</p>
        </div>
        <div class="header-actions" *ngIf="authService.isAdmin()">
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fa-solid fa-plus"></i> Add Class
          </button>
        </div>
      </div>

      <!-- Classes Grid -->
      <div class="classes-grid mt-3">
        <div class="class-card" *ngFor="let cls of classListWithCount()">
          <div class="class-card-header">
            <div class="class-badge-icon">
              <i class="fa-solid fa-chalkboard-user"></i>
            </div>
            <div class="class-actions" *ngIf="authService.isAdmin()">
              <button class="btn-icon" title="Edit Class" (click)="openEditModal(cls)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon danger" title="Delete Class" (click)="confirmDelete(cls)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div class="class-card-body">
            <h3 class="class-name">{{ cls.groupName }}</h3>
            <p class="class-desc">{{ cls.description || 'No description provided' }}</p>

            <div class="class-stats">
              <div class="stat-pill">
                <i class="fa-solid fa-user-graduate"></i>
                <span><strong>{{ cls.studentCount }}</strong> Students Enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ editingId() ? 'Edit Class' : 'Create New Class' }}
            </h3>
            <button class="modal-close" (click)="closeModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form (ngSubmit)="saveClass()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Class Name *</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Grade 10A or Class 12B"
                  [(ngModel)]="classForm.groupName"
                  name="groupName"
                  required
                />
                <small class="text-muted" style="font-size: 0.775rem;">
                  Duplicate class names are strictly prevented.
                </small>
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  placeholder="e.g. Science stream, Room 302..."
                  [(ngModel)]="classForm.description"
                  name="description"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
                <i *ngIf="isSaving()" class="fa-solid fa-spinner fa-spin"></i>
                Save Class
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .classes-page { display: flex; flex-direction: column; gap: 1.25rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .page-header h2 { font-size: 1.45rem; font-weight: 700; }
    .mt-3 { margin-top: 1rem; }

    .classes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .class-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.15s ease-in-out;
    }
    .class-card:hover {
      box-shadow: var(--shadow-md);
      border-color: #cbd5e1;
    }
    .class-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .class-badge-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background-color: #fdf4ff;
      color: #c026d3;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .class-actions { display: flex; gap: 0.35rem; }
    .btn-icon {
      background: transparent;
      border: 1px solid var(--border-color);
      padding: 0.4rem;
      border-radius: var(--radius-sm);
      color: #64748b;
      cursor: pointer;
    }
    .btn-icon:hover { color: var(--primary); background-color: #eff6ff; }
    .btn-icon.danger:hover { color: var(--danger); background-color: var(--danger-light); }

    .class-name { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem; }
    .class-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; min-height: 40px; }

    .class-stats { border-top: 1px solid var(--border-color); padding-top: 0.85rem; }
    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #334155;
    }
  `],
})
export class ClassesComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly classService = inject(ClassService);
  private readonly studentService = inject(StudentService);
  private readonly toast = inject(ToastService);

  readonly classes = signal<ClassGroup[]>([]);
  readonly allStudents = signal<Student[]>([]);
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly isSaving = signal(false);

  classForm = { groupName: '', description: '' };

  readonly classListWithCount = computed(() => {
    const list = this.classes();
    const students = this.allStudents();

    return list.map((c) => {
      const count = students.filter((s) => {
        const cId = typeof s.classGroup === 'object' ? s.classGroup?._id : s.classGroup;
        return cId === c._id;
      }).length;
      return { ...c, studentCount: count };
    });
  });

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.classService.getClassGroups().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.classes.set(res.data);
        }
      },
    });

    this.studentService.getStudents().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allStudents.set(res.data);
        }
      },
    });
  }

  openAddModal() {
    this.editingId.set(null);
    this.classForm = { groupName: '', description: '' };
    this.showModal.set(true);
  }

  openEditModal(cls: ClassGroup) {
    this.editingId.set(cls._id);
    this.classForm = { groupName: cls.groupName, description: cls.description || '' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveClass() {
    const name = this.classForm.groupName.trim();
    if (!name) {
      this.toast.warning('Please enter a class name');
      return;
    }

    // Duplicate check
    const duplicate = this.classes().some(
      (c) => c.groupName.toLowerCase() === name.toLowerCase() && c._id !== this.editingId()
    );
    if (duplicate) {
      this.toast.error(`A class named "${name}" already exists`);
      return;
    }

    this.isSaving.set(true);
    const id = this.editingId();

    if (id) {
      this.classService.updateClassGroup(id, this.classForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('Class updated successfully');
          this.closeModal();
          this.loadClasses();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.error(err.error?.message || 'Failed to update class');
        },
      });
    } else {
      this.classService.createClassGroup(this.classForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('Class created successfully');
          this.closeModal();
          this.loadClasses();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.error(err.error?.message || 'Failed to create class');
        },
      });
    }
  }

  confirmDelete(cls: ClassGroup) {
    if (confirm(`Are you sure you want to delete "${cls.groupName}"?`)) {
      this.classService.deleteClassGroup(cls._id).subscribe({
        next: () => {
          this.toast.success('Class deleted successfully');
          this.loadClasses();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to delete class');
        },
      });
    }
  }
}
