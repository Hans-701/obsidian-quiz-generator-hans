import { Setting } from "obsidian";
import QuizGenerator from "../../main";
import { Provider, providers } from "../../generators/providers";

export const displayEvaluationSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
    new Setting(containerEl).setName("Evaluation").setHeading();

    new Setting(containerEl)
        .setName("Evaluation Provider")
        .setDesc("The provider to use for evaluating short/long answer questions.")
        .addDropdown(dropdown =>
            dropdown
                .addOptions(providers)
                .setValue(plugin.settings.evaluationProvider)
                .onChange(async (value) => {
                    plugin.settings.evaluationProvider = value;
                    await plugin.saveSettings();
                    refreshSettings();
                })
        );

    const selectedProvider = plugin.settings.evaluationProvider;

    if (selectedProvider === Provider.OPENROUTER) {
        new Setting(containerEl)
            .setName("OpenRouter Evaluation API Key")
            .setDesc("Your OpenRouter API key. This can be different from the generation key.")
            .addText(text =>
                text
                    .setValue(plugin.settings.evaluationOpenRouterApiKey)
                    .onChange(async (value) => {
                        plugin.settings.evaluationOpenRouterApiKey = value.trim();
                        await plugin.saveSettings();
                    }).inputEl.type = "password"
            );

        new Setting(containerEl)
            .setName("OpenRouter Evaluation Base URL")
            .setDesc("The base URL for the OpenRouter API.")
            .addText(text =>
                text
                    .setValue(plugin.settings.evaluationOpenRouterBaseURL)
                    .onChange(async (value) => {
                        plugin.settings.evaluationOpenRouterBaseURL = value.trim();
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("OpenRouter Evaluation Model")
            .setDesc("Enter any model identifier from OpenRouter for evaluation.")
            .addText(text =>
                text
                    .setValue(plugin.settings.openRouterEvaluationModel)
                    .onChange(async (value) => {
                        plugin.settings.openRouterEvaluationModel = value.trim();
                        await plugin.saveSettings();
                    })
            );
    }
};