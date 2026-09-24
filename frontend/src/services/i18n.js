import { translations } from "../locales/translations.js";

let currentLanguage =
  localStorage.getItem("Agriflow_lang") ||
  localStorage.getItem("agriflow_lang") ||
  "en";
const listeners = new Set();

export const getLanguage = () => currentLanguage;

export const setLanguage = (lang) => {
  currentLanguage = lang;
  localStorage.setItem("Agriflow_lang", lang);
  listeners.forEach((fn) => fn());
};

export const t = (key, params) => {
  let val =
    translations[currentLanguage]?.[key] || translations["en"]?.[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      val = val.replace(new RegExp(`{\\s*${k}\\s*}`, "g"), String(v));
    });
  }
  return val;
};

export const subscribeLanguage = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
