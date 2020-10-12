import { WebSocket, isWebSocketCloseEvent, EventEmitter } from "../deps.ts";
import { Room, SocketID } from "./types.ts";
import type { oakWebSocket } from "./middleware.ts";

export class Socket extends EventEmitter {
  protected SocketID: SocketID;
  protected server: any;
  protected id: SocketID;

  constructor(socketID: SocketID, server: oakWebSocket) {
    super();
    this.SocketID = socketID;
    this.server = server;
    this.id = this.SocketID;
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
        // Cleanup socket on close event
        this.server.sockets.delete(this.SocketID);
        const rooms = this.server.socketRooms.get(this.id);
        if (rooms) {
          for (const room of rooms) {
            this.server.rooms.get(room).delete(this.SocketID);
          }
        }
        this.server.socketRooms.delete(this.SocketID);
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

    this.emit("joined", room);
  }
}
