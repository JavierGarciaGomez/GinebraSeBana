export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  creationDate: Date;
}

export interface IUserResponse {
  ok: true;
  message: string;
  token: string;
  user: IUser;
}
export interface IDeleteResponse {
  ok: true;
  message: string;
}
export interface IErrorResponse {
  ok: false;
  message: string;
}

export type IAuthResponse = IUserResponse | IErrorResponse;

export interface IUsersResponse {
  ok: true;
  message: string;
  users: IUser[];
}

export type IGetUsersResponse = IUsersResponse | IErrorResponse;
export type IDeleteUserResponse = IDeleteResponse | IErrorResponse;
