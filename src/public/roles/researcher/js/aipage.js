
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
                "name": "NSF Quantum Leap Challenge",
                "focus": ["quantum information science", "quantum algorithms"],
                "amount": "$4 million",
                "deadline": "2025-10-05",
                "relevance": 5
            },
            {
                "name": "DARPA AI Exploration Grant",
                "focus": ["artificial intelligence", "autonomous systems", "defense tech"],
                "amount": "$1.5 million",
                "deadline": "2025-07-22",
                "relevance": 4
            },
            {
                "name": "NASA Space Tech Research Grants",
                "focus": ["space exploration", "robotics", "advanced propulsion"],
                "amount": "$2.8 million",
                "deadline": "2025-11-15",
                "relevance": 3
            },
            {
                "name": "Bill & Melinda Gates Foundation Global Health Grant",
                "focus": ["public health", "vaccine development", "disease prevention"],
                "amount": "$5 million",
                "deadline": "2025-09-01",
                "relevance": 4
            },
            {
                "name": "Google AI Research Award",
                "focus": ["machine learning", "natural language processing", "computer vision"],
                "amount": "$750,000",
                "deadline": "2025-08-30",
                "relevance": 4
            },
            {
                "name": "National Endowment for the Humanities Digital Humanities Grant",
                "focus": ["digital archives", "cultural preservation", "history"],
                "amount": "$300,000",
                "deadline": "2025-07-15",
                "relevance": 2
            },
            {
                "name": "USDA Sustainable Agriculture Research Program",
                "focus": ["agricultural innovation", "sustainable farming", "food security"],
                "amount": "$1.2 million",
                "deadline": "2025-10-20",
                "relevance": 3
            },
            {
                "name": "Wellcome Trust Biomedical Research Fund",
                "focus": ["genomics", "infectious diseases", "neuroscience"],
                "amount": "£2 million",
                "deadline": "2025-08-10",
                "relevance": 4
            },
            {
                "name": "Sloan Foundation Computational Biology Grant",
                "focus": ["bioinformatics", "systems biology", "computational modeling"],
                "amount": "$600,000",
                "deadline": "2025-09-05",
                "relevance": 3
            },
            {
                "name": "NSF Cyber-Physical Systems Program",
                "focus": ["IoT", "embedded systems", "smart infrastructure"],
                "amount": "$1.7 million",
                "deadline": "2025-11-01",
                "relevance": 4
            },
            {
                "name": "European Commission Horizon Europe AI Ethics Grant",
                "focus": ["AI ethics", "responsible AI", "policy development"],
                "amount": "€1.3 million",
                "deadline": "2025-10-12",
                "relevance": 3
            },
            {
                "name": "Chan Zuckerberg Initiative Neurodegeneration Challenge",
                "focus": ["Alzheimer's research", "Parkinson's disease", "brain health"],
                "amount": "$3.5 million",
                "deadline": "2025-07-25",
                "relevance": 5
            },
            {
                "name": "Amazon Climate Pledge Fund",
                "focus": ["carbon reduction", "climate tech", "sustainability"],
                "amount": "$2 million",
                "deadline": "2025-09-30",
                "relevance": 3
            },
            {
                "name": "NSF Secure and Trustworthy Cyberspace (SaTC) Grant",
                "focus": ["cybersecurity", "privacy", "encryption"],
                "amount": "$1.9 million",
                "deadline": "2025-08-18",
                "relevance": 4
            },
            {
                "name": "NIH Precision Medicine Initiative",
                "focus": ["genomic medicine", "personalized healthcare", "biomarkers"],
                "amount": "$4.2 million",
                "deadline": "2025-10-25",
                "relevance": 5
            },
            {
                "name": "Ford Foundation Social Justice Grant",
                "focus": ["racial equity", "economic justice", "human rights"],
                "amount": "$500,000",
                "deadline": "2025-07-05",
                "relevance": 2
            },
            {
                "name": "Intel Neuromorphic Computing Research Grant",
                "focus": ["brain-inspired computing", "AI hardware", "neuromorphic chips"],
                "amount": "$1.1 million",
                "deadline": "2025-08-28",
                "relevance": 4
            },
            {
                "name": "National Geographic Exploration Grant",
                "focus": ["biodiversity", "conservation", "field research"],
                "amount": "$150,000",
                "deadline": "2025-09-15",
                "relevance": 2
            },
            {
                "name": "DOE Fusion Energy Sciences Program",
                "focus": ["nuclear fusion", "plasma physics", "energy innovation"],
                "amount": "$3.8 million",
                "deadline": "2025-11-10",
                "relevance": 4
            },
            {
                "name": "Microsoft AI for Earth Grant",
                "focus": ["environmental AI", "climate modeling", "conservation tech"],
                "amount": "$900,000",
                "deadline": "2025-08-05",
                "relevance": 3
            },
            {
                "name": "NIH BRAIN Initiative",
                "focus": ["neuroscience", "brain mapping", "neurotechnology"],
                "amount": "$5.5 million",
                "deadline": "2025-10-30",
                "relevance": 5
            },
            {
                "name": "Rockefeller Foundation Food Systems Innovation Grant",
                "focus": ["food tech", "agricultural sustainability", "nutrition"],
                "amount": "$1.4 million",
                "deadline": "2025-09-12",
                "relevance": 3
            },
            {
                "name": "NSF Materials Genome Initiative",
                "focus": ["advanced materials", "nanotechnology", "materials science"],
                "amount": "$2.3 million",
                "deadline": "2025-07-20",
                "relevance": 4
            },
            {
                "name": "UKRI Future Leaders Fellowship",
                "focus": ["early-career researchers", "interdisciplinary science", "innovation"],
                "amount": "£1.2 million",
                "deadline": "2025-08-31",
                "relevance": 3
            },
            {
                "name": "IBM Quantum Open Science Prize",
                "focus": ["quantum computing", "quantum algorithms", "open-source research"],
                "amount": "$200,000",
                "deadline": "2025-09-08",
                "relevance": 4
            },
            {
                "name": "NIH Cancer Moonshot Initiative",
                "focus": ["oncology", "cancer immunotherapy", "early detection"],
                "amount": "$6 million",
                "deadline": "2025-11-20",
                "relevance": 5
            },
            {
                "name": "Schmidt Futures AI in Science Grant",
                "focus": ["scientific AI", "computational research", "data-driven discovery"],
                "amount": "$2.1 million",
                "deadline": "2025-08-14",
                "relevance": 4
            },
            {
                "name": "NSF Convergence Accelerator",
                "focus": ["interdisciplinary research", "tech commercialization", "societal impact"],
                "amount": "$1 million",
                "deadline": "2025-10-01",
                "relevance": 3
            },
            {
                "name": "OpenAI Research Access Grant",
                "focus": ["AI safety", "large language models", "alignment research"],
                "amount": "$500,000",
                "deadline": "2025-07-31",
                "relevance": 4
            },
            {
                "name": "DOE Advanced Manufacturing Office Grant",
                "focus": ["3D printing", "industrial automation", "smart manufacturing"],
                "amount": "$2.6 million",
                "deadline": "2025-09-25",
                "relevance": 3
            },
            {
                "name": "NIH All of Us Research Program",
                "focus": ["precision medicine", "health data", "diversity in research"],
                "amount": "$3.3 million",
                "deadline": "2025-11-05",
                "relevance": 4
            },
            {
                "name": "Knight Foundation Journalism Innovation Fund",
                "focus": ["media technology", "data journalism", "misinformation"],
                "amount": "$250,000",
                "deadline": "2025-08-08",
                "relevance": 2
            },
            {
                "name": "NSF Ethical and Responsible Research (ER2) Program",
                "focus": ["research ethics", "social implications of tech", "policy"],
                "amount": "$800,000",
                "deadline": "2025-07-18",
                "relevance": 3
            },
            {
                "name": "Facebook Reality Labs Research Grant",
                "focus": ["virtual reality", "augmented reality", "human-computer interaction"],
                "amount": "$1.2 million",
                "deadline": "2025-09-10",
                "relevance": 4
            },
            {
                "name": "NIH Rapid Acceleration of Diagnostics (RADx) Initiative",
                "focus": ["diagnostic tech", "infectious diseases", "point-of-care testing"],
                "amount": "$4.5 million",
                "deadline": "2025-10-15",
                "relevance": 5
            },
            {
                "name": "NSF Future of Work at the Human-Technology Frontier",
                "focus": ["workplace automation", "human-AI collaboration", "labor economics"],
                "amount": "$1.6 million",
                "deadline": "2025-08-25",
                "relevance": 3
            },
            {
                "name": "European Space Agency (ESA) Space Innovation Fund",
                "focus": ["satellite tech", "space exploration", "orbital systems"],
                "amount": "€2 million",
                "deadline": "2025-11-30",
                "relevance": 4
            },
            {
                "name": "NIH Aging Research Grant",
                "focus": ["gerontology", "longevity science", "age-related diseases"],
                "amount": "$2.7 million",
                "deadline": "2025-09-18",
                "relevance": 4
            },
            {
                "name": "NSF Smart and Connected Communities",
                "focus": ["urban tech", "smart cities", "community resilience"],
                "amount": "$1.8 million",
                "deadline": "2025-10-08",
                "relevance": 3
            },
            {
                "name": "Alfred P. Sloan Foundation Digital Technology Grant",
                "focus": ["blockchain", "digital privacy", "cyber-physical security"],
                "amount": "$700,000",
                "deadline": "2025-07-28",
                "relevance": 3
            },
            {
                "name": "NIH Minority Health and Health Disparities Research",
                "focus": ["health equity", "community health", "social determinants"],
                "amount": "$2.4 million",
                "deadline": "2025-08-20",
                "relevance": 4
            },
            {
                "name": "NSF Biological Integration Institutes",
                "focus": ["synthetic biology", "evolutionary biology", "systems biology"],
                "amount": "$3 million",
                "deadline": "2025-09-28",
                "relevance": 4
            },
            {
                "name": "Tesla Energy Innovation Prize",
                "focus": ["battery tech", "energy storage", "grid optimization"],
                "amount": "$1.5 million",
                "deadline": "2025-10-22",
                "relevance": 3
            },
            {
                "name": "NIH Mental Health Research Grant",
                "focus": ["psychiatry", "neuroscience", "behavioral health"],
                "amount": "$2.9 million",
                "deadline": "2025-11-25",
                "relevance": 5
            },
            {
                "name": "NSF Disaster Resilience Research Grants",
                "focus": ["climate adaptation", "disaster response", "resilient infrastructure"],
                "amount": "$1.3 million",
                "deadline": "2025-08-12",
                "relevance": 3
            },
            {
                "name": "Google for Startups Black Founders Fund",
                "focus": ["entrepreneurship", "tech startups", "diversity in tech"],
                "amount": "$100,000",
                "deadline": "2025-07-10",
                "relevance": 2
            },
            {
                "name": "NIH Rare Diseases Research Network",
                "focus": ["orphan diseases", "genetic disorders", "therapeutic development"],
                "amount": "$3.6 million",
                "deadline": "2025-10-18",
                "relevance": 4
            },
            {
                "name": "NSF AI Institute for Dynamic Systems",
                "focus": ["AI control systems", "robotics", "autonomous agents"],
                "amount": "$5 million",
                "deadline": "2025-11-12",
                "relevance": 5
            },
            {
                "name": "World Bank Climate Innovation Grants",
                "focus": ["climate finance", "green infrastructure", "sustainable development"],
                "amount": "$2.2 million",
                "deadline": "2025-09-05",
                "relevance": 3
            },
            {
                "name": "NIH Biomedical Data Science Training Program",
                "focus": ["data science", "biostatistics", "health informatics"],
                "amount": "$1.7 million",
                "deadline": "2025-08-29",
                "relevance": 4
            },
                {
                    "name": "NRF Quantum Computing Development Grant",
                    "focus": ["quantum computing", "algorithm development"],
                    "amount": "R37 million",
                    "deadline": "2025-08-20",
                    "relevance": 5
                },
                {
                    "name": "DST AI for Agriculture Innovation Fund",
                    "focus": ["artificial intelligence", "precision farming", "machine learning"],
                    "amount": "R28 million",
                    "deadline": "2025-07-15",
                    "relevance": 4
                },
                {
                    "name": "SANEDI Renewable Energy Research Grant",
                    "focus": ["solar energy", "energy storage", "sustainability"],
                    "amount": "R42 million",
                    "deadline": "2025-09-25",
                    "relevance": 3
                },
                {
                    "name": "CSIR High-Performance Computing Initiative",
                    "focus": ["HPC", "data science", "simulation"],
                    "amount": "R50 million",
                    "deadline": "2025-10-10",
                    "relevance": 5
                },
                {
                    "name": "NHLS Medical AI Research Fund",
                    "focus": ["healthcare AI", "diagnostics", "deep learning"],
                    "amount": "R22 million",
                    "deadline": "2025-06-30",
                    "relevance": 4
                },
                {
                    "name": "TIA Robotics and Automation Grant",
                    "focus": ["robotics", "industrial automation", "AI"],
                    "amount": "R35 million",
                    "deadline": "2025-08-05",
                    "relevance": 4
                },
                {
                    "name": "WRC Water Technology Innovation Fund",
                    "focus": ["water purification", "sustainable water use", "IoT"],
                    "amount": "R30 million",
                    "deadline": "2025-07-30",
                    "relevance": 3
                },
                {
                    "name": "DSI Space Technology Development Grant",
                    "focus": ["satellite tech", "aerospace", "remote sensing"],
                    "amount": "R45 million",
                    "deadline": "2025-09-15",
                    "relevance": 4
                },
                {
                    "name": "NRF Bioinformatics and Genomics Initiative",
                    "focus": ["genomics", "bioinformatics", "precision medicine"],
                    "amount": "R25 million",
                    "deadline": "2025-08-12",
                    "relevance": 4
                },
                {
                    "name": "DTIC Smart Manufacturing Fund",
                    "focus": ["Industry 4.0", "IoT", "automation"],
                    "amount": "R40 million",
                    "deadline": "2025-10-05",
                    "relevance": 3
                },
                {
                    "name": "SAAO Astrophysics and Data Science Grant",
                    "focus": ["astrophysics", "big data", "telescope tech"],
                    "amount": "R18 million",
                    "deadline": "2025-07-22",
                    "relevance": 3
                },
                {
                    "name": "MRC Digital Health Innovations Fund",
                    "focus": ["telemedicine", "wearable tech", "health analytics"],
                    "amount": "R20 million",
                    "deadline": "2025-06-25",
                    "relevance": 4
                },
                {
                    "name": "DEFF Wildlife Conservation Tech Grant",
                    "focus": ["conservation tech", "drones", "AI tracking"],
                    "amount": "R15 million",
                    "deadline": "2025-09-10",
                    "relevance": 3
                },
                {
                    "name": "NRF Cybersecurity Research Initiative",
                    "focus": ["cybersecurity", "blockchain", "encryption"],
                    "amount": "R32 million",
                    "deadline": "2025-08-30",
                    "relevance": 5
                },
                {
                    "name": "DBSA Urban Smart Cities Fund",
                    "focus": ["smart cities", "urban IoT", "sustainable infrastructure"],
                    "amount": "R55 million",
                    "deadline": "2025-11-15",
                    "relevance": 4
                },
                {
                    "name": "TIA AgriTech Innovation Challenge",
                    "focus": ["precision agriculture", "AI farming", "drones"],
                    "amount": "R27 million",
                    "deadline": "2025-07-18",
                    "relevance": 4
                },
                {
                    "name": "CSIR Nanotechnology Development Grant",
                    "focus": ["nanotech", "material science", "medical applications"],
                    "amount": "R38 million",
                    "deadline": "2025-09-05",
                    "relevance": 4
                },
                {
                    "name": "DSI Climate Change Adaptation Fund",
                    "focus": ["climate resilience", "carbon capture", "sustainability"],
                    "amount": "R33 million",
                    "deadline": "2025-10-20",
                    "relevance": 3
                },
                {
                    "name": "NRF Data Science for Social Good",
                    "focus": ["big data", "social impact", "AI ethics"],
                    "amount": "R21 million",
                    "deadline": "2025-08-08",
                    "relevance": 4
                },
                {
                    "name": "SANRAL Smart Transport Solutions Grant",
                    "focus": ["autonomous vehicles", "traffic AI", "smart roads"],
                    "amount": "R48 million",
                    "deadline": "2025-09-30",
                    "relevance": 3
                },
                {
                    "name": "NHLS Pandemic Preparedness Fund",
                    "focus": ["infectious disease AI", "vaccine research", "epidemiology"],
                    "amount": "R29 million",
                    "deadline": "2025-07-05",
                    "relevance": 5
                },
                {
                    "name": "DST Future Fibre Optic Technologies",
                    "focus": ["optical computing", "quantum comms", "networking"],
                    "amount": "R36 million",
                    "deadline": "2025-10-15",
                    "relevance": 4
                },
                {
                    "name": "CSIR Energy Storage Innovation Fund",
                    "focus": ["battery tech", "renewable storage", "grid solutions"],
                    "amount": "R41 million",
                    "deadline": "2025-11-10",
                    "relevance": 4
                },
                {
                    "name": "NRF AI in Education Research Grant",
                    "focus": ["EdTech", "adaptive learning", "AI tutoring"],
                    "amount": "R19 million",
                    "deadline": "2025-08-25",
                    "relevance": 3
                },
                {
                    "name": "SEDA Startup Tech Innovation Fund",
                    "focus": ["tech startups", "incubation", "entrepreneurship"],
                    "amount": "R24 million",
                    "deadline": "2025-07-28",
                    "relevance": 4
                },
                {
                    "name": "DEFF Marine Robotics Research Grant",
                    "focus": ["underwater drones", "oceanography", "marine conservation"],
                    "amount": "R26 million",
                    "deadline": "2025-09-12",
                    "relevance": 3
                },
                {
                    "name": "DSI Advanced Materials Discovery Fund",
                    "focus": ["material science", "nanotech", "3D printing"],
                    "amount": "R34 million",
                    "deadline": "2025-10-08",
                    "relevance": 4
                },
                {
                    "name": "NRF Neural Networks & Deep Learning Grant",
                    "focus": ["AI models", "neural networks", "computer vision"],
                    "amount": "R31 million",
                    "deadline": "2025-08-14",
                    "relevance": 5
                },
                {
                    "name": "TIA FinTech Innovation Challenge",
                    "focus": ["blockchain", "digital banking", "AI finance"],
                    "amount": "R43 million",
                    "deadline": "2025-09-18",
                    "relevance": 4
                },
                {
                    "name": "CSIR AI for Disaster Response Fund",
                    "focus": ["disaster prediction", "AI救援", "crisis management"],
                    "amount": "R23 million",
                    "deadline": "2025-07-20",
                    "relevance": 4
                },
                {
                    "name": "SANBI Biodiversity Data Science Grant",
                    "focus": ["biodiversity AI", "ecological data", "conservation"],
                    "amount": "R17 million",
                    "deadline": "2025-08-28",
                    "relevance": 3
                },
                {
                    "name": "NRF Quantum Encryption Initiative",
                    "focus": ["quantum cryptography", "secure comms", "cybersecurity"],
                    "amount": "R39 million",
                    "deadline": "2025-10-25",
                    "relevance": 5
                },
                {
                    "name": "DST AI in Mining Automation Fund",
                    "focus": ["autonomous mining", "safety AI", "resource optimization"],
                    "amount": "R47 million",
                    "deadline": "2025-11-05",
                    "relevance": 4
                },
                {
                    "name": "MRC AI for Drug Discovery Grant",
                    "focus": ["pharmaceutical AI", "molecular modeling", "drug design"],
                    "amount": "R30 million",
                    "deadline": "2025-09-08",
                    "relevance": 5
                },
                {
                    "name": "NRF Space Data Analytics Fund",
                    "focus": ["satellite imagery", "space data", "AI analytics"],
                    "amount": "R28 million",
                    "deadline": "2025-08-17",
                    "relevance": 4
                },
                {
                    "name": "CSIR Green Hydrogen Research Grant",
                    "focus": ["hydrogen energy", "clean fuel", "renewable tech"],
                    "amount": "R52 million",
                    "deadline": "2025-11-20",
                    "relevance": 4
                },
                {
                    "name": "DTIC 5G & Advanced Networks Fund",
                    "focus": ["5G tech", "IoT networks", "telecom innovation"],
                    "amount": "R44 million",
                    "deadline": "2025-10-12",
                    "relevance": 4
                },
                {
                    "name": "NRF AI Ethics & Policy Research",
                    "focus": ["AI governance", "ethics", "policy frameworks"],
                    "amount": "R16 million",
                    "deadline": "2025-07-10",
                    "relevance": 3
                },
                {
                    "name": "SANSA Space Weather Prediction Grant",
                    "focus": ["space weather", "AI forecasting", "satellite safety"],
                    "amount": "R20 million",
                    "deadline": "2025-09-22",
                    "relevance": 3
                },
                {
                    "name": "DSI Synthetic Biology Innovation Fund",
                    "focus": ["bioengineering", "synthetic DNA", "biotech"],
                    "amount": "R35 million",
                    "deadline": "2025-10-30",
                    "relevance": 4
                },
                {
                    "name": "NRF AI for Mental Health Research",
                    "focus": ["mental health AI", "therapy bots", "neuroscience"],
                    "amount": "R22 million",
                    "deadline": "2025-08-03",
                    "relevance": 4
                },
                {
                    "name": "CSIR Smart Grid Technology Fund",
                    "focus": ["energy grids", "AI optimization", "renewable integration"],
                    "amount": "R46 million",
                    "deadline": "2025-11-08",
                    "relevance": 4
                },
                {
                    "name": "TIA AI for Logistics & Supply Chain",
                    "focus": ["supply chain AI", "autonomous logistics", "inventory AI"],
                    "amount": "R33 million",
                    "deadline": "2025-09-14",
                    "relevance": 4
                },
                {
                    "name": "NRF Exoplanet Discovery AI Initiative",
                    "focus": ["astrophysics AI", "exoplanet detection", "telescope data"],
                    "amount": "R27 million",
                    "deadline": "2025-10-18",
                    "relevance": 3
                },
                {
                    "name": "DST Neurotechnology Development Grant",
                    "focus": ["brain-computer interface", "neuro AI", "medical devices"],
                    "amount": "R40 million",
                    "deadline": "2025-11-25",
                    "relevance": 5
                },
                {
                    "name": "CSIR AI for Food Security Fund",
                    "focus": ["agricultural AI", "food supply chain", "sustainability"],
                    "amount": "R29 million",
                    "deadline": "2025-09-28",
                    "relevance": 4
                },
                {
                    "name": "NRF Post-Quantum Cryptography Fund",
                    "focus": ["quantum-safe encryption", "cybersecurity", "algorithms"],
                    "amount": "R37 million",
                    "deadline": "2025-10-22",
                    "relevance": 5
                },
                {
                    "name": "SANRAL AI for Traffic Management",
                    "focus": ["smart traffic", "AI routing", "urban mobility"],
                    "amount": "R31 million",
                    "deadline": "2025-08-09",
                    "relevance": 3
                },
                {
                    "name": "DSI Fusion Energy Research Grant",
                    "focus": ["fusion power", "plasma physics", "clean energy"],
                    "amount": "R58 million",
                    "deadline": "2025-12-05",
                    "relevance": 4
                },
                {
                    "name": "NRF AI-Powered Language Processing",
                    "focus": ["NLP", "translation AI", "linguistics"],
                    "amount": "R25 million",
                    "deadline": "2025-07-25",
                    "relevance": 4
                }
            ]
        
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
                "name": "African Quantum Computing Summit",
                "location": "Cape Town, South Africa",
                "date": "2025-11-10",
                "keywords": ["quantum computing", "quantum cryptography", "quantum hardware"],
                "deadline": "2025-08-25",
                "relevance": 5
            },
            {
                "name": "AI for Healthcare Africa Conference",
                "location": "Nairobi, Kenya",
                "date": "2025-09-18",
                "keywords": ["medical AI", "diagnostics", "health tech"],
                "deadline": "2025-07-05",
                "relevance": 4
            },
            {
                "name": "Pan-African Renewable Energy Forum",
                "location": "Johannesburg, South Africa",
                "date": "2025-10-30",
                "keywords": ["solar power", "wind energy", "green tech"],
                "deadline": "2025-08-15",
                "relevance": 4
            },
            {
                "name": "Global FinTech & Blockchain Expo",
                "location": "Lagos, Nigeria",
                "date": "2025-12-05",
                "keywords": ["blockchain", "digital banking", "cryptocurrency"],
                "deadline": "2025-09-20",
                "relevance": 4
            },
            {
                "name": "International AI Ethics Symposium",
                "location": "London, UK",
                "date": "2025-08-12",
                "keywords": ["AI governance", "ethics", "policy"],
                "deadline": "2025-05-30",
                "relevance": 5
            },
            {
                "name": "Africa Data Science Conference",
                "location": "Kigali, Rwanda",
                "date": "2025-11-22",
                "keywords": ["big data", "machine learning", "data analytics"],
                "deadline": "2025-09-10",
                "relevance": 4
            },
            {
                "name": "Space Tech & Satellite Innovation Summit",
                "location": "Dubai, UAE",
                "date": "2025-10-08",
                "keywords": ["satellite tech", "space exploration", "aerospace"],
                "deadline": "2025-07-25",
                "relevance": 4
            },
            {
                "name": "Global Cybersecurity Forum",
                "location": "Singapore",
                "date": "2025-09-05",
                "keywords": ["cybersecurity", "encryption", "threat intelligence"],
                "deadline": "2025-06-15",
                "relevance": 5
            },
            {
                "name": "African AgriTech Innovation Summit",
                "location": "Accra, Ghana",
                "date": "2025-10-15",
                "keywords": ["precision farming", "drones", "AI agriculture"],
                "deadline": "2025-08-01",
                "relevance": 4
            },
            {
                "name": "International Robotics & Automation Expo",
                "location": "Tokyo, Japan",
                "date": "2025-11-20",
                "keywords": ["robotics", "industrial automation", "AI"],
                "deadline": "2025-09-30",
                "relevance": 4
            },
            {
                "name": "Future of Quantum Communication Workshop",
                "location": "Berlin, Germany",
                "date": "2025-07-30",
                "keywords": ["quantum networks", "secure comms", "quantum internet"],
                "deadline": "2025-05-10",
                "relevance": 5
            },
            {
                "name": "AI in Education Africa Conference",
                "location": "Dakar, Senegal",
                "date": "2025-09-28",
                "keywords": ["EdTech", "adaptive learning", "AI tutoring"],
                "deadline": "2025-07-15",
                "relevance": 3
            },
            {
                "name": "Global Clean Energy & Sustainability Summit",
                "location": "Stockholm, Sweden",
                "date": "2025-10-25",
                "keywords": ["renewables", "carbon capture", "green energy"],
                "deadline": "2025-08-10",
                "relevance": 4
            },
            {
                "name": "Africa HealthTech Innovation Forum",
                "location": "Cairo, Egypt",
                "date": "2025-11-15",
                "keywords": ["telemedicine", "wearables", "digital health"],
                "deadline": "2025-09-05",
                "relevance": 4
            },
            {
                "name": "International Neurotechnology Conference",
                "location": "San Francisco, USA",
                "date": "2025-12-12",
                "keywords": ["brain-computer interface", "neuro AI", "medical devices"],
                "deadline": "2025-10-01",
                "relevance": 5
            },
            {
                "name": "African Smart Cities Summit",
                "location": "Addis Ababa, Ethiopia",
                "date": "2025-10-18",
                "keywords": ["urban IoT", "smart infrastructure", "sustainability"],
                "deadline": "2025-08-05",
                "relevance": 4
            },
            {
                "name": "Global AI & Deep Learning Symposium",
                "location": "Toronto, Canada",
                "date": "2025-09-10",
                "keywords": ["neural networks", "computer vision", "NLP"],
                "deadline": "2025-06-25",
                "relevance": 5
            },
            {
                "name": "Africa Climate Tech Conference",
                "location": "Windhoek, Namibia",
                "date": "2025-11-05",
                "keywords": ["climate resilience", "carbon tech", "sustainability"],
                "deadline": "2025-09-15",
                "relevance": 4
            },
            {
                "name": "International 5G & IoT Innovation Forum",
                "location": "Seoul, South Korea",
                "date": "2025-10-12",
                "keywords": ["5G networks", "IoT", "smart devices"],
                "deadline": "2025-07-30",
                "relevance": 4
            },
            {
                "name": "African Digital Banking Summit",
                "location": "Abuja, Nigeria",
                "date": "2025-09-25",
                "keywords": ["FinTech", "digital finance", "blockchain banking"],
                "deadline": "2025-07-10",
                "relevance": 4
            },
            {
                "name": "Global Synthetic Biology Conference",
                "location": "Boston, USA",
                "date": "2025-12-08",
                "keywords": ["bioengineering", "synthetic DNA", "biotech"],
                "deadline": "2025-10-20",
                "relevance": 4
            },
            {
                "name": "Africa AI & Robotics Expo",
                "location": "Lusaka, Zambia",
                "date": "2025-10-22",
                "keywords": ["AI robotics", "automation", "industrial AI"],
                "deadline": "2025-08-12",
                "relevance": 4
            },
            {
                "name": "International Space Exploration Forum",
                "location": "Paris, France",
                "date": "2025-11-30",
                "keywords": ["space travel", "satellite tech", "Mars missions"],
                "deadline": "2025-09-18",
                "relevance": 4
            },
            {
                "name": "African Water Tech Symposium",
                "location": "Dar es Salaam, Tanzania",
                "date": "2025-09-15",
                "keywords": ["water purification", "IoT water management", "sustainability"],
                "deadline": "2025-07-01",
                "relevance": 3
            },
            {
                "name": "Global Quantum Algorithms Workshop",
                "location": "Zurich, Switzerland",
                "date": "2025-08-20",
                "keywords": ["quantum software", "algorithms", "quantum advantage"],
                "deadline": "2025-06-05",
                "relevance": 5
            },
            {
                "name": "Africa Cybersecurity & Privacy Summit",
                "location": "Nairobi, Kenya",
                "date": "2025-10-10",
                "keywords": ["cyber defense", "data privacy", "encryption"],
                "deadline": "2025-08-20",
                "relevance": 5
            },
            {
                "name": "International AI for Social Good Conference",
                "location": "Amsterdam, Netherlands",
                "date": "2025-11-18",
                "keywords": ["AI ethics", "social impact", "inclusive AI"],
                "deadline": "2025-09-05",
                "relevance": 4
            },
            {
                "name": "African Future of Work Summit",
                "location": "Johannesburg, South Africa",
                "date": "2025-09-30",
                "keywords": ["AI jobs", "automation impact", "future skills"],
                "deadline": "2025-07-15",
                "relevance": 3
            },
            {
                "name": "Global Fusion Energy Symposium",
                "location": "Oxford, UK",
                "date": "2025-12-15",
                "keywords": ["fusion power", "clean energy", "plasma physics"],
                "deadline": "2025-10-30",
                "relevance": 4
            },
            {
                "name": "Africa Blockchain & Digital Assets Forum",
                "location": "Lagos, Nigeria",
                "date": "2025-10-28",
                "keywords": ["crypto", "DeFi", "smart contracts"],
                "deadline": "2025-08-15",
                "relevance": 4
            },
            {
                "name": "International AI in Finance Summit",
                "location": "New York, USA",
                "date": "2025-11-25",
                "keywords": ["algorithmic trading", "AI banking", "risk modeling"],
                "deadline": "2025-09-10",
                "relevance": 5
            },
            {
                "name": "African Wildlife Tech Conference",
                "location": "Gaborone, Botswana",
                "date": "2025-09-12",
                "keywords": ["conservation tech", "drones", "AI tracking"],
                "deadline": "2025-07-20",
                "relevance": 3
            },
            {
                "name": "Global NLP & Language AI Workshop",
                "location": "Barcelona, Spain",
                "date": "2025-10-17",
                "keywords": ["natural language processing", "translation AI", "linguistics"],
                "deadline": "2025-08-05",
                "relevance": 4
            },
            {
                "name": "Africa AI Startup Pitch Competition",
                "location": "Cape Town, South Africa",
                "date": "2025-11-08",
                "keywords": ["startups", "entrepreneurship", "AI innovation"],
                "deadline": "2025-09-22",
                "relevance": 4
            },
            {
                "name": "International Smart Manufacturing Expo",
                "location": "Munich, Germany",
                "date": "2025-10-05",
                "keywords": ["Industry 4.0", "IoT factories", "automation"],
                "deadline": "2025-07-25",
                "relevance": 4
            },
            {
                "name": "African Digital Health Symposium",
                "location": "Kampala, Uganda",
                "date": "2025-09-20",
                "keywords": ["health AI", "telemedicine", "wearable tech"],
                "deadline": "2025-07-10",
                "relevance": 4
            },
            {
                "name": "Global Quantum Sensors Conference",
                "location": "Melbourne, Australia",
                "date": "2025-12-10",
                "keywords": ["quantum sensing", "precision measurement", "physics"],
                "deadline": "2025-10-25",
                "relevance": 5
            },
            {
                "name": "Africa Renewable Energy Investors Forum",
                "location": "Abidjan, Côte d'Ivoire",
                "date": "2025-11-12",
                "keywords": ["solar investments", "wind farms", "green energy"],
                "deadline": "2025-09-28",
                "relevance": 4
            },
            {
                "name": "International AI in Law & Governance Summit",
                "location": "Brussels, Belgium",
                "date": "2025-10-30",
                "keywords": ["AI policy", "legal tech", "regulation"],
                "deadline": "2025-08-15",
                "relevance": 4
            },
            {
                "name": "African Space & Satellite Forum",
                "location": "Pretoria, South Africa",
                "date": "2025-09-08",
                "keywords": ["satellite tech", "space data", "aerospace"],
                "deadline": "2025-07-20",
                "relevance": 4
            },
            {
                "name": "Global AI in Retail & E-Commerce Expo",
                "location": "Shanghai, China",
                "date": "2025-11-15",
                "keywords": ["AI shopping", "recommendation engines", "supply chain AI"],
                "deadline": "2025-09-30",
                "relevance": 4
            },
            {
                "name": "Africa Quantum & HPC Workshop",
                "location": "Nairobi, Kenya",
                "date": "2025-10-20",
                "keywords": ["quantum computing", "high-performance computing", "supercomputing"],
                "deadline": "2025-08-10",
                "relevance": 5
            },
            {
                "name": "International AI for Climate Action Conference",
                "location": "Vancouver, Canada",
                "date": "2025-12-05",
                "keywords": ["climate AI", "carbon tracking", "sustainability"],
                "deadline": "2025-10-20",
                "relevance": 4
            },
            {
                "name": "African MedTech & AI Diagnostics Summit",
                "location": "Accra, Ghana",
                "date": "2025-09-28",
                "keywords": ["medical AI", "diagnostics", "health innovation"],
                "deadline": "2025-07-15",
                "relevance": 4
            },
            {
                "name": "Global Future of AI Governance Forum",
                "location": "Geneva, Switzerland",
                "date": "2025-11-22",
                "keywords": ["AI policy", "ethics", "global standards"],
                "deadline": "2025-09-10",
                "relevance": 5
            },
            
                {
                    "name": "Global Summit on Artificial Intelligence",
                    "location": "San Francisco, CA, USA",
                    "date": "2025-11-10",
                    "keywords": ["AI research", "machine learning", "deep learning"],
                    "deadline": "2025-08-25",
                    "relevance": 5
                },
                {
                    "name": "International Conference on High-Performance Computing",
                    "location": "Tokyo, Japan",
                    "date": "2025-10-18",
                    "keywords": ["HPC", "supercomputing", "parallel computing"],
                    "deadline": "2025-07-30",
                    "relevance": 4
                },
                {
                    "name": "Neural Information Processing Systems (NeurIPS)",
                    "location": "Vancouver, Canada",
                    "date": "2025-12-05",
                    "keywords": ["neural networks", "AI", "computational neuroscience"],
                    "deadline": "2025-09-15",
                    "relevance": 5
                },
                {
                    "name": "Blockchain and Cryptocurrency Expo",
                    "location": "Singapore",
                    "date": "2025-09-25",
                    "keywords": ["blockchain", "DeFi", "Web3"],
                    "deadline": "2025-06-10",
                    "relevance": 4
                },
                {
                    "name": "International Robotics and Automation Conference",
                    "location": "Munich, Germany",
                    "date": "2025-11-20",
                    "keywords": ["robotics", "autonomous systems", "AI in robotics"],
                    "deadline": "2025-09-01",
                    "relevance": 4
                },
                {
                    "name": "Climate Change and Sustainability Forum",
                    "location": "Stockholm, Sweden",
                    "date": "2025-10-30",
                    "keywords": ["climate action", "sustainability", "green tech"],
                    "deadline": "2025-08-15",
                    "relevance": 3
                },
                {
                    "name": "Bioinformatics and Computational Biology Conference",
                    "location": "Boston, MA, USA",
                    "date": "2025-08-12",
                    "keywords": ["genomics", "computational biology", "bioinformatics"],
                    "deadline": "2025-05-20",
                    "relevance": 4
                },
                {
                    "name": "Future of Quantum Technologies Workshop",
                    "location": "London, UK",
                    "date": "2025-07-15",
                    "keywords": ["quantum computing", "quantum cryptography", "quantum sensing"],
                    "deadline": "2025-04-30",
                    "relevance": 5
                },
                {
                    "name": "International Symposium on Cybersecurity",
                    "location": "Tel Aviv, Israel",
                    "date": "2025-09-05",
                    "keywords": ["cybersecurity", "privacy", "ethical hacking"],
                    "deadline": "2025-06-15",
                    "relevance": 4
                },
                {
                    "name": "Space Exploration and Technology Summit",
                    "location": "Houston, TX, USA",
                    "date": "2025-11-15",
                    "keywords": ["space tech", "satellites", "Mars exploration"],
                    "deadline": "2025-08-30",
                    "relevance": 3
                },
                {
                    "name": "Digital Health and AI in Medicine Conference",
                    "location": "Berlin, Germany",
                    "date": "2025-10-10",
                    "keywords": ["AI in healthcare", "telemedicine", "medical AI"],
                    "deadline": "2025-07-25",
                    "relevance": 4
                },
                {
                    "name": "International Workshop on Natural Language Processing",
                    "location": "Seattle, WA, USA",
                    "date": "2025-08-28",
                    "keywords": ["NLP", "LLMs", "computational linguistics"],
                    "deadline": "2025-06-10",
                    "relevance": 5
                },
                {
                    "name": "Autonomous Vehicles and Smart Mobility Expo",
                    "location": "Detroit, MI, USA",
                    "date": "2025-09-18",
                    "keywords": ["self-driving cars", "autonomous systems", "smart cities"],
                    "deadline": "2025-07-05",
                    "relevance": 4
                },
                {
                    "name": "International Conference on Computer Vision",
                    "location": "Paris, France",
                    "date": "2025-10-22",
                    "keywords": ["computer vision", "image processing", "AI vision"],
                    "deadline": "2025-08-10",
                    "relevance": 4
                },
                {
                    "name": "Global Fintech Innovation Summit",
                    "location": "Hong Kong",
                    "date": "2025-11-05",
                    "keywords": ["fintech", "blockchain finance", "digital banking"],
                    "deadline": "2025-09-20",
                    "relevance": 3
                },
                {
                    "name": "Advanced Materials and Nanotechnology Conference",
                    "location": "Seoul, South Korea",
                    "date": "2025-09-08",
                    "keywords": ["nanotech", "graphene", "material science"],
                    "deadline": "2025-06-25",
                    "relevance": 4
                },
                {
                    "name": "International Symposium on Human-Computer Interaction",
                    "location": "Austin, TX, USA",
                    "date": "2025-07-30",
                    "keywords": ["HCI", "UX design", "interactive systems"],
                    "deadline": "2025-05-15",
                    "relevance": 3
                },
                {
                    "name": "AI for Social Good Workshop",
                    "location": "New York, NY, USA",
                    "date": "2025-10-15",
                    "keywords": ["AI ethics", "social impact", "responsible AI"],
                    "deadline": "2025-08-01",
                    "relevance": 4
                },
                {
                    "name": "International Conference on Biomedical Engineering",
                    "location": "Sydney, Australia",
                    "date": "2025-11-25",
                    "keywords": ["biomedical devices", "health tech", "medical imaging"],
                    "deadline": "2025-09-10",
                    "relevance": 4
                },
                {
                    "name": "Future of Work and Automation Forum",
                    "location": "Zurich, Switzerland",
                    "date": "2025-09-05",
                    "keywords": ["automation", "future workforce", "AI in business"],
                    "deadline": "2025-06-20",
                    "relevance": 3
                },
                {
                    "name": "International Conference on Data Science",
                    "location": "Barcelona, Spain",
                    "date": "2025-10-28",
                    "keywords": ["big data", "data analytics", "machine learning"],
                    "deadline": "2025-08-12",
                    "relevance": 5
                },
                {
                    "name": "Renewable Energy Storage Symposium",
                    "location": "Oslo, Norway",
                    "date": "2025-08-20",
                    "keywords": ["battery tech", "energy storage", "solar power"],
                    "deadline": "2025-06-05",
                    "relevance": 3
                },
                {
                    "name": "Global AI Safety Summit",
                    "location": "Geneva, Switzerland",
                    "date": "2025-12-10",
                    "keywords": ["AI alignment", "AI policy", "existential risk"],
                    "deadline": "2025-09-30",
                    "relevance": 5
                },
                {
                    "name": "International Workshop on Edge Computing",
                    "location": "Chicago, IL, USA",
                    "date": "2025-09-12",
                    "keywords": ["edge AI", "IoT", "distributed computing"],
                    "deadline": "2025-07-01",
                    "relevance": 4
                },
                {
                    "name": "Augmented and Virtual Reality Expo",
                    "location": "Los Angeles, CA, USA",
                    "date": "2025-11-08",
                    "keywords": ["AR/VR", "metaverse", "immersive tech"],
                    "deadline": "2025-08-22",
                    "relevance": 4
                },
                {
                    "name": "International Conference on Cybersecurity and Privacy",
                    "location": "Brussels, Belgium",
                    "date": "2025-10-17",
                    "keywords": ["data privacy", "cyber defense", "encryption"],
                    "deadline": "2025-08-05",
                    "relevance": 4
                },
                {
                    "name": "Global Health Tech Innovation Summit",
                    "location": "Dubai, UAE",
                    "date": "2025-11-30",
                    "keywords": ["digital health", "medical AI", "telemedicine"],
                    "deadline": "2025-09-15",
                    "relevance": 4
                },
                {
                    "name": "International Symposium on Wireless Communications",
                    "location": "Singapore",
                    "date": "2025-09-22",
                    "keywords": ["5G", "IoT", "wireless networks"],
                    "deadline": "2025-07-10",
                    "relevance": 3
                },
                {
                    "name": "AI in Finance and Trading Conference",
                    "location": "London, UK",
                    "date": "2025-10-08",
                    "keywords": ["algorithmic trading", "AI finance", "quantitative analysis"],
                    "deadline": "2025-08-15",
                    "relevance": 4
                },
                {
                    "name": "International Conference on Smart Cities",
                    "location": "Barcelona, Spain",
                    "date": "2025-11-12",
                    "keywords": ["urban tech", "IoT", "sustainable cities"],
                    "deadline": "2025-09-25",
                    "relevance": 3
                },
                {
                    "name": "Future of Quantum Communication Workshop",
                    "location": "Zurich, Switzerland",
                    "date": "2025-07-25",
                    "keywords": ["quantum networks", "quantum cryptography", "QKD"],
                    "deadline": "2025-05-10",
                    "relevance": 5
                },
                {
                    "name": "International Conference on Human-Robot Interaction",
                    "location": "Tokyo, Japan",
                    "date": "2025-10-14",
                    "keywords": ["HRI", "social robotics", "collaborative robots"],
                    "deadline": "2025-08-28",
                    "relevance": 4
                },
                {
                    "name": "Global Semiconductor Technology Forum",
                    "location": "Taipei, Taiwan",
                    "date": "2025-09-30",
                    "keywords": ["semiconductors", "chip design", "nanofabrication"],
                    "deadline": "2025-07-15",
                    "relevance": 4
                },
                {
                    "name": "International Workshop on Federated Learning",
                    "location": "Berlin, Germany",
                    "date": "2025-08-15",
                    "keywords": ["privacy-preserving AI", "distributed ML", "decentralized learning"],
                    "deadline": "2025-06-01",
                    "relevance": 4
                },
                {
                    "name": "AI in Education and EdTech Summit",
                    "location": "San Diego, CA, USA",
                    "date": "2025-10-25",
                    "keywords": ["adaptive learning", "AI tutors", "educational tech"],
                    "deadline": "2025-08-10",
                    "relevance": 3
                },
                {
                    "name": "International Conference on Cloud Computing",
                    "location": "Seattle, WA, USA",
                    "date": "2025-11-18",
                    "keywords": ["cloud AI", "serverless computing", "distributed systems"],
                    "deadline": "2025-09-05",
                    "relevance": 4
                },
                {
                    "name": "Global Conference on AI and Law",
                    "location": "Washington, D.C., USA",
                    "date": "2025-09-28",
                    "keywords": ["AI regulation", "legal tech", "algorithmic fairness"],
                    "deadline": "2025-07-12",
                    "relevance": 4
                },
                {
                    "name": "International Workshop on Synthetic Biology",
                    "location": "Boston, MA, USA",
                    "date": "2025-08-05",
                    "keywords": ["bioengineering", "genetic circuits", "synthetic life"],
                    "deadline": "2025-06-20",
                    "relevance": 4
                },
                {
                    "name": "Future of Quantum Machine Learning Symposium",
                    "location": "Toronto, Canada",
                    "date": "2025-10-20",
                    "keywords": ["quantum ML", "quantum-enhanced AI", "hybrid algorithms"],
                    "deadline": "2025-08-30",
                    "relevance": 5
                },
                {
                    "name": "International Conference on Autonomous Drones",
                    "location": "Munich, Germany",
                    "date": "2025-09-10",
                    "keywords": ["drone tech", "UAVs", "autonomous navigation"],
                    "deadline": "2025-07-25",
                    "relevance": 3
                },
                {
                    "name": "Global AI in Manufacturing Summit",
                    "location": "Shanghai, China",
                    "date": "2025-11-22",
                    "keywords": ["smart factories", "industrial AI", "predictive maintenance"],
                    "deadline": "2025-09-08",
                    "relevance": 4
                },
                {
                    "name": "International Workshop on Explainable AI",
                    "location": "Amsterdam, Netherlands",
                    "date": "2025-08-18",
                    "keywords": ["XAI", "interpretability", "transparent AI"],
                    "deadline": "2025-06-30",
                    "relevance": 4
                },
                {
                    "name": "Future of Digital Identity Conference",
                    "location": "Stockholm, Sweden",
                    "date": "2025-10-12",
                    "keywords": ["self-sovereign identity", "blockchain ID", "privacy tech"],
                    "deadline": "2025-08-20",
                    "relevance": 3
                },
                {
                    "name": "International Conference on AI in Agriculture",
                    "location": "Melbourne, Australia",
                    "date": "2025-11-28",
                    "keywords": ["precision farming", "agri-tech", "AI for food security"],
                    "deadline": "2025-09-18",
                    "relevance": 3
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
