// This script generates a JWT for testing admin authentication
import jwt from 'jsonwebtoken';

// JWT Secret from your Supabase project
const JWT_SECRET = 'lulO3hQMSzC7cTa/1PxAyClHCAFsuvYOTP33P08MwkOMh8gunYDaFBn1TXCrpx5M8c67ztHZkPr1Sk0oSdfsHQ==';

// User ID - this should match an actual user ID in your auth.users table
// that also has a corresponding entry in the profiles table with is_admin=true
const USER_ID = '09e9d1de-6522-42b5-8c71-91414fb72cdc'; // Replace with your actual user ID if different

// Create the payload
const payload = {
  iss: 'https://tbpnsxwldrxdlirxfcor.supabase.co/auth/v1',
  sub: USER_ID,
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
  iat: Math.floor(Date.now() / 1000),
  role: 'authenticated',
  email: 'mysticbanana2010@gmail.com', // Replace with the actual email if different
};

// Sign the JWT
const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

console.log('Generated JWT for testing:');
console.log(token);
