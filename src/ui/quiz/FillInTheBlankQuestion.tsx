// src/ui/quiz/FillInTheBlankQuestion.tsx

import { App, Component, MarkdownRenderer } from "obsidian";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FillInTheBlank } from "../../utils/types";

// Helper component to render markdown text within a span
const MarkdownSpan = ({ text, app, component }: { text: string; app: App; component: Component }) => {
	const ref = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		if (ref.current) {
			ref.current.empty();
			// Replace escaped newlines with actual newlines for proper rendering
			MarkdownRenderer.render(app, text.replace(/\\n/g, "\n"), ref.current, "", component);
		}
	}, [text, app, component]);
	return <span ref={ref} />;
};

interface FillInTheBlankQuestionProps {
	app: App;
	question: FillInTheBlank;
	isExamMode: boolean; // <-- AÑADIDO
	onAnswer: (answer: string[]) => void; // <-- AÑADIDO
}

const FillInTheBlankQuestion = ({ app, question, isExamMode, onAnswer }: FillInTheBlankQuestionProps) => {
	const [userAnswers, setUserAnswers] = useState<string[]>(Array(question.answer.length).fill(""));
	const [submitted, setSubmitted] = useState<boolean>(false);
	const component = useMemo(() => new Component(), [question.question]);

	const questionParts = useMemo(() => question.question.split(/`_+`/g), [question.question]);

	const handleInputChange = (index: number, value: string) => {
		const newAnswers = [...userAnswers];
		newAnswers[index] = value;
		setUserAnswers(newAnswers);
	};

	const handleSubmit = () => {
		if (isExamMode) {
			onAnswer(userAnswers);
		} else {
			setSubmitted(true);
		}
	};

	const getInputClass = (index: number) => {
		if (!submitted || isExamMode) { // No mostrar colores en modo examen
			return "fill-in-the-blank-input-qg";
		}
		const isCorrect = userAnswers[index].trim().toLowerCase() === question.answer[index].toLowerCase();
		return isCorrect
			? "fill-in-the-blank-input-qg fill-in-the-blank-input-correct-qg"
			: "fill-in-the-blank-input-qg fill-in-the-blank-input-incorrect-qg";
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg fill-in-the-blank-question-text-qg">
				{questionParts.map((part, index) => (
					<Fragment key={index}>
						<MarkdownSpan text={part} app={app} component={component} />
						{index < question.answer.length && (
							<input
								type="text"
								className={getInputClass(index)}
								value={submitted && !isExamMode ? question.answer[index] : userAnswers[index]}
								onChange={(e) => handleInputChange(index, e.target.value)}
								readOnly={submitted && !isExamMode}
								size={Math.max(question.answer[index].length, 5) + 2}
								autoCapitalize="off"
							/>
						)}
					</Fragment>
				))}
			</div>

			<div className="input-container-qg">
				<button
					className="submit-answer-qg"
					onClick={handleSubmit}
					disabled={submitted && !isExamMode}
				>
					{isExamMode ? "Siguiente" : "Submit"}
				</button>
				{(!submitted || isExamMode) && (
					<div className="instruction-footnote-qg">
						Rellena los espacios y presiona el botón para continuar.
					</div>
				)}
			</div>
		</div>
	);
};

export default FillInTheBlankQuestion;