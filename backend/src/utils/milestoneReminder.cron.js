import cron from "node-cron";

import { Gig } from "../models/gig.model.js";
import { sendNotification } from "../services/notification.services.js";

cron.schedule("* * * * *", async () => {
  try {
    console.log("Running milestone reminder job...");

    const gigs = await Gig.find({
      status: "in_progress",
    })
      .populate("assignedFreelancer", "firstname lastname email")
      .populate("client", "firstname lastname email");

      console.log("Total gigs:", gigs.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderConfig = {
      7: "sevenDays",
      3: "threeDays",
      1: "oneDay",
    };

    for (const gig of gigs) {
      for (const milestone of gig.milestones) {
        // Skip completed milestones
        if (milestone.status === "completed") {
          continue;
        }
        const deadline = new Date(milestone.dueDate);
        deadline.setHours(0, 0, 0, 0);

        const remainingDays = Math.ceil(
          (deadline - today) / (1000 * 60 * 60 * 24),
        );

        if (remainingDays < 0) {
          continue;
        }

        // 7-day reminder
        const reminderKey = reminderConfig[remainingDays];

        if (reminderKey && !milestone.remindersSent[reminderKey]) {
          const message = `"${milestone.title}" is due in ${remainingDays} day${remainingDays > 1 ? "s" : ""}.`;

          await sendNotification({
            recipient: gig.assignedFreelancer._id,
            sender: gig.client._id,
            type: "MILESTONE",
            title: "Milestone Deadline Reminder",
            message,
            link: `/gigs/${gig._id}`,
            sendEmail: true,
          });

          await sendNotification({
            recipient: gig.client._id,
            sender: gig.assignedFreelancer._id,
            type: "MILESTONE",
            title: "Milestone Deadline Reminder",
            message,
            link: `/client/gigs/${gig._id}`,
            sendEmail: true,
          });

          milestone.remindersSent[reminderKey] = true;
        }
      }

      // Save the updated reminder flags
      await gig.save();
    }

    console.log("Milestone reminder job completed.");
  } catch (error) {
    console.error("Milestone Reminder Cron Error:", error);
  }
});
