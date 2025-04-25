import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.html("<h1>Hello Hono!</h1>");
});

app.get("/users", (c) => {
  return c.text("Getting all users...");
});

app.get("/users/:id", (c) => {
  // console.log(c.req.param());
  return c.text(`Getting the details of User ${c.req.param("id")}`);
});

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on Port ${info.port}`);
  }
);
