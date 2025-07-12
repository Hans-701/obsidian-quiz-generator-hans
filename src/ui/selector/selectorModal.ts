import { App, getFrontMatterInfo, Modal, Notice, Scope, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import { QuizSettings } from "../../settings/config";
import { Question, Quiz } from "../../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../../utils/typeGuards";
import NoteAndFolderSelector from "./noteAndFolderSelector";
import NoteViewerModal from "./noteViewerModal";
import FolderViewerModal from "./folderViewerModal";
import GeneratorFactory from "../../generators/generatorFactory";
import QuizModalLogic from "../quiz/quizModalLogic";
import { cleanUpNoteContents } from "../../utils/markdownCleaner";
import { countNoteTokens, detectEmbeddedFiles, setIconAndTooltip } from "../../utils/helpers";
import { Provider } from "../../generators/providers";
import { QuizNameModal } from "./QuizNameModal";
import { FileSelectionModal } from "./FileSelectionModal";
import { FileProcessor } from "../../processors/FileProcessor";

const enum SelectorModalButton {
	CLEAR,
	QUIZ,
	NOTE,
	FOLDER,
	GENERATE,
}

export default class SelectorModal extends Modal {
	private readonly settings: QuizSettings;
	private notePaths: string[];
	private folderPaths: string[];
	private readonly selectedNotes: Map<string, string> = new Map<string, string>();
	private readonly selectedNoteFiles: Map<string, TFile[]> = new Map<string, TFile[]>();
	private readonly itemContainer: HTMLDivElement;
	private readonly tokenContainer: HTMLSpanElement;
	private promptTokens: number = 0;
	private readonly buttonMap: Record<SelectorModalButton, HTMLButtonElement>;
	private quiz: QuizModalLogic | undefined;
	private readonly fileProcessor: FileProcessor;

	constructor(app: App, settings: QuizSettings) {
		super(app);
		this.settings = settings;
		this.fileProcessor = new FileProcessor(this.app);
		this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
		this.folderPaths = this.app.vault.getAllFolders(true).map(folder => folder.path);
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());

		this.modalEl.addClass("modal-qg");
		this.contentEl.addClass("modal-content-qg");
		this.titleEl.addClass("modal-title-qg");
		this.titleEl.setText("Selected Notes");

		this.itemContainer = this.contentEl.createDiv("item-container-qg");
		this.tokenContainer = this.contentEl.createSpan("prompt-tokens-qg");
		this.tokenContainer.textContent = "Prompt tokens: " + this.promptTokens;
		this.buttonMap = this.activateButtons();
	}

	public onOpen(): void {
		super.onOpen();
		this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.QUIZ, SelectorModalButton.GENERATE], true);
	}

	private activateButtons(): Record<SelectorModalButton, HTMLButtonElement> {
		const buttonContainer = this.contentEl.createDiv("modal-button-container-qg");
		const clearButton = buttonContainer.createEl("button", "modal-button-qg");
		const openQuizButton = buttonContainer.createEl("button", "modal-button-qg");
		const addNoteButton = buttonContainer.createEl("button", "modal-button-qg");
		const addFolderButton = buttonContainer.createEl("button", "modal-button-qg");
		const generateQuizButton = buttonContainer.createEl("button", "modal-button-qg");
		const buttonMap: Record<SelectorModalButton, HTMLButtonElement> = {
			[SelectorModalButton.CLEAR]: clearButton,
			[SelectorModalButton.QUIZ]: openQuizButton,
			[SelectorModalButton.NOTE]: addNoteButton,
			[SelectorModalButton.FOLDER]: addFolderButton,
			[SelectorModalButton.GENERATE]: generateQuizButton,
		};

		setIconAndTooltip(clearButton, "book-x", "Remove all");
		setIconAndTooltip(openQuizButton, "scroll-text", "Open quiz");
		setIconAndTooltip(addNoteButton, "file-plus-2", "Add note");
		setIconAndTooltip(addFolderButton, "folder-plus", "Add folder");
		setIconAndTooltip(generateQuizButton, "webhook", "Generate");

		const clearHandler = (): void => {
			this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.GENERATE], true);
			this.selectedNotes.clear();
			this.selectedNoteFiles.clear();
			this.itemContainer.empty();
			this.updatePromptTokens(0, true);
			this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
			this.folderPaths = this.app.vault.getAllFolders(true).map(folder => folder.path);
		};
		const openQuizHandler = async (): Promise<void> => await this.quiz?.renderQuiz();
		const addNoteHandler = (): void => this.openNoteSelector();
		const addFolderHandler = (): void => this.openFolderSelector();
		const generateQuizHandler = (): void => {
			if (!this.validGenerationSettings()) {
				new Notice("Invalid generation settings or prompt contains 0 tokens");
				return;
			}

			new QuizNameModal(this.app, async (quizName) => {
				this.toggleButtons([SelectorModalButton.GENERATE], true);

				try {
					new Notice("Generating...");
					const generator = GeneratorFactory.createInstance(this.settings);
					const generatedQuestions = await generator.generateQuiz([...this.selectedNotes.values()]);
					if (generatedQuestions === null) {
						this.toggleButtons([SelectorModalButton.GENERATE], false);
						new Notice("Error: Generation returned nothing");
						return;
					}

					const quiz: Quiz = JSON.parse(generatedQuestions.replace(/\\+/g, "\\\\"));
					const questions: Question[] = [];
					quiz.questions.forEach(question => {
						if (isTrueFalse(question)) {
							questions.push(question);
						} else if (isMultipleChoice(question)) {
							questions.push(question);
						} else if (isSelectAllThatApply(question)) {
							questions.push(question);
						} else if (isFillInTheBlank(question)) {
							const normalizeBlanks = (str: string): string => {
								return this.settings.provider !== Provider.COHERE ? str : str.replace(/_{2,}|\$_{2,}\$/g, "`____`");
							};
							questions.push({ question: normalizeBlanks(question.question), answer: question.answer });
						} else if (isMatching(question)) {
							questions.push(question);
						} else if (isShortOrLongAnswer(question)) {
							questions.push(question);
						} else {
							new Notice("A question was generated incorrectly");
						}
					});

					this.quiz = new QuizModalLogic(this.app, this.settings, questions, [...this.selectedNoteFiles.values()].flat(), quizName);
					await this.quiz.renderQuiz();
					this.toggleButtons([SelectorModalButton.QUIZ], false);
				} catch (error) {
					new Notice((error as Error).message, 0);
				} finally {
					this.toggleButtons([SelectorModalButton.GENERATE], false);
				}
			}).open();
		};

		clearButton.addEventListener("click", clearHandler);
		openQuizButton.addEventListener("click", openQuizHandler);
		addNoteButton.addEventListener("click", addNoteHandler);
		addFolderButton.addEventListener("click", addFolderHandler);
		generateQuizButton.addEventListener("click", generateQuizHandler);

		return buttonMap;
	}

	private openNoteSelector(): void {
		new NoteAndFolderSelector(this.app, this.notePaths, this.modalEl, (selectedItem) => {
			this.addFileToQuizContext(this.app.vault.getAbstractFileByPath(selectedItem) as TFile);
		}).open();
	}

	private openFolderSelector(): void {
		new NoteAndFolderSelector(this.app, this.folderPaths, this.modalEl, (selectedItem) => {
			const folder = this.app.vault.getAbstractFileByPath(selectedItem) as TFolder;
			const notesInFolder: TFile[] = [];
			Vault.recurseChildren(folder, (file) => {
				if (file instanceof TFile && file.extension === "md") {
					if (this.settings.includeSubfolderNotes || file.parent?.path === folder.path) {
						notesInFolder.push(file);
					}
				}
			});
			this.addFileToQuizContext(folder, notesInFolder);
		}).open();
	}

	private async addFileToQuizContext(item: TFile | TFolder, filesInFolder: TFile[] = []) {
		if (this.selectedNotes.has(item.path)) {
			new Notice(`"${item.name}" has already been added.`);
			return;
		}

		if (item instanceof TFile) {
			this.notePaths = this.notePaths.filter(path => path !== item.path);
		} else {
			this.folderPaths = this.folderPaths.filter(path => path !== item.path);
		}

		this.renderItem(item); // Dibuja el item inmediatamente

		let totalContent = "";
		let allEmbeddedFiles: string[] = [];

		if (item instanceof TFile) {
			this.selectedNoteFiles.set(item.path, [item]);
			const rawContent = await this.app.vault.cachedRead(item);
			totalContent = cleanUpNoteContents(rawContent, getFrontMatterInfo(rawContent).exists);
			allEmbeddedFiles.push(...detectEmbeddedFiles(rawContent, this.app, item.path));
		} else if (item instanceof TFolder) {
			this.selectedNoteFiles.set(item.path, filesInFolder);
			const allContents = await Promise.all(filesInFolder.map(async (file) => {
				const rawContent = await this.app.vault.cachedRead(file);
				allEmbeddedFiles.push(...detectEmbeddedFiles(rawContent, this.app, file.path));
				return cleanUpNoteContents(rawContent, getFrontMatterInfo(rawContent).exists);
			}));
			totalContent = allContents.join(" ");
		}

		this.selectedNotes.set(item.path, totalContent);
		this.updateTokensForItem(item.path, totalContent);

		const uniqueEmbeddedFiles = [...new Set(allEmbeddedFiles)];
		if (uniqueEmbeddedFiles.length > 0) {
			new FileSelectionModal(this.app, uniqueEmbeddedFiles, (selected) => {
				this.processAndAddEmbeddedFiles(selected);
			}).open();
		}
	}

