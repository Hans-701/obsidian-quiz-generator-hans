// src/services/ExamState.ts

/**
 * Define la estructura de una respuesta de usuario.
 * 'any' se usa aquí para permitir flexibilidad en los tipos de respuesta
 * (boolean, number[], string, etc.).
 */
export type Answer = any;

/**
 * La clase ExamState gestiona el estado de un cuestionario en modo examen.
 * Se encarga de registrar las respuestas del usuario, el tiempo de inicio
 * y si el modo examen está activo.
 */
export default class ExamState {
    // Un mapa para almacenar las respuestas del usuario, donde la clave es el índice de la pregunta.
    private userAnswers: Map<number, Answer>;
    
    // Almacena el momento exacto en que comienza el examen.
    private startTime: number | null;
    
    // El nombre del cuestionario actual.
    public readonly quizName: string;
    
    // Indica si el modo examen está actualmente en curso.
    public active: boolean;

    /**
     * Constructor para inicializar el estado del examen.
     * @param quizName - El nombre del cuestionario para identificar los resultados.
     */
    constructor(quizName: string) {
        this.quizName = quizName;
        this.userAnswers = new Map<number, Answer>();
        this.startTime = null;
        this.active = false;
    }

    /**
     * Inicia el modo examen.
     * Marca el estado como activo y registra la hora de inicio.
     */
    public startExam(): void {
        this.active = true;
        this.startTime = Date.now();
        console.log(`Examen "${this.quizName}" iniciado.`);
    }

    /**
     * Añade la respuesta de un usuario para una pregunta específica.
     * @param questionIndex - El índice de la pregunta que se está respondiendo.
     * @param answer - La respuesta proporcionada por el usuario.
     */
    public addAnswer(questionIndex: number, answer: Answer): void {
        if (!this.active) {
            console.warn("Intento de añadir respuesta pero el examen no está activo.");
            return;
        }
        this.userAnswers.set(questionIndex, answer);
        console.log(`Respuesta para la pregunta ${questionIndex} guardada.`);
    }

    /**
     * Finaliza el examen y devuelve el estado completo para su evaluación.
     * @returns Un objeto con todas las respuestas del usuario y la hora de inicio.
     */
    public endExam(): { answers: Map<number, Answer>, startTime: number } {
        this.active = false;
        console.log(`Examen "${this.quizName}" finalizado.`);
        return {
            answers: this.userAnswers,
            startTime: this.startTime as number
        };
    }

    /**
     * Obtiene las respuestas almacenadas.
     * @returns El mapa de respuestas del usuario.
     */
    public getAnswers(): Map<number, Answer> {
        return this.userAnswers;
    }

}