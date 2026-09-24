import { apiClient } from "./apiClient";

export const chatbotApi = {
  getFaqs: async (lang) => {
    const res = await apiClient.get("/chatbot/faqs", { params: { lang } });
    return res.data;
  },

  sendMessage: async (message, language) => {
    const res = await apiClient.post("/chatbot/message", { message, language });
    return res.data;
  },
};
