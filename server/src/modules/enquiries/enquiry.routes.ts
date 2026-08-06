import { FastifyInstance } from "fastify";
import { z } from "zod";
import { Enquiry } from "../../models/Enquiry";
import { notificationService } from "../../services/notification.service";
import { logger } from "../../utils/logger";

const createEnquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  courseOfInterest: z.string().min(2, "Course of interest is required"),
  message: z.string().optional(),
});

export async function enquiryRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post("/", async (request, reply) => {
    const input = createEnquirySchema.parse(request.body);

    // 1. Save to Database
    const enquiry = await Enquiry.create(input);
    logger.info(`Enquiry saved to DB: ${enquiry._id}`);

    // 2. Trigger Notifications (Fire and forget, so we don't block the response)
    notificationService.sendNewEnquiryAlert(input).catch((err) => {
      logger.error(err, "Failed to trigger enquiry notifications");
    });

    reply
      .code(201)
      .send({ message: "Enquiry submitted successfully", enquiry });
  });

  // Admin route to list enquiries
  fastify.get("/", { preHandler: [fastify.authenticate] }, async (request) => {
    // Basic implementation for future admin dashboard
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return { data: enquiries };
  });
}
