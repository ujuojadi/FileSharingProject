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
import { filesAPI, groupsAPI, usersAPI, authAPI, getToken } from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // Upload modal state
  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [error, setError] = useState("");

  // Groups state
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState(null);

  // Details dialog
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Fetch files on component mount
  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    fetchFiles();
    fetchGroups();
    fetchCurrentUser();
  }, [navigate]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const files = await filesAPI.listFiles();
      // Transform API response to match component format
      const transformedFiles = files.map((f) => ({
        id: f.id,
        name: f.filename,
        size: f.size_bytes,
        courseCode: f.course_code || "",
        courseName: f.course_name || "",
        description: f.description || "",
        uploadedAt: new Date(f.uploaded_at),
        type: f.content_type,
        fileId: f.id,
        downloadUrl: `/files/${f.id}/download`,
      }));
      setNotes(transformedFiles);
    } catch (err) {
      setError(err.message || "Failed to load files");
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const groupsData = await groupsAPI.listGroups();
      setGroups(groupsData);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await usersAPI.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

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
    setError("");
  };

  // Upload file to backend
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseCode) {
      setError("Please choose a file and enter a course code.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadedFile = await filesAPI.uploadFile(
        file,
        courseCode,
        courseName || null,
        description || null
      );

      // Refresh files list
      await fetchFiles();
      closeUploadModal();
    } catch (err) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Download file from backend
  const handleDownload = async (note) => {
    if (!note.fileId) return;

    try {
      const blob = await filesAPI.downloadFile(note.fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = note.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to download file");
    }
  };

  // Handle logout
  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  // Join group
  const handleJoinGroup = async (groupId) => {
    try {
      await groupsAPI.joinGroup(groupId);
      alert("Successfully joined group!");
      fetchGroups();
    } catch (err) {
      setError(err.message || "Failed to join group");
    }
  };

  // Search + Sort derived array
  const filtered = notes
    .filter(
      (n) =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        (n.courseCode && n.courseCode.toLowerCase().includes(search.toLowerCase())) ||
        (n.description && n.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return a.size - b.size;
      if (sortBy === "date") return b.uploadedAt - a.uploadedAt;
      return 0;
    });

  // Card click: show details
  const handleCardClick = (note) => {
    setSelectedNote(note);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedNote(null);
  };

  // UI for rendering cards (keeps fixed height & truncation)
  const renderCards = (data) => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                height: 360,
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
                  {item.courseCode || "No course code"}
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
                  {item.type && item.type.startsWith("image/") && item.downloadUrl && (
                    <CardMedia
                      component="img"
                      image={`http://127.0.0.1:8000${item.downloadUrl}`}
                      alt={item.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  )}

                  {item.type === "application/pdf" && item.downloadUrl && (
                    <iframe
                      src={`http://127.0.0.1:8000${item.downloadUrl}`}
                      title={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "1px solid #eee",
                        borderRadius: 8,
                      }}
                      onClick={(ev) => ev.stopPropagation()}
                    />
                  )}

                  {/* generic file icon fallback */}
                  {(!item.type || (!item.type.startsWith("image/") && item.type !== "application/pdf")) && (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#f4f4f4",
                        borderRadius: 1,
                      }}
                    >
                      <UploadFileIcon sx={{ fontSize: 48, color: "#888" }} />
                    </Box>
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDownload(item);
                  }}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {data.length === 0 && !loading && (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ width: "100%", mt: 4 }}
          >
            No matching files found.
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
          {currentUser && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {currentUser.full_name || currentUser.email}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {/* Error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* search + sort */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome back, {currentUser?.full_name || "Student"} 👋
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
                placeholder="Search files..."
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
                <MenuItem value="">Sort by</MenuItem>
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
            <Tab icon={<NoteIcon />} label="All Files" />
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
                Upload New File
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
                Create Group
              </Button>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                Available Groups:
              </Typography>

              {loadingGroups ? (
                <CircularProgress />
              ) : (
                <Grid container spacing={2} justifyContent="center">
                  {groups.map((g) => (
                    <Grid item xs={12} sm={6} md={4} key={g.id}>
                      <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {g.name}
                        </Typography>
                        {g.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {g.description}
                          </Typography>
                        )}
                        <Button
                          variant="outlined"
                          sx={{ mt: 1, color: "#1976d2", borderColor: "#1976d2" }}
                          onClick={() => handleJoinGroup(g.id)}
                        >
                          Join Group
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                  {groups.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No groups available
                    </Typography>
                  )}
                </Grid>
              )}
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
            Upload a New File
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

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
            label="Course Code *"
            fullWidth
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Course Name"
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
            <Button onClick={closeUploadModal} sx={{ mr: 1 }} disabled={uploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !file || !courseCode}
              sx={{
                background: "linear-gradient(90deg, #1976d2, #43a047)",
                color: "white",
              }}
            >
              {uploading ? <CircularProgress size={24} /> : "Upload"}
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
                Course: {selectedNote.courseCode || "N/A"} • Uploaded:{" "}
                {new Date(selectedNote.uploadedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Size: {(selectedNote.size / 1024).toFixed(2)} KB
              </Typography>

              {selectedNote.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedNote.description}
                </Typography>
              )}

              {selectedNote.downloadUrl && selectedNote.type && selectedNote.type.startsWith("image/") && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={`http://127.0.0.1:8000${selectedNote.downloadUrl}`}
                    alt={selectedNote.name}
                    style={{
                      width: "100%",
                      maxHeight: 400,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}

              {selectedNote.downloadUrl && selectedNote.type === "application/pdf" && (
                <Box sx={{ mb: 2 }}>
                  <iframe
                    src={`http://127.0.0.1:8000${selectedNote.downloadUrl}`}
                    title={selectedNote.name}
                    style={{ width: "100%", height: 480, border: "none" }}
                  />
                </Box>
              )}

              {(!selectedNote.type ||
                (!selectedNote.type.startsWith("image/") &&
                  selectedNote.type !== "application/pdf")) && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  File preview not available for this type. Use download to save it locally.
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
