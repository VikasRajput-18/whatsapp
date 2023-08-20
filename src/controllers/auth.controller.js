import createHttpError from "http-errors";
import { createUser, signUser } from "../services/auth.service.js";
import { generateToken, verifyToken } from "../services/token.service.js";
import { findUser } from "../services/user.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, picture, status } = req.body;
    const user = await createUser({ name, email, password, picture, status });

    const accessToken = await generateToken(
      {
        userId: user._id,
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );
    const refreshToken = await generateToken(
      {
        userId: user._id,
      },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/v1/auth/refreshtoken",
      age: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({
      message: "Register success.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        access_token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await signUser(email, password);

    const accessToken = await generateToken(
      {
        userId: user._id,
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );
    const refreshToken = await generateToken(
      {
        userId: user._id,
      },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/v1/auth/refreshtoken",
      age: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({
      message: "login success.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        access_token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", { path: "/api/v1/auth/refreshtoken" });
    res.json({
      message: "logged out",
    });
  } catch (error) {
    next(error);
  }
};
export const refreshToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refreshToken;
    if (!refresh_token) {
      throw createHttpError.Unauthorized("Unauthorize");
    }

    const check = await verifyToken(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await findUser(check.userId);

    const accessToken = await generateToken(
      {
        userId: user._id,
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        access_token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
