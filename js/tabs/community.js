/**
 * Community tab module for handling community prompt-related functionality
 */

class CommunityTab {
    constructor() {
        this.elements = {};
        this.currentFilters = {
            category: 'all',
            search: '',
            sort: 'popular'
        };
        this.communityPrompts = [];
        this.starredPrompts = new Set();
    }

    /**
     * Initialize community tab
     */
    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadCommunityPrompts();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            // Main containers
            communitySectionsWrapper: document.querySelector('.community-sections-wrapper'),
            searchInput: document.querySelector('#communitySearchInput'),
            sortSelect: document.querySelector('#communitySortSelect'),
            categoryFilter: document.querySelector('#communityCategoryFilter'),

            // Section containers - will be populated dynamically
            featuredSection: null,
            popularSection: null,
            recentSection: null,

            // Old modal elements (for backwards compatibility)
            viewPromptModal: document.querySelector('#viewPromptModal'),
            viewPromptTitle: document.querySelector('#viewPromptTitle'),
            viewPromptContent: document.querySelector('#viewPromptContent'),
            viewPromptCategory: document.querySelector('#viewPromptCategory'),
            viewPromptTags: document.querySelector('#viewPromptTags'),
            viewPromptStats: document.querySelector('#viewPromptStats'),
            viewPromptClose: document.querySelector('#viewPromptClose'),
            viewPromptImport: document.querySelector('#viewPromptImport'),

            // View Community Prompt Modal elements
            viewCommunityPromptModal: document.querySelector('#viewCommunityPromptModal'),
            viewCommunityPromptTitle: document.querySelector('#viewCommunityPromptTitle'),
            viewCommunityPromptContent: document.querySelector('#viewCommunityPromptContent'),
            viewCommunityPromptAuthor: document.querySelector('#viewCommunityPromptAuthor'),
            closeViewCommunityPromptBtn: document.querySelector('#closeViewCommunityPromptBtn'),
            saveToMyPromptsBtn: document.querySelector('#saveToMyPromptsBtn'),
            copyFromViewPromptBtn: document.querySelector('#copyFromViewPromptBtn'),
            sendFromViewPromptBtn: document.querySelector('#sendFromViewPromptBtn')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search and filter events
        this.elements.searchInput.addEventListener('input', () => this.filterPrompts());
        this.elements.sortSelect.addEventListener('change', () => this.sortPrompts());
        this.elements.categoryFilter.addEventListener('change', () => this.filterByCategory());

        // Legacy Modal events (for backward compatibility)
        if (this.elements.viewPromptClose) {
            this.elements.viewPromptClose.addEventListener('click', () => this.closeViewModal());
        }
        if (this.elements.viewPromptImport) {
            this.elements.viewPromptImport.addEventListener('click', () => this.importPrompt());
        }

        // Community Prompt Modal events
        this.elements.closeViewCommunityPromptBtn.addEventListener('click', () => this.closeViewCommunityModal());
        this.elements.saveToMyPromptsBtn.addEventListener('click', () => this.saveToMyPrompts());
        this.elements.copyFromViewPromptBtn.addEventListener('click', () => this.copyPromptToClipboard());
        this.elements.sendFromViewPromptBtn.addEventListener('click', () => this.sendPromptToActiveTab());

