# Quiz Generator

[![GitHub Downloads](https://img.shields.io/github/downloads/ECuiDev/obsidian-quiz-generator/total?labelColor=21262d&color=238636&logo=github&style=for-the-badge)](https://github.com/ECuiDev/obsidian-quiz-generator/releases) [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?labelColor=21262d&color=%23483699&label=downloads&query=%24%5B%22quiz-generator%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&logo=obsidian&style=for-the-badge)](https://github.com/ECuiDev/obsidian-quiz-generator/releases) [![Release](https://img.shields.io/github/v/release/ECuiDev/obsidian-quiz-generator?display_name=tag&labelColor=21262d&color=1f6feb&style=for-the-badge)](https://github.com/ECuiDev/obsidian-quiz-generator/releases/latest)

**Quiz Generator** is a plugin for [Obsidian](https://obsidian.md/) that leverages the power of various AI models to generate interactive, exam-style questions from your notes. Whether you're a student preparing for exams or an educator designing assessments, this plugin streamlines the question creation process.

## Demo

https://github.com/user-attachments/assets/22770da4-af69-412c-ae05-1aae0fff4a10

## Features

- **Personalized Quizzes:** Choose any combination of notes and folders to use as the quiz content.
- **Flexible Generation:** Select the types and number of questions to generate according to your needs.
- **Multiple Question Types:** Supports true or false, multiple choice, select all that apply, fill in the blank, matching, short answer, and long answer.
- **Intelligent Evaluation System:** Instead of a simple text comparison, short and long answer questions are evaluated by an AI provider of your choice (OpenAI, Google, OpenRouter, etc.), providing a percentage score and detailed feedback.
- **Custom Quiz UI:** Answer questions in an interactive UI that provides real-time feedback on your responses.
- **Exam Mode:** Take quizzes under timed conditions with a final score and detailed results breakdown at the end.
- **Question Saving:** Save questions in various formats.
  - Inline and multiline flashcards compatible with [obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition).
  - Markdown callouts for easy integration into your notes.
- **Review and Create:** Review saved questions using the quiz UI or create your own questions from scratch without ever using the generator.
- **Multi-Language Support:** Generate questions in 22 different languages.
- **Math Support:** Generate questions from notes containing LaTeX.

## 🚀 ¡Nuevo! Modo Examen

¡Pon a prueba tus conocimientos con el nuevo **Modo Examen**! Esta función transforma cualquier cuestionario en una verdadera evaluación, ideal para prepararse para exámenes reales.

- **Evaluación Final:** Responde todas las preguntas sin recibir retroalimentación inmediata. Al finalizar, obtendrás una puntuación total y un desglose detallado de tus aciertos y errores.
- **Límite de Tiempo:** Desde el menú de configuración, puedes establecer un límite de tiempo en minutos. Si el tiempo se agota, el examen finalizará automáticamente y se calificarán las respuestas que hayas completado.
- **Resultados Detallados:** Al terminar, una ventana emergente te mostrará tu puntuación, tus respuestas, las respuestas correctas y el feedback de la IA para las preguntas abiertas.
- **Guardado de Resultados:** Con un solo clic, puedes guardar un informe completo del examen en formato Markdown en la carpeta que elijas.

## ✨ New Features Implemented

We've added a series of quality-of-life improvements to make quiz generation more powerful, customizable, and efficient!

### 📝 Custom File Names for Your Quizzes

Say goodbye to generic names like "Quiz 1"! Now, right before generating a new quiz, the plugin will prompt you to give it a **unique name**. The saved `.md` file will use this name, allowing you to organize and find your quizzes much more intuitively.

### 🧠 Embedded Note Detection and Inclusion

Do you use embed links like `![[Another Note]]` to organize your knowledge? Now the plugin is smarter!

- **Automatic Detection:** When you add a note for quiz generation, the plugin will scan its content and **automatically detect all the notes you have embedded** within it.
    
- **Interactive Selection:** You will be presented with a modal window so you can **choose which of those embedded notes you want to add** to the quiz context. This gives you granular control over your study material, allowing you to easily include related information.
    

### ⚙️ Token Optimization and Efficient Processing

We have improved the plugin's internal engine to be smarter and more efficient with token usage, which translates to cost savings and higher quality questions.

- **Advanced Markdown Cleaning:** Before sending your notes to the AI, we now remove formatting elements that don't add semantic value, such as color HTML tags (`<font>`). This reduces "noise" and allows the AI to focus on what really matters: the content of your notes.

## Supported Providers

You can use any of the following providers for both **quiz generation** and **answer evaluation**:

- **[OpenAI](https://openai.com/):** Advanced models for high-quality question generation.
- **[Google](https://ai.google.dev/):** Powerful models with a large context window.
- **[Anthropic](https://www.anthropic.com/):** Optimized for thoughtful and contextually aware outputs.
- **[Perplexity](https://www.perplexity.ai/):** Fine-tuned LLaMA models for robust question generation.
- **[Mistral](https://mistral.ai/):** Lightweight models for fast and efficient processing.
- **[Cohere](https://cohere.com/):** Strengths in generating coherent questions.
- **[Ollama](https://ollama.com/):** Local LLMs for enhanced privacy and offline processing.
- **[OpenRouter](https://openrouter.ai/):** A unified API to access dozens of models from different providers, offering maximum flexibility.

## Usage

### Installation

This plugin is now available in the **Community plugins** page in Obsidian.

1.  Install the plugin from the **Community plugins** page in Obsidian.
    -   **Settings** → **Community plugins** → **Browse**.
    -   Search for `Quiz Generator`.
    -   Select the plugin to open its page and then select **Install**.
    -   Select **Enable** on the plugin page or go back to the **Community plugins** page and toggle the switch.
2.  Open the plugin settings. Under the **Model** section, enter your API key for the provider you want to use for **quiz generation**.
3.  Go to the new **Evaluation** section. Select the provider you want to use for **grading answers** and configure its settings.
4.  Under the **Saving** section, you can now configure the **Exam Mode** settings, including enabling the feature, setting a time limit, and choosing a folder for the results.
5.  Configure the other settings as desired.

### Generation

- Open the command palette and select "Quiz Generator: Open generator" or select the [brain-circuit](https://lucide.dev/icons/brain-circuit) icon in the left sidebar.
- Select the [file](https://lucide.dev/icons/file-plus-2) and [folder](https://lucide.dev/icons/folder-plus) icons to add notes and folders.
  - Adding a folder adds all the notes inside it, as well as any notes in its subfolders (can be changed in the settings). If you select an extremely large folder (thousands of files and hundreds of subfolders), it could take a few seconds for it to be added.
- Select the [eye](https://lucide.dev/icons/eye) icon to view the contents of selected notes and folders.
- Select the [x](https://lucide.dev/icons/x) icon to remove individual notes or folders and the [book](https://lucide.dev/icons/book-x) icon to remove everything.
- Once you've added your notes and/or folders, select the [webhook](https://lucide.dev/icons/webhook) icon to generate the questions.
  - The quiz UI will open automatically when the generation is complete.

### Taking a Quiz

- When opening a quiz (either newly generated or from a file), a modal will ask if you want to use **Normal Mode** or **Exam Mode**.
  - **Normal Mode:** Provides immediate feedback after each question.
  - **Exam Mode:** Hides feedback until the end, where you receive a final score and a complete review.

### Saving

- Saved questions will be in a Markdown file named after the quiz in the folder specified by the "Save location" setting.
- Saved exam results will be in a separate Markdown file in the folder specified in the "Exam Mode" settings.
- Select the [save](https://lucide.dev/icons/save) icon to save the current question.
- Select the [save-all](https://lucide.dev/icons/save-all) icon to save all questions.

### Reviewing Saved Quizzes

- Open the command palette and select "Quiz Generator: Open quiz from active note" or right-click a note in the file explorer and select "Open quiz from this note" in the file menu.

### Manually Creating or Modifying Questions

If you want to write your own questions from scratch or modify any saved questions, they must follow the format below to be opened in the quiz UI. However, deviations in spacing and capitalization are okay (the parser is case-insensitive and ignores whitespace).

Text enclosed by {curly braces} is required but can be anything. Text enclosed by &lt;angle brackets&gt; is optional and can be anything. Any other text (not enclosed by either) should be written as shown. You are allowed to make any of the callouts foldable by adding a plus (+) or minus (-). For spaced repetition, you are allowed to bold or italicize the question type identifier using any combination of asterisks and underscores.

#### True or False Format

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> One of true or false

> [!question] HTML is a programming language.
>> [!success]- Answer
>> False
```

**Spaced Repetition**
```
True or False: {Insert your question here} Insert inline separator you chose in the settings One of true or false

True or False: HTML is a programming language. :: False
```

#### Multiple Choice Format

Supports up to 26 choices, denoted by the 26 letters of the English alphabet. You should use the letters in alphabetical order starting from "a". The example below uses 4 choices.

**Callout**
```
> [!question] {Insert your question here}
> a) {Choice 1}
> b) {Choice 2}
> c) {Choice 3}
> d) {Choice 4}
>> [!success] <Answer>
>> One of a), b), c), etc. <text of the correct choice>

> [!question] Which of the following is the correct translation of house in Spanish?
> a) Casa
> b) Maison
> c) Haus
> d) Huis
>> [!success]- Answer
>> a) Casa
```

**Spaced Repetition**
```
Multiple Choice: {Insert your question here}
a) {Choice 1}
b) {Choice 2}
c) {Choice 3}
d) {Choice 4}
Insert multiline separator you chose in the settings
One of a), b), c), etc. <text of the correct choice>

