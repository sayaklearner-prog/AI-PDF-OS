# PDF OS 2.0 - Intelligent Document Copilot

PDF OS is a cutting-edge platform designed to revolutionize the way you interact with documents. From AI-powered contract analysis and risk detection to professional PDF editing and dynamic QR code generation, our platform transforms complex documents into actionable insights.

Engineered from scratch with multi-agent orchestration, AI/ML, Featherless, and Band AI.

## Features

- **Intelligent Copilot**: AI assistant that helps you understand, navigate, and edit your documents in real-time.
- **Premium PDF Editing**: Integrated with Apryse WebViewer for professional-grade document manipulation, signatures, and annotations.
- **Human-in-the-Loop AI**: AI proposes actions (like highlighting risk clauses or adding signatures), and physically applies them to the PDF only upon your explicit approval.
- **Contract Analysis**: Automatically extracts executive summaries, highlights risky clauses, and explains legal jargon in plain English.
- **Dynamic Campaign Generation**: Turn documents into edge-streamed QR codes with real-time tracking analytics.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Zustand, Framer Motion
- **PDF Engine**: Apryse WebViewer (Premium PDFtron core)
- **AI Integration**: Custom Multi-Agent Architecture
- **UI Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- An Apryse WebViewer trial/license key (Get one free at [dev.apryse.com](https://dev.apryse.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pdf-os.git
   cd pdf-os
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Configure Environment Variables (if applicable):
   Create a `.env` file based on `.env.example`.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## License

This project is licensed under the MIT License.

## Acknowledgements

- Built by Sayak Mondal
- In collaboration with AI/ML, Featherless, and Band AI.
