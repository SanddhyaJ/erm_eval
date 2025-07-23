class EvaluationApp {
  constructor() {
    this.questions = []
    this.stakeholders = []
    this.currentQuestionIndex = 0
    this.responses = []
    this.startTime = new Date()
  }

  async loadCSVData() {
    try {
      // Load overview data
      const overviewResponse = await fetch('/data/overview.csv')
      const overviewText = await overviewResponse.text()
      this.questions = this.parseCSV(overviewText)
      
      // Load stakeholders data
      const stakeholdersResponse = await fetch('/data/stakeholders.csv')
      const stakeholdersText = await stakeholdersResponse.text()
      this.stakeholders = this.parseCSV(stakeholdersText)
      
      return true
    } catch (error) {
      console.error('Error loading CSV data:', error)
      return false
    }
  }

  parseCSV(csvText) {
    const result = []
    const lines = csvText.split('\n')
    const headers = this.parseCSVLine(lines[0])
    
    let i = 1
    while (i < lines.length) {
      if (lines[i].trim() === '') {
        i++
        continue
      }
      
      const row = this.parseCSVRow(lines, i)
      if (row.values.length > 0) {
        const rowData = {}
        headers.forEach((header, index) => {
          rowData[header] = row.values[index] || ''
        })
        result.push(rowData)
      }
      i = row.nextIndex
    }
    
    return result
  }

  parseCSVRow(lines, startIndex) {
    let currentLine = startIndex
    let fullRow = lines[currentLine]
    
    // Check if this row has unclosed quotes
    let quoteCount = (fullRow.match(/"/g) || []).length
    
    // If odd number of quotes, we need to continue to next lines
    while (quoteCount % 2 !== 0 && currentLine + 1 < lines.length) {
      currentLine++
      fullRow += '\n' + lines[currentLine]
      quoteCount += (lines[currentLine].match(/"/g) || []).length
    }
    
    return {
      values: this.parseCSVLine(fullRow),
      nextIndex: currentLine + 1
    }
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
        result.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim().replace(/^"|"$/g, ''))
    return result
  }

  renderQuestion() {
    const caseData = this.questions[this.currentQuestionIndex]
    const container = document.getElementById('question-container')
    
    // Ensure we have the summary content and format it with proper line breaks
    const summaryText = (caseData.Summary || '').replace(/\n/g, '<br>')
    
    container.innerHTML = `
      <div class="case-description">
        <h3>Case ${caseData['Case']}: ${caseData.Title}</h3>
        <div class="case-summary">
${summaryText}
        </div>
      </div>
    `

    this.updateProgress()
    this.updateNavigation()
    this.updateSideMenu()
    this.renderStakeholders()
  }

  updateProgress() {
    const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100
    document.getElementById('progress').style.width = `${progress}%`
    const currentCase = this.questions[this.currentQuestionIndex]
    document.getElementById('question-counter').textContent = 
      `Case ${currentCase['Case']} of ${this.questions.length}`
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
    
    // Group cases by category
    const categorizedCases = this.questions.reduce((acc, caseData, index) => {
      const category = caseData['Category'].trim()
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({ caseData, index })
      return acc
    }, {})

    sideMenuContainer.innerHTML = Object.entries(categorizedCases).map(([category, cases]) => {
      const categoryId = category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
      
      return `
        <div class="category-section">
          <div class="category-header" data-category="${categoryId}">
            <span class="category-title">${category}</span>
            <span class="category-toggle">▼</span>
          </div>
          <div class="category-content" id="category-${categoryId}">
            ${cases.map(({ caseData, index }) => {
              const isCurrent = index === this.currentQuestionIndex ? 'current' : ''
              
              return `
                <div class="question-nav-item ${isCurrent}" data-question-index="${index}">
                  <span class="question-nav-number">Case ${caseData['Case']}</span>
                </div>
              `
            }).join('')}
          </div>
        </div>
      `
    }).join('')

    // Add click listeners to category headers for collapsing/expanding
    sideMenuContainer.querySelectorAll('.category-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const categoryId = e.currentTarget.getAttribute('data-category')
        const content = document.getElementById(`category-${categoryId}`)
        const toggle = e.currentTarget.querySelector('.category-toggle')
        
        if (content.classList.contains('collapsed')) {
          content.classList.remove('collapsed')
          toggle.textContent = '▼'
        } else {
          content.classList.add('collapsed')
          toggle.textContent = '▶'
        }
      })
    })

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
      const itemIndex = parseInt(item.getAttribute('data-question-index'))
      
      // Remove current class from all items
      item.classList.remove('current')
      
      // Add current class to active case
      if (itemIndex === this.currentQuestionIndex) {
        item.classList.add('current')
      }
    })
  }

  renderStakeholders() {
    const caseData = this.questions[this.currentQuestionIndex]
    const stakeholdersContainer = document.getElementById('stakeholders-options')
    
    // Get stakeholders for this case
    const caseStakeholders = this.stakeholders.filter(stakeholder => 
      stakeholder.Case === caseData['Case']
    )
    
    stakeholdersContainer.innerHTML = caseStakeholders.map((stakeholder, index) => `
      <label class="stakeholder-option">
        <input type="checkbox" name="stakeholders" value="${stakeholder.Stakeholder}" id="stakeholder-${index}">
        <span>${stakeholder.Stakeholder}</span>
      </label>
    `).join('')
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
