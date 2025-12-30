/**
 * mailer.ts - Email service using Nodemailer
 *
 * Transporter configuration:
 * - Development: Uses streamTransport (captures emails, doesn't send)
 * - Production: Uses Cornell SMTP server (appsmtp.mail.cornell.edu)
 */
import nodemailer, { Transporter } from 'nodemailer';
import { format } from 'date-fns';

let transporter: Transporter;

if (process.env.NODE_ENV === 'development') {
  // Fake mailer for local testing
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
} else {
  // Production: sends emails via Cornell SMTP
  transporter = nodemailer.createTransport({
    host: 'appsmtp.mail.cornell.edu',
    port: 25,
    secure: false,
    tls: { rejectUnauthorized: false },
  });
}

export default transporter;

export interface RideDetails {
  pickup: string;
  dropoff: string;
  time: Date;
  modified?: boolean;
}

export interface ModifiedRideDetails {
  originalPickup: string;
  originalDropoff: string;
  originalTime: Date;
  newPickup: string;
  newDropoff: string;
  newTime: Date;
}

export async function sendApprovedEmail(to: string, ride: RideDetails) {
  console.log('📧 MAILER: sendApprovedEmail called');
  console.log('📧 MAILER: To:', to);
  console.log('📧 MAILER: Ride:', ride);

  const date = format(ride.time, 'EEEE, MMMM dd');
  const time = format(ride.time, 'h:mm aa');

  const mailOptions = {
    from: 'carriage@cornell.edu', // must be your EGA
    to,
    subject: 'Carriage Ride Approved',
    text: `Your ride on ${date} from ${ride.pickup} to ${
      ride.dropoff
    } at ${time} was approved.${
      ride.modified ? '\n\nNote: This ride was modified.' : ''
    }`,
  };

  console.log('📧 MAILER: Mail options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      '📧 MAILER: ✅ Approval email sent successfully:',
      info.response
    );
    return info;
  } catch (error) {
    console.error('📧 MAILER: ❌ Error sending approval email');
    throw error;
  }
}

export async function sendRejectedEmail(to: string, ride: RideDetails) {
  console.log('📧 MAILER: sendRejectedEmail called');
  console.log('📧 MAILER: To:', to);
  console.log('📧 MAILER: Ride:', ride);

  const date = format(ride.time, 'EEEE, MMMM dd');
  const time = format(ride.time, 'h:mm aa');

  const mailOptions = {
    from: 'carriage@cornell.edu',
    to,
    subject: 'Carriage Ride Rejected',
    text: `Your ride on ${date} from ${ride.pickup} to ${ride.dropoff} at ${time} was rejected.`,
  };

  console.log('📧 MAILER: Mail options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      '📧 MAILER: ✅ Rejection email sent successfully:',
      info.response
    );
    return info;
  } catch (error) {
    console.error('📧 MAILER: ❌ Error sending rejection email');
    throw error;
  }
}

export async function sendCancelledEmail(to: string, ride: RideDetails) {
  console.log('📧 MAILER: sendCancelledEmail called');
  console.log('📧 MAILER: To:', to);
  console.log('📧 MAILER: Ride:', ride);

  const date = format(ride.time, 'EEEE, MMMM dd');
  const time = format(ride.time, 'h:mm aa');

  const mailOptions = {
    from: 'carriage@cornell.edu',
    to,
    subject: 'Carriage Ride Cancelled',
    text: `Your ride on ${date} from ${ride.pickup} to ${ride.dropoff} at ${time} has been cancelled.`,
  };

  console.log('📧 MAILER: Mail options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      '📧 MAILER: ✅ Cancellation email sent successfully:',
      info.response
    );
    return info;
  } catch (error) {
    console.error('📧 MAILER: ❌ Error sending cancellation email');
    throw error;
  }
}

export async function sendScheduledWithModificationEmail(
  to: string,
  ride: ModifiedRideDetails
) {
  console.log('📧 MAILER: sendScheduledWithModificationEmail called');
  console.log('📧 MAILER: To:', to);
  console.log('📧 MAILER: Ride:', ride);

  const originalDay = format(ride.originalTime, 'EEEE, MMMM dd');
  const originalTime = format(ride.originalTime, 'h:mm aa');
  const newDay = format(ride.newTime, 'EEEE, MMMM dd');
  const newTime = format(ride.newTime, 'h:mm aa');

  // Build the changes list
  const changes: string[] = [];
  if (ride.originalPickup !== ride.newPickup) {
    changes.push(`Pickup location: ${ride.originalPickup} → ${ride.newPickup}`);
  }
  if (ride.originalDropoff !== ride.newDropoff) {
    changes.push(
      `Dropoff location: ${ride.originalDropoff} → ${ride.newDropoff}`
    );
  }
  if (ride.originalTime.getTime() !== ride.newTime.getTime()) {
    changes.push(
      `Time: ${originalDay} at ${originalTime} → ${newDay} at ${newTime}`
    );
  }

  const changesText =
    changes.length > 0
      ? `\n\nChanges:\n${changes.map((c) => `- ${c}`).join('\n')}`
      : '';

  const mailOptions = {
    from: 'carriage@cornell.edu',
    to,
    subject: 'Carriage Ride Scheduled with Modifications',
    text: `Your ride has been scheduled with modifications.

Original ride:
- Pickup: ${ride.originalPickup}
- Dropoff: ${ride.originalDropoff}
- Time: ${originalDay} at ${originalTime}

Updated ride:
- Pickup: ${ride.newPickup}
- Dropoff: ${ride.newDropoff}
- Time: ${newDay} at ${newTime}${changesText}`,
  };

  console.log('📧 MAILER: Mail options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      '📧 MAILER: ✅ Scheduled with modification email sent successfully:',
      info.response
    );
    return info;
  } catch (error) {
    console.error(
      '📧 MAILER: ❌ Error sending scheduled with modification email'
    );
    throw error;
  }
}
