/**
 * Prompts Tab module for managing user-saved prompts
 */

const PromptsTab = {
    elements: {},

    /**
     * Initialize the prompts tab
     */
    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadPrompts();
    },

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            promptsContainer: document.getElementById('promptsContainer'),
            searchInput: document.getElementById('searchInput'),
            newPromptModal: document.getElementById('newPromptModal'),
            newPromptTitle: document.getElementById('newPromptTitle'),
            newPromptTextarea: document.getElementById('newPromptTextarea'),
            createNewPromptBtn: document.getElementById('createNewPromptBtn'),
            closeNewPromptBtn: document.getElementById('closeNewPromptBtn'),
            cancelNewPromptBtn: document.getElementById('cancelNewPromptBtn'),
            viewEditModal: document.getElementById('viewEditModal'),
            viewEditTitle: document.getElementById('viewEditTitle'),
            viewEditTextarea: document.getElementById('viewEditTextarea'),
            closeViewEditBtn: document.getElementById('closeViewEditBtn'),
            saveFromViewBtn: document.getElementById('saveFromViewBtn'),
            deleteFromViewBtn: document.getElementById('deleteFromViewBtn'),
            copyFromViewBtn: document.getElementById('copyFromViewBtn'),
            sendFromViewBtn: document.getElementById('sendFromViewBtn'),
            deleteModal: document.getElementById('deleteModal'),
            confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
            cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
            // New expand view elements
            expandViewModal: document.getElementById('expandViewModal'),
            expandViewTitle: document.getElementById('expandViewTitle'),
            expandViewContent: document.getElementById('expandViewContent'),
            closeExpandViewBtn: document.getElementById('closeExpandViewBtn'),
            closeExpandBtn: document.getElementById('closeExpandBtn'),
            copyExpandBtn: document.getElementById('copyExpandBtn'),
            sendExpandBtn: document.getElementById('sendExpandBtn')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // New prompt button from header
        document.getElementById('newPromptBtn').addEventListener('click', () => this.showNewPromptModal());

        // Search input
        this.elements.searchInput.addEventListener('input', () => this.filterPrompts());

        // New prompt modal
        this.elements.closeNewPromptBtn.addEventListener('click', () => this.closeModal(this.elements.newPromptModal));
        this.elements.cancelNewPromptBtn.addEventListener('click', () => this.closeModal(this.elements.newPromptModal));
        this.elements.createNewPromptBtn.addEventListener('click', () => this.createNewPrompt());

        // View/Edit modal
        this.elements.closeViewEditBtn.addEventListener('click', () => this.closeModal(this.elements.viewEditModal));
        this.elements.saveFromViewBtn.addEventListener('click', () => this.updatePrompt());
        this.elements.deleteFromViewBtn.addEventListener('click', () => this.showDeleteConfirmation());
        this.elements.copyFromViewBtn.addEventListener('click', () => this.copyCurrentPromptToClipboard());
        this.elements.sendFromViewBtn.addEventListener('click', () => this.sendCurrentPromptToActiveTab());

        // Delete confirmation modal
        this.elements.confirmDeleteBtn.addEventListener('click', () => this.deletePrompt());
        this.elements.cancelDeleteBtn.addEventListener('click', () => this.closeModal(this.elements.deleteModal));

        // Expand view modal
        this.elements.closeExpandViewBtn.addEventListener('click', () => this.closeModal(this.elements.expandViewModal));
        this.elements.closeExpandBtn.addEventListener('click', () => this.closeModal(this.elements.expandViewModal));
        this.elements.copyExpandBtn.addEventListener('click', () => this.copyExpandedPromptToClipboard());
        this.elements.sendExpandBtn.addEventListener('click', () => this.sendExpandedPromptToActiveTab());

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.newPromptModal) {
                this.closeModal(this.elements.newPromptModal);
            }
            if (e.target === this.elements.viewEditModal) {
                this.closeModal(this.elements.viewEditModal);
            }
            if (e.target === this.elements.deleteModal) {
                this.closeModal(this.elements.deleteModal);
            }
            if (e.target === this.elements.expandViewModal) {
                this.closeModal(this.elements.expandViewModal);
            }
        });
    },

    /**
     * Load and display prompts
     */
    loadPrompts() {
        const prompts = StorageManager.getPrompts();
        this.elements.promptsContainer.innerHTML = '';

        if (prompts.length === 0) {
            this.elements.promptsContainer.innerHTML = `
                <div class="placeholder">
                    <p>You don't have any saved prompts yet.</p>
                    <button class="btn btn-primary" id="empty-new-prompt-btn">Create Your First Prompt</button>
                </div>
            `;
            document.getElementById('empty-new-prompt-btn').addEventListener('click', () => this.showNewPromptModal());
            return;
        }

        prompts.forEach(prompt => {
            this.elements.promptsContainer.appendChild(this.createPromptCard(prompt));
        });
    },

    /**
     * Filter prompts based on search input
     */
    filterPrompts() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const prompts = StorageManager.getPrompts();
        this.elements.promptsContainer.innerHTML = '';

        const filteredPrompts = prompts.filter(prompt =>
            prompt.title.toLowerCase().includes(searchTerm) ||
            prompt.content.toLowerCase().includes(searchTerm) ||
            (prompt.tags && prompt.tags.toLowerCase().includes(searchTerm))
        );

        if (filteredPrompts.length === 0) {
            this.elements.promptsContainer.innerHTML = `
                <div class="placeholder">
                    <p>No prompts found matching "${searchTerm}"</p>
                </div>
            `;
            return;
        }

        filteredPrompts.forEach(prompt => {
            this.elements.promptsContainer.appendChild(this.createPromptCard(prompt));
        });
    },

    /**
     * Create a prompt card element
     * @param {Object} prompt Prompt data
     * @returns {HTMLElement} Prompt card element
     */
    createPromptCard(prompt) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.id = prompt.id;

        // Sanitize HTML content
        const sanitizedTitle = UIManager.sanitizeHtml(prompt.title);
        const sanitizedContent = UIManager.sanitizeHtml(prompt.content);

        // Format the date
        const createdDate = new Date(prompt.createdAt);
        const formattedDate = createdDate.toLocaleDateString();

        // Create tags HTML if tags exist
        let tagsHtml = '';
        if (prompt.tags && prompt.tags.length > 0) {
            const tagsList = prompt.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            tagsHtml = `
                <div class="prompt-tags">
                    ${tagsList.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <h3 class="prompt-title">
                <span class="prompt-title-text">${sanitizedTitle}</span>
                <div class="title-buttons">
                    <button class="btn-icon btn-expand" title="Expand to full view"><i class="fas fa-expand-alt"></i></button>
                    <button class="btn-icon btn-copy" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
                    <button class="btn-icon btn-send send" title="Send to active tab"><i class="fas fa-paper-plane"></i></button>
                    <button class="btn-icon delete" title="Delete prompt"><i class="fas fa-trash"></i></button>
                </div>
            </h3>
            <p class="prompt-content">${sanitizedContent}</p>
            <div class="prompt-meta">
                <span>Created: ${formattedDate}</span>
            </div>
        `;

        // Add event listeners to the card buttons
        card.querySelector('.btn-copy').addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyPromptToClipboard(prompt);
        });

        card.querySelector('.btn-send').addEventListener('click', (e) => {
            e.stopPropagation();
            this.sendPromptToActiveTab(prompt);
        });

        card.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirmationForPrompt(prompt.id);
        });

        card.querySelector('.btn-expand').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showExpandView(prompt);
        });

        // Make the whole card clickable to view/edit the prompt
        card.addEventListener('click', () => {
            this.showViewEditPromptModal(prompt);
        });

        return card;
    },

    /**
     * Show the modal for creating a new prompt
     */
    showNewPromptModal() {
        this.elements.newPromptTitle.value = '';
        this.elements.newPromptTextarea.value = '';
        this.elements.newPromptModal.classList.add('active');
    },

    /**
     * Create a new prompt
     */
    createNewPrompt() {
        const title = this.elements.newPromptTitle.value.trim();
        const content = this.elements.newPromptTextarea.value.trim();

        if (!title || !content) {
            UIManager.showToast('Title and content are required!', 'error');
            return;
        }

        const promptData = { title, content, tags: '' };
        const success = StorageManager.savePrompt(promptData);

        if (success) {
            UIManager.showToast('Prompt created successfully!', 'success');
            this.closeModal(this.elements.newPromptModal);
            this.loadPrompts();
        } else {
            UIManager.showToast('There was an error saving the prompt.', 'error');
        }
    },

    /**
     * Show the modal for viewing/editing a prompt
     * @param {Object} prompt Prompt to view/edit
     */
    showViewEditPromptModal(prompt) {
        this.elements.viewEditTitle.textContent = prompt.title;
        this.elements.viewEditTextarea.value = prompt.content;
        this.elements.viewEditModal.dataset.id = prompt.id;
        this.elements.viewEditModal.classList.add('active');
    },

    /**
     * Update the current prompt
     */
    updatePrompt() {
        const id = this.elements.viewEditModal.dataset.id;
        const content = this.elements.viewEditTextarea.value.trim();
        const title = this.elements.viewEditTitle.textContent.trim();

        if (!content) {
            UIManager.showToast('Content cannot be empty!', 'error');
            return;
        }

        const promptData = { content, title };
        const success = StorageManager.updatePrompt(id, promptData);

        if (success) {
            UIManager.showToast('Prompt updated successfully!', 'success');
            this.closeModal(this.elements.viewEditModal);
            this.loadPrompts();
        } else {
            UIManager.showToast('There was an error updating the prompt.', 'error');
        }
    },

    /**
     * Show delete confirmation for a specific prompt
     * @param {string} id Prompt ID to delete
     */
    showDeleteConfirmationForPrompt(id) {
        this.elements.deleteModal.dataset.id = id;
        this.elements.deleteModal.classList.add('active');
    },

    /**
     * Show delete confirmation for the current prompt
     */
    showDeleteConfirmation() {
        const id = this.elements.viewEditModal.dataset.id;
        this.showDeleteConfirmationForPrompt(id);
    },

    /**
     * Delete the prompt with ID from the delete modal
     */
    deletePrompt() {
        const id = this.elements.deleteModal.dataset.id;
        if (!id) return;

        const success = StorageManager.deletePrompt(id);
        if (success) {
            UIManager.showToast('Prompt deleted successfully!', 'success');
            this.closeModal(this.elements.deleteModal);
            this.closeModal(this.elements.viewEditModal);
            this.loadPrompts();
        } else {
            UIManager.showToast('There was an error deleting the prompt.', 'error');
        }
    },

    /**
     * Copy current prompt content to clipboard
     */
    copyCurrentPromptToClipboard() {
        const content = this.elements.viewEditTextarea.value;
        this.copyTextToClipboard(content);
    },

    /**
     * Send current prompt to active tab
     */
    sendCurrentPromptToActiveTab() {
        const content = this.elements.viewEditTextarea.value;
        this.sendTextToActiveTab(content);
    },

    /**
     * Copy prompt content to clipboard
     * @param {Object} prompt Prompt to copy
     */
    copyPromptToClipboard(prompt) {
        this.copyTextToClipboard(prompt.content);
    },

    /**
     * Copy text to clipboard
     * @param {string} text Text to copy
     */
    copyTextToClipboard(text) {
        try {
            navigator.clipboard.writeText(text);
            UIManager.showToast('Copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            UIManager.showToast('Failed to copy text.', 'error');
        }
    },

    /**
     * Send prompt to active tab
     * @param {Object} prompt Prompt to send
     */
    sendPromptToActiveTab(prompt) {
        this.sendTextToActiveTab(prompt.content);
    },

    /**
     * Send text to active tab
     * @param {string} text Text to send
     */
    sendTextToActiveTab(text) {
        InjectionManager.injectPrompt(text)
            .then(() => {
                UIManager.showToast('Prompt sent to active tab!', 'success');
            })
            .catch(error => {
                console.error('Failed to send prompt:', error);
                UIManager.showToast('Failed to send to active tab.', 'error');
            });
    },

    /**
     * Show the expanded view modal for a prompt
     * @param {Object} prompt Prompt to expand
     */
    showExpandView(prompt) {
        this.elements.expandViewTitle.textContent = prompt.title;
        this.elements.expandViewContent.textContent = prompt.content;
        this.elements.expandViewModal.dataset.id = prompt.id;
        this.elements.expandViewModal.classList.add('active');
    },

    /**
     * Copy the expanded prompt content to clipboard
     */
    copyExpandedPromptToClipboard() {
        const content = this.elements.expandViewContent.textContent;
        this.copyTextToClipboard(content);
        UIManager.showToast('Prompt copied to clipboard!', 'success');
    },

    /**
     * Send the expanded prompt content to the active tab
     */
    sendExpandedPromptToActiveTab() {
        const content = this.elements.expandViewContent.textContent;
        this.sendTextToActiveTab(content);
        UIManager.showToast('Prompt sent to active tab!', 'success');
    },

    /**
     * Close a modal
     * @param {HTMLElement} modal Modal element to close
     */
    closeModal(modal) {
        modal.classList.remove('active');
    }
}; 