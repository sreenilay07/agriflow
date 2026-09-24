import { apiClient } from "./apiClient";

export const reportApi = {
  getProcurementData: async (params) => {
    const res = await apiClient.get("/reports/procurement", { params });
    return res.data;
  },

  downloadExcel: async (params) => {
    const res = await apiClient.get("/reports/procurement/excel", {
      params,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Agriflow_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadCSV: async (params) => {
    const res = await apiClient.get("/reports/procurement/csv", {
      params,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Agriflow_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
