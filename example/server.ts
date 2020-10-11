import { Application } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { WebSocketMiddleware } from "../mod.ts";

const app = new Application();
const wss = new WebSocketMiddleware();

// This is awful and I hate it. There has to be a better way
wss.addEventListener("connect", ({ ws }) => {
  console.log("Socket Connected");

  ws!.join("Test2");
});

app.use(wss.connect);

app.addEventListener("listen", () => {
  console.log("listening on port 5000");
});

app.listen({ port: 5000 });
