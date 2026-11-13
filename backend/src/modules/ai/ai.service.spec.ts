import { ServiceUnavailableException } from '@nestjs/common';
import { AiService } from './ai.service';

describe('AiService', () => {
  it('returns 503 "AI disabled" when GEMINI_API_KEY is missing', async () => {
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const invoices = { findByBusinessId: jest.fn() };
    const service = new AiService(config as any, invoices as any);

    await expect(service.getFinancialInsights('biz')).rejects.toThrow(ServiceUnavailableException);
    expect(invoices.findByBusinessId).not.toHaveBeenCalled();
  });
});
