# Testing Guide - File Download with P2P

## 🧪 **How to Test File Download**

### **Prerequisites:**
Make sure all services are running:
1. **Go P2P Server** (2 nodes)
2. **FastAPI Backend**
3. **React Frontend**

---

## 📋 **Step-by-Step Testing**

### **1. Start All Services**

**Terminal 1 - Go P2P Server:**
```bash
go run .
```
**Expected output:**
```
Starting P2P node 1 on :5000...
Starting P2P node 2 on :50002 (bootstrap: :5000)...
HTTP server running on :8080
P2P Network: Node 1 on :5000, Node 2 on :50002
Files will be replicated across both nodes!
```

**Terminal 2 - FastAPI Backend:**
```bash
uvicorn app.main:app --reload --port 8000
```
**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Terminal 3 - React Frontend:**
```bash
cd file-share-frontend
npm start
```
**Expected output:**
```
Compiled successfully!
You can now view file-share in the browser.
  Local:            http://localhost:3000
```

---

### **2. Test File Upload (Verify P2P Replication)**

1. **Open browser**: http://localhost:3000
2. **Login** with your credentials
3. **Click "Upload Note"** button
4. **Fill in the form:**
   - Select a file (PDF, DOCX, etc.)
   - Course Code: `CSCI 101`
   - Course Name: `Introduction to CS`
   - Description: `Test file for P2P`
5. **Click "Upload"**

**✅ Verify P2P Replication:**
- Check Terminal 1 (Go server) - should see:
  ```
  Creating directory: _50002_network/...
  written X bytes to disk
  received and written bytes to disk X
  ```
- Check your project directory:
  - Files should exist in `_50002_network/` (Node 2)
  - Files should exist in `_5000_network/` (Node 1)
  - **Both directories should have the same file!**

---

### **3. Test File Download**

1. **On Dashboard**, you should see your uploaded file
2. **Click on the file card** (opens details dialog)
3. **Click "Download" button**

**✅ Expected Behavior:**
- File should download to your Downloads folder
- Filename should match the original file name
- File should be complete and openable

**✅ Check Browser Console (F12):**
- Should see: `DOWNLOAD NOTE OBJECT: {id: "...", name: "...", ...}`
- No errors should appear

**✅ Check Network Tab (F12 → Network):**
- Should see request to: `http://localhost:8000/files/{id}/download`
- Status: `200 OK`
- Response type: `blob`

---

### **4. Test P2P Network Retrieval**

**Scenario: File on Node 1, request from Node 2**

1. **Stop Node 2** (the one handling HTTP requests)
   - In Terminal 1, press `Ctrl+C`
   - Comment out Node 2 in `main.go` temporarily
   - Restart: `go run .` (only Node 1 runs)

2. **Upload a file** (goes to Node 1 only)

3. **Restart with both nodes** (uncomment Node 2)

4. **Try to download** the file
   - Should still work because Node 2 can request from Node 1
   - This tests true P2P retrieval

---

### **5. Verify P2P Storage Directories**

**Check file storage:**
```bash
# Windows PowerShell
dir _5000_network
dir _50002_network

# Should see same files in both directories (replicated)
```

**File structure:**
```
_5000_network/
  └── [hash1]/
      └── [hash2]/
          └── [file]

_50002_network/
  └── [hash1]/
      └── [hash2]/
          └── [file]  (same file, replicated)
```

---

## 🐛 **Troubleshooting**

### **Download fails with 404:**
- Check FastAPI logs - is P2P key correct?
- Check Go server logs - is file in storage?
- Verify file exists in `_50002_network/` or `_5000_network/`

### **Download fails with CORS error:**
- Make sure FastAPI CORS is configured (should be fixed)
- Check browser console for exact error

### **File not replicating:**
- Check Go server logs for peer connection
- Verify both nodes are running
- Check for "connected with remote" messages

### **Download button does nothing:**
- Check browser console for JavaScript errors
- Verify `note.id` exists (not `note.ID`)
- Check Network tab for failed requests

---

## ✅ **Success Criteria**

- [ ] File uploads successfully
- [ ] File appears in both `_5000_network/` and `_50002_network/`
- [ ] File appears in Dashboard file list
- [ ] Download button works
- [ ] File downloads with correct name
- [ ] Downloaded file opens correctly
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## 📊 **What to Check in Logs**

**Go Server (Terminal 1):**
```
✅ "Starting P2P node 1 on :5000..."
✅ "Starting P2P node 2 on :50002..."
✅ "connected with remote ..."
✅ "written X bytes to disk"
✅ "received and written bytes to disk X"
✅ "File (key) found in local P2P storage"
```

**FastAPI (Terminal 2):**
```
✅ "POST /files/upload" - 201 Created
✅ "GET /files/{id}/download" - 200 OK
✅ No 500 errors
```

**Browser Console (F12):**
```
✅ "DOWNLOAD NOTE OBJECT: {...}"
✅ No red errors
✅ Network requests return 200
```

