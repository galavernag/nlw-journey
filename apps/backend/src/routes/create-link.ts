import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/link",
    {
      schema: {
        body: z.object({
          title: z.string().min(4),
          url: z.string().url(),
        }),
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { url, title } = request.body;
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({ where: { id: tripId } });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      const link = await prisma.link.create({
        data: {
          title,
          url,
          trip_id: tripId,
        },
      });

      return link;
    }
  );
}
