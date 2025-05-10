/**
 * Community tab module for handling community prompt-related functionality
 */

// Community prompts data structure
const communityPrompts = {
    marketing: [
        {
            title: "Content Marketing Strategy",
            content: "I'm launching a new [product type]. Create a comprehensive content marketing strategy for the next 3 months, including blog topics, social media posts, and email campaign ideas.",
            author: "Marketing Pro",
            category: "marketing"
        },
        {
            title: "Customer Demographics Analysis",
            content: "Analyze these customer demographics [insert data]. What are 5 unique value propositions we could use to target this audience for our [product/service]?",
            author: "Marketing Pro",
            category: "marketing"
        },
        {
            title: "Facebook Ad Story",
            content: "Write a compelling story-based Facebook ad (max 125 characters) for our [product], highlighting how it solves [specific problem].",
            author: "Social Media Expert",
            category: "marketing"
        },
        {
            title: "Twitter Engagement",
            content: "I need to improve our brand's Twitter engagement. Generate 10 tweet ideas that incorporate trending hashtags and our product [product name] without being overly promotional.",
            author: "Social Media Expert",
            category: "marketing"
        },
        {
            title: "Buyer Persona Development",
            content: "Create a detailed buyer persona for our ideal customer for [product/service], including demographics, psychographics, pain points, and preferred communication channels.",
            author: "Marketing Pro",
            category: "marketing"
        }
    ],
    business: [
        {
            title: "Competitive Analysis",
            content: "Analyze the competitive landscape for [your product/service] in [specific market]. Identify our top 3 competitors, their unique selling propositions, and suggest strategies to differentiate our offering.",
            author: "Business Strategist",
            category: "business"
        },
        {
            title: "SWOT Analysis",
            content: "Create a detailed SWOT analysis for my [business type] in the current economic climate. Include specific examples and potential action items for each category.",
            author: "Business Strategist",
            category: "business"
        },
        {
            title: "90-Day Launch Plan",
            content: "Develop a 90-day action plan for launching [new product/service], including key milestones, potential roadblocks, and success metrics.",
            author: "Business Strategist",
            category: "business"
        },
        {
            title: "Elevator Pitch",
            content: "Write a compelling elevator pitch for my [startup idea] targeting [specific investor type]. Include the problem we're solving, our unique solution, and market potential.",
            author: "Startup Expert",
            category: "business"
        },
        {
            title: "Cost-Cutting Ideas",
            content: "Generate 10 creative cost-cutting ideas for my [business type] that won't compromise quality or employee satisfaction.",
            author: "Business Strategist",
            category: "business"
        }
    ],
    content: [
        {
            title: "Content Strategy Launch",
            content: "Create a comprehensive content strategy for launching our [new product/service], including blog post ideas, social media content themes, and email campaign concepts. Target audience: [specific demographic].",
            author: "Content Creator",
            category: "content"
        },
        {
            title: "Instagram Story Caption",
            content: "Write a compelling story-based Instagram caption (max 2200 characters) about how our [product] transformed a customer's life. Include relevant hashtags and a clear call-to-action.",
            author: "Content Creator",
            category: "content"
        },
        {
            title: "TikTok Video Series",
            content: "Develop a series of 5 interconnected TikTok video concepts (60 seconds each) that showcase the features of our [product] in a fun, trendy way. Include ideas for music, transitions, and text overlays.",
            author: "Social Media Expert",
            category: "content"
        },
        {
            title: "SEO Blog Outline",
            content: "Generate an outline for a long-form, SEO-optimized blog post about [topic]. Include potential subheadings, key points to cover, and ideas for internal and external links.",
            author: "SEO Expert",
            category: "content"
        },
        {
            title: "YouTube Comparison Script",
            content: "Create a script for a 10-minute YouTube video comparing our [product] to our top 3 competitors. Highlight our unique selling points without being overly promotional.",
            author: "Content Creator",
            category: "content"
        }
    ],
    writing: [
        {
            title: "Blog Post Perspective",
            content: "Compose a blog post of [word count] words from the perspective of a [profession] on the importance of [topic]. Use [tone] language and include [number] practical tips for the readers to apply in their daily lives.",
            author: "Writer",
            category: "writing"
        },
        {
            title: "Project Proposal",
            content: "Draft a proposal for a [type of project] to present to your [authority/organization]. Include the project's purpose, expected benefits, [number] steps for implementation, and [number] funding options.",
            author: "Writer",
            category: "writing"
        },
        {
            title: "Cover Letter",
            content: "Write a cover letter for a job application in the [industry] industry. Highlight [number] technical skills, [number] past experiences, and explain why you're passionate about [specific role] at [company name].",
            author: "Career Expert",
            category: "writing"
        },
        {
            title: "Crisis Press Release",
            content: "Imagine you're a [job title] dealing with a [type of crisis]. Draft a press release that acknowledges the issue, explains [number] actions your company is taking, and reassures [stakeholder group].",
            author: "PR Expert",
            category: "writing"
        },
        {
            title: "Presentation Outline",
            content: "Develop an outline for a presentation about the importance of [topic] in [setting]. Cover [number] current statistics, [number] impacts on [metric], and [number] ways [group] can support [another group].",
            author: "Writer",
            category: "writing"
        }
    ],
    webdevelopment: [
        {
            title: "Website Architecture",
            content: "Develop an architecture and code for a <website description> website with JavaScript.",
            author: "Web Developer",
            category: "webdevelopment"
        },
        {
            title: "Debug Code",
            content: "Help me find mistakes in the following code <paste code below>.",
            author: "Web Developer",
            category: "webdevelopment"
        },
        {
            title: "Sticky Header",
            content: "I want to implement a sticky header on my website. Can you provide an example of how to do that using CSS and JavaScript?",
            author: "Frontend Dev",
            category: "webdevelopment"
        },
        {
            title: "REST API Endpoint",
            content: "I need to create a REST API endpoint for my web application. Can you provide an example of how to do that using Node.js and Express?",
            author: "Backend Dev",
            category: "webdevelopment"
        },
        {
            title: "React SSR",
            content: "I want to implement server-side rendering for my React application. Can you provide an example of how to do that using Next.js?",
            author: "React Expert",
            category: "webdevelopment"
        }
    ],
    education: [
        {
            title: "Gamified Learning System",
            content: "Design a gamified learning system for [specific subject] that incorporates elements of competition, rewards, and progress tracking. Include ideas for quests, achievements, and level-ups.",
            author: "Education Expert",
            category: "education"
        },
        {
            title: "Lesson Plan",
            content: "Create a detailed lesson plan for teaching [complex topic] to [age group]. Include engaging activities, discussion questions, and assessment methods.",
            author: "Teacher",
            category: "education"
        },
        {
            title: "Socratic Seminar",
            content: "Develop a series of thought-provoking questions to spark a Socratic seminar on [controversial topic]. Aim for questions that encourage critical thinking and respectful debate.",
            author: "Teacher",
            category: "education"
        },
        {
            title: "Educational Story",
            content: "Write a creative story that explains [scientific concept] in a way that's engaging and easy to understand for [age group]. Include analogies and real-world examples.",
            author: "Education Expert",
            category: "education"
        },
        {
            title: "Project-Based Learning",
            content: "Design a project-based learning unit on [current event or global issue]. Outline the driving question, necessary resources, and potential community partnerships.",
            author: "Teacher",
            category: "education"
        }
    ],
    sales: [
        {
            title: "Elevator Pitch",
            content: "Craft a compelling elevator pitch for [product/service] that hooks potential clients in under 30 seconds.",
            author: "Sales Expert",
            category: "sales"
        },
        {
            title: "Follow-up Email Sequence",
            content: "Design a follow-up email sequence for leads who attended our recent webinar on [topic]. How can we nurture these connections?",
            author: "Sales Expert",
            category: "sales"
        },
        {
            title: "Objection Handling",
            content: "Develop a strategy to overcome the top 3 objections customers have about [product/service]. What's your action plan?",
            author: "Sales Expert",
            category: "sales"
        },
        {
            title: "Video Sales Letter",
            content: "Create a script for a video sales letter introducing our new [product] to our email list. How can we make it irresistible?",
            author: "Sales Expert",
            category: "sales"
        },
        {
            title: "LinkedIn Outreach",
            content: "Write a LinkedIn outreach message to connect with decision-makers in the [industry] sector. How can we stand out in their inbox?",
            author: "Sales Expert",
            category: "sales"
        }
    ],
    creative: [
        {
            title: "Music Lyrics",
            content: "Write a lyrical verse in the style of [artist] about [topic].",
            author: "Music Creator",
            category: "creative"
        },
        {
            title: "Song Title Composition",
            content: "Write the lyrics to a song titled [Title of the song].",
            author: "Music Creator",
            category: "creative"
        },
        {
            title: "AI Art Prompt",
            content: "A photograph of an angry full-bodied wolf in the foggy woods, by Alex Horley-Orlandelli, by Bastien Lecouffe-Deharme, dusk, sepia, 8k, realistic",
            author: "AI Artist",
            category: "creative"
        },
        {
            title: "Surreal Landscape",
            content: "Please generate a surreal landscape with bright colors and organic shapes. Include a small figure in the foreground, with their back, turned to the viewer.",
            author: "AI Artist",
            category: "creative"
        },
        {
            title: "Modern Logo Design",
            content: "Design a modern logo with a sun for a marketing company",
            author: "Designer",
            category: "creative"
        }
    ],
    productivity: [
        {
            title: "Data Science Cleaning",
            content: "Suggest a data cleaning strategy for a dataset with missing values and outliers in [specific field].",
            author: "Data Scientist",
            category: "productivity"
        },
        {
            title: "Analytics KPIs",
            content: "Identify the top 5 KPIs for [industry/field] and explain their significance to business performance.",
            author: "Analytics Expert",
            category: "productivity"
        },
        {
            title: "Email Campaign Subject Lines",
            content: "Give me 10 subject lines for my [niche] newsletter",
            author: "Email Marketer",
            category: "productivity"
        },
        {
            title: "UX Design Requirements",
            content: "Generate examples of UI design requirements for a [mobile app]",
            author: "UX Designer",
            category: "productivity"
        },
        {
            title: "Customer Service Script",
            content: "Craft a script for handling a frustrated customer who received a damaged product. How can we turn this negative experience into a positive one?",
            author: "Customer Service",
            category: "productivity"
        }
    ]
};

