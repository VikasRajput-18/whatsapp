import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

export default async function (req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return next(createHttpError.Unauthorized("Unauthorized"));
  }

  const bearerToken = req.headers["authorization"].split(" ")[1];

  jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      return next(createHttpError.Unauthorized());
    }
    req.user = payload;
    next();
  });
}
