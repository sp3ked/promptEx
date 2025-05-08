/**
 * Injection Manager Utility
 * Handles injecting prompts into chat interfaces
 */
const InjectionManager = {
    /**
     * Inject a prompt into the active tab
     * @param {string} text Text to inject
     * @returns {Promise} Promise that resolves when injection is complete
     */
    async injectPrompt(text) {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs || !tabs[0]) {
                    reject(new Error('No active tab found'));
                    return;
                }

                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'sendPrompt',
                    prompt: text
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error('Could not send to tab. Try refreshing the page.'));
                        return;
                    }
                    if (response && response.success) {
                        resolve();
                    } else {
                        reject(new Error('Failed to send prompt'));
                    }
                });
            });
        });
    }
}; 