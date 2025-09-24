import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true } },
      ratings: { select: { value: true } }
    }
  })

  const withAvg = products.map(p => {
    const avg = p.ratings.length > 0
      ? p.ratings.reduce((a, r) => a + r.value, 0) / p.ratings.length
      : 0
    return { ...p, averageRating: avg }
  })

  return NextResponse.json(withAvg)
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    const { name, price, categoryId, description, stock, image } = await req.json();

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: price ?? null,
        stock: stock ?? 0,
        categoryId: categoryId ?? null,
        image: image ?? null, // ✅ aquí va la URL enviada desde frontend
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error creando producto' }, { status: 500 });
  }
}
