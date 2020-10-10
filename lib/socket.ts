import { WebSocket } from "../deps.ts";
import { SocketID, Room } from "./middleware.ts"; // Fix this shit. Probably a types file or something.

export class Socket extends EventTarget {
  public readonly socket: SocketID;
  private server: any;

  constructor(socket: SocketID, server: any) {
    super();
    this.socket = socket;
    this.server = server;
  }

  public async open() {
    // Join the default room
    // TODO: make this room name  a preference
    this.join("Lobby", this.socket);

    // Locate the socket connection in the Sockets map
    // TODO: Question if this is a dumb way to do this
    const sock: WebSocket = this.server.sockets.get(this.socket);

    // Handle Socket events
    for await (const ev of sock) {
      if (typeof ev === "string") {
        console.log(ev);
        sock.send(ev);
      }
    }
  }

  public join(room: Room, id = this.socket) {
    if (!this.server.sids.has(id)) {
      this.server.sids.set(id, new Set());
    }
    this.server.sids.get(id).add(room);

    if (!this.server.rooms.has(room)) {
      this.server.rooms.set(room, new Set());
    }
    this.server.rooms.get(room).add(id);
    console.log(this.server.rooms);
  }
}
