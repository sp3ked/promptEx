// sidepanel.js - Promptr Core Logic

// --- Helper Function (outside class, needed for injection) ---
// IMPORTANT: This function runs in the context of the target webpage,
// it does not have access to the sidepanel's variables or other functions directly.
async function injectPromptAndFileIntoPage(promptData) {
    console.log("Promptr: Injecting data:", promptData);
    const { content, attachment } = promptData;
    let textInjected = false;
    let fileButtonClicked = false;

    // Function to simulate user input for reactivity
    function simulateInput(element, text) {
        element.focus();
        // Use document.execCommand for contentEditable, fallback to value assignment
        if (element.isContentEditable) {
            // Clear existing content? Might be needed for some sites.
            // document.execCommand('selectAll', false, null);
            // document.execCommand('delete', false, null);
            document.execCommand('insertText', false, text || '');
        } else {
            element.value = text || '';
        }
        // Dispatch events to try and trigger framework updates
        element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        element.blur(); // Sometimes helps trigger updates
        element.focus(); // Re-focus might be needed
    }

    try {
        // 1. Find Text Area
        let targetTextArea;
        // Selectors ordered by likelihood or specificity
        const selectors = [
            'textarea[id^="prompt-textarea"]',         // ChatGPT (common)
            'textarea#prompt-textarea',                 // ChatGPT (alternative)
            'div[contenteditable="true"][aria-label*="Send a message"]', // Claude (common)
            'div.ProseMirror[contenteditable="true"]', // Claude (alternative)
            'textarea[data-testid="tweetTextarea_0"]', // Grok (example, verify)
            // Add more selectors for different platforms as needed
            '.chat-pg-content textarea', // Some other possible selectors
            'div[role="textbox"]',
            'textarea[placeholder*="message"]'
        ];

        for (const selector of selectors) {
            targetTextArea = document.querySelector(selector);
            if (targetTextArea) {
                console.log("Promptr: Found text area with selector:", selector);
                break;
            }
        }

        // 2. Inject Text
        if (targetTextArea) {
            try {
                simulateInput(targetTextArea, content);
                console.log("Promptr: Prompt text injected.");
                textInjected = true;
                // Send success message back
                setTimeout(() => chrome.runtime.sendMessage({
                    action: "showToast",
                    message: "Prompt injected!",
                    type: "success"
                }), 100);
            } catch (e) {
                console.error("Promptr: Error injecting text:", e);
                throw new Error(`Failed to input text: ${e.message}`);
            }
        } else {
            console.error('Promptr: Could not find a suitable text area on this page.');
            throw new Error("Could not find a text input area on this page. Is this a supported chat platform?");
        }

        // 3. Inject File (Attempt for ChatGPT)
        // NOTE: Automatic file injection is VERY UNRELIABLE due to security restrictions.
        // Clicking the button and notifying the user is the most practical approach.
        if (attachment && window.location.href.includes('chatgpt.com')) { // Only attempt for ChatGPT
            const fileInputButton = document.querySelector('button[aria-label*="Attach file"]'); // More robust selector
            if (fileInputButton) {
                console.log("Promptr: Found attach file button. Clicking...");
                fileInputButton.click();
                fileButtonClicked = true;
                console.warn('Promptr: Clicked attach file button. User must select the file manually.');
                // Send message back to sidepanel to inform user
                setTimeout(() => chrome.runtime.sendMessage({ action: "showToast", message: "Clicked attach button. Select file.", type: "warning" }), 200);

            } else {
                console.warn('Promptr: Could not find the file attachment button for ChatGPT.');
                setTimeout(() => chrome.runtime.sendMessage({ action: "showToast", message: "Couldn't find attach button.", type: "error" }), 200);
            }
        } else if (attachment) {
            console.log("Promptr: File attachment present but not attempting injection on this platform.");
            // Inform user file won't be sent if platform isn't ChatGPT
            if (!window.location.href.includes('chatgpt.com')) {
                setTimeout(() => chrome.runtime.sendMessage({ action: "showToast", message: "File attachment ignored on this site.", type: "warning" }), 200);
            }
        }

    } catch (error) {
        console.error("Promptr: Injection error:", error);
        // Send error back to sidepanel
        chrome.runtime.sendMessage({
            action: "showToast",
            message: `Injection failed: ${error.message}`,
            type: "error"
        });
        // Re-throw to let the caller know the operation failed
        throw error;
    }
}


// --- Main Sidepanel Logic ---
class PromptManager {
    constructor() {
        this.prompts = [];
        this.currentFile = null; // Holds selected file info { name, type, base64 }
        this.editingPromptId = null; // Track which prompt is being edited
        this.initializeElements();
        this.loadPrompts(); // Load existing prompts first
        this.setupEventListeners();
        this.newPrompt(); // Initialize UI in a clean state
    }

