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

function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // TODO: add register validation later
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
          Register
        </Typography>
        <Box component="form" onSubmit={handleRegister}>
          <TextField fullWidth label="Name" margin="normal" variant="outlined" />
          <TextField fullWidth label="Email" margin="normal" variant="outlined" />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            variant="outlined"
            type="password"
          />
          <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} type="submit">
            Register
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
