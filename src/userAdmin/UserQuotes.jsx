import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

export default function UserQuotes() {
  const { token, userData } = useContext(AuthContext);
  const { backendUrl } = useContext(AppContext);

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    if (!userData?._id || !token) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/checkout/user-quotes/${userData._id}`,
        {
          headers: { token },
        },
      );

      if (data.success) {
        setQuotes(Array.isArray(data.quotes) ? data.quotes : []);
      } else {
        setQuotes([]);
      }
    } catch (error) {
      setQuotes([]);
      toast.error(error?.response?.data?.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, userData?._id]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <div className="w-full px-3 pt-0 pb-10 lg:px-8 md:px-6 lg:pt-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Quotes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Express Quote requests submitted from product pages.
            </p>
          </div>
          {!loading && quotes.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
              {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="ml-3 text-sm font-medium text-gray-600">
              Loading quotes...
            </p>
          </div>
        ) : quotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((quote) => (
                    <tr key={quote._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {quote.createdAt
                          ? new Date(quote.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {quote.product || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {quote.quantity ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        ${Number(quote.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                        ${Number(quote.totalPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {quote.delivery || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {quote.file && quote.file !== "None" ? (
                          <a
                            href={quote.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary/80"
                          >
                            View file
                          </a>
                        ) : (
                          <span className="text-gray-400">No file</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No quote requests found yet. Use Get Express Quote on a product page to create one.
          </div>
        )}
      </div>
    </div>
  );
}
