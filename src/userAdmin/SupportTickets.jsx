import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

const CATEGORIES = [
  { value: "ORDERS", label: "Orders" },
  { value: "PAYMENT", label: "Payment" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "PRODUCT", label: "Product" },
  { value: "RETURNS", label: "Returns" },
  { value: "OTHER", label: "Other" },
];

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

export default function SupportTickets() {
  const { token } = useContext(AuthContext);
  const { backendUrl, setActiveTab, setSupportTicketId } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });
      if (statusFilter) params.set("status", statusFilter);

      const { data } = await axios.get(
        `${backendUrl}/api/support-tickets?${params}`,
        { headers: { token } }
      );
      if (data.success) {
        setTickets(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, currentPage, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/support-tickets`,
        formData,
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Ticket created successfully!");
        setShowCreateForm(false);
        setFormData({ category: "", subject: "", description: "" });
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  const handleViewTicket = (ticketId) => {
    setSupportTicketId(ticketId);
    setActiveTab("supportDetail");
    navigate(
      { pathname: location.pathname, hash: "#supportDetail" },
      { replace: true }
    );
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="w-full px-3 pt-0 pb-10 lg:px-8 md:px-6 lg:pt-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Support Tickets
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Need help? Create a ticket and we'll get back to you.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showCreateForm ? (
            <>
              <span className="text-lg leading-none">&times;</span> Cancel
            </>
          ) : (
            <>
              <span className="text-lg leading-none">+</span> New Ticket
            </>
          )}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Create New Ticket
          </h4>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Brief summary of your issue"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your issue in detail..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {creating ? "Creating..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              statusFilter === tab.key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {statusFilter ? STATUS_TABS.find((t) => t.key === statusFilter)?.label : "All"} Tickets
          </span>
          {totalCount > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
              {totalCount} ticket{totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="ml-3 text-sm font-medium text-gray-600">
              Loading tickets...
            </p>
          </div>
        ) : tickets.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() => handleViewTicket(ticket._id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">
                            {ticket.ticketNumber}
                          </span>
                          {ticket.hasUnreadMessages && (
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-gray-900 block max-w-[200px] truncate"
                          title={ticket.subject}
                        >
                          {ticket.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.OTHER
                          }`}
                        >
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            STATUS_COLORS[ticket.status] || STATUS_COLORS.CLOSED
                          }`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {ticket._count?.messages || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm font-medium">No tickets found</p>
            <p className="text-xs mt-1">
              Create a new ticket to get support from our team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
