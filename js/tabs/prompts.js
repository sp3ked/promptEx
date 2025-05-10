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
        this.setupChangeListeners();
    },

    /**
     * Set up event listeners for prompt changes
     */
    setupChangeListeners() {
        // Listen for changes to prompts from any source
        document.addEventListener('promptsChanged', (event) => {
            console.log('Detected prompts change event:', event.detail.action);
            this.loadPrompts();
        });
    },

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            promptsContainer: document.getElementById('promptsContainer'),
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
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
            pinFromViewBtn: document.getElementById('pinFromViewBtn'),
            deleteModal: document.getElementById('deleteModal'),
            confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
            cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
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
        // Search input
        this.elements.searchInput.addEventListener('input', () => this.filterPrompts());

        // Sort dropdown
        this.elements.sortSelect.addEventListener('change', () => this.sortPrompts());

        // New prompt modal
        document.getElementById('newPromptBtn').addEventListener('click', () => this.showNewPromptModal());
        this.elements.closeNewPromptBtn.addEventListener('click', () => this.closeModal(this.elements.newPromptModal));
        this.elements.cancelNewPromptBtn.addEventListener('click', () => this.closeModal(this.elements.newPromptModal));
        this.elements.createNewPromptBtn.addEventListener('click', () => this.createNewPrompt());

        // View/edit modal - we'll reattach these dynamically to prevent multiple executions
        this.elements.closeViewEditBtn.addEventListener('click', () => this.closeModal(this.elements.viewEditModal));

        // Delete modal
        this.elements.cancelDeleteBtn.addEventListener('click', () => this.closeModal(this.elements.deleteModal));
        this.elements.confirmDeleteBtn.addEventListener('click', () => this.deleteCurrentPrompt());

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
     * Reattach event listeners for view/edit modal to prevent multiple executions
     */
    reattachViewEditModalListeners() {
        // Clone and replace buttons to remove old event listeners
        ['saveFromViewBtn', 'deleteFromViewBtn', 'copyFromViewBtn', 'sendFromViewBtn', 'pinFromViewBtn'].forEach(btnId => {
            if (!this.elements[btnId]) return;

            const original = this.elements[btnId];
            const clone = original.cloneNode(true);
            if (original.parentNode) {
                original.parentNode.replaceChild(clone, original);
                this.elements[btnId] = clone;
            }
        });

        // Re-attach event listeners
        if (this.elements.saveFromViewBtn) {
            this.elements.saveFromViewBtn.addEventListener('click', () => this.updatePrompt());
        }

        if (this.elements.deleteFromViewBtn) {
            this.elements.deleteFromViewBtn.addEventListener('click', () => this.showDeleteConfirmation());
        }

        if (this.elements.copyFromViewBtn) {
            this.elements.copyFromViewBtn.addEventListener('click', () => this.copyPromptToClipboard());
        }

        if (this.elements.sendFromViewBtn) {
            this.elements.sendFromViewBtn.addEventListener('click', (e) => {
                // Prevent multiple sends by disabling button temporarily
                if (e.currentTarget.disabled) return;
                e.currentTarget.disabled = true;

                // Add active class and spinner
                e.currentTarget.classList.add('active');
                const icon = e.currentTarget.querySelector('i');
                const originalClass = icon ? icon.className : '';
                if (icon) icon.className = 'fas fa-spinner fa-spin';

                try {
                    this.sendPromptToActiveTab();
                    // Success state is handled by sendPromptToActiveTab
                } catch (error) {
                    console.error('Error sending prompt:', error);
                    if (icon) icon.className = originalClass || 'fas fa-paper-plane';
                    e.currentTarget.classList.remove('active');
                    UIManager.showToast('Failed to send prompt', 'error');
                } finally {
                    // Re-enable button after a delay
                    setTimeout(() => {
                        e.currentTarget.disabled = false;
                    }, 1500);
                }
            });
        }

        if (this.elements.pinFromViewBtn) {
            this.elements.pinFromViewBtn.addEventListener('click', () => this.togglePinPrompt());
        }
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

        // Sort the prompts using the sortPrompts method
        this.prompts = prompts;
        this.sortPrompts();

        // Render the sorted prompts
        this.renderPrompts();
    },

    /**
     * Render the sorted prompts
     */
    renderPrompts() {
        this.elements.promptsContainer.innerHTML = '';
        this.prompts.forEach(prompt => {
            this.elements.promptsContainer.appendChild(this.createPromptCard(prompt));
        });
    },

    /**
     * Sort prompts according to selected criteria
     */
    sortPrompts() {
        if (!this.prompts || this.prompts.length === 0) return;

        const sortCriteria = this.elements.sortSelect ? this.elements.sortSelect.value : 'recent';

        // First separate pinned and unpinned prompts
        const pinnedPrompts = this.prompts.filter(p => p.pinned);
        const unpinnedPrompts = this.prompts.filter(p => !p.pinned);

        // Sort each group separately
        switch (sortCriteria) {
            case 'titleAsc':
                pinnedPrompts.sort((a, b) => a.title.localeCompare(b.title));
                unpinnedPrompts.sort((a, b) => a.title.localeCompare(b.title));
                break;

            case 'titleDesc':
                pinnedPrompts.sort((a, b) => b.title.localeCompare(a.title));
                unpinnedPrompts.sort((a, b) => b.title.localeCompare(a.title));
                break;

            case 'oldest':
                pinnedPrompts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                unpinnedPrompts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;

            case 'recent':
            default:
                // Default to most recent first
                pinnedPrompts.sort((a, b) => {
                    const dateA = a.updatedAt || a.createdAt;
                    const dateB = b.updatedAt || b.createdAt;
                    return new Date(dateB) - new Date(dateA);
                });
                unpinnedPrompts.sort((a, b) => {
                    const dateA = a.updatedAt || a.createdAt;
                    const dateB = b.updatedAt || b.createdAt;
                    return new Date(dateB) - new Date(dateA);
                });
                break;
        }

        // Combine pinned prompts first, then unpinned prompts
        this.prompts = [...pinnedPrompts, ...unpinnedPrompts];
    },

    /**
     * Filter prompts based on search input
     */
    filterPrompts() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const prompts = StorageManager.getPrompts();

        if (searchTerm === '') {
            // If no search term, just load all prompts sorted normally
            this.prompts = prompts;
            this.sortPrompts();
            this.renderPrompts();
            return;
        }

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

        // Store filtered prompts and sort them
        this.prompts = filteredPrompts;
        this.sortPrompts();
        this.renderPrompts();
    },

    /**
     * Create a prompt card element
     * @param {Object} prompt Prompt data
     * @returns {HTMLElement} Prompt card element
     */
    createPromptCard(prompt) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        if (prompt.pinned) card.classList.add('pinned');
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
                    <button class="btn-icon btn-copy" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
                    <button class="btn-icon btn-send send" title="Send to active tab"><i class="fas fa-paper-plane"></i></button>
                    <button class="btn-icon delete" title="Delete prompt"><i class="fas fa-trash"></i></button>
                </div>
            </h3>
            <p class="prompt-content">${sanitizedContent}</p>
            <div class="prompt-meta">
                <span>Created: ${formattedDate}</span>
                ${prompt.pinned ? '<span class="pinned-indicator"><i class="fas fa-thumbtack"></i> Pinned</span>' : ''}
                <button class="btn-icon btn-pin pin-bottom" title="${prompt.pinned ? 'Unpin prompt' : 'Pin prompt'}">
                    <i class="fas ${prompt.pinned ? 'fa-thumbtack' : 'fa-thumbtack unpinned'}"></i>
                </button>
            </div>
        `;

        // After card is created, update the content class for line logic
        const contentEl = card.querySelector('.prompt-content');
        if (contentEl) updateContentClass(contentEl);

        // Add event listeners to the card buttons
        card.querySelector('.btn-copy').addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyPromptToClipboard(prompt);
        });

        card.querySelector('.btn-send').addEventListener('click', (e) => {
            e.stopPropagation();
            // Mark this button as active before sending
            const allSendButtons = document.querySelectorAll('.btn-send');
            allSendButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');

            this.sendPromptToActiveTab(prompt);
        });

        card.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirmationForPrompt(prompt.id);
        });

        // Remove event listener for expand button
        // Add event listener for new pin button
        card.querySelector('.btn-pin').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePinPrompt(prompt);
        });

        // Make the whole card clickable to view/edit the prompt
        card.addEventListener('click', () => {
            this.showViewEditPromptModal(prompt);
        });

        return card;
    },

    // Add this utility function for dynamic line class
    updateContentClass(element) {
        const text = element.textContent;
        const lineLength = 50; // approximate characters per line
        const lines = Math.ceil(text.length / lineLength);
        element.classList.remove('short', 'medium', 'long');
        if (lines <= 2) {
            element.classList.add('short');
        } else if (lines <= 4) {
            element.classList.add('medium');
        } else {
            element.classList.add('long');
        }
    },

    /**
     * Toggle pin status for a prompt
     * @param {Object} prompt Prompt to toggle pin status
     */
    async togglePinPrompt(prompt) {
        try {
            const payload = {
                pinned: !prompt.pinned,
                updatedAt: prompt.updatedAt
            };

            const success = await StorageManager.updatePrompt(prompt.id, payload);

            if (success) {
                UIManager.showToast(`Prompt ${payload.pinned ? 'pinned' : 'unpinned'} successfully!`, 'success');
            } else {
                UIManager.showToast('Failed to update pin status', 'error');
            }
        } catch (error) {
            console.error('Error toggling pin status:', error);
            UIManager.showToast('Failed to update pin status', 'error');
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

        // Update pin button state if it exists
        if (this.elements.pinFromViewBtn) {
            const icon = this.elements.pinFromViewBtn.querySelector('i');
            if (icon) {
                if (prompt.pinned) {
                    icon.className = 'fas fa-thumbtack';
                    this.elements.pinFromViewBtn.title = 'Unpin prompt';
                } else {
                    icon.className = 'fas fa-thumbtack unpinned';
                    this.elements.pinFromViewBtn.title = 'Pin prompt';
                }
            }
        }

        // Reattach event listeners to prevent multiple executions
        this.reattachViewEditModalListeners();

        this.elements.viewEditModal.classList.add('active');
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
    async createNewPrompt() {
        const title = this.elements.newPromptTitle.value.trim();
        const content = this.elements.newPromptTextarea.value.trim();

        if (!title || !content) {
            UIManager.showToast('Title and content are required!', 'error');
            return;
        }

        const promptData = {
            title,
            content,
            tags: '',
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const success = await StorageManager.savePrompt(promptData);

            if (success) {
                UIManager.showToast('Prompt created successfully!', 'success');
                this.closeModal(this.elements.newPromptModal);
            } else {
                UIManager.showToast('There was an error saving the prompt.', 'error');
            }
        } catch (error) {
            console.error('Error creating prompt:', error);
            UIManager.showToast('There was an error saving the prompt.', 'error');
        }
    },

    /**
     * Update the current prompt
     */
    async updatePrompt() {
        const id = this.elements.viewEditModal.dataset.id;
        const content = this.elements.viewEditTextarea.value.trim();
        const title = this.elements.viewEditTitle.textContent.trim();

        if (!content) {
            UIManager.showToast('Content cannot be empty!', 'error');
            return;
        }

        const promptData = { content, title };
        try {
            const success = await StorageManager.updatePrompt(id, promptData);

            if (success) {
                UIManager.showToast('Prompt updated successfully!', 'success');
                this.closeModal(this.elements.viewEditModal);
            } else {
                UIManager.showToast('There was an error updating the prompt.', 'error');
            }
        } catch (error) {
            console.error('Error updating prompt:', error);
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
    async deletePrompt() {
        const id = this.elements.deleteModal.dataset.id;
        if (!id) return;

        try {
            const success = await StorageManager.deletePrompt(id);

            if (success) {
                UIManager.showToast('Prompt deleted successfully!', 'success');
                this.closeModal(this.elements.deleteModal);
                this.closeModal(this.elements.viewEditModal);
            } else {
                UIManager.showToast('There was an error deleting the prompt.', 'error');
            }
        } catch (error) {
            console.error('Error deleting prompt:', error);
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
        // Mark this button as active
        this.elements.sendFromViewBtn.classList.add('active');

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
        // Show button loading state if any send button is active
        const sendButton = document.querySelector('.btn-send.active, #sendFromViewBtn, #sendExpandBtn');
        if (sendButton) {
            const iconElement = sendButton.querySelector('i');
            const originalClass = iconElement ? iconElement.className : '';

            if (iconElement) {
                iconElement.className = 'fas fa-spinner fa-spin';
                sendButton.classList.add('active');
            }

            InjectionManager.injectPrompt(text)
                .then(() => {
                    // Success animation
                    if (iconElement) {
                        iconElement.className = 'fas fa-check';
                        sendButton.classList.add('success');

                        // Revert after timeout
                        setTimeout(() => {
                            iconElement.className = originalClass || 'fas fa-paper-plane';
                            sendButton.classList.remove('success');
                            sendButton.classList.remove('active');
                        }, 1500);
                    }
                })
                .catch(error => {
                    console.error('Failed to send prompt:', error);

                    // Reset button state
                    if (iconElement) {
                        iconElement.className = originalClass || 'fas fa-paper-plane';
                    }
                    sendButton.classList.remove('active');

                    // Note: We don't show a toast here because InjectionManager already shows error messages
                });
        } else {
            // No active button found, just call injection manager
            InjectionManager.injectPrompt(text).catch(error => {
                console.error('Failed to send prompt:', error);
            });
        }
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
    },

    /**
     * Send the expanded prompt content to the active tab
     */
    sendExpandedPromptToActiveTab() {
        // Mark this button as active
        this.elements.sendExpandBtn.classList.add('active');

        const content = this.elements.expandViewContent.textContent;
        this.sendTextToActiveTab(content);
        // Toast is handled by the InjectionManager or sendTextToActiveTab
    },

    /**
     * Close a modal
     * @param {HTMLElement} modal Modal element to close
     */
    closeModal(modal) {
        modal.classList.remove('active');
    },

    /**
     * Copy the current prompt to clipboard
     */
    copyPromptToClipboard() {
        const content = this.elements.viewEditTextarea.value;
        navigator.clipboard.writeText(content)
            .then(() => {
                UIManager.showToast('Copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Could not copy text:', err);
                UIManager.showToast('Failed to copy to clipboard', 'error');
            });
    },

    /**
     * Send the current prompt to the active tab
     */
    sendPromptToActiveTab() {
        const content = this.elements.viewEditTextarea.value;
        if (!content) {
            UIManager.showToast('No content to send', 'error');
            return;
        }

        // Show button loading state if any send button is active
        const sendButton = document.querySelector('.btn-send.active, #sendFromViewBtn, #sendExpandBtn');
        if (sendButton) {
            const iconElement = sendButton.querySelector('i');
            const originalClass = iconElement ? iconElement.className : '';

            if (iconElement) {
                iconElement.className = 'fas fa-spinner fa-spin';
                sendButton.classList.add('active');
            }

            InjectionManager.injectPrompt(content)
                .then(() => {
                    // Success animation
                    if (iconElement) {
                        iconElement.className = 'fas fa-check';
                        sendButton.classList.add('success');

                        // Revert after timeout
                        setTimeout(() => {
                            iconElement.className = originalClass || 'fas fa-paper-plane';
                            sendButton.classList.remove('success');
                            sendButton.classList.remove('active');
                        }, 1500);
                    }
                })
                .catch(error => {
                    console.error('Failed to send prompt:', error);

                    // Reset button state
                    if (iconElement) {
                        iconElement.className = originalClass || 'fas fa-paper-plane';
                    }
                    sendButton.classList.remove('active');
                });
        } else {
            // No active button found, just call injection manager
            InjectionManager.injectPrompt(content).catch(error => {
                console.error('Failed to send prompt:', error);
            });
        }
    },

    /**
     * Toggle pin status for the current prompt in view
     */
    togglePinPrompt() {
        const id = this.elements.viewEditModal.dataset.id;
        if (!id) return;

        (async () => {
            try {
                const prompt = StorageManager.getPromptById(id);
                if (!prompt) {
                    UIManager.showToast('Prompt not found', 'error');
                    return;
                }

                const updated = await StorageManager.updatePrompt(id, { pinned: !prompt.pinned });
                if (updated) {
                    // Update the button icon to reflect the new state
                    if (this.elements.pinFromViewBtn) {
                        const icon = this.elements.pinFromViewBtn.querySelector('i');
                        if (icon) {
                            if (prompt.pinned) {
                                icon.classList.remove('fa-thumbtack');
                                icon.classList.add('fa-thumbtack', 'unpinned');
                                this.elements.pinFromViewBtn.title = 'Pin prompt';
                            } else {
                                icon.classList.remove('fa-thumbtack', 'unpinned');
                                icon.classList.add('fa-thumbtack');
                                this.elements.pinFromViewBtn.title = 'Unpin prompt';
                            }
                        }
                    }

                    UIManager.showToast(`Prompt ${prompt.pinned ? 'unpinned' : 'pinned'} successfully!`, 'success');

                    // Refresh prompts list to reflect change
                    this.loadPrompts();
                } else {
                    UIManager.showToast('Failed to update pin status', 'error');
                }
            } catch (error) {
                console.error('Error toggling pin status:', error);
                UIManager.showToast('Failed to update pin status', 'error');
            }
        })();
    },

    /**
     * Delete the current prompt
     */
    deleteCurrentPrompt() {
        const id = this.elements.deleteModal.dataset.id;
        if (!id) {
            console.error('No prompt ID found for deletion');
            return;
        }

        StorageManager.deletePrompt(id)
            .then(success => {
                if (success) {
                    UIManager.showToast('Prompt deleted successfully!', 'success');
                    this.closeModal(this.elements.deleteModal);
                    this.closeModal(this.elements.viewEditModal);
                    this.loadPrompts(); // Refresh the prompts list
                } else {
                    UIManager.showToast('Failed to delete prompt', 'error');
                }
            })
            .catch(error => {
                console.error('Error deleting prompt:', error);
                UIManager.showToast('Failed to delete prompt', 'error');
            });
    }
}; 