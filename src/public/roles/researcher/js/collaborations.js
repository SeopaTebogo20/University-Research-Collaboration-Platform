
// Store for collaborators and filter state
let allCollaborators = [];
let filteredCollaborators = [];
let currentFilter = 'all';
let currentResearcher = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  loadCollaborators();
  
  // Event Listeners
  document.getElementById('search-button').addEventListener('click', searchCollaborators);
  document.getElementById('collaborator-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchCollaborators();
    }
  });
  
  document.getElementById('close-profile-modal').addEventListener('click', closeProfileModal);
  document.getElementById('close-profile').addEventListener('click', closeProfileModal);
  
  document.getElementById('message-researcher').addEventListener('click', messageResearcher);
  document.getElementById('invite-to-project').addEventListener('click', showInviteToProjectModal);
  
  document.getElementById('close-invite-project-modal').addEventListener('click', closeInviteProjectModal);
  document.getElementById('cancel-project-invite').addEventListener('click', closeInviteProjectModal);
  document.getElementById('send-project-invite').addEventListener('click', sendProjectInvitation);
  
  // Filter options
  document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      filterCollaborators(filter);
      
      // Update active filter UI
      document.querySelectorAll('.filter-option').forEach(opt => {
        opt.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
});

// Load collaborators
async function loadCollaborators() {
  try {
    // In a real application, this would fetch from an API
    // For demo, we'll use mock data
    const mockCollaborators = [
      {
        id: "c1",
        name: "Dr. Emily Chen",
        title: "Assistant Professor of Bioinformatics",
        institution: "Pacific University",
        department: "Computational Biology",
        email: "e.chen@pacific.edu",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        bio: "Dr. Chen specializes in developing computational methods for analyzing high-throughput genomic data with applications in cancer research and personalized medicine.",
        skills: ["RNA-seq", "Bioinformatics", "Python", "R", "Machine Learning", "Single-cell Analysis"],
        publications: 28,
        citations: 450,
        projects: 8,
        collaborations: 12,
        isCollaborator: true,
        isSameField: true,
        isSameInstitution: false,
        isRecommended: true,
        education: [
          {
            degree: "Ph.D. in Bioinformatics",
            institution: "Stanford University",
            year: "2018"
          },
          {
            degree: "M.S. in Computer Science",
            institution: "University of California, Berkeley",
            year: "2014"
          },
          {
            degree: "B.S. in Biology",
            institution: "MIT",
            year: "2012"
          }
        ],
        experience: [
          {
            title: "Assistant Professor",
            organization: "Pacific University",
            period: "2018 - Present"
          },
          {
            title: "Postdoctoral Researcher",
            organization: "Stanford Medicine",
            period: "2016 - 2018"
          }
        ],
        projects: [
          "Genomic Analysis of Drug Resistance in Cancer",
          "Machine Learning for Predicting Treatment Responses",
          "Systems Biology of Tumor Microenvironments"
        ]
      },
      {
        id: "c2",
        name: "Prof. Michael Rodriguez",
        title: "Associate Professor of Marine Biology",
        institution: "Coastal Science Institute",
        department: "Marine Ecosystems",
        email: "m.rodriguez@csi.edu",
        phone: "+1 (555) 987-6543",
        location: "Miami, FL",
        bio: "Prof. Rodriguez studies the impacts of climate change on coral reef ecosystems and develops strategies for marine conservation and restoration.",
        skills: ["Coral Reef Ecology", "Climate Science", "Field Research", "Ecological Modeling", "Conservation Biology"],
        publications: 45,
        citations: 780,
        projects: 12,
        collaborations: 20,
        isCollaborator: true,
        isSameField: false,
        isSameInstitution: false,
        isRecommended: true,
        education: [
          {
            degree: "Ph.D. in Marine Biology",
            institution: "University of Miami",
            year: "2010"
          },
          {
            degree: "M.S. in Ecology",
            institution: "University of Florida",
            year: "2006"
          },
          {
            degree: "B.S. in Environmental Science",
            institution: "University of California, San Diego",
            year: "2004"
          }
        ],
        experience: [
          {
            title: "Associate Professor",
            organization: "Coastal Science Institute",
            period: "2016 - Present"
          },
          {
            title: "Assistant Professor",
            organization: "University of Florida",
            period: "2010 - 2016"
          },
          {
            title: "Research Scientist",
            organization: "NOAA",
            period: "2008 - 2010"
          }
        ],
        projects: [
          "Climate Change Effects on Coral Reef Biosectionersity",
          "Restoration Ecology in Marine Ecosystems",
          "Sustainable Management of Coastal Resources"
        ]
      },
      {
        id: "c3",
        name: "Dr. Sarah Kim",
        title: "Research Scientist",
        institution: "Medical Research Foundation",
        department: "AI in Healthcare",
        email: "s.kim@mrf.org",
        phone: "+1 (555) 345-6789",
        location: "Boston, MA",
        bio: "Dr. Kim develops deep learning algorithms for medical image analysis, focusing on early detection of diseases and improving diagnostic accuracy.",
        skills: ["Deep Learning", "Medical Imaging", "Neural Networks", "TensorFlow", "PyTorch", "Computer Vision"],
        publications: 32,
        citations: 530,
        projects: 7,
        collaborations: 15,
        isCollaborator: false,
        isSameField: true,
        isSameInstitution: true,
        isRecommended: true,
        education: [
          {
            degree: "Ph.D. in Computer Science",
            institution: "Massachusetts Institute of Technology",
            year: "2017"
          },
          {
            degree: "M.S. in Biomedical Engineering",
            institution: "Johns Hopkins University",
            year: "2013"
          },
          {
            degree: "B.S. in Electrical Engineering",
            institution: "Carnegie Mellon University",
            year: "2011"
          }
        ],
        experience: [
          {
            title: "Research Scientist",
            organization: "Medical Research Foundation",
            period: "2019 - Present"
          },
          {
            title: "AI Researcher",
            organization: "HealthTech Solutions",
            period: "2017 - 2019"
          },
          {
            title: "Data Science Intern",
            organization: "Google Health",
            period: "2016 - 2017"
          }
        ],
        projects: [
          "Deep Learning for Early Cancer Detection",
          "Automated Diagnosis of Neurological Disorders",
          "AI-assisted Radiology Workflow Optimization"
        ]
      },
      {
        id: "c4",
        name: "Dr. James Wilson",
        title: "Professor of Computer Science",
        institution: "Tech University",
        department: "Artificial Intelligence",
        email: "j.wilson@techu.edu",
        phone: "+1 (555) 234-5678",
        location: "Seattle, WA",
        bio: "Dr. Wilson researches advanced machine learning techniques with applications in natural language processing and multimodal learning systems.",
        skills: ["Machine Learning", "Natural Language Processing", "Deep Learning", "Reinforcement Learning", "Computer Vision"],
        publications: 78,
        citations: 1350,
        projects: 15,
        collaborations: 30,
        isCollaborator: false,
        isSameField: false,
        isSameInstitution: false,
        isRecommended: true,
        education: [
          {
            degree: "Ph.D. in Computer Science",
            institution: "Carnegie Mellon University",
            year: "2005"
          },
          {
            degree: "M.S. in Artificial Intelligence",
            institution: "Stanford University",
            year: "2001"
          },
          {
            degree: "B.S. in Computer Science",
            institution: "University of Washington",
            year: "1999"
          }
        ],
        experience: [
          {
            title: "Professor",
            organization: "Tech University",
            period: "2015 - Present"
          },
          {
            title: "Associate Professor",
            organization: "University of Washington",
            period: "2010 - 2015"
          },
          {
            title: "Senior Research Scientist",
            organization: "Microsoft Research",
            period: "2005 - 2010"
          }
        ],
        projects: [
          "Neural Architectures for Multimodal Understanding",
          "Ethical AI and Algorithmic Fairness",
          "Large Language Models for Scientific Discovery"
        ]
      },
      {
        id: "c5",
        name: "Dr. Lisa Martinez",
        title: "Associate Professor of Genetics",
        institution: "State University Medical Center",
        department: "Human Genetics",
        email: "l.martinez@sumc.edu",
        phone: "+1 (555) 876-5432",
        location: "Chicago, IL",
        bio: "Dr. Martinez studies genetic factors contributing to complex diseases, utilizing advanced genomic technologies and computational approaches to identify therapeutic targets.",
        skills: ["Genomics", "CRISPR", "Genetic Engineering", "Molecular Biology", "Next-generation Sequencing"],
        publications: 42,
        citations: 890,
        projects: 9,
        collaborations: 18,
        isCollaborator: true,
        isSameField: true,
        isSameInstitution: false,
        isRecommended: false,
        education: [
          {
            degree: "Ph.D. in Genetics",
            institution: "Harvard University",
            year: "2011"
          },
          {
            degree: "M.D.",
            institution: "University of Chicago",
            year: "2007"
          },
          {
            degree: "B.S. in Biochemistry",
            institution: "Yale University",
            year: "2003"
          }
        ],
        experience: [
          {
            title: "Associate Professor",
            organization: "State University Medical Center",
            period: "2017 - Present"
          },
          {
            title: "Assistant Professor",
            organization: "Northwestern University",
            period: "2011 - 2017"
          },
          {
            title: "Clinical Research Fellow",
            organization: "Massachusetts General Hospital",
            period: "2009 - 2011"
          }
        ],
        projects: [
          "Genetic Basis of Autoimmune Disorders",
          "CRISPR Applications in Genetic Disease Treatment",
          "Personalized Genomic Medicine"
        ]
      }
    ];
    
    allCollaborators = mockCollaborators;
    filteredCollaborators = [...allCollaborators];
    renderCollaborators();
  } catch (error) {
    console.error('Error loading collaborators:', error);
    showToast('error', 'Error', 'Failed to load collaborators. Please try again.');
  }
}

