// src/ui/quiz/ShortOrLongAnswerQuestion.tsx

import { App, Component, MarkdownRenderer, Notice } from "obsidian";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShortOrLongAnswer } from "../../utils/types";
import { QuizSettings } from "../../settings/config";
import AnswerInput from "../components/AnswerInput";
import { EvaluationService } from "../../services/evaluationService";

interface ShortOrLongAnswerQuestionProps {
    app: App;
    question: ShortOrLongAnswer;
    settings: QuizSettings;
    isExamMode: boolean; // <-- AÑADIDO
    onAnswer: (answer: string) => void; // <-- AÑADIDO
}

const ShortOrLongAnswerQuestion = ({ app, question, settings, isExamMode, onAnswer }: ShortOrLongAnswerQuestionProps) => {
    const [status, setStatus] = useState<"answering" | "evaluating" | "submitted">("answering");
    const [evaluationResult, setEvaluationResult] = useState<{ score: number, feedback: string } | null>(null);
    const component = useMemo<Component>(() => new Component(), []);
    const questionRef = useRef<HTMLDivElement>(null);
    const answerRef = useRef<HTMLDivElement>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (questionRef.current) {
			questionRef.current.empty();
            question.question.split("\\n").forEach(questionFragment => {
                if (questionRef.current) {
                    MarkdownRenderer.render(app, questionFragment, questionRef.current, "", component);
                }
            });
        }
    }, [app, question, component]);

    useEffect(() => {
		// Esta lógica de renderizado solo se aplica al modo normal
		if (!isExamMode) {
			if (answerRef.current && status === "submitted") {
				answerRef.current.empty();
				MarkdownRenderer.render(app, `**Correct Answer:**\n\n${question.answer}`, answerRef.current, "", component);
			}
			if (feedbackRef.current && evaluationResult) {
				feedbackRef.current.empty();
				const feedbackContent = `**Feedback (${evaluationResult.score}%):**\n\n${evaluationResult.feedback}`;
				MarkdownRenderer.render(app, feedbackContent, feedbackRef.current, "", component);
			}
		}
    }, [app, question, component, status, evaluationResult, isExamMode]);

    const handleSubmit = async (input: string) => {
        const trimmedInput = input.trim();
		
		if (isExamMode) {
			onAnswer(trimmedInput);
			return;
		}
		
        if (trimmedInput.toLowerCase() === "skip") {
            setStatus("submitted");
            return;
        }

        try {
            setStatus("evaluating");
            new Notice("Evaluating answer...");

            const evaluationService = new EvaluationService(settings);
            const result = await evaluationService.evaluate(trimmedInput, question.answer);

            setEvaluationResult(result);
            new Notice(`Evaluation complete: ${result.score}%`);
            setStatus("submitted");
        } catch (error) {
            setStatus("answering");
            new Notice((error as Error).message, 0);
        }
    };

    return (
        <div className="question-container-qg">
            <div className="question-qg" ref={questionRef} />

            {status === "evaluating" && !isExamMode && <div style={{textAlign: "center", margin: "1em"}}>Evaluating...</div>}

            {status === "submitted" && !isExamMode && (
                <>
                    {evaluationResult && <div className="answer-qg" ref={feedbackRef} />}
                    <div className="answer-qg" ref={answerRef} />
                </>
            )}

            <div className={(status === "submitted" && !isExamMode) ? "input-container-qg limit-height-qg" : "input-container-qg"}>
                <AnswerInput onSubmit={handleSubmit} clearInputOnSubmit={!isExamMode} disabled={status !== "answering"} />
                <div className="instruction-footnote-qg">
					{isExamMode ? "Presiona enter para enviar y pasar a la siguiente pregunta." : "Press enter to submit your answer. Enter \"skip\" to reveal the answer."}
                </div>
            </div>
        </div>
    );
};

export default ShortOrLongAnswerQuestion;