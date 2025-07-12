// src/ui/quiz/MultipleChoiceQuestion.tsx

import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { MultipleChoice } from "../../utils/types";

interface MultipleChoiceQuestionProps {
    app: App;
    question: MultipleChoice;
    isExamMode: boolean;
    onAnswer: (answer: number) => void;
}

const MultipleChoiceQuestion = ({ app, question, isExamMode, onAnswer }: MultipleChoiceQuestionProps) => {
    const [userAnswer, setUserAnswer] = useState<number | null>(null);
    const questionRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const component = useRef(new Component()).current;

    useEffect(() => {
        if (questionRef.current) {
            questionRef.current.empty();
            question.question.split("\\n").forEach(questionFragment => {
                // --- CORRECCIÓN AQUÍ ---
                // Añadimos 'as HTMLElement' para asegurar a TypeScript que el elemento no es nulo.
                MarkdownRenderer.render(app, questionFragment, questionRef.current as HTMLElement, "", component);
            });
        }
        
        buttonRefs.current = buttonRefs.current.slice(0, question.options.length);
        buttonRefs.current.forEach((button, index) => {
            if (button) {
                button.empty();
                MarkdownRenderer.render(app, question.options[index], button, "", component);
            }
        });

        return () => {
            component.unload();
        };
    }, [app, question]);

    const handleAnswer = (answerIndex: number) => {
        if (isExamMode) {
            onAnswer(answerIndex);
        } else {
            setUserAnswer(answerIndex);
        }
    };
    
    const getButtonClass = (buttonAnswer: number) => {
        if (isExamMode) return "multiple-choice-button-qg";

        if (userAnswer === null) return "multiple-choice-button-qg";
        const correct = buttonAnswer === question.answer;
        const selected = buttonAnswer === userAnswer;
        if (correct && selected) return "multiple-choice-button-qg correct-choice-qg";
        if (correct) return "multiple-choice-button-qg correct-choice-qg not-selected-qg";
        if (selected) return "multiple-choice-button-qg incorrect-choice-qg";
        return "multiple-choice-button-qg";
    };

    return (
        <div className="question-container-qg">
            <div className="question-qg" ref={questionRef} />
            <div className="multiple-choice-container-qg">
                {question.options.map((_, index) => (
                    <button
                        key={index}
                        ref={(el) => buttonRefs.current[index] = el}
                        className={getButtonClass(index)}
                        onClick={() => handleAnswer(index)}
                        disabled={!isExamMode && userAnswer !== null}
                    />
                ))}
            </div>
        </div>
    );
};

export default MultipleChoiceQuestion;