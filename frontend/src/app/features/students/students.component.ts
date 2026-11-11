import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../core/services/student.service';
import { ClassService } from '../../core/services/class.service';
import { ExcelService, StudentExcelRow } from '../../core/services/excel.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Student } from '../../core/models/student.model';
import { ClassGroup } from '../../core/models/class.model';

@Component({
  selector: 'app-students',
  
  standalone: true,
  imports: [CommonModule, FormsModule],
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

      <!-- Add / Edit Student Modal -->
      <div class="modal-backdrop" *ngIf="showStudentModal()">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ editingStudentId() ? 'Edit Student' : 'Add New Student' }}
            </h3>
            <button class="modal-close" (click)="closeStudentModal()">
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
                  [(ngModel)]="studentForm.studentname_en"
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
                  [(ngModel)]="studentForm.studentname_kh"
                  name="studentname_kh"
                />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Gender *</label>
                  <select
                    class="form-select"
                    [(ngModel)]="studentForm.gender"
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
                    [(ngModel)]="studentForm.classGroup"
                    name="classGroup"
                    required
                  >
                    <option value="">Select Class</option>
                    <option *ngFor="let cls of classGroups()" [value]="cls._id">
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
                    [(ngModel)]="studentForm.phone"
                    name="phone"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Date of Birth</label>
                  <input
                    type="date"
                    class="form-control"
                    [(ngModel)]="studentForm.dob"
                    name="dob"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeStudentModal()">
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

      <!-- Excel Import Modal -->
      <div class="modal-backdrop" *ngIf="showImportModal()">
        <div class="modal-dialog modal-dialog-lg">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fa-solid fa-file-excel" style="color: #16a34a;"></i>
              Import Students from Excel
            </h3>
            <button class="modal-close" (click)="closeImportModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="import-help-box">
              <p>
                Upload an Excel (<strong>.xlsx</strong>) file with headers:
                <code>studentname_en</code>, <code>studentname_kh</code>, <code>gender</code>, <code>class</code>.
              </p>
              <button class="btn btn-outline btn-sm mt-2" (click)="downloadTemplate()">
                <i class="fa-solid fa-download"></i> Download Sample Excel Template
              </button>
            </div>

            <div class="drop-zone" (click)="fileInput.click()">
              <input
                #fileInput
                type="file"
                accept=".xlsx, .xls, .csv"
                (change)="onFileSelected($event)"
                style="display: none;"
              />
              <i class="fa-solid fa-cloud-arrow-up drop-icon"></i>
              <div class="drop-text">
                <strong>Click to choose file</strong> or drag and drop
              </div>
              <span class="text-muted" style="font-size: 0.8rem;">
                {{ selectedFile ? selectedFile.name : 'Supported: .xlsx, .xls, .csv' }}
              </span>
            </div>

            <!-- Preview Table -->
            <div *ngIf="importPreviewRows.length > 0" class="mt-3">
              <div class="preview-header">
                <strong>Preview ({{ importPreviewRows.length }} rows found):</strong>
              </div>
              <div class="table-container mt-1" style="max-height: 240px; overflow-y: auto;">
                <table class="table">
                  <thead>
                    <tr>
                      <th>studentname_en</th>
                      <th>studentname_kh</th>
                      <th>gender</th>
                      <th>class</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let row of importPreviewRows.slice(0, 10)">
                      <td>{{ row.studentname_en || row.name }}</td>
                      <td class="khmer-text">{{ row.studentname_kh }}</td>
                      <td>{{ row.gender }}</td>
                      <td>{{ row.class }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p *ngIf="importPreviewRows.length > 10" class="text-muted text-center" style="font-size: 0.775rem; margin-top: 0.5rem;">
                Showing first 10 rows of {{ importPreviewRows.length }}
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeImportModal()">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="!selectedFile || isImporting()"
              (click)="uploadExcel()"
            >
              <i *ngIf="isImporting()" class="fa-solid fa-spinner fa-spin"></i>
              Start Import ({{ importPreviewRows.length }} Students)
            </button>
          </div>
        </div>
      </div>

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
  private readonly excelService = inject(ExcelService);
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
  selectedFile: File | null = null;
  importPreviewRows: StudentExcelRow[] = [];

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

  // Student CRUD
  openAddModal() {
    this.editingStudentId.set(null);
    this.studentForm = {
      studentname_en: '',
      studentname_kh: '',
      gender: 'male',
      classGroup: this.classGroups()[0]?._id || '',
      phone: '',
      dob: '',
    };
    this.showStudentModal.set(true);
  }

  openEditModal(s: Student) {
    this.editingStudentId.set(s._id);
    const cId = typeof s.classGroup === 'object' ? s.classGroup?._id : (s.classGroup || '');
    this.studentForm = {
      studentname_en: s.studentname_en || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
      studentname_kh: s.studentname_kh || '',
      gender: s.gender === 'F' ? 'female' : (s.gender === 'M' ? 'male' : s.gender || 'male'),
      classGroup: cId,
      phone: s.phone || '',
      dob: s.dob ? s.dob.split('T')[0] : '',
    };
    this.showStudentModal.set(true);
  }

  closeStudentModal() {
    this.showStudentModal.set(false);
  }

  saveStudent() {
    if (!this.studentForm.studentname_en) {
      this.toast.warning('Please enter the student English name');
      return;
    }

    this.isSubmitting.set(true);
    const id = this.editingStudentId();

    if (id) {
      this.studentService.updateStudent(id, this.studentForm).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.toast.success('Student updated successfully');
          this.closeStudentModal();
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.toast.error(err.error?.message || 'Failed to update student');
        },
      });
    } else {
      this.studentService.createStudent(this.studentForm).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.toast.success('Student added successfully');
          this.closeStudentModal();
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.toast.error(err.error?.message || 'Failed to create student');
        },
      });
    }
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

  // Excel Import
  openImportModal() {
    this.selectedFile = null;
    this.importPreviewRows = [];
    this.showImportModal.set(true);
  }

  closeImportModal() {
    this.showImportModal.set(false);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    try {
      const parsed = await this.excelService.parseExcelFile(file);
      this.importPreviewRows = parsed;
    } catch {
      this.toast.error('Unable to parse Excel file. Please check format.');
    }
  }

  downloadTemplate() {
    this.excelService.downloadSampleTemplate();
    this.toast.info('Sample Excel template downloaded');
  }

  uploadExcel() {
    if (!this.selectedFile) return;

    this.isImporting.set(true);
    this.studentService.importStudents(this.selectedFile).subscribe({
      next: (res) => {
        this.isImporting.set(false);
        this.toast.success(res.message || 'Students imported successfully');
        this.closeImportModal();
        this.loadData();
      },
      error: (err) => {
        this.isImporting.set(false);
        this.toast.error(err.error?.message || 'Failed to import students');
      },
    });
  }

  // Excel Export
  openExportModal() {
    this.exportClassFilter = this.selectedClassId();
    this.showExportModal.set(true);
  }

  closeExportModal() {
    this.showExportModal.set(false);
  }

  executeExport() {
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

    this.excelService.exportToExcel(rows, `students_export_${new Date().toISOString().split('T')[0]}`);
    this.toast.success('Excel export file generated successfully');
    this.closeExportModal();
  }
}
