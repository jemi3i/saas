import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { InvoiceService } from '../invoice/invoice.service';

const GEMINI_MODEL = 'gemini-3-flash-preview';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly invoiceService: InvoiceService
  ) {}

  async getFinancialInsights(businessId: string): Promise<{ insights: string }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('AI disabled: GEMINI_API_KEY is not configured');
    }

    const invoices = await this.invoiceService.findByBusinessId(businessId);
    const invoiceSummary = invoices.map((i) => ({
      client: i.client?.name,
      amount: Number(i.total),
      status: i.status,
      due: i.dueDate,
    }));

    const prompt = `Analyze the following invoice data and provide a concise 3-point bulleted summary of financial health, identifying risks (like overdue accounts) and suggesting next steps.
Data: ${JSON.stringify(invoiceSummary)}
Keep the response professional and actionable.`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
      return { insights: response.text ?? '' };
    } catch (error) {
      this.logger.error('Gemini request failed', error as Error);
      throw new ServiceUnavailableException('AI insights are temporarily unavailable');
    }
  }
}
