import { prisma } from '../db/prisma';

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
export async function findUserByNetID(
  netid: string,
  requestedUserType?: string
) {
  const cornellEmail = `${netid}@cornell.edu`;

  try {
    if (requestedUserType === 'Rider') {
      const rider = await prisma.rider.findUnique({
        where: { email: cornellEmail },
      });
      if (!rider) return null;
      if (!rider.active) return { error: 'User not active', userType: 'Rider' };
      return { user: rider, userType: 'Rider' };
    }

    if (requestedUserType === 'Admin') {
      const admin = await prisma.admin.findUnique({
        where: { email: cornellEmail },
      });
      if (admin) return { user: admin, userType: 'Admin' };

      // Fallback: check drivers with admin flag
      const driver = await prisma.driver.findUnique({
        where: { email: cornellEmail },
      });
      if (driver && (driver as any).admin)
        return { user: driver, userType: 'Admin' };

      return null;
    }

    if (requestedUserType === 'Driver') {
      const driver = await prisma.driver.findUnique({
        where: { email: cornellEmail },
      });
      if (driver) return { user: driver, userType: 'Driver' };

      // Fallback: check admin with isDriver flag
      const admin = await prisma.admin.findUnique({
        where: { email: cornellEmail },
      });
      if (admin && (admin as any).isDriver)
        return { user: admin, userType: 'Driver' };

      return null;
    }

    // No specific userType — search all tables
    const rider = await prisma.rider.findUnique({
      where: { email: cornellEmail },
    });
    if (rider) {
      if (!rider.active) return { error: 'User not active', userType: 'Rider' };
      return { user: rider, userType: 'Rider' };
    }

    const admin = await prisma.admin.findUnique({
      where: { email: cornellEmail },
    });
    if (admin) return { user: admin, userType: 'Admin' };

    const driver = await prisma.driver.findUnique({
      where: { email: cornellEmail },
    });
    if (driver) {
      if ((driver as any).admin) return { user: driver, userType: 'Admin' };
      return { user: driver, userType: 'Driver' };
    }

    return null;
  } catch (error) {
    console.error('Error finding user by NetID:', error);
    return null;
  }
}
