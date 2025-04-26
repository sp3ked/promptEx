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
        // Show default tab (prompts)
        this.switchTab('prompts');
    }

    /**
     * Switch active tab
     * @param {string} tabId ID of tab to switch to
     */
    switchTab(tabId) {
        // Update tab buttons
        this.tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update tab content
        this.tabContents.forEach(content => {
            if (content.id === `${tabId}Tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Update search container visibility
        const promptsSearch = document.getElementById('promptsSearchContainer');
        const communitySearch = document.getElementById('communitySearchContainer');

        if (promptsSearch) {
            promptsSearch.style.display = tabId === 'prompts' ? 'flex' : 'none';
        }
        if (communitySearch) {
            communitySearch.style.display = tabId === 'community' ? 'flex' : 'none';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 