# Frontend-Backend Integration Tasks

## ✅ Already Integrated

1. **Authentication**
   - ✅ Login page connected to `/login` endpoint
   - ✅ Register page connected to `/register` endpoint
   - ✅ Token storage in localStorage
   - ✅ Axios interceptors for token injection

2. **File Operations**
   - ✅ File upload connected to `/files/upload`
   - ✅ File list connected to `/files/`
   - ✅ File download connected to `/files/{id}/download`
   - ✅ File metadata fetching

3. **API Client**
   - ✅ All endpoints defined in `api.js`
   - ✅ Groups, Feedback, Search endpoints available

---

## ❌ Missing Integrations

### 1. **Search Functionality** 🔴 CRITICAL
**Current State:** Search input filters local state only
**Needs:**
- [ ] Connect search input to `/search/files` API endpoint
- [ ] Add debouncing to avoid too many API calls
- [ ] Show loading state during search
- [ ] Handle search errors
- [ ] Support search by course code, course name, description

**Location:** `file-share-frontend/src/pages/Dashboard.js` (line ~400-410)

### 2. **Groups Functionality** 🔴 CRITICAL
**Current State:** Shows hardcoded groups, buttons don't work
**Needs:**
- [ ] Fetch groups from `/groups` API endpoint
- [ ] Connect "Create / Join Group" button to create/join API
- [ ] Connect "Join Group" buttons to `/groups/{id}/join` endpoint
- [ ] Show real group data instead of hardcoded `recommendedGroups`
- [ ] Add group creation modal/dialog
- [ ] Show group members
- [ ] Display group recommendations

**Location:** `file-share-frontend/src/pages/Dashboard.js` (tab 2, line ~486-528)

### 3. **Feedback/Ratings** 🔴 CRITICAL
**Current State:** No UI to submit ratings, "Top Rated" doesn't work
**Needs:**
- [ ] Add rating UI to file cards or details dialog
- [ ] Connect rating submission to `/feedback` endpoint
- [ ] Fetch and display ratings for files
- [ ] Calculate and show average ratings
- [ ] "Top Rated" tab should fetch files sorted by rating
- [ ] Allow users to edit their feedback

**Location:** `file-share-frontend/src/pages/Dashboard.js` (tab 3, file cards)

### 4. **My Uploads Tab** 🟡 IMPORTANT
**Current State:** Shows all files, not filtered by user
**Needs:**
- [ ] Filter files by current user's ID
- [ ] Use `files.list_by_uploader()` or filter client-side
- [ ] Show only files uploaded by logged-in user

**Location:** `file-share-frontend/src/pages/Dashboard.js` (tab 1, line ~467-484)

### 5. **Protected Routes** 🟡 IMPORTANT
**Current State:** No route protection
**Needs:**
- [ ] Add route protection for `/dashboard`
- [ ] Redirect to `/login` if not authenticated
- [ ] Check token validity on route access
- [ ] Handle token expiration

**Location:** `file-share-frontend/src/App.js`

### 6. **User Profile** 🟢 NICE TO HAVE
**Current State:** User data loaded but not displayed
**Needs:**
- [ ] Display user name in dashboard header
- [ ] Add user profile page/component
- [ ] Show user's upload count, etc.

**Location:** `file-share-frontend/src/pages/Dashboard.js` (user state exists but not used)

### 7. **Error Handling Improvements** 🟡 IMPORTANT
**Current State:** Basic error handling exists
**Needs:**
- [ ] Better error messages for API failures
- [ ] Handle network errors gracefully
- [ ] Show retry options for failed requests
- [ ] Handle 401 (unauthorized) errors properly

### 8. **Loading States** 🟢 NICE TO HAVE
**Current State:** Basic loading indicator exists
**Needs:**
- [ ] Add loading states for individual operations (upload, search, etc.)
- [ ] Show skeleton loaders for file cards
- [ ] Disable buttons during operations

---

## 📋 Implementation Priority

### Phase 1: Core Features (Do First)
1. **Search Functionality** - Users expect search to work
2. **My Uploads Tab** - Basic filtering needed
3. **Protected Routes** - Security requirement

### Phase 2: Social Features (Do Second)
4. **Groups Functionality** - Create, join, view groups
5. **Feedback/Ratings** - Submit and view ratings

### Phase 3: Polish (Do Third)
6. **User Profile** - Display user info
7. **Error Handling** - Better UX
8. **Loading States** - Better UX

---

## 🎯 Quick Wins (Easy to Implement)

1. **My Uploads Tab** - Just filter `notes` by `user.id`
2. **Protected Routes** - Add simple auth check
3. **Search** - Replace local filter with API call

---

## 📝 Implementation Notes

### Search Implementation
```javascript
// Instead of filtering local state:
const filtered = notes.filter(...)

// Call API:
const searchResults = await files.search({ q: search, course_code: ... })
```

### Groups Implementation
```javascript
// Fetch groups on component mount or tab change
useEffect(() => {
  if (tab === 2) {
    groups.list().then(setGroups)
  }
}, [tab])
```

### Ratings Implementation
```javascript
// Add to file card or details dialog
const handleRating = async (fileId, rating) => {
  await feedback.submit({ file_id: fileId, user_id: user.id, rating })
  // Refresh file data
}
```

---

## ✅ Definition of "Fully Integrated"

Frontend is "fully integrated" when:
- ✅ All UI features call backend APIs
- ✅ No hardcoded data (except for placeholders)
- ✅ All user actions trigger API calls
- ✅ Data persists and syncs with backend
- ✅ Protected routes work
- ✅ Error handling is comprehensive

