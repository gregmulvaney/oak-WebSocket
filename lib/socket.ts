import { WebSocket, isWebSocketCloseEvent } from "../deps.ts";
import { Room, SocketID } from "./types.ts";
import type { Middleware } from "./middleware.ts";

export class Socket {
  protected SocketID: SocketID;
  protected server: any;

  constructor(socketID: SocketID, server: Middleware) {
    this.SocketID = socketID;
    this.server = server;
  }

  // Do stuff once socket is open
  public async open() {
    // Find the relevant socket in the Middlewares sockets Map using the SocketID
    const sock: WebSocket = this.server.sockets.get(this.SocketID);

    // Handle WebSocket events
    for await (const event of sock) {
      if (typeof event === "string") {
        console.log(event);
        await sock.send("Works");
      } else if (event instanceof Uint8Array) {
        console.log(event);
      } else if (isWebSocketCloseEvent(event)) {
      }
    }
  }

  public async join(room: Room, socketID: SocketID = this.SocketID) {
    if (!this.server.rooms.has(room)) {
      this.server.rooms.set(room, new Set<SocketID>());
    }
    this.server.rooms.get(room).add(socketID);

    if (!this.server.socketRooms.has(socketID)) {
      this.server.socketRooms.set(socketID, new Set<Room>());
    }
    this.server.socketRooms.get(socketID).add(room);
  }
}
