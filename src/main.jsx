import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import './index.css'
import App from './App.jsx'
// import AppContextProvider from './context/AppContext.jsx';
import { AppContextProvider } from './context/AppContext';


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
      <Provider store={store}>
    <AppContextProvider>
        <App />
    </AppContextProvider>
      </Provider>
  </BrowserRouter>
);
