/**
 * Promptr - Main Extension Functionality
 * Manages prompt storage, organization, and import functionality
 */

class Promptr {
  constructor() {
    this.currentPromptId = null;
    this.prompts = [];
    this.folders = [];
    this.attachments = [];
    this.currentFolder = 'all';
    
    this.init();
  }
  
  /**
   * Initialize the extension
   */
  async init() {
    await this.loadPrompts();
    await this.loadFolders();
    this.setupEventListeners();
    this.renderPromptGrid();
    this.renderFolders();
    this.selectFolder('all');
    this.updateEmptyState();
  }
  
  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // New prompt button
    document.getElementById('newPromptBtn').addEventListener('click', () => this.showPromptModal());
    document.getElementById('emptyStateNewBtn').addEventListener('click', () => this.showPromptModal());
    
    // Search prompt input
    document.getElementById('searchPrompts').addEventListener('input', (e) => this.filterPrompts(e.target.value));
    
    // Create prompt modal
    document.getElementById('closePromptModal').addEventListener('click', () => this.closeModal('promptModal'));
    document.getElementById('savePromptBtn').addEventListener('click', () => this.savePrompt());
    document.getElementById('cancelPromptBtn').addEventListener('click', () => this.closeModal('promptModal'));
    
    // View prompt modal
    document.getElementById('closeViewModal').addEventListener('click', () => this.closeModal('viewPromptModal'));
    document.getElementById('editPromptBtn').addEventListener('click', () => this.editPrompt());
    document.getElementById('deletePromptBtn').addEventListener('click', () => this.showDeleteModal());
    document.getElementById('importPromptBtn').addEventListener('click', () => this.importPrompt());
    document.getElementById('copyPromptBtn').addEventListener('click', () => this.copyPromptText());
    document.getElementById('favoritePromptBtn').addEventListener('click', () => this.toggleFavorite());
    
