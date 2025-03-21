# PromptVault Chrome Extension

A Chrome extension that allows users to save, manage, and reuse prompts for AI chat platforms like ChatGPT, Claude, and Grok, with attached context files.

## Features

- **Prompt Storage**: Save and organize your prompts in a clean sidebar interface
- **Context Support**: Attach files (PDFs, text files, etc.) to prompts
- **Tabbed Interface**: Easily switch between Library, Detail, Import, and Settings
- **Expandable Sidebar**: Toggle between compact and expanded view
- **File Attachments**: Directly add context files to your prompts
- **Import Functionality**: One-click to import prompts into AI chat platforms
- **Copy to Clipboard**: Easily copy prompt text to use in other applications
- **Local Storage**: All prompts are stored locally in your browser
- **Modern UI**: Clean interface with light/dark mode support

## Installation

### From Source (Development)

1. Clone or download this repository to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The PromptVault extension should now appear in your Chrome toolbar

### Using the Extension as a Sidebar

1. After installation, click on the extension icon in your toolbar
2. The extension will open as a sidebar in your current tab
3. Use the toggle button in the header to expand or collapse the sidebar

### Icon Generation (Optional)

If you want to create custom icons:
1. Open the `icons/icon.html` file in your browser
2. Right-click each icon and save as PNG with the appropriate filename
3. Save the files in the `icons` directory

## Usage

### Creating Prompts

There are two ways to create prompts:

#### Method 1: From the Library Tab
1. In the Library tab, click the "New Prompt" button
2. Fill in the prompt details in the modal that appears:
   - Title: Name for your prompt
   - Tags: Comma-separated tags for organization
   - Prompt: The text of your prompt
   - Attachments: Optional files to attach as context
3. Click "Save Prompt"

#### Method 2: From the Import Tab
1. Navigate to the Import tab
2. Fill in the prompt details directly in the tab:
   - Title: Name for your prompt
   - Tags: Comma-separated tags for organization
   - Prompt: The text of your prompt
   - Attachments: Optional files to attach as context
3. Click "Save Prompt"

### Using Prompts

1. Navigate to a supported AI platform (ChatGPT, Claude, or Grok)
2. Click the PromptVault icon in your toolbar to open the sidebar
3. In the Library tab, find and click on the prompt you want to use
4. The prompt details will display in the Detail tab
5. Click "Import" to insert the prompt and its context into the chat interface
6. Click "Copy" to copy just the prompt text to your clipboard

### Managing Prompts

- **View**: Click on any prompt in the Library tab to view its details in the Detail tab
- **Edit**: With a prompt selected, click the "Edit" button to modify its content
- **Delete**: With a prompt selected, click the "Delete" button to remove it
- **Search**: Use the search bar at the top of the Library tab to filter your prompts

### Settings

Access the Settings tab to customize your experience:
- **Theme**: Choose between System Default, Light Mode, or Dark Mode
- **Font Size**: Adjust the text size for better readability
- **Default Import Action**: Set the default behavior when importing prompts

## Supported Platforms

- [ChatGPT](https://chat.openai.com)
- [Claude](https://claude.ai)
- [Grok](https://grok.x.ai)

## Example Use Case

1. Save a prompt like: "Generate a practice exam based on the context provided in these PDFs of my past exams"
2. Attach PDF files containing past exams
3. When you need to generate a new practice exam:
   - Visit ChatGPT/Claude/Grok
   - Open the PromptVault sidebar
   - Find and select your exam prompt
   - Click "Import" to insert it into the chat
   - The prompt and file contents will be inserted into the chat

## UI Layout

The extension features a modern tabbed sidebar layout:

- **Library Tab**: Lists all your saved prompts with search functionality
- **Detail Tab**: Shows the full details of the selected prompt
- **Import Tab**: Direct interface for creating new prompts
- **Settings Tab**: Customize the extension's appearance and behavior

## Privacy

All data is stored locally in your browser using Chrome's storage API. No data is sent to external servers.

## License

MIT #   p r o m p t E x  
 