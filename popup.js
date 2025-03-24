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
    this.viewMode = 'grid';
    this.gridSize = 3; // Number of items per row instead of pixel width
    this.sidebarCollapsed = false;
    
    this.init();
  }
  
  /**
   * Initialize the extension
   */
  async init() {
    await this.loadPrompts();
    await this.loadFolders();
    this.setupEventListeners();
    
    // Make sure to render prompts immediately
    this.renderFolders();
    this.renderPromptGrid();
    this.selectFolder('all');
    
    // Force immediate display of prompts by showing the "all" folder
    document.querySelectorAll('#folders .folder, #user-folders .folder').forEach(folder => {
      folder.classList.toggle('active', folder.dataset.folder === 'all');
    });
    
    // Make sure empty state is updated properly
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
    
    // Sidebar collapse/expand
    document.getElementById('sidebarCollapseBtn').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebarToggleBtn').addEventListener('click', () => this.toggleSidebar());
    
    // View toggle buttons
    document.getElementById('gridViewBtn').addEventListener('click', () => this.setViewMode('grid'));
    document.getElementById('listViewBtn').addEventListener('click', () => this.setViewMode('list'));
    
    // Grid size slider
    document.getElementById('gridSizeSlider').addEventListener('input', (e) => {
      this.gridSize = parseInt(e.target.value);
      this.updateGridSize();
    });
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
      
      // Immediately trigger a render after loading prompts
      if (this.prompts.length > 0) {
        this.renderPromptGrid();
      }
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
    const promptList = document.getElementById('promptList');
    
    // Clear both containers
    promptGrid.innerHTML = '';
    promptList.innerHTML = '';
    
    // Show/hide containers based on view mode
    if (this.viewMode === 'grid') {
      promptGrid.style.display = 'grid';
      promptList.style.display = 'none';
    } else {
      promptGrid.style.display = 'none';
      promptList.style.display = 'flex';
    }
    
    let filteredPrompts = [...this.prompts]; // Create a copy to avoid modifying original array
    
    // Filter by folder
    if (this.currentFolder !== 'all') {
      if (this.currentFolder === 'favorites') {
        filteredPrompts = filteredPrompts.filter(p => p.favorite);
      } else if (this.currentFolder === 'recent') {
        // Sort by last modified date and take the top 10
        filteredPrompts = [...filteredPrompts].sort((a, b) => {
          return new Date(b.lastModified || 0) - new Date(a.lastModified || 0);
        }).slice(0, 10);
      } else {
        filteredPrompts = filteredPrompts.filter(p => p.folder === this.currentFolder);
      }
    }
    
    // Sort by last modified date
    filteredPrompts.sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));
    
    // Apply search filter if there's a search term
    const searchTerm = document.getElementById('searchPrompts').value.toLowerCase().trim();
    if (searchTerm) {
      filteredPrompts = filteredPrompts.filter(prompt => {
        return (
          prompt.title.toLowerCase().includes(searchTerm) ||
          prompt.text.toLowerCase().includes(searchTerm) ||
          (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      });
    }
    
    // If no prompts to show, display empty state
    if (filteredPrompts.length === 0) {
      document.getElementById('emptyState').style.display = 'block';
      return;
    }
    
    document.getElementById('emptyState').style.display = 'none';
    
    // Render each prompt
    filteredPrompts.forEach(prompt => {
      // Create card for grid view
      const gridCard = this.createPromptCard(prompt, false);
      promptGrid.appendChild(gridCard);
      
      // Create card for list view
      const listCard = this.createPromptCard(prompt, true);
      promptList.appendChild(listCard);
    });
    
    // Check for text overflow and add ellipsis only when needed
    setTimeout(() => {
      // Add ellipsis to overflowing titles
      document.querySelectorAll('.card-title').forEach(title => {
        if (title.scrollWidth > title.clientWidth) {
          title.style.textOverflow = 'ellipsis';
          title.style.whiteSpace = 'nowrap';
        } else {
          title.style.textOverflow = 'clip';
          title.style.whiteSpace = 'normal';
        }
      });
      
      // Add ellipsis to overflowing content
      document.querySelectorAll('.card-content').forEach(content => {
        if (content.scrollHeight > content.clientHeight) {
          content.style.textOverflow = 'ellipsis';
        } else {
          content.style.textOverflow = 'clip';
        }
      });
      
      // Remove ellipsis from dates - they should wrap if needed
      document.querySelectorAll('.card-date').forEach(date => {
        date.style.textOverflow = 'clip';
        date.style.whiteSpace = 'normal';
      });
    }, 0);
  }
  
  /**
   * Create a prompt card element
   * @param {Object} prompt - The prompt data
   * @param {Boolean} isList - Whether this is for list view
   * @returns {HTMLElement} - The card element
   */
  createPromptCard(prompt, isList = false) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.dataset.id = prompt.id;
    
    // Format the date
    const date = new Date(prompt.lastModified || prompt.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: isList ? undefined : 'numeric' // Shorter date for list view
    });
    
    // Create title element with favorite indicator
    const title = document.createElement('div');
    title.className = 'card-title';
    if (prompt.favorite) {
      const star = document.createElement('span');
      star.innerHTML = '★ ';
      star.style.color = 'gold';
      title.appendChild(star);
    }
    const titleText = document.createTextNode(prompt.title);
    title.appendChild(titleText);
    
    // Create content element - don't truncate with ellipsis by default
    const content = document.createElement('div');
    content.className = 'card-content';
    content.textContent = prompt.text;
    
    // Create footer element
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    
    // Create tags container
    const tags = document.createElement('div');
    tags.className = 'card-tags';
    
    // Add tags if they exist - limit to 1 for list view
    if (prompt.tags && prompt.tags.length > 0) {
      const tagsToShow = isList ? prompt.tags.slice(0, 1) : prompt.tags.slice(0, 3);
      tagsToShow.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tags.appendChild(tagElement);
      });
      
      // Show +X more if there are more tags
      const remaining = prompt.tags.length - tagsToShow.length;
      if (remaining > 0) {
        const moreElement = document.createElement('span');
        moreElement.className = 'tag';
        moreElement.textContent = `+${remaining}`;
        tags.appendChild(moreElement);
      }
    }
    
    // Add date to footer
    const dateElement = document.createElement('div');
    dateElement.className = 'card-date';
    dateElement.textContent = formattedDate;
    
    // Add attachments indicator if there are files
    if (prompt.attachments && prompt.attachments.length > 0) {
      const attachmentIndicator = document.createElement('span');
      attachmentIndicator.innerHTML = ` 📎${prompt.attachments.length}`;
      dateElement.appendChild(attachmentIndicator);
    }
    
    footer.appendChild(tags);
    footer.appendChild(dateElement);
    
    // Create prompt actions
    const actions = document.createElement('div');
    actions.className = 'prompt-actions';
    
    // Favorite button
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'action-button favorite-btn';
    favoriteBtn.innerHTML = prompt.favorite ? '★' : '☆';
    favoriteBtn.title = prompt.favorite ? 'Remove from Favorites' : 'Add to Favorites';
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentPromptId = prompt.id;
      this.toggleFavorite();
    });
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-button edit-btn';
    editBtn.innerHTML = '<span class="material-icons">edit</span>';
    editBtn.title = 'Edit Prompt';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editPrompt(prompt.id);
    });
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-button delete-btn';
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
    deleteBtn.title = 'Delete Prompt';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentPromptId = prompt.id;
      this.showDeleteModal();
    });
    
    actions.appendChild(favoriteBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    // Add all elements to card
    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(footer);
    card.appendChild(actions);
    
    // Add click event to view the prompt
    card.addEventListener('click', () => this.viewPrompt(prompt.id));
    
    return card;
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
    
    // Ensure empty state is properly updated
    document.getElementById('emptyState').style.display = 
      document.querySelector('#promptGrid').children.length === 0 && 
      document.querySelector('#promptList').children.length === 0 ? 
      'block' : 'none';
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
    
    // Toggle favorite status
    this.prompts[promptIndex].favorite = !this.prompts[promptIndex].favorite;
    
    // Update lastModified
    this.prompts[promptIndex].lastModified = new Date().toISOString();
    
    // Save to storage
    await this.savePrompts();
    
    // Update UI if view modal is open
    const favoriteBtn = document.getElementById('favoritePromptBtn');
    if (favoriteBtn) {
      favoriteBtn.textContent = this.prompts[promptIndex].favorite ? 
        '✩ Unfavorite' : 
        '⭐ Favorite';
    }
    
    // Re-render the prompt grid to update the UI
    this.renderPromptGrid();
    
    // Show notification
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
  
  /**
   * Toggle sidebar visibility
   */
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    
    sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    sidebarToggleBtn.style.display = this.sidebarCollapsed ? 'flex' : 'none';
    
    // Add/remove class to body to adjust main content
    document.body.classList.toggle('sidebar-hidden', this.sidebarCollapsed);
    
    // Re-render the current view to ensure proper layout
    this.renderPromptGrid();
  }
  
  /**
   * Set the view mode (grid or list)
   */
  setViewMode(mode) {
    this.viewMode = mode;
    
    // Update button states
    document.getElementById('gridViewBtn').classList.toggle('active', mode === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', mode === 'list');
    
    // Re-render the prompt grid with the new view mode
    this.renderPromptGrid();
  }
  
  /**
   * Update the layout based on sidebar state and current view
   */
  updateLayout() {
    // We don't need to do anything special anymore - the CSS handles the grid columns
    // This is kept for future layout adjustments if needed
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.width = this.sidebarCollapsed ? '100%' : 'calc(100% - 260px)';
    }
  }
  
  /**
   * Update the grid size - this is now handled by CSS
   */
  updateGridSize() {
    // The grid sizing is now handled by CSS
  }
}

// Initialize the Promptr when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Promptr();
});