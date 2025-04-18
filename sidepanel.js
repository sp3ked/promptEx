// sidepanel.js - Promptr Core Logic

async function injectPromptAndFileIntoPage(promptData) {
    console.log("Promptr: Injecting text:", promptData);
    const { content } = promptData;

    function simulateInput(element, text) {
        element.focus();
        if (element.isContentEditable) {
            document.execCommand('insertText', false, text || '');
        } else {
            element.value = text || '';
        }
        element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }

    try {
        const selectors = [
            'div.ProseMirror[contenteditable="true"][translate="no"]#prompt-textarea', // ChatGPT
            '.ProseMirror[contenteditable="true"][translate="no"]', // Claude
            'div[contenteditable="true"][aria-label="Write your prompt to Claude"]', // Claude alt
            'div.ProseMirror.break-words', // Claude fallback
            'textarea[data-testid="tweetTextarea_0"]', // Grok
            'textarea[placeholder*="message"]', // Generic fallback
            'div[role="textbox"]', // Broad fallback
            'div.relative.flex.w-full.grow.flex-col', // Gemini
            'div[contenteditable="true"][role="textbox"]' // More general fallback
        ];

        let targetTextArea;
        for (const selector of selectors) {
            targetTextArea = document.querySelector(selector);
            if (targetTextArea) {
                console.log("Promptr: Found text area with selector:", selector);
                break;
            }
        }

        if (targetTextArea) {
            simulateInput(targetTextArea, content);
            console.log("Promptr: Text injected successfully.");
            chrome.runtime.sendMessage({
                action: "showToast",
                message: "Prompt injected!",
                type: "success"
            });
        } else {
            throw new Error("Make sure you're on an LLM website<details><summary>Show supported websites</summary>• ChatGPT (chat.openai.com)<br>• Claude (claude.ai)<br>• Grok (grok.x.ai)<br>• Gemini (gemini.google.com)<br>• Perplexity (perplexity.ai)</details>");
        }
    } catch (error) {
        console.error("Promptr: Injection error:", error);
        chrome.runtime.sendMessage({
            action: "showErrorWithDetails",
            message: error.message,
            type: "error"
        });
        throw error;
    }
}

class PromptManager {
    constructor() {
        this.prompts = [];
        this.initializeElements();
        this.loadPrompts();
        this.loadSettings();
        this.setupEventListeners();
        this.setupTabNavigation();
        this.showTab('prompts'); // Default to "Prompts" tab
    }

