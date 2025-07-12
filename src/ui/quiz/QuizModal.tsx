// src/ui/quiz/QuizModal.tsx

import { App, Notice } from "obsidian";
import { useState } from "react";
import { QuizSettings } from "../../settings/config";
import { Question } from "../../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../../utils/typeGuards";
import ModalButton from "../components/ModalButton";
import TrueFalseQuestion from "./TrueFalseQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import SelectAllThatApplyQuestion from "./SelectAllThatApplyQuestion";
import FillInTheBlankQuestion from "./FillInTheBlankQuestion";
import MatchingQuestion from "./MatchingQuestion";
import ShortOrLongAnswerQuestion from "./ShortOrLongAnswerQuestion";
import QuizSaver from "../../services/quizSaver";
import ExamState from "../../services/ExamState";
import { ExamEvaluator } from "../../services/ExamEvaluator";
import { ExamResultsModal } from "./ExamResultsModal"; // <-- CORRECCIÓN AQUÍ

interface QuizModalProps {
	app: App;
	settings: QuizSettings;
	quiz: Question[];
	quizSaver: QuizSaver;
	examState: ExamState;
	reviewing: boolean;
	handleClose: () => void;
}

const QuizModal = ({ app, settings, quiz, quizSaver, examState, reviewing, handleClose }: QuizModalProps) => {
	const [questionIndex, setQuestionIndex] = useState<number>(0);
	const [savedQuestions, setSavedQuestions] = useState<boolean[]>(Array(quiz.length).fill(reviewing));
	
	const isExamMode = examState.active;

	const handleSaveQuestion = async () => {
		const updatedSavedQuestions = [...savedQuestions];
		updatedSavedQuestions[questionIndex] = true;
		setSavedQuestions(updatedSavedQuestions);
		await quizSaver.saveQuestion(quiz[questionIndex]);
	};

	const handleSaveAllQuestions = async () => {
		const unsavedQuestions = quiz.filter((_, index) => !savedQuestions[index]);
		const updatedSavedQuestions = savedQuestions.map(() => true);
		setSavedQuestions(updatedSavedQuestions);
		await quizSaver.saveAllQuestions(unsavedQuestions);
	};

	const handleNextQuestion = () => {
		if (questionIndex < quiz.length - 1) {
			setQuestionIndex(questionIndex + 1);
		}
	};
	
	const handleFinishExam = async () => {
		new Notice("Examen finalizado. Evaluando resultados...", 5000);
		
		const evaluator = new ExamEvaluator(settings);
		const evaluatedResults = await evaluator.evaluateAll(quiz, examState.getAnswers());
		
		console.log("Resultados del Examen Evaluados:", evaluatedResults);
		new Notice("Evaluación completada.");
		
		// Llamamos a nuestra nueva modal de resultados
		new ExamResultsModal(app, settings, examState.quizName, evaluatedResults).open();
		handleClose(); // Cerramos la modal del quiz
	}

	const handleAnswerSubmit = (answer: any) => {
		if (isExamMode) {
			examState.addAnswer(questionIndex, answer);
			if (questionIndex === quiz.length - 1) {
				// No llamamos a handleFinishExam directamente para que la UI se actualice
			} else {
				handleNextQuestion();
			}
		}
	}

	const renderQuestion = () => {
		const question = quiz[questionIndex];
        
		// Separamos la 'key' del resto de las props para evitar la advertencia de React.
		const commonProps = {
			app: app,
			question: question as any,
			isExamMode: isExamMode,
			onAnswer: handleAnswerSubmit
		};

		if (isTrueFalse(question)) {
			return <TrueFalseQuestion key={questionIndex} {...commonProps} />;
		} else if (isMultipleChoice(question)) {
			return <MultipleChoiceQuestion key={questionIndex} {...commonProps} />;
		} else if (isSelectAllThatApply(question)) {
			return <SelectAllThatApplyQuestion key={questionIndex} {...commonProps} />;
		} else if (isFillInTheBlank(question)) {
			return <FillInTheBlankQuestion key={questionIndex} {...commonProps} />;
		} else if (isMatching(question)) {
			return <MatchingQuestion key={questionIndex} {...commonProps} />;
		} else if (isShortOrLongAnswer(question)) {
			return <ShortOrLongAnswerQuestion key={questionIndex} {...commonProps} settings={settings} />;
		}
	};

    // El botón final cambia si es la última pregunta en modo examen
    const isLastQuestionInExam = isExamMode && questionIndex === quiz.length - 1;

	return (
		<div className="modal-container mod-dim">
			<div className="modal-bg" style={{opacity: 0.85}} onClick={handleClose} />
			<div className="modal modal-qg">
				<div className="modal-close-button" onClick={handleClose} />
				<div className="modal-header">
					<div className="modal-title modal-title-qg">
						{isExamMode ? `Examen - Pregunta ${questionIndex + 1} de ${quiz.length}` : `Pregunta ${questionIndex + 1} de ${quiz.length}`}
					</div>
				</div>
				<div className="modal-content modal-content-flex-qg">
					{!isExamMode && (
						<div className="modal-button-container-qg">
							<ModalButton icon="arrow-left" tooltip="Back" onClick={() => setQuestionIndex(questionIndex - 1)} disabled={questionIndex === 0}/>
							<ModalButton icon="save" tooltip="Save" onClick={handleSaveQuestion} disabled={savedQuestions[questionIndex]}/>
							<ModalButton icon="save-all" tooltip="Save all" onClick={handleSaveAllQuestions} disabled={!savedQuestions.includes(false)}/>
							<ModalButton icon="arrow-right" tooltip="Next" onClick={handleNextQuestion} disabled={questionIndex === quiz.length - 1}/>
						</div>
					)}
					<hr className="quiz-divider-qg" />
					{renderQuestion()}
                    {isLastQuestionInExam && (
                        <button
                            className="submit-answer-qg"
                            onClick={handleFinishExam}
                        >
                            Finalizar Examen y Ver Resultados
                        </button>
                    )}
				</div>
			</div>
		</div>
	);
};

export default QuizModal;