// Function to populate community prompts
function populateCommunityPrompts(category = 'all', sortBy = 'popular') {
    const container = document.getElementById('communityPromptContainer');
    if (!container) {
        console.error('Community prompt container not found');
        return;
    }

    console.log(`Populating community prompts: category=${category}, sortBy=${sortBy}`);
    container.innerHTML = '';

    let promptsToShow = [];

    if (category === 'all') {
        // Show all prompts from all categories
        Object.entries(communityPrompts).forEach(([cat, prompts]) => {
            promptsToShow = promptsToShow.concat(
                prompts.map((p, i) => ({
                    ...p,
                    id: `${cat}-${i}`,
                    stars: Math.floor(Math.random() * 300) + 50,
                    usageCount: Math.floor(Math.random() * 2000) + 500,
                    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
                }))
            );
        });
    } else {
        // Show prompts from specific category
        const categoryPrompts = communityPrompts[category] || [];
        promptsToShow = categoryPrompts.map((p, i) => ({
            ...p,
            id: `${category}-${i}`,
            stars: Math.floor(Math.random() * 300) + 50,
            usageCount: Math.floor(Math.random() * 2000) + 500,
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
        }));
    }

    // Sort prompts based on sortBy parameter
    switch (sortBy) {
        case 'popular':
            promptsToShow.sort((a, b) => b.usageCount - a.usageCount);
            break;
        case 'recent':
            promptsToShow.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'alphabetical':
            promptsToShow.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }

    // If we're showing all categories, add a featured section with social media prompts
    if (category === 'all') {
        const featuredSection = document.createElement('div');
        featuredSection.className = 'featured-prompts-section';
        featuredSection.innerHTML = `
            <h2 class="section-title"><i class="fas fa-star"></i> Featured Prompts</h2>
            <div class="featured-prompts"></div>
        `;
        container.appendChild(featuredSection);

        // Get social media related prompts for featuring
        const socialMediaKeywords = ['instagram', 'youtube', 'tiktok', 'caption', 'social media', 'video', 'thumbnail'];

        // Find featured prompts based on keywords in title or content
        const featuredPrompts = promptsToShow.filter(prompt => {
            const titleLower = prompt.title.toLowerCase();
            const contentLower = prompt.content.toLowerCase();

            return socialMediaKeywords.some(keyword =>
                titleLower.includes(keyword) || contentLower.includes(keyword)
            );
        }).slice(0, 3); // Take top 3 matching prompts

        // If we don't have enough social media prompts, add some specifically selected ones
        if (featuredPrompts.length < 3) {
            // Look for these specific prompts by title
            const specificFeaturedTitles = [
                'Instagram Story Caption',
                'TikTok Video Series',
                'YouTube Comparison Script',
                'Facebook Ad Story'
            ];

            // Find these specific prompts
            const specificFeatured = promptsToShow.filter(prompt =>
                specificFeaturedTitles.includes(prompt.title)
            );

            // Add them to our featured list if not already there
            specificFeatured.forEach(prompt => {
                if (!featuredPrompts.some(p => p.id === prompt.id) && featuredPrompts.length < 3) {
                    featuredPrompts.push(prompt);
                }
            });
        }

        // If we still need more, take from the top prompts
        if (featuredPrompts.length < 3) {
            const remainingCount = 3 - featuredPrompts.length;
            const additionalPrompts = promptsToShow
                .filter(p => !featuredPrompts.some(fp => fp.id === p.id))
                .slice(0, remainingCount);

            featuredPrompts.push(...additionalPrompts);
        }

        const featuredContainer = featuredSection.querySelector('.featured-prompts');

        // Render the featured prompts
        featuredPrompts.forEach((prompt, index) => {
            const promptCard = createPromptCard(prompt, index, true);
            featuredContainer.appendChild(promptCard);
        });

        // Add a divider
        const divider = document.createElement('div');
        divider.className = 'section-divider';
        container.appendChild(divider);

        // Create a container for all prompts
        const allPromptsSection = document.createElement('div');
        allPromptsSection.className = 'all-prompts-section';
        allPromptsSection.innerHTML = `
            <h2 class="section-title"><i class="fas fa-list"></i> All Prompts</h2>
            <div class="all-prompts"></div>
        `;
        container.appendChild(allPromptsSection);

        const allPromptsContainer = allPromptsSection.querySelector('.all-prompts');

        // Create all prompt cards (except featured ones)
        promptsToShow.forEach((prompt) => {
            // Skip if this prompt is already featured
            if (featuredPrompts.some(fp => fp.id === prompt.id)) {
                return;
            }

            const promptCard = createPromptCard(prompt, null, false);
            allPromptsContainer.appendChild(promptCard);
        });
    } else {
        // For other views, just show all prompts with appropriate title
        let sectionTitle = '';

        if (category !== 'all') {
            // Capitalize the category name
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            sectionTitle = `${categoryName} Prompts`;
        } else {
            switch (sortBy) {
                case 'recent':
                    sectionTitle = 'Recent Prompts';
                    break;
                case 'alphabetical':
                    sectionTitle = 'Prompts (A-Z)';
                    break;
                default:
                    sectionTitle = 'All Prompts';
            }
        }

        const allPromptsSection = document.createElement('div');
        allPromptsSection.className = 'all-prompts-section';
        allPromptsSection.innerHTML = `
            <h2 class="section-title"><i class="fas fa-list"></i> ${sectionTitle}</h2>
            <div class="all-prompts"></div>
        `;
        container.appendChild(allPromptsSection);

        const allPromptsContainer = allPromptsSection.querySelector('.all-prompts');

        // Create all prompt cards
        promptsToShow.forEach((prompt, index) => {
            const promptCard = createPromptCard(prompt, index, false);
            allPromptsContainer.appendChild(promptCard);
        });
    }

    console.log(`Rendered ${promptsToShow.length} community prompts`);

    // Add event listeners for community prompt actions
    addCommunityEventListeners();
}

