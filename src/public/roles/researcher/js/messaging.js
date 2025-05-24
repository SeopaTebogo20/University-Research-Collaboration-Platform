document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todayMessages = document.getElementById('today-section');
    const yesterdayMessages = document.getElementById('yesterday-notifications');
    const earlierMessages = document.getElementById('earlier-messages');
    const searchInput = document.getElementById('search-messages');
    const filterTags = document.querySelectorAll('.filter-tag');
    const emptyState = document.getElementById('empty-messages');
    const markAllReadBtn = document.getElementById('mark-all-read');
    const messageModal = document.getElementById('message-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, #modal-dismiss');
    const modalActionBtn = document.getElementById('modal-action');
    
    // State variables
    let messages = [];
    let filteredMessages = [];
    let currentPage = 1;
    let currentFilter = 'all';
    let currentSearchTerm = '';
    const itemsPerPage = 5;
    
    // Load invitation messages from mock data
    function loadInvitationMessages() {
        return [
            {
                "id": "INV004",
                "projectId": "EXT235",
                "projectTitle": "Biodegradable Polymers for Marine Applications",
                "invitedBy": {
                    "name": "Dr. Rebecca Chang",
                    "title": "Head of Materials Science Division",
                    "institution": "Ocean Conservation Institute",
                    "email": "r.chang@oci.org"
                },
                "invitedDate": "2025-04-20T08:43:19.502Z",
                "status": "declined",
                "description": "Developing novel biodegradable polymers that can replace conventional plastics in marine environments",
                "requiredSkills": [
                    "Polymer Chemistry",
                    "Materials Science",
                    "Environmental Assessment",
                    "Biodegradation Testing"
                ],
                "duration": "15 months",
                "messages": [
                    {
                        "text": "fsgsfs",
                        "sender": "you",
                        "timestamp": "2025-05-23T20:33:33.774Z"
                    },
                    {
                        "text": "gt",
                        "sender": "you",
                        "timestamp": "2025-05-23T20:36:01.223Z"
                    },
                    {
                        "text": "gfh",
                        "sender": "you",
                        "timestamp": "2025-05-23T20:36:24.803Z"
                    }
                ]
            },
            {
                "id": "INV005",
                "projectId": "EXT367",
                "projectTitle": "Blockchain Solutions for Academic Publishing",
                "invitedBy": {
                    "name": "Prof. David Kim",
                    "title": "Director of Digital Innovation",
                    "institution": "National Science Academy",
                    "email": "d.kim@nsa.edu"
                },
                "invitedDate": "2025-04-20T15:22:08.114Z",
                "status": "accepted",
                "description": "Creating a blockchain-based platform for transparent peer review and academic publishing processes",
                "requiredSkills": [
                    "Blockchain Technology",
                    "Smart Contracts",
                    "Academic Publishing",
                    "Software Architecture"
                ],
                "duration": "8 months",
                "messages": [
                    {
                        "text": "This project aligns perfectly with my interests in digital academic infrastructure. I'm excited to join!",
                        "sender": "you",
                        "timestamp": "2025-04-21T09:17:32.221Z"
                    },
                    {
                        "text": "Wonderful! We'll schedule a kickoff meeting next week. Looking forward to your contributions.",
                        "sender": "inviter",
                        "timestamp": "2025-04-21T10:33:45.667Z"
                    },
                    {
                        "text": "gre",
                        "sender": "you",
                        "timestamp": "2025-05-13T22:31:21.313Z"
                    }
                ]
            },
            {
                "id": "INV006",
                "projectId": "EXT498",
                "projectTitle": "AI-Powered Early Warning Systems for Natural Disasters",
                "invitedBy": {
                    "name": "Dr. James Wilson",
                    "title": "Chief Scientist",
                    "institution": "Global Disaster Response Network",
                    "email": "j.wilson@gdrn.org"
                },
                "invitedDate": "2025-04-21T07:36:54.327Z",
                "status": "pending",
                "description": "Leveraging artificial intelligence to improve early detection and warning systems for earthquakes, tsunamis, and severe weather events",
                "requiredSkills": [
                    "Machine Learning",
                    "Geophysical Modeling",
                    "Early Warning Systems",
                    "Data Integration",
                    "Sensor Networks"
                ],
                "duration": "24 months",
                "messages": [
                    {
                        "text": "Your project sounds fascinating. Could you provide more details about the specific AI techniques you're planning to implement?",
                        "sender": "you",
                        "timestamp": "2025-04-21T16:42:11.893Z"
                    },
                    {
                        "text": "We're looking at deep learning models trained on seismic data and atmospheric patterns, combined with IoT sensor networks. Happy to discuss more if you're interested in joining us.",
                        "sender": "inviter",
                        "timestamp": "2025-04-21T18:05:27.442Z"
                    }
                ]
            },
            {
                "id": "INV007",
                "projectId": "EXT512",
                "projectTitle": "Precision Medicine Approaches for Neurological Disorders",
                "invitedBy": {
                    "name": "Dr. Sarah Nguyen",
                    "title": "Research Director",
                    "institution": "Neuroscience Research Foundation",
                    "email": "s.nguyen@neuro.org"
                },
                "invitedDate": "2025-04-21T13:19:22.776Z",
                "status": "declined",
                "description": "Developing personalized treatment protocols for complex neurological disorders using genomic profiling and advanced imaging techniques",
                "requiredSkills": [
                    "Genomics",
                    "Neurology",
                    "Medical Imaging Analysis",
                    "Precision Medicine",
                    "Bioinformatics"
                ],
                "duration": "36 months",
                "messages": [
                    {
                        "text": "While I'm honored by the invitation, I don't have sufficient expertise in neurological disorders to contribute meaningfully to this project. I suggest reaching out to Dr. Maya Patel, who specializes in this field.",
                        "sender": "you",
                        "timestamp": "2025-04-22T10:08:17.332Z"
                    },
                    {
                        "text": "Thank you for your candid response and for suggesting an alternative collaborator. We appreciate your consideration.",
                        "sender": "inviter",
                        "timestamp": "2025-04-22T11:15:42.908Z"
                    }
                ]
            },
            {
                "id": "INV008",
                "projectId": "EXT629",
                "projectTitle": "Sustainable Urban Microgrids",
                "invitedBy": {
                    "name": "Prof. Elena Rodriguez",
                    "title": "Chair of Sustainable Energy Systems",
                    "institution": "Urban Planning Institute",
                    "email": "e.rodriguez@upi.edu"
                },
                "invitedDate": "2025-04-22T09:45:13.552Z",
                "status": "pending",
                "description": "Designing and implementing renewable energy microgrids for urban communities with a focus on resilience and sustainability",
                "requiredSkills": [
                    "Renewable Energy",
                    "Power Systems Engineering",
                    "Smart Grid Technology",
                    "Urban Planning",
                    "Energy Storage Solutions"
                ],
                "duration": "18 months",
                "messages": [
                    {
                        "text": "This is an intriguing project that aligns with my research interests. Could you share more about the specific communities you're targeting and any pilot implementations?",
                        "sender": "you",
                        "timestamp": "2025-04-22T10:22:37.189Z"
                    }
                ]
            }
        ];
    }

    // Convert invitation messages to message format
    // Update the convertInvitationMessagesToMessages function
