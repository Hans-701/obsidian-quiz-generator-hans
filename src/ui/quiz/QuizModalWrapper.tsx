// src/ui/quiz/QuizModalWrapper.tsx

import { App } from "obsidian";
import { QuizSettings } from "../../settings/config";
import { Question } from "../../utils/types";
import QuizModal from "./QuizModal";
import QuizSaver from "../../services/quizSaver";
import ExamState from "../../services/ExamState"; // Importamos el estado

interface QuizModalWrapperProps {
	app: App;
	settings: QuizSettings;
	quiz: Question[];
	quizSaver: QuizSaver;
	examState: ExamState; // <-- AÑADIDO: Ahora se espera esta propiedad
	reviewing: boolean;
	handleClose: () => void;
}

const QuizModalWrapper = ({ app, settings, quiz, quizSaver, examState, reviewing, handleClose }: QuizModalWrapperProps) => {
	return <QuizModal
		app={app}
		settings={settings}
		quiz={quiz}
		quizSaver={quizSaver}
		examState={examState} // <-- AÑADIDO: Se pasa al siguiente componente
		reviewing={reviewing}
		handleClose={handleClose}
	/>;
};

export default QuizModalWrapper;