// Create a prompt card
function createPromptCard(prompt, index, isFeatured = false) {
    const promptCard = document.createElement('div');
    promptCard.className = isFeatured ? 'prompt-card featured' : 'prompt-card';
    promptCard.dataset.id = `${prompt.category}-${index}`;

    promptCard.innerHTML = `
        <h3 class="prompt-title">
            <span class="prompt-title-text">${prompt.title} ${isFeatured ? '<span class="featured-badge"><i class="fas fa-award"></i> Featured</span>' : ''}</span>
            <div class="prompt-actions">
                <button class="btn-icon" data-action="copy" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-icon" data-action="send" title="Send to ChatGPT">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button class="btn-icon" data-action="saveToMyPrompts" title="Save">
                    <i class="fas fa-save"></i>
                </button>
            </div>
        </h3>
        <div class="prompt-preview">
            <div class="prompt-content">${prompt.content}</div>
        </div>
        <div class="prompt-meta">
            <span class="prompt-author">by ${prompt.author}</span>
            <span class="prompt-category">${prompt.category}</span>
            <div class="prompt-stats">
                <span title="Popularity rating"><i class="fas fa-star"></i> ${prompt.stars}</span>
                <span title="Times used"><i class="fas fa-users"></i> ${prompt.usageCount}</span>
            </div>
        </div>
    `;

    // Add direct event listeners to the action buttons (not using event delegation)
    const copyBtn = promptCard.querySelector('[data-action="copy"]');
    const sendBtn = promptCard.querySelector('[data-action="send"]');
    const saveBtn = promptCard.querySelector('[data-action="saveToMyPrompts"]');

    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(prompt.content);
            showToast('Prompt copied to clipboard!', 'success');
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.currentTarget.classList.add('active');

            // Add spinner icon
            const icon = e.currentTarget.querySelector('i');
            const originalClass = icon ? icon.className : '';
            if (icon) {
                icon.className = 'fas fa-spinner fa-spin';
            }

            try {
                // Use CommunityTab's method if available
                if (CommunityTab && typeof CommunityTab.sendTextToActiveTab === 'function') {
                    await CommunityTab.sendTextToActiveTab(prompt.content);
                } else if (typeof InjectionManager !== 'undefined' && InjectionManager.injectPrompt) {
                    await InjectionManager.injectPrompt(prompt.content);
                    // Success animation
                    if (icon) {
                        icon.className = 'fas fa-check';
                        e.currentTarget.classList.add('success');
                        // Reset after animation
                        setTimeout(() => {
                            icon.className = originalClass || 'fas fa-paper-plane';
                            e.currentTarget.classList.remove('active', 'success');
                        }, 1500);
                    }
                } else {
                    // Fallback
                    showToast('Sending to ChatGPT...', 'info');
                    // Reset after animation
                    setTimeout(() => {
                        if (icon) {
                            icon.className = originalClass || 'fas fa-paper-plane';
                        }
                        e.currentTarget.classList.remove('active', 'success');
                    }, 1500);
                }
            } catch (error) {
                console.error('Failed to send prompt:', error);
                if (icon) {
                    icon.className = originalClass || 'fas fa-paper-plane';
                }
                e.currentTarget.classList.remove('active', 'success');
                showToast('Failed to send prompt', 'error');
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveToMyPrompts(prompt.title, prompt.content);
        });
    }

    // Make the whole card clickable (except buttons)
    promptCard.addEventListener('click', (e) => {
        // Only open the expand view if they didn't click on a button
        if (!e.target.closest('.btn-icon') && !e.target.closest('.prompt-actions')) {
            // Use the CommunityTab version if available, otherwise use direct function
            if (CommunityTab && CommunityTab.openViewCommunityModal) {
                CommunityTab.openViewCommunityModal(prompt.id);
            } else {
                openCommunityViewModal(prompt.title, prompt.content);
            }
        }
    });

    return promptCard;
}

