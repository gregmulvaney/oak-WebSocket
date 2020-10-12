import { Application } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { oakWebSocket, Room } from "../mod.ts";

const app = new Application();
const wss = new oakWebSocket();

wss.on("connect", async (sock) => {
  console.log("Socket Connected");
  await sock.join("my channel!");

  sock.on("joined", (room: Room) => {
    console.log(`Joined room ${room}`);
  });

  sock.on("message", (message: string) => {
    console.log(message);
  });
});

app.use(wss.connect);

app.addEventListener("listen", () => {
  console.log("Listening on port 5000");
});

app.listen({ port: 5000 });
