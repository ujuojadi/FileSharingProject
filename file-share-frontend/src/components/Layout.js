import React, { useState, useEffect } from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { auth } from "../api";

function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]); // Update when route changes

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f7fa" }}>
      {/* Navbar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h5"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700, 
              color: "white",
              letterSpacing: "0.5px",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            📚 NoteShare
          </Typography>
          {!isAuthenticated && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  color: "white",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                Home
              </Button>
              <Button 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  color: "white",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                Login
              </Button>
              <Button 
                component={RouterLink} 
                to="/register"
                variant="contained"
                sx={{ 
                  bgcolor: "white",
                  color: "#667eea",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  "&:hover": { 
                    bgcolor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.15)"
                  }
                }}
              >
                Register
              </Button>
            </Box>
          )}
          {isAuthenticated && (
            <Button 
              component={RouterLink} 
              to="/dashboard"
              variant="contained"
              sx={{ 
                bgcolor: "white",
                color: "#667eea",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                "&:hover": { 
                  bgcolor: "rgba(255,255,255,0.9)",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.15)"
                }
              }}
            >
              Dashboard
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* React Router will render pages here */}
      </Box>

      {/* Footer */}
      <Box 
        textAlign="center" 
        py={3} 
        sx={{ 
          bgcolor: "white",
          borderTop: "1px solid #e0e0e0",
          mt: "auto"
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          © {new Date().getFullYear()} NoteShare – A UL Students File Sharing Project
        </Typography>
      </Box>
    </Box>
  );
}

export default Layout;
