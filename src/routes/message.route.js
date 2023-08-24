import express from "express";
import trimRequest from "trim-request";

import {getMessages , sendMessage} from "../controllers/messages.controller.js"

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, sendMessage);
router.route("/:convo_id").get(trimRequest.all, authMiddleware, getMessages);

export default router;
