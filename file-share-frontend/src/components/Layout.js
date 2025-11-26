import React, { useEffect, useState } from "react";
import { Outlet, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";

function Layout() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const update = () => setLoggedIn(!!localStorage.getItem('token'));
    // listen for storage events (other tabs)
    window.addEventListener('storage', update);
    // listen for history navigation which often accompanies auth flows
    window.addEventListener('popstate', update);
    // listen for same-tab auth changes (dispatched by API helpers)
    window.addEventListener('authchange', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('popstate', update);
      window.removeEventListener('authchange', update);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    // reload to reset app state
    window.location.href = '/';
  };
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main", textDecoration: 'none' }}
          >
            📚 NOTESHARE
          </Typography>
          <Button component={RouterLink} to="/" color="primary">
            Home
          </Button>
          {!loggedIn ? (
            <>
              <Button component={RouterLink} to="/login" color="primary">
                Login
              </Button>
              <Button component={RouterLink} to="/register" color="primary">
                Register
              </Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/dashboard" color="primary">
                Dashboard
              </Button>
              <Button onClick={handleLogout} color="primary">
                Logout
              </Button>
            </>
          )}
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