    // Delete confirmation modal
    document.getElementById('closeDeleteModal').addEventListener('click', () => this.closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.deletePrompt());
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeModal('deleteModal'));
    
    // Folder management
    document.getElementById('createFolderBtn').addEventListener('click', () => this.showFolderModal());
    document.getElementById('closeFolderModal').addEventListener('click', () => this.closeModal('folderModal'));
    document.getElementById('saveFolderBtn').addEventListener('click', () => this.saveFolder());
    document.getElementById('cancelFolderBtn').addEventListener('click', () => this.closeModal('folderModal'));
    
    // Folder selection - add event listeners for default folders too
    document.querySelectorAll('#folders .folder, #user-folders .folder').forEach(folder => {
      folder.addEventListener('click', (e) => this.selectFolder(e.currentTarget.dataset.folder));
    });
    
    // File attachment
    document.getElementById('fileAttachment').addEventListener('change', (e) => this.handleFileSelect(e));
  }
  
  /**
   * Load saved prompts from storage
   */
  async loadPrompts() {
    try {
      const result = await new Promise(resolve => {
        chrome.storage.local.get('prompts', resolve);
      });
      
      this.prompts = result.prompts || [];
      
      // Add necessary properties to existing prompts if they don't have them
      this.prompts = this.prompts.map(prompt => ({
        ...prompt,
        folder: prompt.folder || 'none',
        favorite: prompt.favorite || false,
        createdAt: prompt.createdAt || new Date().toISOString(),
        lastModified: prompt.lastModified || new Date().toISOString()
      }));
      
      console.log('Loaded prompts:', this.prompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
      this.showNotification('Error loading prompts', 'error');
    }
  }
  
  /**
   * Load saved folders from storage
   */
  async loadFolders() {
    try {
      const result = await new Promise(resolve => {
        chrome.storage.local.get('folders', resolve);
      });
      
      this.folders = result.folders || [];
      console.log('Loaded folders:', this.folders);
    } catch (error) {
      console.error('Error loading folders:', error);
      this.showNotification('Error loading folders', 'error');
    }
  }
  
  /**
   * Save prompts to storage
   */
  async savePrompts() {
    try {
      await new Promise(resolve => {
        chrome.storage.local.set({ prompts: this.prompts }, resolve);
      });
      console.log('Saved prompts:', this.prompts);
    } catch (error) {
      console.error('Error saving prompts:', error);
      this.showNotification('Error saving prompts', 'error');
    }
  }
  
  /**
   * Save folders to storage
   */
  async saveFolders() {
    try {
      await new Promise(resolve => {
        chrome.storage.local.set({ folders: this.folders }, resolve);
      });
      console.log('Saved folders:', this.folders);
    } catch (error) {
      console.error('Error saving folders:', error);
      this.showNotification('Error saving folders', 'error');
    }
  }
  
  /**
   * Render the prompt grid with cards
   */
  renderPromptGrid() {
    const promptGrid = document.getElementById('promptGrid');
    promptGrid.innerHTML = '';
    
    let filteredPrompts = [...this.prompts]; // Create a copy to avoid modifying original array
    
    // Filter prompts based on current folder
    if (this.currentFolder === 'favorites') {
      filteredPrompts = filteredPrompts.filter(prompt => prompt.favorite);
    } else if (this.currentFolder === 'recent') {
      // Sort by last modified and take most recent 10
      filteredPrompts.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      filteredPrompts = filteredPrompts.slice(0, 10);
    } else if (this.currentFolder !== 'all') {
      // Filter by folder name
      filteredPrompts = filteredPrompts.filter(prompt => prompt.folder === this.currentFolder);
    }
    
    // Sort prompts by last modified date for consistent ordering
    filteredPrompts.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    // Check for search filter
    const searchTerm = document.getElementById('searchPrompts').value.toLowerCase();
    if (searchTerm) {
      filteredPrompts = filteredPrompts.filter(prompt => {
        return (
          prompt.title.toLowerCase().includes(searchTerm) ||
          prompt.text.toLowerCase().includes(searchTerm) ||
          (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      });
    }
    
    console.log('Rendering prompts for folder:', this.currentFolder, 'count:', filteredPrompts.length);
    
    // Render each prompt card
    filteredPrompts.forEach(prompt => {
      const card = document.createElement('div');
      card.className = 'prompt-card';
      card.dataset.id = prompt.id;
      
      // Create favorite indicator if favorited
      const favoriteIndicator = prompt.favorite ? '<span style="position: absolute; top: 8px; left: 8px; color: gold;">⭐</span>' : '';
      
      // Get first 100 characters of prompt text
      const previewText = prompt.text.length > 100 ? 
        prompt.text.substring(0, 100) + '...' : 
        prompt.text;
        
      // Format the date to be more readable
      const date = new Date(prompt.lastModified);
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Create tags HTML
      let tagsHtml = '';
      if (prompt.tags && prompt.tags.length > 0) {
        const tagsToShow = prompt.tags.slice(0, 2); // Show max 2 tags
        tagsHtml = tagsToShow.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // If there are more tags, add a +N indicator
        if (prompt.tags.length > 2) {
          tagsHtml += `<span class="tag">+${prompt.tags.length - 2}</span>`;
        }
      }
      
      // Create file attachments indicator
      const hasAttachments = prompt.attachments && prompt.attachments.length > 0;
      const attachmentIndicator = hasAttachments ? 
        `<span style="margin-left: 5px;">📎${prompt.attachments.length}</span>` : 
        '';
      
      card.innerHTML = `
        ${favoriteIndicator}
        <div class="prompt-actions">
          <button class="action-button" data-action="edit" title="Edit">✏️</button>
          <button class="action-button delete-button" data-action="delete" title="Delete">🗑️</button>
        </div>
        <div class="card-title">${prompt.title}</div>
        <div class="card-content">${previewText}</div>
        <div class="card-footer">
          <div class="card-tags">
            ${tagsHtml}
          </div>
          <div style="display: flex; align-items: center;">
            ${formattedDate}
            ${attachmentIndicator}
          </div>
        </div>
      `;
      
      // Add click event to view the prompt
      card.addEventListener('click', (e) => {
        // Don't trigger view if clicking an action button
        if (e.target.closest('.action-button')) return;
        this.viewPrompt(prompt.id);
      });
      
      // Add click events for action buttons
      const editBtn = card.querySelector('[data-action="edit"]');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editPrompt(prompt.id);
        });
      }
      
      const deleteBtn = card.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.currentPromptId = prompt.id;
          this.showDeleteModal();
        });
      }
      
      promptGrid.appendChild(card);
    });
    
    this.updateEmptyState();
  }
  
  /**
   * Render user folders
   */
  renderFolders() {
    const folderContainer = document.getElementById('user-folders');
    folderContainer.innerHTML = '';
    
    // Sort folders alphabetically
    const sortedFolders = [...this.folders].sort((a, b) => a.name.localeCompare(b.name));
    
    // First remove old event listeners from default folders
    document.querySelectorAll('#folders .folder').forEach(folder => {
      const newFolder = folder.cloneNode(true);
      folder.parentNode.replaceChild(newFolder, folder);
      newFolder.addEventListener('click', () => this.selectFolder(newFolder.dataset.folder));
    });
    
    // Add user folders
    sortedFolders.forEach(folder => {
      const folderElement = document.createElement('div');
      folderElement.className = `folder ${this.currentFolder === folder.id ? 'active' : ''}`;
      folderElement.dataset.folder = folder.id;
      folderElement.innerHTML = `
        <span class="folder-icon">📁</span> ${folder.name}
      `;
      
      folderElement.addEventListener('click', () => this.selectFolder(folder.id));
      folderContainer.appendChild(folderElement);
    });
    
    // Update folder dropdown in prompt modal
    const folderSelect = document.getElementById('promptFolder');
    
    // Save the currently selected option to restore it later
    const selectedValue = folderSelect.value;
    
    // Clear all options except the "None" option
    while (folderSelect.options.length > 1) {
      folderSelect.remove(1);
    }
    
    // Add options for each folder
    sortedFolders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.name;
      folderSelect.appendChild(option);
    });
    
    // Restore the previously selected value if it exists in the new options
    if (selectedValue && [...folderSelect.options].some(opt => opt.value === selectedValue)) {
      folderSelect.value = selectedValue;
    }
  }
  
  /**
   * Show/hide empty state message
   */
  updateEmptyState() {
    const promptGrid = document.getElementById('promptGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (promptGrid.children.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }
  }
  
  /**
   * Select a folder to view
   */
  selectFolder(folderId) {
    console.log('Selecting folder:', folderId);
    this.currentFolder = folderId;
    
    // Update active class on all folders (both default and user folders)
    document.querySelectorAll('#folders .folder, #user-folders .folder').forEach(folder => {
      folder.classList.toggle('active', folder.dataset.folder === folderId);
    });
    
    // Re-render the prompt grid with the selected folder
    this.renderPromptGrid();
    this.updateEmptyState();
  }
  
  /**
   * Show the prompt creation modal
   */
  showPromptModal(promptId = null) {
    this.attachments = [];
    document.getElementById('attachmentList').innerHTML = '';
    
    const modal = document.getElementById('promptModal');
    const modalTitle = document.getElementById('modalTitle');
    const promptTitleInput = document.getElementById('promptTitle');
    const promptTextInput = document.getElementById('promptText');
    const promptTagsInput = document.getElementById('promptTags');
    const promptFolderSelect = document.getElementById('promptFolder');
    
    if (promptId) {
      // Edit existing prompt
      this.currentPromptId = promptId;
      const prompt = this.prompts.find(p => p.id === promptId);
      
      if (prompt) {
        modalTitle.textContent = 'Edit Prompt';
        promptTitleInput.value = prompt.title;
        promptTextInput.value = prompt.text;
        promptTagsInput.value = prompt.tags ? prompt.tags.join(', ') : '';
        promptFolderSelect.value = prompt.folder || 'none';
        
        // Load attachments
        if (prompt.attachments && prompt.attachments.length > 0) {
          this.attachments = [...prompt.attachments];
          this.renderAttachmentList();
        }
      }
    } else {
      // Create new prompt
      this.currentPromptId = null;
      modalTitle.textContent = 'Create New Prompt';
      promptTitleInput.value = '';
      promptTextInput.value = '';
      promptTagsInput.value = '';
      promptFolderSelect.value = 'none';
    }
    
    modal.style.display = 'block';
    promptTitleInput.focus();
  }
  
  /**
   * Show the folder creation modal
   */
  showFolderModal() {
    document.getElementById('folderName').value = '';
    document.getElementById('folderModal').style.display = 'block';
    document.getElementById('folderName').focus();
  }
  
  /**
   * Show delete confirmation modal
   */
  showDeleteModal() {
    document.getElementById('deleteModal').style.display = 'block';
  }
  
  /**
   * Close a modal dialog
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Clear any input fields to prevent data bleeding between sessions
    if (modalId === 'promptModal') {
      document.getElementById('promptTitle').value = '';
      document.getElementById('promptText').value = '';
      document.getElementById('promptTags').value = '';
      document.getElementById('promptFolder').value = 'none';
      document.getElementById('attachmentList').innerHTML = '';
      this.attachments = [];
    } else if (modalId === 'folderModal') {
      document.getElementById('folderName').value = '';
    }
  }
  
  /**
   * Handle file selection for attachments
   */
  handleFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showNotification(`File ${file.name} is too large (max 5 MB)`, 'error');
        continue;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64Content = e.target.result.split(',')[1]; // Remove data URL prefix
        
        this.attachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: base64Content
        });
        
        this.renderAttachmentList();
      };
      
      reader.onerror = () => {
        this.showNotification(`Error reading file ${file.name}`, 'error');
      };
      
      reader.readAsDataURL(file);
    }
    
    // Reset file input to allow selecting the same file again
    event.target.value = '';
  }
  
  /**
   * Render the list of file attachments
   */
  renderAttachmentList() {
    const attachmentList = document.getElementById('attachmentList');
    attachmentList.innerHTML = '';
    
    this.attachments.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-attachment';
      fileItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <button class="action-button delete-button" data-index="${index}">×</button>
      `;
      
      const deleteBtn = fileItem.querySelector('.delete-button');
      deleteBtn.addEventListener('click', () => {
        this.attachments.splice(index, 1);
        this.renderAttachmentList();
      });
      
      attachmentList.appendChild(fileItem);
    });
  }
  
  /**
   * Save a folder
   */
  async saveFolder() {
    const folderNameInput = document.getElementById('folderName');
    const folderName = folderNameInput.value.trim();
    
    if (!folderName) {
      this.showNotification('Folder name cannot be empty', 'error');
      return;
    }
    
    // Check for duplicate folder names
    if (this.folders.some(folder => folder.name.toLowerCase() === folderName.toLowerCase())) {
      this.showNotification('A folder with this name already exists', 'error');
      return;
    }
    
    // Create a new folder
    const newFolder = {
      id: 'folder_' + Date.now(),
      name: folderName,
      createdAt: new Date().toISOString()
    };
    
    // Add to folders array
    this.folders.push(newFolder);
    
    // Save to storage
    await this.saveFolders();
    
    // Close modal and clear input
    this.closeModal('folderModal');
    
    // Re-render folders and switch to the new folder
    await this.renderFolders();
    this.selectFolder(newFolder.id);
    
    this.showNotification('Folder created successfully');
  }
  
  /**
   * Save a prompt
   */
  async savePrompt() {
    const titleInput = document.getElementById('promptTitle');
    const textInput = document.getElementById('promptText');
    const tagsInput = document.getElementById('promptTags');
    const folderSelect = document.getElementById('promptFolder');
    
    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    const tagsText = tagsInput.value.trim();
    const folderId = folderSelect.value;
    
    if (!title) {
      this.showNotification('Title cannot be empty', 'error');
      return;
    }
    
    if (!text) {
      this.showNotification('Prompt text cannot be empty', 'error');
      return;
    }
    
    // Parse tags
    const tags = tagsText ? 
      tagsText.split(',').map(tag => tag.trim()).filter(tag => tag) : 
      [];
    
    const now = new Date().toISOString();
    
    if (this.currentPromptId) {
      // Update existing prompt
      const promptIndex = this.prompts.findIndex(p => p.id === this.currentPromptId);
      
      if (promptIndex !== -1) {
        this.prompts[promptIndex] = {
          ...this.prompts[promptIndex],
          title,
          text,
          tags,
          folder: folderId,
          attachments: [...this.attachments],
          lastModified: now
        };
      }
    } else {
      // Create new prompt
      const newPrompt = {
        id: 'prompt_' + Date.now(),
        title,
        text,
        tags,
        folder: folderId,
        attachments: [...this.attachments],
        favorite: false,
        createdAt: now,
        lastModified: now
      };
      
      this.prompts.push(newPrompt);
    }
    
    // Save to storage
    await this.savePrompts();
    
    // Close modal and clear inputs
    this.closeModal('promptModal');
    
    // Re-render the grid and make sure we're showing the right folder
    if (this.currentFolder === 'all' || 
        this.currentFolder === 'recent' || 
        (this.currentPromptId && this.currentFolder === folderId)) {
      this.renderPromptGrid();
    } else {
      // If we're in a different folder, switch to "all" to show the new prompt
      this.selectFolder('all');
    }
    
    this.showNotification(this.currentPromptId ? 'Prompt updated successfully' : 'Prompt created successfully');
    this.currentPromptId = null;
  }
  
  /**
   * View a prompt
   */
  viewPrompt(promptId) {
    const prompt = this.prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    this.currentPromptId = promptId;
    
    const viewTitle = document.getElementById('viewPromptTitle');
    const viewTags = document.getElementById('viewPromptTags');
    const viewText = document.getElementById('viewPromptText');
    const viewAttachments = document.getElementById('viewAttachments');
    const favoriteBtn = document.getElementById('favoritePromptBtn');
    
    viewTitle.textContent = prompt.title;
    viewText.textContent = prompt.text;
    
    // Update favorite button
    favoriteBtn.textContent = prompt.favorite ? '✩ Unfavorite' : '⭐ Favorite';
    
    // Render tags
    viewTags.innerHTML = '';
    if (prompt.tags && prompt.tags.length > 0) {
      prompt.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tag;
        viewTags.appendChild(tagSpan);
      });
    }
    
    // Render attachments
    viewAttachments.innerHTML = '';
    if (prompt.attachments && prompt.attachments.length > 0) {
      const attachmentsTitle = document.createElement('h4');
      attachmentsTitle.textContent = 'Attachments:';
      viewAttachments.appendChild(attachmentsTitle);
      
      prompt.attachments.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-attachment';
        fileItem.innerHTML = `
          <span class="file-name">${file.name}</span>
        `;
        viewAttachments.appendChild(fileItem);
      });
    }
    
    document.getElementById('viewPromptModal').style.display = 'block';
  }
  
  /**
   * Edit a prompt
   */
  editPrompt(promptId = null) {
    promptId = promptId || this.currentPromptId;
    if (!promptId) return;
    
    this.closeModal('viewPromptModal');
    this.showPromptModal(promptId);
  }
  
  /**
   * Delete a prompt
   */
  async deletePrompt() {
    if (!this.currentPromptId) return;
    
    this.prompts = this.prompts.filter(p => p.id !== this.currentPromptId);
    await this.savePrompts();
    
    this.closeModal('deleteModal');
    this.closeModal('viewPromptModal');
    this.renderPromptGrid();
    
    this.showNotification('Prompt deleted successfully');
  }
  
  /**
   * Toggle favorite status of a prompt
   */
  async toggleFavorite() {
    if (!this.currentPromptId) return;
    
    const promptIndex = this.prompts.findIndex(p => p.id === this.currentPromptId);
    if (promptIndex === -1) return;
    
    this.prompts[promptIndex].favorite = !this.prompts[promptIndex].favorite;
    await this.savePrompts();
    
    // Update favorite button text
    const favoriteBtn = document.getElementById('favoritePromptBtn');
    favoriteBtn.textContent = this.prompts[promptIndex].favorite ? 
      '✩ Unfavorite' : 
      '⭐ Favorite';
    
    this.renderPromptGrid();
    this.showNotification(
      this.prompts[promptIndex].favorite ? 
      'Added to favorites' : 
      'Removed from favorites'
    );
  }
  
  /**
   * Copy prompt text to clipboard
   */
  copyPromptText() {
    if (!this.currentPromptId) return;
    
    const prompt = this.prompts.find(p => p.id === this.currentPromptId);
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt.text)
      .then(() => {
        this.showNotification('Prompt text copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
        this.showNotification('Failed to copy text', 'error');
      });
  }
  
  /**
   * Filter prompts based on search input
   */
  filterPrompts(searchTerm) {
    // Just re-render with the search term applied
    this.renderPromptGrid();
  }
  
  /**
   * Import prompt to AI chat
   */
  async importPrompt() {
    if (!this.currentPromptId) return;
    
    const prompt = this.prompts.find(p => p.id === this.currentPromptId);
    if (!prompt) return;
    
    try {
      // Find ChatGPT tabs first
      const chatGptTabs = await new Promise(resolve => {
        chrome.tabs.query({
          url: [
            '*://chat.openai.com/*',
            '*://chatgpt.com/*'
          ]
        }, resolve);
      });
      
      // If no ChatGPT tabs found, try other supported platforms
      if (chatGptTabs.length === 0) {
        const otherTabs = await new Promise(resolve => {
          chrome.tabs.query({
            url: [
              '*://claude.ai/*',
              '*://grok.x.ai/*'
            ]
          }, resolve);
        });
        
        if (otherTabs.length === 0) {
          this.showNotification('No compatible AI chat tabs found. Please open ChatGPT, Claude, or Grok in a new tab.', 'error');
          return;
        }
        
        // Sort by most recently active
        otherTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
        const targetTab = otherTabs[0];
        
        // Determine platform for better user feedback
        const platform = targetTab.url.includes('claude.ai') ? 'Claude' : 'Grok';
        
        // Send message to the content script
        this.sendMessageToTab(targetTab, prompt, platform);
        return;
      }
      
      // Prefer ChatGPT as it's our focus
      const targetTab = chatGptTabs[0];
      this.sendMessageToTab(targetTab, prompt, 'ChatGPT');
    } catch (error) {
      console.error('Error importing prompt:', error);
      this.showNotification('Error importing prompt', 'error');
    }
  }
  
  /**
   * Send a message to a tab to insert a prompt
   */
  sendMessageToTab(tab, prompt, platformName) {
    console.log(`Sending prompt to ${platformName} tab:`, tab.id);
    
    // Prepare full text in case of attachments
    let fullText = prompt.text;
    const hasAttachments = prompt.attachments && prompt.attachments.length > 0;
    
    // Send message to the content script
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'insertPrompt',
        prompt: fullText,
        attachments: prompt.attachments || []
      },
      response => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
          this.showNotification(`Error communicating with ${platformName} tab. Try refreshing the page.`, 'error');
          return;
        }
        
        console.log('Import response:', response);
        
        if (response && response.success) {
          const successMsg = hasAttachments 
            ? `Prompt with attachments inserted into ${platformName}` 
            : `Prompt inserted into ${platformName}`;
          
          this.showNotification(successMsg);
          
          // Track the import in the prompt data
          const promptIndex = this.prompts.findIndex(p => p.id === prompt.id);
          if (promptIndex !== -1) {
            this.prompts[promptIndex].lastModified = new Date().toISOString();
            this.savePrompts();
          }
          
          // Switch to the target tab
          chrome.tabs.update(tab.id, { active: true });
        } else {
          const errorMsg = response ? response.message : 'Unknown error';
          this.showNotification(`Import failed: ${errorMsg}`, 'error');
        }
      }
    );
  }
  
  /**
   * Show a notification
   */
  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
    notification.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
}

// Initialize the Promptr when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Promptr();
});