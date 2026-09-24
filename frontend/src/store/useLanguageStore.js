import { create } from "zustand";

export const useLanguageStore = create((set) => {
  const savedLang = localStorage.getItem("Agriflow_lang") || "en";

  return {
    language: savedLang,
    currentLang: savedLang,
    isLanguageModalOpen: false,
    setLanguage: (lang) => {
      localStorage.setItem("Agriflow_lang", lang);
      set({ language: lang, currentLang: lang });
    },
    changeLanguage: (lang) => {
      localStorage.setItem("Agriflow_lang", lang);
      set({ language: lang, currentLang: lang, isLanguageModalOpen: false });
    },
    openLanguageModal: () => set({ isLanguageModalOpen: true }),
    closeLanguageModal: () => set({ isLanguageModalOpen: false }),
  };
});
