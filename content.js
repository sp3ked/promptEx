// content.js - Minimal version 
// Main functionality now handled by chrome.scripting.executeScript from injection-manager.js

console.log("Promptr content script loaded.");

// This content script serves primarily to establish the extension's presence on supported pages
// The actual text injection is done via chrome.scripting.executeScript for more reliable operation