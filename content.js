// content.js - Currently minimal.
// Injection logic is handled by chrome.scripting.executeScript from sidepanel.js.

console.log("Promptr content script loaded.");

// Optional: Add listeners here if the side panel needs to receive messages
// from the content script in the future (e.g., confirmation of injection).
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "someActionFromSidepanel") {
//     console.log("Message received in content script:", message);
//     // Process message and maybe send a response
//     sendResponse({ status: "Received" });
//   }
//   return true; // Keep the message channel open for async response
// });