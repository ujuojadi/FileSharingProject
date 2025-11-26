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
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Notes state
  const [notes, setNotes] = useState([]); // all notes uploaded by the user (local)
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching, [] = no results, [items] = results
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Details dialog
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Rating state
  const [fileRatings, setFileRatings] = useState({}); // { fileId: { average: number, count: number } }
  const [myRatings, setMyRatings] = useState({}); // { fileId: rating }
  const [openRatingModal, setOpenRatingModal] = useState(false);
  const [ratingFile, setRatingFile] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  // Groups state
  const [allGroups, setAllGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [groupMemberCounts, setGroupMemberCounts] = useState({});
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroupForFiles, setSelectedGroupForFiles] = useState(null);
  const [groupFiles, setGroupFiles] = useState([]);

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



// Load user profile on mount
useEffect(() => {
  const loadUser = async () => {
    try {
      const response = await users.getProfile();
      setUser(response.data);
      console.log("Loaded user profile:", response.data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      // Don't show error to user, just log it
      // User can still use the app without profile loaded
    }
  };

  loadUser();
}, []);

// Load files on mount
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
        rating: 0, // Will be loaded from ratings
        fileId: file.id,
        uploaderId: file.uploader_id, // Preserve uploader_id for filtering
      }));

      console.log("Loaded files from FastAPI:", mappedFiles);
      setNotes(mappedFiles);

      // Load ratings for all files
      const ratingsPromises = mappedFiles.map(async (file) => {
        try {
          const avgResponse = await feedback.getAverage(file.id);
          const myRatingResponse = await feedback.getMyRating(file.id);
          return {
            fileId: file.id,
            average: avgResponse.data?.average || 0,
            count: avgResponse.data?.count || 0,
            myRating: myRatingResponse.data?.rating || null,
          };
        } catch (err) {
          console.error(`Failed to load rating for file ${file.id}:`, err);
          return {
            fileId: file.id,
            average: 0,
            count: 0,
            myRating: null,
          };
        }
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap = {};
      const myRatingsMap = {};
      ratingsResults.forEach((result) => {
        ratingsMap[result.fileId] = { average: result.average, count: result.count };
        if (result.myRating !== null) {
          myRatingsMap[result.fileId] = result.myRating;
        }
      });
      setFileRatings(ratingsMap);
      setMyRatings(myRatingsMap);

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

  // Debounced search effect - calls backend API
  useEffect(() => {
    // If search is empty, clear search results and show all files
    if (!search.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    // Debounce search API call
    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await files.search({ q: search.trim() });
        
        // Map FastAPI FileMeta to frontend format
        const mappedResults = response.data.map(file => ({
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
          uploaderId: file.uploader_id, // Preserve uploader_id for filtering
        }));
        
        setSearchResults(mappedResults);
      } catch (err) {
        console.error("Search failed:", err);
        setSnackbar({
          open: true,
          message: err.response?.data?.detail || "Search failed. Please try again.",
          severity: "error"
        });
        setSearchResults([]); // Show empty results on error
      } finally {
        setSearchLoading(false);
      }
    }, 500); // 500ms debounce

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
    setSelectedGroupId("");
  };

  // Group modal handlers
  const handleOpenGroupModal = () => setOpenGroupModal(true);
  const closeGroupModal = () => {
    setOpenGroupModal(false);
    setGroupName("");
    setGroupDescription("");
  };

  // Handle group creation
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a group name.",
        severity: "error"
      });
      return;
    }

    try {
      setGroupsLoading(true);
      const response = await groups.create({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
      });
      
      setSnackbar({
        open: true,
        message: `Group "${response.data.name}" created successfully!`,
        severity: "success"
      });
      
      closeGroupModal();
      
      // Reload groups
      const allGroupsResponse = await groups.list();
      setAllGroups(allGroupsResponse.data || []);
      
      const myGroupsResponse = await groups.getMyGroups();
      setMyGroups(myGroupsResponse.data || []);
      
      // Update member count for new group
      const countResponse = await groups.getMemberCount(response.data.id);
      setGroupMemberCounts(prev => ({
        ...prev,
        [response.data.id]: countResponse.data?.member_count || 0
      }));
    } catch (err) {
      console.error("Failed to create group:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to create group. Please try again.",
        severity: "error"
      });
    } finally {
      setGroupsLoading(false);
    }
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId) => {
    try {
      setGroupsLoading(true);
      await groups.join(groupId);
      
      setSnackbar({
        open: true,
        message: "Successfully joined group!",
        severity: "success"
      });
      
      // Reload user's groups and member counts
      const myGroupsResponse = await groups.getMyGroups();
      setMyGroups(myGroupsResponse.data || []);
      
      const countResponse = await groups.getMemberCount(groupId);
      setGroupMemberCounts(prev => ({
        ...prev,
        [groupId]: countResponse.data?.member_count || 0
      }));
    } catch (err) {
      console.error("Failed to join group:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to join group. Please try again.",
        severity: "error"
      });
    } finally {
      setGroupsLoading(false);
    }
  };

  // Check if user is a member of a group
  const isMemberOfGroup = (groupId) => {
    return myGroups.some(g => g.id === groupId);
  };

  // Handle viewing files in a group
  const handleViewGroupFiles = async (group) => {
    try {
      setSelectedGroupForFiles(group);
      setGroupsLoading(true);
      const response = await files.list({ group_id: group.id });
      const data = response.data || [];
      
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
        uploaderId: file.uploader_id,
      }));
      
      setGroupFiles(mappedFiles);
    } catch (err) {
      console.error("Failed to load group files:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to load group files. Please try again.",
        severity: "error"
      });
      setGroupFiles([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleCloseGroupFiles = () => {
    setSelectedGroupForFiles(null);
    setGroupFiles([]);
  };

  // Rating handlers
  const handleOpenRatingModal = (file) => {
    setRatingFile(file);
    setSelectedRating(myRatings[file.id] || 0);
    setRatingComment("");
    setOpenRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setOpenRatingModal(false);
    setRatingFile(null);
    setSelectedRating(0);
    setRatingComment("");
  };

  const handleSubmitRating = async () => {
    if (!ratingFile || selectedRating === 0) {
      setSnackbar({
        open: true,
        message: "Please select a rating (1-5 stars).",
        severity: "error"
      });
      return;
    }

    try {
      setLoading(true);
      await feedback.submit({
        file_id: ratingFile.id,
        user_id: user.id, // Will be overridden by backend
        rating: selectedRating,
        comment: ratingComment.trim() || null,
      });

      setSnackbar({
        open: true,
        message: "Rating submitted successfully!",
        severity: "success"
      });

      // Reload ratings
      const avgResponse = await feedback.getAverage(ratingFile.id);
      const myRatingResponse = await feedback.getMyRating(ratingFile.id);
      
      setFileRatings(prev => ({
        ...prev,
        [ratingFile.id]: {
          average: avgResponse.data?.average || 0,
          count: avgResponse.data?.count || 0,
        }
      }));

      if (myRatingResponse.data?.rating) {
        setMyRatings(prev => ({
          ...prev,
          [ratingFile.id]: myRatingResponse.data.rating
        }));
      }

      handleCloseRatingModal();
    } catch (err) {
      console.error("Failed to submit rating:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to submit rating. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
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
      groupId: selectedGroupId || null,
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
      uploaderId: response.data.uploader_id, // Preserve uploader_id for filtering
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

  // Get data to display: search results if searching, otherwise all notes
  let dataToDisplay = searchResults !== null ? searchResults : notes;

  // Filter by tab
  if (tab === 1 && user) {
    // "My Uploads" tab - filter by current user
    // Note: We need to check if files have uploader_id in the mapped format
    // Since we're mapping from FileMeta, we need to preserve uploader_id
    dataToDisplay = dataToDisplay.filter((file) => {
      // Check if file has uploaderId or uploader_id field
      const fileUploaderId = file.uploaderId || file.uploader_id;
      return fileUploaderId === user.id;
    });
  } else if (tab === 3) {
    // "Top Rated" tab - filter by files with ratings and sort by average rating
    dataToDisplay = dataToDisplay.filter((file) => {
      // Only show files that have at least one rating
      return fileRatings[file.id] && fileRatings[file.id].count > 0;
    });
  }
  // Tab 0 (All Notes) shows all files
  // Tab 2 (Groups) is handled separately

  // Sort the data
  let filtered = dataToDisplay.sort((a, b) => {
    if (tab === 3) {
      // For Top Rated tab, sort by average rating (highest first)
      const ratingA = fileRatings[a.id]?.average || 0;
      const ratingB = fileRatings[b.id]?.average || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA; // Higher rating first
      }
      // If ratings are equal, sort by number of ratings (more ratings = more reliable)
      const countA = fileRatings[a.id]?.count || 0;
      const countB = fileRatings[b.id]?.count || 0;
      if (countB !== countA) {
        return countB - countA; // More ratings first
      }
    }
    
    // Apply user's selected sort for other tabs
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return a.size - b.size;
    if (sortBy === "date") return b.uploadedAt - a.uploadedAt;
    return 0;
  });


  // Card click: show details and load preview
  const handleCardClick = async (item) => {
    setSelectedNote(item);
    setOpenDetails(true);
    setPreviewLoading(true);
    setPreviewError(null);
    
    // Try to load file preview for viewable file types
    const viewableTypes = [
      'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/xml', 'text/xml'
    ];
    
    const canPreview = viewableTypes.some(type => item.type?.includes(type.split('/')[1]) || item.name.match(/\.(txt|csv|json|pdf|jpg|jpeg|png|gif|html|css|js|xml)$/i));
    
    if (canPreview) {
      try {
        const response = await files.download(item.id);
        const blob = new Blob([response.data], { type: item.type || "application/octet-stream" });
        
        if (item.type?.startsWith('image/')) {
          // For images, create object URL
          const url = URL.createObjectURL(blob);
          setFilePreview({ type: 'image', url });
        } else if (item.type === 'application/pdf') {
          // For PDFs, create object URL
          const url = URL.createObjectURL(blob);
          setFilePreview({ type: 'pdf', url });
        } else if (item.type?.startsWith('text/') || item.type === 'application/json' || item.type === 'application/xml' || item.type === 'text/xml') {
          // For text files, read as text
          const text = await blob.text();
          setFilePreview({ type: 'text', content: text });
        } else {
          setFilePreview({ type: 'unsupported' });
        }
      } catch (err) {
        console.error("Failed to load file preview:", err);
        setPreviewError("Could not load file preview. You can still download the file.");
        setFilePreview({ type: 'error' });
      } finally {
        setPreviewLoading(false);
      }
    } else {
      setPreviewLoading(false);
      setFilePreview({ type: 'unsupported' });
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedNote(null);
    setFilePreview(null);
    setPreviewError(null);
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
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                height: 380,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "1px solid #f0f0f0",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 24px rgba(102, 126, 234, 0.2)",
                  borderColor: "#667eea",
                }
              }}
              onClick={() => handleCardClick(item)}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  noWrap
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    mb: 1.5,
                  }}
                >
                  {item.name}
                </Typography>

                <Box sx={{ mb: 1.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "#667eea",
                      fontWeight: 600,
                      fontSize: "0.875rem"
                    }}
                  >
                    {item.courseCode || "No course"}
                  </Typography>
                  {item.courseName && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: "text.secondary",
                        display: "block",
                        mt: 0.5
                      }}
                    >
                      {item.courseName}
                    </Typography>
                  )}
                </Box>

                {item.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      maxHeight: 48,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.4,
                      fontSize: "0.85rem",
                    }}
                  >
                    {item.description}
                  </Typography>
                )}

                {/* preview area */}
                <Box sx={{ mt: 2, height: 120, mb: 2 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
                      background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <UploadFileIcon sx={{ fontSize: 40, color: "#667eea", opacity: 0.7 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                      {item.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
                    {(item.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ 
                justifyContent: "space-between", 
                px: 2, 
                pb: 2,
                pt: 1,
                borderTop: "1px solid #f0f0f0"
              }}>
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center",
                    cursor: "pointer",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    transition: "all 0.2s",
                    "&:hover": { 
                      bgcolor: "#fff9e6",
                      transform: "scale(1.05)"
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRatingModal(item);
                  }}
                  title="Rate this file"
                >
                  <StarIcon sx={{ color: "#ffb400", fontSize: 20, mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {fileRatings[item.id]?.average?.toFixed(1) || "0.0"}
                  </Typography>
                  {fileRatings[item.id]?.count > 0 && (
                    <Typography component="span" variant="caption" sx={{ ml: 0.5, color: "text.secondary" }}>
                      ({fileRatings[item.id].count})
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(item);
                    }}
                    title="Delete file"
                    sx={{
                      color: "#d32f2f",
                      "&:hover": { bgcolor: "#ffebee" }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDownload(item);
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "#667eea",
                      "&:hover": {
                        bgcolor: "#5568d3",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                      }
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
            {searchResults !== null 
              ? search.trim() 
                ? "No files found matching your search." 
                : "No files found."
              : "No files uploaded yet. Click 'Upload Note' to get started!"}
          </Typography>
        )}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pb: 4,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          pt: 3,
          pb: 4,
          mb: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Container>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: "white",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              📚 Dashboard
            </Typography>
            <Button 
              variant="outlined"
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
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)"
                }
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Welcome Section */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: "white",
                mb: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              Welcome back, {user?.full_name || "Student"} 👋
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Manage your files, join groups, and share knowledge
            </Typography>
          </Box>

          {/* Search and Sort */}
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
              elevation={3}
              sx={{
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 450 },
                borderRadius: 3,
                px: 2,
                py: 0.5,
                position: "relative",
                bgcolor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <SearchIcon sx={{ color: "#667eea", mr: 1 }} />
              <TextField
                variant="standard"
                placeholder="Search files..."
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ 
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    fontSize: "0.95rem"
                  }
                }}
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
                    borderRadius: "0 0 12px 12px",
                  }}
                />
              )}
            </Paper>

            <FormControl
              size="small"
              elevation={3}
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                minWidth: 150,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <Select
                displayEmpty
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                renderValue={(value) => {
                  if (value === "") {
                    return <em style={{ color: "#999" }}>Sort by</em>;
                  }
                  return value.charAt(0).toUpperCase() + value.slice(1);
                }}
                sx={{
                  "& .MuiSelect-select": {
                    py: 1.2,
                    fontWeight: 500
                  }
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
        </Container>
      </Box>

      <Container>

        {/* tabs and content card */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 4,
            bgcolor: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              mb: 3,
              borderBottom: "2px solid #f0f0f0",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                minHeight: 64,
                "&.Mui-selected": {
                  color: "#667eea",
                }
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              }
            }}
          >
            <Tab icon={<NoteIcon />} iconPosition="start" label="All Notes" />
            <Tab icon={<UploadFileIcon />} iconPosition="start" label="My Uploads" />
            <Tab icon={<GroupsIcon />} iconPosition="start" label="Groups" />
            <Tab icon={<StarIcon />} iconPosition="start" label="Top Rated" />
          </Tabs>

          {/* Tab panels */}
          {tab === 0 && (
            <>
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Box sx={{ 
                    display: "inline-flex",
                    p: 3,
                    borderRadius: "50%",
                    bgcolor: "#f5f7ff",
                    mb: 3
                  }}>
                    <NoteIcon sx={{ fontSize: 64, color: "#667eea", opacity: 0.5 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#1a1a1a", mb: 1 }}>
                    No Files Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
                    {search.trim() ? "No files match your search. Try different keywords." : "Upload your first file to get started!"}
                  </Typography>
                  {!search.trim() && (
                    <Button
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      onClick={openUploadModal}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 4,
                        py: 1.5,
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Upload Your First File
                    </Button>
                  )}
                </Box>
              ) : (
                renderCards(filtered)
              )}
            </>
          )}
          {tab === 1 && (
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={openUploadModal}
                sx={{
                  mb: 3,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Upload New File
              </Button>

              {renderCards(filtered)}
            </Box>
          )}
          {tab === 2 && (
            <Box sx={{ py: 3 }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<GroupsIcon />}
                  onClick={handleOpenGroupModal}
                  sx={{
                    mb: 2,
                    background: "linear-gradient(90deg, #1976d2, #43a047)",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Create New Group
                </Button>
              </Box>

              {groupsLoading && (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <LinearProgress />
                </Box>
              )}

              {/* My Groups Section */}
              {myGroups.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    My Groups ({myGroups.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {myGroups.map((group) => (
                      <Grid item xs={12} sm={6} md={4} key={group.id}>
                        <Card 
                          elevation={2}
                          sx={{ 
                            borderRadius: 3, 
                            p: 2.5, 
                            height: "100%",
                            border: "1px solid #e8f5e9",
                            bgcolor: "#f1f8f4",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 8px 16px rgba(67, 160, 71, 0.15)",
                            }
                          }}
                        >
                          <Typography variant="h6" fontWeight={600} noWrap sx={{ mb: 1, color: "#1a1a1a" }}>
                            {group.name}
                          </Typography>
                          {group.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 1, 
                                mb: 1.5,
                                minHeight: 40,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {group.description}
                            </Typography>
                          )}
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <GroupsIcon sx={{ fontSize: 18, color: "#43a047", mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#43a047" }}>
                              {groupMemberCounts[group.id] || 0} member{groupMemberCounts[group.id] !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ 
                              mt: 1, 
                              bgcolor: "#43a047", 
                              color: "white",
                              textTransform: "none",
                              fontWeight: 600,
                              "&:hover": {
                                bgcolor: "#388e3c",
                                boxShadow: "0 4px 12px rgba(67, 160, 71, 0.4)"
                              }
                            }}
                            disabled
                          >
                            Member
                          </Button>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* All Groups Section (P2P) */}
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  All Groups ({allGroups.length})
                </Typography>
                {allGroups.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
                    No groups found. Create the first group!
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {allGroups.map((group) => {
                      const isMember = isMemberOfGroup(group.id);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={group.id}>
                          <Card 
                            elevation={2}
                            sx={{ 
                              borderRadius: 3, 
                              p: 2.5, 
                              height: "100%",
                              border: "1px solid #f0f0f0",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 8px 16px rgba(102, 126, 234, 0.15)",
                                borderColor: "#667eea",
                              }
                            }}
                          >
                            <Typography variant="h6" fontWeight={600} noWrap sx={{ mb: 1, color: "#1a1a1a" }}>
                              {group.name}
                            </Typography>
                            {group.description && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mt: 1, 
                                  mb: 1.5,
                                  minHeight: 40,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {group.description}
                              </Typography>
                            )}
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <GroupsIcon sx={{ fontSize: 18, color: "#667eea", mr: 0.5 }} />
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#667eea" }}>
                                {groupMemberCounts[group.id] || 0} member{groupMemberCounts[group.id] !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                              <Button
                                variant={isMember ? "outlined" : "contained"}
                                size="small"
                                onClick={() => !isMember && handleJoinGroup(group.id)}
                                disabled={isMember}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  ...(isMember
                                    ? { 
                                        color: "#43a047", 
                                        borderColor: "#43a047",
                                        "&:hover": { borderColor: "#43a047", bgcolor: "#f1f8f4" }
                                      }
                                    : { 
                                        background: "#667eea", 
                                        color: "white",
                                        "&:hover": {
                                          background: "#5568d3",
                                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                                        }
                                      }),
                                }}
                              >
                                {isMember ? "Member" : "Join Group"}
                              </Button>
                              {isMember && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleViewGroupFiles(group)}
                                  sx={{ 
                                    textTransform: "none",
                                    fontWeight: 600,
                                    color: "#667eea", 
                                    borderColor: "#667eea",
                                    "&:hover": { 
                                      borderColor: "#5568d3",
                                      bgcolor: "#f5f7ff"
                                    }
                                  }}
                                >
                                  View Files
                                </Button>
                              )}
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </Box>
          )}
          {tab === 3 && (
            <Box>
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Box sx={{ 
                    display: "inline-flex",
                    p: 3,
                    borderRadius: "50%",
                    bgcolor: "#fff9e6",
                    mb: 3
                  }}>
                    <StarIcon sx={{ fontSize: 64, color: "#ffb400", opacity: 0.5 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#1a1a1a", mb: 1 }}>
                    No Rated Files Yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
                    Files will appear here once they receive ratings from users. Be the first to rate a file!
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2, fontWeight: 500 }}>
                    Showing {filtered.length} top-rated file{filtered.length !== 1 ? 's' : ''} (sorted by highest average rating)
                  </Typography>
                  {renderCards(filtered)}
                </>
              )}
            </Box>
          )}
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
            width: { xs: "90%", sm: 500 },
            bgcolor: "white",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            p: 4,
            borderRadius: 4,
            outline: "none",
          }}
        >
          <Typography variant="h5" mb={3} sx={{ fontWeight: 700, color: "#1a1a1a" }}>
            Upload a New File
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            fullWidth
            sx={{
              mb: 3,
              py: 2,
              borderColor: "#667eea",
              color: "#667eea",
              borderWidth: 2,
              borderStyle: "dashed",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              "&:hover": {
                borderColor: "#5568d3",
                bgcolor: "#f5f7ff",
                borderWidth: 2,
              }
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
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Upload to Group (Optional)</InputLabel>
            <Select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              label="Upload to Group (Optional)"
            >
              <MenuItem value="">
                <em>No Group</em>
              </MenuItem>
              {myGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
      <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails} 
        maxWidth="lg" 
        fullWidth 
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxHeight: "90vh"
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: "#667eea",
          color: "white",
          pb: 2,
          pt: 3
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" noWrap sx={{ flex: 1, mr: 2, fontWeight: 700 }}>
              {selectedNote?.name}
            </Typography>
            <IconButton 
              onClick={handleCloseDetails} 
              size="small"
              sx={{ 
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 300 }}>×</Typography>
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh", overflow: "auto" }}>
          {selectedNote && (
            <>
              {/* File Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Course:</strong> {selectedNote.courseCode || "N/A"} {selectedNote.courseName ? `- ${selectedNote.courseName}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Uploaded:</strong> {new Date(selectedNote.uploadedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Size:</strong> {(selectedNote.size / 1024).toFixed(2)} KB • <strong>Type:</strong> {selectedNote.type}
                </Typography>
                {selectedNote.description && (
                  <Typography variant="body1" sx={{ mt: 2, p: 2, bgcolor: "rgba(0,0,0,0.05)", borderRadius: 1 }}>
                    <strong>Description:</strong> {selectedNote.description}
                  </Typography>
                )}
              </Box>

              {/* File Preview Section */}
              <Box sx={{ 
                mb: 3, 
                border: "1px solid #e0e0e0", 
                borderRadius: 3, 
                p: 3, 
                bgcolor: "#fafafa",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: "#1a1a1a" }}>
                  File Preview
                </Typography>
                {previewLoading ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading file preview...
                    </Typography>
                  </Box>
                ) : previewError ? (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="body2" color="error">
                      {previewError}
                    </Typography>
                  </Box>
                ) : filePreview?.type === 'image' ? (
                  <Box sx={{ textAlign: "center" }}>
                    <img 
                      src={filePreview.url} 
                      alt={selectedNote.name}
                      style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: 4 }}
                      onLoad={() => URL.revokeObjectURL(filePreview.url)}
                    />
                  </Box>
                ) : filePreview?.type === 'pdf' ? (
                  <Box sx={{ textAlign: "center" }}>
                    <iframe
                      src={filePreview.url}
                      width="100%"
                      height="500px"
                      style={{ border: "none", borderRadius: 4 }}
                      title={selectedNote.name}
                    />
                  </Box>
                ) : filePreview?.type === 'text' ? (
                  <Box sx={{ 
                    bgcolor: "white", 
                    p: 2, 
                    borderRadius: 1, 
                    maxHeight: "400px", 
                    overflow: "auto",
                    fontFamily: "monospace",
                    fontSize: "0.875rem"
                  }}>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {filePreview.content}
                    </pre>
                  </Box>
                ) : filePreview?.type === 'unsupported' || !filePreview ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Preview not available for this file type. Download the file to view it.
                    </Typography>
                  </Box>
                ) : null}
              </Box>

              {/* Rate Usefulness Section */}
              <Box sx={{ 
                mb: 2, 
                p: 3.5, 
                background: "linear-gradient(135deg, rgba(255, 184, 0, 0.1) 0%, rgba(255, 193, 7, 0.15) 100%)",
                borderRadius: 3, 
                border: "2px solid #ffb400",
                boxShadow: "0 4px 12px rgba(255, 184, 0, 0.2)",
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  mb: 2
                }}>
                  <StarIcon sx={{ color: "#ffb400", fontSize: 28 }} />
                  Rate How Useful This File Was
                </Typography>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, mt: 2 }}>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        onClick={() => {
                          setRatingFile(selectedNote);
                          setSelectedRating(myRatings[selectedNote.id] || star);
                          setRatingComment("");
                          setOpenRatingModal(true);
                        }}
                        sx={{ p: 0.5 }}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <StarIcon
                          sx={{
                            fontSize: 32,
                            color: star <= (myRatings[selectedNote.id] || 0) ? "#ffb400" : "#e0e0e0",
                            transition: "color 0.2s",
                          }}
                        />
                      </IconButton>
                    ))}
                  </Box>
                  <Box>
                    {fileRatings[selectedNote.id] && fileRatings[selectedNote.id].count > 0 ? (
                      <Typography variant="body1">
                        <strong>Average:</strong> {fileRatings[selectedNote.id].average.toFixed(1)} / 5 
                        ({fileRatings[selectedNote.id].count} {fileRatings[selectedNote.id].count === 1 ? 'rating' : 'ratings'})
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No ratings yet. Be the first to rate!
                      </Typography>
                    )}
                    {myRatings[selectedNote.id] && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Your rating: {myRatings[selectedNote.id]} / 5
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<StarIcon />}
                  onClick={() => {
                    setRatingFile(selectedNote);
                    setSelectedRating(myRatings[selectedNote.id] || 0);
                    setRatingComment("");
                    setOpenRatingModal(true);
                  }}
                  sx={{ 
                    borderColor: "#ffb400", 
                    color: "#ffb400",
                    "&:hover": { borderColor: "#ffb400", bgcolor: "rgba(255, 184, 0, 0.1)" }
                  }}
                >
                  {myRatings[selectedNote.id] ? "Update Your Rating" : "Rate This File"}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
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
            startIcon={<UploadFileIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Group Modal */}
      <Modal open={openGroupModal} onClose={closeGroupModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 },
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            p: 4,
            outline: "none",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: "#1a1a1a" }}>
            Create New Group
          </Typography>
          <form onSubmit={handleCreateGroup}>
            <TextField
              label="Group Name *"
              fullWidth
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mb: 2.5 }}
              required
              variant="outlined"
            />
            <TextField
              label="Description (Optional)"
              multiline
              rows={3}
              fullWidth
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              sx={{ mb: 3 }}
              variant="outlined"
            />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button 
                onClick={closeGroupModal} 
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "text.secondary",
                  borderColor: "#e0e0e0",
                  "&:hover": { 
                    borderColor: "#bdbdbd",
                    bgcolor: "#f5f5f5"
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={groupsLoading}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#667eea",
                  px: 3,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    bgcolor: "#5568d3",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                  },
                  "&:disabled": {
                    bgcolor: "#e0e0e0",
                    color: "#9e9e9e"
                  }
                }}
              >
                {groupsLoading ? "Creating..." : "Create Group"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Group Files Dialog */}
      <Dialog 
        open={selectedGroupForFiles !== null} 
        onClose={handleCloseGroupFiles} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: "#667eea",
          color: "white",
          pb: 2,
          pt: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <GroupsIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Files in {selectedGroupForFiles?.name}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => {
              handleCloseGroupFiles();
              setSelectedGroupId(selectedGroupForFiles?.id || "");
              setOpenUpload(true);
            }}
            sx={{
              bgcolor: "white",
              color: "#667eea",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }
            }}
            size="small"
          >
            Upload to Group
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {groupsLoading ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <LinearProgress />
            </Box>
          ) : groupFiles.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
              No files uploaded to this group yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {groupFiles.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      borderRadius: 2, 
                      p: 2,
                      border: "1px solid #f0f0f0",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                      }
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ mb: 1, color: "#1a1a1a" }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                      {(file.size / 1024).toFixed(2)} KB
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleDownload(file)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        bgcolor: "#667eea",
                        "&:hover": {
                          bgcolor: "#5568d3",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                        }
                      }}
                    >
                      Download
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "#fafafa", borderTop: "1px solid #e0e0e0" }}>
          <Button 
            onClick={handleCloseGroupFiles}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              "&:hover": { bgcolor: "#f5f5f5" }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Modal */}
      <Dialog open={openRatingModal} onClose={handleCloseRatingModal} maxWidth="sm" fullWidth>
        <DialogTitle>Rate {ratingFile?.name}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Rating
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mb: 2 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  sx={{ p: 0.5 }}
                >
                  <StarIcon
                    sx={{
                      fontSize: 40,
                      color: star <= selectedRating ? "#ffb400" : "#e0e0e0",
                      transition: "color 0.2s",
                    }}
                  />
                </IconButton>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedRating === 0 ? "Select a rating" : `${selectedRating} out of 5 stars`}
            </Typography>
            {ratingFile && fileRatings[ratingFile.id] && fileRatings[ratingFile.id].count > 0 && (
              <Typography variant="body2" color="text.secondary">
                Average: {fileRatings[ratingFile.id].average.toFixed(1)} / 5 ({fileRatings[ratingFile.id].count} {fileRatings[ratingFile.id].count === 1 ? 'rating' : 'ratings'})
              </Typography>
            )}
            <TextField
              label="Comment (Optional)"
              multiline
              rows={3}
              fullWidth
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRatingModal}>Cancel</Button>
          <Button
            onClick={handleSubmitRating}
            variant="contained"
            disabled={selectedRating === 0 || loading}
          >
            Submit Rating
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
