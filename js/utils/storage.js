/**
 * Storage utility module for handling prompt data persistence
 */

const StorageManager = {
    /**
     * Get all stored prompts
     * @returns {Array} Array of prompt objects
     */
    getPrompts() {
        const prompts = localStorage.getItem('prompts');
        return prompts ? JSON.parse(prompts) : [];
    },

    /**
     * Save a new prompt
     * @param {Object} prompt Prompt object to save
     * @returns {boolean} Success status
     */
    savePrompt(prompt) {
        try {
            // First check if a similar prompt already exists (by title or content)
            const prompts = this.getPrompts();
            const exists = prompts.some(p =>
                p.title === prompt.title ||
                p.content === prompt.content
            );

            if (exists) {
                return false; // Prompt already exists
            }

            // Generate unique ID
            const newPrompt = {
                ...prompt,
                id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: prompt.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            prompts.push(newPrompt);
            localStorage.setItem('prompts', JSON.stringify(prompts));
            console.log('Prompt saved successfully:', newPrompt);
            return true;
        } catch (error) {
            console.error('Error saving prompt:', error);
            return false;
        }
    },

    /**
     * Update an existing prompt
     * @param {string} id Prompt ID to update
     * @param {Object} updatedPrompt Updated prompt data
     * @returns {boolean} Success status
     */
    updatePrompt(id, updatedPrompt) {
        try {
            const prompts = this.getPrompts();
            const index = prompts.findIndex(p => p.id === id);
            if (index !== -1) {
                prompts[index] = { ...prompts[index], ...updatedPrompt };
                localStorage.setItem('prompts', JSON.stringify(prompts));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating prompt:', error);
            return false;
        }
    },

    /**
     * Delete a prompt
     * @param {string} id Prompt ID to delete
     * @returns {boolean} Success status
     */
    deletePrompt(id) {
        try {
            const prompts = this.getPrompts();
            const filteredPrompts = prompts.filter(p => p.id !== id);
            localStorage.setItem('prompts', JSON.stringify(filteredPrompts));
            return true;
        } catch (error) {
            console.error('Error deleting prompt:', error);
            return false;
        }
    },

    /**
     * Get user settings
     * @returns {Object} User settings object
     */
    getSettings() {
        const settings = localStorage.getItem('settings');
        return settings ? JSON.parse(settings) : {
            theme: 'dark',
            promptCount: 0
        };
    },

    /**
     * Save user settings
     * @param {Object} settings Settings object to save
     * @returns {boolean} Success status
     */
    saveSettings(settings) {
        try {
            localStorage.setItem('settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
}; 