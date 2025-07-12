// src/ui/quiz/ExamModeModal.ts

import { App, Modal } from "obsidian";

/**
 * Una ventana modal que permite al usuario elegir entre el modo de cuestionario normal
 * y el nuevo modo de examen.
 */
export class ExamModeModal extends Modal {
    private readonly onChoose: (isExamMode: boolean) => void;

    /**
     * @param app La instancia de la aplicación de Obsidian.
     * @param onChoose Una función callback que se ejecutará cuando el usuario elija un modo.
     * Recibirá `true` si se elige el modo examen, y `false` en caso contrario.
     */
    constructor(app: App, onChoose: (isExamMode: boolean) => void) {
        super(app);
        this.onChoose = onChoose;
    }

    /**
     * Se ejecuta cuando la ventana modal se abre.
     * Construye el contenido de la modal.
     */
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("quiz-generator-modal"); // Estilo opcional para consistencia

        contentEl.createEl("h2", { text: "Elige un modo" });
        contentEl.createEl("p", { text: "¿Cómo te gustaría realizar este cuestionario?" });

        const buttonContainer = contentEl.createDiv("modal-button-container-qg");

        // Botón para el Modo Normal
        const normalModeButton = buttonContainer.createEl("button", {
            text: "Modo Normal",
            cls: "mod-cta", // Estilo para resaltar el botón principal
        });
        normalModeButton.onClickEvent(() => {
            this.close();
            this.onChoose(false);
        });

        // Botón para el Modo Examen
        const examModeButton = buttonContainer.createEl("button", {
            text: "Modo Examen",
        });
        examModeButton.onClickEvent(() => {
            this.close();
            this.onChoose(true);
        });
    }

    /**
     * Se ejecuta cuando la ventana modal se cierra.
     * Limpia el contenido para liberar memoria.
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}