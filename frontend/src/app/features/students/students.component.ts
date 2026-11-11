import { Component, OnInit, inject, signal, computed, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../core/services/student.service';
import { ClassService } from '../../core/services/class.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Student } from '../../core/models/student.model';
import { ClassGroup } from '../../core/models/class.model';
import { StudentFormModalComponent } from './student-form-modal.component';
import { StudentImportModalComponent } from './student-import-modal.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StudentFormModalComponent,
    StudentImportModalComponent,
  ],
  template: `
    <div class="students-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>Student Management</h2>
          <p class="text-muted">Manage student records, search, filter, import and export</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="openExportModal()">
            <i class="fa-solid fa-file-excel" style="color: #16a34a;"></i> Export Excel
          </button>
          <button *ngIf="authService.isAdmin()" class="btn btn-secondary" (click)="openImportModal()">
            <i class="fa-solid fa-file-arrow-up"></i> Import Excel
          </button>
          <button *ngIf="authService.isAdmin()" class="btn btn-primary" (click)="openAddModal()">
            <i class="fa-solid fa-plus"></i> Add Student
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card toolbar-card">
        <div class="toolbar-grid">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              class="form-control"
              placeholder="Search by English or Khmer name, phone..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>

          <div class="filter-item">
            <select
              class="form-select"
              [ngModel]="selectedClassId()"
              (ngModelChange)="selectedClassId.set($event)"
            >
              <option value="">All Classes</option>
              <option *ngFor="let cls of classGroups()" [value]="cls._id">
                {{ cls.groupName }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <select
              class="form-select"
              [ngModel]="selectedGender()"
              (ngModelChange)="selectedGender.set($event)"
            >
              <option value="">All Genders</option>
              <option value="male">Male (M)</option>
              <option value="female">Female (F)</option>
            </select>
          </div>

          <button
            *ngIf="searchQuery() || selectedClassId() || selectedGender()"
            class="btn btn-outline btn-sm"
            (click)="resetFilters()"
          >
            <i class="fa-solid fa-arrow-rotate-left"></i> Reset
          </button>
        </div>
      </div>

      <!-- Students Table Card -->
      <div class="card mt-3">
        <div class="card-header">
          <span class="card-title">
            Students List ({{ filteredStudents().length }})
          </span>
          <span *ngIf="isLoading()" class="text-muted">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading...
          </span>
        </div>

        <div class="table-container" style="border: none;">
          <table class="table" *ngIf="filteredStudents().length > 0; else noStudents">
            <thead>
              <tr>
                <th>English Name</th>
                <th>Khmer Name</th>
                <th>Gender</th>
                <th>Class</th>
                <th>Phone</th>
                <th>Status</th>
                <th *ngIf="authService.isAdmin()" style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of filteredStudents()">
                <td>
                  <div class="student-name-col">
                    <div class="student-avatar">
                      {{ getInitials(student) }}
                    </div>
                    <div>
                      <strong>{{ getDisplayNameEn(student) }}</strong>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="khmer-text">{{ student.studentname_kh || '—' }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="student.gender === 'male' || student.gender === 'M' ? 'badge-role' : 'badge-excused'">
                    {{ student.gender === 'male' || student.gender === 'M' ? 'Male' : (student.gender === 'female' || student.gender === 'F' ? 'Female' : 'Other') }}
                  </span>
                </td>
                <td>
                  <span class="class-pill">{{ getClassName(student) }}</span>
                </td>
                <td>{{ student.phone || '—' }}</td>
                <td>
                  <span *ngIf="student.isBlacklisted" class="badge badge-danger">
                    <i class="fa-solid fa-ban"></i> Blacklisted
                  </span>
                  <span *ngIf="!student.isBlacklisted" class="badge badge-success">
                    <i class="fa-solid fa-check"></i> Active
                  </span>
                </td>
                <td *ngIf="authService.isAdmin()" style="text-align: right;">
                  <div class="action-buttons">
                    <button
                      class="btn btn-outline btn-sm"
                      title="Edit Student"
                      (click)="openEditModal(student)"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      class="btn btn-danger btn-sm"
                      title="Delete Student"
                      (click)="confirmDelete(student)"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noStudents>
            <div class="empty-state">
              <i class="fa-solid fa-user-slash empty-icon"></i>
              <p>No students found matching your criteria.</p>
              <button
                *ngIf="authService.isAdmin()"
                class="btn btn-primary btn-sm mt-2"
                (click)="openAddModal()"
              >
                Add Your First Student
              </button>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Deferrable Student Add/Edit Modal (Angular Deferrable View) -->
      @defer (when showStudentModal()) {
        @if (showStudentModal()) {
          <app-student-form-modal
            [student]="selectedStudentForEdit"
            [classGroups]="classGroups()"
            (closed)="closeStudentModal()"
            (saved)="onStudentSaved()"
          />
        }
      } @loading (minimum 500ms) {
        <div class="modal-backdrop">
          <div class="modal-dialog p-4 text-center">
            <i class="fa-solid fa-spinner fa-spin fa-2x text-primary mb-2"></i>
            <p class="text-muted mb-0">Loading student form (lazy-loading module)...</p>
          </div>
        </div>
      }

      <!-- Deferrable Excel Import Modal (Angular Deferrable View - Lazy Loads XLSX) -->
      @defer (when showImportModal()) {
        @if (showImportModal()) {
          <app-student-import-modal
            [classGroups]="classGroups()"
            (closed)="closeImportModal()"
            (imported)="onImportSuccess()"
          />
        }
      } @loading (minimum 500ms) {
        <div class="modal-backdrop">
          <div class="modal-dialog p-4 text-center">
            <i class="fa-solid fa-spinner fa-spin fa-2x text-primary mb-2"></i>
            <p class="text-muted mb-0">Loading Excel import module (lazy-loading XLSX)...</p>
          </div>
        </div>
      }

      <!-- Excel Export Modal -->
      <div class="modal-backdrop" *ngIf="showExportModal()">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fa-solid fa-file-excel" style="color: #16a34a;"></i>
              Export Student Records
            </h3>
            <button class="modal-close" (click)="closeExportModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-3" style="font-size: 0.875rem;">
              Select columns to include in your Excel file (.xlsx):
            </p>

            <div class="export-checkbox-list">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="exportColumns.id" />
                <span>Student ID</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="exportColumns.nameEn" />
                <span>English Name (studentname_en)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="exportColumns.nameKh" />
                <span>Khmer Name (studentname_kh)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="exportColumns.gender" />
                <span>Gender</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="exportColumns.class" />
                <span>Class Group</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="exportColumns.createdDate" />
                <span>Created Date</span>
              </label>
            </div>

            <div class="form-group mt-3">
              <label class="form-label">Filter by Class:</label>
              <select class="form-select" [(ngModel)]="exportClassFilter">
                <option value="">All Classes ({{ students().length }} students)</option>
                <option *ngFor="let cls of classGroups()" [value]="cls._id">
                  {{ cls.groupName }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeExportModal()">
              Cancel
            </button>
            <button type="button" class="btn btn-success" (click)="executeExport()">
              <i class="fa-solid fa-download"></i> Download Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .students-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .page-header h2 { font-size: 1.45rem; font-weight: 700; }
    .header-actions { display: flex; gap: 0.65rem; }

    .toolbar-card { padding: 1.15rem; }
    .toolbar-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 0.85rem;
      align-items: center;
    }
    @media (max-width: 768px) {
      .toolbar-grid { grid-template-columns: 1fr; }
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 0.85rem;
      color: #94a3b8;
    }
    .search-box .form-control {
      padding-left: 2.35rem;
    }

    .student-name-col {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .student-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.8rem;
    }
    .class-pill {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      background-color: #f1f5f9;
      border-radius: var(--radius-sm);
      font-weight: 500;
      font-size: 0.8rem;
    }
    .action-buttons {
      display: inline-flex;
      gap: 0.4rem;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .khmer-text {
      font-family: 'Kantumruy Pro', sans-serif;
    }

    /* Import Drop Zone */
    .import-help-box {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
    }
    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: var(--radius-md);
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      background-color: #f8fafc;
      transition: all 0.15s ease-in-out;
    }
    .drop-zone:hover {
      border-color: var(--primary);
      background-color: var(--primary-light);
    }
    .drop-icon {
      font-size: 2.5rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }
    .drop-text { font-size: 0.95rem; margin-bottom: 0.25rem; }

    /* Export Checkbox List */
    .export-checkbox-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      background-color: #f8fafc;
      padding: 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .checkbox-label input { width: 16px; height: 16px; cursor: pointer; }

    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 1rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.5rem; }
  `],
})
export class StudentsComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly studentService = inject(StudentService);
  private readonly classService = inject(ClassService);
  private readonly injector = inject(Injector);
  private readonly toast = inject(ToastService);

  readonly students = signal<Student[]>([]);
  readonly classGroups = signal<ClassGroup[]>([]);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isImporting = signal(false);

  readonly searchQuery = signal('');
  readonly selectedClassId = signal('');
  readonly selectedGender = signal('');

  // Modals state
  readonly showStudentModal = signal(false);
  readonly editingStudentId = signal<string | null>(null);
  selectedStudentForEdit: Student | null = null;

  studentForm: {
    studentname_en: string;
    studentname_kh: string;
    gender: string;
    classGroup: string;
    phone: string;
    dob: string;
  } = {
    studentname_en: '',
    studentname_kh: '',
    gender: 'male',
    classGroup: '',
    phone: '',
    dob: '',
  };

  // Import State
  readonly showImportModal = signal(false);

  // Export State
  readonly showExportModal = signal(false);
  exportClassFilter = '';
  exportColumns = {
    id: true,
    nameEn: true,
    nameKh: true,
    gender: true,
    class: true,
    createdDate: true,
  };

  readonly filteredStudents = computed(() => {
    let list = this.students();
    const query = this.searchQuery().trim().toLowerCase();
    const classId = this.selectedClassId().trim();
    const gender = this.selectedGender().trim().toLowerCase();

    if (classId) {
      list = list.filter((s) => {
        if (!s.classGroup) return false;
        const cId = typeof s.classGroup === 'object' ? (s.classGroup as any)?._id : s.classGroup;
        const cName = typeof s.classGroup === 'object' ? (s.classGroup as any)?.groupName : '';
        return cId?.toString() === classId || (cName && cName.toLowerCase() === classId.toLowerCase());
      });
    }

    if (gender) {
      list = list.filter((s) => {
        const g = (s.gender || '').toString().trim().toLowerCase();
        if (gender === 'male') {
          return g === 'male' || g === 'm';
        }
        if (gender === 'female') {
          return g === 'female' || g === 'f';
        }
        return g === gender;
      });
    }

    if (query) {
      list = list.filter((s) => {
        const en = (s.studentname_en || `${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
        const kh = (s.studentname_kh || '').toLowerCase();
        const phone = (s.phone || '').toLowerCase();
        const cls = (typeof s.classGroup === 'object' ? (s.classGroup as any)?.groupName : '')?.toLowerCase() || '';
        return en.includes(query) || kh.includes(query) || phone.includes(query) || cls.includes(query);
      });
    }

    return list;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.classService.getClassGroups().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.classGroups.set(res.data);
        }
      },
    });

    this.studentService.getStudents().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.students.set(res.data);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  onFilterChange() {
    // Computed signal handles local instantaneous filtering
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedClassId.set('');
    this.selectedGender.set('');
  }

  getDisplayNameEn(s: Student): string {
    return s.studentname_en || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
  }

  getClassName(s: Student): string {
    if (s.classGroup && typeof s.classGroup === 'object') {
      return s.classGroup.groupName;
    }
    return 'Unassigned';
  }

  getInitials(s: Student): string {
    const name = this.getDisplayNameEn(s);
    return name.slice(0, 2).toUpperCase();
  }

  confirmDelete(s: Student) {
    if (confirm(`Are you sure you want to delete student "${this.getDisplayNameEn(s)}"?`)) {
      this.studentService.deleteStudent(s._id).subscribe({
        next: () => {
          this.toast.success('Student deleted successfully');
          this.loadData();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to delete student');
        },
      });
    }
  }

  // Student CRUD
  openAddModal() {
    this.selectedStudentForEdit = null;
    this.showStudentModal.set(true);
  }

  openEditModal(s: Student) {
    this.selectedStudentForEdit = s;
    this.showStudentModal.set(true);
  }

  closeStudentModal() {
    this.showStudentModal.set(false);
  }

  onStudentSaved() {
    this.showStudentModal.set(false);
    this.loadData();
  }

  openImportModal() {
    this.showImportModal.set(true);
  }

  closeImportModal() {
    this.showImportModal.set(false);
  }

  onImportSuccess() {
    this.showImportModal.set(false);
    this.loadData();
  }

  // Excel Export
  openExportModal() {
    this.exportClassFilter = this.selectedClassId();
    this.showExportModal.set(true);
  }

  closeExportModal() {
    this.showExportModal.set(false);
  }

  async executeExport() {
    let toExport = this.students();
    if (this.exportClassFilter) {
      toExport = toExport.filter((s) => {
        const cId = typeof s.classGroup === 'object' ? s.classGroup?._id : s.classGroup;
        return cId === this.exportClassFilter;
      });
    }

    if (toExport.length === 0) {
      this.toast.warning('No student records found to export');
      return;
    }

    const rows = toExport.map((s) => {
      const row: any = {};
      if (this.exportColumns.id) row['ID'] = s._id;
      if (this.exportColumns.nameEn) row['English Name'] = this.getDisplayNameEn(s);
      if (this.exportColumns.nameKh) row['Khmer Name'] = s.studentname_kh || '';
      if (this.exportColumns.gender) row['Gender'] = s.gender;
      if (this.exportColumns.class) row['Class'] = this.getClassName(s);
      if (this.exportColumns.createdDate) row['Created Date'] = s.createdAt ? s.createdAt.split('T')[0] : '';
      return row;
    });

    const { ExcelService } = await import('../../core/services/excel.service');
    const excelService = this.injector.get(ExcelService);
    excelService.exportToExcel(rows, `students_export_${new Date().toISOString().split('T')[0]}`);
    this.toast.success('Excel export file generated successfully');
    this.closeExportModal();
  }
}
