import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next";         // 👈 importa getServerSession
import { authOptions } from '../auth/[...nextauth]/route'; // 👈 importa tus opciones de NextAuth

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
    // ✅ 1) Obtén la sesión del usuario
    const session = await getServerSession(authOptions);

    // ✅ 2) Verifica que haya sesión y que el rol sea admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear productos' },
        { status: 403 }
      );
    }

    // ✅ 3) Si es admin, procesa normalmente
    const { name, price, categoryId, description, stock } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }
    const data = { name: name.trim() }
    if (price !== undefined && price !== null && String(price) !== "") {
      const numeric = Number(price)
      if (Number.isNaN(numeric)) {
        return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
      }
      data.price = numeric
    }
    if (description !== undefined && description !== null && description.trim() !== "") {
      data.description = description.trim()
    }
    if (categoryId) {
      const idNum = Number(categoryId)
      const exists = await prisma.category.findUnique({ where: { id: idNum } })
      if (!exists) {
        return NextResponse.json({ error: 'Categoría no existe' }, { status: 400 })
      }
      data.categoryId = idNum
    }
    if (stock !== undefined && stock !== null && String(stock) !== "") {
      const numericStock = Number(stock)
      if (!Number.isNaN(numericStock) && numericStock >= 0) {
        data.stock = numericStock
      }
    }
    const product = await prisma.product.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error creando producto' }, { status: 500 })
  }
}
