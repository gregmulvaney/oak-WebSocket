import { Application, Router } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { Middleware } from "../mod.ts";

const app = new Application();
const wss = new Middleware();
const router = new Router();

router.get("/", wss.connect);

app.use(router.routes(), router.allowedMethods());

app.addEventListener("listen", () => {
  console.log("Listening on port 5000");
});

app.listen({ port: 5000 });
