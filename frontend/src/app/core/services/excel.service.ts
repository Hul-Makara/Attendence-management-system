import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface StudentExcelRow {
  studentname_en?: string;
  studentname_kh?: string;
  gender?: string;
  class?: string;
  name?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  parseExcelFile(file: File): Promise<StudentExcelRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

          const khmerRegex = /[\u1780-\u17FF]/;
          const normalized: StudentExcelRow[] = rawJson.map((r) => {
            const row: any = {};
            for (const k of Object.keys(r)) {
              const cleanKey = k.trim().toLowerCase().replace(/[\s_-]+/g, '');
              row[cleanKey] = r[k];
            }

            const className = (
              row['class'] ||
              row['classgroup'] ||
              row['classname'] ||
              r['Class'] ||
              ''
            ).toString().trim();

            const rawGender = (row['gender'] || r['Gender'] || '').toString().trim();
            let gender = 'M';
            if (rawGender.toLowerCase() === 'f' || rawGender.toLowerCase() === 'female') {
              gender = 'F';
            } else if (rawGender.toLowerCase() === 'm' || rawGender.toLowerCase() === 'male') {
              gender = 'M';
            }

            let nameEn = (
              row['studentnameen'] ||
              row['nameen'] ||
              row['englishname'] ||
              ''
            ).toString().trim();

            let nameKh = (
              row['studentnamekh'] ||
              row['namekh'] ||
              row['khmername'] ||
              ''
            ).toString().trim();

            const firstName = (
              row['firstname'] ||
              r['First name'] ||
              r['First Name'] ||
              ''
            ).toString().trim();

            const lastName = (
              row['lastname'] ||
              r['Last name'] ||
              r['Last Name'] ||
              ''
            ).toString().trim();

            // Detect Khmer script
            if (!nameKh) {
              if (khmerRegex.test(firstName)) {
                nameKh = firstName;
              } else if (khmerRegex.test(lastName)) {
                nameKh = lastName;
              }
            }

            // Detect English name
            if (!nameEn) {
              if (lastName && !khmerRegex.test(lastName)) {
                nameEn = lastName;
              } else if (firstName && !khmerRegex.test(firstName)) {
                nameEn = firstName;
              } else if (firstName || lastName) {
                nameEn = `${firstName} ${lastName}`.trim();
              }
            }

            if (!nameEn && nameKh) {
              nameEn = nameKh;
            }

            return {
              studentname_en: nameEn,
              studentname_kh: nameKh,
              gender,
              class: className,
              _raw: r,
            };
          });

          resolve(normalized);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  downloadSampleTemplate(): void {
    const sampleData: StudentExcelRow[] = [
      {
        studentname_en: 'Sok Dara',
        studentname_kh: 'សុខ ដារ៉ា',
        gender: 'M',
        class: 'Class A',
      },
      {
        studentname_en: 'Srey Mom',
        studentname_kh: 'ស្រី ម៉ម',
        gender: 'F',
        class: 'Class B',
      },
      {
        studentname_en: 'Chan Vanna',
        studentname_kh: 'ចាន់ វណ្ណា',
        gender: 'M',
        class: 'Class A',
      },
    ];

    this.exportToExcel(sampleData, 'student_import_template', 'Template');
  }
}
