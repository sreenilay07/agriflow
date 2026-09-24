import { apiClient } from "./apiClient";

export const analyticsApi = {
  getOverview: async (params) => {
    const query = new URLSearchParams();
    if (params?.period) query.append("period", params.period);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);

    const res = await apiClient.get(`/analytics/overview?${query.toString()}`);
    return res.data?.data;
  },

  getProcurementTrends: async (params) => {
    const query = new URLSearchParams();
    if (params?.period) query.append("period", params.period);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);

    const res = await apiClient.get(
      `/analytics/procurement-trends?${query.toString()}`,
    );
    return res.data?.data;
  },

  getQualityMetrics: async (params) => {
    const query = new URLSearchParams();
    if (params?.period) query.append("period", params.period);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);

    const res = await apiClient.get(
      `/analytics/quality-metrics?${query.toString()}`,
    );
    return res.data?.data;
  },

  getFinancialSummary: async (params) => {
    const query = new URLSearchParams();
    if (params?.period) query.append("period", params.period);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);

    const res = await apiClient.get(
      `/analytics/financial-summary?${query.toString()}`,
    );
    return res.data?.data;
  },
};
