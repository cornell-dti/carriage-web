import { RideType, SchedulingState, Status } from '../models/ride';
import { Rider, RiderType } from '../models/rider';
import {
  sendApprovedEmail,
  sendRejectedEmail,
  sendCancelledEmail,
  sendScheduledWithModificationEmail,
  RideDetails,
  ModifiedRideDetails,
} from '../mailer';

/**
 * Helper function to fetch rider emails from rider IDs
 */
async function fetchRiderEmails(riderIds: string[]): Promise<string[]> {
  if (riderIds.length === 0) return [];

  try {
    console.log('📧 EMAIL: Fetching emails for rider IDs:', riderIds);
    const riders = await Promise.all(
      riderIds.map(async (riderId) => {
        try {
          const rider = await Rider.get(riderId);
          return rider ? rider.email : null;
        } catch (error) {
          console.error(`📧 EMAIL: Failed to fetch rider ${riderId}:`, error);
          return null;
        }
      })
    );

    const emails = riders.filter((email): email is string => Boolean(email));
    console.log('📧 EMAIL: Fetched rider emails:', emails);
    return emails;
  } catch (error) {
    console.error('📧 EMAIL: Error fetching rider emails:', error);
    return [];
  }
}

/**
 * Extract rider emails from a ride object
 * Handles both string IDs and populated rider objects
 */
function extractRiderEmails(ride: RideType): string[] {
  if (!ride.riders || ride.riders.length === 0) {
    return [];
  }

  // Check if riders are string IDs or populated objects
  const hasStringIds =
    ride.riders.length > 0 && typeof ride.riders[0] === 'string';

  if (hasStringIds) {
    // Riders are string IDs - we'll need to fetch emails
    return [];
  }

  // Riders are populated objects, extract emails directly
  return (ride.riders || [])
    .map((r) => {
      if (r && typeof r === 'object' && 'email' in r) {
        return (r as RiderType).email;
      }
      return undefined;
    })
    .filter((email): email is string => Boolean(email));
}

/**
 * Send emails to riders based on ride state
 * This function can be called directly from the ride router
 * @param ride - The current ride state
 * @param originalRide - Optional original ride data (for detecting modifications)
 */
