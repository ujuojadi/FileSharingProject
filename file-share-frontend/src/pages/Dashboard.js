import React, { useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import StarIcon from "@mui/icons-material/Star";
import GroupsIcon from "@mui/icons-material/Groups";
import NoteIcon from "@mui/icons-material/Note";

function Dashboard() {
  const [tab, setTab] = useState(0);

  // Upload modal state
  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");

  // Notes state
  const [notes, setNotes] = useState([]); // all notes uploaded by the user (local)
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Details dialog
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

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
    setDescription("");
  };

  // Create a new note (frontend-only)
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!file || !courseCode) {
      // simple validation
      alert("Please choose a file and enter a course code.");
      return;
    }

    // Create preview url for images and PDFs
    const previewUrl = URL.createObjectURL(file);
    const newNote = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      courseCode,
      description,
      uploadedAt: new Date(),
      preview: previewUrl,
      type: file.type,
      progress: 0,
      rating: (3 + Math.random() * 2).toFixed(1),
    };

    // add to top of notes
    setNotes((prev) => [newNote, ...prev]);
    closeUploadModal();

    // simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setNotes((prev) =>
        prev.map((n) => (n.id === newNote.id ? { ...n, progress } : n))
      );
      if (progress >= 100) clearInterval(interval);
    }, 150);
  };

  // Search + Sort derived array
  const filtered = notes
    .filter(
      (n) =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.courseCode.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return a.size - b.size;
      if (sortBy === "date") return b.uploadedAt - a.uploadedAt; // Date subtraction works
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

  // download helper (uses preview blob URL)
  const handleDownload = (note) => {
    if (!note || !note.preview) return;
    const link = document.createElement("a");
    link.href = note.preview;
    link.download = note.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  {item.type.startsWith("image/") && (
                    <CardMedia
                      component="img"
                      image={item.preview}
                      alt={item.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  )}

                  {item.type === "application/pdf" && (
                    <iframe
                      src={item.preview}
                      title={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "1px solid #eee",
                        borderRadius: 8,
                      }}
                      onClick={(ev) => ev.stopPropagation()} // clicking preview shouldn't open details
                    />
                  )}

                  {/* generic file icon fallback */}
                  {!item.type.startsWith("image/") &&
                    item.type !== "application/pdf" && (
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

                {/* upload progress */}
                <Box sx={{ mt: 2 }}>
                  {item.progress < 100 ? (
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{ borderRadius: 1 }}
                    />
                  ) : (
                    <Typography variant="body2" color="success.main">
                      Uploaded ✅
                    </Typography>
                  )}
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
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
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
                Course: {selectedNote.courseCode} • Uploaded: {selectedNote.uploadedAt.toLocaleString()}
              </Typography>

              {selectedNote.type.startsWith("image/") && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={selectedNote.preview}
                    alt={selectedNote.name}
                    style={{ width: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 8 }}
                  />
                </Box>
              )}

              {selectedNote.type === "application/pdf" && (
                <Box sx={{ mb: 2 }}>
                  <iframe
                    src={selectedNote.preview}
                    title={selectedNote.name}
                    style={{ width: "100%", height: 480, border: "none" }}
                  />
                </Box>
              )}

              {(!selectedNote.type.startsWith("image/") && selectedNote.type !== "application/pdf") && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  File preview not available for this type. Use download to save it locally.
                </Typography>
              )}

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
