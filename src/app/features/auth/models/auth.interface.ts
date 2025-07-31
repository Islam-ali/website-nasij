export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
  expiresIn: number;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData extends ILoginCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}
