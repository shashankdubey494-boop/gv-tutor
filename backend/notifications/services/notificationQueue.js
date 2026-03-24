import Queue from "bull";
import unifiedEmailService from "./unifiedEmailService.js";
import EmailQueue from "../models/EmailQueue.js";
import NotificationDelivery from "../models/NotificationDelivery.js";

const redisConfigured =
  process.env.NODE_ENV === "production" &&
  String(process.env.ENABLE_REDIS_QUEUE || "true").toLowerCase() !== "false" &&
  Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT);

const noopClient = {
  async ping() {
    throw new Error("Redis queue disabled");
  },
};

const createDisabledQueue = (reason = "Redis queue disabled") => ({
  isEnabled: false,
  client: noopClient,
  async add() {
    throw new Error(reason);
  },
  async getWaitingCount() {
    return 0;
  },
  async getActiveCount() {
    return 0;
  },
  async getFailedCount() {
    return 0;
  },
  async getDelayedCount() {
    return 0;
  },
  process() {},
  on() {},
});

let emailQueue = createDisabledQueue("Redis not configured");

if (redisConfigured) {
  try {
    const queue = new Queue("email-notifications", {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASSWORD,
        tls: String(process.env.REDIS_HOST).includes("upstash") ? {} : undefined,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
      limiter: {
        max: 2,
        duration: 1000,
      },
    });

    queue.isEnabled = true;

    // Process one job at a time.
    queue.process(1, async (job) => {
      const { tutorId, notificationId, emailData } = job.data;

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const result = await unifiedEmailService.sendWithGmail(emailData);

        await EmailQueue.findOneAndUpdate(
          { tutorId, notificationId },
          {
            status: result.success ? "sent" : "failed",
            sentAt: result.success ? new Date() : null,
            $inc: { attempts: 1 },
            lastAttemptAt: new Date(),
          }
        );

        if (result.success) {
          await NotificationDelivery.findOneAndUpdate(
            { tutorId, notificationId },
            {
              emailSent: true,
              emailSentAt: new Date(),
            }
          );
        }

        return result;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(`Email failed for tutor ${tutorId}:`, error.message);
        }

        await EmailQueue.findOneAndUpdate(
          { tutorId, notificationId },
          {
            status: "failed",
            errorMessage: error.message,
            $inc: { attempts: 1 },
            lastAttemptAt: new Date(),
          }
        );

        throw error;
      }
    });

    queue.on("completed", (job) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`Email sent to tutor ${job.data.tutorId}`);
      }
    });

    queue.on("failed", (job, err) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(`Email failed for tutor ${job?.data?.tutorId}:`, err.message);
      }
    });

    // Critical: prevent queue connection errors from crashing the Node process.
    queue.on("error", (err) => {
      console.error("Email queue error, falling back to direct email mode:", err.message);
    });

    emailQueue = queue;
  } catch (error) {
    console.error("Failed to initialize Redis queue, using fallback mode:", error.message);
    emailQueue = createDisabledQueue(error.message);
  }
}

export default emailQueue;
