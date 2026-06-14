# Kotodama 🧩

**Kotodama** is a simple, interactive anagram helper designed to help you transform phrases while keeping track of every letter.

Built with performance and user experience in mind, it provides real-time feedback and a clean interface for wordplay.

## ✨ Features

- **Real-time Letter Tracking**: Automatically counts and displays available letters from your starting phrase.
- **Visual Feedback**: Highlights letters as they are used, warning you if you exceed the available count.
- **Persistence**: Your starting phrase, anagram, and notes are automatically saved to `localStorage`.
- **Celebration**: Enjoy a confetti explosion when you successfully complete a full anagram!
- **Notepad**: A dedicated space to jot down ideas, word fragments, or candidate phrases.
- **Accessible**: ARIA labels and roles ensure a better experience for all users.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Celebration**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Linting**: [ESLint](https://eslint.org/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kotodama.git
   cd kotodama
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev`: Start the development server with Hot Module Replacement (HMR).
- `npm run build`: Compile TypeScript and build the project for production.
- `npm run lint`: Run ESLint to check for code quality and style issues.
- `npm run preview`: Locally preview the production build.

## 📝 License

This project is private. See [package.json](package.json) for details.
