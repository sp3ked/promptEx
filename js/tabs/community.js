/**
 * Community tab module for handling community prompt-related functionality
 */

const CommunityTab = {
    /**
     * Initialize community tab
     */
    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadCommunityPrompts();
    },

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.communitySearchInput = document.getElementById('communitySearchInput');
        this.trendingPromptsContainer = document.querySelector('#communityTab .community-section:first-child .prompts-container');
        this.topRatedPromptsContainer = document.querySelector('#communityTab .community-section:nth-child(2) .prompts-container');
        this.viewPromptModal = document.getElementById('viewCommunityPromptModal');
        this.viewPromptTitle = document.getElementById('viewCommunityPromptTitle');
        this.viewPromptContent = document.getElementById('viewCommunityPromptContent');
        this.viewPromptAuthor = document.getElementById('viewCommunityPromptAuthor');
        this.closeViewPromptBtn = document.getElementById('closeViewCommunityPromptBtn');
        this.copyFromViewPromptBtn = document.getElementById('copyFromViewPromptBtn');
        this.saveToMyPromptsBtn = document.getElementById('saveToMyPromptsBtn');
        this.sendFromViewPromptBtn = document.getElementById('sendFromViewPromptBtn');
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search input
        this.communitySearchInput.addEventListener('input', (e) => this.filterCommunityPrompts(e.target.value));

        // View prompt modal
        this.closeViewPromptBtn.addEventListener('click', () => this.closeViewPromptModal());
        this.copyFromViewPromptBtn.addEventListener('click', () => this.copyPromptContent());
        this.saveToMyPromptsBtn.addEventListener('click', () => this.saveToMyPrompts());
        this.sendFromViewPromptBtn.addEventListener('click', () => this.sendPromptContent());

        // Existing community card buttons
        const copyButtons = document.querySelectorAll('#communityTab .btn-copy');
        const sendButtons = document.querySelectorAll('#communityTab .btn-send');

        copyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.prompt-card');
                if (card) {
                    const promptContent = card.querySelector('.prompt-content').textContent;
                    this.copyToClipboard(promptContent, card.querySelector('.prompt-title-text').textContent);
                }
            });
        });

        sendButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.prompt-card');
                if (card) {
                    const promptContent = card.querySelector('.prompt-content').textContent;
                    this.sendToActiveTab(promptContent, card.querySelector('.prompt-title-text').textContent);
                }
            });
        });

        // Make all existing cards clickable
        const promptCards = document.querySelectorAll('#communityTab .prompt-card');
        promptCards.forEach(card => {
            // Title click opens view modal
            card.querySelector('.prompt-title-text').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showViewPromptModal(card);
            });

            // Content click also opens view modal
            card.querySelector('.prompt-content').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showViewPromptModal(card);
            });
        });
    },

    /**
     * Load community prompts
     * This would usually fetch from an API, but we'll use mock data for now
     */
    loadCommunityPrompts() {
        // We'll use the existing static content for now
        // In a real implementation, this would fetch from an API

        // Re-bind events to make sure all cards have proper handlers
        this.bindEvents();
    },

    /**
     * Filter community prompts based on search query
     * @param {string} query Search query
     */
    filterCommunityPrompts(query) {
        query = query.toLowerCase();
        const allPromptCards = document.querySelectorAll('#communityTab .prompt-card');

        if (!query) {
            // Show all cards if query is empty
            allPromptCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }

        // Hide/show cards based on search
        allPromptCards.forEach(card => {
            const titleText = card.querySelector('.prompt-title-text').textContent.toLowerCase();
            const contentText = card.querySelector('.prompt-content').textContent.toLowerCase();

            if (titleText.includes(query) || contentText.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    /**
     * Show view prompt modal
     * @param {HTMLElement} card Prompt card element
     */
    showViewPromptModal(card) {
        const title = card.querySelector('.prompt-title-text').textContent;
        const content = card.querySelector('.prompt-content').textContent;
        const author = card.querySelector('.prompt-meta span').textContent.replace('By: ', '');

        this.viewPromptTitle.textContent = title;
        this.viewPromptContent.textContent = content;
        this.viewPromptAuthor.textContent = `Created by: ${author}`;

        // Store current content for copy/send actions
        this.currentViewingPrompt = {
            title,
            content,
            author
        };

        this.viewPromptModal.classList.add('show');
    },

    /**
     * Close view prompt modal
     */
    closeViewPromptModal() {
        this.viewPromptModal.classList.remove('show');
        this.currentViewingPrompt = null;
    },

    /**
     * Copy prompt content from view modal
     */
    copyPromptContent() {
        if (!this.currentViewingPrompt) return;

        this.copyToClipboard(
            this.currentViewingPrompt.content,
            this.currentViewingPrompt.title
        );
    },

    /**
     * Send prompt content from view modal
     */
    sendPromptContent() {
        if (!this.currentViewingPrompt) return;

        this.sendToActiveTab(
            this.currentViewingPrompt.content,
            this.currentViewingPrompt.title
        );
    },

    /**
     * Save community prompt to my prompts
     */
    saveToMyPrompts() {
        if (!this.currentViewingPrompt) return;

        const success = StorageManager.savePrompt({
            title: this.currentViewingPrompt.title,
            content: this.currentViewingPrompt.content
        });

        if (success) {
            UIManager.showToast(`"${this.currentViewingPrompt.title}" saved to your prompts!`, 'success');
            this.closeViewPromptModal();
        } else {
            UIManager.showToast('Error saving prompt', 'error');
        }
    },

    /**
     * Copy prompt content to clipboard
     * @param {string} content Prompt content to copy
     * @param {string} title Prompt title for notification
     */
    async copyToClipboard(content, title) {
        try {
            await navigator.clipboard.writeText(content);
            UIManager.showToast(`"${title}" copied to clipboard!`, 'success');
        } catch (error) {
            UIManager.showToast('Error copying prompt', 'error');
        }
    },

    /**
     * Send prompt to active tab
     * @param {string} content Prompt content to send
     * @param {string} title Prompt title for notification
     */
    async sendToActiveTab(content, title) {
        try {
            await InjectionManager.injectPrompt(content);
            UIManager.showToast(`"${title}" sent to active tab!`, 'success');
        } catch (error) {
            // Error is already handled by InjectionManager
        }
    }
}; 