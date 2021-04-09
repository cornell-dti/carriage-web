import dotenv from 'dotenv';

dotenv.config();

export default {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
};

export const webpushValues = {
  contact: process.env.WEB_PUSH_CONTACT!,
  public: process.env.PUBLIC_VAPID_KEY!,
  private: process.env.PRIVATE_VAPID_KEY!,
};
