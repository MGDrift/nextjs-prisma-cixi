import { NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import db from "@/libs/db";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("DATA RECIBIDA:", data);

    const userFound = await db.user.findUnique({
      where: {
        email: data.email
      }
    })

    if (userFound) {
      return NextResponse.json({
        message: "Ya existe este correo"
      }, {
        status: 400
      })
    }

    const userNameFound = await db.user.findUnique({
      where: {
        username: data.username
      }
    })

    if (userNameFound) {
      return NextResponse.json({
        message: "Ya existe este Usuario"
      }, {
        status: 400
      })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const newUser = await db.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword
      }
    });

    const {password: _, ...user} = newUser
    
    return NextResponse.json(user);

  } catch (err) {
    console.error("ERROR en /api/auth/register:", err);
    return NextResponse.json(
      { error: "Algo salió mal", details: err.message },
      { status: 500 }
    );
  }
}
