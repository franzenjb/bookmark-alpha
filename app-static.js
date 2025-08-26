// Bookmark Alpha - Visual Bookmark Manager
// Groundbreaking bookmark visualization with screen capture

let bookmarks = [];
let currentView = 'grid';
let editingId = null;

// Load bookmarks from localStorage on startup
function loadBookmarks() {
    const stored = localStorage.getItem('bookmarkAlpha');
    if (stored) {
        bookmarks = JSON.parse(stored);
        renderBookmarks();
        updateStats();
        updateCategoryFilter();
    }
}

// Save bookmarks to localStorage
function saveToStorage() {
    localStorage.setItem('bookmarkAlpha', JSON.stringify(bookmarks));
}

// Add new bookmark
function addBookmark() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Bookmark';
    document.getElementById('bookmarkForm').reset();
    document.getElementById('bookmarkModal').classList.add('active');
}

// Edit existing bookmark
function editBookmark(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;
    
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Bookmark';
    document.getElementById('title').value = bookmark.title;
    document.getElementById('url').value = bookmark.url;
    document.getElementById('category').value = bookmark.category || '';
    document.getElementById('description').value = bookmark.description || '';
    document.getElementById('imageUrl').value = bookmark.imageUrl || '';
    document.getElementById('bookmarkModal').classList.add('active');
}

// Save bookmark (add or edit)
function saveBookmark() {
    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const category = document.getElementById('category').value || 'Uncategorized';
    const description = document.getElementById('description').value;
    let imageUrl = document.getElementById('imageUrl').value;
    
    if (!title || !url) {
        alert('Please fill in required fields');
        return;
    }
    
    // If no image URL provided, try to get best possible image
    if (!imageUrl) {
        imageUrl = getBestImageUrl(url, title) || getFaviconUrl(url);
    }
    
    const bookmark = {
        id: editingId || Date.now().toString(),
        title,
        url,
        category,
        description,
        imageUrl,
        favorite: editingId ? bookmarks.find(b => b.id === editingId).favorite : false,
        dateAdded: editingId ? bookmarks.find(b => b.id === editingId).dateAdded : new Date().toISOString()
    };
    
    if (editingId) {
        const index = bookmarks.findIndex(b => b.id === editingId);
        bookmarks[index] = bookmark;
    } else {
        bookmarks.unshift(bookmark);
    }
    
    saveToStorage();
    renderBookmarks();
    updateStats();
    updateCategoryFilter();
    closeModal();
}

// Delete bookmark
function deleteBookmark(id) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
        bookmarks = bookmarks.filter(b => b.id !== id);
        saveToStorage();
        renderBookmarks();
        updateStats();
    }
}

// Toggle favorite
function toggleFavorite(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
        bookmark.favorite = !bookmark.favorite;
        saveToStorage();
        renderBookmarks();
        updateStats();
    }
}

// Get best possible image for a URL
function getBestImageUrl(url, title) {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // YouTube video thumbnail
        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            let videoId = null;
            
            // Extract video ID from various YouTube URL formats
            if (domain.includes('youtube.com')) {
                const params = new URLSearchParams(urlObj.search);
                videoId = params.get('v');
            } else if (domain.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            }
            
            if (videoId) {
                // Return high quality YouTube thumbnail
                return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
        }
        
        // Twitter/X images
        if (domain.includes('twitter.com') || domain.includes('x.com')) {
            // Twitter card image (would need API or proxy to fetch actual image)
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
        }
        
        // GitHub repository social preview
        if (domain.includes('github.com')) {
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            if (pathParts.length >= 2) {
                const owner = pathParts[0];
                const repo = pathParts[1];
                // GitHub social preview image
                return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
            }
        }
        
        // Medium articles
        if (domain.includes('medium.com')) {
            // Medium typically has good meta images but we'd need to fetch them
            return `https://miro.medium.com/max/1200/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg`;
        }
        
        // Reddit posts
        if (domain.includes('reddit.com')) {
            return `https://www.redditstatic.com/desktop2x/img/renderTimingPixel.png`;
        }
        
        // News sites - try to use Open Graph image API service
        if (domain.includes('nytimes.com') || domain.includes('bbc.com') || 
            domain.includes('cnn.com') || domain.includes('reuters.com')) {
            // Use a screenshot service as fallback
            return `https://image.thum.io/get/width/1200/crop/630/https://${domain}`;
        }
        
        // For other sites, try to use a screenshot service
        // Note: These services may have rate limits or require API keys
        return `https://api.screenshotmachine.com?key=free&url=${encodeURIComponent(url)}&dimension=1024x768`;
        
    } catch {
        // Fallback to large favicon
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
        } catch {
            return '';
        }
    }
}

