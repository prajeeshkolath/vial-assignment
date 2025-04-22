import { Button } from "@mui/material";
import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <>
      <NavLink
        to="/create-form"
        style={({ isActive }) => ({
          color: isActive ? "cyan" : "white",
        })}
      >
        <Button
          sx={{
            color: "inherit",
            "&:focus": {
              outline: "none",
            },
          }}
        >
          Create a new form
        </Button>
      </NavLink>
      <NavLink
        to="/forms-list"
        style={({ isActive }) => ({
          textDecoration: "none",
          color: isActive ? "cyan" : "white",
        })}
      >
        <Button
          sx={{
            color: "inherit",
            "&:focus": {
              outline: "none",
            },
          }}
        >
          Forms List
        </Button>
      </NavLink>
      <NavLink
        to="/user-submissions"
        style={({ isActive }) => ({
          textDecoration: "none",
          color: isActive ? "cyan" : "white",
        })}
      >
        <Button
          sx={{
            color: "inherit",
            "&:focus": {
              outline: "none",
            },
          }}
        >
          User Submissions
        </Button>
      </NavLink>
    </>
  );
}
