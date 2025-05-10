/**
 * Main application class
 */
class App {
    /**
     * Initialize the application
     */
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.initializeTabs();

        // Initialize all modules
        PromptsTab.init();
        CommunityTab.init();
        GenerateTab.init();
        SettingsTab.init();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Tab elements
        this.tabs = document.querySelectorAll('.tab');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Toast element
        this.toast = document.getElementById('toast');

        // Settings elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    }

    /**
     * Bind global event listeners
     */
    bindEvents() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // New prompt button (global action)
        document.getElementById('newPromptBtn').addEventListener('click', () => {
            // Switch to prompts tab first
            this.switchTab('prompts');
            // Then show new prompt modal
            setTimeout(() => {
                PromptsTab.showNewPromptModal();
            }, 100);
        });

        // Settings button
        this.settingsBtn.addEventListener('click', () => {
            this.settingsModal.classList.add('show');
        });

        // Close settings modal
        this.closeSettingsModalBtn.addEventListener('click', () => {
            this.settingsModal.classList.remove('show');
        });

        // Close settings modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.settingsModal.classList.remove('show');
            }
        });

        // Listen for toast messages from content script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "showToast") {
                UIManager.showToast(request.message, request.type);
            } else if (request.action === "showErrorWithDetails") {
                UIManager.showErrorWithDetails(request.message, request.type);
            }
        });
    }

    /**
     * Initialize tabs
     */
    initializeTabs() {
        // Get active tab from storage, or default to "prompts"
        chrome.storage.local.get('activeTab', (result) => {
            const activeTab = result.activeTab || 'prompts';
            this.switchTab(activeTab);
        });
    }

    /**
     * Switch to a different tab
     * @param {string} tabName The name of the tab to switch to
     */
    switchTab(tabName) {
        // Update tab buttons
        this.tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update tab content
        this.tabContents.forEach(content => {
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Save active tab to storage
        chrome.storage.local.set({ activeTab: tabName });
    }
}

// Set up toast functionality
window.showToast = (message, type) => {
    UIManager.showToast(message, type);
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 