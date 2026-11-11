import { ClassGroup } from './class.model';

export interface SubjectSession {
  days: string[];
  startTime: string;
  endTime: string;
  room?: string;
}

export interface Subject {
  _id: string;
  subjectName: string;
  subjectCode?: string;
  description?: string;
  teacherId?: any;
  credit?: number;
  classGroups?: (ClassGroup | string)[];
  sessions?: SubjectSession[];
  createdAt?: string;
  updatedAt?: string;
}
