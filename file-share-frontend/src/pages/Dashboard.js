import React, { useState, useEffect } from "react";

import api from '../api';
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
import DeleteIcon from "@mui/icons-material/Delete";
import { files, groups, feedback, users, auth } from "../api";

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
  const [notes, setNotes] = useState([]); // all notes uploaded by the user (local)
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Details dialog
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

    const recommendedGroups = [
    { id: 1, name: "CSCI 475 - Distributed Systems", members: 34 },
    { id: 2, name: "MATH 301 - Linear Algebra", members: 28 },
    { id: 3, name: "ENGL 202 - Technical Writing", members: 19 },
  ];

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Load user profile and files from backend
  // useEffect(() => {
  //   const loadUserAndData = async () => {
  //     try {
  //       const userResponse = await users.getProfile();
  //       setUser(userResponse.data);
        
  //       // Fetch files from backend
  //       const filesResponse = await files.list();
  //       // const mappedFiles = filesResponse.data.map((file) => ({
  //       //   id: file.id,
  //       //   name: file.filename,
  //       //   size: file.size_bytes,
  //       //   courseCode: file.course_code || "",
  //       //   courseName: file.course_name || "",
  //       //   description: file.description || "",
  //       //   uploadedAt: new Date(file.uploaded_at),
  //       //   type: file.content_type || "application/octet-stream",
  //       //   rating: "4.0",
  //       //   fileId: file.id,
  //       // }));
  //       // const mappedFiles = filesResponse.data.map((file) => ({
  //       //   id: file.ID,       // match backend JSON
  //       //   name: file.Name,   // match backend JSON
  //       //   size: file.Size,
  //       //   courseCode: file.CourseCode || "",
  //       //   courseName: file.CourseName || "",
  //       //   description: file.description || "",
  //       //   uploadedAt: new Date(file.uploadedAt || new Date()),
  //       //   type: file.type || "application/octet-stream",
  //       //   rating: "4.0",
  //       //   fileId: file.ID,
  //       // }));

  //       // setNotes(mappedFiles);

  //     const mappedFiles = filesResponse.data.map(file => ({
  //       id: file.id,
  //       name: file.name,
  //       size: file.size,
  //       courseCode: file.courseCode || "",
  //       courseName: file.courseName || "",
  //       description: file.description || "",
  //       uploadedAt: new Date(file.uploadedAt),
  //       type: file.type || "application/octet-stream",
  //     }));
  //     setNotes(mappedFiles);

      

  //     } catch (err) {
  //       console.error("Failed to load initial data:", err);
  //       setError("Failed to load data. Please try again later.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadUserAndData();
  // }, []);


//   useEffect(() => {
//   const loadUserAndData = async () => {
//     try {
//       const filesResponse = await files.list();
//       console.log("FILES RESPONSE DATA:", filesResponse.data);

//       // Map backend files to consistent frontend format
//       const mappedFiles = filesResponse.data.map((file) => ({
//         id: file.ID || file.id,                // fallback in case backend uses lowercase
//         name: file.Name || file.name || "Untitled", // ensure every file has a name
//         size: file.Size || file.size || 0,
//         courseCode: file.CourseCode || file.courseCode || "",
//         courseName: file.CourseName || file.courseName || "",
//         description: file.description || "",
//         uploadedAt: new Date(file.uploadedAt || file.uploaded_at || Date.now()),
//         type: file.type || "application/octet-stream",
//         rating: "4.0",  // optional
//         fileId: file.ID || file.id,
//       }));

//       console.log("MAPPED NOTES:", mappedFiles);

//       setNotes(mappedFiles);

//     } catch (err) {
//       console.error("Failed to load files:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadUserAndData();
// }, []);



// useEffect(() => {
//   const loadFilesFromGo = async () => {
//   try {
//     const res = await fetch("http://localhost:8080/files");
//     if (!res.ok) throw new Error(`Server returned ${res.status}`);
    
//     const data = await res.json();
//     if (!data || !Array.isArray(data)) {
//       console.error("Files response is not an array:", data);
//       setNotes([]); // fallback to empty array
//       return;
//     }

//     const mappedFiles = data.map(file => ({
//       ID: file.ID || file.id,
//       name: file.Name || file.name || "Untitled",
//       size: file.Size || file.size || 0,
//       courseCode: file.CourseCode || file.courseCode || "",
//       courseName: file.CourseName || file.courseName || "",
//       description: file.description || "",
//       uploadedAt: new Date(file.uploadedAt || file.uploaded_at || Date.now()),
//       type: file.Type || file.type || "application/octet-stream",
//       fileId: file.ID || file.id,
//     }));