function convertInvitationMessagesToMessages(invitations) {
    const allMessages = [];
    
    invitations.forEach(invitation => {
        if (invitation.messages && invitation.messages.length > 0) {
            invitation.messages.forEach(message => {
                const messageObj = {
                    id: `${invitation.id}_${message.timestamp}`,
                    title: `Message regarding ${invitation.projectTitle}`,
                    text: message.text,
                    timestamp: new Date(message.timestamp),
                    unread: isRecentMessage(message.timestamp),
                    status: invitation.status,
                    sender: message.sender,
                    projectInfo: {
                        projectTitle: invitation.projectTitle,
                        invitedBy: invitation.invitedBy,
                        description: invitation.description,
                        projectId: invitation.projectId
                    }
                };
                allMessages.push(messageObj);
            });
        }
    });
    
    // Sort messages by timestamp (newest first)
    return allMessages.sort((a, b) => b.timestamp - a.timestamp);
}

    // Check if message is recent (within last 24 hours) to mark as unread
    function isRecentMessage(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const timeDiff = now - messageTime;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return timeDiff < twentyFourHours;
    }

    // Format timestamp
    function formatTimestamp(timestamp) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const messageDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
        
        if (messageDate.getTime() === today.getTime()) {
            // Today, show time
            return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (messageDate.getTime() === yesterday.getTime()) {
            // Yesterday, show "Yesterday at [time]"
            return `Yesterday at ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            // More than a day ago, show date
            return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    // Group messages by date
    function groupMessagesByDate(messagesArray) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayMsgs = [];
        const yesterdayMsgs = [];
        const earlierMsgs = [];
        
        messagesArray.forEach(message => {
            const msgDate = new Date(message.timestamp.getFullYear(), message.timestamp.getMonth(), message.timestamp.getDate());
            
            if (msgDate.getTime() === today.getTime()) {
                todayMsgs.push(message);
            } else if (msgDate.getTime() === yesterday.getTime()) {
                yesterdayMsgs.push(message);
            } else {
                earlierMsgs.push(message);
            }
        });
        
        return {
            today: todayMsgs,
            yesterday: yesterdayMsgs,
            earlier: earlierMsgs
        };
    }

    // Create message HTML element
    function createMessageElement(message) {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${message.unread ? 'unread' : ''}`;
    messageItem.dataset.id = message.id;
    messageItem.dataset.status = message.status;
    
    const senderLabel = message.sender === 'you' ? 'You' : message.projectInfo.invitedBy.name;
    const statusBadge = `<span class="status-badge ${message.status}">${message.status.charAt(0).toUpperCase() + message.status.slice(1)}</span>`;
    
    messageItem.innerHTML = `
        <div class="message-icon">
            <i class="fas fa-envelope"></i>
        </div>
        <div class="message-content">
            <div class="message-title">
                ${message.title}
                ${statusBadge}
            </div>
            <p class="message-text"><strong>${senderLabel}:</strong> ${message.text}</p>
            <div class="message-meta">
                <span class="message-timestamp">${formatTimestamp(message.timestamp)}</span>
                <span class="message-project">Project: ${message.projectInfo.projectTitle}</span>
            </div>
        </div>
    `;
    
    // Add click event to open the message detail modal
    messageItem.addEventListener('click', () => openMessageDetail(message));
    
    return messageItem;
}
    // Render messages by date groups
    function renderMessages() {
    // Clear all containers
    document.getElementById('today-messages').innerHTML = '';
    document.getElementById('yesterday-messages').innerHTML = '';
    document.getElementById('earlier-messages').innerHTML = '';
    
    // Apply filters and search before displaying
    applyFiltersAndSearch();
    
    // Get paginated subset
    const paginatedMessages = getPaginatedMessages();
    
    // Group by date
    const groupedMsgs = groupMessagesByDate(paginatedMessages);
    
    // Hide date sections if empty
    document.getElementById('today-section').style.display = groupedMsgs.today.length ? 'block' : 'none';
    document.getElementById('yesterday-section').style.display = groupedMsgs.yesterday.length ? 'block' : 'none';
    document.getElementById('earlier-section').style.display = groupedMsgs.earlier.length ? 'block' : 'none';
    
    // Show empty state if all sections are empty
    document.getElementById('empty-messages').style.display = 
        (groupedMsgs.today.length || groupedMsgs.yesterday.length || groupedMsgs.earlier.length) ? 
        'none' : 'flex';
    
    // Render messages in each section
    groupedMsgs.today.forEach(message => {
        document.getElementById('today-messages').appendChild(createMessageElement(message));
    });
    
    groupedMsgs.yesterday.forEach(message => {
        document.getElementById('yesterday-messages').appendChild(createMessageElement(message));
    });
    
    groupedMsgs.earlier.forEach(message => {
        document.getElementById('earlier-messages').appendChild(createMessageElement(message));
    });
    
    // Update pagination
    updatePagination();
}

    // Apply filters and search
    function applyFiltersAndSearch() {
        filteredMessages = [...messages];
        
        // Apply status filter
        if (currentFilter !== 'all') {
            if (currentFilter === 'unread') {
                filteredMessages = filteredMessages.filter(m => m.unread);
            } else {
                filteredMessages = filteredMessages.filter(m => m.status === currentFilter);
            }
        }
        
        // Apply search
        if (currentSearchTerm) {
            const searchLower = currentSearchTerm.toLowerCase();
            filteredMessages = filteredMessages.filter(m => 
                m.title.toLowerCase().includes(searchLower) || 
                m.text.toLowerCase().includes(searchLower) ||
                m.projectInfo.projectTitle.toLowerCase().includes(searchLower) ||
                m.projectInfo.invitedBy.name.toLowerCase().includes(searchLower)
            );
        }
        
        // Reset to page 1 when filters change
        currentPage = 1;
    }

    // Get paginated subset of messages
    function getPaginatedMessages() {
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        return filteredMessages.slice(startIdx, endIdx);
    }

    // Update pagination controls and info
    function updatePagination() {
        const totalPages = Math.max(1, Math.ceil(filteredMessages.length / itemsPerPage));
        
        document.getElementById('pagination-info').textContent = `Page ${currentPage} of ${totalPages}`;
        
        document.getElementById('prev-page').disabled = currentPage <= 1;
        document.getElementById('next-page').disabled = currentPage >= totalPages;
    }

    // Open message detail modal
    function openMessageDetail(message) {
        // Set modal content
        document.getElementById('modal-message-title').textContent = message.title;
        document.getElementById('modal-message-time').textContent = formatTimestamp(message.timestamp);
        
        const senderName = message.sender === 'you' ? 'You' : message.projectInfo.invitedBy.name;
        
        document.getElementById('modal-message-content').innerHTML = `
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Project:</strong> ${message.projectInfo.projectTitle}</p>
            <p><strong>Status:</strong> ${message.status.charAt(0).toUpperCase() + message.status.slice(1)}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message.text}</p>
            <hr>
            <p><strong>Project Description:</strong> ${message.projectInfo.description}</p>
            <p><strong>Invited By:</strong> ${message.projectInfo.invitedBy.name}</p>
            <p><strong>Institution:</strong> ${message.projectInfo.invitedBy.institution}</p>
        `;
        
        // Set action button
        modalActionBtn.textContent = 'View Project';
        modalActionBtn.onclick = () => {
            window.location.href = `project-details.html?id=${message.projectInfo.projectId}`;
        };
        
        // Mark as read if unread
        if (message.unread) {
            markMessageAsRead(message.id);
        }
        
        // Show modal
        messageModal.style.display = 'flex';
    }

    // Mark message as read
    function markMessageAsRead(messageId) {
        const msgIndex = messages.findIndex(m => m.id === messageId);
        if (msgIndex !== -1 && messages[msgIndex].unread) {
            messages[msgIndex].unread = false;
            
            // Update UI
            const msgElement = document.querySelector(`.message-item[data-id="${messageId}"]`);
            if (msgElement) {
                msgElement.classList.remove('unread');
            }
        }
    }

    // Mark all messages as read
    function markAllAsRead() {
        let hasUnreadMessages = false;
        
        messages.forEach(message => {
            if (message.unread) {
                message.unread = false;
                hasUnreadMessages = true;
            }
        });
        
        if (hasUnreadMessages) {
            renderMessages();
            alert('All messages marked as read');
        }
    }

    // Close modal
    function closeModal() {
        messageModal.style.display = 'none';
    }

    // Event Listeners
    
    // Search input
    searchInput.addEventListener('input', function(e) {
        currentSearchTerm = e.target.value.trim();
        renderMessages();
    });
    
    // Filter tags
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all filters
            filterTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            
            // Re-render messages
            renderMessages();
        });
    });
    
    // Mark all as read button
    markAllReadBtn.addEventListener('click', markAllAsRead);
    
    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Pagination buttons
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderMessages();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderMessages();
        }
    });

    // Initialize the application
    function initialize() {
        // Load invitation messages from mock data
        const invitations = loadInvitationMessages();
        
        // Convert to message format
        messages = convertInvitationMessagesToMessages(invitations);
        
        // Set initial filtered messages
        filteredMessages = [...messages];
        
        // Render messages
        renderMessages();
        
        console.log(`Loaded ${messages.length} messages from invitations`);
    }

    // Start the application
    initialize();
});