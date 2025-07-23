class EvaluationApp {
  constructor() {
    this.questions = []
    this.stakeholders = []
    this.concerns = []
    this.outcomes = []
    this.currentQuestionIndex = 0
    this.responses = []
    this.startTime = new Date()
    this.selectedStakeholders = new Map() // Store selections per case
    this.stakeholderRankings = new Map() // Store rankings per case
    this.decisionPowerRankings = new Map() // Store decision power rankings per case
    this.ethicalComplexityRankings = new Map() // Store ethical complexity rankings per case
    this.concernsResponses = new Map() // Store concerns responses per case
    this.outcomesResponses = new Map() // Store outcomes responses per case
  }

  async loadCSVData() {
    try {
      // Load overview data
      const overviewResponse = await fetch('public/data/overview.csv')
      const overviewText = await overviewResponse.text()
      this.questions = this.parseCSV(overviewText)
      
      // Load stakeholders data
      const stakeholdersResponse = await fetch('/public/data/stakeholders.csv')
      const stakeholdersText = await stakeholdersResponse.text()
      this.stakeholders = this.parseCSV(stakeholdersText)
      
      // Load concerns data
      const concernsResponse = await fetch('/public/data/concerns.csv')
      const concernsText = await concernsResponse.text()
      this.concerns = this.parseCSV(concernsText)
      
      // Load outcomes data
      const outcomesResponse = await fetch('/public/data/outcomes.csv')
      const outcomesText = await outcomesResponse.text()
      this.outcomes = this.parseCSV(outcomesText)
      
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
    this.renderConcerns()
    this.renderOutcomes()
    this.renderRanking()
    this.renderDecisionPowerRanking()
    this.renderEthicalComplexityRanking()
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
    const caseData = this.questions[this.currentQuestionIndex]
    const caseId = caseData['Case']
    
    // Get stakeholder selections and rankings
    const selectedStakeholders = Array.from(this.selectedStakeholders.get(caseId) || [])
    const stakeholderRanking = this.stakeholderRankings.get(caseId) || []
    const decisionPowerRanking = this.decisionPowerRankings.get(caseId) || []
    const ethicalComplexityRanking = this.ethicalComplexityRankings.get(caseId) || []

    // Get concerns responses for this case
    const concernsResponses = this.concernsResponses.get(caseId) || new Map()
    const concernsData = Array.from(concernsResponses.entries()).map(([concern, response]) => {
      return `${concern}: ${response.isConcern ? 'Yes' : 'No'}${response.isConcern ? ` (Severity: ${this.getSeverityText(response.severity)})` : ''}`
    }).join(' | ')

    // Get outcomes responses for this case
    const outcomesResponses = this.outcomesResponses.get(caseId) || new Set()
    const outcomesData = Array.from(outcomesResponses).join(' | ')

    // Get additional comments
    const additionalComments = document.getElementById('additional-comments')?.value || ''

    const response = {
      case_id: caseId,
      case_title: caseData.Title,
      case_category: caseData['Category'],
      selected_stakeholders: selectedStakeholders,
      stakeholder_ranking: stakeholderRanking,
      decision_power_ranking: decisionPowerRanking,
      ethical_complexity_ranking: ethicalComplexityRanking,
      concerns_data: concernsData,
      outcomes_data: outcomesData,
      additional_comments: additionalComments,
      timestamp: new Date().toISOString()
    }

    this.responses[this.currentQuestionIndex] = response
    return true
  }

  nextQuestion() {
    // Always save current response (no validation needed for stakeholder selection)
    this.saveCurrentResponse()

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
    console.log('Completing evaluation...')
    const evaluationContainer = document.getElementById('evaluation-container')
    const completionSection = document.getElementById('completion-section')
    
    console.log('Evaluation container element:', evaluationContainer)
    console.log('Completion section element:', completionSection)
    
    if (evaluationContainer) {
      evaluationContainer.style.display = 'none'
      console.log('Hidden evaluation container')
    }
    
    if (completionSection) {
      completionSection.style.display = 'block'
      completionSection.style.visibility = 'visible'
      completionSection.style.opacity = '1'
      completionSection.style.position = 'relative'
      completionSection.style.zIndex = '9999'
      
      // Check position and dimensions
      const rect = completionSection.getBoundingClientRect()
      console.log('Completion section position and size:', {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right
      })
      
      // Scroll to the completion section
      completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      console.log('Showing completion section')
      console.log('Completion section styles:', window.getComputedStyle(completionSection))
    } else {
      console.error('Completion section not found!')
    }
    
    console.log('Completion section should now be visible')
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
    const headers = ['case_id', 'case_title', 'case_category', 'selected_stakeholders', 'stakeholder_ranking', 'decision_power_ranking', 'ethical_complexity_ranking', 'concerns_data', 'outcomes_data', 'additional_comments', 'timestamp']
    const rows = [headers.join(',')]
    
    results.responses.forEach(response => {
      const row = [
        response.case_id,
        `"${response.case_title}"`,
        `"${response.case_category}"`,
        `"${response.selected_stakeholders.join('; ')}"`,
        `"${response.stakeholder_ranking.join('; ')}"`,
        `"${response.decision_power_ranking.join('; ')}"`,
        `"${response.ethical_complexity_ranking.join('; ')}"`,
        `"${response.concerns_data}"`,
        `"${response.outcomes_data}"`,
        `"${(response.additional_comments || '').replace(/"/g, '""')}"`,
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
    const caseId = caseData['Case']
    
    // Get stakeholders for this case
    const caseStakeholders = this.stakeholders.filter(stakeholder => 
      stakeholder.Case === caseId
    )
    
    // Get previously selected stakeholders for this case
    const selectedStakeholders = this.selectedStakeholders.get(caseId) || new Set()
    
    stakeholdersContainer.innerHTML = caseStakeholders.map((stakeholder, index) => {
      const isSelected = selectedStakeholders.has(stakeholder.Stakeholder)
      return `
        <label class="stakeholder-option ${isSelected ? 'selected' : ''}">
          <input type="checkbox" 
                 name="stakeholders" 
                 value="${stakeholder.Stakeholder}" 
                 id="stakeholder-${index}"
                 ${isSelected ? 'checked' : ''}>
          <span>${stakeholder.Stakeholder}</span>
        </label>
      `
    }).join('')

    // Add event listeners to stakeholder checkboxes
    stakeholdersContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.handleStakeholderSelection(e)
      })
    })
  }

  handleStakeholderSelection(event) {
    const caseId = this.questions[this.currentQuestionIndex]['Case']
    const stakeholder = event.target.value
    const isSelected = event.target.checked
    
    // Get or create the set of selected stakeholders for this case
    if (!this.selectedStakeholders.has(caseId)) {
      this.selectedStakeholders.set(caseId, new Set())
    }
    
    const selectedStakeholders = this.selectedStakeholders.get(caseId)
    
    if (isSelected) {
      selectedStakeholders.add(stakeholder)
      event.target.closest('.stakeholder-option').classList.add('selected')
    } else {
      selectedStakeholders.delete(stakeholder)
      event.target.closest('.stakeholder-option').classList.remove('selected')
    }
    
    // Update the ranking display
    this.renderRanking()
    this.renderDecisionPowerRanking()
    this.renderEthicalComplexityRanking()
  }

  renderRanking() {
    const caseData = this.questions[this.currentQuestionIndex]
    const rankingContainer = document.getElementById('ranking-container')
    const caseId = caseData['Case']
    
    // Get selected stakeholders for this case, or all stakeholders if none selected
    const selectedStakeholders = this.selectedStakeholders.get(caseId) || new Set()
    const caseStakeholders = this.stakeholders.filter(stakeholder => 
      stakeholder.Case === caseId
    ).map(s => s.Stakeholder)
    
    // Use selected stakeholders, or default to all if none selected
    const stakeholdersToRank = selectedStakeholders.size > 0 
      ? Array.from(selectedStakeholders)
      : caseStakeholders
    
    // Get existing ranking for this case, or create default order
    let ranking = this.stakeholderRankings.get(caseId) || stakeholdersToRank.slice()
    
    // Ensure ranking includes all current stakeholders and remove any that are no longer selected
    const updatedRanking = []
    
    // First add existing ranked items that are still in stakeholdersToRank
    ranking.forEach(stakeholder => {
      if (stakeholdersToRank.includes(stakeholder)) {
        updatedRanking.push(stakeholder)
      }
    })
    
    // Then add any new stakeholders that weren't in the previous ranking
    stakeholdersToRank.forEach(stakeholder => {
      if (!updatedRanking.includes(stakeholder)) {
        updatedRanking.push(stakeholder)
      }
    })
    
    // Update the stored ranking
    this.stakeholderRankings.set(caseId, updatedRanking)
    ranking = updatedRanking
    
    rankingContainer.innerHTML = ranking.map((stakeholder, index) => `
      <div class="ranking-item" draggable="true" data-stakeholder="${stakeholder}">
        <span class="ranking-number">${index + 1}</span>
        <span class="ranking-stakeholder">${stakeholder}</span>
        <span class="drag-handle">⋮⋮</span>
      </div>
    `).join('')

    // Add drag and drop event listeners
    this.setupDragAndDrop(rankingContainer)
  }

  renderDecisionPowerRanking() {
    const caseData = this.questions[this.currentQuestionIndex]
    const rankingContainer = document.getElementById('decision-power-container')
    const caseId = caseData['Case']
    
    // Get selected stakeholders for this case, or all stakeholders if none selected
    const selectedStakeholders = this.selectedStakeholders.get(caseId) || new Set()
    const caseStakeholders = this.stakeholders.filter(stakeholder => 
      stakeholder.Case === caseId
    ).map(s => s.Stakeholder)
    
    // Use selected stakeholders, or default to all if none selected
    const stakeholdersToRank = selectedStakeholders.size > 0 
      ? Array.from(selectedStakeholders)
      : caseStakeholders
    
    // Get existing ranking for this case, or create default order
    let ranking = this.decisionPowerRankings.get(caseId) || stakeholdersToRank.slice()
    
    // Ensure ranking includes all current stakeholders and remove any that are no longer selected
    const updatedRanking = []
    
    // First add existing ranked items that are still in stakeholdersToRank
    ranking.forEach(stakeholder => {
      if (stakeholdersToRank.includes(stakeholder)) {
        updatedRanking.push(stakeholder)
      }
    })
    
    // Then add any new stakeholders that weren't in the previous ranking
    stakeholdersToRank.forEach(stakeholder => {
      if (!updatedRanking.includes(stakeholder)) {
        updatedRanking.push(stakeholder)
      }
    })
    
    // Update the stored ranking
    this.decisionPowerRankings.set(caseId, updatedRanking)
    ranking = updatedRanking
    
    rankingContainer.innerHTML = ranking.map((stakeholder, index) => `
      <div class="ranking-item" draggable="true" data-stakeholder="${stakeholder}">
        <span class="ranking-number">${index + 1}</span>
        <span class="ranking-stakeholder">${stakeholder}</span>
        <span class="drag-handle">⋮⋮</span>
      </div>
    `).join('')

    // Add drag and drop event listeners
    this.setupDecisionPowerDragAndDrop(rankingContainer)
  }

  renderEthicalComplexityRanking() {
    const caseData = this.questions[this.currentQuestionIndex]
    const rankingContainer = document.getElementById('ethical-complexity-container')
    const caseId = caseData['Case']
    
    // Get selected stakeholders for this case, or all stakeholders if none selected
    const selectedStakeholders = this.selectedStakeholders.get(caseId) || new Set()
    const caseStakeholders = this.stakeholders.filter(stakeholder => 
      stakeholder.Case === caseId
    ).map(s => s.Stakeholder)
    
    // Use selected stakeholders, or default to all if none selected
    const stakeholdersToRank = selectedStakeholders.size > 0 
      ? Array.from(selectedStakeholders)
      : caseStakeholders
    
    // Get existing ranking for this case, or create default order
    let ranking = this.ethicalComplexityRankings.get(caseId) || stakeholdersToRank.slice()
    
    // Ensure ranking includes all current stakeholders and remove any that are no longer selected
    const updatedRanking = []
    
    // First add existing ranked items that are still in stakeholdersToRank
    ranking.forEach(stakeholder => {
      if (stakeholdersToRank.includes(stakeholder)) {
        updatedRanking.push(stakeholder)
      }
    })
    
    // Then add any new stakeholders that weren't in the previous ranking
    stakeholdersToRank.forEach(stakeholder => {
      if (!updatedRanking.includes(stakeholder)) {
        updatedRanking.push(stakeholder)
      }
    })
    
    // Update the stored ranking
    this.ethicalComplexityRankings.set(caseId, updatedRanking)
    ranking = updatedRanking
    
    rankingContainer.innerHTML = ranking.map((stakeholder, index) => `
      <div class="ranking-item" draggable="true" data-stakeholder="${stakeholder}">
        <span class="ranking-number">${index + 1}</span>
        <span class="ranking-stakeholder">${stakeholder}</span>
        <span class="drag-handle">⋮⋮</span>
      </div>
    `).join('')

    // Add drag and drop event listeners
    this.setupEthicalComplexityDragAndDrop(rankingContainer)
  }

  setupDecisionPowerDragAndDrop(container) {
    let draggedElement = null

    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        draggedElement = e.target
        e.target.classList.add('dragging')
        container.classList.add('drag-over')
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', e.target.outerHTML)
      }
    })

    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        e.target.classList.remove('dragging')
        container.classList.remove('drag-over')
        draggedElement = null
      }
    })

    container.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      
      if (draggedElement) {
        const afterElement = this.getDragAfterElement(container, e.clientY)
        if (afterElement == null) {
          container.appendChild(draggedElement)
        } else {
          container.insertBefore(draggedElement, afterElement)
        }
      }
    })

    container.addEventListener('dragenter', (e) => {
      e.preventDefault()
      if (draggedElement) {
        container.classList.add('drag-over')
      }
    })

    container.addEventListener('dragleave', (e) => {
      e.preventDefault()
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove('drag-over')
      }
    })

    container.addEventListener('drop', (e) => {
      e.preventDefault()
      container.classList.remove('drag-over')
      
      if (draggedElement) {
        // Update the ranking order
        const newOrder = Array.from(container.children).map(item => 
          item.getAttribute('data-stakeholder')
        )
        
        // Update the ranking numbers
        container.querySelectorAll('.ranking-item').forEach((item, index) => {
          item.querySelector('.ranking-number').textContent = index + 1
        })
        
        // Store the new ranking
        const caseId = this.questions[this.currentQuestionIndex]['Case']
        this.decisionPowerRankings.set(caseId, newOrder)
      }
    })
  }

  setupEthicalComplexityDragAndDrop(container) {
    let draggedElement = null

    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        draggedElement = e.target
        e.target.classList.add('dragging')
        container.classList.add('drag-over')
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', e.target.outerHTML)
      }
    })

    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        e.target.classList.remove('dragging')
        container.classList.remove('drag-over')
        draggedElement = null
      }
    })

    container.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      
      if (draggedElement) {
        const afterElement = this.getDragAfterElement(container, e.clientY)
        if (afterElement == null) {
          container.appendChild(draggedElement)
        } else {
          container.insertBefore(draggedElement, afterElement)
        }
      }
    })

    container.addEventListener('dragenter', (e) => {
      e.preventDefault()
      if (draggedElement) {
        container.classList.add('drag-over')
      }
    })

    container.addEventListener('dragleave', (e) => {
      e.preventDefault()
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove('drag-over')
      }
    })

    container.addEventListener('drop', (e) => {
      e.preventDefault()
      container.classList.remove('drag-over')
      
      if (draggedElement) {
        // Update the ranking order
        const newOrder = Array.from(container.children).map(item => 
          item.getAttribute('data-stakeholder')
        )
        
        // Update the ranking numbers
        container.querySelectorAll('.ranking-item').forEach((item, index) => {
          item.querySelector('.ranking-number').textContent = index + 1
        })
        
        // Store the new ranking
        const caseId = this.questions[this.currentQuestionIndex]['Case']
        this.ethicalComplexityRankings.set(caseId, newOrder)
      }
    })
  }

  setupDragAndDrop(container) {
    let draggedElement = null

    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        draggedElement = e.target
        e.target.classList.add('dragging')
        container.classList.add('drag-over')
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', e.target.outerHTML)
      }
    })

    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('ranking-item')) {
        e.target.classList.remove('dragging')
        container.classList.remove('drag-over')
        draggedElement = null
      }
    })

    container.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      
      if (draggedElement) {
        const afterElement = this.getDragAfterElement(container, e.clientY)
        if (afterElement == null) {
          container.appendChild(draggedElement)
        } else {
          container.insertBefore(draggedElement, afterElement)
        }
      }
    })

    container.addEventListener('dragenter', (e) => {
      e.preventDefault()
      if (draggedElement) {
        container.classList.add('drag-over')
      }
    })

    container.addEventListener('dragleave', (e) => {
      e.preventDefault()
      // Only remove drag-over if we're leaving the container completely
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove('drag-over')
      }
    })

    container.addEventListener('drop', (e) => {
      e.preventDefault()
      container.classList.remove('drag-over')
      
      if (draggedElement) {
        // Update the ranking order
        const newOrder = Array.from(container.children).map(item => 
          item.getAttribute('data-stakeholder')
        )
        
        // Update the ranking numbers
        container.querySelectorAll('.ranking-item').forEach((item, index) => {
          item.querySelector('.ranking-number').textContent = index + 1
        })
        
        // Store the new ranking
        const caseId = this.questions[this.currentQuestionIndex]['Case']
        this.stakeholderRankings.set(caseId, newOrder)
      }
    })
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.ranking-item:not(.dragging)')]
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element
  }

  renderConcerns() {
    const caseData = this.questions[this.currentQuestionIndex]
    const concernsContainer = document.getElementById('concerns-section')
    const caseId = caseData['Case']
    
    // Get concerns for this case
    const caseConcerns = this.concerns.filter(concern => 
      concern.Case === caseId
    )
    
    // Get previously stored concerns responses for this case
    const concernsResponses = this.concernsResponses.get(caseId) || new Map()
    
    if (caseConcerns.length === 0) {
      concernsContainer.style.display = 'none'
      return
    }
    
    concernsContainer.style.display = 'block'
    
    const concernsHTML = caseConcerns.map((concern, index) => {
      const concernId = `concern-${index}`
      const response = concernsResponses.get(concern.Description) || { isConcern: null, severity: 1 }
      
      return `
        <div class="concern-item" data-concern="${concern.Description}">
          <div class="concern-description">
            <p>${concern.Description}</p>
          </div>
          
          <div class="concern-question">
            <label class="concern-label">Do you believe this is a concern?</label>
            <div class="concern-choice">
              <label class="concern-option">
                <input type="radio" 
                       name="${concernId}" 
                       value="yes" 
                       ${response.isConcern === true ? 'checked' : ''}>
                <span>Yes</span>
              </label>
              <label class="concern-option">
                <input type="radio" 
                       name="${concernId}" 
                       value="no" 
                       ${response.isConcern === false ? 'checked' : ''}>
                <span>No</span>
              </label>
            </div>
          </div>
          
          <div class="severity-section ${response.isConcern === true ? '' : 'hidden'}">
            <label class="severity-label">How severe is this concern?</label>
            <div class="severity-slider-container">
              <input type="range" 
                     class="severity-slider" 
                     min="1" 
                     max="3" 
                     value="${response.severity}" 
                     data-concern="${concern.Description}">
              <div class="severity-labels">
                <span class="severity-label-text">Mild</span>
                <span class="severity-label-text">Moderate</span>
                <span class="severity-label-text">Severe</span>
              </div>
              <div class="severity-value">Current: <span class="severity-text">${this.getSeverityText(response.severity)}</span></div>
            </div>
          </div>
        </div>
      `
    }).join('')
    
    concernsContainer.innerHTML = `
      <h4>Ethical Concerns Assessment</h4>
      <p class="concerns-instructions">💡 Please evaluate each potential concern and rate its severity if applicable</p>
      <div class="concerns-list">
        ${concernsHTML}
      </div>
    `
    
    // Add event listeners
    this.setupConcernsListeners()
  }

  getSeverityText(value) {
    switch(parseInt(value)) {
      case 1: return 'Mild'
      case 2: return 'Moderate' 
      case 3: return 'Severe'
      default: return 'Mild'
    }
  }

  setupConcernsListeners() {
    const caseId = this.questions[this.currentQuestionIndex]['Case']
    
    // Get or create concerns responses for this case
    if (!this.concernsResponses.has(caseId)) {
      this.concernsResponses.set(caseId, new Map())
    }
    const concernsResponses = this.concernsResponses.get(caseId)
    
    // Radio button listeners
    document.querySelectorAll('.concern-item input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const concernItem = e.target.closest('.concern-item')
        const concernDescription = concernItem.dataset.concern
        const isConcern = e.target.value === 'yes'
        const severitySection = concernItem.querySelector('.severity-section')
        
        // Get existing response or create new one
        const response = concernsResponses.get(concernDescription) || { isConcern: null, severity: 1 }
        response.isConcern = isConcern
        concernsResponses.set(concernDescription, response)
        
        // Show/hide severity section
        if (isConcern) {
          severitySection.classList.remove('hidden')
        } else {
          severitySection.classList.add('hidden')
        }
      })
    })
    
    // Slider listeners
    document.querySelectorAll('.severity-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const concernDescription = e.target.dataset.concern
        const severity = parseInt(e.target.value)
        const severityText = e.target.closest('.concern-item').querySelector('.severity-text')
        
        // Update display
        severityText.textContent = this.getSeverityText(severity)
        
        // Store response
        const response = concernsResponses.get(concernDescription) || { isConcern: null, severity: 1 }
        response.severity = severity
        concernsResponses.set(concernDescription, response)
      })
    })
  }

  renderOutcomes() {
    const caseData = this.questions[this.currentQuestionIndex]
    const outcomesContainer = document.getElementById('outcomes-section')
    const caseId = caseData['Case']
    
    // Get outcomes for this case
    const caseOutcomes = this.outcomes.filter(outcome => 
      outcome.Case === caseId
    )
    
    // Get previously selected outcomes for this case
    const selectedOutcomes = this.outcomesResponses.get(caseId) || new Set()
    
    if (caseOutcomes.length === 0) {
      outcomesContainer.style.display = 'none'
      return
    }
    
    outcomesContainer.style.display = 'block'
    
    const outcomesHTML = caseOutcomes.map((outcome, index) => {
      const outcomeId = `outcome-${index}`
      const isSelected = selectedOutcomes.has(outcome.Outcome)
      
      return `
        <label class="outcome-option ${isSelected ? 'selected' : ''}">
          <input type="checkbox" 
                 name="outcomes" 
                 value="${outcome.Outcome}" 
                 id="${outcomeId}"
                 ${isSelected ? 'checked' : ''}>
          <span class="outcome-text">${outcome.Outcome}</span>
          <span class="outcome-checkmark">✓</span>
        </label>
      `
    }).join('')
    
    outcomesContainer.innerHTML = `
      <h4>Potential Outcomes</h4>
      <p class="outcomes-instructions">💡 Select all outcomes that you believe are appropriate for this case</p>
      <div class="outcomes-list">
        ${outcomesHTML}
      </div>
    `
    
    // Add event listeners
    this.setupOutcomesListeners()
  }

  setupOutcomesListeners() {
    const caseId = this.questions[this.currentQuestionIndex]['Case']
    
    // Get or create outcomes responses for this case
    if (!this.outcomesResponses.has(caseId)) {
      this.outcomesResponses.set(caseId, new Set())
    }
    const selectedOutcomes = this.outcomesResponses.get(caseId)
    
    // Checkbox listeners
    document.querySelectorAll('.outcome-option input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const outcome = e.target.value
        const isSelected = e.target.checked
        const outcomeOption = e.target.closest('.outcome-option')
        
        if (isSelected) {
          selectedOutcomes.add(outcome)
          outcomeOption.classList.add('selected')
        } else {
          selectedOutcomes.delete(outcome)
          outcomeOption.classList.remove('selected')
        }
      })
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
