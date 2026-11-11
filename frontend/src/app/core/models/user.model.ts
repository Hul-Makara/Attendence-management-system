export interface Role {
  _id: string;
  roleName: string;
  roleDescription?: string;
}

export interface UserItem {
  _id: string;
  username: string;
  email: string;
  role: Role | string;
  isActive: boolean;
  createdAt?: string;
}
