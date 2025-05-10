document.addEventListener('DOMContentLoaded', function () {
    // UI Elements
    const createPromptBtn = document.getElementById('createPromptBtn');
    const openSidepanelBtn = document.getElementById('openSidepanelBtn');
    const backBtn = document.getElementById('backBtn');
    const savePromptBtn = document.getElementById('savePromptBtn');
    const promptFormContainer = document.getElementById('promptFormContainer');
    const actionButtonContainer = document.querySelector('.action-button-container');
    const promptTitleInput = document.getElementById('promptTitle');
    const promptContentInput = document.getElementById('promptContent');

    // Add toast element to the document
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);

    // Show the prompt creation form
    function showPromptForm() {
        actionButtonContainer.style.display = 'none';
        promptFormContainer.classList.remove('hidden');
        promptTitleInput.focus();
    }

    // Hide the prompt creation form and show the main actions
    function hidePromptForm() {
        promptFormContainer.classList.add('hidden');
        actionButtonContainer.style.display = 'flex';
        // Clear form inputs
        promptTitleInput.value = '';
        promptContentInput.value = '';
    }

    // Open the sidepanel
    function openSidepanel() {
        if (chrome.sidePanel) {
            chrome.sidePanel.open();
        }
    }

    // Show toast notification
    function showToast(message, type = '') {
        toast.textContent = message;
        toast.className = 'toast';
        if (type) {
            toast.classList.add(type);
        }
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Save the prompt
    function savePrompt() {
        const title = promptTitleInput.value.trim();
        const content = promptContentInput.value.trim();

        // Validate inputs
        if (!title) {
            showToast('Please enter a title for your prompt', 'error');
            promptTitleInput.focus();
            return;
        }

        if (!content) {
            showToast('Please enter content for your prompt', 'error');
            promptContentInput.focus();
            return;
        }

        // Create the prompt object
        const promptData = {
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            isPinned: false
        };

        // Send to the sidepanel via background script
        chrome.runtime.sendMessage({
            action: 'createPrompt',
            prompt: promptData
        }, function (response) {
            if (response && response.success) {
                showToast('Prompt created successfully!', 'success');
                hidePromptForm();
            } else {
                showToast('Failed to create prompt. Please try again.', 'error');
            }
        });
    }

    // Event listeners
    createPromptBtn.addEventListener('click', showPromptForm);
    openSidepanelBtn.addEventListener('click', openSidepanel);
    backBtn.addEventListener('click', hidePromptForm);
    savePromptBtn.addEventListener('click', savePrompt);

    // Handle Enter key in the title input to move to content
    promptTitleInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            promptContentInput.focus();
        }
    });
}); 