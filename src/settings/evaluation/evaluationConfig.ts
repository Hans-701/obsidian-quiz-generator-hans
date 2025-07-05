import { Provider } from "../../generators/providers";

export interface EvaluationConfig {
    evaluationProvider: string;
    evaluationOpenRouterApiKey: string;
    evaluationOpenRouterBaseURL: string;
    openRouterEvaluationModel: string;
}

export const DEFAULT_EVALUATION_SETTINGS: EvaluationConfig = {
    evaluationProvider: Provider.OPENAI,
    evaluationOpenRouterApiKey: "",
    evaluationOpenRouterBaseURL: "https://openrouter.ai/api/v1",
    openRouterEvaluationModel: "mistralai/mistral-nemo:free",
};