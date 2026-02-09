// main.jsx
import { createRoot } from "react-dom/client";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import BlogProvider from "./context/BlogContext";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { store, persistor } from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { AppContextProvider } from "./context/AppContext";
import { ProductsContextProvider } from "./context/ProductsContext.jsx";
import CartInitializer from "./pages/cartInitializer.jsx";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      {/* delay rendering until persisted state is restored */}
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BlogProvider>
            <AuthContextProvider>
              <CartInitializer>
                <AppContextProvider>
                  <ProductsContextProvider>
                    <GoogleOAuthProvider
                      clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID}
                      onScriptLoadSuccess={() => {
                        if (window.google?.accounts) {
                          window.google.accounts.id.disableAutoSelect();
                        }
                      }}
                    >
                      <App />
                    </GoogleOAuthProvider>
                  </ProductsContextProvider>
                </AppContextProvider>
              </CartInitializer>
            </AuthContextProvider>
          </BlogProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </BrowserRouter>
);
