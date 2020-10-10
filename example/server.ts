import { Application } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { WebSocketMiddleware } from "../mod.ts";

const app = new Application();
const wss = new WebSocketMiddleware();

wss.addEventListener("connect", () => {
  console.log("Socket Connected");
});

app.use(wss.connect);

app.addEventListener("listen", () => {
  console.log("listening on port 5000");
});

app.listen({ port: 5000 });
