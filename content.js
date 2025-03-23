/**
 * Promptr - Content Script
 * Handles inserting prompts into AI chat interfaces
 */

console.log('Promptr content script loaded.');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  
  if (message.action === 'insertPrompt') {
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
    
    let result;
    if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
      result = insertPromptChatGPT(message.prompt, message.attachments);
    } else {
      result = { success: false, message: 'Please navigate to ChatGPT' };
    }
    
    console.log('Sending response:', result);
    sendResponse(result);
  }
  return true;
});

/**
 * Decode base64 content to text
 */
function decodeBase64Content(base64Content, fileType) {
  try {
    // Special handling for PDF files - we can't display them directly
    if (fileType === 'application/pdf' || fileType.includes('pdf')) {
      console.log('PDF file detected, adding placeholder text');
      return `\n[PDF: View ${fileType} content in original file - ChatGPT free version doesn't support PDF uploads]`;
    }
    
    // Make sure we have content to decode
    if (!base64Content) {
      console.error('No content to decode');
      return '[Empty file content]';
    }
    
    // For text files, decode from base64 to text
    const raw = atob(base64Content);
    const array = new Uint8Array(raw.length);
    
    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i);
    }
    
    // Return decoded text
    const decodedText = new TextDecoder().decode(array);
    
    // Truncate very long files to prevent UI issues
    const maxLength = 10000; // Adjust as needed
    if (decodedText.length > maxLength) {
      return decodedText.substring(0, maxLength) + 
        `\n\n[...Content truncated, full file is ${decodedText.length} characters...]`;
    }
    
    return decodedText;
  } catch (error) {
    console.error('Error decoding base64 content:', error);
    return '[Error decoding file content - file may be binary or corrupted]';
  }
}

/**
 * Insert prompt into ChatGPT interface
 */
function insertPromptChatGPT(promptText, attachments = []) {
  try {
    console.log('Trying to insert into ChatGPT...', promptText.substring(0, 100) + '...');
    
    // Find the contenteditable div
    const editor = 
      document.querySelector('#prompt-textarea[contenteditable="true"]') ||
      document.querySelector('div.ProseMirror[contenteditable="true"]') ||
      document.querySelector('div[contenteditable="true"]');
    
    if (!editor) {
      console.error('Could not find ChatGPT input field');
      return { 
        success: false, 
        message: 'ChatGPT input field not found. Try refreshing the page.' 
      };
    }
    
    console.log('Found ChatGPT input field:', editor);
    
    // Build the full text
    let fullText = promptText;
    if (attachments && attachments.length > 0) {
      fullText += '\n\nAttached Content:';
      attachments.forEach(file => {
        const decodedContent = decodeBase64Content(file.content, file.type);
        fullText += `\n--- ${file.name} ---\n${decodedContent}`;
      });
    }
    
    // Method 1: Set content and dispatch events
    editor.innerHTML = ''; // Clear existing content
    editor.textContent = fullText;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Method 2: If Method 1 doesn't work, try simulating paste
    if (!editor.textContent) {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', fullText);
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true
      });
      editor.dispatchEvent(pasteEvent);
    }
    
    // Focus the editor
    editor.focus();
    
    // Visual feedback
    const originalBorder = editor.style.border;
    editor.style.border = '2px solid #10a37f';
    setTimeout(() => {
      editor.style.border = originalBorder;
    }, 500);
    
    console.log('Successfully inserted prompt text into ChatGPT');
    return { success: true, message: 'Prompt inserted into ChatGPT' };
  } catch (error) {
    console.error('Error inserting prompt into ChatGPT:', error);
    return { 
      success: false, 
      message: `Error inserting prompt: ${error.message}` 
    };
  }
}

/**
 * Find file input in ChatGPT interface
 */
function findFileInput() {
  // Try various selectors to find the file input
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) return fileInput;
  
  // Look for upload buttons and see if they have an associated input
  const uploadButtons = [
    ...document.querySelectorAll('button[aria-label*="upload"]'),
    ...document.querySelectorAll('button[aria-label*="attach"]'),
    ...document.querySelectorAll('button[aria-label*="file"]')
  ];
  
  for (const button of uploadButtons) {
    // Check if the button has an input field as a child or sibling
    const input = button.querySelector('input[type="file"]') || 
                 button.parentElement.querySelector('input[type="file"]');
    
    if (input) return input;
    
    // Simulate clicking the button to see if it reveals an input
    try {
      button.click();
      // Check again for file inputs
      const newInput = document.querySelector('input[type="file"]');
      if (newInput) return newInput;
    } catch (e) {
      console.error('Error clicking upload button:', e);
    }
  }
  
  return null;
}

