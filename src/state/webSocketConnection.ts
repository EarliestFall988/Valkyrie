import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface WebSocketConnectionState {
  connectionCount: number;
  setConnectionCount: (connectionCount: number) => void;
}

export const useWebSocketConnectionStore = create<WebSocketConnectionState>()(
  devtools(
    persist(
      (set) => ({
        connectionCount: 0,
        setConnectionCount: (connectionCount) => set({ connectionCount }),
      }),
      {
        name: "webSocketConnection",
      }
    )
  )
);