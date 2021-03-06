import {
  acceptable,
  acceptWebSocket,
  WebSocket,
  EventEmitter,
  v4,
} from "../deps.ts";

import { Room, SocketID } from "./types.ts";
import { Socket } from "./socket.ts";

export class oakWebSocket extends EventEmitter {
  protected sockets: Map<SocketID, WebSocket> = new Map();
  protected rooms: Map<Room, Set<SocketID>> = new Map();
  protected socketRooms: Map<SocketID, Set<Room>> = new Map();

  constructor() {
    super();
    this.connect = this.connect.bind(this);
  }

  /**
   * Importing the context type breaks everything because of conflicting versioning issues
   * @param ctx
   */
  public async connect(ctx: any): Promise<void> {
    await ctx.upgrade();

    if (acceptable(ctx.request.serverRequest)) {
      const {
        conn,
        r: bufReader,
        w: bufWriter,
        headers,
      } = ctx.request.serverRequest;
      try {
        const sock: WebSocket = await acceptWebSocket({
          conn,
          bufReader,
          bufWriter,
          headers,
        });

        // Generate an ID for the websocket and store it in the Sockets Map
        const socketID: SocketID = v4.generate();
        this.sockets.set(socketID, sock);

        // Instantiate a new Socket class
        const ws = new Socket(socketID, this);
        // Emit a connection event
        this.emit("connect", ws);
        await ws.open();
      } catch (error) {
        console.log(error);
      }
    }
  }
}
