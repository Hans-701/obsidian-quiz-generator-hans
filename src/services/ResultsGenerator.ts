// src/services/ResultsGenerator.ts

import { App, normalizePath, Notice, TFile, TFolder } from "obsidian";
import { QuizSettings } from "../settings/config";
import { EvaluatedQuestion } from "./ExamEvaluator";
import {
    isFillInTheBlank,
    isMatching,
    isMultipleChoice,
    isSelectAllThatApply,
} from "../utils/typeGuards";

export class ResultsGenerator {
    private app: App;
    private settings: QuizSettings;

    constructor(app: App, settings: QuizSettings) {
        this.app = app;
        this.settings = settings;
    }

    public generate(quizName: string, evaluatedQuestions: EvaluatedQuestion[], score: number, totalScore: number): string {
        const date = new Date().toLocaleDateString();
        let content = `---\n`;
        content += `quiz: ${quizName}\n`;
        content += `date: ${date}\n`;
        content += `score: ${score}/${totalScore}\n`;
        content += `---\n\n`;
        content += `# Puntuación: ${score}/${totalScore}\n\n`;

        evaluatedQuestions.forEach(result => {
            content += this.formatQuestionAsCallout(result);
        });

        return content;
    }

    public async save(quizName: string, content: string): Promise<void> {
        const folderPath = this.settings.examResultsPath || "Resultados";
        await this.ensureFolderExists(folderPath);

        let fileName = `${quizName} - Results.md`;
        let filePath = normalizePath(`${folderPath}/${fileName}`);
        let count = 1;

        while (await this.app.vault.adapter.exists(filePath)) {
            fileName = `${quizName} - Results ${count++}.md`;
            filePath = normalizePath(`${folderPath}/${fileName}`);
        }

        try {
            const file = await this.app.vault.create(filePath, content);
            new Notice(`Resultados guardados en "${file.path}"`);
        } catch (error) {
            console.error("Error al guardar los resultados del examen:", error);
            new Notice("Error al guardar los resultados del examen.");
        }
    }
    
    private async ensureFolderExists(path: string): Promise<void> {
        if (!(this.app.vault.getAbstractFileByPath(path) instanceof TFolder)) {
            await this.app.vault.createFolder(path);
        }
    }

    private formatQuestionAsCallout(result: EvaluatedQuestion): string {
        const { question, userAnswer, isCorrect, correctAnswer } = result;

        let callout = `> [!question] ${question.question}\n`;
        callout += `>> [!success]+ Tu Respuesta\n`;
        callout += `>> ${this.formatAnswerForMarkdown(question, userAnswer)}\n`;

        if (!isCorrect) {
            callout += `>\n`;
            callout += `>> [!failure]- Respuesta Correcta\n`;
            callout += `>> ${this.formatAnswerForMarkdown(question, correctAnswer)}\n`;
        }

        if (result.feedback) {
             callout += `>\n`;
             callout += `>> [!info] Feedback (Puntuación: ${result.score}%)\n`;
             callout += `>> ${result.feedback.replace(/\n/g, "\n>> ")}\n`;
        }
        
        callout += "\n---\n\n";
        return callout;
    }

    // --- FUNCIÓN MODIFICADA ---
    private formatAnswerForMarkdown(question: any, answer: any): string {
        if (answer === "No respondida") return answer;
        
        if (isMultipleChoice(question) && typeof answer === 'number') {
            return question.options[answer];
        }
        if (isSelectAllThatApply(question) && Array.isArray(answer)) {
            return answer.map((index: number) => `- ${question.options[index]}`).join("\n>> ");
        }
        if (isMatching(question) && Array.isArray(answer)) {
             return answer.map((pair: any) => {
                const left = pair.left || pair.leftOption;
                const right = pair.right || pair.rightOption;
                return `- ${left} -> ${right}`;
            }).join("\n>> ");
        }
        if (isFillInTheBlank(question) && Array.isArray(answer)) {
            return answer.join(', ');
        }
        if (Array.isArray(answer)) {
             return answer.map(item => `- ${JSON.stringify(item)}`).join('\n>> ');
        }
        return String(answer).replace(/\n/g, "\n>> ");
    }
    // --- FIN DE LA MODIFICACIÓN ---
}