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
        <span id="question-counter">Case 1 of 1</span>
        <button id="next-btn" class="nav-btn">Next</button>
      </div>
      
      <div id="stakeholders-section" class="stakeholders-section">
        <h4>Select stakeholders involved in this case:</h4>
        <div id="stakeholders-options" class="stakeholders-options">
          <!-- Stakeholder options will be loaded here -->
        </div>
      </div>
      

      <div id="ranking-section" class="ranking-section">
        <h4>Rank stakeholders by <span class="ranking-term">level of involvement</span>:</h4>
        <p class="ranking-instructions">💡 Click and drag the stakeholder items below to reorder them from most involved (top) to least involved (bottom)</p>
        <div id="ranking-container" class="ranking-container">
          <!-- Ranking items will be loaded here -->
        </div>
      </div>
      
      <div id="decision-power-section" class="ranking-section">
        <h4>Rank stakeholders by <span class="ranking-term">decision-making power</span>:</h4>
        <p class="ranking-instructions">💡 Click and drag the stakeholder items below to reorder them from most power (top) to least power (bottom)</p>
        <div id="decision-power-container" class="ranking-container">
          <!-- Ranking items will be loaded here -->
        </div>
      </div>
      
      <div id="ethical-complexity-section" class="ranking-section">
        <h4>Rank stakeholders by <span class="ranking-term">ethical complexity</span>:</h4>
        <p class="ranking-instructions">💡 Click and drag the stakeholder items below to reorder them from most complex (top) to least complex (bottom)</p>
        <div id="ethical-complexity-container" class="ranking-container">
          <!-- Ethical complexity ranking items will be loaded here -->
        </div>
      </div>
      
      <div id="outcomes-section" class="outcomes-section" style="display: none;">
        <!-- Outcomes will be loaded here -->
      </div>
      
      <div id="concerns-section" class="concerns-section" style="display: none;">
        <!-- Concerns will be loaded here -->
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
