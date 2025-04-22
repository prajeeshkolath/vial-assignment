import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useParams } from "react-router-dom";

const API_HOST = import.meta.env.VITE_API_HOST;

interface IResponse {
  question: string;
  answer: string;
}

interface IForm {
  name: string;
  questions: Array<{
    type: string;
    question: string;
    required?: boolean;
    answerChoices?: Array<{ value: string; option: string }>;
  }>;
}

const FillFormPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>(); // Get form ID from the URL
  const [form, setForm] = useState<IForm>({} as IForm);
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<Array<IResponse>>([]); // Store user responses
  const [errors, setErrors] = useState<{ [key: number]: string }>({}); // Track validation errors
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch form details
  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_HOST}/forms/${formId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch form details");
        }
        const { data } = await response.json();
        setForm(data); // Assuming the API returns { name, questions }

        setResponses(
          data.questions.map(
            (question: {
              type: string;
              question: string;
              required?: boolean;
            }) => ({ question: question.question, answer: "" }),
          ),
        ); // Initialize responses array
      } catch (error) {
        console.error("Error fetching form details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    console.log("Input changed:", index, value);
    setResponses((prevResponses) =>
      prevResponses.map((response, i) =>
        i === index ? { ...response, answer: value } : response,
      ),
    );

    // Clear error when the user starts typing/selecting
    if (!isEmpty(value)) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[index];
        return updatedErrors;
      });
    }
  };

  const isEmpty = (value: unknown) => {
    value = typeof value === "string" ? value.trim() : value;
    return value === "" || value === null || value === undefined;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newErrors: { [key: number]: string } = {};
      // Validate required fields

      form?.questions.forEach((question, index) => {
        if (question.required && isEmpty(responses[index]?.answer)) {
          newErrors[index] = "This field is required";
        }
      });
      console.log("Form submitted:", responses);

      setErrors(newErrors); // Set validation errors

      if (Object.keys(newErrors).length > 0) {
        return; // Stop submission if there are validation errors
      }

      console.log(" newErrors>>>:", newErrors);
      setIsSubmitting(true); // Set loading state to true

      const response = await fetch(`${API_HOST}/source-records/${formId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses }),
      });

      console.log("Response:", response);

      if (!response.ok) {
        const errorResponse = await response.json();
        if (response.status === 400) {
          setSnackbar({
            open: true,
            message: errorResponse.message,
            severity: "error",
          });
          return;
        } else {
          throw new Error("Failed to submit the form. Please try again.");
        }
      }

      // Show success message
      setSnackbar({
        open: true,
        message: "Form submitted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.log("Form submitted:", error);
      setSnackbar({
        open: true,
        message: "Failed to submit the form. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!form) {
    return <Typography variant="h6">Form not found</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: "100%", mx: "auto", mt: 10 }}
      >
        <Typography variant="h4" gutterBottom>
          {form.name}...
        </Typography>

        {/* Snackbar for Success/Error Messages */}
        <Snackbar
          open={snackbar.open}
          onClose={handleCloseSnackbar}
          sx={{ mt: 10 }} // Add margin from the top
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Positioned at the top center
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Stack spacing={3}>
          {form.questions.map((question, index) => (
            <Box key={index}>
              {question.type === "text" && (
                <TextField
                  fullWidth
                  label={question.question}
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => handleInputChange(index, e.target.value)}
                  error={!!errors[index]} // Show error if validation fails
                  helperText={errors[index]} // Display error message
                />
              )}
              {question.type === "textarea" && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={question.question}
                  onChange={(e) =>
                    handleInputChange(index, e.target.value as string)
                  }
                  error={!!errors[index]} // Show error if validation fails
                  helperText={errors[index]} // Display error message
                />
              )}
              {question.type === "datetime" && (
                <DateTimePicker
                  label={question.question}
                  onChange={(value) =>
                    handleInputChange(index, value ? value.toString() : "")
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors[index], // Show error if validation fails
                      helperText: errors[index],
                    },
                  }}
                />
              )}
              {question.type === "dropdown" && (
                <FormControl fullWidth error={!!errors[index]}>
                  <InputLabel id={`dropdown-label-${index}`}>
                    {question.question}
                  </InputLabel>
                  <Select
                    labelId={`dropdown-label-${index}`}
                    onChange={(e) =>
                      handleInputChange(index, e.target.value as string)
                    }
                    displayEmpty
                  >
                    {question.answerChoices?.map(
                      (choice: { value: string; option: string }) => (
                        <MenuItem key={choice.value} value={choice.value}>
                          {choice.option}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                  {!!errors[index] && (
                    <FormHelperText>{errors[index]}</FormHelperText>
                  )}
                </FormControl>
              )}
            </Box>
          ))}
        </Stack>

        {/* Submit Button */}
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSubmitting} // Disable button while submitting
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            } // Show spinner
          >
            {isSubmitting ? "Submitting..." : "Submit Form"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default FillFormPage;
