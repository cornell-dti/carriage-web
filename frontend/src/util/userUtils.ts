import { Employee, Rider } from '../types/index';

/**
 * Extracts NetID from email address
 * @param email - Email address in format "netid@cornell.edu"
 * @returns NetID string or null if email is invalid
 */
export const extractNetIdFromEmail = (email: string): string | null => {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const match = email.match(/^([^@]+)@cornell\.edu$/i);
  return match ? match[1] : null;
};

/**
 * Gets NetID from user object (Employee or Rider)
 * @param user - User object with email field
 * @returns NetID string or null if not found
 */
export const getUserNetId = (user: Employee | Rider): string | null => {
  return extractNetIdFromEmail(user.email);
};