    initializeElements() {
        this.promptsContainer = document.getElementById('promptsContainer');
        this.newPromptBtn = document.getElementById('newPromptBtn');
        this.toast = document.getElementById('toast');
        this.deleteModal = document.getElementById('deleteModal');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        this.viewEditModal = document.getElementById('viewEditModal');
        this.viewEditTitle = document.getElementById('viewEditTitle');
        this.viewEditTextarea = document.getElementById('viewEditTextarea');
        this.closeViewEditBtn = document.getElementById('closeViewEditBtn');
        this.deleteFromViewBtn = document.getElementById('deleteFromViewBtn');
        this.copyFromViewBtn = document.getElementById('copyFromViewBtn');
        this.sendFromViewBtn = document.getElementById('sendFromViewBtn');
        this.saveFromViewBtn = document.getElementById('saveFromViewBtn');
        this.newPromptModal = document.getElementById('newPromptModal');
        this.newPromptTitle = document.getElementById('newPromptTitle');
        this.newPromptTextarea = document.getElementById('newPromptTextarea');
        this.closeNewPromptBtn = document.getElementById('closeNewPromptBtn');
        this.cancelNewPromptBtn = document.getElementById('cancelNewPromptBtn');
        this.createNewPromptBtn = document.getElementById('createNewPromptBtn');
        // Settings elements
        this.modeSelect = document.getElementById('modeSelect');
        this.faqBtn = document.getElementById('faqBtn');
        this.accountBtn = document.getElementById('accountBtn');
        this.faqModal = document.getElementById('faqModal');
        this.accountModal = document.getElementById('accountModal');
        this.closeFaqBtn = document.getElementById('closeFaqBtn');
        this.closeAccountBtn = document.getElementById('closeAccountBtn');
        this.promptCountEl = document.getElementById('promptCount');
        // Tab elements
        this.tabs = document.querySelectorAll('.tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        // Search and sort elements
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.promptsSearchContainer = document.getElementById('promptsSearchContainer');
        this.communitySearchContainer = document.getElementById('communitySearchContainer');
        this.communitySearchInput = document.getElementById('communitySearchInput');
        this.communitySortSelect = document.getElementById('communitySortSelect');

        this.pendingDeleteId = null;
        this.currentlyViewingId = null;
    }

    setupEventListeners() {
        if (this.newPromptBtn) this.newPromptBtn.addEventListener('click', () => this.showNewPromptModal());
        if (this.confirmDeleteBtn) this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        if (this.cancelDeleteBtn) this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        if (this.closeViewEditBtn) this.closeViewEditBtn.addEventListener('click', () => this.closeViewEditModal());
        if (this.deleteFromViewBtn) this.deleteFromViewBtn.addEventListener('click', () => this.deletePrompt(this.currentlyViewingId));
        if (this.copyFromViewBtn) this.copyFromViewBtn.addEventListener('click', () => this.copyPrompt(this.currentlyViewingId));
        if (this.sendFromViewBtn) this.sendFromViewBtn.addEventListener('click', () => this.sendPrompt(this.currentlyViewingId));
        if (this.saveFromViewBtn) this.saveFromViewBtn.addEventListener('click', () => this.savePromptFromView());
        if (this.closeNewPromptBtn) this.closeNewPromptBtn.addEventListener('click', () => this.closeNewPromptModal());
        if (this.cancelNewPromptBtn) this.cancelNewPromptBtn.addEventListener('click', () => this.closeNewPromptModal());
        if (this.createNewPromptBtn) this.createNewPromptBtn.addEventListener('click', () => this.createNewPrompt());

        // Setup click listeners for prompt cards in the prompts tab
        if (this.promptsContainer) {
            this.promptsContainer.addEventListener('click', (event) => {
                const target = event.target;
                const card = target.closest('.prompt-card');
                const button = target.closest('.btn-icon');
                if (!card) return;
                const promptId = parseInt(card.getAttribute('data-prompt-id'), 10);
                if (isNaN(promptId)) {
                    console.error("Invalid prompt ID:", card.getAttribute('data-prompt-id'));
                    return;
                }
                if (button) {
                    if (button.classList.contains('btn-send')) this.sendPrompt(promptId);
                    else if (button.classList.contains('btn-copy')) this.copyPrompt(promptId);
                    else if (button.classList.contains('btn-delete')) this.deletePrompt(promptId);
                } else {
                    this.showViewEditModal(promptId);
                }
            });
        }

        // Setup click listeners for community prompt cards
        document.querySelectorAll('.community-section .prompts-container').forEach(container => {
            container.addEventListener('click', (event) => {
                const target = event.target;
                const card = target.closest('.prompt-card');
                const button = target.closest('.btn-icon');
                if (!card) return;
                const promptId = card.getAttribute('data-prompt-id');
                if (!promptId) {
                    console.error("Invalid community prompt ID:", promptId);
                    return;
                }
                if (button) {
                    if (button.classList.contains('btn-send')) {
                        // Find the prompt content and send it
                        const content = card.querySelector('.prompt-content')?.textContent;
                        if (content) {
                            // Show sending toast
                            this.showToast('Sending prompt...', 'info');

                            // Get the community prompt ID and retrieve the full content
                            const fullContent = communityPrompts[promptId] || content;

                            try {
                                // Get the active tab and send the prompt
                                chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                                    if (!tabs || !tabs[0] || !tabs[0].id) {
                                        throw new Error('No active tab found.');
                                    }

                                    // Change to checkmark icon
                                    const iconElement = button.querySelector('i');
                                    const originalClass = iconElement ? iconElement.className : '';

                                    if (iconElement) {
                                        iconElement.className = 'fas fa-spinner fa-spin';
                                    }

                                    try {
                                        await chrome.scripting.executeScript({
                                            target: { tabId: tabs[0].id },
                                            func: injectPromptAndFileIntoPage,
                                            args: [{ content: fullContent }],
                                            world: 'MAIN'
                                        });

                                        // Change to checkmark on success
                                        if (iconElement) {
                                            iconElement.className = 'fas fa-check';
                                            button.classList.add('success');

                                            // Revert after timeout
                                            setTimeout(() => {
                                                iconElement.className = originalClass;
                                                button.classList.remove('success');
                                            }, 1500);
                                        }
                                    } catch (error) {
                                        console.error('Failed to inject prompt:', error);
                                        this.showToast('Failed to send prompt: ' + error.message, 'error');

                                        // Revert icon if error
                                        if (iconElement) {
                                            iconElement.className = originalClass;
                                        }
                                    }
                                });
                            } catch (error) {
                                console.error('Error sending prompt:', error);
                                this.showToast('Failed to send prompt: ' + error.message, 'error');

                                // Revert icon
                                const iconElement = button.querySelector('i');
                                if (iconElement) {
                                    iconElement.className = originalClass || 'fas fa-paper-plane';
                                }
                            }
                        }
                    } else if (button.classList.contains('btn-copy')) {
                        // Copy functionality for community prompt
                        const content = card.querySelector('.prompt-content')?.textContent;
                        if (content) {
                            navigator.clipboard.writeText(content)
                                .then(() => {
                                    this.showToast('Copied to clipboard!', 'success');

                                    // Change icon to checkmark
                                    const iconElement = button.querySelector('i');
                                    if (iconElement) {
                                        // Store original classes
                                        const originalClass = iconElement.className;

                                        // Change to checkmark
                                        iconElement.className = 'fas fa-check';
                                        button.classList.add('success');

                                        // Revert after timeout
                                        setTimeout(() => {
                                            iconElement.className = originalClass;
                                            button.classList.remove('success');
                                        }, 1500);
                                    }
                                })
                                .catch(err => this.showToast('Failed to copy: ' + err, 'error'));
                        }
                    }
                } else {
                    // Show a view-only modal for community prompts
                    const title = card.querySelector('.prompt-title-text')?.textContent;
                    const content = card.querySelector('.prompt-content')?.textContent;
                    if (title && content) {
                        this.viewEditTitle.textContent = title;
                        this.viewEditTextarea.value = content;
                        this.currentlyViewingId = promptId;
                        this.viewEditModal.classList.add('show');
                        // Hide edit/delete buttons for community prompts
                        this.deleteFromViewBtn.style.display = 'none';
                        this.saveFromViewBtn.style.display = 'none';
                    }
                }
            });
        });

