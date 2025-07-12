// src/ui/quiz/TrueFalseQuestion.tsx

import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { TrueFalse } from "../../utils/types";

interface TrueFalseQuestionProps {
	app: App;
	question: TrueFalse;
	isExamMode: boolean; // <-- AÑADIDO
	onAnswer: (answer: boolean) => void; // <-- AÑADIDO
}

const TrueFalseQuestion = ({ app, question, isExamMode, onAnswer }: TrueFalseQuestionProps) => {
	const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
	const questionRef = useRef<HTMLDivElement>(null);
	const component = useRef(new Component()).current;

	useEffect(() => {
		if (questionRef.current) {
			questionRef.current.empty(); // Limpiar antes de renderizar
			question.question.split("\\n").forEach(questionFragment => {
				if (questionRef.current) {
					MarkdownRenderer.render(app, questionFragment, questionRef.current, "", component);
				}
			});
		}
		// Limpiar el componente al desmontar para evitar fugas de memoria
		return () => {
			component.unload();
		};
	}, [app, question]);
	
	const handleAnswer = (answer: boolean) => {
		if (isExamMode) {
			onAnswer(answer);
		} else {
			setUserAnswer(answer);
		}
	};

	const getButtonClass = (buttonAnswer: boolean) => {
		// En modo examen, los botones no cambian de color.
		if (isExamMode) return "true-false-button-qg";
		
		if (userAnswer === null) return "true-false-button-qg";
		const correct = buttonAnswer === question.answer;
		const selected = buttonAnswer === userAnswer;
		if (correct && selected) return "true-false-button-qg correct-choice-qg";
		if (correct) return "true-false-button-qg correct-choice-qg not-selected-qg";
		if (selected) return "true-false-button-qg incorrect-choice-qg";
		return "true-false-button-qg";
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg" ref={questionRef} />
			<div className="true-false-container-qg">
				<button
					className={getButtonClass(true)}
					onClick={() => handleAnswer(true)}
					disabled={!isExamMode && userAnswer !== null}
				>
					True
				</button>
				<button
					className={getButtonClass(false)}
					onClick={() => handleAnswer(false)}
					disabled={!isExamMode && userAnswer !== null}
				>
					False
				</button>
			</div>
		</div>
	);
};

export default TrueFalseQuestion;