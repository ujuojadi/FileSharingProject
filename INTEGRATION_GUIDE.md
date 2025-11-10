# File Sharing Application - Integration Guide

This guide explains how to run the integrated file sharing application with all components working together.

## Architecture Overview

The application consists of three main components:

1. **Go P2P Backend** (`main.go`, `server.go`) - Handles P2P file storage and networking
   - Port: `8081` (default)
   - Endpoints: `/files`, `/status`, `/start`

2. **Python FastAPI Backend** (`app/main.py`) - Handles authentication, user management, and file metadata
   - Port: `8000` (default)
   - Endpoints: `/auth/*`, `/files/*`, `/users/*`, etc.

3. **React Frontend** (`file-share-frontend/`) - User interface
   - Port: `3000` (default)
   - Connects to FastAPI backend

## Prerequisites

- Go 1.19+
- Python 3.9+
- Node.js 16+ and npm
- All dependencies installed (see below)

## Setup Instructions

### 1. Install Go Dependencies

```bash
go mod download
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd file-share-frontend
npm install
cd ..
```

## Running the Application

### Option 1: Run All Services Manually

#### Terminal 1: Start Go P2P Backend

```bash
go run main.go
```

The Go backend will start on port `8081` (default). You can configure it using:
- `--http` flag or `HTTP_PORT` environment variable
- `--p2p` flag or `P2P_ADDR` environment variable (default: `:3000`)
- `--bootstrap` flag or `BOOTSTRAP_NODE` environment variable (optional)

#### Terminal 2: Start Python FastAPI Backend

```bash
uvicorn app.main:app --reload --port 8000
```

The FastAPI backend will start on port `8000`.

**Note:** Before uploading files, you may need to verify your email. For testing, you can use the `/auth/verify` endpoint:

```bash
curl -X POST "http://localhost:8000/auth/verify" -H "Content-Type: application/json" -d '{"email": "your-email@ul.edu"}'
```

#### Terminal 3: Start React Frontend

```bash
cd file-share-frontend
npm start
```

The frontend will start on port `3000` and open in your browser.

### Option 2: Use the Makefile (if available)

Check if there's a `Makefile` with commands to run all services:

```bash
make run-all
```

## Configuration

### Environment Variables

#### Go P2P Backend
- `HTTP_PORT`: HTTP server port (default: `8081`)
- `P2P_ADDR`: P2P listen address (default: `:3000`)
- `BOOTSTRAP_NODE`: Bootstrap node address (optional)

#### Python FastAPI Backend
- `NOTESHARE_P2P_BACKEND_URL`: URL of the Go P2P backend (default: `http://localhost:8081`)
- `NOTESHARE_JWT_SECRET_KEY`: JWT secret key for tokens
- `NOTESHARE_ALLOWED_EMAIL_DOMAIN`: Allowed email domain (default: `ul.edu`)
- `NOTESHARE_CORS_ALLOW_ORIGINS`: CORS allowed origins (default: `*`)

Create a `.env` file in the root directory:

```env
NOTESHARE_P2P_BACKEND_URL=http://localhost:8081
NOTESHARE_JWT_SECRET_KEY=your-secret-key-here
NOTESHARE_ALLOWED_EMAIL_DOMAIN=ul.edu
```

## Usage

1. **Register a new user:**
   - Go to `http://localhost:3000/register`
   - Use an email ending with `@ul.edu`
   - Fill in name, email, and password

2. **Verify email (for testing):**
   ```bash
   curl -X POST "http://localhost:8000/auth/verify" \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@ul.edu"}'
   ```

3. **Login:**
   - Go to `http://localhost:3000/login`
   - Enter your email and password

4. **Upload files:**
   - After logging in, you'll be redirected to the dashboard
   - Click "Upload New Note"
   - Select a file, enter course code, and description
   - Click "Upload"

5. **Download files:**
   - Browse files in the dashboard
   - Click "Download" on any file card

## How It Works

### File Upload Flow

1. User uploads file through React frontend
2. Frontend sends file to FastAPI backend (`/files/upload`)
3. FastAPI backend:
   - Validates user authentication
   - Generates a unique file ID (UUID)
   - Uploads file to Go P2P backend using the UUID as key
   - Stores file metadata in memory repository
   - Returns file metadata to frontend

### File Download Flow

1. User clicks download on a file
2. Frontend requests file from FastAPI backend (`/files/{file_id}/download`)
3. FastAPI backend:
   - Validates user authentication
   - Retrieves file metadata
   - Downloads file from Go P2P backend using stored key
   - Returns file to frontend as a stream

### P2P Network

- The Go P2P backend handles distributed file storage
- Files are stored using Content-Addressable Storage (CAS)
- Multiple nodes can join the network using bootstrap nodes
- Files are replicated across connected peers

## Troubleshooting

### Go Backend Not Starting

- Check if port `8081` is already in use
- Verify Go is installed: `go version`
- Check for compilation errors: `go build`

### FastAPI Backend Not Starting

- Check if port `8000` is already in use
- Verify Python dependencies: `pip list`
- Check for import errors: `python -c "import app.main"`

### Frontend Not Connecting

- Verify FastAPI backend is running on port `8000`
- Check browser console for CORS errors
- Verify API URL in `file-share-frontend/src/api.js`

### File Upload Fails

- Verify Go P2P backend is running
- Check FastAPI logs for errors
- Verify user is authenticated and email is verified
- Check `NOTESHARE_P2P_BACKEND_URL` environment variable

### File Download Fails

- Verify file exists in P2P network
- Check Go P2P backend logs
- Verify file metadata exists in FastAPI backend

## Development

### Adding New Features

1. **Backend API:** Add routes in `app/api/routers/`
2. **Frontend:** Add components in `file-share-frontend/src/`
3. **P2P Storage:** Modify `server.go` and `store.go` in Go backend

### Testing

- Test Go backend: `go test ./...`
- Test Python backend: `pytest` (if tests are set up)
- Test frontend: `cd file-share-frontend && npm test`

## Notes

- Email verification is simulated (logged to console)
- File metadata is stored in memory (lost on restart)
- P2P files are persisted to disk in `{port}_network/` directories
- JWT tokens are stored in browser localStorage

## Support

For issues or questions, please check:
- Go backend logs
- FastAPI backend logs (uvicorn output)
- Browser console for frontend errors
- Network tab for API requests/responses

