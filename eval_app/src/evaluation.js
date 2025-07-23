class EvaluationApp {
  constructor() {
    this.questions = []
    this.currentQuestionIndex = 0
    this.responses = []
    this.startTime = new Date()
  }

  async loadCSVData() {
    try {
      const response = await fetch('/data/sample_data.csv')
      const csvText = await response.text()
      this.questions = this.parseCSV(csvText)
      return true
    } catch (error) {
      console.error('Error loading CSV data:', error)
      return false
    }
  }

  parseCSV(csvText) {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(header => header.replace(/"/g, ''))
    
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line)
      const question = {}
      headers.forEach((header, index) => {
        question[header] = values[index] || ''
      })
      return question
    })
  }

  parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result.map(value => value.replace(/"/g, ''))
  }

  renderQuestion() {
    const question = this.questions[this.currentQuestionIndex]
    const container = document.getElementById('question-container')
    
    container.innerHTML = `
      <div class="question">
        <h3>Question ${this.currentQuestionIndex + 1}</h3>
        <p class="question-text">${question.question}</p>
        
        <div class="options">
          <label class="option">
            <input type="radio" name="answer" value="A">
            <span>A) ${question.option_a}</span>
          </label>
          <label class="option">
            <input type="radio" name="answer" value="B">
            <span>B) ${question.option_b}</span>
          </label>
          <label class="option">
            <input type="radio" name="answer" value="C">
            <span>C) ${question.option_c}</span>
          </label>
          <label class="option">
            <input type="radio" name="answer" value="D">
            <span>D) ${question.option_d}</span>
          </label>
        </div>
      </div>
    `

    // Restore previous answer if it exists
    const previousResponse = this.responses[this.currentQuestionIndex]
    if (previousResponse) {
      const radio = container.querySelector(`input[value="${previousResponse.selected_answer}"]`)
      if (radio) radio.checked = true
    }

    this.updateProgress()
    this.updateNavigation()
    this.updateSideMenu()
  }

  updateProgress() {
    const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100
    document.getElementById('progress').style.width = `${progress}%`
    document.getElementById('question-counter').textContent = 
      `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`
  }

  updateNavigation() {
    const prevBtn = document.getElementById('prev-btn')
    const nextBtn = document.getElementById('next-btn')
    
    prevBtn.disabled = this.currentQuestionIndex === 0
    
    if (this.currentQuestionIndex === this.questions.length - 1) {
      nextBtn.textContent = 'Complete'
    } else {
      nextBtn.textContent = 'Next'
    }
  }

  saveCurrentResponse() {
    const selectedOption = document.querySelector('input[name="answer"]:checked')
    if (!selectedOption) return false

    const question = this.questions[this.currentQuestionIndex]
    const response = {
      question_id: question.id,
      question_text: question.question,
      selected_answer: selectedOption.value,
      timestamp: new Date().toISOString()
    }

    this.responses[this.currentQuestionIndex] = response
    return true
  }

  nextQuestion() {
    if (!this.saveCurrentResponse()) {
      alert('Please select an answer before proceeding.')
      return
    }

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++
      this.renderQuestion()
    } else {
      this.completeEvaluation()
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--
      this.renderQuestion()
    }
  }

  completeEvaluation() {
    document.getElementById('evaluation-content').style.display = 'none'
    document.getElementById('completion-section').style.display = 'block'
  }

  downloadResults() {
    const results = {
      evaluation_info: {
        start_time: this.startTime.toISOString(),
        completion_time: new Date().toISOString(),
        total_questions: this.questions.length,
        completed_questions: this.responses.length
      },
      responses: this.responses
    }

    // Create CSV content
    const csvContent = this.createResultsCSV(results)
    this.downloadCSV(csvContent, `evaluation_results_${Date.now()}.csv`)
  }

  createResultsCSV(results) {
    const headers = ['question_id', 'question_text', 'selected_answer', 'timestamp']
    const rows = [headers.join(',')]
    
    results.responses.forEach(response => {
      const row = [
        response.question_id,
        `"${response.question_text}"`,
        response.selected_answer,
        response.timestamp
      ]
      rows.push(row.join(','))
    })

    return rows.join('\n')
  }

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  renderSideMenu() {
    const sideMenuContainer = document.getElementById('question-list')
    
    sideMenuContainer.innerHTML = this.questions.map((question, index) => {
      const isAnswered = this.responses[index] ? 'answered' : ''
      const isCurrent = index === this.currentQuestionIndex ? 'current' : ''
      const status = this.responses[index] ? '✓' : ''
      
      return `
        <div class="question-nav-item ${isAnswered} ${isCurrent}" data-question-index="${index}">
          <span class="question-nav-number">Q${index + 1}</span>
          <span class="question-nav-status">${status}</span>
        </div>
      `
    }).join('')

    // Add click listeners to navigation items
    sideMenuContainer.querySelectorAll('.question-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const questionIndex = parseInt(e.currentTarget.getAttribute('data-question-index'))
        this.navigateToQuestion(questionIndex)
      })
    })
  }

  navigateToQuestion(index) {
    if (index >= 0 && index < this.questions.length) {
      // Save current response before navigating
      this.saveCurrentResponse()
      
      this.currentQuestionIndex = index
      this.renderQuestion()
      this.updateSideMenu()
    }
  }

  updateSideMenu() {
    const items = document.querySelectorAll('.question-nav-item')
    
    items.forEach((item, index) => {
      // Remove current class from all items
      item.classList.remove('current')
      
      // Add current class to active question
      if (index === this.currentQuestionIndex) {
        item.classList.add('current')
      }
      
      // Update answered status
      if (this.responses[index]) {
        item.classList.add('answered')
        item.querySelector('.question-nav-status').textContent = '✓'
      } else {
        item.classList.remove('answered')
        item.querySelector('.question-nav-status').textContent = ''
      }
    })
  }
}

export async function setupEvaluationApp() {
  const app = new EvaluationApp()
  
  // Load data
  const dataLoaded = await app.loadCSVData()
  
  if (!dataLoaded) {
    document.getElementById('loading').innerHTML = `
      <p style="color: red;">Error loading evaluation data. Please check if the CSV file exists in the data/ directory.</p>
    `
    return
  }

  // Hide loading and show content
  document.getElementById('loading').style.display = 'none'
  document.getElementById('evaluation-content').style.display = 'block'

  // Render first question
  app.renderQuestion()
  app.renderSideMenu()

  // Setup event listeners
  document.getElementById('next-btn').addEventListener('click', () => app.nextQuestion())
  document.getElementById('prev-btn').addEventListener('click', () => app.previousQuestion())
  document.getElementById('download-btn').addEventListener('click', () => app.downloadResults())
}
