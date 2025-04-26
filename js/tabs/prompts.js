/**
 * Prompts tab module for handling prompt-related functionality
 */

const PromptsTab = {
    /**
     * Initialize prompts tab
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
        this.promptsContainer = document.getElementById('promptsContainer');
        this.newPromptBtn = document.getElementById('newPromptBtn');
        this.newPromptModal = document.getElementById('newPromptModal');
        this.newPromptTitle = document.getElementById('newPromptTitle');
        this.newPromptTextarea = document.getElementById('newPromptTextarea');
        this.closeNewPromptBtn = document.getElementById('closeNewPromptBtn');
        this.cancelNewPromptBtn = document.getElementById('cancelNewPromptBtn');
        this.createNewPromptBtn = document.getElementById('createNewPromptBtn');
        this.searchInput = document.getElementById('searchInput');
        this.viewEditModal = document.getElementById('viewEditModal');
        this.viewEditTitle = document.getElementById('viewEditTitle');
        this.viewEditTextarea = document.getElementById('viewEditTextarea');
        this.closeViewEditBtn = document.getElementById('closeViewEditBtn');
        this.deleteFromViewBtn = document.getElementById('deleteFromViewBtn');
        this.copyFromViewBtn = document.getElementById('copyFromViewBtn');
        this.sendFromViewBtn = document.getElementById('sendFromViewBtn');
        this.saveFromViewBtn = document.getElementById('saveFromViewBtn');
        this.deleteModal = document.getElementById('deleteModal');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

        this.pendingDeleteId = null;
        this.currentlyViewingId = null;
        this.currentlyViewingTitle = null;
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // New prompt button
        this.newPromptBtn.addEventListener('click', () => this.showNewPromptModal());

        // Search input
        this.searchInput.addEventListener('input', (e) => this.filterPrompts(e.target.value));

        // Create prompt form
        this.createNewPromptBtn.addEventListener('click', () => this.createNewPrompt());

        // Cancel new prompt
        this.cancelNewPromptBtn.addEventListener('click', () => this.closeNewPromptModal());

        // Close new prompt modal
        this.closeNewPromptBtn.addEventListener('click', () => this.closeNewPromptModal());

        // View/Edit modal
        this.closeViewEditBtn.addEventListener('click', () => this.closeViewEditModal());
        this.deleteFromViewBtn.addEventListener('click', () => this.deletePrompt(this.currentlyViewingId));
        this.copyFromViewBtn.addEventListener('click', () => this.copyPrompt(this.currentlyViewingId));
        this.sendFromViewBtn.addEventListener('click', () => this.sendPrompt(this.currentlyViewingId));
        this.saveFromViewBtn.addEventListener('click', () => this.savePromptFromView());

        // Delete modal
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
    },

    /**
     * Load and display prompts
     */
    loadPrompts() {
        const prompts = StorageManager.getPrompts();
        this.promptsContainer.innerHTML = '';

        if (prompts.length === 0) {
            this.promptsContainer.innerHTML = '<div class="placeholder">No prompts yet. Create one!</div>';
            return;
        }

        prompts.forEach(prompt => {
            this.promptsContainer.appendChild(this.createPromptCard(prompt));
        });

        // Update prompt count
        const promptCountElements = document.querySelectorAll('#promptCount');
        promptCountElements.forEach(el => {
            el.textContent = prompts.length;
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
        card.dataset.promptId = prompt.id;

        card.innerHTML = `
            <h3 class="prompt-title">
                <span class="prompt-title-text" title="Click to edit">${UIManager.sanitizeHtml(prompt.title)}</span>
                <div class="title-buttons">
                    <button class="btn-icon btn-copy" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
                    <button class="btn-icon btn-send send" title="Send to active tab"><i class="fas fa-paper-plane"></i></button>
                    <button class="btn-icon delete" title="Delete prompt"><i class="fas fa-trash"></i></button>
                </div>
            </h3>
            <p class="prompt-content">${UIManager.sanitizeHtml(prompt.content)}</p>
            <div class="prompt-meta">
                <span>Created: ${new Date(prompt.createdAt).toLocaleDateString()}</span>
                <span><i class="fas fa-edit"></i> Edit</span>
            </div>
        `;

        // Add event listeners
        // Title click opens edit mode
        card.querySelector('.prompt-title-text').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showViewEditModal(prompt);
        });

        // Content click also opens edit mode
        card.querySelector('.prompt-content').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showViewEditModal(prompt);
        });

        // Edit text in meta also opens edit mode
        card.querySelector('.prompt-meta span:last-child').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showViewEditModal(prompt);
        });

        card.querySelector('.btn-copy').addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyPrompt(prompt.id);
        });

        card.querySelector('.btn-send').addEventListener('click', (e) => {
            e.stopPropagation();
            this.sendPrompt(prompt.id);
        });

        card.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteModal(prompt.id);
        });

        return card;
    },

    /**
     * Filter prompts based on search query
     * @param {string} query Search query
     */
    filterPrompts(query) {
        const prompts = StorageManager.getPrompts();
        const filtered = prompts.filter(prompt =>
            prompt.title.toLowerCase().includes(query.toLowerCase()) ||
            prompt.content.toLowerCase().includes(query.toLowerCase())
        );

        this.promptsContainer.innerHTML = '';

        if (filtered.length === 0) {
            this.promptsContainer.innerHTML = '<div class="placeholder">No matching prompts found.</div>';
            return;
        }

        filtered.forEach(prompt => {
            this.promptsContainer.appendChild(this.createPromptCard(prompt));
        });
    },

    /**
     * Show new prompt modal
     */
    showNewPromptModal() {
        this.newPromptModal.classList.add('show');
        // Focus title input for better UX
        setTimeout(() => this.newPromptTitle.focus(), 100);
    },

    /**
     * Close new prompt modal
     */
    closeNewPromptModal() {
        this.newPromptModal.classList.remove('show');
        this.newPromptTitle.value = '';
        this.newPromptTextarea.value = '';
    },

    /**
     * Create a new prompt
     */
    createNewPrompt() {
        const title = this.newPromptTitle.value.trim();
        const content = this.newPromptTextarea.value.trim();

        if (!title || !content) {
            UIManager.showToast('Please fill in all fields', 'error');
            return;
        }

        const success = StorageManager.savePrompt({ title, content });
        if (success) {
            this.closeNewPromptModal();
            this.loadPrompts();
            UIManager.showToast('Prompt created successfully!', 'success');
        } else {
            UIManager.showToast('Error creating prompt', 'error');
        }
    },

    /**
     * Show view/edit modal
     * @param {Object} prompt Prompt to view/edit
     */
    showViewEditModal(prompt) {
        this.currentlyViewingId = prompt.id;
        this.currentlyViewingTitle = prompt.title;
        this.viewEditTitle.textContent = 'Edit: ' + prompt.title;
        this.viewEditTextarea.value = prompt.content;
        this.viewEditModal.classList.add('show');
        // Focus textarea for better UX
        setTimeout(() => this.viewEditTextarea.focus(), 100);
    },

    /**
     * Close view/edit modal
     */
    closeViewEditModal() {
        this.viewEditModal.classList.remove('show');
        this.currentlyViewingId = null;
        this.currentlyViewingTitle = null;
    },

    /**
     * Save prompt from view/edit modal
     */
    savePromptFromView() {
        if (!this.currentlyViewingId) return;

        const content = this.viewEditTextarea.value.trim();
        if (!content) {
            UIManager.showToast('Content cannot be empty', 'error');
            return;
        }

        const success = StorageManager.updatePrompt(this.currentlyViewingId, { content });
        if (success) {
            this.closeViewEditModal();
            this.loadPrompts();
            UIManager.showToast(`"${this.currentlyViewingTitle}" updated successfully!`, 'success');
        } else {
            UIManager.showToast('Error updating prompt', 'error');
        }
    },

    /**
     * Show delete confirmation modal
     * @param {string} id ID of prompt to delete
     */
    showDeleteModal(id) {
        const prompts = StorageManager.getPrompts();
        const prompt = prompts.find(p => p.id === id);

        if (prompt) {
            document.querySelector('#deleteModal p').textContent =
                `Are you sure you want to delete the prompt "${prompt.title}"?`;
        }

        this.pendingDeleteId = id;
        this.deleteModal.classList.add('show');
    },

    /**
     * Close delete confirmation modal
     */
    closeDeleteModal() {
        this.deleteModal.classList.remove('show');
        this.pendingDeleteId = null;
    },

    /**
     * Confirm and execute prompt deletion
     */
    confirmDelete() {
        if (!this.pendingDeleteId) return;

        // Get prompt title before deletion
        const prompts = StorageManager.getPrompts();
        const prompt = prompts.find(p => p.id === this.pendingDeleteId);
        const promptTitle = prompt ? prompt.title : 'Prompt';

        const success = StorageManager.deletePrompt(this.pendingDeleteId);
        if (success) {
            this.closeDeleteModal();
            this.closeViewEditModal();
            this.loadPrompts();
            UIManager.showToast(`"${promptTitle}" deleted successfully!`, 'success');
        } else {
            UIManager.showToast('Error deleting prompt', 'error');
        }
    },

    /**
     * Copy prompt content to clipboard
     * @param {string} id ID of prompt to copy
     */
    async copyPrompt(id) {
        const prompts = StorageManager.getPrompts();
        const prompt = prompts.find(p => p.id === id);
        if (!prompt) return;

        try {
            await navigator.clipboard.writeText(prompt.content);
            UIManager.showToast(`"${prompt.title}" copied to clipboard!`, 'success');
        } catch (error) {
            UIManager.showToast('Error copying prompt', 'error');
        }
    },

    /**
     * Send prompt to active tab
     * @param {string} id ID of prompt to send
     */
    async sendPrompt(id) {
        const prompts = StorageManager.getPrompts();
        const prompt = prompts.find(p => p.id === id);
        if (!prompt) return;

        try {
            await InjectionManager.injectPrompt(prompt.content);
            UIManager.showToast(`"${prompt.title}" sent to active tab!`, 'success');
        } catch (error) {
            // Error is already handled by InjectionManager
        }
    }
}; 