/**
 * PromptVault - Popup Script
 * Handles all interactions in the extension popup
 */

class PromptVault {
  constructor() {
    this.currentPromptId = null;
    this.prompts = [];
    this.attachments = new Map();
    this.init();
  }
  
  /**
   * Initialize the extension
   */
  async init() {
    // Load saved prompts
    await this.loadPrompts();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Display prompts in the UI
    this.renderPromptList();
  }
  
  /**
   * Set up event listeners for the UI
   */
  setupEventListeners() {
    // New prompt button
    document.getElementById('newPromptBtn').addEventListener('click', () => {
      this.showPromptModal();
    });
    
    // Search input
    document.getElementById('searchPrompts').addEventListener('input', (e) => {
      this.filterPrompts(e.target.value);
    });
    
    // Modal close buttons
    document.getElementById('closePromptModal').addEventListener('click', () => {
      document.getElementById('promptModal').style.display = 'none';
    });
    
    document.getElementById('closeViewModal').addEventListener('click', () => {
      document.getElementById('viewPromptModal').style.display = 'none';
    });
    
    // Save prompt button
    document.getElementById('savePromptBtn').addEventListener('click', () => {
      this.savePrompt();
    });
    
    // Cancel button
    document.getElementById('cancelPromptBtn').addEventListener('click', () => {
      document.getElementById('promptModal').style.display = 'none';
    });
    
    // File attachment input
    document.getElementById('fileAttachment').addEventListener('change', (e) => {
      this.handleFileSelection(e);
    });
    
    // Action buttons in view modal
    document.getElementById('editPromptBtn').addEventListener('click', () => {
      this.editCurrentPrompt();
    });
    
    document.getElementById('deletePromptBtn').addEventListener('click', () => {
      this.deleteCurrentPrompt();
    });
    
    document.getElementById('importPromptBtn').addEventListener('click', () => {
      this.importPromptToChat();
    });
    
    document.getElementById('copyPromptBtn').addEventListener('click', () => {
      this.copyPromptText();
    });
    
    // Add a retry button for import failures
    const retryBtn = document.createElement('button');
    retryBtn.id = 'retryImportBtn';
    retryBtn.textContent = 'Retry Import';
    retryBtn.style.display = 'none';
    retryBtn.style.backgroundColor = '#ff9800';
    retryBtn.addEventListener('click', () => {
      this.importPromptToChat();
    });
    document.getElementById('viewPromptModal').querySelector('.modal-content').appendChild(retryBtn);
  }
  
  /**
   * Load prompts from storage
   */
  async loadPrompts() {
    try {
      const data = await chrome.storage.local.get('prompts');
      this.prompts = data.prompts || [];
    } catch (error) {
      console.error('Error loading prompts:', error);
      this.prompts = [];
    }
  }
  
  /**
   * Save prompts to storage
   */
  async savePromptsToStorage() {
    try {
      await chrome.storage.local.set({ prompts: this.prompts });
      return true;
    } catch (error) {
      console.error('Error saving prompts:', error);
      this.showNotification('Error saving prompts', 'error');
      return false;
    }
  }
  
