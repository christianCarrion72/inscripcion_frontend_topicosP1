"use client";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { MateriasProvider } from "@/components/MateriasContext"; // Agregar import
import Inscripcion from "@/components/Inscripcion";

const Dashboard = () => {
    const { data: session, status } = useSession();
    const [vistaActual, setVistaActual] = useState("dashboard");

    console.log(session?.user?.token);

    const getCats = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cats`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.user?.token}`,
            },
        });
        const data = await res.json();
        console.log(data);
    };

    return (
        <div className="min-h-screen bg-gray-400">
            {/* Menu Lateral */}
            <aside className="bg-gradient-to-br from-gray-600 to-gray-700 -translate-x-80 fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0">
                {/* ... resto del menu lateral sin cambios ... */}
                <div className="relative border-b border-white/20">
                    <a className="flex items-center gap-4 py-6 px-8" href="#/">
                        <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-white">Editor de Diagramas Colaborativo</h6>
                    </a>
                    <button className="middle none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-8 max-w-[32px] h-8 max-h-[32px] rounded-lg text-xs text-white hover:bg-white/10 active:bg-white/30 absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden" type="button">
                        <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true" className="h-5 w-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </span>
                    </button>
                </div>
                <div className="m-4">
                    <ul className="mb-4 flex flex-col gap-1">
                        <li>
                            <button 
                                onClick={() => setVistaActual("dashboard")}
                                className={`w-full middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg ${
                                    vistaActual === "dashboard" 
                                        ? "bg-gradient-to-tr from-gray-400 to-gray-400 text-white shadow-md shadow-blue-500/20" 
                                        : "text-white hover:bg-white/10 active:bg-white/30"
                                } flex items-center gap-4 px-4 capitalize`} 
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"></path>
                                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"></path>
                                </svg>
                                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">dashboard</p>
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => setVistaActual("profile")}
                                className={`w-full middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg ${
                                    vistaActual === "profile" 
                                        ? "bg-gradient-to-tr from-gray-400 to-gray-400 text-white shadow-md shadow-blue-500/20" 
                                        : "text-white hover:bg-white/10 active:bg-white/30"
                                } flex items-center gap-4 px-4 capitalize`} 
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd"></path>
                                </svg>
                                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">profile</p>
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => setVistaActual("inscripcion")}
                                className={`w-full middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg ${
                                    vistaActual === "inscripcion" 
                                        ? "bg-gradient-to-tr from-gray-400 to-gray-400 text-white shadow-md shadow-blue-500/20" 
                                        : "text-white hover:bg-white/10 active:bg-white/30"
                                } flex items-center gap-4 px-4 capitalize`} 
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                                    <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" clipRule="evenodd"></path>
                                </svg>
                                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">inscripción</p>
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => setVistaActual("notificaciones")}
                                className={`w-full middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg ${
                                    vistaActual === "notificaciones" 
                                        ? "bg-gradient-to-tr from-gray-400 to-gray-400 text-white shadow-md shadow-blue-500/20" 
                                        : "text-white hover:bg-white/10 active:bg-white/30"
                                } flex items-center gap-4 px-4 capitalize`} 
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                                    <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 015.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd"></path>
                                </svg>
                                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">notificaciones</p>
                            </button>
                        </li>
                    </ul>
                    <ul className="mb-4 flex flex-col gap-1">
                        <li className="mx-3.5 mt-4 mb-2">
                            <p className="block antialiased font-sans text-sm leading-normal text-white font-black uppercase opacity-75">auth pages</p>
                        </li>
                        <li>
                            <button 
                                onClick={() => signOut()} 
                                className="w-full middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 flex items-center gap-4 px-4 capitalize" 
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                                    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd"></path>
                                </svg>
                                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">sign out</p>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            <div className="p-4 xl:ml-80 ">
                <nav className="block w-full max-w-full bg-gray-200 text-white shadow-none rounded-xl transition-all px-5 py-1 ">
                    <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
                        <div className="capitalize">
                            <nav aria-label="breadcrumb" className="w-max">
                                <ol className="flex flex-wrap items-center w-full bg-opacity-60 rounded-md bg-transparent p-0 transition-all">
                                    <li className="flex items-center text-blue-gray-900 antialiased font-sans text-sm font-normal leading-normal cursor-pointer transition-colors duration-300 hover:text-light-blue-500">
                                        <a href="#">
                                            <p className="block antialiased font-sans text-sm leading-normal text-blue-900 font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100">dashboard</p>
                                        </a>
                                        <span className="text-gray-500 text-sm antialiased font-sans font-normal leading-normal mx-2 pointer-events-none select-none">/</span>
                                    </li>
                                    <li className="flex items-center text-blue-900 antialiased font-sans text-sm font-normal leading-normal cursor-pointer transition-colors duration-300 hover:text-blue-500">
                                        <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-normal">{vistaActual}</p>
                                    </li>
                                </ol>
                            </nav>
                            <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-gray-900">{vistaActual}</h6>
                        </div>
                    </div>
                </nav>

                <div className="mt-12">
                    {vistaActual === "dashboard" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido al Dashboard</h2>
                            <p className="text-gray-600">Selecciona una opción del menú lateral para comenzar</p>
                        </div>
                    )}
                    
                    {/* ENVOLVER INSCRIPCION EN EL PROVIDER */}
                    {vistaActual === "inscripcion" && (
                        <MateriasProvider>
                            <Inscripcion />
                        </MateriasProvider>
                    )}
                    
                    {vistaActual === "profile" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfil de Usuario</h2>
                            <p className="text-gray-600">Contenido del perfil próximamente</p>
                        </div>
                    )}
                    {vistaActual === "notificaciones" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Notificaciones</h2>
                            <p className="text-gray-600">No tienes notificaciones nuevas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Dashboard;