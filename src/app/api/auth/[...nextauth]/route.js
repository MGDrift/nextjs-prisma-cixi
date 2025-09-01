import NextAuth from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";
import db from "@/libs/db"
import bcrypt from 'bcrypt'

const authOptions = {
    providers: [
        CredentialsProviders({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmitch"},
                password: { label: "Password", type: "password", placeholder: "*********" }
            },
            async authorize(credentials, req) {
                console.log(credentials)
                
                const userFound = await db.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })
                if (!userFound) throw new Error("Usuario no encontrado")

                console.log(userFound)

                const matchPassword = await bcrypt.compare(credentials.password, userFound.password)
                if (!matchPassword) throw new Error("Contraseña incorrecta")

                return {
                    id: userFound.id,
                    name: userFound.username,
                    email: userFound.email,
                };
            },
        }),
    ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };