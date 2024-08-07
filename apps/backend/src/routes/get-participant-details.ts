import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";
// import { ClientError } from "../errors/client-error";

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/participant/:participantId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId, participantId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true,
            },
            where: {
              id: participantId,
            },
          },
        },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      return { participant: trip.participants };
    }
  );
}
