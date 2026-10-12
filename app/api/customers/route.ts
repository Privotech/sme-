import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_CUSTOMERS } from '@/lib/sample-data';

export async function GET() {
  try {
    const count = await prisma.customer.count();
    if (count === 0) {
      for (const c of INITIAL_CUSTOMERS) {
        await prisma.customer.create({
          data: {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            address: c.address,
            totalDebt: c.totalDebt,
            totalSpent: c.totalSpent,
            notes: c.notes,
          },
        });
      }
    }

    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('API /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, notes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
        totalDebt: 0,
        totalSpent: 0,
      },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
