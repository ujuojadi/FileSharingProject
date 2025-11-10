import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import StarIcon from "@mui/icons-material/Star";
import GroupsIcon from "@mui/icons-material/Groups";
import NoteIcon from "@mui/icons-material/Note";
import { getFiles, uploadNote, downloadNote, getToken, logout } from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // Upload modal state
  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");

  // Notes state
  const [notes, setNotes] = useState([]); // all notes from backend
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Details dialog
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    fetchFiles();
  }, [navigate]);

  // Fetch files from backend
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const files = await getFiles();
      // Map backend file data to frontend format
      const mappedFiles = files.map((file) => ({
        id: file.id,
        name: file.filename,
        size: file.size_bytes,
        courseCode: file.course_code || "",
        courseName: file.course_name || "",
        description: file.description || "",
        uploadedAt: new Date(file.uploaded_at),
        type: file.content_type || "application/octet-stream",
        rating: "4.0", // Placeholder - can be fetched from feedback API
        fileId: file.id, // Store backend file ID for downloads
      }));
      setNotes(mappedFiles);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch files");
      if (err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const recommendedGroups = [
    { id: 1, name: "CSCI 475 - Distributed Systems", members: 34 },
    { id: 2, name: "MATH 301 - Linear Algebra", members: 28 },
    { id: 3, name: "ENGL 202 - Technical Writing", members: 19 },
  ];

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

  // Handle file upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseCode) {
      setError("Please choose a file and enter a course code.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError("");

      // Simulate progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to backend
      const uploadedFile = await uploadNote(file, courseCode, courseName, description);
      setUploadProgress(100);
      clearInterval(progressInterval);

      // Add uploaded file to the list
      const newNote = {
        id: uploadedFile.id,
        name: uploadedFile.filename,
        size: uploadedFile.size_bytes,
        courseCode: uploadedFile.course_code || "",
        courseName: uploadedFile.course_name || "",
        description: uploadedFile.description || "",
        uploadedAt: new Date(uploadedFile.uploaded_at),
        type: uploadedFile.content_type || "application/octet-stream",
        rating: "4.0",
        fileId: uploadedFile.id,
      };

      setNotes((prev) => [newNote, ...prev]);
      closeUploadModal();
      setUploadProgress(0);
    } catch (err) {
      setError(err.message || "Upload failed");
      if (err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Search + Sort derived array
  const filtered = notes
    .filter(
      (n) =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        (n.courseCode && n.courseCode.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return a.size - b.size;
      if (sortBy === "date") return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      return 0;
    });

  // Generate preview URL for images/PDFs (for display only)
  const getPreviewUrl = (note) => {
    if (note.type && note.type.startsWith("image/")) {
      // For images, we'd need to fetch from backend or use a blob
      // For now, return null and handle in UI
      return null;
    }
    return null;
  };

  // Card click: show details
  const handleCardClick = (note) => {
    setSelectedNote(note);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedNote(null);
  };

  // Handle file download
  const handleDownload = async (note) => {
    if (!note || !note.fileId) return;
    try {
      await downloadNote(note.fileId, note.name);
    } catch (err) {
      setError(err.message || "Download failed");
      if (err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    }
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
                  {item.courseCode || "No course"}
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
                  {/* Generic file icon for all files (preview would require additional API calls) */}
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#f4f4f4",
                      borderRadius: 1,
                    }}
                  >
                    <UploadFileIcon sx={{ fontSize: 48, color: "#888" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {item.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </Typography>
                  </Box>
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
            No matching notes found.
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
            📚 NOTESHARE Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* search + sort */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome back, Student 👋
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
              />
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
            sx={{ mb: 2 }}
          />
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          <Box sx={{ textAlign: "right" }}>
            <Button onClick={closeUploadModal} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading}
              sx={{
                background: "linear-gradient(90deg, #1976d2, #43a047)",
                color: "white",
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
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
                Course: {selectedNote.courseCode || "N/A"} • Uploaded: {new Date(selectedNote.uploadedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Size: {(selectedNote.size / 1024).toFixed(2)} KB • Type: {selectedNote.type}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                File preview not available. Use download to save and view the file locally.
              </Typography>

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
    </Box>
  );
}

export default Dashboard;
