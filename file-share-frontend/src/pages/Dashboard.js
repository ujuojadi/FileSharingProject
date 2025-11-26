import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Modal,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import StarIcon from "@mui/icons-material/Star";
import GroupsIcon from "@mui/icons-material/Groups";
import NoteIcon from "@mui/icons-material/Note";
import { files, groups, feedback, users, auth } from "../api";
import { useNavigate} from "react-router-dom"

function Dashboard() {
  // User state
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(0);

  // Upload modal state
  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");

  // Notes state
  const [notes, setNotes] = useState([]); // all files
  const [myNotes, setMyNotes] = useState([]); // current user's uploads
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching, [] = search returned empty, [items] = search results
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Details dialog
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

    const recommendedGroups = [
    { id: 1, name: "CSCI 475 - Distributed Systems", members: 34 },
    { id: 2, name: "MATH 301 - Linear Algebra", members: 28 },
    { id: 3, name: "ENGL 202 - Technical Writing", members: 19 },
  ];

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Helper function to map file data
  const mapFileData = (file) => ({
    id: file.id,
    name: file.filename,
    size: file.size_bytes,
    courseCode: file.course_code || "",
    courseName: file.course_name || "",
    description: file.description || "",
    uploadedAt: new Date(file.uploaded_at),
    type: file.content_type || "application/octet-stream",
    rating: "4.0",
    fileId: file.id,
    uploaderId: file.uploader_id,
    preview: null,
  });

  // Load user profile and files from backend
  useEffect(() => {
    const loadUserAndData = async () => {
      try {
          const userResponse = await users.getProfile();
          setUser(userResponse.data);

          // Fetch all files and user's files
          const [allResp, mineResp] = await Promise.all([files.list(), files.listMine()]);
          const mappedAll = allResp.data.map(mapFileData);
          const mappedMine = mineResp.data.map(mapFileData);
          setNotes(mappedAll);
          setMyNotes(mappedMine);

          // Automatically fetch previews for the first set of image/pdf files (limit to avoid overload)
          // We'll fetch previews for up to 12 files across the lists.
          const toPreview = [];
          for (const f of mappedMine) {
            if (toPreview.length >= 12) break;
            if (f.type.startsWith("image/") || f.type === "application/pdf") toPreview.push(f);
          }
          for (const f of mappedAll) {
            if (toPreview.length >= 12) break;
            // avoid duplicates already in mine
            if (toPreview.find((t) => t.id === f.id)) continue;
            if (f.type.startsWith("image/") || f.type === "application/pdf") toPreview.push(f);
          }

          // Fetch previews sequentially to be gentle on the server
          const createdUrls = [];
          for (const f of toPreview) {
            try {
              const resp = await files.download(f.fileId);
              const blob = new Blob([resp.data], { type: f.type });
              const url = window.URL.createObjectURL(blob);
              createdUrls.push(url);
              setNotes((prev) => prev.map((item) => (item.id === f.id ? { ...item, preview: url } : item)));
              setMyNotes((prev) => prev.map((item) => (item.id === f.id ? { ...item, preview: url } : item)));
            } catch (err) {
              // ignore individual preview failures
              console.debug("Preview fetch failed for", f.id, err);
            }
          }

          // cleanup: revoke created object URLs when component unmounts
          // we'll attach cleanup via a small timeout to allow setState to settle
          setTimeout(() => {
            // store createdUrls on window to revoke later if needed
            (window.__notes_previews__ = window.__notes_previews__ || []).push(...createdUrls);
          }, 0);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadUserAndData();
  }, []);

  // Cleanup any created object URLs on unmount
  useEffect(() => {
    return () => {
      const arr = window.__notes_previews__ || [];
      arr.forEach((u) => {
        try {
          window.URL.revokeObjectURL(u);
        } catch (e) {
          // ignore
        }
      });
      window.__notes_previews__ = [];
    };
  }, []);

  // Debounced search effect
  useEffect(() => {
    // If search is empty, clear search results and show all files
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }

    // Debounce search API call
    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await files.search({ q: search.trim() });
        const mappedResults = response.data.map(mapFileData);
        setSearchResults(mappedResults);
      } catch (err) {
        console.error("Search failed:", err);
        setSnackbar({
          open: true,
          message: "Search failed. Please try again.",
          severity: "error"
        });
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Tab handlers
  const handleTabChange = (_, newValue) => setTab(newValue);

  // Upload modal handlers
  const openUploadModal = () => setOpenUpload(true);
  const closeUploadModal = () => {
    setOpenUpload(false);
    setFile(null);
    setCourseCode("");
    setCourseName("");
    setDescription("");
  };

  // Handle file upload to backend
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseCode) {
      setSnackbar({
        open: true,
        message: "Please choose a file and enter a course code.",
        severity: "error"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await files.upload(file, {
        courseCode,
        courseName,
        description,
      });
      
      // Add uploaded file to the list
      const newNote = {
        id: response.data.id,
        name: response.data.filename,
        size: response.data.size_bytes,
        courseCode: response.data.course_code || "",
        courseName: response.data.course_name || "",
        description: response.data.description || "",
        uploadedAt: new Date(response.data.uploaded_at),
        type: response.data.content_type || "application/octet-stream",
        rating: "4.0",
        fileId: response.data.id,
        uploaderId: response.data.uploader_id,
      };
      
      setNotes((prev) => [newNote, ...prev]);
      setMyNotes((prev) => [newNote, ...prev]);
      closeUploadModal();
      setSnackbar({
        open: true,
        message: "File uploaded successfully!",
        severity: "success"
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Upload failed. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get data to display: search results if searching, otherwise all notes
  const dataToDisplay = searchResults !== null ? searchResults : (tab === 1 ? myNotes : notes);

  // Sort the data
  const filtered = [...dataToDisplay].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return a.size - b.size;
    if (sortBy === "date") return b.uploadedAt - a.uploadedAt; // Date subtraction works
    return 0;
  });

  // Card click: show details
  const handleCardClick = (note) => {
    const openWithPreview = async () => {
      let noteWithPreview = note;
      if (!note.preview && (note.type.startsWith("image/") || note.type === "application/pdf")) {
        try {
          const resp = await files.download(note.fileId);
          const blob = new Blob([resp.data], { type: note.type });
          const url = window.URL.createObjectURL(blob);
          // persist on lists
          setNotes((prev) => prev.map((f) => (f.id === note.id ? { ...f, preview: url } : f)));
          setMyNotes((prev) => prev.map((f) => (f.id === note.id ? { ...f, preview: url } : f)));
          (window.__notes_previews__ = window.__notes_previews__ || []).push(url);
          noteWithPreview = { ...note, preview: url };
        } catch (err) {
          console.debug("Failed to load detail preview", err);
        }
      }
      // Fetch uploader info for display (best-effort)
      try {
        if (noteWithPreview.uploaderId) {
          const resp = await users.getOne(noteWithPreview.uploaderId);
          const uploader = resp.data;
          noteWithPreview = { ...noteWithPreview, uploaderName: uploader.full_name || uploader.email };
        }
      } catch (e) {
        // ignore fetching uploader
      }
      setSelectedNote(noteWithPreview);
      setOpenDetails(true);
    };
    openWithPreview();
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedNote(null);
  };

  // Handle file download from backend
  const handleDownload = async (note) => {
    if (!note || !note.fileId) return;
    try {
      const response = await files.download(note.fileId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = note.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Download failed. Please try again.",
        severity: "error"
      });
    }
  };

  // Create/Join Group button leads to groups page
  const navigate = useNavigate();
  const handleCreateJoinGroup = () => {
    navigate('/groups');
  };

  // UI for rendering cards (keeps fixed height & truncation)
  const renderCards = (data) => {
    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                height: 360, // fixed height for uniformity
                width: 262,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => handleCardClick(item)}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  noWrap
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {item.courseCode}
                </Typography>

                {item.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      maxHeight: 40,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.description}
                  </Typography>
                )}

                {/* preview area */}
                <Box sx={{ mt: 2, height: 160 }}>
                  {item.preview ? (
                    item.type.startsWith("image/") ? (
                      <CardMedia
                        component="img"
                        image={item.preview}
                        alt={item.name}
                        sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 1 }}
                      />
                    ) : item.type === "application/pdf" ? (
                      <iframe
                        src={item.preview}
                        title={item.name}
                        style={{ width: "100%", height: "100%", border: "1px solid #eee", borderRadius: 8 }}
                        onClick={(ev) => ev.stopPropagation()}
                      />
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f4f4f4", borderRadius: 1 }}>
                        <UploadFileIcon sx={{ fontSize: 48, color: "#888" }} />
                      </Box>
                    )
                  ) : (
                    // Lazy-load previews for images and PDFs
                    (item.type.startsWith("image/") || item.type === "application/pdf") ? (
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f4f4f4", borderRadius: 1 }}>
                        <Button
                          variant="text"
                          onClick={async (ev) => {
                            ev.stopPropagation();
                            try {
                              const resp = await files.download(item.fileId);
                              const blob = new Blob([resp.data], { type: item.type });
                              const url = window.URL.createObjectURL(blob);
                              // update state (notes or myNotes)
                              setNotes((prev) => prev.map((f) => (f.id === item.id ? { ...f, preview: url } : f)));
                              setMyNotes((prev) => prev.map((f) => (f.id === item.id ? { ...f, preview: url } : f)));
                            } catch (err) {
                              setSnackbar({ open: true, message: "Failed to load preview", severity: "error" });
                            }
                          }}
                        >
                          Load preview
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f4f4f4", borderRadius: 1 }}>
                        <UploadFileIcon sx={{ fontSize: 48, color: "#888" }} />
                      </Box>
                    )
                  )}
                </Box>

                {/* File info */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {(item.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StarIcon sx={{ color: "#ffb400", fontSize: 18 }} />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {item.rating} / 5
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={(ev) => {
                    ev.stopPropagation(); // prevent opening details
                    handleDownload(item);
                  }}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {data.length === 0 && (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ width: "100%", mt: 4 }}
          >
            {searchResults !== null && search.trim()
              ? "No notes found matching your search."
              : "No notes found."}
          </Typography>
        )}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1976d2 30%, #43a047 100%)",
        color: "white",
      }}
    >
      {/* translucent appbar */}
      <AppBar
        position="static"
        sx={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Dashboard
          </Typography>
          {/* <Button 
            color="inherit" 
            onClick={async () => {
              try {
                await auth.logout();
                window.location.href = "/login";
              } catch (err) {
                console.error("Logout failed:", err);
                setSnackbar({
                  open: true,
                  message: "Logout failed. Please try again.",
                  severity: "error"
                });
              }
            }}
          >
            Logout
          </Button> */}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {/* search + sort */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {`Welcome back, ${user?.full_name || user?.email || "Student"} 👋`}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                width: 400,
                borderRadius: 3,
                px: 2,
                position: "relative",
              }}
            >
              <SearchIcon sx={{ color: "text.secondary" }} />
              <TextField
                variant="standard"
                placeholder="Search notes..."
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ ml: 1 }}
                disabled={searchLoading}
              />
              {searchLoading && (
                <LinearProgress
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                  }}
                />
              )}
            </Paper>

            <FormControl
              size="small"
              sx={{
                background: "white",
                borderRadius: 2,
                minWidth: 140,
              }}
            >
              <Select
                displayEmpty
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                renderValue={(value) => {
                  if (value === "") {
                    return <em>Sort by</em>;
                  }
                  return value.charAt(0).toUpperCase() + value.slice(1);
                }}
              >
                <MenuItem value="">
                  <em>Sort by</em>
                </MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="size">Size</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* tabs and content card */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            background: "rgba(255,255,255,0.95)",
            color: "black",
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab icon={<NoteIcon />} label="All Notes" />
            <Tab icon={<UploadFileIcon />} label="My Uploads" />
            <Tab icon={<GroupsIcon />} label="Groups" />
            <Tab icon={<StarIcon />} label="Top Rated" />
          </Tabs>

          {/* Tab panels */}
          {tab === 0 && renderCards(filtered)}
          {tab === 1 && (
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={openUploadModal}
                sx={{
                  mb: 3,
                  background: "linear-gradient(90deg, #1976d2, #43a047)",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Upload New Note
              </Button>

              {renderCards(filtered)}
            </Box>
          )}
          {tab === 2 && (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography variant="h6" gutterBottom>
                My Groups
              </Typography>

              <Button
                variant="contained"
                startIcon={<GroupsIcon />}
                sx={{
                  mb: 3,
                  background: "linear-gradient(90deg, #1976d2, #43a047)",
                  color: "white",
                }}
                onClick={handleCreateJoinGroup}
              >
                Create / Join Group
              </Button>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                Recommended for You:
              </Typography>

              <Grid container spacing={2} justifyContent="center">
                {recommendedGroups.map((g) => (
                  <Grid item xs={12} sm={6} md={4} key={g.id}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {g.members} members
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{ mt: 1, color: "#1976d2", borderColor: "#1976d2" }}
                      >
                        Join Group
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          {tab === 3 && renderCards(filtered)}
        </Paper>
      </Container>

      {/* Upload Modal */}
      <Modal open={openUpload} onClose={closeUploadModal}>
        <Box
          component="form"
          onSubmit={handleUploadSubmit}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" mb={2}>
            Upload a New Note
          </Typography>

          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            fullWidth
            sx={{
              mb: 2,
              background: "linear-gradient(90deg, #1976d2, #43a047)",
              color: "white",
            }}
          >
            Choose File
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0] ?? null)}
            />
          </Button>

          {file && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {file.name}
            </Typography>
          )}

          <TextField
            label="Course Code"
            fullWidth
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Course Name (Optional)"
            fullWidth
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ textAlign: "right" }}>
            <Button onClick={closeUploadModal} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #1976d2, #43a047)",
                color: "white",
              }}
            >
              Upload
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Details Dialog */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>File Details</DialogTitle>
        <DialogContent dividers>
          {selectedNote && (
            <>
              <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                {selectedNote.name}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Course: {selectedNote.courseCode || "N/A"} {selectedNote.courseName ? `- ${selectedNote.courseName}` : ""} • Uploaded: {new Date(selectedNote.uploadedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Size: {(selectedNote.size / 1024).toFixed(2)} KB • Type: {selectedNote.type} • Uploaded by: {selectedNote.uploaderName || selectedNote.uploaderId || 'Unknown'}
              </Typography>

              {/* Preview in details dialog (image or pdf) */}
              {selectedNote.preview ? (
                selectedNote.type.startsWith("image/") ? (
                  <CardMedia
                    component="img"
                    image={selectedNote.preview}
                    alt={selectedNote.name}
                    sx={{ width: "100%", maxHeight: 480, objectFit: "contain", mb: 2 }}
                  />
                ) : selectedNote.type === "application/pdf" ? (
                  <iframe
                    src={selectedNote.preview}
                    title={selectedNote.name}
                    style={{ width: "100%", height: 480, border: "1px solid #eee", borderRadius: 8, marginBottom: 12 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    File preview not available. Use download to save and view the file locally.
                  </Typography>
                )
              ) : (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  File preview not available. Use download to save and view the file locally.
                </Typography>
              )}

              {/* Uploaded by info
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Uploaded by: {selectedNote.uploaderName || selectedNote.uploaderId || 'Unknown'}
              </Typography> */}

              {selectedNote.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedNote.description}
                </Typography>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
            {selectedNote && user && selectedNote.uploaderId === user.id && (
              <Button
                color="error"
                onClick={() => {
                  // open confirmation dialog
                  setDeleteCandidate(selectedNote);
                  setDeleteConfirmOpen(true);
                }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => {
                handleDownload(selectedNote);
              }}
            >
              Download
            </Button>
        </DialogActions>
      </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to permanently delete "{deleteCandidate?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                if (!deleteCandidate) return;
                try {
                  await files.delete(deleteCandidate.id);
                  setNotes((prev) => prev.filter((f) => f.id !== deleteCandidate.id));
                  setMyNotes((prev) => prev.filter((f) => f.id !== deleteCandidate.id));
                  setSnackbar({ open: true, message: 'File deleted', severity: 'success' });
                  setDeleteConfirmOpen(false);
                  // If details dialog is open for the deleted file, close it
                  if (selectedNote && selectedNote.id === deleteCandidate.id) {
                    handleCloseDetails();
                  }
                } catch (err) {
                  setSnackbar({ open: true, message: 'Failed to delete file', severity: 'error' });
                  setDeleteConfirmOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading indicator */}
      {loading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999
          }}
        />
      )}
    </Box>
  );
}

export default Dashboard;
