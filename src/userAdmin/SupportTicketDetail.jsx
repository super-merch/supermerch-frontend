import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const STATUS_COLORS = {
  OPEN: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

const CATEGORY_COLORS = {
  ORDERS: "bg-indigo-100 text-indigo-700",
  PAYMENT: "bg-emerald-100 text-emerald-700",
  TECHNICAL: "bg-red-100 text-red-700",
  PRODUCT: "bg-cyan-100 text-cyan-700",
  RETURNS: "bg-amber-100 text-amber-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default function SupportTicketDetail() {
  const { token } = useContext(AuthContext);
  const { backendUrl, supportTicketId } = useContext(AppContext);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef(null);
  const isConversationLocked = ["RESOLVED", "CLOSED"].includes(
    ticket?.status
  );

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  const fetchTicket = async () => {
    if (!supportTicketId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/support-tickets/${supportTicketId}`,
        { headers: { token } }
      );
      if (data.success) {
        setTicket(data.data);
      }
    } catch (err) {
      console.error("Error fetching ticket:", err);
      toast.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [supportTicketId]);

  useEffect(() => {
    if (ticket?.messages?.length) {
      setTimeout(scrollToBottom, 100);
    }
  }, [ticket?.messages?.length]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (isConversationLocked) {
      toast.info("This ticket is resolved/closed. Please open a new ticket.");
      return;
    }
    if (!replyMessage.trim()) return;

    setSending(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/support-tickets/${supportTicketId}/messages`,
        { message: replyMessage },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Message sent");
        setReplyMessage("");
        fetchTicket();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="ml-3 text-sm font-medium text-gray-600">
          Loading ticket...
        </p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm font-medium">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="w-full px-3 pt-0 pb-10 lg:px-8 md:px-6 lg:pt-6 space-y-4">
      {/* Ticket Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900">
                {ticket.ticketNumber}
              </h3>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                  CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.OTHER
                }`}
              >
                {ticket.category}
              </span>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                  STATUS_COLORS[ticket.status] || STATUS_COLORS.CLOSED
                }`}
              >
                {ticket.status.replace("_", " ")}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">
              {ticket.subject}
            </h4>
            <p className="text-xs text-gray-500">
              Created: {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">
            Conversation
            {ticket.messages?.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-500">
                ({ticket.messages.length} message
                {ticket.messages.length !== 1 ? "s" : ""})
              </span>
            )}
          </h4>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: "400px", minHeight: "200px" }}
        >
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg, idx) => {
              const isUser = msg.senderType === "USER";
              return (
                <div
                  key={msg._id || msg.id || idx}
                  className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                >
                  {/* User avatar */}
                  {isUser && (
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isUser
                        ? "bg-gray-100 rounded-tl-sm"
                        : "bg-primary text-white rounded-tr-sm"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-1 ${
                        isUser ? "" : "justify-end"
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isUser ? "text-primary" : "text-white/90"
                        }`}
                      >
                        {msg.senderName}
                      </span>
                      {!isUser && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white/80">
                          Support
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm whitespace-pre-wrap break-words ${
                        isUser ? "text-gray-800" : "text-white"
                      }`}
                    >
                      {msg.message}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isUser ? "text-gray-400" : "text-white/60 text-right"
                      }`}
                    >
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>

                  {/* Admin avatar */}
                  {!isUser && (
                    <div className="flex-shrink-0 ml-2 mt-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.078-2.183L6.5 7.5 4.668 5.668A5.98 5.98 0 004 10c0 .993.241 1.929.668 2.754l1.49-1.637zm7.4-6.554a4.002 4.002 0 00-2.183-.078L12 6.5l1.934 1.934a5.98 5.98 0 00-.376-3.871z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-sm">No messages yet</p>
            </div>
          )}
        </div>

        {/* Reply Input */}
        {!isConversationLocked ? (
          <form
            onSubmit={handleSendReply}
            className="border-t border-gray-200 p-4"
          >
            <textarea
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={sending || !replyMessage.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
            <p className="text-sm text-gray-500">
              This ticket is resolved/closed. You cannot reply. Please reopen it from support or create a new ticket.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
