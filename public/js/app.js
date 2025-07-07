// I Love School JavaScript

class ILoveSchool {
    constructor() {
        this.currentUser = { name: 'John Doe', id: '1' };
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEventListeners();
        this.initializeLanguage();
    }
    
    initializeLanguage() {
        // Set initial language display
        this.updateLanguageDisplay();
        
        // Close language menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-toggle')) {
                document.getElementById('languageMenu').classList.remove('show');
                document.querySelector('.lang-btn').classList.remove('active');
            }
        });
    }
    
    updateLanguageDisplay() {
        const currentLang = window.i18n.getCurrentLanguage();
        const langMap = { en: 'EN', ko: '한국어', zh: '中文' };
        document.getElementById('currentLang').textContent = langMap[currentLang] || 'EN';
        
        // Update active language option
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[onclick="changeLanguage('${currentLang}')"]`)?.classList.add('active');
    }
    
    updatePostsLanguage() {
        // Update sample posts with translated content
        if (this.posts.length > 0) {
            this.posts[0].content = window.i18n.t('welcomePost');
            if (this.posts[1]) this.posts[1].content = window.i18n.t('mathExamPost');
            if (this.posts[2]) this.posts[2].content = window.i18n.t('jsPost');
            this.renderPosts();
        }
    }

    setupEventListeners() {
        // Post creation
        const postInput = document.getElementById('postInput');
        if (postInput) {
            postInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.createPost();
                }
            });
        }

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.closest('.nav-link').classList.add('active');
            });
        });
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                this.posts = await response.json();
                this.renderPosts();
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            // Show sample posts if API fails
            this.posts = [
                {
                    id: '1',
                    content: window.i18n.t('welcomePost'),
                    author: 'John Doe',
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    likes: 15,
                    comments: []
                },
                {
                    id: '2',
                    content: window.i18n.t('mathExamPost'),
                    author: 'Jane Smith',
                    createdAt: new Date(Date.now() - 1800000).toISOString(),
                    likes: 8,
                    comments: []
                },
                {
                    id: '3',
                    content: window.i18n.t('jsPost'),
                    author: 'Mike Johnson',
                    createdAt: new Date(Date.now() - 900000).toISOString(),
                    likes: 12,
                    comments: []
                }
            ];
            this.renderPosts();
        }
    }

    async createPost() {
        const postInput = document.getElementById('postInput');
        const content = postInput.value.trim();
        
        if (!content) return;

        const newPost = {
            content: content,
            author: this.currentUser.name
        };

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost)
            });

            if (response.ok) {
                const post = await response.json();
                this.posts.unshift(post);
                this.renderPosts();
                postInput.value = '';
            }
        } catch (error) {
            console.error('Error creating post:', error);
            // Fallback: add post locally
            const fallbackPost = {
                id: Date.now().toString(),
                content: content,
                author: this.currentUser.name,
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: []
            };
            this.posts.unshift(fallbackPost);
            this.renderPosts();
            postInput.value = '';
        }
    }

    async likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                post.likes = result.likes;
                this.renderPosts();
            }
        } catch (error) {
            console.error('Error liking post:', error);
            // Fallback: increment locally
            post.likes = (post.likes || 0) + 1;
            this.renderPosts();
        }
    }

    renderPosts() {
        const container = document.getElementById('postsContainer');
        if (!container) return;

        container.innerHTML = this.posts.map(post => this.createPostHTML(post)).join('');

        // Add event listeners for post actions
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.post').dataset.postId;
                this.likePost(postId);
            });
        });
    }

    createPostHTML(post) {
        const timeAgo = this.getTimeAgo(post.createdAt);
        const likesText = post.likes ? `${post.likes} like${post.likes !== 1 ? 's' : ''}` : '';
        
        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="post-author">${post.author}</div>
                        <div class="post-time">${timeAgo}</div>
                    </div>
                </div>
                
                <div class="post-content">
                    ${post.content}
                </div>
                
                ${likesText ? `<div class="post-stats">${likesText}</div>` : ''}
                
                <div class="post-actions">
                    <button class="post-action like-btn">
                        <i class="fas fa-thumbs-up"></i>
                        <span data-i18n="like">Like</span>
                    </button>
                    <button class="post-action">
                        <i class="fas fa-comment"></i>
                        <span data-i18n="comment">Comment</span>
                    </button>
                    <button class="post-action">
                        <i class="fas fa-share"></i>
                        <span data-i18n="share">Share</span>
                    </button>
                </div>
            </div>
        `;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        
        return postTime.toLocaleDateString();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.iLoveSchool = new ILoveSchool();
});

// Global function for inline event handlers
function createPost() {
    if (window.iLoveSchool) {
        window.iLoveSchool.createPost();
    }
}

// Language toggle functions
function toggleLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    const btn = document.querySelector('.lang-btn');
    
    menu.classList.toggle('show');
    btn.classList.toggle('active');
    
    // Prevent event bubbling
    event.stopPropagation();
}

function changeLanguage(lang) {
    // Change language
    window.i18n.setLanguage(lang);
    
    // Update language display
    if (window.iLoveSchool) {
        window.iLoveSchool.updateLanguageDisplay();
        window.iLoveSchool.updatePostsLanguage();
    }
    
    // Update post input placeholder
    const postInput = document.getElementById('postInput');
    if (postInput) {
        postInput.placeholder = window.i18n.t('postPlaceholder');
    }
    
    // Close menu
    document.getElementById('languageMenu').classList.remove('show');
    document.querySelector('.lang-btn').classList.remove('active');
    
    // Prevent navigation
    event.preventDefault();
    return false;
}