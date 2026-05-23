// Invoice form placeholder — full implementation in Week 2
export default function InvoiceFormPage({
  params,
}: {
  params: { templateId: string }
}) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">New Invoice</h1>
      <p className="text-slate-500">Template: <span className="font-medium text-blue-600">{params.templateId}</span></p>
      <p className="text-slate-400 text-sm mt-4">Invoice form — coming in Week 2 build.</p>
    </div>
  )
}
