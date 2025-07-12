// src/services/ExamEvaluator.ts

import { QuizSettings } from "../settings/config";
import { Question } from "../utils/types";
import { EvaluationService } from "./evaluationService";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../utils/typeGuards";
import { Answer } from "./ExamState";

// Define una estructura para el resultado de la evaluación de una sola pregunta
export interface EvaluatedQuestion {
    question: Question;
    userAnswer: Answer;
    isCorrect: boolean;
    correctAnswer: Answer;
    feedback?: string; // Para respuestas de IA
    score?: number; // Para respuestas de IA
}

export class ExamEvaluator {
    private settings: QuizSettings;
    private evaluationService: EvaluationService;

    constructor(settings: QuizSettings) {
        this.settings = settings;
        this.evaluationService = new EvaluationService(this.settings);
    }

    /**
     * Evalúa todas las respuestas del examen.
     * @param questions - El array original de preguntas del cuestionario.
     * @param userAnswers - Un mapa con las respuestas del usuario.
     * @returns Una promesa que se resuelve con un array de preguntas evaluadas.
     */
    public async evaluateAll(questions: Question[], userAnswers: Map<number, Answer>): Promise<EvaluatedQuestion[]> {
        const evaluatedQuestions: EvaluatedQuestion[] = [];
        const promises: Promise<void>[] = [];

        questions.forEach((question, index) => {
            const userAnswer = userAnswers.get(index);

            if (userAnswer === undefined) {
                // Considerar las preguntas no respondidas como incorrectas
                evaluatedQuestions[index] = {
                    question,
                    userAnswer: "No respondida",
                    isCorrect: false,
                    correctAnswer: this.getCorrectAnswer(question)
                };
                return;
            }

            if (isShortOrLongAnswer(question)) {
                // Evaluar con IA de forma asíncrona
                const promise = this.evaluationService.evaluate(userAnswer, question.answer)
                    .then(result => {
                        evaluatedQuestions[index] = {
                            question,
                            userAnswer,
                            isCorrect: result.score >= 70, // Umbral del 70%
                            correctAnswer: question.answer,
                            feedback: result.feedback,
                            score: result.score
                        };
                    }).catch(error => {
                        console.error("Error evaluating Short/Long answer:", error);
                        evaluatedQuestions[index] = {
                            question,
                            userAnswer,
                            isCorrect: false,
                            correctAnswer: question.answer,
                            feedback: "Error durante la evaluación."
                        };
                    });
                promises.push(promise);
            } else {
                // Evaluar otros tipos de pregunta de forma síncrona
                const result = this.evaluateStandardQuestion(question, userAnswer);
                evaluatedQuestions[index] = {
                    question,
                    userAnswer,
                    isCorrect: result,
                    correctAnswer: this.getCorrectAnswer(question)
                };
            }
        });

        // Esperar a que todas las evaluaciones con IA terminen
        await Promise.all(promises);
        return evaluatedQuestions;
    }

    /**
     * Evalúa preguntas que no requieren IA.
     * @param question - La pregunta a evaluar.
     * @param userAnswer - La respuesta del usuario.
     * @returns `true` si la respuesta es correcta, `false` en caso contrario.
     */
    private evaluateStandardQuestion(question: Question, userAnswer: Answer): boolean {
        if (isTrueFalse(question)) {
            return question.answer === userAnswer;
        }
        if (isMultipleChoice(question)) {
            return question.answer === userAnswer;
        }
        if (isSelectAllThatApply(question)) {
            // Comprobar que ambos arrays tengan la misma longitud y los mismos elementos
            const correctAnswer = question.answer.sort();
            const sortedUserAnswer = (userAnswer as number[]).sort();
            return correctAnswer.length === sortedUserAnswer.length &&
                   correctAnswer.every((val, index) => val === sortedUserAnswer[index]);
        }
        if (isFillInTheBlank(question)) {
            return question.answer.every((ans, i) => (userAnswer[i] || "").trim().toLowerCase() === ans.toLowerCase());
        }
        if (isMatching(question)) {
            // Lógica compleja para emparejamiento
            if (question.answer.length !== userAnswer.length) return false;
            const correctMap = new Map(question.answer.map(pair => [pair.leftOption, pair.rightOption]));
            return (userAnswer as { left: string, right: string }[]).every(userPair =>
                correctMap.get(userPair.left) === userPair.right
            );
        }
        return false;
    }

    /**
     * Obtiene la respuesta correcta formateada para mostrar en los resultados.
     */
    private getCorrectAnswer(question: Question): Answer {
        return question.answer;
    }

}