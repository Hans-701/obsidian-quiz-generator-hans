import { DEFAULT_GENERAL_SETTINGS, GeneralConfig } from "./general/generalConfig";
import { DEFAULT_MODEL_SETTINGS, ModelConfig } from "./model/modelConfig";
import { DEFAULT_GENERATION_SETTINGS, GenerationConfig } from "./generation/generationConfig";
import { DEFAULT_SAVING_SETTINGS, SavingConfig } from "./saving/savingConfig";
import { DEFAULT_EVALUATION_SETTINGS, EvaluationConfig } from "./evaluation/evaluationConfig";

// 1. Definir la nueva configuración para el Modo Examen
export interface ExamConfig {
    examModeEnabled: boolean;
    examTimeLimit: number;
    examResultsPath: string;
}

// 2. Definir los valores por defecto para el Modo Examen
export const DEFAULT_EXAM_SETTINGS: ExamConfig = {
    examModeEnabled: true,
    examTimeLimit: 0, // Se establece en 0 para tiempo ilimitado por defecto
    examResultsPath: "Quizzes/Resultados", // Carpeta por defecto para los resultados
};

// 3. Añadir la configuración del examen al tipo principal
export type QuizSettings = GeneralConfig & ModelConfig & GenerationConfig & SavingConfig & EvaluationConfig & ExamConfig;

// 4. Añadir los valores por defecto al objeto principal de configuración
export const DEFAULT_SETTINGS: QuizSettings = {
    ...DEFAULT_GENERAL_SETTINGS,
    ...DEFAULT_MODEL_SETTINGS,
    ...DEFAULT_GENERATION_SETTINGS,
    ...DEFAULT_SAVING_SETTINGS,
    ...DEFAULT_EVALUATION_SETTINGS,
    ...DEFAULT_EXAM_SETTINGS, // Nuevos valores por defecto añadidos
};