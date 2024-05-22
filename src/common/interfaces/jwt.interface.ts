export interface JwtPayload {
  id: number;
  userId: string;
  email: string;
}

export interface JwtTokenInterface {
  _id: string;
  email: string;
}
