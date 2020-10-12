import { Application } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { oakWebSocket } from "../mod.ts";

const app = new Application();
const wss = new oakWebSocket();

wss.on("connect", (sock) => {
  console.log("Socket Connected");
  sock.on("message", (message: string) => {
    console.log(message);
  });
});

app.use(wss.connect);

app.addEventListener("listen", () => {
  console.log("Listening on port 5000");
});

app.listen({ port: 5000 });
