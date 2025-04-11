import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import ChatbotToggler from "../../components/ChatbotToggler";
import MainLayout from "../../components/MainLayout";
import HelpPage from "../../pages/HelpPage";
import NotFound from "../../pages/NotFound";

export const SSORouter = () => {
  return (
    <BrowserRouter>
      <ChatbotToggler /> {/* Handles chatbot visibility */}
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} /> {/* Home Page */}
          <Route path="referPrompt" element={<HelpPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/helpPage" element={<HelpPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default SSORouter;