Multiple Choice: Which of the following is the correct translation of house in Spanish?
a) Casa
b) Maison
c) Haus
d) Huis
?
a) Casa
```

#### Select All That Apply Format

Supports up to 26 choices, denoted by the 26 letters of the English alphabet. There must be at least 2 correct answers or this will be treated as a multiple choice question by the quiz UI. You should use the letters in alphabetical order starting from "a". The example below uses 5 choices.

**Callout**
```
> [!question] {Insert your question here}
> a) {Choice 1}
> b) {Choice 2}
> c) {Choice 3}
> d) {Choice 4}
> e) {Choice 5}
>> [!success] <Answer>
>> One of a), b), c), etc. <text of the correct choice>
>> One of a), b), c), etc. <text of the correct choice>

> [!question] Which of the following are elements on the periodic table?
> a) Oxygen
> b) Water
> c) Hydrogen
> d) Salt
> e) Carbon
>> [!success]- Answer
>> a) Oxygen
>> c) Hydrogen
>> e) Carbon
```

**Spaced Repetition**
```
Select All That Apply: {Insert your question here}
a) {Choice 1}
b) {Choice 2}
c) {Choice 3}
d) {Choice 4}
e) {Choice 5}
Insert multiline separator you chose in the settings
One of a), b), c), etc. <text of the correct choice>
One of a), b), c), etc. <text of the correct choice>

