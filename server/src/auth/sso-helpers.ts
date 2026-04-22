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
 * Find user by NetID (extracted from email) across all user types.
 * Admin and Driver both resolve from the unified Employee table.
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
      const employee = await (prisma as any).employee.findUnique({
        where: { email: cornellEmail },
      });
      if (employee && employee.isAdmin)
        return { user: employee, userType: 'Admin' };
      return null;
    }

    if (requestedUserType === 'Driver') {
      const employee = await (prisma as any).employee.findUnique({
        where: { email: cornellEmail },
      });
      if (employee && employee.isDriver)
        return { user: employee, userType: 'Driver' };
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

    const employee = await (prisma as any).employee.findUnique({
      where: { email: cornellEmail },
    });
    if (employee) {
      if (employee.isAdmin) return { user: employee, userType: 'Admin' };
      if (employee.isDriver) return { user: employee, userType: 'Driver' };
    }

    return null;
  } catch (error) {
    console.error('Error finding user by NetID:', error);
    return null;
  }
}