// Get favicon URL from a website URL (fallback)
function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
        return '';
    }
}

// Render bookmarks based on current view
function renderBookmarks() {
    const container = document.getElementById('bookmarksContainer');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    const favoritesOnly = document.getElementById('favoritesOnly').checked;
    
    let filtered = bookmarks.filter(bookmark => {
        const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm) ||
                             bookmark.url.toLowerCase().includes(searchTerm) ||
                             (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !selectedCategory || bookmark.category === selectedCategory;
        const matchesFavorite = !favoritesOnly || bookmark.favorite;
        
        return matchesSearch && matchesCategory && matchesFavorite;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No bookmarks found</h2>
                <p>Try adjusting your filters or add some bookmarks</p>
            </div>
        `;
        return;
    }
    
    if (currentView === 'grid') {
        renderGrid(filtered, container);
    } else {
        renderList(filtered, container);
    }
}

// Render grid view
function renderGrid(bookmarks, container) {
    container.innerHTML = `
        <div class="bookmarks-grid">
            ${bookmarks.map(bookmark => `
                <div class="bookmark-card">
                    <div class="bookmark-image" onclick="window.open('${bookmark.url}', '_blank')">
                        ${bookmark.imageUrl 
                            ? `<img src="${bookmark.imageUrl}" alt="${bookmark.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='🔖';">`
                            : '🔖'}
                    </div>
                    <div class="bookmark-content">
                        <div class="bookmark-title">${bookmark.title}</div>
                        <div class="bookmark-url">${new URL(bookmark.url).hostname}</div>
                        ${bookmark.description ? `<div style="color: #718096; font-size: 13px; margin-top: 8px;">${bookmark.description}</div>` : ''}
                        <div class="bookmark-meta">
                            <span class="bookmark-category">${bookmark.category}</span>
                            <div class="bookmark-actions">
                                <button class="action-btn favorite-btn ${bookmark.favorite ? 'active' : ''}" onclick="toggleFavorite('${bookmark.id}')">
                                    ${bookmark.favorite ? '⭐' : '☆'}
                                </button>
                                <button class="action-btn" onclick="editBookmark('${bookmark.id}')">✏️</button>
                                <button class="action-btn" onclick="deleteBookmark('${bookmark.id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render list view
function renderList(bookmarks, container) {
    container.innerHTML = `
        <div class="list-view">
            ${bookmarks.map(bookmark => `
                <div class="list-item">
                    <div class="list-thumbnail">
                        ${bookmark.imageUrl 
                            ? `<img src="${bookmark.imageUrl}" alt="${bookmark.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='🔖';">`
                            : '🔖'}
                    </div>
                    <div class="list-content">
                        <div class="list-title">${bookmark.title}</div>
                        <div class="list-url">${bookmark.url}</div>
                    </div>
                    <span class="bookmark-category">${bookmark.category}</span>
                    <div class="bookmark-actions">
                        <button class="action-btn favorite-btn ${bookmark.favorite ? 'active' : ''}" onclick="toggleFavorite('${bookmark.id}')">
                            ${bookmark.favorite ? '⭐' : '☆'}
                        </button>
                        <button class="action-btn" onclick="editBookmark('${bookmark.id}')">✏️</button>
                        <button class="action-btn" onclick="window.open('${bookmark.url}', '_blank')">🔗</button>
                        <button class="action-btn" onclick="deleteBookmark('${bookmark.id}')">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Update statistics
function updateStats() {
    const categories = [...new Set(bookmarks.map(b => b.category))];
    const favorites = bookmarks.filter(b => b.favorite);
    const today = new Date().toDateString();
    const todayBookmarks = bookmarks.filter(b => new Date(b.dateAdded).toDateString() === today);
    
    document.getElementById('totalCount').textContent = bookmarks.length;
    document.getElementById('categoryCount').textContent = categories.length;
    document.getElementById('favoriteCount').textContent = favorites.length;
    document.getElementById('todayCount').textContent = todayBookmarks.length;
}

// Update category filter dropdown
function updateCategoryFilter() {
    const categories = [...new Set(bookmarks.map(b => b.category))].sort();
    const select = document.getElementById('categoryFilter');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    
    select.value = currentValue;
    
    // Also update datalist for form
    const datalist = document.getElementById('categories');
    datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
}

// Set view (grid or list)
function setView(view) {
    currentView = view;
    document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    renderBookmarks();
}

// Close modal
function closeModal() {
    document.getElementById('bookmarkModal').classList.remove('active');
    document.getElementById('bookmarkForm').reset();
    editingId = null;
}

// Import bookmarks from browser HTML export
function importBookmarks() {
    document.getElementById('fileInput').click();
}

// Handle import file
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(e.target.result, 'text/html');
        const links = doc.querySelectorAll('a');
        
        let imported = 0;
        links.forEach(link => {
            const url = link.href;
            const title = link.textContent || 'Untitled';
            
            if (url && url.startsWith('http')) {
                const bookmark = {
                    id: Date.now().toString() + Math.random(),
                    title,
                    url,
                    category: 'Imported',
                    description: '',
                    imageUrl: getBestImageUrl(url, title) || getFaviconUrl(url),
                    favorite: false,
                    dateAdded: new Date().toISOString()
                };
                
                bookmarks.push(bookmark);
                imported++;
            }
        });
        
        if (imported > 0) {
            saveToStorage();
            renderBookmarks();
            updateStats();
            updateCategoryFilter();
            alert(`Successfully imported ${imported} bookmarks!`);
        } else {
            alert('No valid bookmarks found in the file.');
        }
        
        event.target.value = ''; // Reset file input
    };
    
    reader.readAsText(file);
}

// Export bookmarks to JSON
function exportData() {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmark-alpha-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Capture screenshot (placeholder - would need backend or API)
function captureScreen() {
    alert('Screen capture feature requires browser extension or backend service.\n\nFor now, you can:\n1. Take a screenshot manually\n2. Upload it to an image host\n3. Add the image URL when creating a bookmark');
}

// Initialize search and filter listeners
document.addEventListener('DOMContentLoaded', function() {
    loadBookmarks();
    
    document.getElementById('searchInput').addEventListener('input', renderBookmarks);
    document.getElementById('categoryFilter').addEventListener('change', renderBookmarks);
    document.getElementById('favoritesOnly').addEventListener('change', renderBookmarks);
    
    // Close modal when clicking outside
    document.getElementById('bookmarkModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

// Add some demo bookmarks if empty
if (localStorage.getItem('bookmarkAlpha') === null) {
    bookmarks = [
        {
            id: '1',
            title: 'GitHub - World\'s Leading Software Development Platform',
            url: 'https://github.com',
            category: 'Development',
            description: 'Where the world builds software',
            imageUrl: 'https://github.githubassets.com/images/modules/site/social-cards/github-social.png',
            favorite: true,
            dateAdded: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Stack Overflow - Where Developers Learn & Share',
            url: 'https://stackoverflow.com',
            category: 'Development',
            description: 'The largest online community for developers',
            imageUrl: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon@2.png',
            favorite: true,
            dateAdded: new Date().toISOString()
        },
        {
            id: '3',
            title: 'MDN Web Docs',
            url: 'https://developer.mozilla.org',
            category: 'Documentation',
            description: 'Resources for developers, by developers',
            imageUrl: 'https://developer.mozilla.org/apple-touch-icon.png',
            favorite: false,
            dateAdded: new Date().toISOString()
        }
    ];
    saveToStorage();
}