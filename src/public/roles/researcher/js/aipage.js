
document.addEventListener('DOMContentLoaded', function() {
    // Current user ID (would come from authentication in a real app)
    const currentUserId = '87babb4c-2518-41bd-982e-bd235bdeaa54';
    
    // API endpoints
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
    
    const PROJECTS_API = `${API_BASE_URL}/projects`;
    const SUGGESTIONS_API = `${API_BASE_URL}/ai/suggestions`;
    
    // User's research profile (would normally be fetched from API)
    const userResearchProfile = {
        areas: ['Artificial Intelligence', 'Machine Learning', 'Quantum Computing', 'Data Science'],
        publications: 15,
        citations: 320,
        h_index: 8,
        collaborators: 27,
        institutions: ['Stanford University', 'MIT', 'CERN'],
        funding_history: [{source: 'NSF', amount: 450000}, {source: 'NIH', amount: 250000}]
    };
    
    // Initialize suggestions
    initializePage();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Initialize page
    async function initializePage() {
        try {
            // Fetch user's projects to analyze
            const projects = await fetchUserProjects();
            
            // Generate AI suggestions based on projects and research profile
            const suggestions = await generateAISuggestions(projects);
            
            // Render suggestions
            renderSuggestions(suggestions);
            
        } catch (error) {
            console.error('Failed to initialize AI suggestions page:', error);
            showErrorNotification('Failed to load AI suggestions. Please try again.');
            
            // Show empty state
            document.getElementById('suggestions-container').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-robot"></i>
                    <h3>Could not generate suggestions</h3>
                    <p>We encountered an error while analyzing your research profile. Please try refreshing the page.</p>
                    <button id="retry-suggestions-btn" class="btn btn-primary">Try Again</button>
                </div>
            `;
            
            // Add retry button event listener
            document.getElementById('retry-suggestions-btn')?.addEventListener('click', initializePage);
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Refresh suggestions button
        document.getElementById('refresh-suggestions-btn').addEventListener('click', function() {
            refreshSuggestions();
        });
        
        // AI settings button
        document.getElementById('ai-settings-btn').addEventListener('click', function() {
            openSettingsModal();
        });
        
        // Search input
        document.getElementById('suggestion-search').addEventListener('input', function() {
            filterSuggestions();
        });
        
        // Sort dropdown
        document.getElementById('suggestion-sort').addEventListener('change', function() {
            sortSuggestions(this.value);
        });
        
        // Category filters
        document.querySelectorAll('input[name="category"]').forEach(filter => {
            filter.addEventListener('change', filterSuggestions);
        });
        
        // Priority filters
        document.querySelectorAll('input[name="priority"]').forEach(filter => {
            filter.addEventListener('change', filterSuggestions);
        });
        
        // Timeframe filters
        document.querySelectorAll('input[name="timeframe"]').forEach(filter => {
            filter.addEventListener('change', filterSuggestions);
        });
        
        // Settings modal
        const settingsModal = document.getElementById('ai-settings-modal');
        
        // Close button
        settingsModal.querySelector('.close').addEventListener('click', function() {
            closeSettingsModal();
        });
        
        // Reset settings button
        document.getElementById('reset-settings-btn').addEventListener('click', function() {
            resetAISettings();
        });
        
        // Save settings button
        document.getElementById('save-settings-btn').addEventListener('click', function() {
            saveAISettings();
            closeSettingsModal();
            refreshSuggestions();
        });
        
        // Research area tag input
        const tagInput = document.getElementById('research-area-input');
        const addTagBtn = document.getElementById('add-research-area-btn');
        
        addTagBtn.addEventListener('click', function() {
            addResearchAreaTag(tagInput.value);
            tagInput.value = '';
        });
        
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addResearchAreaTag(this.value);
                this.value = '';
            }
        });
        
        // Remove tag buttons
        document.getElementById('research-areas-tags').addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-tag')) {
                const tag = e.target.parentElement;
                tag.remove();
            }
        });
        
        // Settings sliders
        document.getElementById('creativity-slider').addEventListener('input', function() {
            updateSliderLabel('creativity', this.value);
        });
        
        document.getElementById('frequency-slider').addEventListener('input', function() {
            updateSliderLabel('frequency', this.value);
        });
        
        // Detail modal
        const detailModal = document.getElementById('suggestion-detail-modal');
        
        // Close button
        detailModal.querySelector('.close').addEventListener('click', function() {
            closeDetailModal();
        });
        
        // Suggestion feedback buttons
        document.getElementById('reject-suggestion-btn').addEventListener('click', function() {
            const suggestionId = detailModal.getAttribute('data-suggestion-id');
            rejectSuggestion(suggestionId);
            closeDetailModal();
        });
        
        document.getElementById('save-for-later-btn').addEventListener('click', function() {
            const suggestionId = detailModal.getAttribute('data-suggestion-id');
            saveSuggestionForLater(suggestionId);
            closeDetailModal();
        });
        
        document.getElementById('take-action-btn').addEventListener('click', function() {
            const suggestionId = detailModal.getAttribute('data-suggestion-id');
            takeSuggestionAction(suggestionId);
            closeDetailModal();
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                closeSettingsModal();
            }
            if (e.target === detailModal) {
                closeDetailModal();
            }
        });
    }
    
    // Fetch user's projects
    async function fetchUserProjects() {
        try {
            // In a real app, this would fetch from the API
            // For demo, we'll use mock data
            // const response = await fetch(`${PROJECTS_API}/user/${currentUserId}`);
            // if (!response.ok) throw new Error('Failed to fetch projects');
            // return await response.json();
            
            // Mock data
            return [
                { 
                    id: 1, 
                    name: 'Quantum Computing Research',
                    description: 'Investigating quantum algorithms for machine learning applications.',
                    keywords: ['quantum computing', 'machine learning', 'algorithms'],
                    collaborators: 8,
                    status: 'Active',
                    start_date: '2024-01-15',
                    end_date: '2025-12-31'
                },
                { 
                    id: 2, 
                    name: 'AI Ethics Framework',
                    description: 'Developing ethical guidelines for AI implementation in critical systems.',
                    keywords: ['AI ethics', 'responsible AI', 'governance'],
                    collaborators: 5,
                    status: 'Active',
                    start_date: '2024-03-10',
                    end_date: '2025-10-15'
                },
                { 
                    id: 3, 
                    name: 'Sustainable Energy Solutions',
                    description: 'Researching machine learning approaches to optimize renewable energy systems.',
                    keywords: ['renewable energy', 'machine learning', 'optimization'],
                    collaborators: 6,
                    status: 'Active',
                    start_date: '2024-02-01',
                    end_date: '2027-07-01'
                }
            ];
            
        } catch (error) {
            console.error('Error fetching user projects:', error);
            throw new Error('Failed to fetch user projects');
        }
    }
    
    // Generate AI suggestions based on user's projects and research profile
    async function generateAISuggestions(projects) {
        try {
            // In a real app, this would call the AI suggestion API
            // For demo, we'll simulate API call with setTimeout
            
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Generate suggestions based on projects and research profile
                    const suggestions = generateMockSuggestions(projects, userResearchProfile);
                    resolve(suggestions);
                }, 2500); // Simulate API delay
            });
            
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
            throw new Error('Failed to generate AI suggestions');
        }
    }
    
    // Generate mock suggestions based on projects and research profile
    function generateMockSuggestions(projects, profile) {
        // Extract keywords from projects
        const projectKeywords = projects.flatMap(project => project.keywords);
        
        // Combine with research areas
        const researchFocus = [...new Set([...projectKeywords, ...profile.areas.map(area => area.toLowerCase())])];
        
        // Generate different types of suggestions
        const collaborationSuggestions = generateCollaborationSuggestions(researchFocus);
        const fundingSuggestions = generateFundingSuggestions(researchFocus);
        const paperSuggestions = generatePaperSuggestions(researchFocus);
        const resourceSuggestions = generateResourceSuggestions(researchFocus);
        const eventSuggestions = generateEventSuggestions(researchFocus);
        
        // Combine all suggestions
        const allSuggestions = [
            ...collaborationSuggestions,
            ...fundingSuggestions,
            ...paperSuggestions,
            ...resourceSuggestions,
            ...eventSuggestions
        ];
        
        // Sort by relevance (random for mock data)
        return allSuggestions.sort(() => Math.random() - 0.5);
    }
    
    // Generate collaboration suggestions
    function generateCollaborationSuggestions(keywords) {
        const collaborators = [
            {
                name: "Dr. Emily Chen",
                institution: "MIT",
                expertise: ["quantum computing", "artificial intelligence"],
                relevance: 5
            },
            {
                name: "Prof. David Rodriguez",
                institution: "Stanford University",
                expertise: ["machine learning", "neural networks"],
                relevance: 4
            },
            {
                name: "Dr. Sarah Williams",
                institution: "Oxford University",
                expertise: ["quantum algorithms", "computational physics"],
                relevance: 5
            },
            {
                name: "Prof. Hiroshi Tanaka",
                institution: "Tokyo Institute of Technology",
                expertise: ["sustainable energy", "smart grid optimization"],
                relevance: 3
            }
        ];
        
        return collaborators.map(collaborator => {
            // Calculate match based on expertise overlap
            const expertiseOverlap = collaborator.expertise.filter(exp => keywords.includes(exp)).length;
            const priority = expertiseOverlap >= 2 ? 'high' : expertiseOverlap === 1 ? 'medium' : 'low';
            
            return {
                id: generateUniqueId(),
                type: 'collaboration',
                priority: priority,
                title: `Research Collaboration with ${collaborator.name}`,
                description: `${collaborator.name} from ${collaborator.institution} has complementary expertise in ${collaborator.expertise.join(', ')}. Their recent work aligns with your research focus.`,
                details: {
                    researcher: collaborator.name,
                    institution: collaborator.institution,
                    expertise: collaborator.expertise,
                    recent_publications: 12,
                    h_index: 18,
                    citations: 1200,
                    potential_projects: [
                        "Joint research on quantum machine learning algorithms",
                        "Collaborative paper on cross-disciplinary applications"
                    ],
                    contact_information: {
                        email: `${collaborator.name.split(' ')[1].toLowerCase()}@${collaborator.institution.split(' ')[0].toLowerCase()}.edu`,
                        website: `https://${collaborator.institution.split(' ')[0].toLowerCase()}.edu/faculty/${collaborator.name.split(' ')[1].toLowerCase()}`
                    }
                },
                relevance: collaborator.relevance,
                timeframe: 'short-term',
                tags: [...collaborator.expertise, collaborator.institution.toLowerCase().replace(/\s+/g, '-')]
            };
        });
    }
    
    // Generate funding suggestions
    function generateFundingSuggestions(keywords) {
        const fundingOpportunities = [
            {
                name: "NSF Advanced Computing Initiative",
                focus: ["quantum computing", "high performance computing"],
                amount: "$2.5 million",
                deadline: "2025-08-15",
                relevance: 5
            },
            {
                name: "NIH AI in Healthcare Research Grant",
                focus: ["artificial intelligence", "healthcare", "machine learning"],
                amount: "$1.8 million",
                deadline: "2025-06-30",
                relevance: 4
            },
            {
                name: "Department of Energy Clean Tech Innovation Fund",
                focus: ["renewable energy", "sustainability", "clean technology"],
                amount: "$3.2 million",
                deadline: "2025-09-20",
                relevance: 3
            },
            {
                name: "European Research Council Advanced Grant",
                focus: ["quantum algorithms", "computational theory", "theoretical physics"],
                amount: "€2.5 million",
                deadline: "2025-07-10",
                relevance: 4
            }
        ];
        
        return fundingOpportunities.map(opportunity => {
            // Calculate match based on focus overlap
            const focusOverlap = opportunity.focus.filter(focus => keywords.includes(focus)).length;
            const priority = focusOverlap >= 2 ? 'high' : focusOverlap === 1 ? 'medium' : 'low';
            
            // Calculate timeframe based on deadline
            const deadline = new Date(opportunity.deadline);
            const now = new Date();
            const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            const timeframe = daysUntilDeadline <= 30 ? 'immediate' : daysUntilDeadline <= 90 ? 'short-term' : 'long-term';
            
            return {
                id: generateUniqueId(),
                type: 'funding',
                priority: priority,
                title: opportunity.name,
                description: `${opportunity.amount} funding opportunity with deadline on ${formatDate(opportunity.deadline)}. Focus areas include ${opportunity.focus.join(', ')}.`,
                details: {
                    grant_name: opportunity.name,
                    funding_amount: opportunity.amount,
                    application_deadline: opportunity.deadline,
                    focus_areas: opportunity.focus,
                    eligibility_criteria: [
                        "PhD or equivalent in relevant field",
                        "Track record of publications in related areas",
                        "Institutional support"
                    ],
                    application_process: "Two-stage application with initial letter of intent followed by full proposal submission.",
                    success_rate: "18% for previous cycle",
                    agency_contact: {
                        name: "Grant Office",
                        email: `grants@${opportunity.name.split(' ')[0].toLowerCase()}.gov`,
                        website: `https://www.${opportunity.name.split(' ')[0].toLowerCase()}.gov/grants`
                    }
                },
                relevance: opportunity.relevance,
                timeframe: timeframe,
                tags: [...opportunity.focus, 'funding', 'grant']
            };
        });
    }
    
    // Generate paper suggestions
    function generatePaperSuggestions(keywords) {
        const papers = [
            {
                title: "Quantum Advantage in Machine Learning: A Survey",
                authors: ["Liu, J.", "Anderson, M.", "Zhang, S."],
                journal: "Nature Quantum Information",
                date: "2025-01-15",
                keywords: ["quantum computing", "machine learning", "quantum algorithms"],
                relevance: 5
            },
            {
                title: "Ethics Framework for Responsible AI in Critical Infrastructure",
                authors: ["Smith, K.", "Johnson, P.", "Williams, O."],
                journal: "AI Ethics Journal",
                date: "2025-02-22",
                keywords: ["AI ethics", "responsible AI", "critical infrastructure"],
                relevance: 4
            },
            {
                title: "Neural Networks for Renewable Energy Forecasting",
                authors: ["Chen, L.", "García, D.", "Kumar, A."],
                journal: "Renewable Energy Systems",
                date: "2024-12-10",
                keywords: ["renewable energy", "neural networks", "forecasting"],
                relevance: 3
            }
        ];
        
        return papers.map(paper => {
            // Calculate match based on keyword overlap
            const keywordOverlap = paper.keywords.filter(kw => keywords.includes(kw)).length;
            const priority = keywordOverlap >= 2 ? 'high' : keywordOverlap === 1 ? 'medium' : 'low';
            
            return {
                id: generateUniqueId(),
                type: 'paper',
                priority: priority,
                title: `Research Paper: "${paper.title}"`,
                description: `Recent publication by ${paper.authors.join(', ')} in ${paper.journal} that aligns with your research interests.`,
                details: {
                    paper_title: paper.title,
                    authors: paper.authors,
                    journal: paper.journal,
                    publication_date: paper.date,
                    abstract: "This paper presents a comprehensive survey of recent advancements at the intersection of quantum computing and machine learning, highlighting potential areas where quantum algorithms provide computational advantages over classical approaches.",
                    doi: `10.1038/s41${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9) + 1}`,
                    citations: Math.floor(Math.random() * 15) + 5,
                    keywords: paper.keywords,
                    access_link: `https://doi.org/10.1038/s41${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9) + 1}`
                },
                relevance: paper.relevance,
                timeframe: 'immediate',
                tags: paper.keywords
            };
        });
    }
    
    // Generate resource suggestions
    function generateResourceSuggestions(keywords) {
        const resources = [
            {
                name: "Quantum Machine Learning Dataset Repository",
                type: "Dataset",
                provider: "Quantum ML Consortium",
                keywords: ["quantum computing", "machine learning", "datasets"],
                relevance: 5
            },
            {
                name: "Ethics Assessment Framework for AI Applications",
                type: "Framework",
                provider: "AI Ethics Institute",
                keywords: ["AI ethics", "assessment", "governance"],
                relevance: 4
            },
            {
                name: "Renewable Energy Systems Simulation Package",
                type: "Software",
                provider: "Clean Energy Research Group",
                keywords: ["renewable energy", "simulation", "optimization"],
                relevance: 3
            }
        ];
        
        return resources.map(resource => {
            // Calculate match based on keyword overlap
            const keywordOverlap = resource.keywords.filter(kw => keywords.includes(kw)).length;
            const priority = keywordOverlap >= 2 ? 'medium' : keywordOverlap === 1 ? 'low' : 'low';
            
            return {
                id: generateUniqueId(),
                type: 'resource',
                priority: priority,
                title: resource.name,
                description: `${resource.type} provided by ${resource.provider} that could accelerate your research in ${resource.keywords.join(', ')}.`,
                details: {
                    resource_name: resource.name,
                    resource_type: resource.type,
                    provider: resource.provider,
                    description: `A comprehensive ${resource.type.toLowerCase()} specifically designed for researchers working in ${resource.keywords.join(', ')}. This resource can significantly accelerate your research workflow and provide valuable insights.`,
                    access_information: {
                        website: `https://www.${resource.provider.replace(/\s+/g, '').toLowerCase()}.org/resources`,
                        cost: resource.type === "Dataset" ? "Free for academic use" : "Subscription-based with academic discount",
                        documentation: "Comprehensive documentation and examples available"
                    },
                    user_reviews: {
                        rating: (Math.random() * 1 + 4).toFixed(1),
                        testimonials: [
                            "Incredibly useful resource that saved us months of work",
                            "Well-documented and continuously updated with new features"
                        ]
                    },
                    keywords: resource.keywords
                },
                relevance: resource.relevance,
                timeframe: 'short-term',
                tags: [...resource.keywords, resource.type.toLowerCase()]
            };
        });
    }
    
    // Generate event suggestions
    function generateEventSuggestions(keywords) {
        const events = [
            {
                name: "International Quantum Computing Conference",
                location: "Zurich, Switzerland",
                date: "2025-09-15",
                keywords: ["quantum computing", "quantum information", "quantum algorithms"],
                deadline: "2025-05-30",
                relevance: 5
            },
            {
                name: "AI Ethics and Governance Symposium",
                location: "Boston, MA, USA",
                date: "2025-07-22",
                keywords: ["AI ethics", "responsible AI", "governance"],
                deadline: "2025-04-15",
                relevance: 4
            },
            {
                name: "Renewable Energy and Smart Grid Conference",
                location: "Copenhagen, Denmark",
                date: "2025-10-05",
                keywords: ["renewable energy", "smart grid", "sustainability"],
                deadline: "2025-06-20",
                relevance: 3
            }
        ];
        
        return events.map(event => {
            // Calculate match based on keyword overlap
            const keywordOverlap = event.keywords.filter(kw => keywords.includes(kw)).length;
            const priority = keywordOverlap >= 2 ? 'medium' : keywordOverlap === 1 ? 'low' : 'low';
            
            // Calculate timeframe based on deadline
            const deadline = new Date(event.deadline);
            const now = new Date();
            const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            const timeframe = daysUntilDeadline <= 30 ? 'immediate' : daysUntilDeadline <= 90 ? 'short-term' : 'long-term';
            
            return {
                id: generateUniqueId(),
                type: 'event',
                priority: priority,
                title: event.name,
                description: `Conference in ${event.location} on ${formatDate(event.date)} with submission deadline on ${formatDate(event.deadline)}.`,
                details: {
                    event_name: event.name,
                    location: event.location,
                    date: event.date,
                    submission_deadline: event.deadline,
                    description: `A premier international conference bringing together researchers and practitioners in ${event.keywords.join(', ')}. The event features keynote presentations, workshops, and networking opportunities.`,
                    keynote_speakers: [
                        "Prof. Elizabeth Johnson, Stanford University",
                        "Dr. Michael Chang, Google Research",
                        "Prof. Hiroshi Yamamoto, University of Tokyo"
                    ],
                    website: `https://www.${event.name.replace(/\s+/g, '').toLowerCase()}.org`,
                    registration: {
                        early_bird_deadline: new Date(new Date(event.date).setMonth(new Date(event.date).getMonth() - 2)).toISOString().split('T')[0],
                        costs: {
                            early_bird: "$450",
                            regular: "$600",
                            student: "$250"
                        }
                    },
                    topics: event.keywords
                },
                relevance: event.relevance,
                timeframe: timeframe,
                tags: [...event.keywords, 'conference', event.location.split(',')[0].toLowerCase().replace(/\s+/g, '-')]
            };
        });
    }
    
    // Render suggestions
    function renderSuggestions(suggestions) {
        const container = document.getElementById('suggestions-container');
        
        if (!suggestions || suggestions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-robot"></i>
                    <h3>No suggestions found</h3>
                    <p>We couldn't find any relevant suggestions based on your current filters. Try changing your filter settings or refreshing.</p>
                    <button id="refresh-empty-btn" class="btn btn-primary">Refresh Suggestions</button>
                </div>
            `;
            
            document.getElementById('refresh-empty-btn')?.addEventListener('click', refreshSuggestions);
            return;
        }
        
        let html = '';
        
        suggestions.forEach(suggestion => {
            let iconClass = '';
            let icon = '';
            
            switch (suggestion.type) {
                case 'collaboration':
                    icon = 'users';
                    break;
                case 'funding':
                    icon = 'coins';
                    break;
                case 'paper':
                    icon = 'file-alt';
                    break;
                case 'resource':
                    icon = 'toolbox';
                    break;
                case 'event':
                    icon = 'calendar-alt';
                    break;
                default:
                    icon = 'lightbulb';
            }
            
            // Generate relevance dots
            let relevanceDots = '';
            for (let i = 1; i <= 5; i++) {
                relevanceDots += `<span class="relevance-dot ${i <= suggestion.relevance ? 'active' : ''}"></span>`;
            }
            
            // Generate tags
            let tagHtml = '';
            if (suggestion.tags && suggestion.tags.length > 0) {
                const displayTags = suggestion.tags.slice(0, 3); // Limit to 3 tags for display
                displayTags.forEach(tag => {
                    tagHtml += `<span class="suggestion-tag">${tag}</span>`;
                });
            }
            
            html += `
                <div class="suggestion-card ${suggestion.priority}-priority" data-suggestion-id="${suggestion.id}" data-suggestion-type="${suggestion.type}" data-suggestion-priority="${suggestion.priority}" data-suggestion-timeframe="${suggestion.timeframe}">
                    <div class="suggestion-header">
                        <span class="suggestion-type ${suggestion.type}">
                            <i class="fas fa-${icon}"></i> ${capitalizeFirstLetter(suggestion.type)}
                        </span>
                        <span class="suggestion-priority">
                            <i class="fas fa-${suggestion.priority === 'high' ? 'exclamation-circle' : suggestion.priority === 'medium' ? 'circle' : 'info-circle'}"></i> ${capitalizeFirstLetter(suggestion.priority)} Priority
                        </span>
                    </div>
                    <h3 class="suggestion-title">${suggestion.title}</h3>
                    <p class="suggestion-description">${suggestion.description}</p>
                    <div class="suggestion-meta">
                        <span class="suggestion-relevance">
                            Relevance <span class="relevance-dots">${relevanceDots}</span>
                        </span>
                        <span class="suggestion-timeframe ${suggestion.timeframe}">
                            <i class="fas fa-clock"></i> ${formatTimeframe(suggestion.timeframe)}
                        </span>
                    </div>
                    <div class="suggestion-tags">
                        ${tagHtml}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add click event listeners to suggestion cards
        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', function() {
                const suggestionId = this.getAttribute('data-suggestion-id');
                showSuggestionDetails(suggestionId, suggestions);
            });
        });
    }
    
    // Filter suggestions based on search and filters
    function filterSuggestions() {
        // Get all suggestions
        const suggestionCards = document.querySelectorAll('.suggestion-card');
        
        // Get filter values
        const searchTerm = document.getElementById('suggestion-search').value.toLowerCase();
        const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(input => input.value);
        const selectedPriorities = Array.from(document.querySelectorAll('input[name="priority"]:checked')).map(input => input.value);
        const selectedTimeframes = Array.from(document.querySelectorAll('input[name="timeframe"]:checked')).map(input => input.value);
        
        // Filter suggestions
        let visibleCount = 0;
        
        suggestionCards.forEach(card => {
            const title = card.querySelector('.suggestion-title').textContent.toLowerCase();
            const description = card.querySelector('.suggestion-description').textContent.toLowerCase();
            const type = card.getAttribute('data-suggestion-type');
            const priority = card.getAttribute('data-suggestion-priority');
            const timeframe = card.getAttribute('data-suggestion-timeframe');
            const tags = Array.from(card.querySelectorAll('.suggestion-tag')).map(tag => tag.textContent.toLowerCase());
            
            // Check if suggestion matches search term
            const matchesSearch = searchTerm === '' || 
                                 title.includes(searchTerm) || 
                                 description.includes(searchTerm) ||
                                 tags.some(tag => tag.includes(searchTerm));
            
            // Check if suggestion matches selected categories
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(type);
            
            // Check if suggestion matches selected priorities
            const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(priority);
            
            // Check if suggestion matches selected timeframes
            const matchesTimeframe = selectedTimeframes.length === 0 || selectedTimeframes.includes(timeframe);
            
            // Show or hide suggestion
            if (matchesSearch && matchesCategory && matchesPriority && matchesTimeframe) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show empty state if no suggestions match filters
        if (visibleCount === 0) {
            const container = document.getElementById('suggestions-container');
            
            // Check if empty state already exists
            if (!container.querySelector('.empty-filtered-state')) {
                // Add empty state after all suggestion cards
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-filtered-state';
                emptyState.innerHTML = `
                    <i class="fas fa-filter"></i>
                    <h3>No matching suggestions</h3>
                    <p>We couldn't find any suggestions matching your current filters.</p>
                    <button id="reset-filters-btn" class="btn btn-secondary">Reset Filters</button>
                `;
                
                container.appendChild(emptyState);
                
                // Add event listener to reset filters button
                document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
            }
        } else {
            // Remove empty state if it exists
            const emptyState = document.querySelector('.empty-filtered-state');
            if (emptyState) {
                emptyState.remove();
            }
        }
    }
    
    // Reset filters
    function resetFilters() {
        // Reset search
        document.getElementById('suggestion-search').value = '';
        
        // Reset category filters
        document.querySelectorAll('input[name="category"]').forEach(filter => {
            filter.checked = true;
        });
        
        // Reset priority filters
        document.querySelectorAll('input[name="priority"]').forEach(filter => {
            filter.checked = true;
        });
        
        // Reset timeframe filters
        document.querySelectorAll('input[name="timeframe"]').forEach(filter => {
            filter.checked = true;
        });
        
        // Apply filters
        filterSuggestions();
    }
    
    // Sort suggestions
    function sortSuggestions(sortBy) {
        const container = document.getElementById('suggestions-container');
        const suggestionCards = Array.from(container.querySelectorAll('.suggestion-card'));
        
        suggestionCards.sort((a, b) => {
            switch (sortBy) {
                case 'relevance':
                    // Sort by number of active relevance dots
                    const aRelevance = a.querySelectorAll('.relevance-dot.active').length;
                    const bRelevance = b.querySelectorAll('.relevance-dot.active').length;
                    return bRelevance - aRelevance;
                    
                case 'priority':
                    // Sort by priority
                    const aPriority = a.getAttribute('data-suggestion-priority');
                    const bPriority = b.getAttribute('data-suggestion-priority');
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[bPriority] - priorityOrder[aPriority];
                    
                case 'recent':
                    // In a real app, this would sort by date
                    // For demo, we'll randomly shuffle
                    return Math.random() - 0.5;
                    
                default:
                    return 0;
            }
        });
        
        // Reappend sorted cards
        suggestionCards.forEach(card => {
            container.appendChild(card);
        });
    }
    
    // Show suggestion details
    function showSuggestionDetails(suggestionId, suggestions) {
        // Find suggestion by ID
        const suggestion = suggestions.find(s => s.id === suggestionId);
        
        if (!suggestion) return;
        
        // Get detail modal
        const modal = document.getElementById('suggestion-detail-modal');
        const detailContent = document.getElementById('suggestion-detail-content');
        
        // Set suggestion ID to modal
        modal.setAttribute('data-suggestion-id', suggestionId);
        
        // Set modal title
        document.getElementById('detail-title').textContent = suggestion.title;
        
        // Generate content based on suggestion type
        let content = '';
        
        // Common header
        content += `
            <div class="detail-header">
                <div class="detail-type-priority">
                    <span class="suggestion-type ${suggestion.type}">
                        <i class="fas fa-${getSuggestionTypeIcon(suggestion.type)}"></i> ${capitalizeFirstLetter(suggestion.type)}
                    </span>
                    <span class="suggestion-priority">
                        <i class="fas fa-${suggestion.priority === 'high' ? 'exclamation-circle' : suggestion.priority === 'medium' ? 'circle' : 'info-circle'}"></i> ${capitalizeFirstLetter(suggestion.priority)} Priority
                    </span>
                </div>
            </div>
            
            <div class="detail-section">
                <p>${suggestion.description}</p>
            </div>
        `;
        
        // Type-specific details
        switch (suggestion.type) {
            case 'collaboration':
                content += generateCollaborationDetails(suggestion);
                break;
                
            case 'funding':
                content += generateFundingDetails(suggestion);
                break;
                
            case 'paper':
                content += generatePaperDetails(suggestion);
                break;
                
            case 'resource':
                content += generateResourceDetails(suggestion);
                break;
                
            case 'event':
                content += generateEventDetails(suggestion);
                break;
        }
        
        // Common actions section
        content += `
            <div class="detail-section">
                <h4>Recommended Actions</h4>
                <div class="detail-actions">
                    ${generateRecommendedActions(suggestion)}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Why This Was Suggested</h4>
                <p>This suggestion was generated based on your research profile and recent project activities. The AI identified alignment between your work on ${suggestion.tags.slice(0, 3).join(', ')} and this opportunity.</p>
                <div class="suggestion-meta" style="margin-top: 10px;">
                    <span class="suggestion-relevance">
                        Relevance ${generateRelevanceDots(suggestion.relevance)}
                    </span>
                </div>
            </div>
        `;
        
        // Update modal content
        detailContent.innerHTML = content;
        
        // Show modal
        modal.style.display = 'block';
    }
    
    // Generate collaboration details
    function generateCollaborationDetails(suggestion) {
        const details = suggestion.details;
        
        return `
            <div class="detail-meta">
                <div class="meta-item">
                    <i class="fas fa-user-tie"></i>
                    <span class="meta-label">Researcher:</span>
                    <span class="meta-value">${details.researcher}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-university"></i>
                    <span class="meta-label">Institution:</span>
                    <span class="meta-value">${details.institution}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-award"></i>
                    <span class="meta-label">H-Index:</span>
                    <span class="meta-value">${details.h_index}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-file-alt"></i>
                    <span class="meta-label">Publications:</span>
                    <span class="meta-value">${details.recent_publications}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Research Expertise</h4>
                <div class="suggestion-tags">
                    ${details.expertise.map(exp => `<span class="suggestion-tag">${exp}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Potential Collaboration Areas</h4>
                <ul>
                    ${details.potential_projects.map(project => `<li>${project}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-section">
                <h4>Contact Information</h4>
                <div class="meta-item">
                    <i class="fas fa-envelope"></i>
                    <span class="meta-label">Email:</span>
                    <span class="meta-value"><a href="mailto:${details.contact_information.email}">${details.contact_information.email}</a></span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-globe"></i>
                    <span class="meta-label">Website:</span>
                    <span class="meta-value"><a href="${details.contact_information.website}" target="_blank">${details.contact_information.website}</a></span>
                </div>
            </div>
        `;
    }
    
    // Generate funding details
    function generateFundingDetails(suggestion) {
        const details = suggestion.details;
        
        return `
            <div class="detail-meta">
                <div class="meta-item">
                    <i class="fas fa-coins"></i>
                    <span class="meta-label">Amount:</span>
                    <span class="meta-value">${details.funding_amount}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar-day"></i>
                    <span class="meta-label">Deadline:</span>
                    <span class="meta-value">${formatDate(details.application_deadline)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-chart-line"></i>
                    <span class="meta-label">Success Rate:</span>
                    <span class="meta-value">${details.success_rate}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Focus Areas</h4>
                <div class="suggestion-tags">
                    ${details.focus_areas.map(area => `<span class="suggestion-tag">${area}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Eligibility Criteria</h4>
                <ul>
                    ${details.eligibility_criteria.map(criteria => `<li>${criteria}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-section">
                <h4>Application Process</h4>
                <p>${details.application_process}</p>
            </div>
            
            <div class="detail-section">
                <h4>Contact Information</h4>
                <div class="meta-item">
                    <i class="fas fa-user"></i>
                    <span class="meta-label">Contact:</span>
                    <span class="meta-value">${details.agency_contact.name}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-envelope"></i>
                    <span class="meta-label">Email:</span>
                    <span class="meta-value"><a href="mailto:${details.agency_contact.email}">${details.agency_contact.email}</a></span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-globe"></i>
                    <span class="meta-label">Website:</span>
                    <span class="meta-value"><a href="${details.agency_contact.website}" target="_blank">${details.agency_contact.website}</a></span>
                </div>
            </div>
        `;
    }
    
    // Generate paper details
    function generatePaperDetails(suggestion) {
        const details = suggestion.details;
        
        return `
            <div class="detail-meta">
                <div class="meta-item">
                    <i class="fas fa-journal-whills"></i>
                    <span class="meta-label">Journal:</span>
                    <span class="meta-value">${details.journal}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar-day"></i>
                    <span class="meta-label">Published:</span>
                    <span class="meta-value">${formatDate(details.publication_date)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-quote-right"></i>
                    <span class="meta-label">Citations:</span>
                    <span class="meta-value">${details.citations}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Authors</h4>
                <p>${details.authors.join(', ')}</p>
            </div>
            
            <div class="detail-section">
                <h4>Abstract</h4>
                <p>${details.abstract}</p>
            </div>
            
            <div class="detail-section">
                <h4>Keywords</h4>
                <div class="suggestion-tags">
                    ${details.keywords.map(keyword => `<span class="suggestion-tag">${keyword}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Access Information</h4>
                <div class="meta-item">
                    <i class="fas fa-fingerprint"></i>
                    <span class="meta-label">DOI:</span>
                    <span class="meta-value">${details.doi}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-external-link-alt"></i>
                    <span class="meta-label">Access:</span>
                    <span class="meta-value"><a href="${details.access_link}" target="_blank">View Paper</a></span>
                </div>
            </div>
        `;
    }
    
    // Generate resource details
    function generateResourceDetails(suggestion) {
        const details = suggestion.details;
        
        return `
            <div class="detail-meta">
                <div class="meta-item">
                    <i class="fas fa-toolbox"></i>
                    <span class="meta-label">Type:</span>
                    <span class="meta-value">${details.resource_type}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-building"></i>
                    <span class="meta-label">Provider:</span>
                    <span class="meta-value">${details.provider}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <span class="meta-label">Rating:</span>
                    <span class="meta-value">${details.user_reviews.rating}/5.0</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Description</h4>
                <p>${details.description}</p>
            </div>
            
            <div class="detail-section">
                <h4>Keywords</h4>
                <div class="suggestion-tags">
                    ${details.keywords.map(keyword => `<span class="suggestion-tag">${keyword}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Access Information</h4>
                <div class="meta-item">
                    <i class="fas fa-globe"></i>
                    <span class="meta-label">Website:</span>
                    <span class="meta-value"><a href="${details.access_information.website}" target="_blank">${details.access_information.website}</a></span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span class="meta-label">Cost:</span>
                    <span class="meta-value">${details.access_information.cost}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-book"></i>
                    <span class="meta-label">Documentation:</span>
                    <span class="meta-value">${details.access_information.documentation}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>User Testimonials</h4>
                <ul>
                    ${details.user_reviews.testimonials.map(testimonial => `<li><i class="fas fa-quote-left"></i> ${testimonial}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Generate event details
    function generateEventDetails(suggestion) {
        const details = suggestion.details;
        
        return `
            <div class="detail-meta">
                <div class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="meta-label">Location:</span>
                    <span class="meta-value">${details.location}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar-day"></i>
                    <span class="meta-label">Date:</span>
                    <span class="meta-value">${formatDate(details.date)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-hourglass-end"></i>
                    <span class="meta-label">Submission Deadline:</span>
                    <span class="meta-value">${formatDate(details.submission_deadline)}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Description</h4>
                <p>${details.description}</p>
            </div>
            
            <div class="detail-section">
                <h4>Keynote Speakers</h4>
                <ul>
                    ${details.keynote_speakers.map(speaker => `<li>${speaker}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-section">
                <h4>Topics</h4>
                <div class="suggestion-tags">
                    ${details.topics.map(topic => `<span class="suggestion-tag">${topic}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Registration Information</h4>
                <div class="meta-item">
                    <i class="fas fa-calendar-check"></i>
                    <span class="meta-label">Early Bird Deadline:</span>
                    <span class="meta-value">${formatDate(details.registration.early_bird_deadline)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span class="meta-label">Early Bird Cost:</span>
                    <span class="meta-value">${details.registration.costs.early_bird}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span class="meta-label">Regular Cost:</span>
                    <span class="meta-value">${details.registration.costs.regular}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span class="meta-label">Student Cost:</span>
                    <span class="meta-value">${details.registration.costs.student}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-globe"></i>
                    <span class="meta-label">Website:</span>
                    <span class="meta-value"><a href="${details.website}" target="_blank">${details.website}</a></span>
                </div>
            </div>
        `;
    }
    
    // Generate recommended actions based on suggestion type
    function generateRecommendedActions(suggestion) {
        let actions = '';
        
        switch (suggestion.type) {
            case 'collaboration':
                actions += `
                    <div class="action-card">
                        <h5 class="action-title">Send Introduction Email</h5>
                        <p class="action-description">Introduce yourself and your research interests to ${suggestion.details.researcher}.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Schedule Meeting</h5>
                        <p class="action-description">Request a virtual meeting to discuss potential collaboration areas.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Review Publications</h5>
                        <p class="action-description">Read recent papers by ${suggestion.details.researcher} to better understand their work.</p>
                    </div>
                `;
                break;
                
            case 'funding':
                actions += `
                    <div class="action-card">
                        <h5 class="action-title">Prepare Letter of Intent</h5>
                        <p class="action-description">Draft an initial letter of intent for the ${suggestion.details.grant_name}.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Contact Agency</h5>
                        <p class="action-description">Reach out to the funding agency with any questions about the application process.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Set Milestones</h5>
                        <p class="action-description">Create a timeline for completing the application before the deadline.</p>
                    </div>
                `;
                break;
                
            case 'paper':
                actions += `
                    <div class="action-card">
                        <h5 class="action-title">Read Paper</h5>
                        <p class="action-description">Read the full paper to understand its relevance to your work.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Contact Authors</h5>
                        <p class="action-description">Reach out to the authors to discuss their research or potential collaboration.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Cite in Your Work</h5>
                        <p class="action-description">Consider citing this paper in your upcoming publications if relevant.</p>
                    </div>
                `;
                break;
                
            case 'resource':
                actions += `
                    <div class="action-card">
                        <h5 class="action-title">Explore Resource</h5>
                        <p class="action-description">Visit the website to learn more about the ${suggestion.details.resource_type.toLowerCase()}.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Request Access</h5>
                        <p class="action-description">Apply for access or request a trial if it seems relevant to your work.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Share with Team</h5>
                        <p class="action-description">Share this resource with your research team or collaborators.</p>
                    </div>
                `;
                break;
                
            case 'event':
                actions += `
                    <div class="action-card">
                        <h5 class="action-title">Mark Calendar</h5>
                        <p class="action-description">Add key dates to your calendar, including submission and registration deadlines.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Prepare Submission</h5>
                        <p class="action-description">Start working on your submission for the conference.</p>
                    </div>
                    <div class="action-card">
                        <h5 class="action-title">Plan Attendance</h5>
                        <p class="action-description">Make travel and accommodation arrangements if you plan to attend in person.</p>
                    </div>
                `;
                break;
        }
        
        return actions;
    }
    
    // Settings Modal Functions
    function openSettingsModal() {
        document.getElementById('ai-settings-modal').style.display = 'block';
    }
    
    function closeSettingsModal() {
        document.getElementById('ai-settings-modal').style.display = 'none';
    }
    
    function resetAISettings() {
        // Reset suggestion types
        document.querySelectorAll('input[name="suggestion-type"]').forEach(input => {
            input.checked = true;
        });
        
        // Reset research areas
        document.getElementById('research-areas-tags').innerHTML = `
            <span class="tag">Artificial Intelligence<button class="remove-tag">&times;</button></span>
            <span class="tag">Machine Learning<button class="remove-tag">&times;</button></span>
            <span class="tag">Quantum Computing<button class="remove-tag">&times;</button></span>
            <span class="tag">Data Science<button class="remove-tag">&times;</button></span>
        `;
        
        // Reset sliders
        document.getElementById('creativity-slider').value = 2;
        document.getElementById('frequency-slider').value = 2;
        
        // Update slider labels
        updateSliderLabel('creativity', 2);
        updateSliderLabel('frequency', 2);
        
        showSuccessNotification('Settings reset to default values');
    }
    
    function saveAISettings() {
        // In a real app, this would save settings to an API
        // For demo, we'll just show a notification
        
        // Get selected suggestion types
        const suggestionTypes = Array.from(document.querySelectorAll('input[name="suggestion-type"]:checked')).map(input => input.value);
        
        // Get research areas
        const researchAreas = Array.from(document.querySelectorAll('#research-areas-tags .tag')).map(tag => tag.textContent.replace('×', '').trim());
        
        // Get slider values
        const creativityValue = document.getElementById('creativity-slider').value;
        const frequencyValue = document.getElementById('frequency-slider').value;
        
        // Update user research profile
        userResearchProfile.areas = researchAreas;
        
        showSuccessNotification('AI settings saved successfully');
    }
    
    function addResearchAreaTag(value) {
        if (!value || value.trim() === '') return;
        
        const tagsContainer = document.getElementById('research-areas-tags');
        
        // Check if tag already exists
        const existingTags = Array.from(tagsContainer.querySelectorAll('.tag')).map(tag => tag.textContent.replace('×', '').trim().toLowerCase());
        
        if (existingTags.includes(value.trim().toLowerCase())) {
            return; // Tag already exists
        }
        
        // Create new tag
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${value.trim()}<button class="remove-tag">&times;</button>`;
        
        // Add to container
        tagsContainer.appendChild(tag);
    }
    
    function updateSliderLabel(type, value) {
        if (type === 'creativity') {
            const labels = ['Conservative', 'Balanced', 'Exploratory'];
            document.getElementById('creativity-value').textContent = labels[value - 1];
        } else if (type === 'frequency') {
            const labels = ['Monthly', 'Weekly', 'Daily'];
            document.getElementById('frequency-value').textContent = labels[value - 1];
        }
    }
    
    function closeDetailModal() {
        document.getElementById('suggestion-detail-modal').style.display = 'none';
    }
    
    function refreshSuggestions() {
        // Show loading
        document.getElementById('suggestions-container').innerHTML = `
            <div class="loading-container">
                <div class="ai-loading">
                    <div class="ai-loading-animation">
                        <i class="fas fa-robot"></i>
                        <div class="thinking-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <p>Refreshing suggestions based on your latest research profile...</p>
                </div>
            </div>
        `;
        
        // In a real app, this would call the API to refresh suggestions
        // For demo, we'll simulate with setTimeout
        setTimeout(async () => {
            try {
                // Fetch user's projects
                const projects = await fetchUserProjects();
                
                // Generate AI suggestions
                const suggestions = await generateAISuggestions(projects);
                
                // Render suggestions
                renderSuggestions(suggestions);
                
                // Show success notification
                showSuccessNotification('Suggestions refreshed successfully');
                
            } catch (error) {
                console.error('Error refreshing suggestions:', error);
                showErrorNotification('Failed to refresh suggestions');
            }
        }, 2000);
    }
    
    // Suggestion Actions
    function rejectSuggestion(suggestionId) {
        // In a real app, this would call an API to mark the suggestion as rejected
        // For demo, we'll just show a notification
        showSuccessNotification('Suggestion marked as not relevant');
        
        // Remove suggestion from UI
        const suggestionCard = document.querySelector(`.suggestion-card[data-suggestion-id="${suggestionId}"]`);
        if (suggestionCard) {
            suggestionCard.remove();
        }
    }
    
    function saveSuggestionForLater(suggestionId) {
        // In a real app, this would call an API to save the suggestion for later
        // For demo, we'll just show a notification
        showSuccessNotification('Suggestion saved for later review');
    }
    
    function takeSuggestionAction(suggestionId) {
        // In a real app, this would open a specific action flow based on suggestion type
        // For demo, we'll just show a notification
        showSuccessNotification('Taking action on suggestion');
    }
    
    // Helper Functions
    function generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    function formatTimeframe(timeframe) {
        switch (timeframe) {
            case 'immediate': return 'Immediate Action';
            case 'short-term': return 'Short-term';
            case 'long-term': return 'Long-term';
            default: return timeframe;
        }
    }
    
    function getSuggestionTypeIcon(type) {
        switch (type) {
            case 'collaboration': return 'users';
            case 'funding': return 'coins';
            case 'paper': return 'file-alt';
            case 'resource': return 'toolbox';
            case 'event': return 'calendar-alt';
            default: return 'lightbulb';
        }
    }
    
    function generateRelevanceDots(relevance) {
        let dots = '<span class="relevance-dots">';
        for (let i = 1; i <= 5; i++) {
            dots += `<span class="relevance-dot ${i <= relevance ? 'active' : ''}"></span>`;
        }
        dots += '</span>';
        return dots;
    }
    
    // Show success notification
    function showSuccessNotification(message) {
        showToast(message, 'success');
    }
    
    // Show error notification
    function showErrorNotification(message) {
        showToast(message, 'error');
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        
        if (!toastContainer) {
            console.error('Toast container not found');
            return;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon;
        switch (type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
            case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
            default: icon = '<i class="fas fa-info-circle"></i>';
        }
        
        // Set notification content
        notification.innerHTML = `
            <div class="notification-content">
                ${icon}
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to container
        toastContainer.appendChild(notification);
        
        // Make the notification visible after a small delay (for animation)
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Setup close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            removeNotification(notification);
        });
        
        // Auto-remove after delay
        setTimeout(() => {
            removeNotification(notification);
        }, 5000);
    }
    
    // Remove notification with animation
    function removeNotification(notification) {
        notification.classList.remove('active');
        notification.classList.add('notification-hiding');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
});
