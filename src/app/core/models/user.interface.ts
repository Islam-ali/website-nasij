export enum UserRole {
  User = 'user',
  Admin = 'admin',
  Moderator = 'moderator'
}

export interface IUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  [key: string]: any; // For additional properties
}

export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
