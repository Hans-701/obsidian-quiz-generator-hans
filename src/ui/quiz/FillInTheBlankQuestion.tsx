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
}

const FillInTheBlankQuestion = ({ app, question }: FillInTheBlankQuestionProps) => {
	const [userAnswers, setUserAnswers] = useState<string[]>(Array(question.answer.length).fill(""));
	const [submitted, setSubmitted] = useState<boolean>(false);
	const component = useMemo(() => new Component(), [question.question]);

	// Split the question into parts based on the blank placeholder
	const questionParts = useMemo(() => question.question.split(/`_+`/g), [question.question]);

	const handleInputChange = (index: number, value: string) => {
		const newAnswers = [...userAnswers];
		newAnswers[index] = value;
		setUserAnswers(newAnswers);
	};

	const handleSubmit = () => {
		setSubmitted(true);
	};

	const getInputClass = (index: number) => {
		if (!submitted) {
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
								value={submitted ? question.answer[index] : userAnswers[index]}
								onChange={(e) => handleInputChange(index, e.target.value)}
								readOnly={submitted}
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
					disabled={submitted}
				>
					{submitted ? "Answered" : "Submit"}
				</button>
				{!submitted && (
					<div className="instruction-footnote-qg">
						Fill in the blanks and press submit to check your answers.
					</div>
				)}
			</div>
		</div>
	);
};

export default FillInTheBlankQuestion;