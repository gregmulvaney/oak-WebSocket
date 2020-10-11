import {
  acceptable,
  acceptWebSocket,
  Context,
  v4,
  WebSocket,
} from "../deps.ts";
import { Room, SocketID } from "./types.ts";
import { Socket } from "./socket.ts";

export class Middleware {
  protected sockets: Map<SocketID, WebSocket> = new Map();
  protected rooms: Map<Room, Set<SocketID>> = new Map();
  protected socketRooms: Map<SocketID, Set<Room>> = new Map();

  constructor() {
    this.connect = this.connect.bind(this);
  }

  public async connect(ctx: Context) {
    // Upgrade the connection
    await ctx.upgrade();

    // Check if the connection is an acceptable WebSocket
    if (acceptable(ctx.request.serverRequest)) {
      // Get connection details from the request
      const {
        conn,
        r: bufReader,
        w: bufWriter,
        headers,
      } = ctx.request.serverRequest;
      try {
        // Create the WebSocket Connection
        const sock: WebSocket = await acceptWebSocket({
          conn,
          bufReader,
          bufWriter,
          headers,
        });

        // Generate a SocketID and add it to the middlewares Socket Map
        const socketID: SocketID = v4.generate();
        this.sockets.set(socketID, sock);
        // Create a new Socket class instance
        const ws = new Socket(socketID, this);
        await ws.open();
      } catch (error) {
        console.error("Error creating a WebSocket connection");
      }
    }
  }
}
