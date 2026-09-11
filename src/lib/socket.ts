import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
});

export const connectSocket = (token: string) => {
    if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
        socket.on("connect", ()=>{
            console.log("🔌 Connected to socket ID: ",socket.id);
        })
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
