import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { openRouterTextGenModels } from "../../../generators/openrouter/openRouterModels";
import { DEFAULT_OPENROUTER_SETTINGS } from "./openRouterConfig";

export const displayOpenRouterSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
    new Setting(containerEl)
        .setName("OpenRouter API key")
        .setDesc("Enter your OpenRouter API key here.")
        .addText(text =>
            text
                .setValue(plugin.settings.openRouterApiKey)
                .onChange(async (value) => {
                    plugin.settings.openRouterApiKey = value.trim();
                    await plugin.saveSettings();
                }).inputEl.type = "password"
        );

    new Setting(containerEl)
        .setName("OpenRouter API base url")
        .setDesc("Enter your OpenRouter API base URL here.")
        .addButton(button =>
            button
                .setClass("clickable-icon")
                .setIcon("rotate-ccw")
                .setTooltip("Restore default")
                .onClick(async () => {
                    plugin.settings.openRouterBaseURL = DEFAULT_OPENROUTER_SETTINGS.openRouterBaseURL;
                    await plugin.saveSettings();
                    refreshSettings();
                })
        )
        .addText(text =>
            text
                .setValue(plugin.settings.openRouterBaseURL)
                .onChange(async (value) => {
                    plugin.settings.openRouterBaseURL = value.trim();
                    await plugin.saveSettings();
                })
        );

    new Setting(containerEl)
        .setName("Generation model")
        .setDesc("Model used for quiz generation.")
        .addDropdown(dropdown =>
            dropdown
                .addOptions(openRouterTextGenModels)
                .setValue(plugin.settings.openRouterTextGenModel)
                .onChange(async (value) => {
                    plugin.settings.openRouterTextGenModel = value;
                    await plugin.saveSettings();
                })
        );
};