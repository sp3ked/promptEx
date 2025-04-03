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
            'div[role="textbox"]' // Broad fallback
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
            throw new Error("No suitable text input found on this page. Please make sure you're on a supported chat platform (ChatGPT, Claude, Grok).");
        }
    } catch (error) {
        console.error("Promptr: Injection error:", error);
        chrome.runtime.sendMessage({
            action: "showToast",
            message: `Failed to inject prompt: ${error.message}`,
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
    }

    initializeElements() {
        this.promptsContainer = document.getElementById('promptsContainer');
        this.promptInput = document.getElementById('promptInput');
        this.savePromptBtn = document.getElementById('savePromptBtn');
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
        this.newPromptTextarea = document.getElementById('newPromptTextarea');
        this.closeNewPromptBtn = document.getElementById('closeNewPromptBtn');
        this.cancelNewPromptBtn = document.getElementById('cancelNewPromptBtn');
        this.createNewPromptBtn = document.getElementById('createNewPromptBtn');
        // Settings elements
        this.themeSelect = document.getElementById('themeSelect');
        this.modeSelect = document.getElementById('modeSelect');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        // Tab elements
        this.tabs = document.querySelectorAll('.tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.searchSortContainer = document.querySelector('.search-sort-container');

        this.pendingDeleteId = null;
        this.currentlyViewingId = null;
    }

    setupEventListeners() {
        if (this.savePromptBtn) this.savePromptBtn.addEventListener('click', () => this.savePrompt());
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

        if (this.promptsContainer) {
            this.promptsContainer.addEventListener('click', (event) => {
                const target = event.target;
                const card = target.closest('.prompt-card');
                const button = target.closest('.btn');
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

        // Settings listeners
        if (this.saveSettingsBtn) this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Setup community tab prompts listeners
        document.querySelectorAll('#communityTab .prompt-card').forEach(card => {
            const copyBtn = card.querySelector('.btn-copy');
            const sendBtn = card.querySelector('.btn-send');

            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const content = card.querySelector('.prompt-content').textContent;
                    navigator.clipboard.writeText(content)
                        .then(() => this.showToast('Copied to clipboard!', 'success'))
                        .catch(err => this.showToast('Failed to copy: ' + err, 'error'));
                });
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', () => {
                    const content = card.querySelector('.prompt-content').textContent;
                    injectPromptAndFileIntoPage({ content })
                        .catch(err => console.error('Error sending prompt:', err));
                });
            }
        });

        // Search input listener
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.filterPrompts();
            });
        }

        // Sort select listener
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => {
                this.sortPrompts();
                this.renderPrompts();
            });
        }

        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === "showToast") this.showToast(message.message, message.type || 'info');
        });
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
        // Deactivate all tabs
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        // Activate the selected tab
        const selectedTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}Tab`);

        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');

        // Show/hide search and sort for certain tabs
        if (tabName === 'prompts' || tabName === 'community') {
            this.searchSortContainer.style.display = 'flex';
        } else {
            this.searchSortContainer.style.display = 'none';
        }

        // Additional tab-specific logic
        if (tabName === 'prompts') {
            this.renderPrompts();
        }
    }

    filterPrompts() {
        if (!this.searchInput) return;

        const searchTerm = this.searchInput.value.toLowerCase();
        const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');

        if (activeTab === 'prompts') {
            // Filter user prompts
            const promptCards = document.querySelectorAll('#promptsContainer .prompt-card');
            promptCards.forEach(card => {
                const title = card.querySelector('.prompt-title').textContent.toLowerCase();
                const content = card.querySelector('.prompt-content').textContent.toLowerCase();

                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (activeTab === 'community') {
            // Filter community prompts
            const communityCards = document.querySelectorAll('#communityTab .prompt-card');
            communityCards.forEach(card => {
                const title = card.querySelector('.prompt-title').textContent.toLowerCase();
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
                this.prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                this.prompts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'az':
                this.prompts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'za':
                this.prompts.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['theme', 'mode']);
            const theme = result.theme || 'data-haven';
            const mode = result.mode || 'dark';
            this.applyTheme(theme, mode);
            if (this.themeSelect) this.themeSelect.value = theme;
            if (this.modeSelect) this.modeSelect.value = mode;
        } catch (error) {
            console.error("Error loading settings:", error);
            this.applyTheme('data-haven', 'dark'); // Default
        }
    }

    async saveSettings() {
        const theme = this.themeSelect.value;
        const mode = this.modeSelect.value;
        try {
            await chrome.storage.local.set({ theme, mode });
            this.applyTheme(theme, mode);
            this.showToast('Settings saved!', 'success');
        } catch (error) {
            console.error("Error saving settings:", error);
            this.showToast('Failed to save settings.', 'error');
        }
    }

    applyTheme(theme, mode) {
        document.body.className = `theme-${theme} mode-${mode}`;
    }

    showToast(message, type = 'success') {
        if (!this.toast) return;
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toast.textContent = message;
        this.toast.className = `toast show toast-${type}`;
        this.toastTimeout = setTimeout(() => this.toast.classList.remove('show'), 3000);
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

    savePrompt() {
        const content = this.promptInput.value.trim();
        if (!content) {
            this.showToast('Please enter a prompt.', 'error');
            return;
        }
        const prompt = {
            id: Date.now(),
            title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.prompts.unshift(prompt);
        this.savePrompts()
            .then(() => {
                this.renderPrompts();
                this.promptInput.value = '';
                this.showToast('Prompt saved!', 'success');
            })
            .catch((error) => {
                console.error("Error saving prompt:", error);
                this.showToast('Failed to save prompt.', 'error');
            });
    }

    async sendPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (!prompt) {
            this.showToast('Prompt not found.', 'error');
            return;
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
        try {
            await navigator.clipboard.writeText(prompt.content || '');
            this.showToast('Prompt text copied!', 'success');
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
        this.showToast('Prompt deleted!', 'info');
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
        this.currentlyViewingId = id;
        this.viewEditTitle.textContent = prompt.title;
        this.viewEditTextarea.value = prompt.content;
        this.viewEditModal.classList.add('show');
    }

    closeViewEditModal() {
        this.currentlyViewingId = null;
        this.viewEditModal.classList.remove('show');
    }

    showNewPromptModal() {
        this.newPromptTextarea.value = '';
        this.newPromptModal.classList.add('show');
    }

    closeNewPromptModal() {
        this.newPromptModal.classList.remove('show');
    }

    createNewPrompt() {
        const content = this.newPromptTextarea.value.trim();
        if (!content) {
            this.showToast('Please enter a prompt.', 'error');
            return;
        }
        const prompt = {
            id: Date.now(),
            title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.prompts.unshift(prompt);
        this.savePrompts()
            .then(() => {
                this.renderPrompts();
                this.closeNewPromptModal();
                this.showToast('Prompt saved!', 'success');
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
        const prompt = this.prompts.find(p => p.id === this.currentlyViewingId);
        if (!prompt) return;
        prompt.content = content;
        prompt.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        prompt.updatedAt = new Date().toISOString();
        this.savePrompts();
        this.renderPrompts();
        this.closeViewEditModal();
        this.showToast('Prompt updated!', 'success');
    }

    renderPrompts() {
        if (!this.promptsContainer) return;

        this.promptsContainer.innerHTML = '';

        if (this.prompts.length === 0) {
            this.promptsContainer.innerHTML = '<div class="placeholder"><p>No prompts saved yet.<br>Create your first prompt!</p></div>';
            return;
        }

        this.sortPrompts();

        this.prompts.forEach(prompt => {
            const card = document.createElement('div');
            card.className = 'prompt-card';
            card.setAttribute('data-prompt-id', prompt.id);

            const title = document.createElement('h3');
            title.className = 'prompt-title';
            title.textContent = prompt.title;

            const content = document.createElement('p');
            content.className = 'prompt-content';
            content.textContent = prompt.content;

            const meta = document.createElement('div');
            meta.className = 'prompt-meta';

            const date = document.createElement('span');
            date.textContent = new Date(prompt.createdAt).toLocaleString();

            const actions = document.createElement('div');
            actions.className = 'prompt-actions';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon btn-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn-icon btn-copy';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy';

            const sendBtn = document.createElement('button');
            sendBtn.className = 'btn-icon btn-send send';
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendBtn.title = 'Send';

            actions.appendChild(deleteBtn);
            actions.appendChild(copyBtn);
            actions.appendChild(sendBtn);

            meta.appendChild(date);
            meta.appendChild(actions);

            card.appendChild(title);
            card.appendChild(content);
            card.appendChild(meta);

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

document.addEventListener('DOMContentLoaded', initializePromptManager);