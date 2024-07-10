import fastify from "fastify";
import cors from "@fastify/cors";
import { createTrips } from "./routes/create-trips";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm-trip";
import { confirmParticipant } from "./routes/confirm-participant";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrips);
app.register(confirmTrip);
app.register(confirmParticipant);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running");
});
