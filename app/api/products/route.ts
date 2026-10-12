import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/sample-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    // Auto-seed if database is currently empty
    const count = await prisma.product.count();
    if (count === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await prisma.product.create({
          data: {
            id: p.id,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            category: p.category,
            unit: p.unit,
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            stock: p.stock,
            minStockAlert: p.minStockAlert,
            description: p.description,
          },
        });
      }
    }

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { sku: { contains: query } },
        { barcode: { contains: query } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error('API /api/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      barcode,
      category,
      unit,
      costPrice,
      sellingPrice,
      stock,
      minStockAlert,
      description,
    } = body;

    if (!name || !sku) {
      return NextResponse.json(
        { success: false, error: 'Product name and SKU are required' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        category: category || 'General',
        unit: unit || 'pcs',
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        stock: parseInt(stock, 10) || 0,
        minStockAlert: parseInt(minStockAlert, 10) || 5,
        description: description || null,
        stockMovements: {
          create: {
            type: 'RESTOCK',
            quantity: parseInt(stock, 10) || 0,
            previousStock: 0,
            newStock: parseInt(stock, 10) || 0,
            unitCost: parseFloat(costPrice) || 0,
            note: 'Initial catalog creation',
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
