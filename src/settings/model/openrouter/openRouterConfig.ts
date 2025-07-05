import { OpenRouterTextGenModel } from "../../../generators/openrouter/openRouterModels";

export interface OpenRouterConfig {
	openRouterApiKey: string;
	openRouterBaseURL: string;
	openRouterTextGenModel: string;
}

export const DEFAULT_OPENROUTER_SETTINGS: OpenRouterConfig = {
	openRouterApiKey: "",
	openRouterBaseURL: "https://openrouter.ai/api/v1",
	openRouterTextGenModel: OpenRouterTextGenModel.DEEPSEEK_R1_0528,
};