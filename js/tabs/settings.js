/**
 * Settings tab module for handling settings-related functionality
 */

const SettingsTab = {
    /**
     * Initialize settings tab
     */
    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
    },

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.settingsForm = document.getElementById('settingsForm');
        this.themeSelect = document.getElementById('themeSelect');
        this.fontSizeSelect = document.getElementById('fontSizeSelect');
        this.autoSaveToggle = document.getElementById('autoSaveToggle');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.resetSettingsBtn = document.getElementById('resetSettingsBtn');
        this.faqBtn = document.getElementById('faqBtn');
        this.faqModal = document.getElementById('faqModal');
        this.closeFaqBtn = document.getElementById('closeFaqBtn');
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

        // FAQ modal events
        this.faqBtn.addEventListener('click', () => {
            this.faqModal.classList.add('show');
        });

        this.closeFaqBtn.addEventListener('click', () => {
            this.faqModal.classList.remove('show');
        });

        // Close FAQ modal when clicking outside
        this.faqModal.addEventListener('click', (e) => {
            if (e.target === this.faqModal) {
                this.faqModal.classList.remove('show');
            }
        });

        // Auto-save toggle
        this.autoSaveToggle.addEventListener('change', () => {
            this.saveSettings();
        });
    },

    /**
     * Load settings from storage
     */
    loadSettings() {
        const settings = StorageManager.getSettings();

        // Set form values
        this.themeSelect.value = 'dark';
        this.fontSizeSelect.value = '16';
        this.autoSaveToggle.checked = settings.autoSave || false;

        // Apply settings
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.fontSize = '16px';
    },

    /**
     * Save settings to storage
     */
    saveSettings() {
        const settings = {
            theme: 'dark',
            fontSize: '16',
            autoSave: this.autoSaveToggle.checked
        };

        const success = StorageManager.saveSettings(settings);
        if (success) {
            UIManager.showToast('Settings saved successfully!', 'success');
        } else {
            UIManager.showToast('Error saving settings', 'error');
        }
    },

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        const defaultSettings = {
            theme: 'dark',
            fontSize: '16',
            autoSave: false
        };

        const success = StorageManager.saveSettings(defaultSettings);
        if (success) {
            this.loadSettings();
            UIManager.showToast('Settings reset to defaults', 'success');
        } else {
            UIManager.showToast('Error resetting settings', 'error');
        }
    },

    /**
     * Show toast notification
     * @param {string} message Message to display
     * @param {string} type Toast type (success/error)
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show toast-${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}; 