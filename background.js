// Open the side panel on action click
chrome.action.onClicked.addListener(async (tab) => {
    await chrome.sidePanel.open({ windowId: tab.windowId });
}); 