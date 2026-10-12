import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, data: sales });
  } catch (error: any) {
    console.error('API /api/sales error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      subtotal,
      discount,
      tax,
      total,
      paidAmount,
      balanceDue,
      paymentMethod,
      items,
      notes,
    } = body;

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Run transaction to ensure atomic consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: customerId || null,
          subtotal: parseFloat(subtotal) || 0,
          discount: parseFloat(discount) || 0,
          tax: parseFloat(tax) || 0,
          total: parseFloat(total) || 0,
          paidAmount: parseFloat(paidAmount) || 0,
          balanceDue: parseFloat(balanceDue) || 0,
          paymentMethod: paymentMethod || 'CASH',
          status: parseFloat(balanceDue) > 0 ? (parseFloat(paidAmount) > 0 ? 'PARTIAL' : 'CREDIT') : 'COMPLETED',
          notes: notes || null,
          items: {
            create: items.map((it: any) => ({
              productId: it.productId || null,
              productName: it.productName,
              quantity: it.quantity,
              unitCost: it.unitCost || 0,
              unitPrice: it.unitPrice,
              subtotal: it.subtotal,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Deduct inventory & record movement
      for (const it of items) {
        if (it.productId) {
          const prod = await tx.product.findUnique({ where: { id: it.productId } });
          if (prod) {
            const newStock = Math.max(0, prod.stock - it.quantity);
            await tx.product.update({
              where: { id: it.productId },
              data: { stock: newStock },
            });
            await tx.stockMovement.create({
              data: {
                productId: it.productId,
                type: 'SALE',
                quantity: -it.quantity,
                previousStock: prod.stock,
                newStock,
                note: `Sold on invoice ${invoiceNumber}`,
              },
            });
          }
        }
      }

      // 3. Update customer debt if customerId is present
      if (customerId) {
        const cust = await tx.customer.findUnique({ where: { id: customerId } });
        if (cust) {
          await tx.customer.update({
            where: { id: customerId },
            data: {
              totalSpent: cust.totalSpent + (parseFloat(total) || 0),
              totalDebt: cust.totalDebt + (parseFloat(balanceDue) || 0),
            },
          });
        }
      }

      return sale;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/sales error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record sale' },
      { status: 500 }
    );
  }
}
