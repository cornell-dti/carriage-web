import { Rider } from '../models/rider';
import { Admin } from '../models/admin';
import { Driver } from '../models/driver';

/**
 * Extract NetID from Cornell email address
 * @param email - Email address (e.g., "dka34@cornell.edu")
 * @returns NetID (e.g., "dka34") or null if not a Cornell email
 */
export function extractNetIDFromEmail(email: string): string | null {
  if (!email) return null;

  // Match Cornell email pattern: netid@cornell.edu
  const cornellEmailRegex = /^([a-zA-Z0-9]+)@cornell\.edu$/;
  const match = email.match(cornellEmailRegex);

  return match ? match[1] : null;
}

/**
 * Find user by NetID (extracted from email) across all user types
 * Matches the same validation logic as Google OAuth in router/auth.ts
 * @param netid - Cornell NetID (e.g., "dka34")
 * @param requestedUserType - Optional: specific user type to search for (Rider, Admin, Driver)
 * @returns User object and type, or error message if validation fails
 */
export async function findUserByNetID(netid: string, requestedUserType?: string) {
  const cornellEmail = `${netid}@cornell.edu`;

  try {
    // If a specific userType is requested, only search that table (matching Google OAuth behavior)
    if (requestedUserType) {
      if (requestedUserType === 'Rider') {
        const riders = await Rider.scan('email').eq(cornellEmail).exec();
        if (riders.length > 0) {
          const rider = riders[0];
          // IMPORTANT: Check if Rider is active (same as Google OAuth)
          if (!rider.active) {
            return { error: 'User not active', userType: 'Rider' };
          }
          return { user: rider, userType: 'Rider' };
        }
        return null; // User not found in Riders table
      }

      if (requestedUserType === 'Admin') {
        // Check Admins table first
        const admins = await Admin.scan('email').eq(cornellEmail).exec();
        if (admins.length > 0) {
          return { user: admins[0], userType: 'Admin' };
        }

        // Fallback: Check Drivers table for admin-flagged drivers (matches Google OAuth)
        const drivers = await Driver.scan('email').eq(cornellEmail).exec();
        if (drivers.length > 0) {
          const driver = drivers[0];
          if ((driver as any).admin) {
            return { user: driver, userType: 'Admin' };
          }
        }
        return null; // User not found as Admin
      }

      if (requestedUserType === 'Driver') {
        const drivers = await Driver.scan('email').eq(cornellEmail).exec();
        if (drivers.length > 0) {
          return { user: drivers[0], userType: 'Driver' };
        }
        return null; // User not found in Drivers table
      }
    }

    // No specific userType requested - search all tables (fallback behavior)
    // Check Riders first
    const riders = await Rider.scan('email').eq(cornellEmail).exec();
    if (riders.length > 0) {
      const rider = riders[0];
      // IMPORTANT: Check if Rider is active (same as Google OAuth)
      if (!rider.active) {
        return { error: 'User not active', userType: 'Rider' };
      }
      return { user: rider, userType: 'Rider' };
    }

    // Check Admins
    const admins = await Admin.scan('email').eq(cornellEmail).exec();
    if (admins.length > 0) {
      return { user: admins[0], userType: 'Admin' };
    }

    // Check Drivers (for admin access, similar to Google OAuth fallback)
    const drivers = await Driver.scan('email').eq(cornellEmail).exec();
    if (drivers.length > 0) {
      const driver = drivers[0];
      // If driver has admin flag, treat as Admin (matches Google OAuth logic)
      if ((driver as any).admin) {
        return { user: driver, userType: 'Admin' };
      }
      return { user: driver, userType: 'Driver' };
    }

    return null;
  } catch (error) {
    console.error('Error finding user by NetID:', error);
    return null;
  }
}

