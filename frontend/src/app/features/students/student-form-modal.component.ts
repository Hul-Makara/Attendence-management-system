import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../core/models/student.model';
import { ClassGroup } from '../../core/models/class.model';
import { StudentService } from '../../core/services/student.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-student-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ student ? 'Edit Student' : 'Add New Student' }}
          </h3>
          <button class="modal-close" (click)="closed.emit()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form (ngSubmit)="saveStudent()">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">English Name *</label>
              <input
                type="text"
                class="form-control"
                placeholder="e.g. Sok Dara"
                [(ngModel)]="formData.studentname_en"
                name="studentname_en"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Khmer Name</label>
              <input
                type="text"
                class="form-control khmer-text"
                placeholder="e.g. សុខ ដារ៉ា"
                [(ngModel)]="formData.studentname_kh"
                name="studentname_kh"
              />
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Gender *</label>
                <select
                  class="form-select"
                  [(ngModel)]="formData.gender"
                  name="gender"
                  required
                >
                  <option value="male">Male (M)</option>
                  <option value="female">Female (F)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Class Group *</label>
                <select
                  class="form-select"
                  [(ngModel)]="formData.classGroup"
                  name="classGroup"
                  required
                >
                  <option value="">Select Class</option>
                  <option *ngFor="let cls of classGroups" [value]="cls._id">
                    {{ cls.groupName }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. +855 12 345 678"
                  [(ngModel)]="formData.phone"
                  name="phone"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="formData.dob"
                  name="dob"
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closed.emit()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
              <i *ngIf="isSubmitting()" class="fa-solid fa-spinner fa-spin"></i>
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }
    .modal-dialog {
      background: #ffffff;
      border-radius: var(--radius-md, 8px);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      animation: modalFadeIn 0.15s ease-out;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title { font-size: 1.15rem; font-weight: 700; margin: 0; }
    .modal-close {
      background: transparent;
      border: none;
      font-size: 1.15rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
    }
    .modal-close:hover { color: var(--text-main); background: #f1f5f9; }
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      background: #f8fafc;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-label {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .khmer-text { font-family: 'Kantumruy Pro', sans-serif; }
  `],
})
export class StudentFormModalComponent implements OnInit {
  @Input() student: Student | null = null;
  @Input() classGroups: ClassGroup[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly studentService = inject(StudentService);
  private readonly toast = inject(ToastService);

  readonly isSubmitting = signal(false);

  formData = {
    studentname_en: '',
    studentname_kh: '',
    gender: 'male',
    classGroup: '',
    phone: '',
    dob: '',
  };

  ngOnInit() {
    if (this.student) {
      this.formData = {
        studentname_en: this.student.studentname_en || `${this.student.firstName || ''} ${this.student.lastName || ''}`.trim(),
        studentname_kh: this.student.studentname_kh || '',
        gender: this.student.gender || 'male',
        classGroup: typeof this.student.classGroup === 'object' ? (this.student.classGroup as any)?._id : this.student.classGroup,
        phone: this.student.phone || '',
        dob: this.student.dob ? new Date(this.student.dob).toISOString().split('T')[0] : '',
      };
    }
  }

  saveStudent() {
    if (!this.formData.studentname_en || !this.formData.classGroup) {
      this.toast.error('English name and class group are required');
      return;
    }

    this.isSubmitting.set(true);
    const parts = this.formData.studentname_en.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || firstName;

    const payload: Partial<Student> = {
      firstName,
      lastName,
      studentname_en: this.formData.studentname_en.trim(),
      studentname_kh: this.formData.studentname_kh.trim(),
      gender: this.formData.gender as any,
      classGroup: this.formData.classGroup,
      phone: this.formData.phone,
      dob: this.formData.dob ? (this.formData.dob as any) : undefined,
    };

    const action = this.student
      ? this.studentService.updateStudent(this.student._id, payload)
      : this.studentService.createStudent(payload);

    action.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success(this.student ? 'Student updated successfully' : 'Student created successfully');
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.error(err.error?.message || 'Failed to save student');
      },
    });
  }
}
