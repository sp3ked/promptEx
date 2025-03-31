// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
    // Open the side panel
    chrome.sidePanel.open({ windowId: tab.windowId });
}); 