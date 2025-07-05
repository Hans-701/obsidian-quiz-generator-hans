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
}

const ShortOrLongAnswerQuestion = ({ app, question, settings }: ShortOrLongAnswerQuestionProps) => {
    const [status, setStatus] = useState<"answering" | "evaluating" | "submitted">("answering");
    const [evaluationResult, setEvaluationResult] = useState<{ score: number, feedback: string } | null>(null);
    const component = useMemo<Component>(() => new Component(), []);
    const questionRef = useRef<HTMLDivElement>(null);
    const answerRef = useRef<HTMLButtonElement>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        question.question.split("\\n").forEach(questionFragment => {
            if (questionRef.current) {
                MarkdownRenderer.render(app, questionFragment, questionRef.current, "", component);
            }
        });
    }, [app, question, component]);

    useEffect(() => {
        if (answerRef.current && status === "submitted") {
            MarkdownRenderer.render(app, `**Correct Answer:**\n\n${question.answer}`, answerRef.current, "", component);
        }
        if (feedbackRef.current && evaluationResult) {
            const feedbackContent = `**Feedback (${evaluationResult.score}%):**\n\n${evaluationResult.feedback}`;
            MarkdownRenderer.render(app, feedbackContent, feedbackRef.current, "", component);
        }
    }, [app, question, component, status, evaluationResult]);

    const handleSubmit = async (input: string) => {
        if (input.toLowerCase().trim() === "skip") {
            setStatus("submitted");
            return;
        }

        try {
            setStatus("evaluating");
            new Notice("Evaluating answer...");

            const evaluationService = new EvaluationService(settings);
            const result = await evaluationService.evaluate(input.trim(), question.answer);

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

            {status === "evaluating" && <div style={{textAlign: "center", margin: "1em"}}>Evaluating...</div>}

            {status === "submitted" && (
                <>
                    {evaluationResult && <div className="answer-qg" ref={feedbackRef} />}
                    <button className="answer-qg" ref={answerRef} />
                </>
            )}

            <div className={status === "submitted" ? "input-container-qg limit-height-qg" : "input-container-qg"}>
                <AnswerInput onSubmit={handleSubmit} clearInputOnSubmit={false} disabled={status !== "answering"} />
                <div className="instruction-footnote-qg">
                    Press enter to submit your answer. Enter "skip" to reveal the answer.
                </div>
            </div>
        </div>
    );
};

export default ShortOrLongAnswerQuestion;