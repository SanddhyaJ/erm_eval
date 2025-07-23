# Evaluation App

A modern, responsive web application for conducting evaluations using CSV data sources.

## Features

- **CSV Data Loading**: Automatically loads evaluation questions from CSV files in the `data/` directory
- **Interactive Interface**: Clean, modern UI with progress tracking and navigation
- **Response Collection**: Records user answers with timestamps
- **Data Export**: Downloads user responses as CSV files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Automatic theme switching based on user preferences

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## CSV Data Format

Place your evaluation data in CSV files within the `data/` directory. The expected format is:

```csv
id,question,option_a,option_b,option_c,option_d,correct_answer
1,"What is 2 + 2?","3","4","5","6","B"
2,"Which planet is closest to the Sun?","Venus","Earth","Mercury","Mars","C"
```

### Required Headers:
- `id` - Unique question identifier
- `question` - The question text (can be quoted if it contains commas)
- `option_a`, `option_b`, `option_c`, `option_d` - Multiple choice options
- `correct_answer` - Correct answer (A, B, C, or D)

## Project Structure

```
/
├── data/              # CSV data files
│   └── sample_data.csv
├── src/
│   ├── main.js        # Application entry point
│   ├── evaluation.js  # Evaluation logic and CSV parsing
│   └── style.css      # Modern responsive styling
├── public/            # Static assets
├── index.html         # Main HTML template
└── package.json       # Project configuration
```

## Usage

1. **Load Evaluation**: The app automatically loads CSV data when started
2. **Answer Questions**: Navigate through questions using the Previous/Next buttons
3. **Track Progress**: Visual progress bar shows completion status
4. **Complete Evaluation**: Finish all questions to access the results
5. **Download Results**: Export your responses as a CSV file

## Customization

### Adding New Questions
Simply add new rows to your CSV file in the `data/` directory following the required format.

### Styling
Modify `src/style.css` to customize the appearance. The app includes:
- CSS custom properties for easy theming
- Responsive design breakpoints
- Dark/light mode support

### Functionality
Extend `src/evaluation.js` to add new features like:
- Different question types
- Custom scoring logic
- Additional data validation

## Browser Support

This app works on all modern browsers that support:
- ES6 modules
- CSS custom properties
- Fetch API
- Local file downloads

## License

This project is open source and available under the MIT License.
