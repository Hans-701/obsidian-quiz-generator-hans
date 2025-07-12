// src/ui/quiz/quizModalLogic.ts

import { App, TFile } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { QuizSettings } from "../../settings/config";
import { Question } from "../../utils/types";
import QuizSaver from "../../services/quizSaver";
import QuizModalWrapper from "./QuizModalWrapper";
import { shuffleArray } from "../../utils/helpers";
import ExamState from "../../services/ExamState"; // Importamos nuestro nuevo gestor de estado
import { ExamModeModal } from "./ExamModeModal"; // Importamos nuestra nueva modal

export default class QuizModalLogic {
    private readonly app: App;
    private readonly settings: QuizSettings;
    private readonly quiz: Question[];
    private readonly quizSources: TFile[];
    private readonly quizSaver: QuizSaver;
    public examState: ExamState; // Hacemos público el estado para acceder desde la UI
    private container: HTMLDivElement | undefined;
    private root: Root | undefined;
    private readonly handleEscapePressed: (event: KeyboardEvent) => void;

    constructor(app: App, settings: QuizSettings, quiz: Question[], quizSources: TFile[], quizName: string) {
        this.app = app;
        this.settings = settings;
        this.quiz = quiz;
        this.quizSources = quizSources;
        this.quizSaver = new QuizSaver(this.app, this.settings, this.quizSources, quizName);
        this.examState = new ExamState(quizName); // Inicializamos el estado del examen
        this.handleEscapePressed = (event: KeyboardEvent): void => {
            if (event.key === "Escape" && !(event.target instanceof HTMLInputElement)) {
                this.removeQuiz();
            }
        };
    }

    public async renderQuiz(): Promise<void> {
        // Primero, verificamos si el modo examen está habilitado en la configuración.
        if (this.settings.examModeEnabled && !this.examState.active) {
            // Si está habilitado, mostramos la modal para que el usuario elija.
            new ExamModeModal(this.app, (isExamMode) => {
                if (isExamMode) {
                    this.examState.startExam(); // Si elige modo examen, lo iniciamos.
                }
                this.showQuizUI(); // Mostramos la UI del quiz después de la elección.
            }).open();
        } else {
            // Si no está habilitado, simplemente mostramos el quiz en modo normal.
            this.showQuizUI();
        }
    }

    private async showQuizUI(): Promise<void> {
        const quiz = this.settings.randomizeQuestions ? shuffleArray(this.quiz) : this.quiz;

        if (this.settings.autoSave && this.quizSources.length > 0) {
            await this.quizSaver.saveAllQuestions(quiz);
        }

        this.container = document.body.createDiv();
        this.root = createRoot(this.container);

        // Pasamos el estado del examen a nuestro componente de React
        this.root.render(QuizModalWrapper({
            app: this.app,
            settings: this.settings,
            quiz: quiz,
            quizSaver: this.quizSaver,
            examState: this.examState, // Nueva propiedad
            reviewing: this.quizSources.length === 0,
            handleClose: () => this.removeQuiz(),
        }));
        document.body.addEventListener("keydown", this.handleEscapePressed);
    }
    
    private removeQuiz(): void {
        this.root?.unmount();
        this.container?.remove();
        document.body.removeEventListener("keydown", this.handleEscapePressed);
        console.log("Quiz removed and event listeners cleaned up.");
    }
}