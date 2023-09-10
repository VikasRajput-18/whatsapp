import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
import {
  doesConversationExist,
  createConversation,
  populateConversation,
  getUserConversation,
} from "../services/conversation.service.js";
import { findUser } from "../services/user.service.js";

export const create_open_conversation = async (req, res, next) => {
  try {
    const sender_id = req.user.userId;
    const { receiver_id, isGroup } = req.body;

    if (isGroup == false) {
      if (!receiver_id) {
        logger.error("Please provide a receiver id to chat with him/her.");
        throw createHttpError.BadGateway("Oops... Somehting went wrong");
      }

      // check if chat alerady exist
      const existed_conversation = await doesConversationExist(
        sender_id,
        receiver_id,
        false
      );

      if (existed_conversation) {
        res.json(existed_conversation);
      } else {
        let receiver_user = await findUser(receiver_id);
        let convoData = {
          name: receiver_user.name,
          picture: receiver_user.picture,
          isGroup: false,
          users: [sender_id, receiver_id],
        };

        const newConvo = await createConversation(convoData);
        const populatedConvo = await populateConversation(
          newConvo._id,
          "users",
          "-password"
        );
        await res.status(200).json(populatedConvo);
      }
    } else {
      // it's a group chat

      // check if chat alerady exist
      const existed_group_conversation = await doesConversationExist(
        "",
        "",
        isGroup
      );
      res.status(200).json(existed_group_conversation);
    }
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const conversation = await getUserConversation(user_id);
    res.status(200).json(conversation);
  } catch (error) {
    next(error);
  }
};
export const createGroup = async (req, res, next) => {
  const { name, users } = req.body;
  // add current user to users
  users.push(req.user.userId);
  if (!name || !users) {
    throw createHttpError.BadRequest("Please fill all fields.");
  }
  if (users.length < 2) {
    throw createHttpError.BadRequest(
      "Atleast 2 users are required to start a group chat."
    );
  }
  let convoData = {
    name,
    users,
    isGroup: true,
    admin: req.user.userId,
    picture: process.env.DEFAULT_PICTURE,
  };
  try {
    const newConvo = await createConversation(convoData);
    const populatedConvo = await populateConversation(
      newConvo._id,
      "users admin",
      "-password"
    );
    res.status(200).json(populatedConvo);
  } catch (error) {
    next(error);
  }
};
