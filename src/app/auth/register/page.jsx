"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
      return alert("Contraseña no coincide");
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert("Usuario creado con éxito");
      router.push('/auth/login');
    } else {
      const errorData = await res.json();
      alert(errorData.error || "El usuario ya existe");
    }
  });

  // Función para redirigir al Home
  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#b37c8e]">
      {/* Navbar */}
      <nav className="w-full bg-[#d9a5b2] shadow-lg py-4 px-6 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">ECOMMERCE CIXI ♡</h1>
        <button
          onClick={handleHome} // Redirige al Home
          className="bg-[#623645] text-white rounded px-3 py-1 text-sm font-semibold shadow"
        >
          Home
        </button>
      </nav>

      {/* Formulario de Registro */}
      <form onSubmit={onSubmit} className="w-1/4 bg-[#d9a5b2] p-4 rounded-xl shadow-lg mt-10">
        <h1 className="text-slate-200 font-bold text-4xl mb-3 text-center">Registro</h1>

        <label className="text-slate-500 mb-1 block text-xs">Nombre de Usuario</label>
        <input
          type="text"
          {...register("username", { required: { value: true, message: "Nombre de usuario requerido" } })}
          className="p-2 rounded mb-2 bg-[#f0cdd8] text-slate-900 w-full"
          placeholder="nombre de usuario"
        />
        {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}

        <label className="text-slate-500 mb-1 block text-xs">E-mail</label>
        <input
          type="email"
          {...register("email", { required: { value: true, message: "E-mail requerido" } })}
          className="p-2 rounded mb-2 bg-[#f0cdd8] text-slate-900 w-full"
          placeholder="email@gmail.com"
        />
        {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}

        <label className="text-slate-500 mb-1 block text-xs">Contraseña</label>
        <input
          type="password"
          {...register("password", { required: { value: true, message: "Contraseña requerida" } })}
          className="p-2 rounded mb-2 bg-[#f0cdd8] text-slate-900 w-full"
          placeholder="*******"
        />
        {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}

        <label className="text-slate-500 mb-1 block text-xs">Confirmar Contraseña</label>
        <input
          type="password"
          {...register("confirmPassword", { required: { value: true, message: "Confirmación requerida" } })}
          className="p-2 rounded mb-3 bg-[#f0cdd8] text-slate-900 w-full"
          placeholder="*******"
        />
        {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}

        <button className="w-1/2 block mx-auto mt-3 bg-[#623645] hover:bg-[#d4839e] text-white font-bold p-2 rounded-lg">
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