//     console.log("MAPPED NOTES:", mappedFiles);
//     setNotes(mappedFiles);

//   } catch (err) {
//     console.error("Failed to load files from Go:", err);
//     setNotes([]); // fallback so map won't fail
//   } finally {
//     setLoading(false);
//   }
// };

// }, []);



useEffect(() => {
  const loadFiles = async () => {
    try {
      setLoading(true);
      // Load files from FastAPI backend
      const response = await files.list();
      const data = response.data;
      
      if (!data || !Array.isArray(data)) {
        console.error("Files response is not an array:", data);
        setNotes([]);
        return;
      }

      // Map FastAPI FileMeta to frontend format
      const mappedFiles = data.map(file => ({
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
      }));

      console.log("Loaded files from FastAPI:", mappedFiles);
      setNotes(mappedFiles);

    } catch (err) {
      console.error("Failed to load files:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to load files. Please try again.",
        severity: "error"
      });
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  loadFiles();
}, []);



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


  //STARY THERE
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

    // Upload to FastAPI - it handles P2P upload internally
    const response = await files.upload(file, {
      courseCode,
      courseName,
      description,
    });

    // Map FastAPI response to frontend format
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
    };


    setNotes((prev) => [newNote, ...prev]);
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

  // Search + Sort derived array
  // const filtered = notes
  //   .filter(
  //     (n) =>
  //       n.name.toLowerCase().includes(search.toLowerCase()) ||
  //       n.courseCode.toLowerCase().includes(search.toLowerCase())
  //   )
  //   .sort((a, b) => {
  //     if (sortBy === "name") return a.name.localeCompare(b.name);
  //     if (sortBy === "size") return a.size - b.size;
  //     if (sortBy === "date") return b.uploadedAt - a.uploadedAt; // Date subtraction works
  //     return 0;
  //   });

  const filtered = notes
  .filter((n) => {
    const name = (n.name || "").toLowerCase();
    const code = (n.courseCode || "").toLowerCase();
    const term = search.toLowerCase();

    return name.includes(term) || code.includes(term);
  })
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


// const handleDownload = async (note) => {
//   console.log("DOWNLOAD NOTE OBJECT:", note);

//   if (!note || !note.id) {   // check name instead of id
//     console.error("❌ note.name is missing:", note);
//     alert("File name is missing — cannot download.");
//     return;
//   }

//   try {
//     const response = await api.get(`/files/${note.id}/download`, {
//       responseType: "blob",
//     });

//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", note.name);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//   } catch (error) {
//     console.error("Download failed:", error);
//   }
// };


const handleDownload = async (note) => {
  console.log("DOWNLOAD NOTE OBJECT:", note);

  if (!note || !note.id) {
    console.error("❌ note.id is missing:", note);
    setSnackbar({
      open: true,
      message: "File ID is missing — cannot download.",
      severity: "error"
    });
    return;
  }

  try {
    setLoading(true);
    // Download from FastAPI - it handles P2P retrieval internally
    const response = await files.download(note.id);
    
    // Create blob from response data
    const blob = new Blob([response.data], { type: note.type || "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.download = note.name || "download";
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: "File downloaded successfully!",
      severity: "success"
    });
  } catch (err) {
    console.error("Download failed:", err);
    setSnackbar({
      open: true,
      message: err.response?.data?.detail || "Download failed. Please try again.",
      severity: "error"
    });
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (note) => {
  if (!note || !note.id) {
    setSnackbar({
      open: true,
      message: "File ID is missing — cannot delete.",
      severity: "error"
    });
    return;
  }

  // Confirm deletion
  if (!window.confirm(`Are you sure you want to delete "${note.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    setLoading(true);
    // Delete from FastAPI - it handles P2P deletion internally
    await files.delete(note.id);
    
    // Remove from local state
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    
    // Close details dialog if open
    if (openDetails && selectedNote?.id === note.id) {
      handleCloseDetails();
    }
    
    setSnackbar({
      open: true,
      message: "File deleted successfully!",
      severity: "success"
    });
  } catch (err) {
    console.error("Delete failed:", err);
    setSnackbar({
      open: true,
      message: err.response?.data?.detail || "Delete failed. Please try again.",
      severity: "error"
    });
  } finally {
    setLoading(false);
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
                  {/* Generic file icon for all files */}
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
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(ev) => {
                      ev.stopPropagation(); // prevent opening details
                      handleDelete(item);
                    }}
                    title="Delete file"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
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
                </Box>
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
          <Button 
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
          </Button>
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
            onClick={() => handleDelete(selectedNote)}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
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
