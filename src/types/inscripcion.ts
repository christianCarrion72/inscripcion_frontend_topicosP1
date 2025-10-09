// types/inscripcion.ts

export interface Materia {
    id: number;
    nombre: string;
    codigo: string;
}

export interface Estudiante {
    id: number;
    nombre: string;
    registro: number;
    planEstudio: string;
}

export interface MateriasDisponibles {
    estudiante: Estudiante;
    materiasAprobadas: number;
    materiasDisponibles: number;
    materiasPorNivel: Record<string, Materia[]>;
}

export interface Docente {
    id: number;
    nombre: string;
}

export interface Grupo {
    id: number;
    nombre: string;
}

export interface GrupoMateria {
    id: number;
    cupos: number;
    idMateria: Materia;
    idDocente: Docente;
    idGrupo: Grupo;
}

export interface GruposPorMateria {
    materia: Materia;
    grupos: GrupoMateria[];
}

export interface ResultadoInscripcion {
    status: "CONFIRMED" | "REJECTED";
    reason?: string;
    inscripcion?: {
        id: number;
        fechaInscripcion: Date;
        idEstudiante: Estudiante;
    };
    grupos?: number[];
}

export interface InscripcionRequest {
    idsGrupoMateria: number[];
    idEstudiante?: number;
}