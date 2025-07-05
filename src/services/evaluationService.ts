import { QuizSettings } from "../settings/config";
import { Provider } from "../generators/providers";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { Mistral } from "@mistralai/mistralai";
import { CohereClient } from "cohere-ai/Client";
import { Ollama } from "ollama/dist/browser.mjs";

export class EvaluationService {
    private readonly settings: QuizSettings;

    constructor(settings: QuizSettings) {
        this.settings = settings;
    }

    private getEvaluationPrompt(): string {
        return `
INSTRUCTIONS:
You are an automated response evaluator. Your task is to compare a correct answer with a user's answer and calculate a percentage score based on semantic similarity, coherence, cohesion, grammar, and presence of key points. Then, you will classify the response into one of the following categories:
- Correct (90-100%)
- Good, but improvable (70-89%)
- Needs improvement (50-69%)
- Incorrect (0-49%)

Finally, you must provide brief feedback (max 100 words) explaining the score, mentioning the specific areas (semantic similarity, coherence, key points, etc.) where the user failed or succeeded, and briefly clarifying the correct answer for better understanding.

The feedback you provide MUST be in ${this.settings.language}.

Your response MUST be a JSON object with the following structure: {"score": <number>, "feedback": "<string>"}.
Do not add any other text or formatting outside of this JSON object.
`;
    }

    async evaluate(userAnswer: string, correctAnswer: string): Promise<{ score: number, feedback: string }> {
        const provider = this.settings.evaluationProvider;
        const userMessage = `Correct Answer: "${correctAnswer}"\n\nUser Answer: "${userAnswer}"`;

        try {
            let responseContent: string | null = null;

            switch (provider) {
                case Provider.OPENAI:
                case Provider.PERPLEXITY:
                    responseContent = await this.evaluateWithOpenAICompatible(provider, userMessage);
                    break;
                case Provider.OPENROUTER:
                    responseContent = await this.evaluateWithOpenAICompatible(provider, userMessage, true);
                    break;
                case Provider.GOOGLE:
                    responseContent = await this.evaluateWithGoogle(userMessage);
                    break;
                case Provider.ANTHROPIC:
                    responseContent = await this.evaluateWithAnthropic(userMessage);
                    break;
                case Provider.MISTRAL:
                    responseContent = await this.evaluateWithMistral(userMessage);
                    break;
                case Provider.COHERE:
                    responseContent = await this.evaluateWithCohere(userMessage);
                    break;
                case Provider.OLLAMA:
                    responseContent = await this.evaluateWithOllama(userMessage);
                    break;
                default:
                    throw new Error(`Evaluation for provider ${provider} is not supported yet.`);
            }

            if (responseContent === null) {
                throw new Error("The API returned an empty response.");
            }

            const result = JSON.parse(responseContent);
            return {
                score: result.score || 0,
                feedback: result.feedback || "Could not get feedback from API."
            };

        } catch (error) {
            console.error("Error evaluating answer:", error);
            throw new Error(`Failed to evaluate the answer with ${provider}. Please check its API key and model configuration.`);
        }
    }

    private async evaluateWithOpenAICompatible(provider: string, userMessage: string, isOpenRouter = false): Promise<string | null> {
        const settings = this.settings;
        let apiKey: string, baseURL: string, model: string;

        if (isOpenRouter) {
            apiKey = settings.evaluationOpenRouterApiKey || settings.openRouterApiKey;
            baseURL = settings.evaluationOpenRouterBaseURL;
            model = settings.openRouterEvaluationModel;
        } else {
            const providerMap = {
                [Provider.OPENAI]: { key: settings.openAIApiKey, url: settings.openAIBaseURL, model: settings.openAITextGenModel },
                [Provider.PERPLEXITY]: { key: settings.perplexityApiKey, url: settings.perplexityBaseURL, model: settings.perplexityTextGenModel },
            };
            const config = providerMap[provider as keyof typeof providerMap];
            apiKey = config.key;
            baseURL = config.url;
            model = config.model;
        }

        if (!apiKey) throw new Error(`API key for ${provider} is not set.`);

        const client = new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: true });
        const response = await client.chat.completions.create({
            model,
            messages: [{ role: "system", content: this.getEvaluationPrompt() }, { role: "user", content: userMessage }],
            response_format: { type: "json_object" },
        });

        if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
            return response.choices[0].message.content;
        }

        return null;
    }

    private async evaluateWithMistral(userMessage: string): Promise<string | null> {
        if (!this.settings.mistralApiKey) throw new Error("Mistral API key is not set.");
        const mistral = new Mistral({ apiKey: this.settings.mistralApiKey, serverURL: this.settings.mistralBaseURL });
        const response = await mistral.chat.complete({
            model: this.settings.mistralTextGenModel,
            messages: [{ role: "system", content: this.getEvaluationPrompt() }, { role: "user", content: userMessage }],
            responseFormat: { type: "json_object" },
        });

        if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
            return response.choices[0].message.content;
        }

        return null;
    }

    private async evaluateWithGoogle(userMessage: string): Promise<string> {
        if (!this.settings.googleApiKey) throw new Error("Google API key is not set.");
        const google = new GoogleGenerativeAI(this.settings.googleApiKey);
        const model = google.getGenerativeModel({
            model: this.settings.googleTextGenModel,
            systemInstruction: this.getEvaluationPrompt(),
            generationConfig: { responseMimeType: "application/json" }
        }, {
             baseUrl: this.settings.googleBaseURL,
        });
        const response = await model.generateContent(userMessage);
        return response.response.text();
    }
    
    private async evaluateWithAnthropic(userMessage: string): Promise<string | null> {
        if (!this.settings.anthropicApiKey) throw new Error("Anthropic API key is not set.");
        const anthropic = new Anthropic({ apiKey: this.settings.anthropicApiKey, baseURL: this.settings.anthropicBaseURL, dangerouslyAllowBrowser: true });
        const response = await anthropic.messages.create({
            model: this.settings.anthropicTextGenModel,
            system: this.getEvaluationPrompt(),
            messages: [{ role: "user", content: userMessage }],
            max_tokens: 1024,
        });
        return response.content[0].type === "text" ? response.content[0].text : null;
    }

    private async evaluateWithCohere(userMessage: string): Promise<string> {
        if (!this.settings.cohereApiKey) throw new Error("Cohere API key is not set.");
        const cohere = new CohereClient({ token: this.settings.cohereApiKey, environment: this.settings.cohereBaseURL });
        const response = await cohere.chat({
            model: this.settings.cohereTextGenModel,
            preamble: this.getEvaluationPrompt(),
            message: userMessage,
            responseFormat: { type: "json_object" },
        });
        return response.text;
    }
    
    private async evaluateWithOllama(userMessage: string): Promise<string | null> {
        if (!this.settings.ollamaBaseURL) throw new Error("Ollama Base URL is not set.");
        const ollama = new Ollama({ host: this.settings.ollamaBaseURL });
        const response = await ollama.generate({
            model: this.settings.ollamaTextGenModel,
            system: this.getEvaluationPrompt(),
            prompt: userMessage,
            format: "json",
            stream: false,
        });
        return response.response;
    }
}