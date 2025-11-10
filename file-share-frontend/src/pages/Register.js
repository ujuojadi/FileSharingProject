import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
} from "@mui/material";
import { auth } from "../api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // First check if the server is reachable
      try {
        await fetch('http://localhost:8000/health');
      } catch (e) {
        throw new Error('Server is not running. Please start the backend server first.');
      }

      const regRes = await auth.register(formData);
      // Registration succeeded on server
      console.log('Registration response', regRes.status, regRes.data);
      // Attempt automatic login
      try {
        const response = await auth.login({
          username: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", response.data.access_token);
        navigate("/dashboard");
        return;
      } catch (loginErr) {
        // Login failed after registration — show a helpful message
        setError(`Account created successfully, but couldn't log in automatically. Please try logging in manually.`);
        navigate("/login");
        return;
      }
    } catch (error) {
      // Detailed error logging
      console.error('Registration error:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Check if this is a server connectivity error
      if (error.message?.includes('Server is not running')) {
        setError('Cannot connect to the server. Please ensure the backend server is running.');
        return;
      }

      // Handle axios error responses
      if (error.isAxiosError && error.response) {
        const { status, data } = error.response;
        const detail = data?.detail || '';
        
        switch (status) {
          case 409:
            setError("This email address is already registered. Please use a different email or try logging in.");
            break;
          case 422:
            // Extract message from validation error object and make it user-friendly
            let message;
            if (Array.isArray(data.detail)) {
              // If detail is an array, take the first error message
              message = data.detail[0]?.msg || "Invalid input";
            } else if (typeof data.detail === 'object') {
              // If detail is an object, use its msg field
              message = data.detail.msg || "Invalid input";
            } else {
              // Otherwise use the detail as is or a default message
              message = data.detail || "Please check all fields are filled in correctly.";
            }
            // Make the message more user-friendly
            message = message.replace("String", "Password");
            setError(message);
            break;
          case 400:
            if (detail.includes("must end with")) {
              setError("Please use your institutional email address to register.");
            } else {
              setError(detail || "Please check your input and try again.");
            }
            break;
          default:
            setError(detail || "Registration failed. Please try again later.");
        }
      } else if (error.isAxiosError && !error.response) {
        // Network error
        setError("Cannot connect to the server. Please check that the backend is running at http://localhost:8000");
      } else {
        // Unexpected error
        setError(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
          Register
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            margin="normal"
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            margin="normal"
            variant="outlined"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            helperText="Must be a valid email address ending with @ul.edu"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            margin="normal"
            variant="outlined"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            helperText="Password must have at least 8 characters"
            inputProps={{ maxLength: 72 }}
          />
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" underline="hover">
            Login here
          </Link>
        </Typography>
      </Paper>
    </Container>
    </Box>
  );
}

export default Register;
