/**
 * Injection utility module for handling prompt injection into LLM websites
 */

const InjectionManager = {
    /**
     * Inject prompt content into the active tab
     * @param {string} content Prompt content to inject
     * @returns {Promise<void>}
     */
    async injectPrompt(content) {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs || !tabs[0] || !tabs[0].id) {
                throw new Error('No active tab found.');
            }

            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: this.injectPromptAndFileIntoPage,
                args: [{ content }],
                world: 'MAIN'
            });

            UIManager.showToast('Prompt injected successfully!', 'success');
        } catch (error) {
            console.error('Injection error:', error);
            UIManager.showErrorWithDetails(error.message, 'error');
            throw error;
        }
    },

    /**
     * Function that runs in the context of the webpage to inject the prompt
     * @param {Object} promptData Object containing the prompt content
     */
    injectPromptAndFileIntoPage(promptData) {
        console.log("Promptr: Injecting text:", promptData);
        const { content } = promptData;

        function simulateInput(element, text) {
            element.focus();
            if (element.isContentEditable) {
                document.execCommand('insertText', false, text || '');
            } else {
                element.value = text || '';
            }
            element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        }

        try {
            const selectors = [
                'div.ProseMirror[contenteditable="true"][translate="no"]#prompt-textarea', // ChatGPT
                '.ProseMirror[contenteditable="true"][translate="no"]', // Claude
                'div[contenteditable="true"][aria-label="Write your prompt to Claude"]', // Claude alt
                'div.ProseMirror.break-words', // Claude fallback
                'textarea[data-testid="tweetTextarea_0"]', // Grok
                'textarea[placeholder*="message"]', // Generic fallback
                'div[role="textbox"]', // Broad fallback
                'div.relative.flex.w-full.grow.flex-col', // Gemini
                'div[contenteditable="true"][role="textbox"]' // More general fallback
            ];

            let targetTextArea;
            for (const selector of selectors) {
                targetTextArea = document.querySelector(selector);
                if (targetTextArea) {
                    console.log("Promptr: Found text area with selector:", selector);
                    break;
                }
            }

            if (targetTextArea) {
                simulateInput(targetTextArea, content);
                console.log("Promptr: Text injected successfully.");
                chrome.runtime.sendMessage({
                    action: "showToast",
                    message: "Prompt injected!",
                    type: "success"
                });
            } else {
                throw new Error("Make sure you're on an LLM website<details><summary>Show supported websites</summary>• ChatGPT (chat.openai.com)<br>• Claude (claude.ai)<br>• Grok (grok.x.ai)<br>• Gemini (gemini.google.com)<br>• Perplexity (perplexity.ai)</details>");
            }
        } catch (error) {
            console.error("Promptr: Injection error:", error);
            chrome.runtime.sendMessage({
                action: "showErrorWithDetails",
                message: error.message,
                type: "error"
            });
            throw error;
        }
    }
}; 