import React from "react";
import { Link as RouterLink } from "react-router-dom";
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
        <Box component="form">
          <TextField fullWidth label="Name" margin="normal" variant="outlined" />
          <TextField fullWidth label="Email" margin="normal" variant="outlined" />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            variant="outlined"
            type="password"
          />
          <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
            Register
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          {/* <Link href="/login" underline="hover">
            Login here
          </Link> */}
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
