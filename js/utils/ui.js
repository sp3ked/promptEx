/**
 * UI utility module for shared UI functionality
 */

const UIManager = {
    /**
     * Show a toast notification
     * @param {string} message Message to display
     * @param {string} type Toast type (success/error/info)
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show toast-${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    /**
     * Show an error toast with expandable details
     * @param {string} message Error message
     * @param {string} type Toast type (usually 'error')
     */
    showErrorWithDetails(message, type = 'error') {
        const toast = document.getElementById('toast');
        toast.innerHTML = message;
        toast.className = `toast show toast-${type} toast-with-details`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    },

    /**
     * Sanitize HTML content
     * @param {string} text Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}; 