// messages.js - CollabNexus Messaging System

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const composeBtn = document.getElementById('compose-btn');
    const messageList = document.getElementById('message-list');
    const emptyState = document.getElementById('empty-state');
    const messageView = document.getElementById('message-view');
    const composeForm = document.getElementById('compose-form');
    const cancelComposeBtn = document.getElementById('cancel-compose-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const replyBtn = document.getElementById('reply-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const archiveBtn = document.getElementById('archive-btn');
    const messageFolders = document.querySelectorAll('.message-folders li');

    // Sample data for demonstration
    const sampleMessages = {
        inbox: [
            {
                id: 1,
                from: 'Dr. Sarah Johnson',
                subject: 'Feedback on your recent review',
                preview: 'Thank you for your thorough review of the proposal. I wanted to discuss some of your comments...',
                date: 'May 2, 2025 10:30 AM',
                body: `Dear Reviewer,\n\nThank you for your thorough review of the proposal "Quantum Computing Applications in Climate Modeling". I wanted to discuss some of your comments regarding the methodology section.\n\nI agree with your assessment about the need for more detailed experimental protocols. The research team has prepared an addendum that addresses these concerns, which I've attached for your consideration.\n\nWould you be available for a brief call next week to discuss?\n\nBest regards,\nDr. Sarah Johnson\nSenior Research Coordinator`,
                read: false,
                attachments: ['Methodology_Addendum.pdf']
            },
            {
                id: 2,
                from: 'CollabNexus System',
                subject: 'New proposal assigned for review',
                preview: 'A new research proposal has been assigned to you for review. Please complete your assessment by...',
                date: 'Apr 28, 2025 3:15 PM',
                body: `Dear Reviewer,\n\nA new research proposal titled "Machine Learning Approaches to Protein Folding Prediction" has been assigned to you for review.\n\nKey Details:\n- Submission ID: CN-2025-0452\n- Primary Researcher: Dr. Michael Chen\n- Deadline: May 15, 2025\n\nYou can access the proposal from your dashboard or via this direct link: [Proposal CN-2025-0452]\n\nPlease complete your assessment by the deadline. If you have any questions or need an extension, please contact the review coordinator.\n\nThank you for your contribution to the research community!\n\nCollabNexus Review System`,
                read: true,
                attachments: []
            },
            {
                id: 3,
                from: 'Prof. David Wilson',
                subject: 'Collaboration opportunity',
                preview: 'I read your recent paper on neural networks and would love to explore potential collaboration...',
                date: 'Apr 25, 2025 9:45 AM',
                body: `Dear Colleague,\n\nI recently read your excellent paper "Advanced Neural Network Architectures for Medical Imaging" published in the Journal of AI Research, and I was very impressed with your work.\n\nMy research group at Stanford is working on similar problems, particularly in the area of 3D medical image segmentation. I believe there might be exciting opportunities for collaboration between our teams.\n\nWould you be interested in discussing this further? I'll be attending the AI in Medicine conference next month if you'd like to meet in person.\n\nLooking forward to your thoughts.\n\nBest regards,\nProf. David Wilson\nDepartment of Computer Science\nStanford University`,
                read: false,
                attachments: ['Wilson_Lab_Research.pdf']
            }
        ],
        sent: [
            {
                id: 4,
                to: 'Dr. Emily Zhang',
                subject: 'Review completed - Proposal CN-2025-0387',
                preview: 'I have completed my review of the proposal as requested. Please find my detailed assessment attached...',
                date: 'Apr 20, 2025 2:00 PM',
                body: `Dear Dr. Zhang,\n\nI have completed my review of the proposal "Novel Approaches to Carbon Capture Using Nanomaterials" (CN-2025-0387).\n\nOverall, I find the proposal to be well-structured with a clear research plan. The team has strong qualifications and the preliminary results are promising. I've provided detailed comments in the attached review form, with a few suggestions for strengthening the experimental design.\n\nPlease don't hesitate to contact me if you need any clarification on my feedback.\n\nBest regards,\n[Your Name]\nReviewer, CollabNexus`,
                attachments: ['Review_CN-2025-0387.pdf']
            }
        ],
        drafts: [
            {
                id: 5,
                to: 'Dr. Robert Kim',
                subject: 'Questions about review criteria',
                preview: 'I have some questions about the evaluation criteria for the current round of proposals...',
                date: 'Apr 18, 2025 11:20 AM',
                body: `Dear Dr. Kim,\n\nI'm currently reviewing several proposals for the current funding cycle and have some questions about the evaluation criteria, particularly regarding the innovation component.\n\nCould you clarify whether we should prioritize:\n1. Technical innovation (novel methods/approaches)\n2. Applied innovation (novel applications of existing methods)\n3. Or both equally?\n\nI want to ensure I'm applying the criteria consistently across all proposals.\n\nThank you for your guidance.\n\nBest regards,\n[Your Name]`,
                attachments: []
            }
        ],
        archived: []
    };

    // Sample recipients and proposals for compose form
    const sampleRecipients = [
        { id: 1, name: 'Dr. Sarah Johnson', email: 's.johnson@university.edu' },
        { id: 2, name: 'Prof. David Wilson', email: 'd.wilson@stanford.edu' },
        { id: 3, name: 'Dr. Emily Zhang', email: 'e.zhang@research.org' },
        { id: 4, name: 'Dr. Robert Kim', email: 'r.kim@collabnexus.org' },
        { id: 5, name: 'CollabNexus Review System', email: 'reviews@collabnexus.org' }
    ];

    const sampleProposals = [
        { id: 1, title: 'Quantum Computing Applications in Climate Modeling', code: 'CN-2025-0452' },
        { id: 2, title: 'Machine Learning Approaches to Protein Folding', code: 'CN-2025-0387' },
        { id: 3, title: 'Novel Carbon Capture Using Nanomaterials', code: 'CN-2025-0415' }
    ];

    // Current state
    let currentFolder = 'inbox';
    let selectedMessage = null;

    // Initialize the messaging system
    function init() {
        loadMessages(currentFolder);
        setupEventListeners();
        populateComposeForm();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Compose button
        composeBtn.addEventListener('click', showComposeForm);

        // Cancel compose button
        cancelComposeBtn.addEventListener('click', hideComposeForm);

        // Save draft button
        saveDraftBtn.addEventListener('click', saveAsDraft);

        // Message folder navigation
        messageFolders.forEach(folder => {
            folder.addEventListener('click', function(e) {
                e.preventDefault();
                // Update active state
                messageFolders.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // Load messages for this folder
                currentFolder = this.querySelector('a').getAttribute('href').substring(1);
                loadMessages(currentFolder);
                
                // Clear message view
                clearMessageView();
            });
        });

        // Form submission
        composeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });

        // Message actions
        replyBtn.addEventListener('click', replyToMessage);
        forwardBtn.addEventListener('click', forwardMessage);
        archiveBtn.addEventListener('click', archiveMessage);
    }

    // Load messages for the current folder
    function loadMessages(folder) {
        // Clear current messages
        messageList.innerHTML = '';

        // Get messages for this folder
        const messages = sampleMessages[folder] || [];

        if (messages.length === 0) {
            messageList.innerHTML = `<div class="empty-folder">No messages in this folder</div>`;
            return;
        }

        // Create message list items
        messages.forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.className = `message-item ${!message.read && folder === 'inbox' ? 'unread' : ''}`;
            messageItem.dataset.id = message.id;
            
            messageItem.innerHTML = `
                <div class="message-sender">${folder === 'sent' ? 'To: ' + message.to : message.from}</div>
                <div class="message-subject">${message.subject}</div>
                <div class="message-preview">${message.preview}</div>
                <div class="message-date">${message.date}</div>
                ${message.attachments && message.attachments.length > 0 ? '<i class="fas fa-paperclip attachment-indicator"></i>' : ''}
            `;

            // Add click event to view message
            messageItem.addEventListener('click', function() {
                viewMessage(message, folder);
            });

            messageList.appendChild(messageItem);
        });
    }

    // View a message
    function viewMessage(message, folder) {
        // Mark as read if in inbox
        if (folder === 'inbox' && !message.read) {
            message.read = true;
            updateUnreadCount();
        }

        // Set message content
        document.getElementById('message-subject').textContent = message.subject;
        document.getElementById('message-from').textContent = message.from || 'You';
        document.getElementById('message-to').textContent = folder === 'sent' ? message.to : 'You';
        document.getElementById('message-date').textContent = message.date;
        document.getElementById('message-body-text').textContent = message.body;

        // Handle attachments
        const attachmentsContainer = document.getElementById('message-attachments');
        const attachmentList = document.getElementById('attachment-list');
        
        if (message.attachments && message.attachments.length > 0) {
            attachmentList.innerHTML = '';
            message.attachments.forEach(attachment => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-file"></i> ${attachment} <button class="btn-download"><i class="fas fa-download"></i></button>`;
                attachmentList.appendChild(li);
            });
            attachmentsContainer.classList.remove('hidden');
        } else {
            attachmentsContainer.classList.add('hidden');
        }

        // Show message view and hide empty state
        emptyState.classList.add('hidden');
        messageView.classList.remove('hidden');
        composeForm.classList.add('hidden');

        // Store the selected message
        selectedMessage = message;
    }

    // Clear the message view
    function clearMessageView() {
        emptyState.classList.remove('hidden');
        messageView.classList.add('hidden');
        composeForm.classList.add('hidden');
        selectedMessage = null;
    }

    // Show compose form
    function showComposeForm() {
        emptyState.classList.add('hidden');
        messageView.classList.add('hidden');
        composeForm.classList.remove('hidden');
        
        // Reset form
        composeForm.reset();
        document.getElementById('compose-subject').focus();
    }

    // Hide compose form
    function hideComposeForm() {
        if (confirm('Are you sure you want to discard this message?')) {
            clearMessageView();
        }
    }

    // Populate compose form with sample data
    function populateComposeForm() {
        const toSelect = document.getElementById('compose-to');
        const proposalSelect = document.getElementById('compose-proposal-reference');

        // Clear existing options
        toSelect.innerHTML = '';
        proposalSelect.innerHTML = '<option value="">Select a proposal to reference</option>';

        // Add recipients
        sampleRecipients.forEach(recipient => {
            const option = document.createElement('option');
            option.value = recipient.email;
            option.textContent = `${recipient.name} <${recipient.email}>`;
            toSelect.appendChild(option);
        });

        // Add proposals
        sampleProposals.forEach(proposal => {
            const option = document.createElement('option');
            option.value = proposal.id;
            option.textContent = `${proposal.code}: ${proposal.title}`;
            proposalSelect.appendChild(option);
        });

        // Initialize multi-select with Select2 or similar if available
        // This is a placeholder for actual implementation
        if (typeof $ !== 'undefined' && $.fn.select2) {
            $(toSelect).select2({
                placeholder: "Select recipients",
                tags: true
            });
        }
    }

    // Send a message
    function sendMessage() {
        const to = document.getElementById('compose-to').value;
        const subject = document.getElementById('compose-subject').value;
        const body = document.getElementById('compose-message').value;
        const attachment = document.getElementById('compose-file-attachment').files[0];
        const proposalRef = document.getElementById('compose-proposal-reference').value;

        // Validate form
        if (!to || !subject || !body) {
            alert('Please fill in all required fields');
            return;
        }

        // Create new message object
        const newMessage = {
            id: generateId(),
            to: to,
            subject: subject,
            body: body,
            date: formatDate(new Date()),
            attachments: attachment ? [attachment.name] : []
        };

        // Add to sent folder
        sampleMessages.sent.unshift(newMessage);

        // Show success message
        alert('Message sent successfully!');

        // Return to inbox
        currentFolder = 'sent';
        loadMessages(currentFolder);
        clearMessageView();

        // In a real app, you would send this to a server
        console.log('Message sent:', newMessage);
    }

    // Save as draft
    function saveAsDraft() {
        const to = document.getElementById('compose-to').value;
        const subject = document.getElementById('compose-subject').value;
        const body = document.getElementById('compose-message').value;
        const attachment = document.getElementById('compose-file-attachment').files[0];
        const proposalRef = document.getElementById('compose-proposal-reference').value;

        // Create draft message object
        const draftMessage = {
            id: generateId(),
            to: to,
            subject: subject || '(No subject)',
            body: body || '(No content)',
            date: formatDate(new Date()),
            attachments: attachment ? [attachment.name] : []
        };

        // Add to drafts folder
        sampleMessages.drafts.unshift(draftMessage);

        // Show success message
        alert('Draft saved successfully!');

        // Return to drafts
        currentFolder = 'drafts';
        loadMessages(currentFolder);
        clearMessageView();

        // In a real app, you would save this to a server
        console.log('Draft saved:', draftMessage);
    }

    // Reply to message
    function replyToMessage() {
        if (!selectedMessage) return;

        showComposeForm();
        
        // Pre-fill form
        document.getElementById('compose-to').value = selectedMessage.from;
        document.getElementById('compose-subject').value = `Re: ${selectedMessage.subject}`;
        document.getElementById('compose-message').value = `\n\n---------- Original Message ----------\nFrom: ${selectedMessage.from}\nDate: ${selectedMessage.date}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.body}`;
    }

    // Forward message
    function forwardMessage() {
        if (!selectedMessage) return;

        showComposeForm();
        
        // Pre-fill form
        document.getElementById('compose-subject').value = `Fwd: ${selectedMessage.subject}`;
        document.getElementById('compose-message').value = `\n\n---------- Forwarded Message ----------\nFrom: ${selectedMessage.from}\nDate: ${selectedMessage.date}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.body}`;
    }

    // Archive message
    function archiveMessage() {
        if (!selectedMessage) return;

        // Find message in current folder and move to archived
        const currentMessages = sampleMessages[currentFolder];
        const index = currentMessages.findIndex(msg => msg.id === selectedMessage.id);
        
        if (index !== -1) {
            const [archivedMessage] = currentMessages.splice(index, 1);
            sampleMessages.archived.unshift(archivedMessage);
            
            // Reload messages
            loadMessages(currentFolder);
            clearMessageView();
            
            alert('Message archived successfully!');
        }
    }

    // Update unread count badge
    function updateUnreadCount() {
        const unreadCount = sampleMessages.inbox.filter(msg => !msg.read).length;
        const badge = document.querySelector('.message-folders .badge');
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Helper function to generate unique ID
    function generateId() {
        return Math.floor(Math.random() * 1000000);
    }

    // Helper function to format date
    function formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Initialize the messaging system
    init();
});