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

            // Show loading toast immediately
            const createToast = (message, type) => {
                const toastContainer = document.getElementById('toastContainer');
                if (!toastContainer) {
                    console.error('Toast container not found');
                    return;
                }

                // Create a new toast element
                const newToast = document.createElement('div');
                newToast.className = `toast toast-${type}`;
                newToast.textContent = message;

                // Add to the toast container
                toastContainer.appendChild(newToast);

                // Show the toast with a slight delay for animation
                setTimeout(() => {
                    newToast.classList.add('show');
                }, 10);

                // Remove the toast after it fades out
                setTimeout(() => {
                    newToast.classList.add('fadeout');
                    setTimeout(() => {
                        if (newToast.parentNode) {
                            newToast.parentNode.removeChild(newToast);
                        }
                    }, 300);
                }, type === 'error' ? 5000 : 3000);
            };

            const createErrorToastWithDetails = (message, type) => {
                const toastContainer = document.getElementById('toastContainer');
                if (!toastContainer) {
                    console.error('Toast container not found');
                    return;
                }

                // Create a new toast element with details
                const newToast = document.createElement('div');
                newToast.className = `toast toast-${type} toast-with-details`;
                newToast.innerHTML = message;

                // Add to the toast container
                toastContainer.appendChild(newToast);

                // Show the toast with a slight delay for animation
                setTimeout(() => {
                    newToast.classList.add('show');
                }, 10);

                // Remove the toast after it fades out
                setTimeout(() => {
                    newToast.classList.add('fadeout');
                    setTimeout(() => {
                        if (newToast.parentNode) {
                            newToast.parentNode.removeChild(newToast);
                        }
                    }, 300);
                }, 5000);
            };

            // Show initial loading toast
            createToast("Sending prompt...", "info");

            // Create the injection promise
            const injectionPromise = new Promise(async (injectionResolve, injectionReject) => {
                try {
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (!tabs || !tabs[0]) {
                        throw new Error('No active tab found');
                    }

                    await chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: injectPromptAndFileIntoPage,
                        args: [{ content: text }],
                        world: 'MAIN'
                    });

                    createToast("Prompt sent successfully!", "success");
                    injectionResolve();
                } catch (error) {
                    console.error('Injection failed:', error);

                    let errorMsg = "You are not on an LLM website. Please navigate to a supported website to use the prompt injection.";

                    if (error.message && error.message.includes("Cannot access")) {
                        errorMsg = "Cannot access this page. You need to navigate to a supported LLM website to use prompt injection.";
                    } else if (error.message && error.message.includes("Could not establish connection")) {
                        errorMsg = "Connection failed. Please navigate to a supported LLM website and try again.";
                    }

                    createErrorToastWithDetails(
                        errorMsg + " (ChatGPT, Claude, etc.)"
                    );
                    injectionReject(new Error(errorMsg));
                }
            });

            injectionPromise
                .then(resolve)
                .catch(reject);
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
            throw new Error(`You are not on an LLM website. Please navigate to one of the supported websites:
<ol>
<li>ChatGPT (chat.openai.com)</li>
<li>Claude (claude.ai)</li>
<li>Grok (grok.x.ai)</li>
<li>Gemini (gemini.google.com)</li>
<li>Perplexity (perplexity.ai)</li>
</ol>
<p>The prompt injection only works on these supported websites.</p>`);
        }
    } catch (error) {
        console.error("Promptr: Injection error:", error);
        throw error;
    }
} 