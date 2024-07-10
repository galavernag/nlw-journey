import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

import { dayjs } from "../lib/dayjs";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { destination, starts_at, ends_at } = request.body;
      const { tripId } = request.params;

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Invalid trip start date");
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error("Invalid trip end date");
      }

      const trip = await prisma.trip.findUnique({ where: { id: tripId } });

      if (!trip) {
        throw new Error("Trip not found");
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: { destination, starts_at, ends_at },
      });

      return;
    }
  );
}
