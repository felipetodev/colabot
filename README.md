# ColaBOT: AI assistant for VS Code <img width="50" height="50" src="./assets/icon.png" alt="colabot" />

**ColaBOT is an AI assistant** for Visual Studio Code that helps you write code faster and more efficiently. With ColaBOT, you can ask questions about your code, get explanations for complex concepts, and generate code snippets based on your input.

## Features

- ColaBOT Chat (NEW UI ✨✨✨).
- ColaBOT Chat shortcuts commands: Explain code, Fix code, Docs generator & Test generator (NEW ✨✨✨).
- Set API Key: Set your API key for ColaBOT.
- Remove API Key: Remove your API key for ColaBOT.
- AI Commits: Use AI to commit your code changes.

## Requirements

- Visual Studio Code version 1.75.0 or higher.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Search for **"ColaBOT"** in the search bar.
4. Click on the "Install" button for the ColaBOT extension.
5. Once the installation is complete, you will be prompted to reload Visual Studio Code.

## Usage

To use ColaBOT, you must first set your API key. To do this, press `Ctrl+Shift+P` to open the Command Palette, and search for "ColaBOT: Set API Key" in the command palette to set your OpenAI API key (completely safe and secure).

Once your API key is set, you can start using the next features:

## ColaBOT Chat (NEW ✨)

- ColaBOT Chat tool allows you to quickly resolve any doubts related to programming or other topics while working on your code.

## Shortcuts (Explain, Fix, Docs, Test)

- When selecting code and right-clicking on the selection, you can access shortcuts that will help you quickly execute the functionality you need and get a response in your ColBOT Chat.

## AI Commits

- To use AI to commit your code, run the "AI Commit" command (under the "ColaBOT (Git)" category). ColaBOT will generate a commit message using AI, and you can choose whether to use gitmoji and/or semantic versioning in your commit.

![](./assets/aiCommits.gif)

## Configuration

You can configure ColaBOT by going to File > Preferences > Settings, and searching for "ColaBOT". Here, you can set the following options:

- API Key: Set your API key and IA provider for ColaBOT (default: OpenAI).
- Organization ID: Set your organization ID for OpenAI models that require it (NEW ✨✨✨).
- Model: The model to use for ColaBOT.
- Max Tokens: The maximum number of tokens to generate.
- Temperature: The temperature of the model (between 0 and 1).
- Git Moji: Whether to use gitmoji in your SemVer commits
- Semantic Versioning Specification: Whether to use semantic versioning specification in your commits

![](./assets/config.gif)

## License

This extension is licensed under the [MIT License](LICENSE).

## Inspiration

This project was inspired by:

- [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)

**This README was generated by ColaBOT 🤖**
