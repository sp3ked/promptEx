// content.js
console.log('Promptr content script loaded.');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'insertPrompt') {
        const hostname = window.location.hostname;
        let result;

        try {
            if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
                result = insertPromptChatGPT(message.prompt, message.attachments);
            } else if (hostname.includes('claude.ai')) {
                result = insertPromptClaude(message.prompt, message.attachments);
            } else if (hostname.includes('grok.x.ai')) {
                result = insertPromptGrok(message.prompt, message.attachments);
            } else {
                result = { success: false, message: 'Please navigate to a supported AI chat (ChatGPT, Claude, or Grok)' };
            }
        } catch (error) {
            result = { success: false, message: `Error: ${error.message || 'Unknown error'}` };
        }
        sendResponse(result);
        return true; // Asynchronous response
    }
});

// Keep all insertion functions from original content.js
function decodeBase64Content(base64Content, fileType) { /* ... */ }
function insertPromptChatGPT(promptText, attachments) { /* ... */ }
function findFileInput() { /* ... */ }
function base64ToFile(base64String, filename, mimeType) { /* ... */ }
function insertPromptClaude(promptText, attachments) { /* ... */ }
function insertPromptGrok(promptText, attachments) { /* ... */ }