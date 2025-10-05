# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bookmark Alpha is a groundbreaking visual bookmark management system that evolved from a furniture catalog. It's designed to display bookmarks as rich visual cards with automatic image fetching, particularly optimized for YouTube videos, GitHub repos, and other media-rich content.

## Development Commands

```bash
# Static version (primary mode - uses localStorage)
python3 -m http.server 8000
# Access at: http://localhost:8000

# Backend version with SQLite (legacy from furniture catalog origins)
npm install
npm start
# Access at: http://localhost:3000
```

## Architecture

### Dual Mode Operation
1. **Static Mode** (Primary): `index.html` + `app-static.js` - Runs entirely in browser with localStorage
2. **Server Mode** (Legacy): `server.js` + `public/` folder - Express backend with SQLite database

### Key Files
- `index.html` - Main bookmark manager interface (static version)
- `app-static.js` - Core bookmark functionality with rich image fetching
- `server.js` - Express server (legacy, from furniture catalog origins)
- `public/` - Legacy furniture catalog files (being phased out)

### Image Fetching System

The `getBestImageUrl()` function in `app-static.js` implements smart image detection:

```javascript
// YouTube videos → maxresdefault thumbnails
https://img.youtube.com/vi/{videoId}/maxresdefault.jpg

// GitHub repos → social preview cards
https://opengraph.githubassets.com/1/{owner}/{repo}

// Other sites → screenshot services as fallback
```

### Data Storage
- **localStorage key**: `bookmarkAlpha` - Stores all bookmarks as JSON array
- **Bookmark Structure**:
  ```javascript
  {
    id: string,
    title: string,
    url: string,
    category: string,
    description: string,
    imageUrl: string,  // Auto-fetched based on URL type
    favorite: boolean,
    dateAdded: ISO string
  }
  ```

## GitHub Pages Deployment

The site is deployed at: https://franzenjb.github.io/bookmark-alpha/

```bash
# Deploy changes
git add .
git commit -m "description"
git push
# Wait 2-3 minutes for GitHub Pages to update
```

## Important Context

### Mixed Codebase Warning
This repository contains mixed artifacts from its evolution:
- Originally a furniture catalog with backend
- Transformed into a bookmark manager
- The `public/` folder and `server.js` are legacy code
- Focus development on `index.html` and `app-static.js`

### Image Enhancement Priority
Users expect rich visual previews, especially for:
- YouTube videos (full video thumbnails, not just favicons)
- GitHub repositories (social cards)
- News articles (screenshot previews)

### Browser HTML Import
The bookmark import feature expects Chrome's bookmark export format:
- File → Bookmarks → Bookmark Manager → Export
- Parses `<a>` tags from the HTML file
- Auto-assigns to "Imported" category

## Known Issues & Solutions

### Images Not Loading
- Screenshot services have rate limits
- Fallback chain: Platform-specific → Screenshot service → Large favicon
- Some services require API keys for production use

### Mixed Content (Furniture References)
- Some UI still references "furniture" from original codebase
- Safe to rename these to "bookmark" or "item" as needed
- Database table is still named `furniture` in SQLite version

### localStorage Limitations
- Data persists only in the same browser/device
- No sync across devices without backend
- Export/import JSON feature provides manual backup

## Future Enhancements Discussed

1. **Screen Capture Integration**: Real browser extension or API service for actual page screenshots
2. **Open Graph Parsing**: Fetch actual meta tags from websites for better images/descriptions
3. **Sync Service**: Optional backend for cross-device bookmark sync
4. **Browser Extension**: Direct bookmark saving from any webpage
5. **Categories Auto-Detection**: Smart categorization based on URL patterns