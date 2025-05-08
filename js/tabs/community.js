/**
 * Community tab module for handling community prompt-related functionality
 */

const CommunityTab = {
    elements: {},
    communityPrompts: [],
    filteredPrompts: [],
    currentFilter: 'all',

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
        this.elements = {
            // Main containers
            communityPromptContainer: document.getElementById('communityPromptContainer'),
            searchInput: document.getElementById('communitySearchInput'),
            filterSelect: document.getElementById('communityFilter'),

            // Community Prompt Modal elements
            viewCommunityPromptModal: document.getElementById('viewCommunityPromptModal'),
            viewCommunityPromptTitle: document.getElementById('viewCommunityPromptTitle'),
            viewCommunityPromptContent: document.getElementById('viewCommunityPromptContent'),
            viewCommunityPromptAuthor: document.getElementById('viewCommunityPromptAuthor'),
            closeViewCommunityPromptBtn: document.getElementById('closeViewCommunityPromptBtn'),
            saveToMyPromptsBtn: document.getElementById('saveToMyPromptsBtn'),
            copyFromViewPromptBtn: document.getElementById('copyFromViewPromptBtn'),
            sendFromViewPromptBtn: document.getElementById('sendFromViewPromptBtn')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search and filter events
        this.elements.searchInput.addEventListener('input', () => this.filterPrompts());
        this.elements.filterSelect.addEventListener('change', () => this.filterPrompts());

        // Community Prompt Modal events
        this.elements.closeViewCommunityPromptBtn.addEventListener('click', () => this.closeViewCommunityModal());
        this.elements.saveToMyPromptsBtn.addEventListener('click', () => this.saveToMyPrompts());
        this.elements.copyFromViewPromptBtn.addEventListener('click', () => this.copyPromptToClipboard());
        this.elements.sendFromViewPromptBtn.addEventListener('click', () => this.sendPromptToActiveTab());
    },

    /**
     * Load community prompts
     * This would usually fetch from an API, but we'll use mock data for now
     */
    async loadCommunityPrompts() {
        try {
            // Normally you would fetch from an API
            // For demo purposes, we're using mock data
            this.communityPrompts = [
                {
                    id: 'cp1',
                    title: 'Code Review Assistant',
                    content: 'Analyze my code and provide a comprehensive review that identifies bugs, security issues, performance optimizations, and style improvements. Include specific examples and fix suggestions.',
                    category: 'coding',
                    tags: ['review', 'debugging', 'optimization'],
                    author: 'DevMaster',
                    stars: 245,
                    usageCount: 1892,
                    createdAt: '2023-05-15'
                },
                {
                    id: 'cp2',
                    title: 'Blog Post Outline Generator',
                    content: 'Create a detailed outline for a blog post about [TOPIC]. Include an introduction, 5-7 main sections with 2-3 subsections each, and a conclusion. For each section, provide a brief description of what should be covered.',
                    category: 'writing',
                    tags: ['blog', 'content', 'outlining'],
                    author: 'ContentCreator',
                    stars: 189,
                    usageCount: 1245,
                    createdAt: '2023-06-02'
                },
                {
                    id: 'cp3',
                    title: 'UI Component Generator',
                    content: 'Design a [COMPONENT_TYPE] component in React with TypeScript that follows accessibility best practices. Include styled-components styling, responsive design, and proper component documentation.',
                    category: 'coding',
                    tags: ['react', 'typescript', 'ui'],
                    author: 'FrontEndPro',
                    stars: 321,
                    usageCount: 2451,
                    createdAt: '2023-04-22'
                },
                {
                    id: 'cp4',
                    title: 'Email Marketing Template',
                    content: 'Write a persuasive marketing email for [PRODUCT/SERVICE] targeting [AUDIENCE]. Include an attention-grabbing subject line, compelling opening, 3-4 benefit paragraphs, a strong call-to-action, and a professional signature.',
                    category: 'writing',
                    tags: ['email', 'marketing', 'copywriting'],
                    author: 'MarketingGuru',
                    stars: 156,
                    usageCount: 987,
                    createdAt: '2023-07-08'
                },
                {
                    id: 'cp5',
                    title: 'Productivity System Designer',
                    content: 'Create a personalized productivity system for me based on my work style: [DESCRIBE_STYLE]. Include daily routines, task management approach, focus techniques, and tools recommendations.',
                    category: 'productivity',
                    tags: ['systems', 'organization', 'workflow'],
                    author: 'EfficiencyExpert',
                    stars: 278,
                    usageCount: 1632,
                    createdAt: '2023-05-30'
                },
                {
                    id: 'cp6',
                    title: 'Story Idea Generator',
                    content: 'Generate a unique story concept based on the following elements: genre [GENRE], setting [SETTING], character type [CHARACTER]. Provide a brief synopsis, main character outline, and 3 potential plot twists.',
                    category: 'creative',
                    tags: ['writing', 'fiction', 'ideation'],
                    author: 'StoryTeller',
                    stars: 203,
                    usageCount: 1478,
                    createdAt: '2023-06-15'
                }
            ];

            // Initialize filtered prompts
            this.filteredPrompts = [...this.communityPrompts];

            // Render community prompts
            this.renderPrompts();
        } catch (error) {
            console.error('Error loading community prompts:', error);
            UIManager.showToast('Failed to load community prompts', 'error');
        }
    },

    /**
     * Render community prompts in the container
     */
    renderPrompts() {
        // Clear existing content
        this.elements.communityPromptContainer.innerHTML = '';

        if (this.filteredPrompts.length === 0) {
            this.elements.communityPromptContainer.innerHTML = `
                <div class="placeholder">
                    <p><i class="fas fa-search"></i> No prompts match your search</p>
                    <p class="placeholder-subtitle">Try different search terms or filters</p>
                </div>
            `;
            return;
        }

        // Create and append prompt cards
        this.filteredPrompts.forEach(prompt => {
            const card = this.createPromptCard(prompt);
            this.elements.communityPromptContainer.appendChild(card);
        });
    },

    /**
     * Filter prompts based on search input and category filter
     */
    filterPrompts() {
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        this.currentFilter = this.elements.filterSelect.value;

        this.filteredPrompts = this.communityPrompts.filter(prompt => {
            // Apply category filter
            const categoryMatch = this.currentFilter === 'all' || prompt.category === this.currentFilter;

            // Apply search filter if there's a search term
            let searchMatch = true;
            if (searchTerm) {
                searchMatch =
                    prompt.title.toLowerCase().includes(searchTerm) ||
                    prompt.content.toLowerCase().includes(searchTerm) ||
                    prompt.author.toLowerCase().includes(searchTerm) ||
                    (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
            }

            return categoryMatch && searchMatch;
        });

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
        card.dataset.id = prompt.id;

        // Sanitize HTML content
        const sanitizedTitle = UIManager.sanitizeHtml(prompt.title);
        const sanitizedContent = UIManager.sanitizeHtml(prompt.content);
        const sanitizedAuthor = UIManager.sanitizeHtml(prompt.author || 'Community User');

        card.innerHTML = `
            <h3 class="prompt-title">
                <span class="prompt-title-text">${sanitizedTitle}</span>
                <div class="title-buttons">
                    <button class="btn-icon btn-expand" title="Expand to full view"><i class="fas fa-expand-alt"></i></button>
                    <button class="btn-icon btn-copy" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
                    <button class="btn-icon btn-send send" title="Send to active tab"><i class="fas fa-paper-plane"></i></button>
                </div>
            </h3>
            <div class="prompt-preview">
                <div class="prompt-content">${sanitizedContent}</div>
            </div>
            <div class="prompt-meta">
                <span>By: ${sanitizedAuthor}</span>
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

        card.querySelector('.btn-expand').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openViewCommunityModal(prompt.id);
        });

        // Make the whole card clickable
        card.addEventListener('click', () => {
            this.openViewCommunityModal(prompt.id);
        });

        return card;
    },

    /**
     * Open the community prompt view modal
     * @param {string} promptId - ID of the prompt to view
     */
    openViewCommunityModal(promptId) {
        const prompt = this.communityPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        // Set current prompt ID for save button
        this.elements.saveToMyPromptsBtn.dataset.promptId = promptId;

        // Populate modal content
        this.elements.viewCommunityPromptTitle.textContent = prompt.title;
        this.elements.viewCommunityPromptContent.textContent = prompt.content;
        this.elements.viewCommunityPromptAuthor.textContent = `Created by: ${prompt.author || 'Community User'}`;

        // Make content editable
        this.elements.viewCommunityPromptContent.contentEditable = true;
        this.elements.viewCommunityPromptContent.style.cursor = 'text';
        this.elements.viewCommunityPromptContent.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

        // Show modal
        this.elements.viewCommunityPromptModal.classList.add('active');
    },

    /**
     * Close the community prompt view modal
     */
    closeViewCommunityModal() {
        this.elements.viewCommunityPromptModal.classList.remove('active');
    },

    /**
     * Save the viewed prompt to my prompts collection
     */
    async saveToMyPrompts() {
        try {
            const promptId = this.elements.saveToMyPromptsBtn.dataset.promptId;
            if (!promptId) {
                console.error('No prompt ID found');
                return;
            }

            // Get the original prompt
            const originalPrompt = this.communityPrompts.find(p => p.id === promptId);
            if (!originalPrompt) {
                console.error('Original prompt not found');
                return;
            }

            // Get the potentially edited content
            const editedContent = this.elements.viewCommunityPromptContent.textContent.trim();
            if (!editedContent) {
                UIManager.showToast('Prompt content cannot be empty', 'error');
                return;
            }

            // Create a new prompt object for the user's collection
            const newPrompt = {
                title: editedContent === originalPrompt.content
                    ? `${originalPrompt.title} (imported)`
                    : `${originalPrompt.title} (edited)`,
                content: editedContent,
                tags: originalPrompt.tags ? originalPrompt.tags.join(',') : 'imported',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Attempting to save prompt:', newPrompt);

            // Save using StorageManager
            const success = await StorageManager.savePrompt(newPrompt);

            if (success) {
                // Update usage count
                const promptIndex = this.communityPrompts.findIndex(p => p.id === promptId);
                if (promptIndex !== -1) {
                    this.communityPrompts[promptIndex].usageCount++;
                }

                // Close modal
                this.closeViewCommunityModal();

                // Show success message
                UIManager.showToast('Prompt saved to your collection', 'success');

                // Refresh the prompts tab
                if (window.PromptsTab && typeof window.PromptsTab.loadPrompts === 'function') {
                    window.PromptsTab.loadPrompts();
                }

                // Switch to prompts tab to show the newly added prompt
                setTimeout(() => {
                    const promptsTab = document.querySelector('.tab[data-tab="prompts"]');
                    if (promptsTab && window.app && typeof window.app.switchTab === 'function') {
                        window.app.switchTab('prompts');
                    }
                }, 300);
            } else {
                UIManager.showToast('Prompt already exists in your collection', 'info');
            }
        } catch (error) {
            console.error('Error saving prompt:', error);
            UIManager.showToast('Failed to save prompt', 'error');
        }
    },

    /**
     * Copy prompt content from the view modal to clipboard
     */
    copyPromptToClipboard(prompt) {
        const content = prompt ? (typeof prompt === 'object' ? prompt.content : prompt) : this.elements.viewCommunityPromptContent.textContent;
        this.copyTextToClipboard(content);
    },

    /**
     * Send prompt from the view modal to active tab
     */
    sendPromptToActiveTab(prompt) {
        const content = prompt ? (typeof prompt === 'object' ? prompt.content : prompt) : this.elements.viewCommunityPromptContent.textContent;
        this.sendTextToActiveTab(content);
    },

    /**
     * Copy text to clipboard
     * @param {string} text Text to copy
     */
    copyTextToClipboard(text) {
        if (!text) return;

        try {
            navigator.clipboard.writeText(text)
                .then(() => {
                    UIManager.showToast('Copied to clipboard!', 'success');
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    UIManager.showToast('Failed to copy text', 'error');
                    this.fallbackCopyToClipboard(text);
                });
        } catch (err) {
            console.error('Failed to copy text: ', err);
            UIManager.showToast('Failed to copy text', 'error');
            this.fallbackCopyToClipboard(text);
        }
    },

    /**
     * Fallback method to copy text to clipboard
     * @param {string} text Text to copy
     */
    fallbackCopyToClipboard(text) {
        // Create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();

        try {
            // Execute copy command
            document.execCommand('copy');
            UIManager.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            UIManager.showToast('Failed to copy text', 'error');
            console.error('Failed to copy text: ', err);
        }

        // Cleanup
        document.body.removeChild(textarea);
    },

    /**
     * Send text to active tab
     * @param {string} text Text to send
     */
    sendTextToActiveTab(text) {
        if (!text) return;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'sendPrompt',
                    prompt: text
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        UIManager.showToast('Could not send to tab. Try refreshing the page.', 'error');
                    } else if (response && response.success) {
                        UIManager.showToast('Prompt sent to active tab!', 'success');
                    } else {
                        UIManager.showToast('Failed to send prompt', 'error');
                    }
                });
            } else {
                UIManager.showToast('No active tab found', 'error');
            }
        });
    }
};

// Initialize the tab when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make CommunityTab available globally
    window.CommunityTab = CommunityTab;
}); 