// Add event listeners for community prompts
function addCommunityEventListeners() {
    const communityFilter = document.getElementById('communityFilter');
    const communitySortSelect = document.getElementById('communitySortSelect');

    if (communityFilter) {
        communityFilter.addEventListener('change', (e) => {
            const sortBy = communitySortSelect ? communitySortSelect.value : 'popular';
            populateCommunityPrompts(e.target.value, sortBy);
        });
    }

    if (communitySortSelect) {
        communitySortSelect.addEventListener('change', (e) => {
            const category = communityFilter ? communityFilter.value : 'all';
            populateCommunityPrompts(category, e.target.value);
        });
    }

    // Add click handlers for action buttons
    document.querySelectorAll('#communityPromptContainer .btn-icon').forEach(btn => {
        btn.addEventListener('click', handleCommunityAction);
    });
}

// Handle community prompt actions
function handleCommunityAction(e) {
    e.stopPropagation();
    const action = e.currentTarget.getAttribute('data-action');
    if (!action) return; // Skip if no action is defined

    const promptCard = e.currentTarget.closest('.prompt-card');
    if (!promptCard) return;

    const title = promptCard.querySelector('.prompt-title-text').textContent.replace('Featured', '').trim();
    const content = promptCard.querySelector('.prompt-content').textContent;
    const promptId = promptCard.dataset.id;

    // Increment usage count for analytics
    if (['copy', 'send'].includes(action)) {
        updatePromptUsage(promptId);
    }

    switch (action) {
        case 'copy':
            navigator.clipboard.writeText(content);
            showToast('Prompt copied to clipboard!', 'success');
            break;
        case 'send':
            // Send to ChatGPT logic here
            e.currentTarget.classList.add('active');

            // Add spinner icon
            const icon = e.currentTarget.querySelector('i');
            if (icon) {
                const originalClass = icon.className;
                icon.className = 'fas fa-spinner fa-spin';

                // Simulate sending
                setTimeout(() => {
                    icon.className = 'fas fa-check';
                    e.currentTarget.classList.add('success');

                    // Reset after animation
                    setTimeout(() => {
                        icon.className = originalClass;
                        e.currentTarget.classList.remove('active', 'success');
                    }, 1500);
                }, 800);
            }

            showToast('Sending to ChatGPT...', 'info');
            break;
        case 'saveToMyPrompts':
            // Save to user's prompts
            saveToMyPrompts(title, content);
            break;
    }
}

// Track prompt usage for analytics
function updatePromptUsage(promptId) {
    if (!promptId) return;

    // Find prompt in the community prompts data
    const [category, index] = promptId.split('-');

    if (communityPrompts[category] && communityPrompts[category][index]) {
        // Ensure we have usage count property
        if (!communityPrompts[category][index].usageCount) {
            communityPrompts[category][index].usageCount = 0;
        }

        // Increment usage
        communityPrompts[category][index].usageCount++;

        // For demo purposes, also update the displayed usage count
        const card = document.querySelector(`.prompt-card[data-id="${promptId}"]`);
        if (card) {
            const statsElement = card.querySelector('.prompt-stats');
            if (statsElement) {
                const usageElement = statsElement.querySelector('span[title="Times used"]');
                if (usageElement) {
                    const count = parseInt(usageElement.textContent.replace(/[^0-9]/g, '')) + 1;
                    usageElement.innerHTML = `<i class="fas fa-users"></i> ${count}`;
                }
            }
        }
    }
}

// Save community prompt to user's prompts
function saveToMyPrompts(title, content) {
    // Logic to save prompt to user's collection
    const userPrompts = JSON.parse(localStorage.getItem('userPrompts') || '[]');

    // Check if prompt already exists
    const promptExists = userPrompts.some(prompt =>
        prompt.title === title || prompt.content === content
    );

    if (promptExists) {
        showToast('This prompt already exists in your collection', 'info');
        return;
    }

    const newPrompt = {
        id: Date.now(),
        title: title,
        content: content,
        created: new Date().toISOString()
    };

    userPrompts.push(newPrompt);
    localStorage.setItem('userPrompts', JSON.stringify(userPrompts));
    showToast('Prompt saved to your collection!', 'success');

    // Force refresh of the prompts tab if it exists
    if (window.PromptsTab && typeof window.PromptsTab.loadPrompts === 'function') {
        setTimeout(() => {
            window.PromptsTab.loadPrompts();
        }, 100);
    }
}

