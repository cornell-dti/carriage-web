export type UserType = 'User' | 'Rider' | 'Driver' | 'Dispatcher';

export type JWTPayload = {
  id: string;
  userType: UserType;
  iat: string;
}