  /**
   * Render the list of prompts in the UI
   */
  renderPromptList() {
    const promptList = document.getElementById('promptList');
    
    // Clear the list
    promptList.innerHTML = '';
    
    if (this.prompts.length === 0) {
      // Show empty state
      promptList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666;">
          <p>No prompts yet</p>
          <p>Create your first prompt using the New Prompt button</p>
        </div>
      `;
      return;
    }
    
    // Add each prompt to the list
    this.prompts.forEach(prompt => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      promptElement.dataset.id = prompt.id;
      
      // Generate tag elements
      const tagElements = prompt.tags && prompt.tags.length > 0
        ? prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
        : '';
      
      // Check if prompt has attachments
      const hasAttachments = prompt.attachments && prompt.attachments.length > 0;
      
      promptElement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${prompt.title}</div>
        <div style="color: #666; font-size: 12px; margin-bottom: 5px;">
          ${this.truncateText(prompt.text, 80)}
        </div>
        <div class="tags">
          ${tagElements}
          ${hasAttachments ? '<span class="tag" style="background-color: #e8f5e9; color: #2e7d32;">📎 Attachments</span>' : ''}
        </div>
      `;
      
      // Add click event to view the prompt
      promptElement.addEventListener('click', () => {
        this.viewPrompt(prompt.id);
      });
      
      promptList.appendChild(promptElement);
    });
  }
  
  /**
   * Show prompt details in the view modal
   */
  viewPrompt(promptId) {
    const prompt = this.prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    this.currentPromptId = promptId;
    
    // Update view modal content
    document.getElementById('viewPromptTitle').textContent = prompt.title;
    document.getElementById('viewPromptText').textContent = prompt.text;
    
    // Set tags
    const tagsContainer = document.getElementById('viewPromptTags');
    tagsContainer.innerHTML = '';
    if (prompt.tags && prompt.tags.length > 0) {
      prompt.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    }
    
    // Set attachments
    const attachmentsContainer = document.getElementById('viewAttachments');
    attachmentsContainer.innerHTML = '';
    attachmentsContainer.style.display = 'block';
    
    if (prompt.attachments && prompt.attachments.length > 0) {
      const attachmentHeader = document.createElement('h4');
      attachmentHeader.textContent = 'Attachments';
      attachmentHeader.style.marginTop = '15px';
      attachmentsContainer.appendChild(attachmentHeader);
      
      prompt.attachments.forEach(attachment => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-attachment';
        fileItem.innerHTML = `
          <span class="file-name">${attachment.name}</span>
        `;
        attachmentsContainer.appendChild(fileItem);
      });
    } else {
      attachmentsContainer.style.display = 'none';
    }
    
    // Show modal
    document.getElementById('viewPromptModal').style.display = 'block';
  }
  
  /**
   * Filter prompts based on search input
   */
  filterPrompts(searchTerm) {
    if (!searchTerm) {
      this.renderPromptList();
      return;
    }
    
    const filteredPrompts = this.prompts.filter(prompt => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        prompt.title.toLowerCase().includes(searchTermLower) ||
        prompt.text.toLowerCase().includes(searchTermLower) ||
        (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
      );
    });
    
    const promptList = document.getElementById('promptList');
    promptList.innerHTML = '';
    
    if (filteredPrompts.length === 0) {
      promptList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666;">
          <p>No matching prompts</p>
          <p>Try a different search term</p>
        </div>
      `;
      return;
    }
    
    // Render the filtered prompts
    filteredPrompts.forEach(prompt => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      promptElement.dataset.id = prompt.id;
      
      // Generate tag elements
      const tagElements = prompt.tags && prompt.tags.length > 0
        ? prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
        : '';
      
      // Check if prompt has attachments
      const hasAttachments = prompt.attachments && prompt.attachments.length > 0;
      
      promptElement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${prompt.title}</div>
        <div style="color: #666; font-size: 12px; margin-bottom: 5px;">
          ${this.truncateText(prompt.text, 80)}
        </div>
        <div class="tags">
          ${tagElements}
          ${hasAttachments ? '<span class="tag" style="background-color: #e8f5e9; color: #2e7d32;">📎 Attachments</span>' : ''}
        </div>
      `;
      
      // Add click event to view the prompt
      promptElement.addEventListener('click', () => {
        this.viewPrompt(prompt.id);
      });
      
      promptList.appendChild(promptElement);
    });
  }
  
  /**
   * Show the modal for creating a new prompt
   */
  showPromptModal(existingPrompt = null) {
    const modal = document.getElementById('promptModal');
    const titleInput = document.getElementById('promptTitle');
    const textInput = document.getElementById('promptText');
    const tagsInput = document.getElementById('promptTags');
    const attachmentList = document.getElementById('attachmentList');
    
    // Reset form
    document.getElementById('modalTitle').textContent = existingPrompt ? 'Edit Prompt' : 'Create New Prompt';
    titleInput.value = existingPrompt ? existingPrompt.title : '';
    textInput.value = existingPrompt ? existingPrompt.text : '';
    tagsInput.value = existingPrompt && existingPrompt.tags ? existingPrompt.tags.join(', ') : '';
    attachmentList.innerHTML = '';
    
    this.attachments.clear();

    // If editing, load existing attachments
    if (existingPrompt && existingPrompt.attachments && existingPrompt.attachments.length > 0) {
      existingPrompt.attachments.forEach(attachment => {
        this.attachments.set(attachment.name, attachment);
        this.addAttachmentToList(attachment, attachmentList);
      });
    }
    
    // Store current prompt ID if editing
    this.currentPromptId = existingPrompt ? existingPrompt.id : null;
    
    // Show modal
    modal.style.display = 'block';
  }
  
  /**
   * Handle file selection for attachments
   */
  handleFileSelection(event) {
    const files = event.target.files;
    const attachmentList = document.getElementById('attachmentList');
    
    if (!files || files.length === 0) return;
    
    for (const file of files) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.showNotification(`File ${file.name} exceeds 5MB limit`, 'error');
        continue;
      }
      
      // Validate file type (can adjust based on supported types)
      const allowedTypes = [
        'text/plain', 'text/markdown', 'text/csv', 
        'application/pdf', 'application/json'
      ];
      
      if (!allowedTypes.includes(file.type) && 
          !file.name.endsWith('.md') && 
          !file.name.endsWith('.txt') && 
          !file.name.endsWith('.csv') && 
          !file.name.endsWith('.json')) {
        this.showNotification(`Unsupported file type: ${file.name}`, 'error');
        continue;
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target.result.split(',')[1];
        
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: base64Content
        };
        
        this.attachments.set(file.name, fileData);
        this.addAttachmentToList(fileData, attachmentList);
      };
      
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    event.target.value = '';
  }
  
  /**
   * Add an attachment to the UI list
   */
  addAttachmentToList(fileData, container) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-attachment';
    
    fileItem.innerHTML = `
      <span class="file-name">${fileData.name}</span>
      <button type="button" data-filename="${fileData.name}" style="background: none; border: none; color: #f44336; cursor: pointer;">✕</button>
    `;
    
    // Add remove button functionality
    fileItem.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      const filename = e.target.dataset.filename;
      this.attachments.delete(filename);
      fileItem.remove();
    });
    
    container.appendChild(fileItem);
  }
  
  /**
   * Save a prompt (new or existing)
   */
  async savePrompt() {
    const titleInput = document.getElementById('promptTitle');
    const textInput = document.getElementById('promptText');
    const tagsInput = document.getElementById('promptTags');
    
    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    if (!title || !text) {
      this.showNotification('Title and prompt text are required', 'error');
      return;
    }
    
    // Convert attachments Map to array
    const attachmentsArray = Array.from(this.attachments.values());
    
    const promptData = {
      title,
      text,
      tags,
      attachments: attachmentsArray,
      created: new Date().toISOString()
    };
    
    if (this.currentPromptId) {
      // Update existing prompt
      const index = this.prompts.findIndex(p => p.id === this.currentPromptId);
      if (index !== -1) {
        promptData.id = this.currentPromptId;
        promptData.updated = new Date().toISOString();
        this.prompts[index] = promptData;
      }
    } else {
      // Create new prompt
      promptData.id = this.generateId();
      this.prompts.push(promptData);
    }
    
    // Save to storage
    const success = await this.savePromptsToStorage();
    
    if (success) {
      // Update UI
      this.renderPromptList();
      
      // Close modal
      document.getElementById('promptModal').style.display = 'none';
      
      // Show success notification
      this.showNotification('Prompt saved successfully');
    }
  }
  
  /**
   * Edit the current prompt
   */
  editCurrentPrompt() {
    if (!this.currentPromptId) return;
    
    const prompt = this.prompts.find(p => p.id === this.currentPromptId);
    if (!prompt) return;
    
    document.getElementById('viewPromptModal').style.display = 'none';
    this.showPromptModal(prompt);
  }
  
  /**
   * Delete the current prompt
   */
  deleteCurrentPrompt() {
    if (!this.currentPromptId) return;
    
    if (confirm('Are you sure you want to delete this prompt?')) {
      const index = this.prompts.findIndex(p => p.id === this.currentPromptId);
      if (index !== -1) {
        this.prompts.splice(index, 1);
        this.savePromptsToStorage().then((success) => {
          if (success) {
            document.getElementById('viewPromptModal').style.display = 'none';
            this.renderPromptList();
            this.showNotification('Prompt deleted');
          }
        });
      }
    }
  }
  
  /**
   * Copy prompt text to clipboard
   */
  copyPromptText() {
    if (!this.currentPromptId) return;
    
    const prompt = this.prompts.find(p => p.id === this.currentPromptId);
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt.text).then(() => {
      this.showNotification('Prompt copied to clipboard');
    }).catch(err => {
      this.showNotification('Failed to copy: ' + err.message, 'error');
    });
  }
  
  /**
   * Import prompt to the current chat
   */
  importPromptToChat() {
    if (!this.currentPromptId) return;
    
    const prompt = this.prompts.find(p => p.id === this.currentPromptId);
    if (!prompt) return;
    
    // Show loading state
    document.getElementById('importPromptBtn').textContent = 'Importing...';
    document.getElementById('importPromptBtn').disabled = true;
    document.getElementById('retryImportBtn').style.display = 'none';
    
    // Send message to content script to insert prompt
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        this.showNotification('No active tab found', 'error', true);
        return;
      }

      // Check if the current tab is a supported platform
      const currentUrl = tabs[0].url;
      const isSupportedPlatform = 
        currentUrl.includes('chat.openai.com') || 
        currentUrl.includes('chatgpt.com') || 
        currentUrl.includes('claude.ai') || 
        currentUrl.includes('grok.x.ai');
      
      if (!isSupportedPlatform) {
        this.showNotification('Current page is not a supported AI platform', 'error', true);
        return;
      }
      
      try {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: 'insertPrompt',
            prompt: prompt.text,
            attachments: prompt.attachments || []
          },
          (response) => {
            // Reset button state
            document.getElementById('importPromptBtn').textContent = 'Import to Chat';
            document.getElementById('importPromptBtn').disabled = false;
            
            // Check for communication error
            if (chrome.runtime.lastError) {
              console.error('Error:', chrome.runtime.lastError);
              this.showNotification('Error: Cannot communicate with the page. Try refreshing.', 'error', true);
              return;
            }
            
            if (response && response.success) {
              this.showNotification('Prompt imported successfully');
              
              // Close the popup after a short delay to show the notification
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              this.showNotification('Failed to import prompt: ' + (response?.message || 'Unknown error'), 'error', true);
            }
          }
        );
      } catch (error) {
        // Reset button state
        document.getElementById('importPromptBtn').textContent = 'Import to Chat';
        document.getElementById('importPromptBtn').disabled = false;
        
        console.error('Error sending message:', error);
        this.showNotification('Error sending message to the page', 'error', true);
      }
    });
  }
  
  /**
   * Show a notification
   */
  showNotification(message, type = 'success', showRetry = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
    notification.style.display = 'block';
    
    // Show or hide retry button for import errors
    const retryBtn = document.getElementById('retryImportBtn');
    if (retryBtn) {
      retryBtn.style.display = type === 'error' && showRetry ? 'inline-block' : 'none';
    }
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  /**
   * Helper to truncate text with ellipsis
   */
  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  /**
   * Generate a unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

// Initialize the extension when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PromptVault();
}); 