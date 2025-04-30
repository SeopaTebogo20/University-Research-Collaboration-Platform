// Admin Messages JavaScript - Updated to match dashboard style
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageListElement = document.getElementById('message-list');
    const emptyStateElement = document.getElementById('empty-state');
    const messageViewElement = document.getElementById('message-view');
    const composeFormElement = document.getElementById('compose-form');
    const messageFolders = document.querySelectorAll('.message-folders li');
    const composeBtn = document.getElementById('compose-btn');
    const replyBtn = document.getElementById('reply-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const archiveBtn = document.getElementById('archive-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const cancelComposeBtn = document.getElementById('cancel-compose-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Message display elements
    const messageSubject = document.getElementById('message-subject');
    const messageFrom = document.getElementById('message-from');
    const messageTo = document.getElementById('message-to');
    const messageDate = document.getElementById('message-date');
    const messageBodyText = document.getElementById('message-body-text');
    const attachmentList = document.getElementById('attachment-list');
    const messageAttachmentsSection = document.getElementById('message-attachments');

    // Compose form elements
    const composeToSelect = document.getElementById('compose-to');
    const composeSubject = document.getElementById('compose-subject');
    const composeMessage = document.getElementById('compose-message');
    const composeProposalReference = document.getElementById('compose-proposal-reference');

    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Mock Messages Data
    const mockMessages = [
        {
            id: 1,
            folder: 'inbox',
            from: {
                id: 2,
                name: 'Prof. Michael Chen',
                email: 'mchen@research.org'
            },
            to: {
                id: 5,
                name: 'Admin User',
                email: 'admin@collabnexus.com'
            },
            subject: 'Question about proposal review assignment',
            body: `Hello,

I recently received notifications about three new proposals assigned to me for review. However, one of them appears to be outside my area of expertise (Proposal ID: PRO-2024-089 on Genomic Analysis).

Could you please reassign this to a reviewer with more background in biology or genetics? I'd be happy to take on a different proposal in the computer science or medicine domains instead.

Thank you for your consideration.

Best regards,
Prof. Michael Chen`,
            date: '2025-04-26T14:23:10',
            read: false,
            attachments: []
        },
        // ... (keep all other mock messages the same)
    ];

    // Mock Users Data
    const mockUsers = [
        { 
            id: 1, 
            name: 'Dr. Sarah Johnson', 
            email: 'sarah.johnson@university.edu', 
            role: 'researcher'
        },
        // ... (keep all other mock users the same)
    ];

    // Mock Proposals Data
    const mockProposals = [
        {
            id: 'PRO-2024-087',
            title: 'Novel Approaches to Antibiotic Resistance',
            researcher: 'Dr. Sarah Johnson'
        },
        // ... (keep all other mock proposals the same)
    ];

    // Current folder and selected message
    let currentFolder = 'inbox';
    let selectedMessageId = null;

    // Initialize the page
    function init() {
        loadMessageFolder(currentFolder);
        setupEventListeners();
        populateRecipientsList();
        populateProposalsList();
    }

    // Load messages for a specific folder
    function loadMessageFolder(folder) {
        currentFolder = folder;
        const folderMessages = mockMessages.filter(message => message.folder === folder);
        renderMessageList(folderMessages);
    }

    // Render the message list in the sidebar
    function renderMessageList(messages) {
        messageListElement.innerHTML = '';
        
        if (messages.length === 0) {
            const emptyMessage = document.createElement('article');
            emptyMessage.className = 'empty-folder-message';
            emptyMessage.innerHTML = `
                <p>No messages in this folder</p>
            `;
            messageListElement.appendChild(emptyMessage);
            return;
        }
        
        // Sort messages by date (newest first)
        const sortedMessages = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedMessages.forEach(message => {
            const messageItem = document.createElement('article');
            messageItem.className = `message-item ${message.read ? '' : 'unread'}`;
            messageItem.dataset.messageId = message.id;
            
            const formattedDate = formatDate(message.date);
            
            messageItem.innerHTML = `
                <header class="message-item-header">
                    <h3>${message.subject}</h3>
                    ${!message.read ? '<span class="unread-badge">New</span>' : ''}
                </header>
                <p class="message-preview">
                    <strong>${currentFolder === 'sent' || currentFolder === 'drafts' ? 
                        `To: ${message.to.name || 'No recipient'}` : 
                        `From: ${message.from.name}`}</strong>
                </p>
                <footer class="message-meta">
                    <time datetime="${message.date}">${formattedDate}</time>
                    ${message.attachments.length > 0 ? 
                        '<span class="attachment-indicator"><i class="fas fa-paperclip"></i></span>' : ''}
                </footer>
            `;
            
            messageListElement.appendChild(messageItem);
        });
        
        // Attach event listeners to the message items
        attachMessageItemListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Message folder navigation
        messageFolders.forEach(folder => {
            folder.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active folder
                messageFolders.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // Extract folder name from href attribute
                const folderName = this.querySelector('a').getAttribute('href').substring(1);
                loadMessageFolder(folderName);
                
                // Reset view
                hideMessageView();
                hideComposeForm();
                showEmptyState();
            });
        });
        
        // Compose button
        composeBtn.addEventListener('click', function() {
            hideMessageView();
            hideEmptyState();
            showComposeForm();
            resetComposeForm();
        });
        
        // Reply button
        replyBtn.addEventListener('click', function() {
            if (!selectedMessageId) return;
            
            const message = mockMessages.find(m => m.id === selectedMessageId);
            if (!message) return;
            
            hideMessageView();
            hideEmptyState();
            showComposeForm();
            
            // Populate the compose form for reply
            composeToSelect.value = message.from.id;
            composeSubject.value = `Re: ${message.subject}`;
            composeMessage.value = `\n\n\n-------- Original Message --------\nFrom: ${message.from.name}\nDate: ${formatDate(message.date)}\nSubject: ${message.subject}\n\n${message.body}`;
            
            // Focus on the message body and place cursor at the beginning
            composeMessage.focus();
            composeMessage.setSelectionRange(0, 0);
        });
        
        // Forward button
        forwardBtn.addEventListener('click', function() {
            if (!selectedMessageId) return;
            
            const message = mockMessages.find(m => m.id === selectedMessageId);
            if (!message) return;
            
            hideMessageView();
            hideEmptyState();
            showComposeForm();
            
            // Populate the compose form for forward
            composeToSelect.value = ''; // Clear recipient
            composeSubject.value = `Fwd: ${message.subject}`;
            composeMessage.value = `\n\n\n-------- Forwarded Message --------\nFrom: ${message.from.name}\nDate: ${formatDate(message.date)}\nSubject: ${message.subject}\n\n${message.body}`;
            
            // Focus on the to field
            composeToSelect.focus();
        });
        
        // Archive button
        archiveBtn.addEventListener('click', function() {
            if (!selectedMessageId) return;
            
            const messageIndex = mockMessages.findIndex(m => m.id === selectedMessageId);
            if (messageIndex === -1) return;
            
            // Update the message folder to archived
            mockMessages[messageIndex].folder = 'archived';
            
            // Refresh the current folder view
            loadMessageFolder(currentFolder);
            
            // Show empty state
            hideMessageView();
            showEmptyState();
            
            // Show notification
            showToast('Message archived successfully', 'success');
        });
        
        // Save draft button
        saveDraftBtn.addEventListener('click', function() {
            showToast('Draft saved successfully', 'success');
        });
        
        // Cancel compose button
        cancelComposeBtn.addEventListener('click', function() {
            hideComposeForm();
            showEmptyState();
        });
        
        // Compose form submission
        composeFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            showToast('Message sent successfully', 'success');
            
            // Reset and hide the compose form
            resetComposeForm();
            hideComposeForm();
            showEmptyState();
        });
        
        // Logout button
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                
                if (response.ok) {
                    window.location.href = '/login';
                } else {
                    showToast('Logout failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                showToast('Error during logout. Please try again.', 'error');
            }
        });
    }
    
    // Attach event listeners to message items
    function attachMessageItemListeners() {
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', function() {
                const messageId = parseInt(this.dataset.messageId);
                openMessage(messageId);
                
                // Mark as read in the UI
                this.classList.remove('unread');
                
                // Mark as read in the data
                const message = mockMessages.find(m => m.id === messageId);
                if (message) {
                    message.read = true;
                }
            });
        });
    }
    
    // Open a message and display its contents
    function openMessage(messageId) {
        selectedMessageId = messageId;
        const message = mockMessages.find(m => m.id === messageId);
        
        if (!message) return;
        
        // Populate message view
        messageSubject.textContent = message.subject;
        messageFrom.textContent = `${message.from.name} <${message.from.email}>`;
        messageTo.textContent = `${message.to.name} <${message.to.email}>`;
        messageDate.textContent = formatDateLong(message.date);
        messageBodyText.textContent = message.body;
        
        // Handle attachments
        if (message.attachments.length > 0) {
            messageAttachmentsSection.classList.remove('hidden');
            attachmentList.innerHTML = '';
            
            message.attachments.forEach(attachment => {
                const attachmentItem = document.createElement('li');
                attachmentItem.innerHTML = `
                    <i class="fas fa-file-alt"></i>
                    <a href="#" class="attachment-link">${attachment.name}</a>
                    <span class="attachment-size">(${attachment.size})</span>
                `;
                attachmentList.appendChild(attachmentItem);
            });
        } else {
            messageAttachmentsSection.classList.add('hidden');
        }
        
        // Show message view and hide other views
        hideEmptyState();
        hideComposeForm();
        showMessageView();
    }
    
    // Populate the recipients select dropdown
    function populateRecipientsList() {
        composeToSelect.innerHTML = '';
        
        mockUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} <${user.email}>`;
            composeToSelect.appendChild(option);
        });
    }
    
    // Populate the proposals reference dropdown
    function populateProposalsList() {
        composeProposalReference.innerHTML = '<option value="">Select a proposal to reference</option>';
        
        mockProposals.forEach(proposal => {
            const option = document.createElement('option');
            option.value = proposal.id;
            option.textContent = `${proposal.id}: ${proposal.title} (${proposal.researcher})`;
            composeProposalReference.appendChild(option);
        });
    }
    
    // Reset the compose form
    function resetComposeForm() {
        composeToSelect.value = '';
        composeSubject.value = '';
        composeMessage.value = '';
        composeProposalReference.value = '';
        document.getElementById('compose-file-attachment').value = '';
    }
    
    // Show/Hide View Functions
    function showMessageView() {
        messageViewElement.classList.remove('hidden');
    }
    
    function hideMessageView() {
        messageViewElement.classList.add('hidden');
    }
    
    function showEmptyState() {
        emptyStateElement.classList.remove('hidden');
    }
    
    function hideEmptyState() {
        emptyStateElement.classList.add('hidden');
    }
    
    function showComposeForm() {
        composeFormElement.classList.remove('hidden');
    }
    
    function hideComposeForm() {
        composeFormElement.classList.add('hidden');
    }
    
    // Toast notification function
    function showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('active');
        }, 10);
        
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, duration);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast(toast);
        });
    }
    
    function removeToast(toast) {
        toast.classList.remove('active');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }
    
    // Utility Functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    function formatDateLong(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }
    
    // Initialize the page
    init();
});