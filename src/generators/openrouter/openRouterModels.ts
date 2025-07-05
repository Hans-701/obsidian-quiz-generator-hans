export const enum OpenRouterTextGenModel {
	DEEPSEEK_R1_0528 = "deepseek/deepseek-r1-0528:free",
	DEEPSEEK_CHAT_V3_0324 = "deepseek/deepseek-chat-v3-0324:free",
	QWEN3_235B_A22B = "qwen/qwen3-235b-a22b:free",
	GOOGLE_GEMMA_3_27B_IT = "google/gemma-3-27b-it:free",
	META_LLAMA_4_MAVERICK = "meta-llama/llama-4-maverick:free",
}

export const openRouterTextGenModels: Record<OpenRouterTextGenModel, string> = {
	[OpenRouterTextGenModel.DEEPSEEK_R1_0528]: "DeepSeek: R1 0528 (Free)",
	[OpenRouterTextGenModel.DEEPSEEK_CHAT_V3_0324]: "DeepSeek: Chat V3 0324 (Free)",
	[OpenRouterTextGenModel.QWEN3_235B_A22B]: "Qwen: 3-235B A22B (Free)",
	[OpenRouterTextGenModel.GOOGLE_GEMMA_3_27B_IT]: "Google: Gemma 3 27B IT (Free)",
	[OpenRouterTextGenModel.META_LLAMA_4_MAVERICK]: "Meta: Llama 4 Maverick (Free)",
};