private async processAndAddEmbeddedFiles(fileNames: string[]) {
	for (const fileName of fileNames) {
		console.log("Trying to add embedded file:", fileName);
		const file = this.app.vault.getAbstractFileByPath(fileName);
		if (file instanceof TFile) {
			await this.addFileToQuizContext(file);
		} else {
			new Notice(`Embedded file not found: ${fileName}`);
			console.warn("Embedded file not found:", fileName);
		}
	}
}

	private renderItem(item: TFile | TFolder): void {
		const itemEl = this.itemContainer.createDiv({ cls: "item-qg" });
		itemEl.setAttribute("data-path", item.path);
		itemEl.createSpan({ text: (this.settings.showNotePath || this.settings.showFolderPath) ? item.path : item.name });

		const tokensEl = itemEl.createDiv({ cls: "item-tokens-qg" });
		tokensEl.textContent = "Loading...";

		const buttonContainer = itemEl.createDiv();
		const viewButton = buttonContainer.createEl("button", { cls: "item-button-qg" });
		setIconAndTooltip(viewButton, "eye", "View contents");
		viewButton.addEventListener("click", (e) => {
			e.stopPropagation();
			if (item instanceof TFile) new NoteViewerModal(this.app, item, this.modalEl).open();
			else new FolderViewerModal(this.app, this.settings, this.modalEl, item).open();
		});

		const removeButton = buttonContainer.createEl("button", { cls: "item-button-qg" });
		setIconAndTooltip(removeButton, "x", "Remove");
		removeButton.addEventListener("click", (e) => {
			e.stopPropagation();
			const tokensToSubtract = countNoteTokens(this.selectedNotes.get(item.path) || "");
			this.removeNoteOrFolder(item, itemEl);
			this.updatePromptTokens(-tokensToSubtract);
		});

		this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.GENERATE], false);
	}

	private updateTokensForItem(path: string, content: string): void {
		const itemEl = this.itemContainer.querySelector(`[data-path="${path.replace(/"/g, '\\"')}"]`);
		if (itemEl) {
			const tokensEl = itemEl.querySelector(".item-tokens-qg") as HTMLDivElement;
			if (tokensEl) {
				const newTokens = countNoteTokens(content);
				tokensEl.textContent = newTokens + " tokens";
				this.updatePromptTokens(newTokens);
			}
		}
	}

	private removeNoteOrFolder(item: TFile | TFolder, element: HTMLDivElement): void {
		this.selectedNotes.delete(item.path);
		this.selectedNoteFiles.delete(item.path);
		element.remove();
		if (item instanceof TFile && !this.notePaths.includes(item.path)) {
			this.notePaths.push(item.path);
		} else if (item instanceof TFolder && !this.folderPaths.includes(item.path)) {
			this.folderPaths.push(item.path);
		}
		if (this.selectedNotes.size === 0) {
			this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.GENERATE], true);
		}
	}

	private toggleButtons(buttons: SelectorModalButton[], disabled: boolean): void {
		buttons.forEach(button => this.buttonMap[button].disabled = disabled);
	}

	private updatePromptTokens(tokens: number, absolute = false): void {
		if (absolute) {
			this.promptTokens = tokens;
		} else {
			this.promptTokens += tokens;
		}
		this.tokenContainer.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private validGenerationSettings(): boolean {
		return (this.settings.generateTrueFalse || this.settings.generateMultipleChoice ||
			this.settings.generateSelectAllThatApply || this.settings.generateFillInTheBlank ||
			this.settings.generateMatching || this.settings.generateShortAnswer || this.settings.generateLongAnswer) &&
			this.promptTokens > 0;
	}
}