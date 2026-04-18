import React, { useEffect, useMemo, useState } from 'react';
import DashboardPanel from '../dashboard/DashboardPanel';
import {
  getActiveCredits,
  getUpcomingPayments,
} from '../../services/creditService';
import type {
  Credit,
  PaymentSchedule,
} from '../../services/creditService';
import { getPayments } from '../../services/paymentService';
import type { Payment } from '../../services/paymentService';
import { getCustomers } from '../../services/clientService';
import type { Customer } from '../../services/clientService';

import CreditosSummaryCards from './creditos/ui/CreditosSummaryCards';
import CreditosList from './creditos/ui/CreditosList';
import CreditoDetailPanel from './creditos/ui/CreditoDetailPanel';
import CreditoSchedulePanel from './creditos/ui/CreditoSchedulePanel';
import type { CreditItem } from './creditos/types';
import { Alert, SectionHeader } from '../ui';

const CreditosModule: React.FC = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentSchedule[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCreditId, setSelectedCreditId] = useState<number | null>(null);

  const fetchCreditsData = async () => {
    try {
      setLoading(true);

      const [creditsData, upcomingPaymentsData, customersData] =
        await Promise.all([
          getActiveCredits(),
          getUpcomingPayments(),
          getCustomers(),
        ]);

      setCredits(creditsData);
      setUpcomingPayments(upcomingPaymentsData);
      setCustomers(customersData);
      setError(null);
    } catch {
      setError('No se pudo cargar la información de créditos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsByCredit = async (creditId: number) => {
    try {
      const data = await getPayments(creditId);
      setPayments(data);
    } catch {
      setPayments([]);
    }
  };

  useEffect(() => {
    fetchCreditsData();
  }, []);

  useEffect(() => {
    if (selectedCreditId) {
      fetchPaymentsByCredit(selectedCreditId);
    } else {
      setPayments([]);
    }
  }, [selectedCreditId]);

  const getCustomerName = (customerId: number): string => {
    const customer = customers.find((item) => item.id === customerId);

    if (!customer) {
      return `Cliente #${customerId}`;
    }

    return `${customer.first_name} ${customer.last_name}`.trim();
  };

  const getNextPaymentForCredit = (
    creditId: number
  ): PaymentSchedule | undefined => {
    return upcomingPayments.find((payment) => payment.credit_id === creditId);
  };

  const getPaymentStatusLabel = (dueDate: string) => {
    const today = new Date();
    const paymentDate = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    paymentDate.setHours(0, 0, 0, 0);

    const diffInMs = paymentDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
      return 'Vencido';
    }

    if (diffInDays === 0) {
      return 'Vence hoy';
    }

    if (diffInDays <= 3) {
      return 'Próximo';
    }

    return 'Al corriente';
  };

  const mappedCredits: CreditItem[] = useMemo(() => {
    return credits.map((credit) => {
      const nextPayment = getNextPaymentForCredit(credit.id);

      const totalInstallments = Math.max(
        0,
        ...upcomingPayments
          .filter((payment) => payment.credit_id === credit.id)
          .map((payment) => payment.installment_number)
      );

      const pendingInstallments = upcomingPayments.filter(
        (payment) => payment.credit_id === credit.id
      ).length;

      const installmentsPaid = Math.max(
        Number(totalInstallments) - pendingInstallments,
        0
      );

      let visualStatus: CreditItem['status'] = 'active';

      if (Number(credit.balance) <= 0) {
        visualStatus = 'paid';
      } else if (nextPayment && getPaymentStatusLabel(nextPayment.due_date) === 'Vencido') {
        visualStatus = 'overdue';
      } else {
        visualStatus = 'active';
      }

      return {
        id: credit.id,
        customerName: getCustomerName(credit.customer_id),
        totalAmount: Number(credit.total_amount),
        downPayment: Number(credit.down_payment),
        financedAmount: Number(credit.financed_amount),
        balance: Number(credit.balance),
        nextPaymentDate: nextPayment ? nextPayment.due_date : 'Sin fecha',
        status: visualStatus,
        installmentsPaid,
        installmentsTotal: totalInstallments,
      };
    });
  }, [credits, upcomingPayments, customers]);

  const selectedCredit = useMemo(() => {
    if (selectedCreditId === null) {
      return null;
    }

    return mappedCredits.find((credit) => credit.id === selectedCreditId) ?? null;
  }, [mappedCredits, selectedCreditId]);

  /**
   * Cuotas pendientes reales del crédito seleccionado.
   * Se ordenan por número de cuota para mostrarlas como cronograma.
   */
  const selectedCreditSchedules = useMemo(() => {
    if (selectedCreditId === null) {
      return [];
    }

    return upcomingPayments
      .filter((payment) => payment.credit_id === selectedCreditId)
      .sort((a, b) => a.installment_number - b.installment_number);
  }, [upcomingPayments, selectedCreditId]);

  const summary = useMemo(() => {
    const active = mappedCredits.filter((credit) => credit.status === 'active').length;
    const overdue = mappedCredits.filter((credit) => credit.status === 'overdue').length;
    const paid = mappedCredits.filter((credit) => credit.status === 'paid').length;
    const totalBalance = mappedCredits.reduce((acc, credit) => acc + credit.balance, 0);

    return {
      active,
      overdue,
      paid,
      totalBalance,
    };
  }, [mappedCredits]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <SectionHeader
        title="Créditos"
        subtitle="Estado actual de créditos activos, vencidos, pagos y cronogramas."
      />

      <DashboardPanel title="">
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          {selectedCredit
            ? `Cliente seleccionado: ${selectedCredit.customerName}`
            : 'Selecciona un cliente para revisar el estado de su crédito.'}
        </p>

        <CreditosSummaryCards
          active={summary.active}
          overdue={summary.overdue}
          paid={summary.paid}
          totalBalance={summary.totalBalance}
        />
      </DashboardPanel>

      {loading && (
        <Alert tone="info">Cargando créditos...</Alert>
      )}

      {error && (
        <Alert tone="danger">{error}</Alert>
      )}

      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '0.75rem',
            alignItems: 'stretch',
          }}
        >
          <CreditosList
            credits={mappedCredits}
            selectedCreditId={selectedCreditId}
            onSelectCredit={setSelectedCreditId}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <CreditoDetailPanel selectedCredit={selectedCredit} />
            <CreditoSchedulePanel
              selectedCredit={selectedCredit}
              payments={payments}
              schedules={selectedCreditSchedules}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditosModule;
