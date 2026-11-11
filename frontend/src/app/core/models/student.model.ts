import { ClassGroup } from './class.model';

export interface Student {
  _id: string;
  user?: any;
  classGroup?: ClassGroup | string;
  studentname_en?: string;
  studentname_kh?: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender: 'male' | 'female' | 'other' | 'M' | 'F' | string;
  phone?: string;
  photo?: string;
  isBlacklisted?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