Select All That Apply: Which of the following are elements on the periodic table?
a) Oxygen
b) Water
c) Hydrogen
d) Salt
e) Carbon
?
a) Oxygen
c) Hydrogen
e) Carbon
```

#### Fill in the Blank Format

Supports an infinite number of blanks. The question must contain at least 1 blank, represented as one or more underscores enclosed by backticks. The answer(s) should appear in the same order as the blank(s) they correspond to. So the first answer corresponds to the first blank, the second answer to the second blank, and so on.

The answer(s) to the blank(s) must be separated by commas with at least 1 space after the comma. This spacing condition exists because it allows the parser to recognize the entirety of a large number as a single answer (since numbers greater than 3 digits typically have commas).

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> Comma separated list of answer(s)

> [!question] The Battle of `____` was fought in `____`.
>> [!success]- Answer
>> Gettysburg, 1863
```

**Spaced Repetition**
```
Fill in the Blank: {Insert your question here} Insert inline separator you chose in the settings Comma separated list of answer(s)

Fill in the Blank: The Battle of `____` was fought in `____`. :: Gettysburg, 1863
```

#### Matching Format

Supports up to 13 pairs (i.e. 26 choices total, 13 on each "side"). The first group should use letters a to m and the second group should use letters n to z. Both groups should use the letters in alphabetical order. The answer to a pair is represented as a letter from the first group followed by a letter from the second group, separated by an arrow (one or more hyphens followed by a right angle bracket). The letter from the first group must come first, but you may list the pairs in any order. The example below uses 4 pairs.

**Callout**
```
> [!question] {Insert your question here}
>> [!example] <Group A>
>> a) {Choice 1}
>> b) {Choice 2}
>> c) {Choice 3}
>> d) {Choice 4}
>
>> [!example] <Group B>
>> n) {Choice 5}
>> o) {Choice 6}
>> p) {Choice 7}
>> q) {Choice 8}
>
>> [!success] <Answer>
>> One of a), b), c), etc. -> One of n), o), p), etc.
>> One of a), b), c), etc. -> One of n), o), p), etc.
>> One of a), b), c), etc. -> One of n), o), p), etc.
>> One of a), b), c), etc. -> One of n), o), p), etc.

> [!question] Match the medical term to its definition.
>> [!example] Group A
>> a) Hypertension
>> b) Bradycardia
>> c) Tachycardia
>> d) Hypotension
>
>> [!example] <Group B>
>> n) Fast heart rate
>> o) High blood pressure
>> p) Low blood pressure
>> q) Slow heart rate
>
>> [!success]- Answer
>> a) -> o)
>> b) -> q)
>> c) -> n)
>> d) -> p)
```

