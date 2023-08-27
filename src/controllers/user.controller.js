import createHttpError from "http-errors";
import { searchUsers as searchUserService } from "../services/user.service.js";

export const searchUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search;
    if (!keyword) {
      throw createHttpError.BadRequest("Oops.. Something went wrong.");
    }

    const users = await searchUserService(keyword);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
