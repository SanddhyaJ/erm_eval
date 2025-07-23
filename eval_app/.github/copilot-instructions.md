<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Evaluation App - Copilot Instructions

This is a web-based evaluation application built with Vite and vanilla JavaScript.

## Project Structure
- `/data/` - Contains CSV files with evaluation questions and data
- `/src/evaluation.js` - Main evaluation logic and CSV parsing
- `/src/main.js` - Application entry point
- `/src/style.css` - Modern, responsive styling

## Key Features
- CSV data loading and parsing
- Interactive evaluation interface with progress tracking
- Response collection and CSV download functionality
- Clean, modern UI with dark/light mode support

## Development Guidelines
- Keep the code modular and well-documented
- Maintain responsive design principles
- Follow accessibility best practices
- Use semantic HTML and meaningful class names
- Ensure CSV parsing handles quoted strings and commas properly

## CSV Format Expected
The app expects CSV files in the `/data/` directory with headers:
- `id` - Question identifier
- `question` - Question text
- `option_a`, `option_b`, `option_c`, `option_d` - Multiple choice options
- `correct_answer` - Correct answer (A, B, C, or D)