// Render collaborators
function renderCollaborators() {
  const container = document.getElementById('collaborators-grid');
  container.innerHTML = '';
  
  if (filteredCollaborators.length === 0) {
    container.innerHTML = `
      <section class="col-nav-full text-center py-12">
        <section class="text-6xl mb-4 text-gray-300">
          <i class="fas fa-users"></i>
        </section>
        <h3 class="text-xl font-semibold text-gray-500">No Collaborators Found</h3>
        <p class="text-gray-400 mt-2">Try changing your search criteria or filters</p>
      </section>
    `;
    return;
  }
  
  filteredCollaborators.forEach(collaborator => {
    const collaboratorCard = document.createElement('section');
    collaboratorCard.className = 'collaborator-card';
    collaboratorCard.innerHTML = `
      <section class="collaborator-header">
        <section class="collaborator-avatar">
          ${getInitials(collaborator.name)}
        </section>
        <h3 class="collaborator-name">${collaborator.name}</h3>
        <p class="collaborator-title">${collaborator.title}</p>
      </section>
      
      <section class="collaborator-body">
        <section class="collaborator-info">
          <section class="collaborator-info-label">Institution</section>
          <section class="collaborator-info-value">${collaborator.institution}</section>
        </section>
        
        <section class="collaborator-info">
          <section class="collaborator-info-label">Department</section>
          <section class="collaborator-info-value">${collaborator.department}</section>
        </section>
        
        <section class="collaborator-info">
          <section class="collaborator-info-label">Research Focus</section>
          <section class="collaborator-info-value">${truncateText(collaborator.bio, 100)}</section>
        </section>
        
        <section class="collaborator-info">
          <section class="collaborator-info-label">Skills & Expertise</section>
          <section class="collaborator-skills">
            ${collaborator.skills.slice(0, 4).map(skill => 
              `<section class="collaborator-skill">${skill}</section>`
            ).join('')}
            ${collaborator.skills.length > 4 ? `<section class="collaborator-skill">+${collaborator.skills.length - 4} more</section>` : ''}
          </section>
        </section>
      </section>
      
      <section class="collaborator-footer">
        <button class="collaborator-action collaborator-view" data-id="${collaborator.id}">
          <i class="fas fa-user mr-2"></i> View Profile
        </button>
        ${collaborator.isCollaborator ? `
          <button class="collaborator-action collaborator-message" data-id="${collaborator.id}">
            <i class="fas fa-envelope mr-2"></i> Message
          </button>
        ` : `
          <button class="collaborator-action collaborator-invite" data-id="${collaborator.id}">
            <i class="fas fa-user-plus mr-2"></i> Invite
          </button>
        `}
      </section>
    `;
    
    container.appendChild(collaboratorCard);
    
    // Add event listeners
    collaboratorCard.querySelector('.collaborator-view').addEventListener('click', () => {
      viewResearcherProfile(collaborator.id);
    });
    
    if (collaborator.isCollaborator) {
      collaboratorCard.querySelector('.collaborator-message').addEventListener('click', () => {
        window.location.href = 'messaging.html';
        // Alternatively, show a message modal
        // messageResearcher(collaborator.id);
      });
    } else {
      collaboratorCard.querySelector('.collaborator-invite').addEventListener('click', () => {
        inviteResearcher(collaborator.id);
      });
    }
  });
}

