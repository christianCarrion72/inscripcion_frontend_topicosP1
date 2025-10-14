"use client";

import React, { createContext, useContext, useState } from "react";

interface Dia {
    id: number;
    nombre: string;
}

interface Modulo {
    id: number;
    codigo: number;
}

interface Aula {
    id: number;
    numero: number;
}

interface Horario {
    id: number;
    horaInicio: string;
    horaFin: string;
    aula: Aula;
    modulo: Modulo;
    dias: Dia[];
}

interface Docente {
    id: number;
    nombre: string;
}

interface Grupo {
    id: number;
    sigla: string;
}

interface GrupoMateria {
    id: number;
    cupos: number;
    docente: Docente;
    grupo: Grupo;
    horarios: Horario[];
}

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    gruposMaterias: GrupoMateria[];
}

interface MateriasDisponibles {
    estudiante: {
        id: number;
        nombre: string;
        registro: number;
        planEstudio: string;
    };
    materiasAprobadas: number;
    materiasDisponibles: number;
    materiasPorNivel: Record<string, Materia[]>;
}

interface MateriasContextType {
    materiasDisponibles: MateriasDisponibles | null;
    setMateriasDisponibles: (data: MateriasDisponibles) => void;
    limpiarDatos: () => void;
}

const MateriasContext = createContext<MateriasContextType | undefined>(undefined);

export function MateriasProvider({ children }: { children: React.ReactNode }) {
    const [materiasDisponibles, setMateriasDisponibles] = useState<MateriasDisponibles | null>(null);

    const limpiarDatos = () => {
        setMateriasDisponibles(null);
    };

    return (
        <MateriasContext.Provider value={{ materiasDisponibles, setMateriasDisponibles, limpiarDatos }}>
            {children}
        </MateriasContext.Provider>
    );
}

export function useMateriasContext() {
    const context = useContext(MateriasContext);
    if (context === undefined) {
        throw new Error("useMateriasContext debe usarse dentro de MateriasProvider");
    }
    return context;
}