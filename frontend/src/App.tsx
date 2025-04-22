import { Box, Toolbar, Typography, CssBaseline } from "@mui/material";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import CreateForm from "./pages/create-user-form";
import FormsList from "./pages/forms-list";
import SubmitForm from "./pages/submit-form";

import Nav from "./nav";

function App() {
  return (
    <Router basename="/">
      <CssBaseline />

      {/* Fixed Dark Header, 90% width */}
      <Box
        sx={{
          width: "100%",
          position: "relative",
          overflow: "auto",
          top: 0,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",

            top: 0,
            bgcolor: "grey.900",
            zIndex: 1201,
          }}
        >
          <Box sx={{ width: "90%" }}>
            <Toolbar
              disableGutters
              sx={{
                height: 64,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {/* App Title */}
              <Typography variant="h6" color="white" sx={{ pl: 2 }}>
                Vial User Forms
              </Typography>

              {/* Menu Items */}
              <Box sx={{ display: "flex", gap: 2, pr: 2 }}>
                <Nav />
              </Box>
            </Toolbar>
          </Box>
        </Box>

        {/* Top-Aligned Content Area */}
        <Box
          sx={{
            width: "95%",
            display: "flex",
            justifyContent: "center",
            position: "relative",
            top: 0,
            mt: 0,
          }}
        >
          <Box sx={{ width: "90%" }}>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/create-form" replace />}
              />
              <Route path="/create-form" element={<CreateForm />} />
              <Route path="/forms-list" element={<FormsList />} />
              <Route path="/forms/:formId" element={<SubmitForm />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
