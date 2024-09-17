import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path if needed

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(params.id) },
  });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { name, email } = await request.json();
  const user = await prisma.user.update({
    where: { id: parseInt(params.id) },
    data: { name, email },
  });
  return NextResponse.json(user);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.user.delete({
    where: { id: parseInt(params.id) },
  });
  return NextResponse.json({ message: 'User deleted' });
}
