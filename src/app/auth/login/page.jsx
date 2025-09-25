"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  const onSubmit = handleSubmit(async (data) => {
    setError(null);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res.error) {
      setError(res.error);
    } else {
      // Esperamos un momento para que la sesión se actualice
      setTimeout(() => {
        const userRole = session?.user?.role;

        if (userRole === "admin") {
          router.push("/products/pricing");
        } else {
          router.push("/");
        }
      }, 500); // Esperamos 500ms para que la sesión se propague
    }
  });

  return (
    <div className="min-h-screen w-full flex justify-center items-start bg-[#b37c8e]">
      <form
        onSubmit={onSubmit}
        className="w-1/4 bg-[#d9a5b2] p-4 rounded-xl shadow-lg mt-20"
      >
        {error && (
          <p className="bg-red-500 text-lg text-white p-3 rounded mb-2">{error}</p>
        )}

        <h1 className="text-slate-200 font-bold text-4xl mb-3 text-center">
          Inicio de sesión
        </h1>

        <label className="text-slate-500 mb-1 block text-xs">Nombre de Usuario</label>
        <input
          type="email"
          {...register("email", {
            required: {
              value: true,
              message: "Email requerido",
            },
          })}
          className="p-2 rounded mb-2 bg-[#f0cdd8] text-slate-900 w-full"
          placeholder="user@gmail.com"
        />
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}

        <label className="text-slate-500 mb-1 block text-xs">Contraseña</label>
        <input
          type="password"
          {...register("password", {
            required: {
              value: true,
              message: "Contraseña requerida",
            },
          })}
          className="p-2 rounded mb-3 bg-[#f0cdd8] text-slate-900 w-full"
          placeholder="******"
        />
        {errors.password && (
          <span className="text-red-500 text-xs">{errors.password.message}</span>
        )}

        <button
          className="w-1/2 block mx-auto mt-3 bg-[#623645] hover:bg-[#d4839e] text-white font-bold p-2 rounded-lg"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
