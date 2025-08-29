"use client"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";

function RegisterPage() {
    const { 
        register, 
        handleSubmit, 
        formState: {errors},
    } = useForm();
    const router = useRouter()

    const onSubmit = handleSubmit(async (data) => {

        if (data.password !== data.confirmPassword) {
            return alert("Contraseña no coincide");
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(
                {
                    username: data.username,
                    email: data.email,
                    password: data.password
                }
            ),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if (res.ok) { 
            // Usuario creado correctamente
            alert("Usuario creado con éxito");
            router.push('/auth/login');
        } else {
            // Error: usuario existente u otro problema
            const errorData = await res.json();
            alert(errorData.error || "El usuario ya existe");
        }
    });


     

    console.log(errors)

    return (
        <div className="h-[calc(100vh-7rem)] flex justify-center items-center">
            <form onSubmit={onSubmit} className="w-1/4">
            <h1 className="text-slate-200 font-bold text-5xl mb-4">
                Registro
            </h1>

                <label htmlFor="username" className="text-slate-500 mb-2 block text-sm"> 
                    Nombre de Usuario
                </label>
                <input 
                    type="text" 
                    {...register("username", {
                        required: {
                            value: true,
                            message: "Nombre de usuario requerido"
                        }
                    })}
                    className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
                    placeholder="nombre de usuario"
                />
                {
                    errors.username && (
                        <span
                            className="text-red-500 text-sm"
                        >{errors.username.message}</span>
                    )
                }

                <label htmlFor="email" className="text-slate-500 mb-2 block text-sm"> 
                    E-mail
                </label>
                <input 
                    type="email" 
                    {...register("email", {
                        required: {
                            value: true,
                            message: "E-mail requerido"
                        }
                    })}
                    className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
                    placeholder="email@gmail.com"
                />
                {
                    errors.email && (
                        <span
                            className="text-red-500 text-sm"
                        >{errors.email.message}</span>
                    )
                }
                <label htmlFor="password" className="text-slate-500 mb-2 block text-sm"> 
                    Contraseña
                </label>
                <input 
                    type="password" 
                    {...register("password", {
                        required: {
                            value: true,
                            message: "Contraseña requerida"
                        }
                    })}
                    className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
                    placeholder="*******"
                />
                {
                    errors.password && (
                        <span
                            className="text-red-500 text-sm"
                        >{errors.password.message}</span>
                    )
                }
                <label htmlFor="confirmPassword" className="text-slate-500 mb-2 block text-sm"> 
                    Confirmar Contraseña
                </label>
                <input 
                    type="password" 
                    {...register("confirmPassword", {
                        required: {
                            value: true,
                            message: "Confirmación de contraseña requerida"
                        }
                    })}
                    className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
                    placeholder="*******"
                />
                {
                    errors.confirmPassword && (
                        <span
                            className="text-red-500 text-sm"
                        >{errors.confirmPassword.message}</span>
                    )
                }

                <button
                    className="w-full bg-blue-500 text-white p-3 rounded-lg mt-2" 
                    >Registrarse
                </button>

            </form>
            
        </div>
    )
}

export default RegisterPage