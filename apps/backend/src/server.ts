import fastify from "fastify";
import { createTrips } from "./routes/create-trips";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrips);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running");
});
