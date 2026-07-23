import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "@/chat/types/chat";

const TOKEN_KEY = import.meta.env.VITE_JWT_KEY || "travelers_hub_token";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const WS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
let client: Client | null = null;
const subscriptions = new Map<number, ReturnType<Client["subscribe"]>>();

export function connectStomp(onConnected?: () => void) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || client?.active) return;

  client = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws-stomp`),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onConnect: () => onConnected?.(),
    onStompError: (frame) => {
      console.error("[STOMP] 서버 에러:", frame.headers["message"]);
    },
  });

  client.activate();
}

export function disconnectStomp() {
  subscriptions.forEach((sub) => sub.unsubscribe());
  subscriptions.clear();
  client?.deactivate();
  client = null;
}

export function subscribeRoom(
  roomId: number,
  onMessage: (message: ChatMessage) => void,
) {
  if (!client?.active || subscriptions.has(roomId)) return;

  const sub = client.subscribe(`/sub/rooms/${roomId}`, (frame: IMessage) => {
    onMessage(JSON.parse(frame.body));
  });
  subscriptions.set(roomId, sub);
}

export function unsubscribeRoom(roomId: number) {
  subscriptions.get(roomId)?.unsubscribe();
  subscriptions.delete(roomId);
}

export function sendMessage(
  roomId: number,
  content: string,
  messageType: string = "TEXT",
) {
  if (!client?.active) return;
  client.publish({
    destination: `/pub/rooms/${roomId}/send`,
    body: JSON.stringify({ content, messageType }),
  });
}
