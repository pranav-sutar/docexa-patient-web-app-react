// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Mainpage from "./components/Mainpage.tsx";
import { LoaderProvider } from "./context/LoaderContext.tsx";
import Queue from "./components/Queue.tsx";
import { CacheProvider } from "./context/CacheContext.tsx";
import AddVitals from "./components/AddVitals.tsx";

createRoot(document.getElementById("root")!).render(
  <CacheProvider>
    <LoaderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/mainpage/:id" element={<Mainpage />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/add-vitals" element={<AddVitals />} />
        </Routes>
      </BrowserRouter>
    </LoaderProvider>
  </CacheProvider>,
);
