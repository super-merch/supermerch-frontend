import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
// import AppContextProvider from './context/AppContext.jsx';
import { AppContextProvider } from "./context/AppContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <AppContextProvider>
        <GoogleOAuthProvider
          clientId="918141329490-1hgf0gjluv6150suapo736b0tsln63u5.apps.googleusercontent.com"
          onScriptLoadSuccess={() => {
            // Disable auto-select on app load
            if (window.google && window.google.accounts) {
              window.google.accounts.id.disableAutoSelect();
            }
          }}
        >
          ;
          <App />
        </GoogleOAuthProvider>
      </AppContextProvider>
    </Provider>
  </BrowserRouter>
);
