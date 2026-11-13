import api from './api';

/**
 * Requests AI financial insights for a business.
 * The Gemini call happens server-side (POST /api/v1/ai/insights/business/:businessId);
 * no API key is ever shipped to the browser.
 */
export const getFinancialInsights = async (businessId: string): Promise<string> => {
  try {
    const response = await api.post<{ insights: string }>(`/ai/insights/business/${businessId}`);
    return response.data.insights;
  } catch (error: any) {
    if (error.response?.status === 503) {
      return 'AI insights are disabled on this server.';
    }
    console.error('AI insights error:', error);
    return 'Unable to generate AI insights at this time.';
  }
};
