import createHttpError from "http-errors";
import validator from "validator";
import bcrypt from "bcrypt";

import { UserModel } from "../models/index.js";

// env variables
let { DEFAULT_PICTURE, DEFAULT_STATUS } = process.env;

export const createUser = async (userData) => {
  const { name, email, password, picture, status } = userData;

  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Please fill all the fields.");
  }

  // check name length
  if (
    !validator.isLength(name, {
      min: 3,
      max: 32,
    })
  ) {
    throw createHttpError.BadRequest(
      "Please make sure your name is between 2 and 16 characters"
    );
  }

  //   check status length
  if (status && status.length > 128) {
    throw createHttpError.BadRequest(
      "Please make sure your status is less than 128 characters."
    );
  }

  //   check email validation
  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest(
      "Please make sure to provide a valid email address."
    );
  }

  const checkDb = await UserModel.findOne({ email });

  if (checkDb) {
    throw createHttpError.Conflict(
      "Please try again with a different email address , this email already exist."
    );
  }

  // check password length
  if (
    !validator.isLength(password, {
      min: 6,
      max: 128,
    })
  ) {
    throw createHttpError.BadRequest(
      "Please make sure your password is between 6 and 128 characters"
    );
  }

  // hash passowrd -> to be done in the user model

  // adding user to db
  const newUser = await new UserModel({
    name,
    email,
    picture: picture || DEFAULT_PICTURE,
    status: status || DEFAULT_STATUS,
    password,
  }).save();

  return newUser;
};

export const signUser = async (email, password) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();

  // check if user exist
  if (!user) {
    throw createHttpError.NotFound("No such user found");
  }

  // compare password
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw createHttpError.NotFound("Invalid Credentials");
  }

  return user;
};