// Open community prompt view modal
function openCommunityViewModal(title, content) {
    const viewCommunityPromptModal = document.getElementById('viewCommunityPromptModal');
    const viewCommunityPromptTitle = document.getElementById('viewCommunityPromptTitle');
    const viewCommunityPromptContent = document.getElementById('viewCommunityPromptContent');

    // Set modal content
    viewCommunityPromptTitle.textContent = title;
    viewCommunityPromptContent.textContent = content;

    // Make content editable
    viewCommunityPromptContent.contentEditable = true;
    viewCommunityPromptContent.style.cursor = 'text';
    viewCommunityPromptContent.style.padding = '10px';
    viewCommunityPromptContent.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    viewCommunityPromptContent.style.borderRadius = '6px';
    viewCommunityPromptContent.style.minHeight = '100px';

    // Show modal
    viewCommunityPromptModal.classList.add('active');

    // Add event listeners for buttons in the modal
    const copyFromViewPromptBtn = document.getElementById('copyFromViewPromptBtn');
    const sendFromViewPromptBtn = document.getElementById('sendFromViewPromptBtn');
    const saveToMyPromptsBtn = document.getElementById('saveToMyPromptsBtn');
    const closeViewCommunityPromptBtn = document.getElementById('closeViewCommunityPromptBtn');

    // Remove any existing event listeners by cloning and replacing
    const newCopyBtn = copyFromViewPromptBtn.cloneNode(true);
    const newSendBtn = sendFromViewPromptBtn.cloneNode(true);
    const newSaveBtn = saveToMyPromptsBtn.cloneNode(true);
    const newCloseBtn = closeViewCommunityPromptBtn.cloneNode(true);

    copyFromViewPromptBtn.parentNode.replaceChild(newCopyBtn, copyFromViewPromptBtn);
    sendFromViewPromptBtn.parentNode.replaceChild(newSendBtn, sendFromViewPromptBtn);
    saveToMyPromptsBtn.parentNode.replaceChild(newSaveBtn, saveToMyPromptsBtn);
    closeViewCommunityPromptBtn.parentNode.replaceChild(newCloseBtn, closeViewCommunityPromptBtn);

    // Add event listeners
    newCopyBtn.addEventListener('click', () => {
        const currentContent = viewCommunityPromptContent.textContent;
        navigator.clipboard.writeText(currentContent);
        showToast('Prompt copied to clipboard!', 'success');
    });

    newSendBtn.addEventListener('click', async () => {
        const currentContent = viewCommunityPromptContent.textContent;
        newSendBtn.classList.add('active');

        // Add spinner icon
        const icon = newSendBtn.querySelector('i');
        const originalClass = icon ? icon.className : '';
        if (icon) {
            icon.className = 'fas fa-spinner fa-spin';
        }

        try {
            // Use CommunityTab's method if available
            if (CommunityTab && typeof CommunityTab.sendTextToActiveTab === 'function') {
                await CommunityTab.sendTextToActiveTab(currentContent);
            } else if (typeof InjectionManager !== 'undefined' && InjectionManager.injectPrompt) {
                await InjectionManager.injectPrompt(currentContent);
                // Success animation shown by InjectionManager
            } else {
                // Fallback
                showToast('Sending to ChatGPT...', 'info');
                // Reset after animation
                setTimeout(() => {
                    if (icon) {
                        icon.className = originalClass || 'fas fa-paper-plane';
                    }
                    newSendBtn.classList.remove('active');
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to send prompt:', error);
            if (icon) {
                icon.className = originalClass || 'fas fa-paper-plane';
            }
            newSendBtn.classList.remove('active');
            showToast('Failed to send prompt', 'error');
        }
    });

    newSaveBtn.addEventListener('click', () => {
        const currentTitle = viewCommunityPromptTitle.textContent;
        const currentContent = viewCommunityPromptContent.textContent;
        saveToMyPrompts(currentTitle, currentContent);
        viewCommunityPromptModal.classList.remove('active');
    });

    newCloseBtn.addEventListener('click', () => {
        viewCommunityPromptModal.classList.remove('active');
    });
}

const CommunityTab = {
    elements: {},
    communityPrompts: [],
    filteredPrompts: [],
    currentFilter: 'all',

    /**
     * Initialize community tab
     */
    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadCommunityPrompts();
    },

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            // Main containers
            communityPromptContainer: document.getElementById('communityPromptContainer'),
            searchInput: document.getElementById('communitySearchInput'),
            filterSelect: document.getElementById('communityFilter'),
            sortSelect: document.getElementById('communitySortSelect'),

            // Community Prompt Modal elements
            viewCommunityPromptModal: document.getElementById('viewCommunityPromptModal'),
            viewCommunityPromptTitle: document.getElementById('viewCommunityPromptTitle'),
            viewCommunityPromptContent: document.getElementById('viewCommunityPromptContent'),
            viewCommunityPromptAuthor: document.getElementById('viewCommunityPromptAuthor'),
            closeViewCommunityPromptBtn: document.getElementById('closeViewCommunityPromptBtn'),
            saveToMyPromptsBtn: document.getElementById('saveToMyPromptsBtn'),
            copyFromViewPromptBtn: document.getElementById('copyFromViewPromptBtn'),
            sendFromViewPromptBtn: document.getElementById('sendFromViewPromptBtn')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search, filter and sort events
        this.elements.searchInput.addEventListener('input', () => this.filterAndSortPrompts());
        this.elements.filterSelect.addEventListener('change', () => this.filterAndSortPrompts());
        this.elements.sortSelect.addEventListener('change', () => this.filterAndSortPrompts());

        // Community Prompt Modal events - now handled by reattachViewModalEventListeners()
        // We'll do initial binding but the actual event handlers will be refreshed each time
        // the modal is opened to prevent duplicate handlers
        this.reattachViewModalEventListeners();
    },

    /**
     * Load community prompts
     */
    async loadCommunityPrompts() {
        try {
            // Initialize with the communityPrompts data structure
            // Convert the object structure to an array format needed for rendering
            this.communityPrompts = [];

            // Process each category of prompts
            Object.entries(communityPrompts).forEach(([category, prompts]) => {
                prompts.forEach((prompt, index) => {
                    this.communityPrompts.push({
                        id: `${category}-${index}`,
                        title: prompt.title,
                        content: prompt.content,
                        category: prompt.category,
                        author: prompt.author,
                        stars: Math.floor(Math.random() * 300) + 50, // Random stars for demo
                        usageCount: Math.floor(Math.random() * 2000) + 500, // Random usage for demo
                        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0] // Random recent date
                    });
                });
            });

            // Initialize filtered prompts
            this.filteredPrompts = [...this.communityPrompts];

            // Get the current sort option
            const sortOption = this.elements.sortSelect.value || 'popular';

            // Apply initial sorting
            this.sortPrompts(sortOption);

            // Render community prompts
            this.renderPrompts();

            // Also populate using the standalone function
            populateCommunityPrompts('all', sortOption);

            console.log('Community prompts loaded:', this.communityPrompts.length);
        } catch (error) {
            console.error('Error loading community prompts:', error);
            UIManager.showToast('Failed to load community prompts', 'error');
        }
    },

    /**
     * Sort prompts based on the selected sort option
     * @param {string} sortOption - The sort option (popular, recent, alphabetical)
     */
    sortPrompts(sortOption) {
        switch (sortOption) {
            case 'popular':
                this.filteredPrompts.sort((a, b) => b.usageCount - a.usageCount);
                break;
            case 'recent':
                this.filteredPrompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'alphabetical':
                this.filteredPrompts.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
    },

    /**
     * Render community prompts in the container
     */
    renderPrompts() {
        // Clear existing content
        this.elements.communityPromptContainer.innerHTML = '';

        if (this.filteredPrompts.length === 0) {
            this.elements.communityPromptContainer.innerHTML = `
            <div class="placeholder">
                <p><i class="fas fa-search"></i> No prompts match your search</p>
                <p class="placeholder-subtitle">Try different search terms or filters</p>
            </div>
        `;
            return;
        }

        // Create and append prompt cards
        this.filteredPrompts.forEach(prompt => {
            const card = this.createPromptCard(prompt);
            this.elements.communityPromptContainer.appendChild(card);
        });
    },

    /**
     * Filter and sort prompts based on search input, category filter, and sort selection
     */
    filterAndSortPrompts() {
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        this.currentFilter = this.elements.filterSelect.value;
        const sortOption = this.elements.sortSelect.value;

        // First filter the prompts
        this.filteredPrompts = this.communityPrompts.filter(prompt => {
            // Apply category filter
            const categoryMatch = this.currentFilter === 'all' || prompt.category === this.currentFilter;

            // Apply search filter if there's a search term
            let searchMatch = true;
            if (searchTerm) {
                searchMatch =
                    prompt.title.toLowerCase().includes(searchTerm) ||
                    prompt.content.toLowerCase().includes(searchTerm) ||
                    prompt.author.toLowerCase().includes(searchTerm) ||
                    (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
            }

            return categoryMatch && searchMatch;
        });

        // Then sort the filtered prompts
        this.sortPrompts(sortOption);

        // Render the filtered and sorted prompts
        this.renderPrompts();
    },

    /**
     * Create a prompt card element
     * @param {Object} prompt Prompt data
     * @returns {HTMLElement} Prompt card element
     */
    createPromptCard(prompt) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.id = prompt.id;

        // Sanitize HTML content
        const sanitizedTitle = UIManager.sanitizeHtml(prompt.title);
        const sanitizedContent = UIManager.sanitizeHtml(prompt.content);
        const sanitizedAuthor = UIManager.sanitizeHtml(prompt.author || 'Community User');

        card.innerHTML = `
        <h3 class="prompt-title">
            <span class="prompt-title-text">${sanitizedTitle}</span>
            <div class="title-buttons">
                <button class="btn-icon btn-expand" title="Expand to full view"><i class="fas fa-expand-alt"></i></button>
                <button class="btn-icon btn-copy" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
                <button class="btn-icon btn-send send" title="Send to active tab"><i class="fas fa-paper-plane"></i></button>
            </div>
        </h3>
        <div class="prompt-preview">
            <div class="prompt-content">${sanitizedContent}</div>
        </div>
        <div class="prompt-meta">
            <span>By: ${sanitizedAuthor}</span>
            <span class="prompt-stats">
                <i class="fas fa-star"></i> ${prompt.stars || 0}
                <i class="fas fa-users ml-2"></i> ${prompt.usageCount || 0}
            </span>
        </div>
    `;

        // Add event listeners to the card buttons
        card.querySelector('.btn-copy').addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyPromptToClipboard(prompt);
        });

        card.querySelector('.btn-send').addEventListener('click', (e) => {
            e.stopPropagation();
            // Mark this button as active before sending
            const allSendButtons = document.querySelectorAll('.btn-send');
            allSendButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');

            this.sendPromptToActiveTab(prompt);
        });

        card.querySelector('.btn-expand').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openViewCommunityModal(prompt.id);
        });

        // Make the whole card clickable
        card.addEventListener('click', () => {
            this.openViewCommunityModal(prompt.id);
        });

        // After card is created, update the content class for line logic
        const contentEl = card.querySelector('.prompt-content');
        if (contentEl) updateContentClass(contentEl);

        return card;
    },

    /**
     * Open the community prompt view modal
     * @param {string} promptId - ID of the prompt to view
     */
    openViewCommunityModal(promptId) {
        const prompt = this.communityPrompts.find(p => p.id === promptId);
        if (!prompt) return;

        // Set current prompt ID for save button
        this.elements.saveToMyPromptsBtn.dataset.promptId = promptId;

        // Populate modal content
        this.elements.viewCommunityPromptTitle.textContent = prompt.title;
        this.elements.viewCommunityPromptContent.textContent = prompt.content;
        this.elements.viewCommunityPromptAuthor.textContent = `Created by: ${prompt.author || 'Community User'}`;

        // Make content editable
        this.elements.viewCommunityPromptContent.contentEditable = true;
        this.elements.viewCommunityPromptContent.style.cursor = 'text';
        this.elements.viewCommunityPromptContent.style.padding = '10px';
        this.elements.viewCommunityPromptContent.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        this.elements.viewCommunityPromptContent.style.borderRadius = '6px';
        this.elements.viewCommunityPromptContent.style.minHeight = '100px';

        // Show modal
        this.elements.viewCommunityPromptModal.classList.add('active');

        // Remove and re-attach event listeners to prevent multiple executions
        this.reattachViewModalEventListeners();
    },

    /**
     * Re-attach event listeners to view modal buttons to prevent multiple executions
     */
    reattachViewModalEventListeners() {
        // Clone and replace buttons to remove old event listeners
        ['copyFromViewPromptBtn', 'sendFromViewPromptBtn', 'saveToMyPromptsBtn', 'closeViewCommunityPromptBtn'].forEach(btnId => {
            if (!this.elements[btnId]) return;

            const original = this.elements[btnId];
            const clone = original.cloneNode(true);
            original.parentNode.replaceChild(clone, original);
            this.elements[btnId] = clone;
        });

        // Re-attach event listeners
        this.elements.closeViewCommunityPromptBtn.addEventListener('click', () => this.closeViewCommunityModal());
        this.elements.saveToMyPromptsBtn.addEventListener('click', () => this.saveToMyPrompts());
        this.elements.copyFromViewPromptBtn.addEventListener('click', () => this.copyPromptToClipboard());
        this.elements.sendFromViewPromptBtn.addEventListener('click', async (e) => {
            // Prevent multiple sends by disabling button temporarily
            if (e.currentTarget.disabled) return;
            e.currentTarget.disabled = true;

            // Add active class and spinner
            e.currentTarget.classList.add('active');
            const icon = e.currentTarget.querySelector('i');
            const originalClass = icon ? icon.className : '';
            if (icon) icon.className = 'fas fa-spinner fa-spin';

            try {
                await this.sendPromptToActiveTab();
                // Success state handled by sendPromptToActiveTab
            } catch (error) {
                console.error('Error sending prompt:', error);
                if (icon) icon.className = originalClass || 'fas fa-paper-plane';
                e.currentTarget.classList.remove('active');
                UIManager.showToast('Failed to send prompt', 'error');
            } finally {
                // Re-enable button after a delay
                setTimeout(() => {
                    e.currentTarget.disabled = false;
                }, 1500);
            }
        });
    },

    /**
     * Close the community prompt view modal
     */
    closeViewCommunityModal() {
        this.elements.viewCommunityPromptModal.classList.remove('active');
    },

    /**
     * Save the viewed prompt to my prompts collection
     */
    async saveToMyPrompts() {
        try {
            const promptId = this.elements.saveToMyPromptsBtn.dataset.promptId;
            if (!promptId) {
                console.error('No prompt ID found');
                return;
            }

            // Get the original prompt
            const originalPrompt = this.communityPrompts.find(p => p.id === promptId);
            if (!originalPrompt) {
                console.error('Original prompt not found');
                return;
            }

            // Get the potentially edited content
            const editedContent = this.elements.viewCommunityPromptContent.textContent.trim();
            if (!editedContent) {
                UIManager.showToast('Prompt content cannot be empty', 'error');
                return;
            }

            // Create a new prompt object for the user's collection
            const newPrompt = {
                title: editedContent === originalPrompt.content
                    ? `${originalPrompt.title} (imported)`
                    : `${originalPrompt.title} (edited)`,
                content: editedContent,
                tags: originalPrompt.tags ? originalPrompt.tags.join(',') : 'imported',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Attempting to save prompt:', newPrompt);

            // Use the localStorage approach directly for now as a fallback
            try {
                // First try with StorageManager if available
                let success = false;

                if (typeof StorageManager !== 'undefined' && StorageManager.savePrompt) {
                    success = await StorageManager.savePrompt(newPrompt);
                } else {
                    // Fallback to direct localStorage approach
                    const userPrompts = JSON.parse(localStorage.getItem('promptr_prompts') || '[]');

                    // Check if prompt already exists
                    const promptExists = userPrompts.some(prompt =>
                        prompt.title === newPrompt.title || prompt.content === newPrompt.content
                    );

                    if (!promptExists) {
                        // Add unique ID
                        newPrompt.id = crypto.randomUUID ? crypto.randomUUID() :
                            `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                        userPrompts.push(newPrompt);
                        localStorage.setItem('promptr_prompts', JSON.stringify(userPrompts));
                        success = true;
                    }
                }

                if (success) {
                    // Update usage count
                    const promptIndex = this.communityPrompts.findIndex(p => p.id === promptId);
                    if (promptIndex !== -1) {
                        this.communityPrompts[promptIndex].usageCount++;
                    }

                    // Close modal
                    this.closeViewCommunityModal();

                    // Show success message
                    UIManager.showToast('Prompt saved to your collection', 'success');

                    // Force immediate refresh of the prompts tab
                    if (window.PromptsTab && typeof window.PromptsTab.loadPrompts === 'function') {
                        setTimeout(() => {
                            window.PromptsTab.loadPrompts();
                            console.log('Forced prompts tab refresh');

                            // Check if we need to notify the user about the new prompt
                            const currentTab = document.querySelector('.tab.active').getAttribute('data-tab');
                            if (currentTab !== 'prompts') {
                                UIManager.showToast('New prompt saved to My Prompts tab', 'info');
                            }
                        }, 0);
                    }
                } else {
                    UIManager.showToast('Prompt already exists in your collection', 'info');
                }
            } catch (error) {
                console.error('Error saving prompt:', error);
                UIManager.showToast('Failed to save prompt', 'error');
            }
        } catch (error) {
            console.error('Error saving prompt:', error);
            UIManager.showToast('Failed to save prompt', 'error');
        }
    },

    /**
     * Copy prompt content from the view modal to clipboard
     */
    copyPromptToClipboard(prompt) {
        const content = prompt ? (typeof prompt === 'object' ? prompt.content : prompt) : this.elements.viewCommunityPromptContent.textContent;
        this.copyTextToClipboard(content);
    },

    /**
     * Send prompt from the view modal to active tab
     */
    async sendPromptToActiveTab(prompt) {
        const content = prompt ? (typeof prompt === 'object' ? prompt.content : prompt) : this.elements.viewCommunityPromptContent.textContent;
        await this.sendTextToActiveTab(content);
    },

    /**
     * Copy text to clipboard
     * @param {string} text Text to copy
     */
    copyTextToClipboard(text) {
        if (!text) return;

        try {
            navigator.clipboard.writeText(text)
                .then(() => {
                    UIManager.showToast('Copied to clipboard!', 'success');
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    UIManager.showToast('Failed to copy text', 'error');
                    this.fallbackCopyToClipboard(text);
                });
        } catch (err) {
            console.error('Failed to copy text: ', err);
            UIManager.showToast('Failed to copy text', 'error');
            this.fallbackCopyToClipboard(text);
        }
    },

    /**
     * Fallback method to copy text to clipboard
     * @param {string} text Text to copy
     */
    fallbackCopyToClipboard(text) {
        // Create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();

        try {
            // Execute copy command
            document.execCommand('copy');
            UIManager.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            UIManager.showToast('Failed to copy text', 'error');
            console.error('Failed to copy text: ', err);
        }

        // Cleanup
        document.body.removeChild(textarea);
    },

    /**
     * Send text to active tab
     * @param {string} text Text to send
     */
    async sendTextToActiveTab(text) {
        if (!text) {
            UIManager.showToast('No content to send', 'error');
            return;
        }

        // Show button loading state
        const sendButton = document.querySelector('.btn-send.active, #sendFromViewPromptBtn');
        if (sendButton) {
            const iconElement = sendButton.querySelector('i');
            const originalClass = iconElement ? iconElement.className : '';

            if (iconElement) {
                iconElement.className = 'fas fa-spinner fa-spin';
            }

            try {
                // Use the global InjectionManager if available, otherwise show a fallback message
                if (typeof InjectionManager !== 'undefined' && InjectionManager.injectPrompt) {
                    await InjectionManager.injectPrompt(text);
                } else {
                    // Fallback to direct method if InjectionManager isn't available
                    await this.fallbackInjectPrompt(text);
                }

                // Success animation
                if (iconElement) {
                    iconElement.className = 'fas fa-check';
                    sendButton.classList.add('success');

                    // Revert after timeout
                    setTimeout(() => {
                        iconElement.className = originalClass || 'fas fa-paper-plane';
                        sendButton.classList.remove('success', 'active');
                    }, 1500);
                }
            } catch (error) {
                console.error('Failed to inject prompt:', error);
                // Revert button state
                if (iconElement) {
                    iconElement.className = originalClass || 'fas fa-paper-plane';
                }
                sendButton.classList.remove('active');
                UIManager.showToast('Failed to send prompt. Make sure you are on a supported website (ChatGPT, Claude, etc.)', 'error');
            }
        } else {
            // If no button is marked as active, just try to send
            try {
                if (typeof InjectionManager !== 'undefined' && InjectionManager.injectPrompt) {
                    await InjectionManager.injectPrompt(text);
                } else {
                    await this.fallbackInjectPrompt(text);
                }
            } catch (error) {
                console.error('Failed to inject prompt:', error);
                UIManager.showToast('Failed to send prompt. Make sure you are on a supported website (ChatGPT, Claude, etc.)', 'error');
            }
        }
    },

    /**
     * Fallback method to inject prompts if InjectionManager is not available
     * @param {string} text Text to inject
     */
    async fallbackInjectPrompt(text) {
        return new Promise((resolve, reject) => {
            try {
                // Try to use chrome API directly
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (!tabs || !tabs[0] || !tabs[0].id) {
                        reject(new Error('No active tab found.'));
                        return;
                    }

                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (textToInject) => {
                            // This function runs in the context of the web page
                            function simulateInput(element, text) {
                                element.focus();
                                if (element.isContentEditable) {
                                    document.execCommand('insertText', false, text || '');
                                } else {
                                    element.value = text || '';
                                }
                                element.dispatchEvent(new Event('input', { bubbles: true }));
                                element.dispatchEvent(new Event('change', { bubbles: true }));
                            }

                            const selectors = [
                                'div.ProseMirror[contenteditable="true"][translate="no"]#prompt-textarea', // ChatGPT
                                '.ProseMirror[contenteditable="true"][translate="no"]', // Claude
                                'div[contenteditable="true"][aria-label="Write your prompt to Claude"]', // Claude alt
                                'div.ProseMirror.break-words', // Claude fallback
                                'textarea[data-testid="tweetTextarea_0"]', // Grok
                                'textarea[placeholder*="message"]', // Generic fallback
                                'div[role="textbox"]', // Broad fallback
                                'div.relative.flex.w-full.grow.flex-col', // Gemini
                                'div[contenteditable="true"][role="textbox"]' // More general fallback
                            ];

                            let targetTextArea;
                            for (const selector of selectors) {
                                targetTextArea = document.querySelector(selector);
                                if (targetTextArea) break;
                            }

                            if (targetTextArea) {
                                simulateInput(targetTextArea, textToInject);
                                return { success: true };
                            } else {
                                throw new Error("No LLM text input found");
                            }
                        },
                        args: [text],
                        world: 'MAIN'
                    }, (results) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                            return;
                        }

                        if (results && results[0] && results[0].result && results[0].result.success) {
                            UIManager.showToast('Prompt sent successfully!', 'success');
                            resolve();
                        } else {
                            reject(new Error('Failed to send prompt.'));
                        }
                    });
                });
            } catch (error) {
                console.error('Fallback injection failed:', error);
                reject(error);
            }
        });
    }
};

// Make sure the module is initialized when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Community Tab');

    // Check if we're on the community tab
    const communityTab = document.querySelector('[data-tab="community"]');
    if (communityTab) {
        // Initialize both the object and standalone function
        if (CommunityTab && typeof CommunityTab.init === 'function') {
            CommunityTab.init();
        } else {
            // Fallback to direct function call
            populateCommunityPrompts('all', 'popular');
        }

        // Make the tab globally available
        window.CommunityTab = CommunityTab;
    }

    // Make sure the tab switch works properly
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            if (tabName === 'community') {
                // Reinitialize the community tab
                setTimeout(() => {
                    populateCommunityPrompts('all', 'popular');
                }, 100);
            }
        });
    });
});

// Add this utility function for dynamic line class
function updateContentClass(element) {
    const text = element.textContent;
    const lineLength = 50; // approximate characters per line
    const lines = Math.ceil(text.length / lineLength);
    element.classList.remove('short', 'medium', 'long');
    if (lines <= 2) {
        element.classList.add('short');
    } else if (lines <= 4) {
        element.classList.add('medium');
    } else {
        element.classList.add('long');
    }
} 