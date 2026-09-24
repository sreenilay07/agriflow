import { ENV } from "../../config/env";
import { useAuthStore } from "../../store/useAuthStore";

export const exportApi = {
  downloadCsv: (resource) => {
    const token = useAuthStore.getState().accessToken;
    const url = `${ENV.API_BASE_URL}/export/${resource}`;
    // Create an authenticated fetch to trigger download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Export download failed");
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${resource}_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => {
        console.error("Download export failed:", err);
      });
  },
};
