import { acceptable, acceptWebSocket, WebSocket, v4 } from "../deps.ts";
import { Socket } from "./socket.ts";

export type SocketID = string;
export type Room = string;

interface WebSocketConnectEventListener {
  (evt: WebSocketConnectEvent): void | Promise<void>;
}

interface WebSocketConnectEventListenerObject {
  handleEvent(evt: WebSocketConnectEvent): void | Promise<void>;
}

interface WebSocketConnectEventInit extends EventInit {
  sock?: WebSocket;
}

type WebSocketConnectEventListenerOrEventListenerObject =
  | WebSocketConnectEventListener
  | WebSocketConnectEventListenerObject;

class WebSocketConnectEvent extends Event {
  sock?: WebSocket;
  constructor(eventInitDict: WebSocketConnectEventInit) {
    super("connect", eventInitDict);
    this.sock = eventInitDict.sock;
  }
}

export class WebSocketMiddleware extends EventTarget {
  protected sockets: Map<SocketID, WebSocket> = new Map();
  protected rooms: Map<Room, Set<SocketID>> = new Map();
  protected sids: Map<SocketID, Set<Room>> = new Map();

  constructor() {
    super();
    this.connect = this.connect.bind(this);
  }

  public async connect(ctx: any) {
    // Upgrade request type
    await ctx.upgrade();

    // Check if request is acceptable WebSocket connection
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
        // Generate SocketID and add to the sockets map
        const socketID: SocketID = await v4.generate();
        this.sockets.set(socketID, sock);
        const ws: Socket = new Socket(socketID, this);
        // Dispatch the WebSocket connect event
        this.dispatchEvent(new WebSocketConnectEvent({ sock }));
        await ws.open();
      } catch (error) {
        throw new TypeError(error);
      }
    }
  }

  addEventListener(
    type: "connect",
    listener: WebSocketConnectEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener(
    type: "connect",
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    super.addEventListener(type, listener, options);
  }
}
