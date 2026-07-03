export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
  departmentId?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}