import mongoose from "mongoose";
import app from "./app.js";
import logger from "./configs/logger.config.js";

// env variables
const PORT = process.env.PORT || 8000;
const { DATABASE_URL } = process.env;

// exit on mongodb error
mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error : ${err}`);
  process.exit(1);
});

// mongodb debug mode
if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

// mongodb connection
mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connection to the database");
  });

let server;
server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

// handle server error

const exitHandler = () => {
  if (server) {
    logger.info("Server Closed");
    process.exit(1); //kill the server and throw the error
  } else {
    process.exit(1); //kill the server and throw the error
  }
};

const unexpactedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpactedErrorHandler);
process.on("unhandledRejection", unexpactedErrorHandler);

//SIGTERM
process.on("SIGTERM", () => {
  if (server) {
    logger.info("Server Closed");
    process.exit(1); //kill the server and throw the error
  }
});
