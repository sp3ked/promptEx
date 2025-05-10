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
            // Validate content
            if (!text || typeof text !== 'string' || text.trim() === '') {
                reject(new Error('No prompt content provided.'));
                return;
            }

            // Use chrome.scripting.executeScript for direct injection
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (!tabs || !tabs[0]) {
                    reject(new Error('No active tab found'));
                    return;
                }

                try {
                    chrome.runtime.sendMessage({
                        action: "showToast",
                        message: "Sending prompt...",
                        type: "info"
                    });

                    await chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: injectPromptAndFileIntoPage,
                        args: [{ content: text }],
                        world: 'MAIN'
                    });

                    chrome.runtime.sendMessage({
                        action: "showToast",
                        message: "Prompt sent successfully!",
                        type: "success"
                    });

                    resolve();
                } catch (error) {
                    console.error('Injection failed:', error);

                    // Create a more user-friendly error message
                    let errorMsg = "Prompt injection failed. Make sure you're on a compatible LLM website.";

                    if (error.message && error.message.includes("Cannot access")) {
                        errorMsg = "Cannot access this page. Make sure you're on a compatible LLM website.";
                    } else if (error.message && error.message.includes("Could not establish connection")) {
                        errorMsg = "Connection failed. Please refresh the page and try again.";
                    }

                    chrome.runtime.sendMessage({
                        action: "showErrorWithDetails",
                        message: errorMsg + "<details><summary>Show supported websites</summary>• ChatGPT (chat.openai.com)<br>• Claude (claude.ai)<br>• Grok (grok.x.ai)<br>• Gemini (gemini.google.com)<br>• Perplexity (perplexity.ai)</details>",
                        type: "error"
                    });

                    reject(new Error(errorMsg));
                }
            });
        });
    }
};

/**
 * This function runs in the context of the web page
 * @param {Object} promptData Object containing the prompt content
 */
function injectPromptAndFileIntoPage(promptData) {
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
            // ChatGPT specific selectors
            'div.ProseMirror[contenteditable="true"][translate="no"]#prompt-textarea',
            'textarea[placeholder*="Send a message"]',
            'textarea#prompt-textarea',
            'div[id="prompt-textarea"]',

            // Claude specific selectors
            '.ProseMirror[contenteditable="true"][translate="no"]',
            'div[contenteditable="true"][aria-label="Write your prompt to Claude"]',
            'div.ProseMirror.break-words',

            // Grok specific selectors
            'textarea[data-testid="tweetTextarea_0"]',

            // Gemini specific selectors
            'div.relative.flex.w-full.grow.flex-col',

            // Generic selectors (fallbacks)
            'textarea[placeholder*="message"]',
            'div[role="textbox"]',
            'div[contenteditable="true"][role="textbox"]',
            'textarea'
        ];

        let targetTextArea;
        for (const selector of selectors) {
            // First try querySelector
            targetTextArea = document.querySelector(selector);
            if (targetTextArea) {
                console.log("Promptr: Found text area with selector:", selector);
                break;
            }

            // If not found, try querySelectorAll and use the last element (often the active one)
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                targetTextArea = elements[elements.length - 1];
                console.log("Promptr: Found multiple text areas with selector:", selector, "- using the last one");
                break;
            }
        }

        if (targetTextArea) {
            simulateInput(targetTextArea, content);
            console.log("Promptr: Text injected successfully.");
            return { success: true };
        } else {
            throw new Error(`No text input found on this page. Please make sure:
<ol>
<li>You are on a supported LLM website</li>
<li>The chat interface is fully loaded</li>
<li>You're not in a special view (like settings)</li>
</ol>
<details>
<summary>Supported websites</summary>
• ChatGPT (chat.openai.com)<br>
• Claude (claude.ai)<br>
• Grok (grok.x.ai)<br>
• Gemini (gemini.google.com)<br>
• Perplexity (perplexity.ai)
</details>`);
        }
    } catch (error) {
        console.error("Promptr: Injection error:", error);
        throw error;
    }
} 