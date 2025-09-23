import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) { 
  await dbConnect();

  try {
   
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    const existingAdmin = await User.findById(decoded.userId);
    if (!existingAdmin || existingAdmin.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email is already in use' }, { status: 400 });
    }

    const newAdmin = new User({
      name,
      email,
      password,
      role: 'admin',
    });

    await newAdmin.save();

    return NextResponse.json({ success: true, message: 'Admin created successfully' }, { status: 201 });

  } catch (error: any) {
    console.error('Create Admin Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}