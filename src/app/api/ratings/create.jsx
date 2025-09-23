import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { productId, userId, value } = await req.json();

    const rating = await prisma.rating.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      update: { value },
      create: { value, productId, userId }
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al guardar rating" }, { status: 500 });
  }
}
