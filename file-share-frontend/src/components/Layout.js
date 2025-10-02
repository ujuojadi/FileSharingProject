import React from "react";
import { Outlet, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";

function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}
          >
            📚 NOTESHARE
          </Typography>
          <Button component={RouterLink} to="/" color="primary">
            Home
          </Button>
          <Button component={RouterLink} to="/login" color="primary">
            Login
          </Button>
          <Button component={RouterLink} to="/register" color="primary">
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* React Router will render pages here */}
      </Box>

      {/* Footer */}
      <Box textAlign="center" py={3} bgcolor="grey.100">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} NOTESHARE – A UL Students File Sharing Project
        </Typography>
      </Box>
    </Box>
  );
}

export default Layout;
