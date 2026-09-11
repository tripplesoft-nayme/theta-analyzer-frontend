/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  useGetMyTicketsQuery,
  useLazyGetTicketMessagesQuery,
} from "@/store/Api/AdminApi/ClientSupportApi";
import { useAppSelector } from "@/hooks/useRedux";
// Sub-components
import TicketList from "./components/Tickets/TicketList";
import ChatHeader from "./components/Tickets/ChatHeader";
import MessageList from "./components/Tickets/MessageList";
import MessageInput from "./components/Tickets/MessageInput";
import { Ticket, Message } from "./components/Tickets/types";
// --- CONFIGURATION ---
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const SupportDashboard = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useGetMyTicketsQuery({});
  const [
    getTicketMessages,
    { data: messagesData, isFetching: isFetchingMessages },
  ] = useLazyGetTicketMessagesQuery();

  const tickets = data?.data;
  const accessToken = useAppSelector(
    (state) => state.auth.user?.adminAccessToken,
  );
  // Initialize Socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token: `${accessToken}` },
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
    });
    newSocket.on("connect", () => {
      console.log("🔌 Connected to socket ID: ", newSocket.id);
    });
    newSocket.on("connection_error", (error) => {
      console.log(error, "connection_error");
    });
    newSocket.on("error", (error) => {
      console.log(error, "error");
    });
    newSocket.io.on("reconnect_attempt", (attempt) => {
      console.log(`🔌 Reconnecting... #${attempt}`);
    });
    newSocket.io.on("reconnect_error", (error) => {
      console.log(error, "reconnect_error");
    });
    newSocket.io.on("reconnect_failed", () => {
      console.log("🔌 Reconnect failed");
    });
    setSocket(newSocket);
    return () => {
      console.log("🔌 Disconnecting socket...");
      newSocket.disconnect();
    };
  }, [accessToken]);

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg: any) => {
      if (msg.ticketId !== selectedTicket?.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            ticketId: msg.ticketId,
            text: msg.message || "",
            fileUrl: msg.file,
            sender: msg.senderRole === "CLIENT" ? "CLIENT" : "SUPPORT",
            timestamp: msg.createdAt,
          },
        ];
      });
    };

    const onTyping = (data: { isTyping: boolean; ticketId: string }) => {
      if (data.ticketId === selectedTicket?.id) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("new_chat_message", onNewMessage);
    socket.on("display_typing", onTyping);

    return () => {
      socket.off("new_chat_message", onNewMessage);
      socket.off("display_typing", onTyping);
    };
  }, [socket, selectedTicket?.id]);

  // Handle Ticket Selection
  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    if (ticket && socket) {
      setIsChatLoading(true);
      setMessages([]);
      socket.emit("joinTicket", { ticketId: ticket.id });
      await getTicketMessages(ticket.id);
      setIsChatLoading(false);
    }
  };

  // Sync REST Messages
  useEffect(() => {
    if (!messagesData || !selectedTicket) return;
    const normalizedMessages = messagesData.data.messages
      .filter((msg: any) => msg.ticketId === selectedTicket.id)
      .map((msg: any) => ({
        id: msg.id,
        ticketId: msg.ticketId,
        text: msg.message,
        fileUrl: msg.file,
        sender: msg.senderRole === "CLIENT" ? "CLIENT" : "SUPPORT",
        timestamp: msg.createdAt,
        senderName: msg.sender?.name,
      }));
    setMessages(normalizedMessages);
  }, [messagesData, selectedTicket]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    console.log("Sending message...");
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || !socket || !selectedTicket) {
      console.log("No message or file or socket or ticket");
      return;
    }

    let fileUrl = "";
    if (selectedFile) {
      fileUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
    }

    const messagePayload: any = {
      ticketId: selectedTicket.id,
      message: inputValue || null,
      fileUrl: fileUrl || null,
    };
    socket.emit("sendMessage", messagePayload);

    setInputValue("");
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview("file");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (socket && selectedTicket) {
      socket.emit("typing", {
        ticketId: selectedTicket.id,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex h-[calc(100vh-140px)] lg:h-[680px] min-h-[500px] border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <TicketList
        tickets={tickets}
        selectedTicket={selectedTicket}
        onSelectTicket={handleSelectTicket}
        isLoading={isLoading}
      />

      <div
        className={`lg:w-[450px] border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-all ${selectedTicket ? "w-full lg:w-[450px]" : "hidden"
          }`}
      >
        {selectedTicket && (
          <>
            <ChatHeader
              onBack={() => setSelectedTicket(null)}
              onClose={() => setSelectedTicket(null)}
            />

            <MessageList
              messages={messages}
              isChatLoading={isChatLoading}
              isFetchingMessages={isFetchingMessages}
              isTyping={isTyping}
              chatEndRef={chatEndRef}
            />

            <MessageInput
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              filePreview={filePreview}
              selectedFile={selectedFile}
              onRemoveFile={removeFile}
              onFileClick={() => fileInputRef.current?.click()}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
