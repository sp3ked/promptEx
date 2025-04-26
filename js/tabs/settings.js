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
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

        // Live theme preview
        this.themeSelect.addEventListener('change', () => {
            document.documentElement.setAttribute('data-theme', this.themeSelect.value);
        });

        // Live font size preview
        this.fontSizeSelect.addEventListener('change', () => {
            document.documentElement.style.fontSize = this.fontSizeSelect.value + 'px';
        });

        // FAQ button
        document.getElementById('faqBtn').addEventListener('click', () => {
            document.getElementById('faqModal').classList.add('show');
        });

        // Close FAQ modal
        document.getElementById('closeFaqBtn').addEventListener('click', () => {
            document.getElementById('faqModal').classList.remove('show');
        });

        // Account button
        document.getElementById('accountBtn').addEventListener('click', () => {
            document.getElementById('accountModal').classList.add('show');
        });

        // Close account modal
        document.getElementById('closeAccountBtn').addEventListener('click', () => {
            document.getElementById('accountModal').classList.remove('show');
        });
    },

    /**
     * Load settings from storage
     */
    loadSettings() {
        const settings = StorageManager.getSettings();

        // Set form values
        this.themeSelect.value = settings.theme || 'light';
        this.fontSizeSelect.value = settings.fontSize || '16';
        this.autoSaveToggle.checked = settings.autoSave || false;

        // Apply settings
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
        document.documentElement.style.fontSize = (settings.fontSize || '16') + 'px';
    },

    /**
     * Save settings to storage
     */
    saveSettings() {
        const settings = {
            theme: this.themeSelect.value,
            fontSize: this.fontSizeSelect.value,
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
            theme: 'light',
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