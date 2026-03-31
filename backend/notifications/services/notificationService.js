import Notification from '../models/Notification.js';
import NotificationDelivery from '../models/NotificationDelivery.js';
import EmailQueue from '../models/EmailQueue.js';
import emailQueue from './notificationQueue.js';
import unifiedEmailService from './unifiedEmailService.js';
import emailTemplates from './emailTemplates.js';
import User from '../../src/models/User.js';

class NotificationService {
    async notifyAllTutors({ type, title, message, relatedId = null, relatedCollection = null, createdBy, templateData }) {
        try {
            const notification = await Notification.create({
                type,
                title,
                message,
                relatedId,
                relatedCollection,
                createdBy,
                isActive: true,
            });

            const tutors = await User.find({
                role: 'tutor',
                email: { $exists: true, $ne: null },
                isActive: { $ne: false },
                notificationEnabled: { $ne: false },
            }).select('_id name email');

            console.log(`Sending notification to ${tutors.length} tutors...`);

            const redisConfigured = Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT);
            let queueHealthy = false;
            if (redisConfigured && emailQueue.isEnabled !== false) {
                try {
                    await emailQueue.client.ping();
                    queueHealthy = true;
                } catch (queueHealthError) {
                    console.warn('Email queue unavailable. Falling back to direct Brevo send:', queueHealthError.message);
                }
            }

            const deliveryPromises = tutors.map(async (tutor) => {
                await NotificationDelivery.create({
                    notificationId: notification._id,
                    tutorId: tutor._id,
                    emailSent: false,
                    inAppRead: false,
                });

                const emailContent = type === 'new_job'
                    ? emailTemplates.newJobEmail({
                          tutorName: tutor.name,
                          ...templateData,
                      })
                    : emailTemplates.announcementEmail({
                          tutorName: tutor.name,
                          title,
                          message,
                          ...templateData,
                      });

                if (!queueHealthy) {
                    const result = await unifiedEmailService.sendWithBrevo({
                        to: tutor.email,
                        subject: emailContent.subject,
                        html: emailContent.html,
                    });

                    await EmailQueue.create({
                        tutorId: tutor._id,
                        notificationId: notification._id,
                        emailTo: tutor.email,
                        subject: emailContent.subject,
                        status: result.success ? 'sent' : 'failed',
                        sentAt: result.success ? new Date() : null,
                        errorMessage: result.success ? null : result.error,
                    });

                    if (result.success) {
                        await NotificationDelivery.findOneAndUpdate(
                            { tutorId: tutor._id, notificationId: notification._id },
                            { emailSent: true, emailSentAt: new Date() }
                        );
                    }
                    return;
                }

                try {
                    await EmailQueue.create({
                        tutorId: tutor._id,
                        notificationId: notification._id,
                        emailTo: tutor.email,
                        subject: emailContent.subject,
                        status: 'pending',
                    });

                    await emailQueue.add({
                        tutorId: tutor._id,
                        notificationId: notification._id,
                        emailData: {
                            to: tutor.email,
                            subject: emailContent.subject,
                            html: emailContent.html,
                        },
                    });
                } catch (queueError) {
                    console.warn(`Queue enqueue failed for ${tutor.email}. Falling back to direct Brevo send.`);

                    const result = await unifiedEmailService.sendWithBrevo({
                        to: tutor.email,
                        subject: emailContent.subject,
                        html: emailContent.html,
                    });

                    await EmailQueue.findOneAndUpdate(
                        { tutorId: tutor._id, notificationId: notification._id },
                        {
                            status: result.success ? 'sent' : 'failed',
                            sentAt: result.success ? new Date() : null,
                            errorMessage: result.success ? null : result.error,
                        },
                        { upsert: true }
                    );

                    if (result.success) {
                        await NotificationDelivery.findOneAndUpdate(
                            { tutorId: tutor._id, notificationId: notification._id },
                            { emailSent: true, emailSentAt: new Date() }
                        );
                    }
                }
            });

            await Promise.all(deliveryPromises);

            return {
                success: true,
                notificationId: notification._id,
                tutorsNotified: tutors.length,
            };
        } catch (error) {
            console.error('Notification service error:', error);
            throw error;
        }
    }

    async getTutorNotifications(tutorId, limit = 20) {
        const notifications = await NotificationDelivery.find({ tutorId })
            .populate({
                path: 'notificationId',
                match: { isActive: true },
            })
            .sort({ createdAt: -1 })
            .limit(limit);

        return notifications.filter((n) => n.notificationId !== null);
    }

    async markAsRead(tutorId, notificationId) {
        await NotificationDelivery.findOneAndUpdate(
            { tutorId, notificationId },
            {
                inAppRead: true,
                inAppReadAt: new Date(),
            }
        );
    }

    async getUnreadCount(tutorId) {
        const count = await NotificationDelivery.countDocuments({
            tutorId,
            inAppRead: false,
        });

        return count;
    }
}

export default new NotificationService();
