import { body, param } from "express-validator";

//Validation for user registration
export const validateUserRegistration = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 2, max: 30 })
    .withMessage("Username must have between 2 and 30 characters.")
    .isAlphanumeric()
    .withMessage("Username must contain only letters and numbers."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

//Validation for creating a note
export const validateNoteCreation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters."),

  body("content").trim().notEmpty().withMessage("Content is required."),

  body("color")
    .optional()
    .isIn(["white", "yellow", "blue", "green", "pink"])
    .withMessage("Invalid color specified."),

  body("isPinned")
    .optional()
    .isBoolean()
    .withMessage("isPinned must be a boolean value (true or false)."),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array.")
    .custom((tags) =>
      tags.every((tag) => typeof tag === "string" && tag.trim() !== "")
    )
    .withMessage("All tags must be non-empty strings."),
];

//Validation for updating notes
export const validateNoteUpdate = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters."),

  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty if provided."),

  body("color")
    .optional()
    .isIn(["white", "yellow", "green", "blue", "pink"])
    .withMessage("Invalid color specified."),

  body("isPinned")
    .optional()
    .isBoolean()
    .withMessage("isPinned must be a boolean value."),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array.")
    .custom((tags) =>
      tags.every((tag) => typeof tag === "string" && tag.trim() !== "")
    )
    .withMessage("All tags must be non-empty strings."),
];

export const validateNoteId = [
  param("noteId").isMongoId().withMessage("Invalid note ID format."),
];
