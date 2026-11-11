import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelService, StudentExcelRow } from '../../core/services/excel.service';
import { StudentService } from '../../core/services/student.service';
import { ToastService } from '../../core/services/toast.service';
import { ClassGroup } from '../../core/models/class.model';

@Component({
  selector: 'app-student-import-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal-dialog modal-dialog-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa-solid fa-file-excel" style="color: #16a34a;"></i>
            Import Students from Excel
          </h3>
          <button class="modal-close" (click)="closed.emit()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="import-help-box">
            <p>
              Upload an Excel (<strong>.xlsx</strong>) or CSV file with headers:
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
          <button type="button" class="btn btn-secondary" (click)="closed.emit()">
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
    .modal-dialog-lg { max-width: 720px; }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title { font-size: 1.15rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
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
    .import-help-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      color: #166534;
    }
    .import-help-box code {
      background: rgba(0,0,0,0.06);
      padding: 2px 4px;
      border-radius: 3px;
    }
    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: var(--radius-md);
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.2s;
    }
    .drop-zone:hover {
      border-color: var(--primary);
      background: #f0f9ff;
    }
    .drop-icon { font-size: 2.25rem; color: #94a3b8; margin-bottom: 0.5rem; }
    .drop-text { font-size: 0.95rem; margin-bottom: 0.25rem; }
    .khmer-text { font-family: 'Kantumruy Pro', sans-serif; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 1rem; }
    .text-center { text-align: center; }
  `],
})
export class StudentImportModalComponent {
  @Input() classGroups: ClassGroup[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() imported = new EventEmitter<void>();

  private readonly excelService = inject(ExcelService);
  private readonly studentService = inject(StudentService);
  private readonly toast = inject(ToastService);

  readonly isImporting = signal(false);
  selectedFile: File | null = null;
  importPreviewRows: StudentExcelRow[] = [];

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.selectedFile = file;

    this.excelService
      .parseExcelFile(file)
      .then((rows) => {
        this.importPreviewRows = rows;
        this.toast.info(`Found ${rows.length} rows in ${file.name}`);
      })
      .catch((err) => {
        this.toast.error('Failed to parse file: ' + err.message);
      });
  }

  downloadTemplate() {
    this.excelService.downloadSampleTemplate();
  }

  uploadExcel() {
    if (!this.selectedFile) return;

    this.isImporting.set(true);
    this.studentService.importStudents(this.selectedFile).subscribe({
      next: (res) => {
        this.isImporting.set(false);
        this.toast.success(res.message || 'Students imported successfully');
        this.imported.emit();
      },
      error: (err) => {
        this.isImporting.set(false);
        this.toast.error(err.error?.message || 'Failed to import students');
      },
    });
  }
}