// Search collaborators
function searchCollaborators() {
  const searchQuery = document.getElementById('collaborator-search').value.trim().toLowerCase();
  
  if (!searchQuery) {
    filteredCollaborators = filterByCategory(allCollaborators, currentFilter);
    renderCollaborators();
    return;
  }
  
  // Filter collaborators based on search query and current filter
  const searchResults = allCollaborators.filter(collaborator => {
    return (
      collaborator.name.toLowerCase().includes(searchQuery) ||
      collaborator.title.toLowerCase().includes(searchQuery) ||
      collaborator.institution.toLowerCase().includes(searchQuery) ||
      collaborator.department.toLowerCase().includes(searchQuery) ||
      collaborator.bio.toLowerCase().includes(searchQuery) ||
      collaborator.skills.some(skill => skill.toLowerCase().includes(searchQuery))
    );
  });
  
  filteredCollaborators = filterByCategory(searchResults, currentFilter);
  renderCollaborators();
}

// Filter collaborators by category
function filterCollaborators(filter) {
  currentFilter = filter;
  filteredCollaborators = filterByCategory(allCollaborators, filter);
  renderCollaborators();
}

// Apply category filter
function filterByCategory(collaborators, filter) {
  switch (filter) {
    case 'all':
      return collaborators;
    case 'collaborators':
      return collaborators.filter(c => c.isCollaborator);
    case 'recommended':
      return collaborators.filter(c => c.isRecommended);
    case 'same-field':
      return collaborators.filter(c => c.isSameField);
    case 'same-institution':
      return collaborators.filter(c => c.isSameInstitution);
    default:
      return collaborators;
  }
}

