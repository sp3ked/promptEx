// Create and inject the HTML content
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Promptr</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #ff4d4d;
            --primary-hover: #ff3333;
            --bg-color: #1a1a1a;
            --text-color: #ffffff;
            --border-color: #333333;
            --card-bg: #2a2a2a;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.5;
        }

        .container {
            padding: 20px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s ease-out;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
        }

        .title {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
        }

        .actions {
            display: flex;
            gap: 12px;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 8px;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .btn-secondary {
            background-color: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background-color: #333333;
        }

        .prompts-container {
            flex: 1;
            overflow-y: auto;
            margin-top: 16px;
        }

        .prompt-card {
            background-color: var(--card-bg);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }

        .prompt-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .prompt-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--primary-color);
        }

        .prompt-content {
            font-size: 14px;
            color: #cccccc;
            margin-bottom: 12px;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .prompt-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #888888;
        }

        .prompt-actions {
            display: flex;
            gap: 8px;
        }

        .search-bar {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            width: 100%;
            color: var(--text-color);
            font-size: 14px;
            margin-bottom: 16px;
        }

        .search-bar:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .copy-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        .copy-toast.show {
            opacity: 1;
        }

        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-color);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #444444;
        }

        @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Promptr</h1>
            <div class="actions">
                <button class="btn btn-secondary" id="exportBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export
                </button>
                <button class="btn btn-secondary" id="importBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Import
                </button>
                <button class="btn btn-primary" id="newPromptBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New Prompt
                </button>
            </div>
        </div>

        <input type="text" class="search-bar" placeholder="Search prompts..." id="searchInput">
        <div class="prompts-container" id="promptsContainer"></div>
    </div>
    <div class="copy-toast" id="copyToast">Copied to clipboard!</div>