        // Event delegation for community sections
        this.elements.communitySectionsWrapper.addEventListener('click', (e) => {
            const promptCard = e.target.closest('.community-prompt-card');
            if (!promptCard) return;

            // Handle star button
            if (e.target.closest('.btn-star')) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleStar(promptCard.dataset.promptId);
                return;
            }

            // Handle import button
            if (e.target.closest('.btn-import')) {
                e.preventDefault();
                e.stopPropagation();
                this.importPrompt(promptCard.dataset.promptId);
                return;
            }

            // Handle view button or title/content click
            if (e.target.closest('.btn-view') ||
                e.target.closest('.community-prompt-title-text') ||
                e.target.closest('.community-prompt-content')) {
                e.preventDefault();
                e.stopPropagation();
                this.openViewCommunityModal(promptCard.dataset.promptId);
            }
        });
    }

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
                    createdAt: '2023-05-15',
                    featured: true
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
                    createdAt: '2023-06-02',
                    featured: false
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
                    createdAt: '2023-04-22',
                    featured: true
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
                    createdAt: '2023-07-08',
                    featured: false
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
                    createdAt: '2023-05-30',
                    featured: true
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
                    createdAt: '2023-06-15',
                    featured: false
                }
            ];

            // Load user's starred prompts from localStorage
            const storedStars = localStorage.getItem('starredCommunityPrompts');
            if (storedStars) {
                this.starredPrompts = new Set(JSON.parse(storedStars));
            }

            // Render community sections
            this.renderCommunitySections();
        } catch (error) {
            console.error('Error loading community prompts:', error);
            this.showToast('Failed to load community prompts', 'error');
        }
    }

    renderCommunitySections() {
        // Clear existing content
        this.elements.communitySectionsWrapper.innerHTML = '';

        // Create featured section
        const featuredPrompts = this.communityPrompts.filter(p => p.featured);
        this.renderSection('Featured Prompts', 'Curated prompts selected by our team', featuredPrompts);

        // Create popular section - sort by stars
        const popularPrompts = [...this.communityPrompts].sort((a, b) => b.stars - a.stars).slice(0, 5);
        this.renderSection('Popular Prompts', 'Most starred prompts from our community', popularPrompts);

        // Create recent section - sort by date
        const recentPrompts = [...this.communityPrompts].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        this.renderSection('Recent Prompts', 'Newly added prompts to explore', recentPrompts);
    }

    renderSection(title, description, prompts) {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'community-section';

        // Create section header
        const headerElement = document.createElement('div');
        headerElement.className = 'section-header';

        const titleElement = document.createElement('div');
        titleElement.className = 'section-title';
        titleElement.textContent = title;

        headerElement.appendChild(titleElement);
        sectionElement.appendChild(headerElement);

        // Add section description
        if (description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'section-description';
            descriptionElement.textContent = description;
            sectionElement.appendChild(descriptionElement);
        }

        // Create prompts container
        const promptsContainer = document.createElement('div');
        promptsContainer.className = 'community-prompts-container';

        // Add prompts or placeholder
        if (prompts.length === 0) {
            promptsContainer.innerHTML = `
                <div class="community-placeholder">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 16px;"></i>
                    <p>No prompts found in this section</p>
                </div>
            `;
        } else {
            prompts.forEach(prompt => {
                promptsContainer.appendChild(this.createPromptCard(prompt));
            });
        }

        sectionElement.appendChild(promptsContainer);
        this.elements.communitySectionsWrapper.appendChild(sectionElement);
    }

    /**
     * Create a prompt card element
     * @param {Object} prompt Prompt data
     * @returns {HTMLElement} Prompt card element
     */
    createPromptCard(prompt) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.id = prompt.id || `community-${Date.now()}`;

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
            <p class="prompt-content">${sanitizedContent}</p>
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
            PromptsTab.showExpandView(prompt);
        });

        return card;
    }

    filterPrompts() {
        this.currentFilters.search = this.elements.searchInput.value.toLowerCase();
        this.applyFilters();
    }

    sortPrompts() {
        this.currentFilters.sort = this.elements.sortSelect.value;
        this.applyFilters();
    }

    filterByCategory() {
        this.currentFilters.category = this.elements.categoryFilter.value;
        this.applyFilters();
    }

    applyFilters() {
        // This would typically involve re-fetching data with filters applied
        // For demo purposes, we're just re-rendering with the same data
        this.renderCommunitySections();

        const searchTerms = this.currentFilters.search.split(' ').filter(term => term.length > 0);

        // Hide cards that don't match filters
        const promptCards = document.querySelectorAll('.community-prompt-card');
        promptCards.forEach(card => {
            const prompt = this.communityPrompts.find(p => p.id === card.dataset.promptId);
            if (!prompt) return;

            // Apply category filter
            const categoryMatch = this.currentFilters.category === 'all' ||
                prompt.category === this.currentFilters.category;

            // Apply search filter
            let searchMatch = true;
            if (searchTerms.length > 0) {
                searchMatch = searchTerms.every(term =>
                    prompt.title.toLowerCase().includes(term) ||
                    prompt.content.toLowerCase().includes(term) ||
                    prompt.tags.some(tag => tag.toLowerCase().includes(term)));
            }

            card.style.display = categoryMatch && searchMatch ? 'block' : 'none';
        });

        // Show placeholder for empty sections
        document.querySelectorAll('.community-section').forEach(section => {
            const visibleCards = section.querySelectorAll('.community-prompt-card[style="display: block"]');
            let placeholder = section.querySelector('.community-placeholder');

            if (visibleCards.length === 0) {
                if (!placeholder) {
                    placeholder = document.createElement('div');
                    placeholder.className = 'community-placeholder';
                    placeholder.innerHTML = `
                        <i class="fas fa-filter" style="font-size: 24px; margin-bottom: 16px;"></i>
                        <p>No prompts match your filters</p>
                    `;
                    section.querySelector('.community-prompts-container').appendChild(placeholder);
                }
            } else if (placeholder) {
                placeholder.remove();
            }
        });
    }

    toggleStar(promptId) {
        const isCurrentlyStarred = this.starredPrompts.has(promptId);
        const promptCards = document.querySelectorAll(`.community-prompt-card[data-prompt-id="${promptId}"]`);

        if (isCurrentlyStarred) {
            this.starredPrompts.delete(promptId);
            promptCards.forEach(card => {
                card.querySelector('.btn-star').classList.remove('active');
                card.querySelector('.star-count').classList.remove('active');
            });

            // Update prompt object
            const promptIndex = this.communityPrompts.findIndex(p => p.id === promptId);
            if (promptIndex !== -1) {
                this.communityPrompts[promptIndex].stars--;
                promptCards.forEach(card => {
                    card.querySelector('.star-count').textContent = ` ${this.communityPrompts[promptIndex].stars}`;
                });
            }

            this.showToast('Removed from your starred prompts', 'info');
        } else {
            this.starredPrompts.add(promptId);
            promptCards.forEach(card => {
                card.querySelector('.btn-star').classList.add('active');
                card.querySelector('.star-count').classList.add('active');
            });

            // Update prompt object
            const promptIndex = this.communityPrompts.findIndex(p => p.id === promptId);
            if (promptIndex !== -1) {
                this.communityPrompts[promptIndex].stars++;
                promptCards.forEach(card => {
                    card.querySelector('.star-count').textContent = ` ${this.communityPrompts[promptIndex].stars}`;
                });
            }

            this.showToast('Added to your starred prompts', 'success');
        }

        // Save to localStorage
        localStorage.setItem('starredCommunityPrompts', JSON.stringify([...this.starredPrompts]));
    }

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
        this.elements.viewCommunityPromptAuthor.textContent = `Created by: ${prompt.author}`;

        // Show modal
        this.elements.viewCommunityPromptModal.classList.add('show');
    }

    /**
     * Close the community prompt view modal
     */
    closeViewCommunityModal() {
        this.elements.viewCommunityPromptModal.classList.remove('show');
    }

    /**
     * Save the viewed prompt to my prompts collection
     */
    saveToMyPrompts() {
        const promptId = this.elements.saveToMyPromptsBtn.dataset.promptId;
        if (!promptId) return;

        this.importPrompt(promptId);
    }

    /**
     * Copy prompt content to clipboard
     */
    copyPromptToClipboard(prompt) {
        const content = prompt.content;
        if (!content) return;

        navigator.clipboard.writeText(content)
            .then(() => this.showToast('Prompt copied to clipboard', 'success'))
            .catch(() => this.showToast('Failed to copy prompt', 'error'));
    }

    /**
     * Send prompt to active tab
     */
    sendPromptToActiveTab(prompt) {
        const content = prompt.content;
        if (!content) return;

        // Use chrome.tabs API to send content to active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', prompt: content })
                    .then(() => this.showToast('Prompt sent to active tab', 'success'))
                    .catch(() => this.showToast('Failed to send prompt to active tab', 'error'));
            } else {
                this.showToast('No active tab found', 'error');
            }
        });
    }

    openViewModal(promptId) {
        // Use the new community modal instead
        this.openViewCommunityModal(promptId);
    }

    closeViewModal() {
        // If the old modal exists, close it
        if (this.elements.viewPromptModal) {
            this.elements.viewPromptModal.classList.remove('show');
        }
        // Also close the new modal
        this.closeViewCommunityModal();
    }

    importPrompt(promptId) {
        // If called from view modal, get ID from button
        if (!promptId) {
            // Try to get from the community modal first
            if (this.elements.saveToMyPromptsBtn && this.elements.saveToMyPromptsBtn.dataset.promptId) {
                promptId = this.elements.saveToMyPromptsBtn.dataset.promptId;
            }
            // Fall back to the old modal if needed
            else if (this.elements.viewPromptImport && this.elements.viewPromptImport.dataset.promptId) {
                promptId = this.elements.viewPromptImport.dataset.promptId;
            }
        }

        const prompt = this.communityPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        // Create a new prompt object for the user's collection
        const newPrompt = {
            id: `imported-${Date.now()}`,
            title: `${prompt.title} (imported)`,
            content: prompt.content,
            folder: 'Imported',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Get existing prompts
        let userPrompts = [];
        try {
            const stored = localStorage.getItem('prompts');
            if (stored) {
                userPrompts = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error parsing prompts from localStorage:', error);
        }

        // Add new prompt
        userPrompts.push(newPrompt);

        // Save to localStorage
        localStorage.setItem('prompts', JSON.stringify(userPrompts));

        // Update usage count
        const promptIndex = this.communityPrompts.findIndex(p => p.id === promptId);
        if (promptIndex !== -1) {
            this.communityPrompts[promptIndex].usageCount++;
        }

        // Close modals
        this.closeViewModal();
        this.closeViewCommunityModal();

        // Show success message
        this.showToast('Prompt imported to your collection', 'success');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`Toast: ${message} (${type})`);
        }
    }

    /**
     * Copy text to clipboard
     * @param {string} text Text to copy
     */
    copyTextToClipboard(text) {
        if (!text) return;

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
    },
}

export default CommunityTab; 