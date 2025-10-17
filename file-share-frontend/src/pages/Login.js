import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
} from "@mui/material";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: add login validation later
    navigate("/dashboard");
  };

  return (
    <Box
        sx={{
            py: 3,
            background: "linear-gradient(90deg, #1976d2, #43a047)",
        }}
    >
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin}>
          <TextField fullWidth label="Email" margin="normal" variant="outlined" />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            variant="outlined"
            type="password"
          />
          <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} type="submit">
            Login
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don’t have an account?{" "}
          <Link component={RouterLink} to="/register" underline="hover">
            Register here
          </Link>
        </Typography>
      </Paper>
    </Container>
    </Box>
  );
}

export default Login;
