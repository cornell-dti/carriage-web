export type UserType = 'User' | 'Rider' | 'Driver' | 'Admin';

export type JWTPayload = {
  id: string;
  userType: UserType;
  iat: string;
}
