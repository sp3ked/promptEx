// sidepanel.js
class PromptManager {
    constructor() {
        this.prompts = [];
        this.initializeElements();
        this.loadPrompts();
        this.setupEventListeners();
    }

    initializeElements() {
        this.promptsContainer = document.getElementById('promptsContainer');
        this.promptInput = document.getElementById('promptInput');
        this.sendPromptBtn = document.getElementById('sendPromptBtn');
        this.savePromptBtn = document.getElementById('savePromptBtn');
        this.copyPromptBtn = document.getElementById('copyPromptBtn');
        this.importBtn = document.getElementById('importBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.toast = document.getElementById('toast');
    }

    setupEventListeners() {
        this.sendPromptBtn.addEventListener('click', () => this.sendPrompt());
        this.savePromptBtn.addEventListener('click', () => this.savePrompt());
        this.copyPromptBtn.addEventListener('click', () => this.copyToClipboard(this.promptInput.value));
        this.importBtn.addEventListener('click', () => this.importPrompts());
        this.exportBtn.addEventListener('click', () => this.exportPrompts());
    }

    async loadPrompts() {
        const result = await chrome.storage.local.get('prompts');
        this.prompts = result.prompts || [];
        this.renderPrompts();
    }

    async savePrompts() {
        await chrome.storage.local.set({ prompts: this.prompts });
    }

    savePrompt() {
        const content = this.promptInput.value.trim();
        if (!content) {
            this.showToast('Please enter a prompt to save.', 'error');
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
        this.savePrompts();
        this.renderPrompts();
        this.promptInput.value = '';
        this.showToast('Prompt saved!', 'success');
    }

    async sendPrompt() {
        const promptText = this.promptInput.value.trim();
        if (!promptText) {
            this.showToast('Please enter a prompt to send.', 'error');
            return;
        }

        chrome.runtime.sendMessage({
            action: 'insertPrompt',
            prompt: promptText,
            attachments: [] // Add attachment support later if needed
        }, (response) => {
            if (response && response.success) {
                this.showToast(response.message, 'success');
            } else {
                this.showToast(response ? response.message : 'Error sending prompt.', 'error');
            }
        });
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy.', 'error');
        }
    }

    showToast(message, type) {
        this.toast.textContent = message;
        this.toast.className = `toast show toast-${type}`;
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    deletePrompt(id) {
        if (confirm('Are you sure you want to delete this prompt?')) {
            this.prompts = this.prompts.filter(p => p.id !== id);
            this.savePrompts();
            this.renderPrompts();
        }
    }

    editPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (!prompt) return;

        this.promptInput.value = prompt.content;
        this.deletePrompt(id); // Remove old version; save new one when user clicks "Save"
    }

    async importPrompts() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const importedPrompts = JSON.parse(text);
                this.prompts = [...this.prompts, ...importedPrompts];
                await this.savePrompts();
                this.renderPrompts();
                this.showToast('Prompts imported!', 'success');
            } catch (error) {
                this.showToast('Error importing prompts: ' + error.message, 'error');
            }
        };
        input.click();
    }

    exportPrompts() {
        const dataStr = JSON.stringify(this.prompts, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompts-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Prompts exported!', 'success');
    }

    renderPrompts() {
        this.promptsContainer.innerHTML = '';
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
            meta.innerHTML = `
                <span>${new Date(prompt.updatedAt).toLocaleDateString()}</span>
                <div class="prompt-actions">
                    <button class="btn btn-secondary" onclick="promptManager.editPrompt(${prompt.id})">Edit</button>
                    <button class="btn btn-secondary" onclick="promptManager.deletePrompt(${prompt.id})">Delete</button>
                </div>
            `;

            card.appendChild(title);
            card.appendChild(content);
            card.appendChild(meta);
            this.promptsContainer.appendChild(card);
        });
    }
}

// Initialize PromptManager when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.promptManager = new PromptManager();
});