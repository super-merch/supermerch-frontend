// main.jsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { AppContextProvider } from "./context/AppContext";
import CartInitializer from "./pages/cartInitializer.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      {/* delay rendering until persisted state is restored */}
      <PersistGate loading={null} persistor={persistor}>
        <CartInitializer>
          <AppContextProvider>
            <GoogleOAuthProvider
              clientId="918141329490-1hgf0gjluv6150suapo736b0tsln63u5.apps.googleusercontent.com"
              onScriptLoadSuccess={() => {
                if (window.google && window.google.accounts) {
                  window.google.accounts.id.disableAutoSelect();
                }
              }}
            >
              <App />
            </GoogleOAuthProvider>
          </AppContextProvider>
        </CartInitializer>
      </PersistGate>
    </Provider>
  </BrowserRouter>
);
