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
        this.initializeSettings();
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
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.resetSettingsBtn = document.getElementById('resetSettingsBtn');
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
            this.showSettingsModal();
        });

        // Close settings modal
        this.closeSettingsModalBtn.addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Save settings button
        this.saveSettingsBtn.addEventListener('click', () => {
            this.saveSettings();
            this.closeSettingsModal();
        });

        // Reset settings button
        this.resetSettingsBtn.addEventListener('click', () => {
            this.resetSettings();
        });

        // Listen for toast messages from content script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "showToast") {
                UIManager.showToast(request.message, request.type);
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
     * Initialize settings
     */
    initializeSettings() {
        // Load settings from storage
        chrome.storage.local.get('settings', (result) => {
            const settings = result.settings || {
                theme: 'dark',
                fontSize: '16',
                autoSave: true
            };

            // Apply settings to the UI
            document.getElementById('themeSelect').value = settings.theme;
            document.getElementById('fontSizeSelect').value = settings.fontSize;
            document.getElementById('autoSaveToggle').checked = settings.autoSave;

            // Apply theme
            document.body.setAttribute('data-theme', settings.theme);

            // Apply font size
            document.documentElement.style.fontSize = `${settings.fontSize}px`;
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

    /**
     * Show settings modal
     */
    showSettingsModal() {
        this.settingsModal.classList.add('show');
    }

    /**
     * Close settings modal
     */
    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }

    /**
     * Save settings
     */
    saveSettings() {
        const settings = {
            theme: document.getElementById('themeSelect').value,
            fontSize: document.getElementById('fontSizeSelect').value,
            autoSave: document.getElementById('autoSaveToggle').checked
        };

        // Save settings to storage
        chrome.storage.local.set({ settings }, () => {
            // Apply settings
            document.body.setAttribute('data-theme', settings.theme);
            document.documentElement.style.fontSize = `${settings.fontSize}px`;

            // Show toast
            UIManager.showToast('Settings saved!', 'success');
        });
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        const defaults = {
            theme: 'dark',
            fontSize: '16',
            autoSave: true
        };

        // Reset UI
        document.getElementById('themeSelect').value = defaults.theme;
        document.getElementById('fontSizeSelect').value = defaults.fontSize;
        document.getElementById('autoSaveToggle').checked = defaults.autoSave;

        // Save defaults
        chrome.storage.local.set({ settings: defaults }, () => {
            // Apply settings
            document.body.setAttribute('data-theme', defaults.theme);
            document.documentElement.style.fontSize = `${defaults.fontSize}px`;

            // Show toast
            UIManager.showToast('Settings reset to defaults', 'info');
        });
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