/**
 * Script to check if a user exists in the database by email
 * Run with: npx ts-node check-user.ts
 */

import 'dotenv/config';
import { Rider } from './src/models/rider';
import { Admin } from './src/models/admin';
import { Driver } from './src/models/driver';
import initDynamoose from './src/util/dynamoose';

const TEST_EMAIL = 'dka34@cornell.edu';

async function checkUserExists() {
  console.log('🔍 Checking for user:', TEST_EMAIL);
  console.log('==========================================\n');

  // Initialize DynamoDB connection
  initDynamoose();

  try {
    // Check Riders
    console.log('Checking Riders table...');
    const riders = await Rider.scan('email').eq(TEST_EMAIL).exec();
    if (riders.length > 0) {
      console.log('✅ Found in Riders table:');
      console.log('   ID:', riders[0].id);
      console.log('   Name:', riders[0].firstName, riders[0].lastName);
      console.log('   Active:', riders[0].active);
      console.log('   Email:', riders[0].email);
      return;
    }
    console.log('❌ Not found in Riders\n');

    // Check Admins
    console.log('Checking Admins table...');
    const admins = await Admin.scan('email').eq(TEST_EMAIL).exec();
    if (admins.length > 0) {
      console.log('✅ Found in Admins table:');
      console.log('   ID:', admins[0].id);
      console.log('   Name:', admins[0].firstName, admins[0].lastName);
      console.log('   Type:', admins[0].type);
      console.log('   Email:', admins[0].email);
      return;
    }
    console.log('❌ Not found in Admins\n');

    // Check Drivers
    console.log('Checking Drivers table...');
    const drivers = await Driver.scan('email').eq(TEST_EMAIL).exec();
    if (drivers.length > 0) {
      console.log('✅ Found in Drivers table:');
      console.log('   ID:', drivers[0].id);
      console.log('   Name:', drivers[0].firstName, drivers[0].lastName);
      console.log('   Email:', drivers[0].email);
      return;
    }
    console.log('❌ Not found in Drivers\n');

    console.log('⚠️  User NOT found in any table!');
    console.log('\n📝 To test SSO, you need to:');
    console.log(
      '   1. Add a user with email "dka34@cornell.edu" to one of the tables'
    );
    console.log('   2. For Riders: ensure active=true');
    console.log('   3. Then try SSO login again');
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }

  process.exit(0);
}

checkUserExists();
