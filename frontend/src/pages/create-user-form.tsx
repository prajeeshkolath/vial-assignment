import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const API_HOST = import.meta.env.VITE_API_HOST;

interface Question {
  id?: number;
  type: string;
  question: string;
  required?: boolean;
  answerChoices?: AnswerChoices[]; // For select type questions
}

interface AnswerChoices {
  option: string;
  value: string;
}

const FormPage: React.FC = () => {
  // Static questions
  const [name, setName] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [errors, setErrors] = useState<{ [key: number]: string }>({}); // Track errors for each question

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

  const handleRequiredChange = (index: number, value: boolean) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], required: value };
    setQuestions(updated);
  };

  const handleQuestionChange = (
    index: number,
    question: keyof Question,
    value: string,
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [question]: value };
    setQuestions(updated);

    // Clear error when the user starts typing
    if (question === "question" && value.trim() !== "") {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[index];
        return updatedErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: number]: string } = {};

    if (!name.trim()) {
      newErrors[-1] = "Name is required";
    }

    if (!questions.length) {
      setSnackbar({
        open: true,
        message: "At least one question is required",
        severity: "error",
      });
    }
    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[index] = "Question text is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const addQuestion = () => {
    setQuestions([...questions, { type: "text", question: "" }]);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // // Validate questions before submitting
    if (!validateForm()) {
      return;
    }

    const payload = {
      name,
      questions,
    };

    try {
      setIsSubmitting(true); // Set loading state to true
      const response = await fetch(`${API_HOST}/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error submitting form:", errorResponse);

        if (response.status === 409 || response.status === 400) {
          setSnackbar({
            open: true,
            message: errorResponse.message,
            severity: "error",
          });
        } else {
          throw new Error("Failed to submit the form. Please try again.");
        }
      } else {
        const data = await response.json();
        console.log("Form submitted successfully:", data);

        // Show success message
        setSnackbar({
          open: true,
          message: "Form created successfully!",
          severity: "success",
        });
      }
    } catch (error: unknown) {
      console.error("Error:", error);

      // Show error message
      setSnackbar({
        open: true,
        message: "Failed to submit the form. Please try again later.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddChoice = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (!question.answerChoices) {
      question.answerChoices = [];
    }
    question.answerChoices.push({ option: "", value: "" });
    setQuestions(updated);
  };

  const handleChoiceChange = (
    questionIndex: number,
    choiceIndex: number,
    key: keyof AnswerChoices,
    value: string,
  ) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.answerChoices) {
      question.answerChoices[choiceIndex][key] = value;
    }
    setQuestions(updated);
  };

  const handleRemoveChoice = (questionIndex: number, choiceIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.answerChoices) {
      question.answerChoices.splice(choiceIndex, 1);
    }
    setQuestions(updated);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%", mx: "auto", mt: 10 }}
    >
      <Typography variant="h6" gutterBottom>
        Create Form
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

      {/* Static Fields */}
      <TextField
        fullWidth
        label="Name*"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        sx={{ width: "50%", maxWidth: "400px" }}
        error={!!errors[-1]} // Show error if validation fails
        helperText={errors[-1]}
      />

      {/* Dynamic Questions */}
      <Typography variant="subtitle1" sx={{ mt: 3 }}>
        Questions
      </Typography>

      {questions.map((q, index) => (
        <Stack key={index} direction="column" spacing={2} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              sx={{ width: "50%" }}
              label={`Question ${index + 1}*`}
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(index, "question", e.target.value)
              }
              error={!!errors[index]} // Show error if validation fails
              helperText={errors[index]} // Display error message
            />
            <InputLabel id={`question-type-label-${index}`}>Type</InputLabel>
            <Select
              labelId={`question-type-label-${index}`}
              value={q.type}
              onChange={(e) =>
                handleQuestionChange(index, "type", e.target.value)
              }
              sx={{ width: "150px" }}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="textarea">Text Area</MenuItem>
              <MenuItem value="datetime">Date Time</MenuItem>
              <MenuItem value="dropdown">Drop Down</MenuItem>
            </Select>
            {/* Add a checkbox for marking the question as required */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={q.required || false}
                  onChange={(e) =>
                    handleRequiredChange(index, e.target.checked)
                  }
                />
              }
              label="Required"
            />
            <IconButton
              onClick={() => removeQuestion(index)}
              disabled={questions.length === 1}
            >
              <Delete />
            </IconButton>
          </Stack>

          {/* Render choices if the question type is "Drop Down" */}
          {q.type === "dropdown" && (
            <Box sx={{ pl: "50%" }}>
              <Typography variant="subtitle2">Choices</Typography>
              {q.answerChoices?.map((choice, choiceIndex) => (
                <Stack
                  key={choiceIndex}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <TextField
                    label="Option"
                    value={choice.option}
                    onChange={(e) =>
                      handleChoiceChange(
                        index,
                        choiceIndex,
                        "option",
                        e.target.value,
                      )
                    }
                  />
                  <TextField
                    label="Value"
                    value={choice.value}
                    onChange={(e) =>
                      handleChoiceChange(
                        index,
                        choiceIndex,
                        "value",
                        e.target.value,
                      )
                    }
                  />
                  <IconButton
                    onClick={() => handleRemoveChoice(index, choiceIndex)}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              ))}
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleAddChoice(index)}
                sx={{ mt: 1 }}
              >
                Add Choice
              </Button>
            </Box>
          )}
        </Stack>
      ))}

      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={addQuestion}
        sx={{ mt: 2 }}
      >
        Add Question
      </Button>

      {/* Submit Button */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSubmitting} // Disable button while submitting
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          } // Show spinner
        >
          {isSubmitting ? "Submitting..." : "Submit Form"}
        </Button>
      </Box>
    </Box>
  );
};

export default FormPage;