/**
 * Convert base64 to File object
 */
function base64ToFile(base64String, filename, mimeType) {
  return new Promise((resolve, reject) => {
    try {
      // Convert base64 string to binary data
      const byteString = atob(base64String);
      
      // Create a buffer array
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Fill the buffer with the binary data
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      
      // Create a Blob from the buffer
      const blob = new Blob([arrayBuffer], { type: mimeType });
      
      // Create a File from the Blob
      const file = new File([blob], filename, { type: mimeType });
      
      resolve(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Insert prompt into Claude interface
 */
function insertPromptClaude(promptText, attachments = []) {
  try {
    console.log('Trying to insert into Claude...');
    
    // Find the input field - try multiple potential selectors for Claude's interface
    const editor = 
      document.querySelector('[role="textbox"][contenteditable="true"]') ||
      document.querySelector('.claude-input div[contenteditable="true"]') ||
      document.querySelector('.claude-input .ql-editor') ||
      document.querySelector('.ProseMirror[contenteditable="true"]') ||
      document.querySelector('[contenteditable="true"]');
    
    if (!editor) {
      console.error('Could not find Claude input field');
      return { 
        success: false, 
        message: 'Could not find Claude input field. Try refreshing the page.' 
      };
    }
    
    console.log('Found Claude input field:', editor);
    
    // First insert the prompt text
    // Clear existing content
    editor.innerHTML = '';
    
    // Create a paragraph for the prompt text
    const p = document.createElement('p');
    p.textContent = promptText;
    editor.appendChild(p);
    
    // Dispatch events to make Claude recognize the changes
    editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
    
    // Check for file attachments
    if (attachments && attachments.length > 0) {
      const pdfAttachments = attachments.filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      
      const textAttachments = attachments.filter(file => 
        !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
      );
      
      // Handle PDF files by trying to use the actual file upload functionality
      if (pdfAttachments.length > 0) {
        console.log('PDF attachments detected, attempting to trigger file upload');
        
        // Find the file upload button/input
        const fileInput = findFileInput();
        
        if (fileInput) {
          console.log('Found file input:', fileInput);
          
          // Create a notification that we're attempting to upload files
          const notification = document.createElement('div');
          notification.style.position = 'fixed';
          notification.style.top = '10px';
          notification.style.left = '50%';
          notification.style.transform = 'translateX(-50%)';
          notification.style.backgroundColor = '#4a6cf7';
          notification.style.color = 'white';
          notification.style.padding = '10px 20px';
          notification.style.borderRadius = '4px';
          notification.style.zIndex = '10000';
          notification.textContent = 'Promptr is attempting to upload PDF files...';
          document.body.appendChild(notification);
          
          // Attempt to trigger the file upload
          try {
            // For each PDF file, convert from base64 to actual File object
            const filePromises = pdfAttachments.map(attachment => {
              return base64ToFile(attachment.content, attachment.name, attachment.type);
            });
            
            Promise.all(filePromises).then(files => {
              // Create a FileList-like object
              const fileListObj = {
                length: files.length,
                item: index => files[index],
                [Symbol.iterator]: function* () {
                  for (let i = 0; i < files.length; i++) {
                    yield files[i];
                  }
                }
              };
              for (let i = 0; i < files.length; i++) {
                fileListObj[i] = files[i];
              }
              
              // Attach files to the input and dispatch change event
              Object.defineProperty(fileInput, 'files', {
                value: fileListObj,
                writable: false
              });
              
              fileInput.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Visual feedback
              setTimeout(() => {
                notification.textContent = 'PDF files uploaded successfully!';
                notification.style.backgroundColor = '#4caf50';
                
                setTimeout(() => {
                  notification.remove();
                }, 3000);
              }, 1500);
            }).catch(err => {
              console.error('Error creating files from base64:', err);
              notification.textContent = 'Error uploading PDFs. Please upload manually.';
              notification.style.backgroundColor = '#f44336';
              
              setTimeout(() => {
                notification.remove();
              }, 3000);
            });
          } catch (err) {
            console.error('Error uploading files:', err);
            notification.textContent = 'Error uploading PDFs. Please upload manually.';
            notification.style.backgroundColor = '#f44336';
            
            setTimeout(() => {
              notification.remove();
            }, 3000);
          }
        } else {
          console.log('Could not find file input, adding note about file upload');
          // Add a note that files need to be uploaded manually
          const noteP = document.createElement('p');
          noteP.textContent = '[Note: PDF files need to be uploaded manually using the file upload button]';
          editor.appendChild(noteP);
          editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
      }
      
      // Append text file contents to the prompt if there are any
      if (textAttachments.length > 0) {
        // Add a heading for attachments
        const attachmentsHeading = document.createElement('p');
        attachmentsHeading.textContent = 'Attached Files:';
        editor.appendChild(attachmentsHeading);
        
        // Add the content of each text file
        textAttachments.forEach(file => {
          const decodedContent = decodeBase64Content(file.content, file.type);
          
          const fileNameP = document.createElement('p');
          fileNameP.innerHTML = `<strong>--- ${file.name} ---</strong>`;
          editor.appendChild(fileNameP);
          
          const contentP = document.createElement('p');
          
          // Handle newlines in content
          const lines = decodedContent.split('\n');
          
          lines.forEach((line, index) => {
            contentP.appendChild(document.createTextNode(line));
            
            // Add line break except after the last line
            if (index < lines.length - 1) {
              contentP.appendChild(document.createElement('br'));
            }
          });
          
          editor.appendChild(contentP);
          editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
        });
      }
    }
    
    // Focus the editor
    editor.focus();
    
    // Give visual feedback
    const originalBorder = editor.style.boxShadow;
    editor.style.boxShadow = '0 0 0 2px #4a6cf7';
    setTimeout(() => {
      editor.style.boxShadow = originalBorder;
    }, 500);
    
    return { success: true, message: 'Prompt inserted into Claude' };
  } catch (error) {
    console.error('Error inserting prompt into Claude:', error);
    return { 
      success: false, 
      message: `Error inserting prompt: ${error.message}` 
    };
  }
}

/**
 * Insert prompt into Grok interface
 */
function insertPromptGrok(promptText, attachments = []) {
  try {
    console.log('Trying to insert into Grok...');
    
    // Try multiple selectors to find the input area
    const textarea = 
      document.querySelector('textarea[placeholder*="message"]') || 
      document.querySelector('textarea') || 
      document.querySelector('[contenteditable="true"]') ||
      document.querySelector('.chat-input');
    
    if (!textarea) {
      console.error('Could not find Grok input field');
      return { 
        success: false, 
        message: 'Could not find Grok input field. Try refreshing the page.' 
      };
    }
    
    console.log('Found Grok input field:', textarea);
    
    // First insert just the prompt text
    if (textarea.tagName.toLowerCase() === 'textarea') {
      // Regular textarea
      textarea.value = promptText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // For contenteditable divs
      textarea.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = promptText;
      textarea.appendChild(p);
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
    
    // Check for file attachments
    if (attachments && attachments.length > 0) {
      const pdfAttachments = attachments.filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      
      const textAttachments = attachments.filter(file => 
        !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
      );
      
      // Handle PDF files by trying to use the actual file upload functionality
      if (pdfAttachments.length > 0) {
        console.log('PDF attachments detected, attempting to trigger file upload');
        
        // Find the file upload button/input
        const fileInput = findFileInput();
        
        if (fileInput) {
          console.log('Found file input:', fileInput);
          
          // Create a notification that we're attempting to upload files
          const notification = document.createElement('div');
          notification.style.position = 'fixed';
          notification.style.top = '10px';
          notification.style.left = '50%';
          notification.style.transform = 'translateX(-50%)';
          notification.style.backgroundColor = '#4a6cf7';
          notification.style.color = 'white';
          notification.style.padding = '10px 20px';
          notification.style.borderRadius = '4px';
          notification.style.zIndex = '10000';
          notification.textContent = 'Promptr is attempting to upload PDF files...';
          document.body.appendChild(notification);
          
          // Attempt to trigger the file upload
          try {
            // For each PDF file, convert from base64 to actual File object
            const filePromises = pdfAttachments.map(attachment => {
              return base64ToFile(attachment.content, attachment.name, attachment.type);
            });
            
            Promise.all(filePromises).then(files => {
              // Create a FileList-like object
              const fileListObj = {
                length: files.length,
                item: index => files[index],
                [Symbol.iterator]: function* () {
                  for (let i = 0; i < files.length; i++) {
                    yield files[i];
                  }
                }
              };
              for (let i = 0; i < files.length; i++) {
                fileListObj[i] = files[i];
              }
              
              // Attach files to the input and dispatch change event
              Object.defineProperty(fileInput, 'files', {
                value: fileListObj,
                writable: false
              });
              
              fileInput.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Visual feedback
              setTimeout(() => {
                notification.textContent = 'PDF files uploaded successfully!';
                notification.style.backgroundColor = '#4caf50';
                
                setTimeout(() => {
                  notification.remove();
                }, 3000);
              }, 1500);
            }).catch(err => {
              console.error('Error creating files from base64:', err);
              notification.textContent = 'Error uploading PDFs. Please upload manually.';
              notification.style.backgroundColor = '#f44336';
              
              setTimeout(() => {
                notification.remove();
              }, 3000);
            });
          } catch (err) {
            console.error('Error uploading files:', err);
            notification.textContent = 'Error uploading PDFs. Please upload manually.';
            notification.style.backgroundColor = '#f44336';
            
            setTimeout(() => {
              notification.remove();
            }, 3000);
          }
        } else {
          console.log('Could not find file input, adding note about file upload');
          // Add a note that files need to be uploaded manually
          if (textarea.tagName.toLowerCase() === 'textarea') {
            textarea.value += '\n\n[Note: PDF files need to be uploaded manually using the file upload button]';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            const noteP = document.createElement('p');
            noteP.textContent = '[Note: PDF files need to be uploaded manually using the file upload button]';
            textarea.appendChild(noteP);
            textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
          }
        }
      }
      
      // Append text file contents to the prompt if there are any
      if (textAttachments.length > 0) {
        if (textarea.tagName.toLowerCase() === 'textarea') {
          // Regular textarea
          let fileContent = '\n\nAttached Files:';
          
          // Add the content of each text file
          textAttachments.forEach(file => {
            const decodedContent = decodeBase64Content(file.content, file.type);
            fileContent += `\n\n--- ${file.name} ---\n\n${decodedContent}`;
          });
          
          // Append to existing text and trigger events
          textarea.value += fileContent;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          // Contenteditable div
          const attachmentsHeading = document.createElement('p');
          attachmentsHeading.textContent = 'Attached Files:';
          textarea.appendChild(attachmentsHeading);
          
          // Add the content of each text file
          textAttachments.forEach(file => {
            const decodedContent = decodeBase64Content(file.content, file.type);
            
            const fileNameP = document.createElement('p');
            fileNameP.innerHTML = `<strong>--- ${file.name} ---</strong>`;
            textarea.appendChild(fileNameP);
            
            const contentP = document.createElement('p');
            
            // Handle newlines in content
            const lines = decodedContent.split('\n');
            
            lines.forEach((line, index) => {
              contentP.appendChild(document.createTextNode(line));
              
              // Add line break except after the last line
              if (index < lines.length - 1) {
                contentP.appendChild(document.createElement('br'));
              }
            });
            
            textarea.appendChild(contentP);
          });
          
          textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
      }
    }
    
    // Focus the textarea
    textarea.focus();
    
    // Give visual feedback
    const originalBorder = textarea.style.borderColor;
    textarea.style.borderColor = '#4a6cf7';
    setTimeout(() => {
      textarea.style.borderColor = originalBorder;
    }, 500);
    
    return { success: true, message: 'Prompt inserted into Grok' };
  } catch (error) {
    console.error('Error inserting prompt into Grok:', error);
    return { 
      success: false, 
      message: `Error inserting prompt: ${error.message}` 
    };
  }
} 