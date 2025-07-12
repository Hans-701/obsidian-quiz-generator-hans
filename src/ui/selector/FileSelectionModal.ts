import { App, Modal, Setting } from "obsidian";

export class FileSelectionModal extends Modal {
	private readonly files: string[];
	private readonly selectedFiles: Set<string> = new Set();
	private readonly onSubmit: (selectedFiles: string[]) => void;

	constructor(app: App, files: string[], onSubmit: (selectedFiles: string[]) => void) {
		super(app);
		this.files = [...new Set(files)]; // Elimina duplicados
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Embedded Files Detected" });
		contentEl.createEl("p", { text: "Select the files you want to include for quiz generation." });

		this.files.forEach(file => {
			new Setting(contentEl)
				.setName(file)
				.addToggle(toggle => {
					toggle.onChange(value => {
						if (value) {
							this.selectedFiles.add(file);
						} else {
							this.selectedFiles.delete(file);
						}
					});
				});
		});

		new Setting(contentEl)
			.addButton(btn => {
				btn
					.setButtonText("Add Selected Files")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(Array.from(this.selectedFiles));
					});
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}