// View researcher profile
function viewResearcherProfile(researcherId) {
  const researcher = allCollaborators.find(c => c.id === researcherId);
  if (!researcher) return;
  
  currentResearcher = researcher;
  
  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = `
    <section class="collaborator-profile">
      <section class="profile-header">
        <section class="profile-avatar">
          ${getInitials(researcher.name)}
        </section>
        <h2 class="profile-name">${researcher.name}</h2>
        <p class="profile-title">${researcher.title}</p>
        <p class="text-center">
          <i class="fas fa-map-marker-alt mr-1"></i> ${researcher.location}
        </p>
        
        <section class="profile-stats">
          <section class="profile-stat">
            <section class="profile-stat-value">${researcher.publications}</section>
            <section class="profile-stat-label">Publications</section>
          </section>
          <section class="profile-stat">
            <section class="profile-stat-value">${researcher.citations}</section>
            <section class="profile-stat-label">Citations</section>
          </section>
          <section class="profile-stat">
            <section class="profile-stat-value">${researcher.projects}</section>
            <section class="profile-stat-label">Projects</section>
          </section>
          <section class="profile-stat">
            <section class="profile-stat-value">${researcher.collaborations}</section>
            <section class="profile-stat-label">Collaborations</section>
          </section>
        </section>
        
        <section class="profile-actions">
          <button class="profile-action">
            <i class="fas fa-envelope"></i> Contact
          </button>
          <button class="profile-action">
            <i class="fas fa-user-plus"></i> Connect
          </button>
          <button class="profile-action">
            <i class="fas fa-share-alt"></i> Share
          </button>
        </section>
      </section>
      
      <section class="profile-content">
        <section class="profile-section">
          <h3 class="profile-section-title">Biography</h3>
          <p>${researcher.bio}</p>
        </section>
        
        <section class="profile-section">
          <h3 class="profile-section-title">Contact Information</h3>
          <p><i class="fas fa-envelope mr-2"></i> ${researcher.email}</p>
          <p><i class="fas fa-phone mr-2"></i> ${researcher.phone}</p>
        </section>
        
        <section class="profile-section">
          <h3 class="profile-section-title">Skills & Expertise</h3>
          <section class="expertise-tags">
            ${researcher.skills.map(skill => 
              `<section class="expertise-tag">${skill}</section>`
            ).join('')}
          </section>
        </section>
        
        <section class="profile-section">
          <h3 class="profile-section-title">Education</h3>
          ${researcher.education.map(edu => `
            <section class="education-item">
              <section class="education-degree">${edu.degree}</section>
              <section class="education-institution">${edu.institution}</section>
              <section class="education-date">${edu.year}</section>
            </section>
          `).join('')}
        </section>
        
        <section class="profile-section">
          <h3 class="profile-section-title">Experience</h3>
          ${researcher.experience.map(exp => `
            <section class="experience-item">
              <section class="experience-title">${exp.title}</section>
              <section class="experience-company">${exp.organization}</section>
              <section class="experience-date">${exp.period}</section>
            </section>
          `).join('')}
        </section>
        
        <section class="profile-section">
          <h3 class="profile-section-title">Current Projects</h3>
          <ul class="list-disc list-inside">
            ${researcher.projects.map(project => 
              `<li class="mb-2">${project}</li>`
            ).join('')}
          </ul>
        </section>
      </section>
    </section>
  `;
  
  document.getElementById('profile-modal').classList.add('active');
}

