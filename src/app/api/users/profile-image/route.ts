import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/utils/userUtils';
import { updateProfileImage } from '@/utils/userUtils';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const user = await getUserById(session.user.id);
    const updatedUser = await updateProfileImage(session.user.id, imageUrl);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile image' }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 