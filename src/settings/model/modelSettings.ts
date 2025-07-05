import { Setting } from "obsidian";
import QuizGenerator from "../../main";
import { Provider, providers } from "../../generators/providers";

import displayOpenAISettings from "./openai/openAISettings";
import displayGoogleSettings from "./google/googleSettings";
import displayAnthropicSettings from "./anthropic/anthropicSettings";
import displayPerplexitySettings from "./perplexity/perplexitySettings";
import displayMistralSettings from "./mistral/mistralSettings";
import displayCohereSettings from "./cohere/cohereSettings";
import displayOllamaSettings from "./ollama/ollamaSettings";

// ---- INICIO DE LA CORRECCIÓN ----
import { displayOpenRouterSettings } from "./openrouter/openRouterSettings"; // Corregido: se usan llaves {}
// ---- FIN DE LA CORRECCIÓN ----

const displayModelSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
    new Setting(containerEl).setName("Model").setHeading();

    new Setting(containerEl)
        .setName("Provider")
        .setDesc("Model provider to use for quiz generation.")
        .addDropdown(dropdown =>
            dropdown
                .addOptions(providers)
                .setValue(plugin.settings.provider)
                .onChange(async (value) => {
                    plugin.settings.provider = value;
                    await plugin.saveSettings();
                    refreshSettings();
                })
        );

    switch (plugin.settings.provider) {
        case Provider.OPENAI:
            displayOpenAISettings(containerEl, plugin, refreshSettings);
            break;
        case Provider.GOOGLE:
            displayGoogleSettings(containerEl, plugin, refreshSettings);
            break;
        case Provider.ANTHROPIC:
            displayAnthropicSettings(containerEl, plugin, refreshSettings);
            break;
        case Provider.PERPLEXITY:
            displayPerplexitySettings(containerEl, plugin, refreshSettings);
            break;
        case Provider.MISTRAL:
            displayMistralSettings(containerEl, plugin, refreshSettings);
            break;
        case Provider.COHERE:
            displayCohereSettings(containerEl, plugin, refreshSettings);
            break;
        case Provider.OLLAMA:
            displayOllamaSettings(containerEl, plugin, refreshSettings);
            break;
        case Provider.OPENROUTER:
            displayOpenRouterSettings(containerEl, plugin, refreshSettings);
            break;
    }
};

export default displayModelSettings;