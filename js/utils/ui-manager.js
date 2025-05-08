/**
 * UI Manager Utility
 * Handles common UI operations and notifications
 */
const UIManager = {
    /**
     * Show a toast notification
     * @param {string} message Message to display
     * @param {string} type Type of toast (success, error, info)
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.error('Toast element not found');
            return;
        }

        // Clear any existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        // Remove any existing classes
        toast.className = 'toast';

        // Set message first (before showing)
        toast.textContent = message;

        // Force layout reflow
        void toast.offsetWidth;

        // Add new classes
        toast.classList.add(`toast-${type}`);
        toast.classList.add('show');

        // Hide after 2 seconds
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    },

    /**
     * Sanitize HTML content to prevent XSS
     * @param {string} html HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        if (!html) return '';
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Format a date string
     * @param {string} dateString ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }
}; 