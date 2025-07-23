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
      
      <div id="evaluation-container" class="evaluation-container-panels">
        <h3>Evaluation</h3>
        <div class="evaluation-panels">
          <div id="stakeholder-assessment-panel" class="evaluation-panel collapsible-panel collapsed">
            <div class="panel-header" data-panel="stakeholder-assessment">
              <h4>Stakeholder Assessment</h4>
              <span class="panel-toggle">▶</span>
            </div>
            <div class="panel-content" id="stakeholder-assessment-content" style="display: none;">
              <!-- Panel content will go here -->
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
            </div>
          </div>
          
          <div id="concerns-assessment-panel" class="evaluation-panel collapsible-panel collapsed">
            <div class="panel-header" data-panel="concerns-assessment">
              <h4>Concerns Assessment</h4>
              <span class="panel-toggle">▶</span>
            </div>
            <div class="panel-content" id="concerns-assessment-content" style="display: none;">
              <!-- Panel content will go here -->
              <div id="concerns-section" class="concerns-section" style="display: none;">
                <!-- Concerns will be loaded here -->
              </div>
            </div>
          </div>
          
          <div id="outcomes-assessment-panel" class="evaluation-panel collapsible-panel collapsed">
            <div class="panel-header" data-panel="outcomes-assessment">
              <h4>Outcomes Assessment</h4>
              <span class="panel-toggle">▶</span>
            </div>
            <div class="panel-content" id="outcomes-assessment-content" style="display: none;">
              <div id="outcomes-section" class="outcomes-section" style="display: none;">
                <!-- Outcomes will be loaded here -->
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="additional-comments-section" class="additional-comments-section">
        <h4>Additional Comments</h4>
        <textarea 
          id="additional-comments" 
          class="additional-comments-input" 
          placeholder="Please share any additional thoughts, observations, or comments about this case..."
          rows="4">
        </textarea>
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

// Setup collapsible panels functionality
function setupCollapsiblePanels() {
  const panelHeaders = document.querySelectorAll('.panel-header')
  
  panelHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const panelId = header.getAttribute('data-panel')
      const content = document.getElementById(`${panelId}-content`)
      const toggle = header.querySelector('.panel-toggle')
      const panel = header.closest('.collapsible-panel')
      
      if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block'
        toggle.textContent = '▼'
        panel.classList.remove('collapsed')
      } else {
        content.style.display = 'none'
        toggle.textContent = '▶'
        panel.classList.add('collapsed')
      }
    })
  })
}

// Initialize collapsible panels when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupCollapsiblePanels()
})
