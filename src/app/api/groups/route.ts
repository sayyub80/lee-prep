// src/app/api/groups/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User'; // Import User to use in populate

export async function GET() {
  await dbConnect();
  try {
    // --- OPTIMIZED QUERY ---
    // We will still populate, but we will limit the fields to reduce data transfer.
    // Mongoose's populate is generally efficient if the references are correct.
    // The previous issue was likely a temporary connection problem.
    // This version ensures the query is correct and selects only necessary fields.
    const groups = await Group.find({})
      .populate({
        path: 'members',
        select: 'name', // Only fetch the 'name' field of each member
        model: User // Explicitly provide the User model
      })
      .sort({ createdAt: -1 }); // Sort by most recently created

    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    console.error("API Error fetching groups:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}