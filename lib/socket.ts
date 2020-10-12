import { WebSocket, isWebSocketCloseEvent, EventEmitter } from "../deps.ts";
import { Room, SocketID } from "./types.ts";
import type { oakWebSocket } from "./middleware.ts";

export class Socket extends EventEmitter {
  protected SocketID: SocketID;
  protected server: any;

  constructor(socketID: SocketID, server: oakWebSocket) {
    super();
    this.SocketID = socketID;
    this.server = server;
  }

  // Do stuff once socket is open
  public async open() {
    // Find the relevant socket in the Middlewares sockets Map using the SocketID
    const sock: WebSocket = this.server.sockets.get(this.SocketID);

    await this.join("Lobby", this.SocketID);

    // Handle WebSocket events
    for await (const ev of sock) {
      if (typeof ev === "string") {
        this.emit("message", ev);
        await sock.send("Works");
      } else if (ev instanceof Uint8Array) {
        console.log(ev);
      } else if (isWebSocketCloseEvent(ev)) {
      }
    }
  }

  public async join(room: Room, socketID: SocketID = this.SocketID) {
    if (!this.server.rooms.has(room)) {
      this.server.rooms.set(room, new Set<SocketID>());
    }
    this.server.rooms.get(room).add(socketID);

    if (!this.server.socketIDs.has(socketID)) {
      this.server.socketIDs.set(socketID, new Set<Room>());
    }
    this.server.socketIDs.get(socketID).add(room);
  }
}
