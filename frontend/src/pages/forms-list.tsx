import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
} from "@mui/material";

const API_HOST = import.meta.env.VITE_API_HOST;

const FormPage: React.FC = () => {
  // State for forms
  const [forms, setForms] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);

  // Fetch forms from the backend
  useEffect(() => {
    const fetchForms = async () => {
      setIsLoadingForms(true);
      try {
        const response = await fetch(`${API_HOST}/forms`);
        if (!response.ok) {
          throw new Error("Failed to fetch forms");
        }
        const { data } = await response.json();
        setForms(data); // Assuming the API returns an array of forms

        console.log("Fetched forms:", data); // Debugging line to check fetched data
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setIsLoadingForms(false);
      }
    };

    fetchForms();
  }, []);

  return (
    <Box sx={{ width: "100%", mx: "auto", mt: 10 }}>
      <Typography variant="h6" gutterBottom>
        List of Forms
      </Typography>

      {/* Display loading spinner while fetching forms */}
      {isLoadingForms ? (
        <CircularProgress />
      ) : (
        <List>
          {forms.map((form) => (
            <ListItem key={form.id}>
              <ListItemText primary={form.name} secondary={`ID: ${form.id}`} />
              <Button variant="outlined" href={`/forms/${form.id}`}>
                Use Form
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FormPage;
