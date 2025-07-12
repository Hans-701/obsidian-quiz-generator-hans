import { App, Modal, Notice, Setting } from "obsidian";

export class QuizNameModal extends Modal {
	private quizName: string = ""; // <--- AQUÍ ESTÁ LA CORRECCIÓN
	private readonly onSubmit: (name: string) => void;

	constructor(app: App, onSubmit: (name: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("quiz-name-modal-qg");

		contentEl.createEl("h2", { text: "Name Your Quiz" });

		new Setting(contentEl)
			.setName("Quiz Name")
			.addText((text) => {
				text.setPlaceholder("Enter the name for your quiz");
				text.onChange((value) => {
					this.quizName = value;
				});
				// Asegurarse de que el foco esté en el input al abrir
				text.inputEl.focus();
				text.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
					if (e.key === "Enter") {
						e.preventDefault();
						this.submit();
					}
				});
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Generate Quiz")
					.setCta()
					.onClick(() => {
						this.submit();
					})
			);
	}

	private submit() {
		if (this.quizName && this.quizName.trim().length > 0) {
			this.close();
			this.onSubmit(this.quizName.trim());
		} else {
			new Notice("Please enter a valid name for the quiz.");
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}