**Spaced Repetition**
```
Matching: {Insert your question here}
{Group A}
a) {Choice 1}
b) {Choice 2}
c) {Choice 3}
d) {Choice 4}
{Group B}
n) {Choice 5}
o) {Choice 6}
p) {Choice 7}
q) {Choice 8}
Insert multiline separator you chose in the settings
One of a), b), c), etc. -> One of n), o), p), etc.
One of a), b), c), etc. -> One of n), o), p), etc.
One of a), b), c), etc. -> One of n), o), p), etc.
One of a), b), c), etc. -> One of n), o), p), etc.

Matching: Match the medical term to its definition.
Group A
a) Hypertension
b) Bradycardia
c) Tachycardia
d) Hypotension
Group B
n) Fast heart rate
o) High blood pressure
p) Low blood pressure
q) Slow heart rate
?
a) -> o)
b) -> q)
c) -> n)
d) -> p)
```

#### Short Answer Format

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> {Insert answer here}

> [!question] Who was the first President of the United States and what is he commonly known for?
>> [!success]- Answer
>> George Washington was the first President of the United States and is commonly known for leading the American Revolutionary War and serving two terms as president.
```

**Spaced Repetition**
```
Short Answer: {Insert your question here} Insert inline separator you chose in the settings {Insert answer here}

Short Answer: Who was the first President of the United States and what is he commonly known for? :: George Washington was the first President of the United States and is commonly known for leading the American Revolutionary War and serving two terms as president.
```

#### Long Answer Format

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> {Insert answer here}

> [!question] Explain the difference between a stock and a bond, and discuss the risks and potential rewards associated with each investment type.
>> [!success]- Answer
>> A stock represents ownership in a company and a claim on part of its profits. The potential rewards include dividends and capital gains if the company's value increases, but the risks include the possibility of losing the entire investment if the company fails. A bond is a loan made to a company or government, which pays interest over time and returns the principal at maturity. Bonds are generally considered less risky than stocks, as they provide regular interest payments and the return of principal, but they offer lower potential returns.
```

**Spaced Repetition**
```
Long Answer: {Insert your question here} Insert inline separator you chose in the settings {Insert answer here}

Long Answer: Explain the difference between a stock and a bond, and discuss the risks and potential rewards associated with each investment type. :: A stock represents ownership in a company and a claim on part of its profits. The potential rewards include dividends and capital gains if the company's value increases, but the risks include the possibility of losing the entire investment if the company fails. A bond is a loan made to a company or government, which pays interest over time and returns the principal at maturity. Bonds are generally considered less risky than stocks, as they provide regular interest payments and the return of principal, but they offer lower potential returns.
```

## Coming Soon

I'm actively working on bringing more features and improvements to Quiz Generator. Stay tuned for the following updates:

### Next Release

- **Feature Requests:** [#16](https://github.com/ECuiDev/obsidian-quiz-generator/issues/16), [#17](https://github.com/ECuiDev/obsidian-quiz-generator/issues/17), [#21](https://github.com/ECuiDev/obsidian-quiz-generator/issues/21), [#22](https://github.com/ECuiDev/obsidian-quiz-generator/issues/22).
- **Chunking:** Automatically break down long notes into smaller segments. Intended to fix [#19](https://github.com/ECuiDev/obsidian-quiz-generator/issues/19) and [#20](https://github.com/ECuiDev/obsidian-quiz-generator/issues/20).
- **Note Links:** Adding a note also adds outgoing links and backlinks.

## Issues and Feature Requests

If you encounter any errors or have feature requests, please open an issue on the [GitHub repository](https://github.com/ECuiDev/obsidian-quiz-generator/issues).

## Tips

- Button Border Meanings
  - Solid Green Border: Correct option you selected.
  - Solid Red Border: Incorrect option you selected.
  - Dashed Green Border: Correct option you didn't select.
- Matching Question UI Breakdown
  - To create a pair, select a button from either column and then select a button from the other column. The UI will connect the buttons by displaying the same number in their respective circles.
    - If you select an unpaired button and then select a paired button from the other column, the pair will update to match the new selection.
  - To remove a pair, double-click on the paired button (either left or right).
