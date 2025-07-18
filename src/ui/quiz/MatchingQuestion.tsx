// src/ui/quiz/MatchingQuestion.tsx

import { App, Component, MarkdownRenderer } from "obsidian";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Matching } from "../../utils/types";
import { shuffleArray } from "../../utils/helpers";

interface MatchingQuestionProps {
	app: App;
	question: Matching;
	isExamMode: boolean;
	onAnswer: (answer: { left: string, right: string }[]) => void;
}

const MatchingQuestion = ({ app, question, isExamMode, onAnswer }: MatchingQuestionProps) => {
	const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
	const [selectedRight, setSelectedRight] = useState<number | null>(null);
	const [selectedPairs, setSelectedPairs] = useState<{ leftIndex: number, rightIndex: number }[]>([]);
	const [status, setStatus] = useState<"answering" | "submitted" | "reviewing">("answering");
	const component = useRef(new Component()).current;

	const leftOptions = useMemo<{ value: string, index: number }[]>(() =>
			shuffleArray(question.answer.map((pair, index) => ({ value: pair.leftOption, index }))),
		[question]
	);
	const rightOptions = useMemo<{ value: string, index: number }[]>(() =>
			shuffleArray(question.answer.map((pair, index) => ({ value: pair.rightOption, index }))),
		[question]
	);
	
	const correctPairsMap = useMemo<Map<number, number>>(() => {
		const leftIndexMap = new Map<string, number>(leftOptions.map((option, index) => [option.value, index]));
		const rightIndexMap = new Map<string, number>(rightOptions.map((option, index) => [option.value, index]));
		return question.answer.reduce((acc, pair) => {
			const leftIndex = leftIndexMap.get(pair.leftOption)!;
			const rightIndex = rightIndexMap.get(pair.rightOption)!;
			acc.set(leftIndex, rightIndex);
			return acc;
		}, new Map<number, number>());
	}, [question, leftOptions, rightOptions]);

	const questionRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		if (questionRef.current) {
			questionRef.current.empty();
			question.question.split("\\n").forEach(questionFragment => {
				MarkdownRenderer.render(app, questionFragment, questionRef.current as HTMLElement, "", component);
			});
		}

		buttonRefs.current = buttonRefs.current.slice(0, question.answer.length * 2);
		question.answer.forEach((_, index) => {
			const leftButton = buttonRefs.current[index * 2];
			const rightButton = buttonRefs.current[index * 2 + 1];
			if (leftButton) {
				leftButton.empty();
				MarkdownRenderer.render(app, leftOptions[index].value, leftButton, "", component);
			}
			if (rightButton) {
				rightButton.empty();
				MarkdownRenderer.render(app, rightOptions[index].value, rightButton, "", component);
			}
		});

		return () => {
			component.unload();
		};
	}, [app, question, leftOptions, rightOptions]);

	// --- LÓGICA DE CLIC SIMPLIFICADA Y CORREGIDA ---
	const handleLeftClick = (leftIndex: number) => {
		if (status !== "answering") return;

		// Si se hace clic en un elemento izquierdo ya emparejado, se rompe el par.
		const existingPair = selectedPairs.find(p => p.leftIndex === leftIndex);
		if (existingPair) {
			setSelectedPairs(selectedPairs.filter(p => p.leftIndex !== leftIndex));
			return;
		}

		// Si se hace clic en el elemento pendiente actual, se deselecciona.
		if (selectedLeft === leftIndex) {
			setSelectedLeft(null);
			return;
		}

		// Si hay un elemento derecho pendiente, se crea un nuevo par.
		if (selectedRight !== null) {
			const newPairs = selectedPairs.filter(p => p.rightIndex !== selectedRight);
			setSelectedPairs([...newPairs, { leftIndex, rightIndex: selectedRight }]);
			setSelectedLeft(null);
			setSelectedRight(null);
		} else {
			// De lo contrario, se establece como el nuevo elemento pendiente.
			setSelectedLeft(leftIndex);
		}
	};

	const handleRightClick = (rightIndex: number) => {
		if (status !== "answering") return;

		const existingPair = selectedPairs.find(p => p.rightIndex === rightIndex);
		if (existingPair) {
			setSelectedPairs(selectedPairs.filter(p => p.rightIndex !== rightIndex));
			return;
		}

		if (selectedRight === rightIndex) {
			setSelectedRight(null);
			return;
		}

		if (selectedLeft !== null) {
			const newPairs = selectedPairs.filter(p => p.leftIndex !== selectedLeft);
			setSelectedPairs([...newPairs, { leftIndex: selectedLeft, rightIndex }]);
			setSelectedLeft(null);
			setSelectedRight(null);
		} else {
			setSelectedRight(rightIndex);
		}
	};
	// --- FIN DE LA LÓGICA DE CLIC ---

	const handleSubmit = () => {
		if (isExamMode) {
			const finalAnswers = selectedPairs.map(pair => ({
				left: leftOptions[pair.leftIndex].value,
				right: rightOptions[pair.rightIndex].value
			}));
			onAnswer(finalAnswers);
		} else {
			setStatus("submitted");
		}
	};

	const getLeftButtonClass = (leftIndex: number): string => {
		if (status === "answering" && (selectedLeft === leftIndex || selectedPairs.some(pair => pair.leftIndex === leftIndex))) {
			return "matching-button-qg selected-choice-qg";
		}
		
		if (!isExamMode) {
			if (status === "submitted") {
				const correct = selectedPairs.some(pair => pair.leftIndex === leftIndex && correctPairsMap.get(leftIndex) === pair.rightIndex);
				return correct ? "matching-button-qg correct-choice-qg" : "matching-button-qg incorrect-choice-qg";
			}
			if (status === "reviewing") {
				const correct = selectedPairs.some(pair => pair.leftIndex === leftIndex && correctPairsMap.get(leftIndex) === pair.rightIndex);
				return "matching-button-qg correct-choice-qg" + (correct ? "" : " not-selected-qg");
			}
		}
		return "matching-button-qg";
	};

	const getRightButtonClass = (rightIndex: number): string => {
		if (status === "answering" && (selectedRight === rightIndex || selectedPairs.some(pair => pair.rightIndex === rightIndex))) {
			return "matching-button-qg selected-choice-qg";
		}
		
		if (!isExamMode) {
			if (status === "submitted") {
				const userPair = selectedPairs.find(p => p.rightIndex === rightIndex);
				if (userPair && correctPairsMap.get(userPair.leftIndex) === rightIndex) {
					return "matching-button-qg correct-choice-qg";
				}
				return "matching-button-qg incorrect-choice-qg";
			}
			if (status === "reviewing") {
				const userPair = selectedPairs.find(p => p.rightIndex === rightIndex);
				if (userPair && correctPairsMap.get(userPair.leftIndex) === rightIndex) {
					return "matching-button-qg correct-choice-qg";
				}
				return "matching-button-qg correct-choice-qg not-selected-qg";
			}
		}
		return "matching-button-qg";
	};
	
	const getCircleNumber = (side: 'left' | 'right', index: number) => {
		const pairIndex = side === 'left'
			? selectedPairs.findIndex(pair => pair.leftIndex === index)
			: selectedPairs.findIndex(pair => pair.rightIndex === index);
		return pairIndex === -1 ? "" : pairIndex + 1;
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg" ref={questionRef} />
			<div className="matching-container-qg">
				{question.answer.map((_, index) => (
					<Fragment key={index}>
						<div className="matching-button-container-qg">
							<svg className="svg-left-qg" viewBox="0 0 40 40">
								<circle className="svg-circle-qg" cx="20" cy="20" r="18" />
								<text className="svg-circle-text-qg" x="20" y="26">
									{getCircleNumber('left', index)}
								</text>
							</svg>
							<button
								ref={el => buttonRefs.current[index * 2] = el}
								className={getLeftButtonClass(index)}
								onClick={() => handleLeftClick(index)}
								disabled={status !== "answering"}
							/>
						</div>
						<div className="matching-button-container-qg">
							<svg className="svg-right-qg" viewBox="0 0 40 40">
								<circle className="svg-circle-qg" cx="20" cy="20" r="18" />
								<text className="svg-circle-text-qg" x="20" y="26">
									{getCircleNumber('right', index)}
								</text>
							</svg>
							<button
								ref={(el) => buttonRefs.current[index * 2 + 1] = el}
								className={getRightButtonClass(index)}
								onClick={() => handleRightClick(index)}
								disabled={status !== "answering"}
							/>
						</div>
					</Fragment>
				))}
			</div>
			<button
				className="submit-answer-qg"
				onClick={handleSubmit}
				disabled={
					(selectedPairs.length !== question.answer.length) || 
					(status !== "answering")
				}
			>
				{isExamMode ? "Siguiente" : (status === "answering" ? "Submit" : "Reveal answer")}
			</button>
		</div>
	);
};

export default MatchingQuestion;