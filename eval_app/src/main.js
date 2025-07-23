import './style.css'
import { setupEvaluationApp } from './evaluation.js'

document.querySelector('#app').innerHTML = `
  <div class="evaluation-container">
    <header>
      <h1>Complex Ethical Case Evaluation</h1>
      <p>Please complete the questions for the respective case below.</p>
    </header>
    
    <div id="loading" class="loading">
      <p>Loading evaluation data...</p>
    </div>
    
    <div id="evaluation-content" class="evaluation-content" style="display: none;">
      <div id="progress-bar" class="progress-bar">
        <div id="progress" class="progress"></div>
      </div>
      
      <div class="main-content">
        <div id="side-menu" class="side-menu">
          <h3>Questions</h3>
          <div id="question-list" class="question-list">
            <!-- Question navigation items will be loaded here -->
          </div>
        </div>
        
        <div id="question-container" class="question-container">
          <!-- Questions will be loaded here -->
        </div>
      </div>
      
      <div class="navigation">
        <button id="prev-btn" class="nav-btn" disabled>Previous</button>
        <span id="question-counter">Question 1 of 5</span>
        <button id="next-btn" class="nav-btn">Next</button>
      </div>
      
      <div id="completion-section" class="completion-section" style="display: none;">
        <h2>Evaluation Complete!</h2>
        <p>Thank you for completing the evaluation.</p>
        <button id="download-btn" class="download-btn">Download Results</button>
      </div>
    </div>
  </div>
`

setupEvaluationApp()
