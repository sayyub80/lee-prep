// src/app/api/admin/groups/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    // 1. Authenticate the user and check if they are an admin
    const token = req.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Forbidden: User is not an admin' }, { status: 403 });
    }

    // 2. Get the new group's data from the request body
    const { name, description, topic } = await req.json();
    if (!name || !description) {
        return NextResponse.json({ success: false, error: 'Name and description are required' }, { status: 400 });
    }

    // 3. Create and save the new group
    const newGroup = new Group({
        name,
        description,
        topic: topic || "General",
        createdBy: adminUser._id,
        members: [adminUser._id] // The admin who creates the group automatically joins it
    });
    await newGroup.save();

    await User.updateOne({ _id: adminUser._id }, { $addToSet: { groups: newGroup._id } });

    return NextResponse.json({ success: true, data: newGroup }, { status: 201 });

  } catch (error) {
    console.error("Create Group Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}