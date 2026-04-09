// frontend/src/pages/DashboardPage.tsx

export default function DashboardPage() {
  const totalPorCobrar = 12500.0
  const totalVencido = 3200.0
  const pagosDelDia = 850.0

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard de cobranza</h1>
        <p className="text-sm text-slate-500">
          Resumen general del estado de cobranza del día.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total por cobrar</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {formatCurrency(totalPorCobrar)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total vencido</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(totalVencido)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pagos del día</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(pagosDelDia)}
          </p>
        </div>
      </div>
    </div>
  )
}