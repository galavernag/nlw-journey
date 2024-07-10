import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

import { dayjs } from "../lib/dayjs";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        body: z.object({
          email: z.string().email(),
        }),
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { email } = request.body;
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({ where: { id: tripId } });

      if (!trip) {
        throw new Error("Trip not found");
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");
      const mail = await getMailClient();
      const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`;
      const message = await mail.sendMail({
        from: {
          name: "Equipe Plann.er",
          address: "oi@plann.er",
        },
        to: participant.email,
        subject: `Confirme sua presença na viagem para ${trip.destination}`,
        html: `
              <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                <p>Você foi convidado(a) para uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate} a  ${formattedEndDate}</strong></p>
                <p></p>
                <p>Para confirmar sua presença, clique no link abaixo.</p>
                <p></p>
      
                <a href="${confirmationLink}">Confirmar viagem</a>
              
                <p></p>
                <p>Caso você não saiba do que trata esse e-mail, apenas ignore-o</p>
              </div>`.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { participant };
    }
  );
}