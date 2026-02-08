import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Invoice, InvoiceItem } from './invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { Business } from '../business/business.entity';
import { Client } from '../client/client.entity';
import { ClientService } from '../client/client.service';
import { InvoiceStatus } from '../../common/enums';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly clientService: ClientService
  ) {}

  async findByBusinessId(businessId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { businessId },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, businessId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, businessId },
      relations: ['client'],
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  private calculateTotals(
    items: InvoiceItemDto[],
    taxRate: number
  ): { subtotal: number; taxAmount: number; total: number; calculatedItems: InvoiceItem[] } {
    const calculatedItems = items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total, calculatedItems };
  }

  private async generateInvoiceNumber(businessId: string): Promise<string> {
    const count = await this.invoiceRepository.count({ where: { businessId } });
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(businessId: string, dto: CreateInvoiceDto): Promise<Invoice> {
    // Verify business exists
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Verify client exists and belongs to this business
    const client = await this.clientRepository.findOne({
      where: { id: dto.clientId, businessId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const taxRate = dto.taxRate || 0;
    const { subtotal, taxAmount, total, calculatedItems } = this.calculateTotals(
      dto.items as any,
      taxRate
    );

    const invoiceNumber = dto.invoiceNumber || (await this.generateInvoiceNumber(businessId));

    const invoice = this.invoiceRepository.create({
      businessId,
      clientId: dto.clientId,
      invoiceNumber,
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      items: calculatedItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      notes: dto.notes,
      status: dto.status || InvoiceStatus.DRAFT,
    });

    return this.invoiceRepository.save(invoice);
  }

  async update(id: string, businessId: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findById(id, businessId);

    if (dto.clientId) {
      const client = await this.clientRepository.findOne({
        where: { id: dto.clientId, businessId },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    if (dto.items) {
      const taxRate = dto.taxRate !== undefined ? dto.taxRate : invoice.taxRate;
      const { subtotal, taxAmount, total, calculatedItems } = this.calculateTotals(
        dto.items as any,
        Number(taxRate)
      );

      Object.assign(invoice, {
        ...dto,
        items: calculatedItems,
        subtotal,
        taxAmount,
        total,
      });
    } else {
      Object.assign(invoice, dto);
    }

    return this.invoiceRepository.save(invoice);
  }

  async markAsPaid(id: string, businessId: string, paidDate?: Date): Promise<Invoice> {
    const invoice = await this.findById(id, businessId);

    // Update client's total revenue
    await this.clientService.updateTotalRevenue(invoice.clientId, Number(invoice.total));

    invoice.status = InvoiceStatus.PAID;
    invoice.paidDate = paidDate || new Date();

    return this.invoiceRepository.save(invoice);
  }

  async markAsSent(id: string, businessId: string): Promise<Invoice> {
    const invoice = await this.findById(id, businessId);
    invoice.status = InvoiceStatus.SENT;
    return this.invoiceRepository.save(invoice);
  }

  async delete(id: string, businessId: string): Promise<void> {
    const invoice = await this.findById(id, businessId);
    await this.invoiceRepository.remove(invoice);
  }

  async getStats(businessId: string) {
    const invoices = await this.invoiceRepository.find({ where: { businessId } });

    const totalRevenue = invoices
      .filter((inv) => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const pendingAmount = invoices
      .filter((inv) => inv.status === InvoiceStatus.SENT)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const overdueInvoices = invoices.filter((inv) => {
      if (inv.status === InvoiceStatus.PAID) return false;
      return new Date(inv.dueDate) < new Date();
    });

    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    return {
      totalInvoices: invoices.length,
      totalRevenue,
      pendingAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount,
      paidCount: invoices.filter((inv) => inv.status === InvoiceStatus.PAID).length,
      draftCount: invoices.filter((inv) => inv.status === InvoiceStatus.DRAFT).length,
      sentCount: invoices.filter((inv) => inv.status === InvoiceStatus.SENT).length,
    };
  }

  async getRevenueByPeriod(businessId: string, startDate: Date, endDate: Date) {
    const invoices = await this.invoiceRepository.find({
      where: {
        businessId,
        status: InvoiceStatus.PAID,
        paidDate: Between(startDate, endDate),
      },
    });

    return invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  }
}

interface InvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}