export async function sendRideEmails(
  ride: RideType,
  originalRide?: RideType
): Promise<void> {
  try {
    console.log('📧 EMAIL: Starting email automation...');
    console.log('📧 EMAIL: Scheduling State:', ride.schedulingState);

    const rideDetails: RideDetails = {
      pickup: ride.startLocation?.name || 'Unknown location',
      dropoff: ride.endLocation?.name || 'Unknown location',
      time: new Date(ride.startTime),
      modified: false, // We can determine this from context if needed later
    };

    console.log('📧 EMAIL: Ride Details:', rideDetails);

    // Extract rider emails - handle both string IDs and populated objects
    let riderEmails: string[] = extractRiderEmails(ride);

    // If we didn't get emails (riders are string IDs), fetch them
    if (riderEmails.length === 0 && ride.riders && ride.riders.length > 0) {
      const hasStringIds = typeof ride.riders[0] === 'string';
      if (hasStringIds) {
        const stringRiderIds = ride.riders as unknown as string[];
        riderEmails = await fetchRiderEmails(stringRiderIds);
      }
    }

    console.log('📧 EMAIL: Rider Emails:', riderEmails);

    if (riderEmails.length === 0) {
      console.log('📧 EMAIL: No rider emails found, skipping email sending');
      return;
    }

    // Send emails to all riders based on ride state
    const emailPromises = riderEmails.map(async (email) => {
      try {
        console.log(`📧 EMAIL: Attempting to send email to ${email}...`);

        // Send emails based on ride state
        if (ride.status === Status.CANCELLED) {
          // Check status first - cancelled rides get cancellation emails
          console.log(`📧 EMAIL: Sending CANCELLATION email to ${email}`);
          await sendCancelledEmail(email, rideDetails);
          console.log(
            `📧 EMAIL: ✅ Cancellation email sent successfully to ${email}`
          );
        } else if (
          ride.schedulingState === SchedulingState.SCHEDULED_WITH_MODIFICATION
        ) {
          // Check for scheduled with modification - requires original ride data
          if (originalRide) {
            // Check if time, pickup, or dropoff actually changed
            const timeChanged =
              new Date(ride.startTime).getTime() !==
              new Date(originalRide.startTime).getTime();
            const pickupChanged =
              ride.startLocation?.id !== originalRide.startLocation?.id ||
              ride.startLocation?.name !== originalRide.startLocation?.name;
            const dropoffChanged =
              ride.endLocation?.id !== originalRide.endLocation?.id ||
              ride.endLocation?.name !== originalRide.endLocation?.name;

            const hasActualChanges = timeChanged || pickupChanged || dropoffChanged;

            if (hasActualChanges) {
              console.log(
                `📧 EMAIL: Sending SCHEDULED WITH MODIFICATION email to ${email}`
              );
              const modifiedRideDetails: ModifiedRideDetails = {
                originalPickup:
                  originalRide.startLocation?.name || 'Unknown location',
                originalDropoff:
                  originalRide.endLocation?.name || 'Unknown location',
                originalTime: new Date(originalRide.startTime),
                newPickup: ride.startLocation?.name || 'Unknown location',
                newDropoff: ride.endLocation?.name || 'Unknown location',
                newTime: new Date(ride.startTime),
              };
              await sendScheduledWithModificationEmail(
                email,
                modifiedRideDetails
              );
              console.log(
                `📧 EMAIL: ✅ Scheduled with modification email sent successfully to ${email}`
              );
            } else {
              console.log(
                `📧 EMAIL: ⏭️  Skipping modification email to ${email} - ride has SCHEDULED_WITH_MODIFICATION state but no actual changes detected (time, pickup, or dropoff unchanged)`
              );
            }
          } else {
            console.warn(
              `📧 EMAIL: ⚠️  Ride has SCHEDULED_WITH_MODIFICATION state but no originalRide provided. Falling back to regular approval email.`
            );
            await sendApprovedEmail(email, rideDetails);
          }
        } else if (ride.schedulingState === SchedulingState.SCHEDULED) {
          // Only send approval email if this is a new approval (state transition)
          // Don't send if ride was already scheduled (to avoid confusing "approval" emails for updates)
          const wasAlreadyScheduled =
            originalRide &&
            originalRide.schedulingState === SchedulingState.SCHEDULED;

          if (!wasAlreadyScheduled) {
            console.log(`📧 EMAIL: Sending APPROVAL email to ${email}`);
            await sendApprovedEmail(email, rideDetails);
            console.log(
              `📧 EMAIL: ✅ Approval email sent successfully to ${email}`
            );
          } else {
            console.log(
              `📧 EMAIL: ⏭️  Skipping approval email to ${email} - ride was already scheduled (no state transition)`
            );
          }
        } else if (ride.schedulingState === SchedulingState.REJECTED) {
          console.log(`📧 EMAIL: Sending REJECTION email to ${email}`);
          await sendRejectedEmail(email, rideDetails);
          console.log(
            `📧 EMAIL: ✅ Rejection email sent successfully to ${email}`
          );
        } else {
          console.log(
            `📧 EMAIL: ⏭️  Skipping email to ${email} - scheduling state is ${ride.schedulingState}, status is ${ride.status} (only sending emails for SCHEDULED, SCHEDULED_WITH_MODIFICATION, REJECTED, or CANCELLED)`
          );
        }
      } catch (emailError) {
        console.error(`📧 EMAIL: ❌ Failed to send email to ${email}:`);
        // Don't throw here - we want to continue with other emails
      }
    });

    await Promise.allSettled(emailPromises);
    console.log('📧 EMAIL: Email automation completed');
  } catch (error) {
    console.error('📧 EMAIL: ❌ Error in email automation:', error);
    // Don't throw - email failures shouldn't break the ride creation/update
  }
}
