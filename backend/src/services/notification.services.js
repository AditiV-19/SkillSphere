import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

import { getIO, getUserSocket } from "../utils/sockets.js";

import { sendNotificationEmail } from "./email.services.js";

export const sendNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  link = "",
  sendEmail = true,
}) => {
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    link,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "firstname lastname profilePicture")
    .populate("recipient", "firstname lastname email");

  const socketId = getUserSocket(recipient);

  if (socketId && getIO()) {
    getIO().to(socketId).emit(
      "newNotification",
      populatedNotification
    );
  }

  if (sendEmail) {
    const user = await User.findById(recipient);

    if (user?.email) {
      await sendNotificationEmail({
        to: user.email,
        title,
        message,
      });
    }
  }

  return populatedNotification;
};