    initializeElements() {
        this.promptsContainer = document.getElementById('promptsContainer');
        this.promptInput = document.getElementById('promptInput');
        this.savePromptBtn = document.getElementById('savePromptBtn');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.newPromptBtn = document.getElementById('newPromptBtn');
        this.toast = document.getElementById('toast');

        // Delete confirmation modal elements
        this.deleteModal = document.getElementById('deleteModal');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

        // Track the prompt ID pending deletion
        this.pendingDeleteId = null;
    }

    setupEventListeners() {
        if (this.savePromptBtn) this.savePromptBtn.addEventListener('click', () => this.savePrompt());
        if (this.newPromptBtn) this.newPromptBtn.addEventListener('click', () => this.newPrompt());
        if (this.attachFileBtn) this.attachFileBtn.addEventListener('click', () => this.attachFile());

        // Delete confirmation modal buttons
        if (this.confirmDeleteBtn) {
            this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }
        if (this.cancelDeleteBtn) {
            this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        }

        if (this.promptsContainer) {
            this.promptsContainer.addEventListener('click', (event) => {
                const target = event.target;
                const button = target.closest('.btn');
                const card = target.closest('.prompt-card');

                if (!button || !card) return;

                const promptIdStr = card.getAttribute('data-prompt-id');
                const promptId = parseInt(promptIdStr, 10);

                if (isNaN(promptId)) {
                    console.error("Invalid prompt ID:", promptIdStr);
                    return;
                }

                if (button.classList.contains('btn-send')) {
                    this.sendPrompt(promptId);
                } else if (button.classList.contains('btn-copy')) {
                    this.copyPrompt(promptId);
                } else if (button.classList.contains('btn-edit')) {
                    this.editPrompt(promptId);
                } else if (button.classList.contains('btn-delete')) {
                    this.deletePrompt(promptId);
                }
            });
        }

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "showToast") {
                this.showToast(message.message, message.type || 'info');
            }
        });
    }

    showToast(message, type = 'success') {
        if (!this.toast) return;
        if (this.toastTimeout) clearTimeout(this.toastTimeout);

        this.toast.textContent = message;
        this.toast.className = `toast show toast-${type}`;
        this.toastTimeout = setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            this.clearSelectedFile();
            return;
        }
        const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast(`Unsupported file type. Use PNG, JPG, PDF.`, 'error');
            this.fileInput.value = '';
            this.clearSelectedFile();
            return;
        }
        // Optional: Add size limit check here
        // const maxSize = 5 * 1024 * 1024; // 5MB
        // if (file.size > maxSize) { ... }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentFile = {
                name: file.name,
                type: file.type,
                base64: e.target.result // Base64 Data URL
            };
            this.displaySelectedFileInfo();
            this.showToast(`File "${file.name}" attached.`, 'info');
        }
        reader.onerror = (e) => {
            console.error("FileReader error:", e);
            this.showToast('Error reading file.', 'error');
            this.clearSelectedFile();
        }
        reader.readAsDataURL(file);
    }

    displaySelectedFileInfo() {
        if (!this.currentFile) {
            this.selectedFileInfo.innerHTML = '';
            return;
        }
        let previewHTML = '';
        if (this.currentFile.type.startsWith('image/')) {
            // Limit preview size for performance
            previewHTML = `<img src="${this.currentFile.base64}" alt="Preview" style="max-width: 24px; max-height: 24px; object-fit: cover;">`;
        }
        let fileSizeStr = '';
        try {
            // More accurate size calculation from base64 string length
            const base64Data = this.currentFile.base64.split(',')[1] || '';
            const sizeInBytes = (base64Data.length * 0.75) - (base64Data.endsWith('==') ? 2 : (base64Data.endsWith('=') ? 1 : 0));
            if (sizeInBytes < 1024 * 1024) {
                fileSizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
            } else {
                fileSizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
            }
        } catch (e) { console.error("Error calculating file size:", e); }


        this.selectedFileInfo.innerHTML = `
            ${previewHTML}
            <span title="${this.currentFile.name}">${this.currentFile.name} (${fileSizeStr})</span>
            <button title="Remove file">&times;</button>
        `;
        const removeBtn = this.selectedFileInfo.querySelector('button');
        if (removeBtn) {
            removeBtn.onclick = () => this.clearSelectedFile(true);
        }
    }

    clearSelectedFile(showToastNotification = false) {
        if (this.currentFile && showToastNotification) {
            this.showToast(`File "${this.currentFile.name}" removed.`, 'info');
        }
        this.currentFile = null;
        this.fileInput.value = ''; // Reset file input
        this.displaySelectedFileInfo(); // Update UI
    }

    async loadPrompts() {
        try {
            const result = await chrome.storage.local.get(['prompts']);
            this.prompts = result.prompts || [];
            // Ensure sorting happens after loading
            this.prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.renderPrompts();
        } catch (error) {
            console.error("Error loading prompts:", error);
            this.showToast("Failed to load prompts.", "error");
        }
    }

    async savePrompts() {
        try {
            await chrome.storage.local.set({ prompts: this.prompts });
        } catch (error) {
            console.error("Error saving prompts:", error);
            this.showToast("Failed to save prompts.", "error");
        }
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

    newPrompt() {
        this.promptInput.value = '';
        this.editingPromptId = null;
        if (this.savePromptBtn) this.savePromptBtn.textContent = 'Save Prompt';
        if (this.promptInput) this.promptInput.focus();
    }

    attachFile() {
        this.showToast('File attachment feature is not implemented yet.', 'info');
    }

    async sendPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (!prompt) {
            this.showToast('Error: Could not find prompt.', 'error');
            return;
        }

        this.showToast('Sending prompt...', 'info');

        try {
            // 1. Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.id) {
                throw new Error('Cannot identify active tab.');
            }

            // 2. Execute the injection script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: injectPromptAndFileIntoPage,
                args: [prompt], // Pass the prompt object
                world: 'MAIN' // Needed for interacting with page elements
            });

            // Success toast will be sent by the injection function via message
        } catch (error) {
            console.error('Error sending prompt:', error);
            this.showToast(`Error: ${error.message || 'Failed to send prompt.'}`, 'error');
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

        // If deleting the prompt being edited, reset the form
        if (this.editingPromptId === promptIdNum) {
            this.newPrompt();
        }

        this.savePrompts();
        this.renderPrompts();
        this.showToast('Prompt deleted!', 'info');

        // Close the modal
        this.closeDeleteModal();
    }

    deletePrompt(id) {
        const promptIdNum = typeof id === 'number' ? id : parseInt(id, 10);
        if (isNaN(promptIdNum)) {
            console.error("Invalid ID for deletion:", id);
            return;
        }

        // Show the custom delete confirmation modal instead of browser confirm
        this.showDeleteModal(promptIdNum);
    }

    editPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (!prompt) {
            this.showToast('Error finding prompt to edit.', 'error');
            return;
        }

        if (this.promptInput) this.promptInput.value = prompt.content;
        this.editingPromptId = id;
        if (this.savePromptBtn) this.savePromptBtn.textContent = 'Update Prompt';
        if (this.promptInput) this.promptInput.focus();
        this.showToast('Editing prompt...', 'info');
        this.renderPrompts();
    }

    renderPrompts() {
        if (!this.promptsContainer) return;
        this.promptsContainer.innerHTML = '';
        if (this.prompts.length === 0) {
            this.promptsContainer.innerHTML = '<p style="color: var(--neutral-medium-grey); text-align: center; margin-top: 20px;">No saved prompts yet. Click "New Prompt" to start!</p>';
            return;
        }

        const sortedPrompts = this.prompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        sortedPrompts.forEach(prompt => {
            const card = document.createElement('div');
            card.className = 'prompt-card';
            if (this.editingPromptId === prompt.id) {
                card.style.outline = '2px solid var(--primary-blue)';
                card.style.boxShadow = '0 0 5px rgba(30, 136, 229, 0.5)';
            }
            card.setAttribute('data-prompt-id', prompt.id);

            const title = document.createElement('h3');
            title.className = 'prompt-title';
            title.textContent = prompt.title;

            const content = document.createElement('p');
            content.className = 'prompt-content';
            content.textContent = prompt.content;

            const meta = document.createElement('div');
            meta.className = 'prompt-meta';

            const dateString = new Date(prompt.updatedAt || prompt.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            meta.innerHTML = `
                <span>${dateString}</span>
                <div class="prompt-actions">
                    <button class="btn btn-primary btn-send" title="Send to Active LLM Tab">Send</button>
                    <button class="btn btn-tertiary btn-copy" title="Copy Prompt Text">Copy</button>
                    <button class="btn btn-tertiary btn-edit" title="Edit Prompt">Edit</button>
                    <button class="btn btn-delete" title="Delete Prompt">Delete</button>
                </div>
            `;

            card.appendChild(title);
            card.appendChild(content);
            card.appendChild(meta);
            this.promptsContainer.appendChild(card);
        });
    }
}

function initializePromptManager() {
    if (document.getElementById('promptsContainer') &&
        document.getElementById('promptInput') &&
        document.getElementById('savePromptBtn') &&
        document.getElementById('newPromptBtn') &&
        document.getElementById('toast')) {
        if (!window.promptManager) {
            window.promptManager = new PromptManager();
        }
    } else {
        console.error("Promptr: Critical HTML elements missing, cannot initialize PromptManager.");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePromptManager);
} else {
    initializePromptManager();
}