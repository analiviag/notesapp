import userHandler from "../handlers/user.js";
import passport from "passport";
import { validationResult } from "express-validator";

//Register
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "fail", errors: errors.array() });
  }
  try {
    const userData = req.body;

    const newUser = await userHandler.createUser(userData);

    req.login(newUser, (err) => {
      if (err) {
        console.error("Error logging in user after registration:", err);
        req.flash(
          "error",
          "Registration succeeded, but auto-login failed. Please try logging in manually."
        );
        return res.redirect("/login");
      }
      req.flash(
        "success",
        "Welcome! Registration successful and you are now logged in."
      );
      return res.redirect("/notes");
    });
  } catch (error) {
    console.error("Error in registerUser controller:", error);
    let errorMessage = "Error registering user.";
    if (
      error.name === "UserExistsError" ||
      error.code === 409 ||
      error.code === 11000
    ) {
      errorMessage =
        error.message ||
        "An account with that email or username already exists.";
    } else if (error.name === "ValidationError") {
      errorMessage = "Registration validation failed: " + error.message;
    }
    req.flash("error", errorMessage);
    return res.redirect("/register");
  }
};

//Login
const loginUser = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/notes",
    failureRedirect: "/login",
    successFlash: "Welcome back! You are successfully logged in.",
    failureFlash: true,
  })(req, res, next);
};

//ID
const getUserById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "fail", errors: errors.array() });
  }

  const userId = req.params.userId;

  const user = await userHandler.findUserById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    return next(err);
  }

  const { hash, salt, ...safeUser } = user;
  res.status(200).json({ status: "success", data: { user: safeUser } });
};

//Logout
const logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      req.flash("error", "Logout failed. Please try again.");
      return res.redirect("/");
    }
    req.flash("success", "You have been logged out successfully.");
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Error destroying session during logout:", sessionErr);
      }
      res.redirect("/login");
    });
  });
};

export default { registerUser, getUserById, loginUser, logoutUser };
