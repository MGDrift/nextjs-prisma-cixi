import { NextResponse } from "next/server";
import prisma from "@/libs/db"; // usando tu singleton

export async function POST(req) {
  try {
    const { productId, userId, value } = await req.json();

    // Validar que el producto exista
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Validar que el userId exista si es obligatorio
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
    }

    // Crear o actualizar rating
    const rating = await prisma.rating.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      update: { value },
      create: { value, productId, userId }
    });

    return NextResponse.json(rating, { status: 200 });

  } catch (error) {
    console.error("Error creando rating:", error);
    return NextResponse.json({ error: "Error al guardar rating" }, { status: 500 });
  }
}
