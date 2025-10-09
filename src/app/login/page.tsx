"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
    const [errors, setErrors] = useState<string[]>([]);
    const [registro, setRegistro] = useState<number>(219062851);
    const [contraseña, setContraseña] = useState<string>("123456789");
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors([]);

        // Llamada a NextAuth usando "credentials", con los nuevos campos
        const responseNextAuth = await signIn("credentials", {
            registro,
            contraseña,
            redirect: false,
        });

        if (responseNextAuth?.error) {
            setErrors(responseNextAuth.error.split(","));
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div>
            <section className="min-h-screen flex items-stretch text-white">
                {/* Lado visual izquierdo */}
                <div
                    className="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1646617747563-4f080bddf282?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
                    }}
                >
                    <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
                    <div className="w-full px-24 z-10">
                        <h1 className="text-5xl font-bold text-left tracking-wide">
                            Keep it special
                        </h1>
                        <p className="text-3xl my-4">
                            Capture your personal memory in unique way, anywhere.
                        </p>
                    </div>
                </div>

                {/* Formulario derecho */}
                <div
                    className="lg:w-1/2 w-full flex items-center justify-center text-center md:px-16 px-0 z-0"
                    style={{ backgroundColor: "#161616" }}
                >
                    <div className="w-full py-6 z-20">
                        <h1 className="text-3xl font-bold mb-6">Iniciar sesión</h1>

                        {errors.length > 0 && (
                            <div className="alert alert-danger mb-4">
                                <ul className="mb-0">
                                    {errors.map((error) => (
                                        <li key={error}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="sm:w-2/3 w-full px-4 lg:px-0 mx-auto"
                        >
                            <div className="pb-2 pt-4">
                                <input
                                    type="number"
                                    name="registro"
                                    id="registro"
                                    placeholder="Número de registro / CI"
                                    className="block w-full p-4 text-lg rounded-sm bg-black"
                                    value={registro}
                                    onChange={(e) =>
                                        setRegistro(Number(e.target.value))
                                    }
                                />
                            </div>

                            <div className="pb-2 pt-4">
                                <input
                                    type="password"
                                    name="contraseña"
                                    id="contraseña"
                                    placeholder="Contraseña"
                                    className="block w-full p-4 text-lg rounded-sm bg-black"
                                    value={contraseña}
                                    onChange={(e) =>
                                        setContraseña(e.target.value)
                                    }
                                />
                            </div>

                            <div className="text-right text-gray-400 hover:underline hover:text-gray-100 cursor-pointer">
                                <span onClick={() => router.push("/register")}>
                                    Registrar nueva cuenta
                                </span>
                            </div>

                            <div className="px-4 pb-2 pt-4">
                                <button
                                    className="uppercase block w-full p-4 text-lg rounded-full bg-indigo-500 hover:bg-indigo-600 focus:outline-none"
                                    type="submit"
                                >
                                    Iniciar sesión
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;
