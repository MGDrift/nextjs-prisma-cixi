import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function parseId(idRaw) {
  const n = Number(idRaw);
  return Number.isNaN(n) ? idRaw : n; 
}

export async function GET(_req, { params }) {
  const id = parseId(params.id);
  try {
    const comments = await prisma.comment.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const count = await prisma.comment.count({ where: { productId: id } });
    return NextResponse.json({ comments, count });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const id = parseId(params.id);
  try {
    const body = await req.json();
    const content = String(body?.content || "").trim();
    if (content.length < 1 || content.length > 500) {
      return NextResponse.json({ error: "Contenido 1..500 caracteres" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const created = await prisma.comment.create({
      data: { productId: id, userName: "Usuario", content },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