// Message researcher
function messageResearcher() {
  if (!currentResearcher) return;
  
  // Redirect to messaging page
  window.location.href = '/messaging';
  
  // Alternatively, show a message modal or toast
  // showToast('info', 'Messaging', `Opening conversation with ${currentResearcher.name}`);
}

// Show invite to project modal
function showInviteToProjectModal() {
  if (!currentResearcher) return;
  
  // Close the profile modal
  closeProfileModal();
  
  // Display researcher info in the invite modal
  const researcherInfo = document.getElementById('invite-researcher-info');
  researcherInfo.innerHTML = `
    <section class="flex items-center p-4 bg-gray-50 rounded-lg">
      <section class="w-12 h-12 rounded-full bg-research-primary flex items-center justify-center text-white font-semibold mr-4">
        ${getInitials(currentResearcher.name)}
      </section>
      <section>
        <h3 class="font-semibold">${currentResearcher.name}</h3>
        <p class="text-sm text-gray-600">${currentResearcher.title}</p>
      </section>
    </section>
  `;
  
  // Populate project select dropdown
  populateProjectSelect();
  
  // Reset invitation message
  document.getElementById('project-invite-message').value = '';
  
  // Show the invite project modal
  document.getElementById('invite-project-modal').classList.add('active');
}

// Populate project select dropdown
function populateProjectSelect() {
  const selectElement = document.getElementById('invite-project-select');
  selectElement.innerHTML = '';
  
  // In a real application, this would fetch from an API
  // For demo, we'll use mock data
  const mockProjects = [
    { id: "p1", title: "Gene Expression Analysis in Cancer Cells" },
    { id: "p2", title: "Climate Change Impact on Marine Ecosystems" },
    { id: "p3", title: "Neural Networks for Medical Diagnosis" }
  ];
  
  mockProjects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.title;
    selectElement.appendChild(option);
  });
}

// Send project invitation
function sendProjectInvitation() {
  if (!currentResearcher) return;
  
  const projectId = document.getElementById('invite-project-select').value;
  const projectName = document.getElementById('invite-project-select').options[document.getElementById('invite-project-select').selectedIndex].text;
  const message = document.getElementById('project-invite-message').value;
  
  if (!message.trim()) {
    showToast('warning', 'Message Required', 'Please write an invitation message.');
    return;
  }
  
  // In a real application, this would send invitation via an API
  // For demo, we'll just show a toast
  showToast('success', 'Invitation Sent', `Invitation sent to ${currentResearcher.name} for project "${projectName}"`);
  
  closeInviteProjectModal();
}

// Invite researcher (direct action from collaborator card)
function inviteResearcher(researcherId) {
  const researcher = allCollaborators.find(c => c.id === researcherId);
  if (!researcher) return;
  
  currentResearcher = researcher;
  showInviteToProjectModal();
}

// Helper functions
function getInitials(name) {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('');
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Modal control functions
function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('active');
}

function closeInviteProjectModal() {
  document.getElementById('invite-project-modal').classList.remove('active');
}

// Toast notification function
function showToast(type, title, message) {
  const toastContainer = document.querySelector('.toast-container');
  
  const toast = document.createElement('section');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <section class="toast-icon">
      <i class="fas ${getToastIcon(type)}"></i>
    </section>
    <section class="toast-content">
      <h3 class="toast-title">${title}</h3>
      <p class="toast-message">${message}</p>
    </section>
    <button class="toast-close">&times;</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Activate toast with a slight delay for animation
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);
  
  // Set up event listener for close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 300); // Wait for animation to complete
  });
  
  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) { // Check if toast is still in the DOM
      toast.classList.remove('active');
      setTimeout(() => {
        if (toast.parentNode) { // Check again before removing
          toast.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Get icon class for toast type
function getToastIcon(type) {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-times-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'info': return 'fa-info-circle';
    default: return 'fa-info-circle';
  }
}
