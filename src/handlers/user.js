import User from "../models/user.js";

const createUser = async (userData) => {
  try {
    const { email, username, password, ...otherUserData } = userData;

    const userToRegister = new User({
      email: email,
      username: username,
      ...otherUserData,
    });

    const registeredUser = await User.register(userToRegister, password);
    return registeredUser;
  } catch (error) {
    console.error("Error creating user", error);
    if (error.name === "UserExistsError") {
      const newError = new Error(
        `User with email ${userData.email} already exists.`
      );
      newError.code = 409;
      newError.name = "UserExistsError";
      throw newError;
    }
    throw error;
  }
};

//Find user by ID
const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    return user;
  } catch (error) {
    console.error(`Error finding user by ID ${userId}`, error);
    throw error;
  }
};

//Find user by email
const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email }).lean();
    return user;
  } catch (error) {
    console.error(`Error finding user with email ${email}`, error);
    throw error;
  }
};

export default { createUser, findUserById, findUserByEmail };
