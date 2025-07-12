import { App, Notice, TFile } from "obsidian";

export class FileProcessor {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	async processFile(file: TFile): Promise<string | null> {
		const extension = file.extension.toLowerCase();

		switch (extension) {
			case "md":
			case "txt":
				return this.processTextFile(file);
			case "pdf":
				return this.processPDF(file);
			case "png":
			case "jpg":
			case "jpeg":
			case "gif":
			case "bmp":
				new Notice(`El procesamiento de imágenes para "${file.name}" aún no está implementado.`);
				return null;
			default:
				new Notice(`Tipo de archivo no soportado: ${file.name}`);
				return null;
		}
	}

	private async processTextFile(file: TFile): Promise<string> {
		return this.app.vault.cachedRead(file);
	}

	private async processPDF(file: TFile): Promise<string | null> {
		try {
			// Importar la librería dinámicamente para evitar errores de carga
			const pdf = require("pdf-parse");

			new Notice(`Procesando PDF: ${file.name}...`);
			const arrayBuffer = await this.app.vault.readBinary(file);

			// Convertir el formato de datos al que la librería espera (Buffer)
			const buffer = Buffer.from(arrayBuffer);

			const data = await pdf(buffer);
			new Notice(`"${file.name}" procesado con éxito.`);
			return data.text;
		} catch (error) {
			console.error(`Error procesando el PDF "${file.name}":`, error);
			new Notice(`Error al procesar el PDF: ${file.name}`);
			return null;
		}
	}
}