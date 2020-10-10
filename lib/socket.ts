import { WebSocket } from "../deps.ts";
import { SocketID, Room } from "./middleware.ts"; // Fix this shit

export class Socket extends EventTarget {
  private readonly socket: SocketID;
  private server: any;

  constructor(socket: SocketID, server: any) {
    super();
    this.socket = socket;
    this.server = server;
  }

  public async open() {
    this.join(this.socket, "Lobby");
    console.log(this.server.rooms);
  }

  public join(id: SocketID, room: Room) {
    if (!this.server.sids.has(id)) {
      this.server.sids.set(id, new Set());
    }
    this.server.sids.get(id).add(room);

    if (!this.server.rooms.has(room)) {
      this.server.rooms.set(room, new Set());
    }
    this.server.rooms.get(room).add(id);
  }
}
