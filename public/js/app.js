// I Love School JavaScript

class ILoveSchool {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.posts = [];
        this.selectedMedia = null;
        this.selectedFeeling = null;
        this.init();
    }
    
    getCurrentUser() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        return { name: 'Guest', id: null };
    }

    async init() {
        this.updateUserDisplay();
        await this.loadPosts();
        this.setupEventListeners();
        this.initializeLanguage();
    }
    
    updateUserDisplay() {
        const navUserName = document.getElementById('navUserName');
        const sidebarUserName = document.getElementById('sidebarUserName');
        
        if (navUserName) navUserName.textContent = this.currentUser.name;
        if (sidebarUserName) sidebarUserName.textContent = this.currentUser.name;
        
        // Update post input placeholder
        const postInput = document.getElementById('postInput');
        if (postInput && this.currentUser.name !== 'Guest') {
            postInput.placeholder = `What's on your mind, ${this.currentUser.name}?`;
        }
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
        
        if (!content && !this.selectedMedia) {
            alert('Please write something or select media to post.');
            return;
        }
        
        if (!this.currentUser.id) {
            alert('Please log in to create posts.');
            window.location.href = '/login';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('userId', this.currentUser.id);
            
            if (this.selectedFeeling) {
                formData.append('feeling', this.selectedFeeling);
            }
            
            if (this.selectedMedia) {
                formData.append('media', this.selectedMedia);
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const post = await response.json();
                await this.loadPosts(); // Reload to get proper post data with author info
                postInput.value = '';
                this.clearPostCreator();
            } else {
                const error = await response.json();
                alert(`Failed to create post: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    }
    
    clearPostCreator() {
        this.selectedMedia = null;
        this.selectedFeeling = null;
        document.getElementById('mediaPreview').style.display = 'none';
        document.getElementById('feelingDisplay').style.display = 'none';
        document.getElementById('mediaInput').value = '';
    }

    async likePost(postId) {
        if (!this.currentUser.id) {
            alert('Please log in to like posts.');
            window.location.href = '/login';
            return;
        }

        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: this.currentUser.id })
            });

            if (response.ok) {
                const result = await response.json();
                await this.loadPosts(); // Reload to get updated like counts
            } else {
                const error = await response.json();
                alert(`Failed to like post: ${error.error}`);
            }
        } catch (error) {
            console.error('Error liking post:', error);
            alert('Failed to like post. Please try again.');
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
        const timeAgo = this.getTimeAgo(post.created_at);
        const authorName = post.author_name || post.author || 'Unknown User';
        const likesCount = post.likes_count || 0;
        const likesText = likesCount > 0 ? `${likesCount} like${likesCount !== 1 ? 's' : ''}` : '';
        
        // Media content
        let mediaHTML = '';
        if (post.image_url) {
            mediaHTML = `<div class="post-media"><img src="${post.image_url}" alt="Post image" onclick="openImageModal('${post.image_url}')"></div>`;
        } else if (post.video_url) {
            mediaHTML = `<div class="post-media"><video controls><source src="${post.video_url}" type="video/mp4">Your browser does not support the video tag.</video></div>`;
        }
        
        // Feeling content
        let feelingHTML = '';
        if (post.feeling) {
            feelingHTML = `<div class="post-feeling">is feeling ${post.feeling}</div>`;
        }
        
        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="post-author">${authorName} ${feelingHTML}</div>
                        <div class="post-time">${timeAgo}</div>
                    </div>
                </div>
                
                <div class="post-content">
                    ${post.content}
                </div>
                
                ${mediaHTML}
                
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

function logout() {
    localStorage.removeItem('currentUser');
    alert('You have been logged out. Redirecting to login page...');
    window.location.href = '/login';
}

// Media Upload Functions
function handleMediaUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    window.iLoveSchool.selectedMedia = file;
    
    const preview = document.getElementById('mediaPreview');
    const previewContent = document.getElementById('previewContent');
    
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        img.style.borderRadius = '8px';
        previewContent.innerHTML = '';
        previewContent.appendChild(img);
    } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '300px';
        video.style.borderRadius = '8px';
        previewContent.innerHTML = '';
        previewContent.appendChild(video);
    }
    
    preview.style.display = 'block';
}

function removeMedia() {
    window.iLoveSchool.selectedMedia = null;
    document.getElementById('mediaPreview').style.display = 'none';
    document.getElementById('mediaInput').value = '';
}

// Feeling Functions
function showFeelingModal() {
    document.getElementById('feelingModal').style.display = 'block';
}

function closeFeelingModal() {
    document.getElementById('feelingModal').style.display = 'none';
}

function selectFeeling(feeling) {
    window.iLoveSchool.selectedFeeling = feeling;
    document.getElementById('feelingText').textContent = `feeling ${feeling}`;
    document.getElementById('feelingDisplay').style.display = 'block';
    closeFeelingModal();
}

function removeFeeling() {
    window.iLoveSchool.selectedFeeling = null;
    document.getElementById('feelingDisplay').style.display = 'none';
}

// Image Modal for viewing full size
function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center;';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 8px;';
    
    modal.appendChild(img);
    modal.onclick = () => document.body.removeChild(modal);
    
    document.body.appendChild(modal);
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