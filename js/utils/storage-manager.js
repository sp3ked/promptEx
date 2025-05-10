/**
 * Storage Manager Utility
 * Handles all local storage operations for prompts
 */
const StorageManager = {
    STORAGE_KEY: 'promptr_prompts',
    saveTimeout: null,

    /**
     * Dispatch a custom event when prompts are changed
     * @param {string} action The action that occurred (save, update, delete)
     */
    dispatchPromptChangeEvent(action) {
        // Create and dispatch a custom event
        const event = new CustomEvent('promptsChanged', {
            detail: { action }
        });
        document.dispatchEvent(event);
        console.log(`Dispatched promptsChanged event: ${action}`);
    },

    /**
     * Get all prompts from storage
     * @returns {Array} Array of prompt objects
     */
    getPrompts() {
        try {
            const prompts = localStorage.getItem(this.STORAGE_KEY);
            return prompts ? JSON.parse(prompts) : [];
        } catch (error) {
            console.error('Error getting prompts:', error);
            return [];
        }
    },

    /**
     * Save a new prompt
     * @param {Object} promptData Prompt data to save
     * @returns {boolean} Success status
     */
    savePrompt(promptData) {
        try {
            // Clear any pending save operations
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }

            // Use a shorter timeout for better responsiveness
            return new Promise((resolve) => {
                this.saveTimeout = setTimeout(() => {
                    const prompts = this.getPrompts();

                    // Check for duplicate title
                    const isDuplicate = prompts.some(p =>
                        p.title.toLowerCase() === promptData.title.toLowerCase() &&
                        p.content === promptData.content
                    );

                    if (isDuplicate) {
                        console.log('Duplicate prompt detected, skipping save');
                        resolve(false);
                        return;
                    }

                    const newPrompt = {
                        id: crypto.randomUUID(),
                        title: promptData.title,
                        content: promptData.content,
                        tags: promptData.tags || '',
                        pinned: promptData.pinned || false,
                        createdAt: promptData.createdAt || new Date().toISOString(),
                        updatedAt: promptData.updatedAt || new Date().toISOString()
                    };

                    prompts.push(newPrompt);
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prompts));

                    // Dispatch the change event immediately
                    this.dispatchPromptChangeEvent('save');

                    console.log('Prompt saved successfully:', newPrompt.title);
                    resolve(true);
                }, 50); // Reduced to 50ms for faster response
            });
        } catch (error) {
            console.error('Error saving prompt:', error);
            return Promise.resolve(false);
        }
    },

    /**
     * Update an existing prompt
     * @param {string} id Prompt ID to update
     * @param {Object} promptData Updated prompt data
     * @returns {boolean} Success status
     */
    updatePrompt(id, promptData) {
        try {
            const prompts = this.getPrompts();
            const index = prompts.findIndex(p => p.id === id);
            if (index === -1) return false;

            prompts[index] = {
                ...prompts[index],
                ...promptData,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prompts));

            // Dispatch the change event
            this.dispatchPromptChangeEvent('update');

            return true;
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
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPrompts));

            // Dispatch the change event
            this.dispatchPromptChangeEvent('delete');

            return true;
        } catch (error) {
            console.error('Error deleting prompt:', error);
            return false;
        }
    },

    /**
     * Get a single prompt by ID
     * @param {string} id Prompt ID to get
     * @returns {Object|null} Prompt object or null if not found
     */
    getPromptById(id) {
        try {
            const prompts = this.getPrompts();
            return prompts.find(p => p.id === id) || null;
        } catch (error) {
            console.error('Error getting prompt:', error);
            return null;
        }
    }
}; 