export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student' | 'Parent' | string;
  studentId?: string | null;
  teacherId?: string | null;
  parentId?: string | null;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    tokens: string;
    user: UserProfile;
  };
}
