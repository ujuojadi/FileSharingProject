import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Paper,
} from "@mui/material";

function LandingPage() {
  return (
    <Box sx={{ flexGrow: 1 }}>

      {/* Hero Section */}
      <Box
        sx={{
          py: 10,
          textAlign: "center",
          background: "linear-gradient(90deg, #1976d2, #43a047)",
          color: "white",
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to NOTESHARE
        </Typography>
        <Typography variant="h6" maxWidth="md" sx={{ mx: "auto", mb: 4 }}>
          A UL Students File Sharing Project. Share, search, and access study
          materials securely — with verified school email access and reliable
          file sharing.
        </Typography>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          sx={{ backgroundColor: "white", color: "primary.main", fontWeight: "bold" }}
        >
          Get Started
        </Button>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 10 }}>
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          color="text.primary"
        >
          Core Features
        </Typography>

        <Grid container spacing={7} justifyContent="center" alignItems="stretch" sx={{ mt: 3 }}>
          {[
            {
              title: "Verified Accounts",
              desc: "Register with your school email for a secure and trusted community.",
            },
            {
              title: "Upload & Download Notes",
              desc: "Share study notes, guides, and resources with classmates.",
            },
            {
              title: "Search by Course",
              desc: "Find materials quickly by course code or class name.",
            },
            {
              title: "Ratings & Feedback",
              desc: "Rate and review files to highlight the most useful content.",
            },
            {
              title: "Groups",
              desc: "Create or join groups for classes and share recommendations.",
            },
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: "100%",
                  minWidth: 500,
                  borderRadius: 3,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  mx: "auto"
                }}
              >
                <Typography variant="h6" color="primary" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ready to share and access notes?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Join NOTESHARE today and collaborate with fellow students.
        </Typography>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          sx={{ backgroundColor: "white", color: "primary.main", fontWeight: "bold" }}
        >
          Sign Up Now
        </Button>
      </Box>

    </Box>
  );
}

export default LandingPage;
