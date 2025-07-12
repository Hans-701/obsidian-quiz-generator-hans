// src/ui/quiz/SelectAllThatApplyQuestion.tsx

import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { SelectAllThatApply } from "../../utils/types";

interface SelectAllThatApplyQuestionProps {
	app: App;
	question: SelectAllThatApply;
	isExamMode: boolean; // <-- AÑADIDO
	onAnswer: (answer: number[]) => void; // <-- AÑADIDO
}

const SelectAllThatApplyQuestion = ({ app, question, isExamMode, onAnswer }: SelectAllThatApplyQuestionProps) => {
	const [userAnswer, setUserAnswer] = useState<number[]>([]);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const questionRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const component = useRef(new Component()).current;

	useEffect(() => {
		if (questionRef.current) {
			questionRef.current.empty();
			question.question.split("\\n").forEach(questionFragment => {
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

	const toggleSelection = (buttonAnswer: number) => {
		// En modo examen, no se actualiza la UI, solo se guarda el estado.
		if (isExamMode) {
			const newAnswer = userAnswer.includes(buttonAnswer)
				? userAnswer.filter(answer => answer !== buttonAnswer)
				: [...userAnswer, buttonAnswer];
			setUserAnswer(newAnswer);
			return;
		}

		// Lógica original para modo normal
		setUserAnswer(prevUserAnswer => {
			if (prevUserAnswer.includes(buttonAnswer)) {
				return prevUserAnswer.filter(answer => answer !== buttonAnswer);
			} else {
				return [...prevUserAnswer, buttonAnswer];
			}
		});
	};
	
	const handleSubmit = () => {
		if (isExamMode) {
			onAnswer(userAnswer);
		} else {
			setSubmitted(true);
		}
	};

	const getButtonClass = (buttonAnswer: number) => {
		if (submitted && !isExamMode) { // La coloración solo ocurre en modo normal
			const correct = question.answer.includes(buttonAnswer);
			const selected = userAnswer.includes(buttonAnswer);
			if (correct && selected) return "select-all-that-apply-button-qg correct-choice-qg";
			if (correct) return "select-all-that-apply-button-qg correct-choice-qg not-selected-qg";
			if (selected) return "select-all-that-apply-button-qg incorrect-choice-qg";
		}
		
		// En ambos modos, la clase 'selected-choice-qg' indica la selección del usuario.
		if (userAnswer.includes(buttonAnswer)) {
			return "select-all-that-apply-button-qg selected-choice-qg";
		}
		
		return "select-all-that-apply-button-qg";
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg" ref={questionRef} />
			<div className="select-all-that-apply-container-qg">
				{question.options.map((_, index) => (
					<button
						key={index}
						ref={(el) => buttonRefs.current[index] = el}
						className={getButtonClass(index)}
						onClick={() => toggleSelection(index)}
						disabled={submitted && !isExamMode}
					/>
				))}
			</div>
			<button
				className="submit-answer-qg"
				onClick={handleSubmit}
				disabled={(!userAnswer.length) || (submitted && !isExamMode)}
			>
				{isExamMode ? "Siguiente" : "Submit"}
			</button>
		</div>
	);
};

export default SelectAllThatApplyQuestion;