// src/ui/quiz/ExamResultsModal.tsx

import { App, Modal } from "obsidian";
import { EvaluatedQuestion } from "../../services/ExamEvaluator";
import { ResultsGenerator } from "../../services/ResultsGenerator";
import { QuizSettings } from "../../settings/config";
import { isMatching, isMultipleChoice, isSelectAllThatApply } from "../../utils/typeGuards";

export class ExamResultsModal extends Modal {
    private evaluatedQuestions: EvaluatedQuestion[];
    private quizName: string;
    private settings: QuizSettings;
    private score: number = 0;
    private totalScore: number = 0;

    constructor(app: App, settings: QuizSettings, quizName: string, evaluatedQuestions: EvaluatedQuestion[]) {
        super(app);
        this.app = app;
        this.settings = settings;
        this.quizName = quizName;
        this.evaluatedQuestions = evaluatedQuestions;
        this.calculateScore();
    }

    private calculateScore(): void {
        this.totalScore = this.evaluatedQuestions.length * 2;
        this.score = this.evaluatedQuestions.reduce((acc, result) => {
            return acc + (result.isCorrect ? 2 : 0);
        }, 0);
    }

    onOpen() {
        const { contentEl, modalEl } = this; // Añadimos modalEl
        modalEl.addClass("quiz-generator-results"); // <-- AÑADIDO: Damos un nombre único a la ventana
        
        contentEl.empty();
        contentEl.addClass("quiz-results-modal");

        // Contenedor principal
        const mainContainer = contentEl.createDiv("results-main-container");

        // Encabezado con puntuación y botón de guardar
        const header = mainContainer.createDiv("results-header");
        header.createEl("h1", { text: `Resultados de: ${this.quizName}` });
        const scoreEl = header.createEl("h2", { text: `Tu Puntuación: ${this.score} / ${this.totalScore}` });
        scoreEl.addClass("results-score");
        
        const saveButton = header.createEl("button", { text: "Guardar Resultados", cls: "mod-cta" });
        saveButton.onClickEvent(() => {
            const resultsGenerator = new ResultsGenerator(this.app, this.settings);
            const mdContent = resultsGenerator.generate(this.quizName, this.evaluatedQuestions, this.score, this.totalScore);
            resultsGenerator.save(this.quizName, mdContent);
            saveButton.disabled = true;
            saveButton.setText("Guardado");
        });

        // Contenedor de preguntas con scroll
        const questionsContainer = mainContainer.createDiv("results-questions-container");

        this.evaluatedQuestions.forEach((result, index) => {
            const questionEl = questionsContainer.createDiv("results-question-item");
            questionEl.addClass(result.isCorrect ? "correct" : "incorrect");
            
            const questionHeader = questionEl.createDiv("results-question-header");
            questionHeader.createEl("span", { text: `Pregunta ${index + 1}: ${result.isCorrect ? "Correcta" : "Incorrecta"}` });

            const questionBody = questionEl.createDiv("results-question-body");
            questionBody.createEl("p").innerHTML = `<b>Pregunta:</b> ${result.question.question}`;
            questionBody.createEl("p").innerHTML = `<b>Tu respuesta:</b> ${this.formatAnswerForDisplay(result.question, result.userAnswer)}`;

            if (!result.isCorrect) {
                questionBody.createEl("p").innerHTML = `<b>Respuesta correcta:</b> ${this.formatAnswerForDisplay(result.question, result.correctAnswer)}`;
            }
            
            if (result.feedback) {
                 const feedbackEl = questionBody.createEl("div", "results-feedback");
                 feedbackEl.createEl("strong", {text: `Feedback (Puntuación: ${result.score}%): `});
                 feedbackEl.createSpan({text: result.feedback});
            }
        });
    }

    private formatAnswerForDisplay(question: any, answer: any): string {
        if (isMultipleChoice(question) && typeof answer === 'number') {
            return question.options[answer];
        }
        if (isSelectAllThatApply(question) && Array.isArray(answer)) {
            return answer.map(index => question.options[index]).join(", ");
        }
        if (isMatching(question) && Array.isArray(answer)) {
            return answer.map(pair => {
                const left = pair.left || pair.leftOption;
                const right = pair.right || pair.rightOption;
                return `${left} -> ${right}`;
            }).join("<br>"); // Usamos <br> para saltos de línea en HTML
        }
        if (Array.isArray(answer)) {
            return answer.join(", ");
        }
        return String(answer);
    }

    onClose() {
        this.contentEl.empty();
    }
}