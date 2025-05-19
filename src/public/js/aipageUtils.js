// aipageUtils.js

// Current user ID (would come from authentication in a real app)
const currentUserId = '87babb4c-2518-41bd-982e-bd235bdeaa54';

// API endpoints
function getApiBaseUrl() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
}

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

// Mock data for testing
const mockProjects = [
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

// Main functions to export
async function fetchUserProjects() {
    try {
        // In a real app, this would fetch from the API
        // For demo, we'll use mock data
        return mockProjects;
    } catch (error) {
        console.error('Error fetching user projects:', error);
        throw new Error('Failed to fetch user projects');
    }
}

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

module.exports = {
    currentUserId,
    getApiBaseUrl,
    userResearchProfile,
    mockProjects,
    generateUniqueId,
    capitalizeFirstLetter,
    formatDate,
    formatTimeframe,
    getSuggestionTypeIcon,
    generateRelevanceDots,
    fetchUserProjects,
    generateMockSuggestions,
    generateCollaborationSuggestions,
    generateFundingSuggestions,
    generatePaperSuggestions,
    generateResourceSuggestions,
    generateEventSuggestions
};