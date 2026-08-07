import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('\x1b[31m[ERROR] MONGO_URI is missing from .env\x1b[0m');
  process.exit(1);
}

const seedAdminUser = async () => {
  try {
    console.log('\x1b[36mConnecting to MongoDB...\x1b[0m');
    await mongoose.connect(MONGO_URI);
    console.log('\x1b[32m[SUCCESS] Connected to MongoDB.\x1b[0m');

    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminUser) {
      console.log('\x1b[36mCreating Admin User (admin@gmail.com)...\x1b[0m');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'Admin@123',
        role: 'admin',
        isEmailVerified: true,
      });
      console.log('\x1b[32m[SUCCESS] Admin user created.\x1b[0m');
    } else {
      console.log('\x1b[36mUpdating existing user to Admin (admin@gmail.com)...\x1b[0m');
      adminUser.role = 'admin';
      adminUser.password = 'Admin@123';
      adminUser.isEmailVerified = true;
      adminUser.isBlocked = false;
      await adminUser.save();
      console.log('\x1b[32m[SUCCESS] Admin user updated.\x1b[0m');
    }

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[ERROR] Seeding admin user failed:\x1b[0m', error);
    process.exit(1);
  }
};

seedAdminUser();