</body>
</html>
`;

// Create a blob from the HTML content
const blob = new Blob([htmlContent], { type: 'text/html' });
const url = URL.createObjectURL(blob);

// Create an iframe to display the content
const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = '100%';
iframe.style.border = 'none';
iframe.src = url;

// Replace the current document content with the iframe
document.body.innerHTML = '';
document.body.appendChild(iframe);

// Wait for the iframe to load before initializing the application
iframe.onload = () => {
    // Get the document and window objects from the iframe
    const iframeDoc = iframe.contentDocument;
    const iframeWindow = iframe.contentWindow;

    // Prompt management functionality
    class PromptManager {
        constructor() {
            this.prompts = [];
            this.initializeElements();
            this.loadPrompts();
            this.setupEventListeners();
        }

        initializeElements() {
            this.promptsContainer = iframeDoc.getElementById('promptsContainer');
            this.searchInput = iframeDoc.getElementById('searchInput');
            this.newPromptBtn = iframeDoc.getElementById('newPromptBtn');
            this.importBtn = iframeDoc.getElementById('importBtn');
            this.exportBtn = iframeDoc.getElementById('exportBtn');
            this.copyToast = iframeDoc.getElementById('copyToast');
        }

        setupEventListeners() {
            this.newPromptBtn.addEventListener('click', () => this.createNewPrompt());
            this.importBtn.addEventListener('click', () => this.importPrompts());
            this.exportBtn.addEventListener('click', () => this.exportPrompts());
            this.searchInput.addEventListener('input', (e) => this.filterPrompts(e.target.value));
        }

        async loadPrompts() {
            const result = await chrome.storage.local.get('prompts');
            this.prompts = result.prompts || [];
            this.renderPrompts();
        }

        async savePrompts() {
            await chrome.storage.local.set({ prompts: this.prompts });
        }

        createNewPrompt() {
            const prompt = {
                id: Date.now(),
                title: 'New Prompt',
                content: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.prompts.unshift(prompt);
            this.savePrompts();
            this.renderPrompts();
            this.editPrompt(prompt.id);
        }

        editPrompt(id) {
            const prompt = this.prompts.find(p => p.id === id);
            if (!prompt) return;

            const card = iframeDoc.querySelector(`[data-prompt-id="${id}"]`);
            if (!card) return;

            const titleInput = iframeDoc.createElement('input');
            titleInput.type = 'text';
            titleInput.value = prompt.title;
            titleInput.className = 'prompt-title';
            titleInput.placeholder = 'Enter prompt title';

            const contentTextarea = iframeDoc.createElement('textarea');
            contentTextarea.value = prompt.content;
            contentTextarea.className = 'prompt-content';
            contentTextarea.placeholder = 'Enter prompt content';
            contentTextarea.style.width = '100%';
            contentTextarea.style.minHeight = '100px';
            contentTextarea.style.marginBottom = '12px';
            contentTextarea.style.padding = '8px';
            contentTextarea.style.background = 'var(--bg-color)';
            contentTextarea.style.border = '1px solid var(--border-color)';
            contentTextarea.style.color = 'var(--text-color)';
            contentTextarea.style.borderRadius = '4px';

            const buttonContainer = iframeDoc.createElement('div');
            buttonContainer.className = 'prompt-actions';
            buttonContainer.style.marginTop = '12px';

            const saveBtn = iframeDoc.createElement('button');
            saveBtn.className = 'btn btn-primary';
            saveBtn.textContent = 'Save';
            saveBtn.onclick = () => {
                prompt.title = titleInput.value;
                prompt.content = contentTextarea.value;
                prompt.updatedAt = new Date().toISOString();
                this.savePrompts();
                this.renderPrompts();
            };

            const cancelBtn = iframeDoc.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => this.renderPrompts();

            buttonContainer.appendChild(saveBtn);
            buttonContainer.appendChild(cancelBtn);

            card.innerHTML = '';
            card.appendChild(titleInput);
            card.appendChild(contentTextarea);
            card.appendChild(buttonContainer);
        }

        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                this.showCopyToast();
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }

        showCopyToast() {
            this.copyToast.classList.add('show');
            setTimeout(() => {
                this.copyToast.classList.remove('show');
            }, 2000);
        }

        deletePrompt(id) {
            if (confirm('Are you sure you want to delete this prompt?')) {
                this.prompts = this.prompts.filter(p => p.id !== id);
                this.savePrompts();
                this.renderPrompts();
            }
        }

        filterPrompts(query) {
            const filteredPrompts = this.prompts.filter(prompt =>
                prompt.title.toLowerCase().includes(query.toLowerCase()) ||
                prompt.content.toLowerCase().includes(query.toLowerCase())
            );
            this.renderPrompts(filteredPrompts);
        }

        async importPrompts() {
            const input = iframeDoc.createElement('input');
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
                } catch (error) {
                    alert('Error importing prompts: ' + error.message);
                }
            };
            input.click();
        }

        exportPrompts() {
            const dataStr = JSON.stringify(this.prompts, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = iframeDoc.createElement('a');
            a.href = url;
            a.download = `prompts-${new Date().toISOString().split('T')[0]}.json`;
            iframeDoc.body.appendChild(a);
            a.click();
            iframeDoc.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        renderPrompts(promptsToRender = this.prompts) {
            this.promptsContainer.innerHTML = '';

            promptsToRender.forEach(prompt => {
                const card = iframeDoc.createElement('div');
                card.className = 'prompt-card';
                card.setAttribute('data-prompt-id', prompt.id);

                const title = iframeDoc.createElement('h3');
                title.className = 'prompt-title';
                title.textContent = prompt.title;

                const content = iframeDoc.createElement('p');
                content.className = 'prompt-content';
                content.textContent = prompt.content;

                const meta = iframeDoc.createElement('div');
                meta.className = 'prompt-meta';
                meta.innerHTML = `
                    <span>Last updated: ${new Date(prompt.updatedAt).toLocaleDateString()}</span>
                    <div class="prompt-actions">
                        <button class="btn btn-secondary" onclick="promptManager.copyToClipboard('${prompt.content.replace(/'/g, "\\'")}')">Copy</button>
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

    // Initialize the prompt manager in the iframe's context
    iframeWindow.promptManager = new PromptManager();
}; 