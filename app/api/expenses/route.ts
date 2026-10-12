import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_EXPENSES } from '@/lib/sample-data';

export async function GET() {
  try {
    const count = await prisma.expense.count();
    if (count === 0) {
      for (const e of INITIAL_EXPENSES) {
        await prisma.expense.create({
          data: {
            id: e.id,
            title: e.title,
            category: e.category,
            amount: e.amount,
            date: new Date(e.date),
            paymentMethod: e.paymentMethod,
            referenceNumber: e.referenceNumber,
            notes: e.notes,
          },
        });
      }
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    console.error('API /api/expenses error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, amount, date, paymentMethod, referenceNumber, notes } = body;

    if (!title || !amount) {
      return NextResponse.json(
        { success: false, error: 'Title and amount are required' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        category: category || 'OTHER',
        amount: parseFloat(amount) || 0,
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || 'CASH',
        referenceNumber: referenceNumber || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/expenses error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record expense' },
      { status: 500 }
    );
  }
}