        // Search input listeners
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.filterPrompts('prompts');
            });
        }

        if (this.communitySearchInput) {
            this.communitySearchInput.addEventListener('input', () => {
                this.filterPrompts('community');
            });
        }

        // Sort select listeners
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => {
                this.sortPrompts();
                this.renderPrompts();
            });
        }

        if (this.communitySortSelect) {
            this.communitySortSelect.addEventListener('change', () => {
                // Community sort functionality could be implemented here
            });
        }

        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === "showToast") this.showToast(message.message, message.type || 'info');
            else if (message.action === "showErrorWithDetails") this.showErrorWithDetails(message.message, message.type || 'error');
        });

        // Close modals when clicking outside of them
        if (this.viewEditModal) {
            this.viewEditModal.addEventListener('click', (event) => {
                // Only close if clicking directly on the modal background, not its contents
                if (event.target === this.viewEditModal) {
                    this.closeViewEditModal();
                }
            });
        }

        if (this.deleteModal) {
            this.deleteModal.addEventListener('click', (event) => {
                if (event.target === this.deleteModal) {
                    this.closeDeleteModal();
                }
            });
        }

        if (this.newPromptModal) {
            this.newPromptModal.addEventListener('click', (event) => {
                if (event.target === this.newPromptModal) {
                    this.closeNewPromptModal();
                }
            });
        }
    }

    setupTabNavigation() {
        if (!this.tabs || this.tabs.length === 0) return;

        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });
    }

    showTab(tabName) {
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        const selectedTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}Tab`);

        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');

        if (tabName === 'prompts') {
            this.renderPrompts();
        }
    }

    filterPrompts(tabName) {
        if (tabName === 'prompts' && this.searchInput) {
            const searchTerm = this.searchInput.value.toLowerCase();
            const promptCards = document.querySelectorAll('#promptsContainer .prompt-card');

            promptCards.forEach(card => {
                const title = card.querySelector('.prompt-title-text').textContent.toLowerCase();
                const content = card.querySelector('.prompt-content').textContent.toLowerCase();

                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (tabName === 'community' && this.communitySearchInput) {
            const searchTerm = this.communitySearchInput.value.toLowerCase();
            const communityCards = document.querySelectorAll('#communityTab .prompt-card');

            communityCards.forEach(card => {
                const title = card.querySelector('.prompt-title-text').textContent.toLowerCase();
                const content = card.querySelector('.prompt-content').textContent.toLowerCase();

                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }

    sortPrompts() {
        if (!this.sortSelect) return;

        const sortOption = this.sortSelect.value;

        switch (sortOption) {
            case 'newest':
                this.prompts.sort((a, b) => (b.timestamp || new Date(b.createdAt).getTime()) - (a.timestamp || new Date(a.createdAt).getTime()));
                break;
            case 'oldest':
                this.prompts.sort((a, b) => (a.timestamp || new Date(a.createdAt).getTime()) - (b.timestamp || new Date(a.createdAt).getTime()));
                break;
            case 'az':
                this.prompts.sort((a, b) => {
                    const titleA = a.title.toLowerCase();
                    const titleB = b.title.toLowerCase();
                    return titleA.localeCompare(titleB);
                });
                break;
            case 'za':
                this.prompts.sort((a, b) => {
                    const titleA = a.title.toLowerCase();
                    const titleB = b.title.toLowerCase();
                    return titleB.localeCompare(titleA);
                });
                break;
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['mode']);
            const mode = result.mode || 'dark';
            this.applyTheme(mode);
            if (this.modeSelect) {
                this.modeSelect.value = mode;
                // Add event listener to auto-save when mode changes
                this.modeSelect.addEventListener('change', () => {
                    const newMode = this.modeSelect.value;
                    chrome.storage.local.set({ mode: newMode });
                    this.applyTheme(newMode);
                    this.showToast('Theme updated!', 'success');
                });
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            this.applyTheme('dark'); // Default
        }
    }

    applyTheme(mode) {
        document.body.className = `theme-data-haven mode-${mode}`;
    }

    showToast(message, type = 'success') {
        if (!this.toast) return;
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toast.textContent = message;
        this.toast.className = `toast show toast-${type}`;
        this.toastTimeout = setTimeout(() => this.toast.classList.remove('show'), 3000);
    }

    showErrorWithDetails(message, type = 'error') {
        if (!this.toast) return;
        if (this.toastTimeout) clearTimeout(this.toastTimeout);

        // Set HTML content instead of text
        this.toast.innerHTML = message;
        this.toast.className = `toast show toast-${type} toast-with-details`;

        // Set a longer timeout for messages with details
        this.toastTimeout = setTimeout(() => this.toast.classList.remove('show'), 6000);
    }

    async loadPrompts() {
        try {
            const result = await chrome.storage.local.get(['prompts']);
            this.prompts = Array.isArray(result.prompts) ? result.prompts : [];
            this.prompts = this.prompts.filter(prompt => {
                return prompt &&
                    typeof prompt === 'object' &&
                    typeof prompt.id === 'number' &&
                    typeof prompt.content === 'string' &&
                    typeof prompt.title === 'string' &&
                    typeof prompt.createdAt === 'string';
            });
            this.renderPrompts();
        } catch (error) {
            console.error("Error loading prompts:", error);
            this.prompts = [];
            this.renderPrompts();
            this.showToast("Failed to load prompts. Starting fresh.", "error");
        }
    }

    async savePrompts() {
        try {
            if (!Array.isArray(this.prompts)) throw new Error("Prompts must be an array");
            const validPrompts = this.prompts.filter(p => p && p.id && p.content && p.title && p.createdAt);
            if (validPrompts.length !== this.prompts.length) {
                console.warn("Filtered out invalid prompts:", this.prompts.length - validPrompts.length);
                this.prompts = validPrompts;
            }
            await chrome.storage.local.set({ prompts: this.prompts });
            console.log("Prompts saved:", this.prompts);
        } catch (error) {
            console.error("Error saving prompts:", error);
            this.showToast("Failed to save prompts.", "error");
            throw error;
        }
    }

    async sendPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (!prompt) {
            this.showToast('Prompt not found.', 'error');
            return;
        }

        // Find the button that was clicked
        let buttonElement = null;

        // Check if it's from the view modal
        if (this.currentlyViewingId === id && this.sendFromViewBtn) {
            buttonElement = this.sendFromViewBtn;
        } else {
            // Find in the main list
            const card = document.querySelector(`.prompt-card[data-prompt-id="${id}"]`);
            if (card) {
                buttonElement = card.querySelector('.btn-send');
            }
        }

        this.showToast('Sending prompt...', 'info');
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.id) throw new Error('No active tab found.');
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: injectPromptAndFileIntoPage,
                args: [{ content: prompt.content }],
                world: 'MAIN'
            });

            // Change the icon to a checkmark on success
            if (buttonElement) {
                const iconElement = buttonElement.querySelector('i');
                if (iconElement) {
                    // Store original classes
                    const originalClass = iconElement.className;

                    // Change to checkmark
                    iconElement.className = 'fas fa-check';
                    buttonElement.classList.add('success');

                    // Revert after timeout
                    setTimeout(() => {
                        iconElement.className = originalClass;
                        buttonElement.classList.remove('success');
                    }, 1500);
                }
            }
        } catch (error) {
            console.error('Error sending prompt:', error);
            this.showToast(`Failed to send prompt: ${error.message}`, 'error');
        }
    }

    async copyPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (!prompt) {
            this.showToast('Error finding prompt to copy.', 'error');
            return;
        }

        // Find the button that was clicked
        let buttonElement = null;

        // Check if it's from the view modal
        if (this.currentlyViewingId === id && this.copyFromViewBtn) {
            buttonElement = this.copyFromViewBtn;
        } else {
            // Find in the main list
            const card = document.querySelector(`.prompt-card[data-prompt-id="${id}"]`);
            if (card) {
                buttonElement = card.querySelector('.btn-copy');
            }
        }

        try {
            await navigator.clipboard.writeText(prompt.content || '');
            this.showToast('Prompt text copied!', 'success');

            // Change the icon to a checkmark
            if (buttonElement) {
                const iconElement = buttonElement.querySelector('i');
                if (iconElement) {
                    // Store original classes
                    const originalClass = iconElement.className;

                    // Change to checkmark
                    iconElement.className = 'fas fa-check';
                    buttonElement.classList.add('success');

                    // Revert after timeout
                    setTimeout(() => {
                        iconElement.className = originalClass;
                        buttonElement.classList.remove('success');
                    }, 1500);
                }
            }
        } catch (err) {
            console.error('Failed to copy prompt: ', err);
            this.showToast('Failed to copy prompt text.', 'error');
        }
    }

    showDeleteModal(id) {
        if (!this.deleteModal) return;
        this.pendingDeleteId = id;
        this.deleteModal.classList.add('show');
    }

    closeDeleteModal() {
        if (!this.deleteModal) return;
        this.pendingDeleteId = null;
        this.deleteModal.classList.remove('show');
    }

    confirmDelete() {
        if (this.pendingDeleteId === null) return;
        const promptIdNum = this.pendingDeleteId;
        this.prompts = this.prompts.filter(p => p.id !== promptIdNum);
        this.savePrompts();
        this.renderPrompts();
        this.showToast('Prompt deleted!', 'success');
        this.closeDeleteModal();
    }

    deletePrompt(id) {
        const promptIdNum = typeof id === 'number' ? id : parseInt(id, 10);
        if (isNaN(promptIdNum)) {
            console.error("Invalid ID for deletion:", id);
            return;
        }
        this.showDeleteModal(promptIdNum);
    }

    showViewEditModal(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (!prompt) return;

        this.viewEditTitle.textContent = prompt.title;
        this.viewEditTextarea.value = prompt.content;
        this.currentlyViewingId = id;
        this.viewEditModal.classList.add('show');

        // Ensure delete and save buttons are visible for user prompts
        this.deleteFromViewBtn.style.display = 'block';
        this.saveFromViewBtn.style.display = 'block';
    }

    closeViewEditModal() {
        this.currentlyViewingId = null;
        this.viewEditModal.classList.remove('show');
    }

    showNewPromptModal() {
        this.newPromptTitle.value = '';
        this.newPromptTextarea.value = '';
        this.newPromptModal.classList.add('show');
    }

    closeNewPromptModal() {
        this.newPromptModal.classList.remove('show');
    }

    createNewPrompt() {
        const title = this.newPromptTitle.value.trim();
        const content = this.newPromptTextarea.value.trim();
        if (!content) {
            this.showToast('Please enter prompt content.', 'error');
            return;
        }

        // Sanitize content and title to prevent HTML injection
        const sanitizedContent = this.sanitizeHtml(content);
        const sanitizedTitle = this.sanitizeHtml(title) || 'Untitled Prompt';

        const prompt = {
            id: Date.now(),
            title: sanitizedTitle,
            content: sanitizedContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.prompts.unshift(prompt);
        this.savePrompts()
            .then(() => {
                this.renderPrompts();
                this.closeNewPromptModal();
                this.showToast('Prompt created successfully!', 'success');
            })
            .catch(() => {
                this.prompts = this.prompts.filter(p => p.id !== prompt.id);
                this.showToast('Failed to save prompt.', 'error');
            });
    }

    savePromptFromView() {
        const content = this.viewEditTextarea.value.trim();
        if (!content) {
            this.showToast('Please enter a prompt to save.', 'error');
            return;
        }

        // Sanitize content to prevent HTML injection
        const sanitizedContent = this.sanitizeHtml(content);

        const prompt = this.prompts.find(p => p.id === this.currentlyViewingId);
        if (!prompt) return;

        prompt.content = sanitizedContent;
        // Use first line for title, also sanitize it
        prompt.title = this.sanitizeHtml(sanitizedContent.split('\n')[0].substring(0, 40)) || 'Untitled Prompt';
        prompt.updatedAt = new Date().toISOString();

        this.savePrompts();
        this.renderPrompts();
        this.closeViewEditModal();
        this.showToast('Prompt updated!', 'success');
    }

    // Helper method to sanitize HTML to prevent injection
    sanitizeHtml(text) {
        // Replace HTML tags with their escaped versions
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    renderPrompts() {
        if (!this.promptsContainer) return;

        this.promptsContainer.innerHTML = '';

        if (this.prompts.length === 0) {
            this.promptsContainer.innerHTML = `
                <div class="placeholder">
                    <p>No prompts yet. Create your first prompt!</p>
                </div>
            `;
            return;
        }

        // Sort prompts
        this.sortPrompts();

        this.prompts.forEach(prompt => {
            const card = document.createElement('div');
            card.className = 'prompt-card';
            card.setAttribute('data-prompt-id', prompt.id);

            // Format the content to preserve whitespace but prevent XSS
            // We use CSS to handle this in the display rather than using pre or white-space in the HTML
            const displayContent = prompt.content.replace(/\n/g, '<br>');

            // Format the date
            const date = new Date(prompt.createdAt);
            const formattedDate = date.toLocaleDateString();

            card.innerHTML = `
                <h3 class="prompt-title">
                    <span class="prompt-title-text">${prompt.title}</span>
                    <div class="title-buttons">
                        <button class="btn-icon btn-copy" title="Copy"><i class="fas fa-copy"></i></button>
                        <button class="btn-icon btn-send send" title="Send"><i class="fas fa-paper-plane"></i></button>
                        <button class="btn-icon btn-delete delete" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </h3>
                <p class="prompt-content">${displayContent}</p>
                <div class="prompt-meta">
                    <span>Created: ${formattedDate}</span>
                </div>
            `;

            // Add event listener for toggling content expansion
            const contentElement = card.querySelector('.prompt-content');
            if (contentElement) {
                contentElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = contentElement.classList.contains('expanded');
                    contentElement.classList.toggle('expanded');

                    // If we're collapsing, reset scroll position to top
                    if (isExpanded) {
                        contentElement.scrollTop = 0;
                    }
                });
            }

            this.promptsContainer.appendChild(card);
        });
    }
}

function initializePromptManager() {
    try {
        new PromptManager();
    } catch (error) {
        console.error("Failed to initialize PromptManager:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.promptManager = new PromptManager();

    // Add event listeners for FAQ and Account buttons
    const faqBtn = document.getElementById('faqBtn');
    const closeFaqBtn = document.getElementById('closeFaqBtn');
    const accountBtn = document.getElementById('accountBtn');
    const closeAccountBtn = document.getElementById('closeAccountBtn');
    const faqModal = document.getElementById('faqModal');
    const accountModal = document.getElementById('accountModal');

    // Add direct event listeners to all community prompt cards' send buttons
    document.querySelectorAll('.community-section .prompt-card .btn-send').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent card click

            const card = button.closest('.prompt-card');
            if (!card) return;

            const promptId = card.getAttribute('data-prompt-id');
            // Get the full prompt content from the communityPrompts object
            const promptContent = communityPrompts[promptId] || card.querySelector('.prompt-content')?.textContent;

            if (!promptContent) {
                console.error('No content found for community prompt:', promptId);
                return;
            }

            // Show toast message
            if (window.promptManager) {
                window.promptManager.showToast('Sending prompt...', 'info');
            }

            // Change button icon to spinner
            const iconElement = button.querySelector('i');
            const originalClass = iconElement ? iconElement.className : '';
            if (iconElement) {
                iconElement.className = 'fas fa-spinner fa-spin';
            }

            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tab || !tab.id) throw new Error('No active tab found.');

                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: injectPromptAndFileIntoPage,
                    args: [{ content: promptContent }],
                    world: 'MAIN'
                });

                // Success - change to checkmark
                if (iconElement) {
                    iconElement.className = 'fas fa-check';
                    button.classList.add('success');

                    // Revert after timeout
                    setTimeout(() => {
                        iconElement.className = originalClass;
                        button.classList.remove('success');
                    }, 1500);
                }
            } catch (error) {
                console.error('Error sending community prompt:', error);
                if (window.promptManager) {
                    window.promptManager.showToast('Failed to send prompt: ' + error.message, 'error');
                }

                // Revert icon on error
                if (iconElement) {
                    iconElement.className = originalClass;
                }
            }
        });
    });

    if (faqBtn) {
        faqBtn.addEventListener('click', () => {
            faqModal.classList.add('show');
        });
    }

    if (closeFaqBtn) {
        closeFaqBtn.addEventListener('click', () => {
            faqModal.classList.remove('show');
        });
    }

    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            const promptCountEl = document.getElementById('promptCount');
            if (promptCountEl && window.promptManager) {
                promptCountEl.textContent = window.promptManager.prompts.length || 0;
            }
            accountModal.classList.add('show');
        });
    }

    if (closeAccountBtn) {
        closeAccountBtn.addEventListener('click', () => {
            accountModal.classList.remove('show');
        });
    }

    // Add click outside to close handlers for the new modals
    if (faqModal) {
        faqModal.addEventListener('click', (event) => {
            if (event.target === faqModal) {
                faqModal.classList.remove('show');
            }
        });
    }

    if (accountModal) {
        accountModal.addEventListener('click', (event) => {
            if (event.target === accountModal) {
                accountModal.classList.remove('show');
            }
        });
    }
});

// Sample full prompt content for demonstration
const communityPrompts = {
    "trending-1": "Analyze this UI design for usability issues and suggest improvements. Please consider:\n\n1. Accessibility concerns\n2. User flow optimization\n3. Visual hierarchy\n4. Color contrast and readability\n5. Mobile responsiveness\n\nProvide specific recommendations with examples of how to implement each improvement.",
    "trending-2": "Create a concise summary of this research paper, highlighting key findings. Please include:\n\n1. The main research question/objective\n2. Methodology overview\n3. Key results and discoveries\n4. Limitations of the study\n5. Practical applications and implications\n\nKeep the summary clear and accessible for a non-specialist audience while maintaining scientific accuracy.",
    "trending-3": "Create compelling product descriptions based on these key features and benefits. The descriptions should:\n\n1. Hook the reader with a strong opening\n2. Highlight unique selling points\n3. Address customer pain points\n4. Use persuasive language without being pushy\n5. Include a clear call-to-action\n\nPlease write in a tone that appeals to [target audience] and emphasizes how the product solves their specific problems.",
    "rated-1": "Analyze my Python code and identify bugs, logic errors, and performance issues. Please check for:\n\n1. Syntax errors\n2. Logic flaws\n3. Performance bottlenecks\n4. Potential memory leaks\n5. Better design patterns\n\nExplain any issues found and suggest improvements with example code.",
    "rated-2": "Help me create a detailed travel itinerary for my upcoming trip to [DESTINATION]. Please include:\n\n1. Daily schedule with attractions\n2. Restaurant recommendations\n3. Transportation options\n4. Estimated costs\n5. Local customs and tips\n\nBalance popular attractions with off-the-beaten-path experiences.",
    "rated-3": "Create a delicious recipe based on these ingredients I have available: [LIST INGREDIENTS]. The recipe should:\n\n1. Be relatively easy to make\n2. Include all preparation steps\n3. Provide cooking times and temperatures\n4. Include serving suggestions\n5. Offer variations if possible\n\nPlease format as a proper recipe with ingredients list and step-by-step instructions."
};