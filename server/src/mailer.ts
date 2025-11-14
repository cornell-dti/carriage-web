// mailer.ts
import nodemailer, { Transporter } from "nodemailer";
import { format } from "date-fns";

let transporter: Transporter;

if (process.env.NODE_ENV === "development") {
  // Fake mailer for local testing
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
} else {
  transporter = nodemailer.createTransport({
    host: "appsmtp.mail.cornell.edu",
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

export async function sendApprovedEmail(to: string, ride: RideDetails) {
  console.log('📧 MAILER: sendApprovedEmail called');
  console.log('📧 MAILER: To:', to);
  console.log('📧 MAILER: Ride:', ride);
  
  const day = format(ride.time, "EEEE");
  const hhmm = format(ride.time, "HH:mm");

  const mailOptions = {
    from: "carriagedti@gmail.com", // must be your EGA
    to,
    subject: "Carriage Ride Approved",
    text: `Your ride on ${day} from ${ride.pickup} to ${ride.dropoff} at ${hhmm} was approved.${
      ride.modified ? "\n\nNote: This ride was modified." : ""
    }`,
  };

  console.log('📧 MAILER: Mail options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 MAILER: ✅ Approval email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("📧 MAILER: ❌ Error sending approval email:", error);
    throw error;
  }
}

export async function sendRejectedEmail(to: string, ride: RideDetails) {
  console.log('📧 MAILER: sendRejectedEmail called');
  console.log('📧 MAILER: To:', to);
  console.log('📧 MAILER: Ride:', ride);
  
  const day = format(ride.time, "EEEE");
  const hhmm = format(ride.time, "HH:mm");

  const mailOptions = {
    from: "carriagedti@gmail.com",
    to,
    subject: "Carriage Ride Rejected",
    text: `Your ride on ${day} from ${ride.pickup} to ${ride.dropoff} at ${hhmm} was rejected.`,
  };

  console.log('📧 MAILER: Mail options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 MAILER: ✅ Rejection email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("📧 MAILER: ❌ Error sending rejection email:", error);
    throw error;
  }
}
