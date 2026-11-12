'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Printer,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import ErpCrudView, { API_BASE, FieldDef, RowAction } from '@/components/shared/ErpCrudView';

export const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
];

export const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '1st Year',
  '2nd Year',
  '3rd Year',
];

export const BATCH3_VIEW_IDS = [
  // 1. Inventory
  'inv-category',
  'inv-sub-category',
  'inv-add-item',
  'inv-item-set',
  'inv-store',
  'inv-supplier',
  'inv-add-stock',
  'inv-sell-item',
  'inv-issue-item',
  'inv-workorder',
  'inv-workorder-payment',
  'inv-sold-payments',
  'inv-sales-report',
  'inv-stock-reminder',
  'inv-return-item',
  'inv-sales-return',
  'inv-profit-loss',
  // 2. Library
  'lib-books',
  'lib-issue-return',
  'lib-add-student',
  'lib-add-staff',
  'lib-report',
  // 3. Transport
  'trans-route-vehicle',
  'trans-bus-stop',
  'trans-assign',
  'trans-change-stop',
  'trans-vehicle',
  'trans-vehicle-doc',
  'trans-report',
  // 4. Hostel
  'hostel-list',
  'hostel-room-type',
  'hostel-rooms',
  'hostel-assign',
  'hostel-change',
  'hostel-students',
] as const;

export type Batch3ViewId = (typeof BATCH3_VIEW_IDS)[number];

function StatusBadge({ value }: { value?: string }) {
  const v = String(value || 'Pending');
  const lower = v.toLowerCase();
  let cls = 'bg-amber-50 text-amber-700 border-amber-200';
  if (['active', 'paid', 'returned', 'completed', 'in stock', 'ok'].includes(lower)) {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['issued', 'in progress', 'partial', 'maintenance'].includes(lower)) {
    cls = 'bg-purple-50 text-[#80229a] border-purple-200';
  } else if (['inactive', 'unpaid', 'overdue', 'low stock', 'out of stock', 'vacated'].includes(lower)) {
    cls = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {v}
    </span>
  );
}

function createPatchAction(
  label: string,
  endpointPrefix: string,
  payloadOrBuilder: Record<string, any> | ((row: any) => Record<string, any>),
  successMessage: string,
  className?: string,
): RowAction {
  return {
    label,
    className,
    onClick: async (row, reload, notify) => {
      try {
        const body = typeof payloadOrBuilder === 'function' ? payloadOrBuilder(row) : payloadOrBuilder;
        const res = await fetch(`${API_BASE}/${endpointPrefix}/${row._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to ${label.toLowerCase()}`);
        }
        notify(successMessage);
        reload();
      } catch (e: any) {
        notify(e?.message || `Action "${label}" failed`, false);
      }
    },
  };
}

const markIssueReturnedAction = createPatchAction(
  'Mark Returned',
  'inventory/issues',
  () => ({ status: 'Returned', returnDate: new Date().toISOString().slice(0, 10) }),
  'Item marked as Returned',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

const markWorkorderPaidAction = createPatchAction(
  'Mark Paid',
  'inventory/workorders',
  { paymentStatus: 'Paid' },
  'Workorder marked as Paid',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

const markSalePaidAction = createPatchAction(
  'Mark Paid',
  'inventory/sales',
  { paymentStatus: 'Paid' },
  'Sale payment marked as Paid',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

const returnBookAction = createPatchAction(
  'Return Book',
  'library/issues',
  () => ({ status: 'Returned', returnDate: new Date().toISOString().slice(0, 10) }),
  'Book marked as Returned',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

const courseField = (required = true): FieldDef => ({
  name: 'course',
  label: 'Course',
  type: 'select',
  options: COURSES,
  required,
});

const semesterField = (required = false): FieldDef => ({
  name: 'semester',
  label: 'Semester',
  type: 'select',
  options: SEMESTERS,
  required,
});

// ============================================================================
// Custom Interactive View: Inventory Profit & Loss (`inv-profit-loss`)
// ============================================================================
interface ProfitLossSummary {
  totalPurchase: number;
  totalSales: number;
  totalReturns: number;
  estimatedProfitLoss: number;
  stockCount?: number;
  salesCount?: number;
  returnsCount?: number;
}

function formatCurrency(val: number | undefined | null): string {
  const num = Number(val || 0);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function InventoryProfitLossView() {
  const [data, setData] = useState<ProfitLossSummary>({
    totalPurchase: 0,
    totalSales: 0,
    totalReturns: 0,
    estimatedProfitLoss: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/inventory/profit-loss`);
      if (!res.ok) throw new Error('Failed to load profit & loss summary');
      const json = await res.json();
      const totalPurchase = Number(json.totalPurchase ?? json.purchaseTotal ?? 0);
      const totalSales = Number(json.totalSales ?? json.salesTotal ?? 0);
      const totalReturns = Number(json.totalReturns ?? json.returnsTotal ?? 0);
      const estimatedProfitLoss = Number(
        json.estimatedProfitLoss ?? json.profitLoss ?? totalSales - totalPurchase - totalReturns,
      );
      setData({
        totalPurchase,
        totalSales,
        totalReturns,
        estimatedProfitLoss,
        stockCount: json.stockCount,
        salesCount: json.salesCount,
        returnsCount: json.returnsCount,
      });
    } catch (e: any) {
      setError(e?.message || 'Error loading inventory profit & loss');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const isProfit = data.estimatedProfitLoss >= 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#80229a] uppercase tracking-wider">Inventory / Profit & Loss</p>
          <h2 className="text-xl font-bold text-slate-800">Inventory Profit & Loss Report</h2>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={loadSummary}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6a1b81]"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Purchase</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">{formatCurrency(data.totalPurchase)}</p>
          {data.stockCount !== undefined && (
            <p className="mt-1 text-xs text-slate-400">{data.stockCount} stock entries</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sales</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">{formatCurrency(data.totalSales)}</p>
          {data.salesCount !== undefined && (
            <p className="mt-1 text-xs text-slate-400">{data.salesCount} sales transactions</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Returns</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <RotateCcw className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-800">{formatCurrency(data.totalReturns)}</p>
          {data.returnsCount !== undefined && (
            <p className="mt-1 text-xs text-slate-400">{data.returnsCount} return entries</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Estimated Profit & Loss
            </span>
            <span
              className={`p-2 rounded-xl ${
                isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </span>
          </div>
          <p className={`mt-3 text-2xl font-bold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(data.estimatedProfitLoss)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{isProfit ? 'Net Surplus' : 'Net Deficit'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Financial Summary Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-700">Total Sales Revenue</td>
                <td className="py-3 px-3 text-slate-500">Gross revenue from sold inventory items</td>
                <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                  {formatCurrency(data.totalSales)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-700">Total Stock Purchase</td>
                <td className="py-3 px-3 text-slate-500">Total cost of stock procured from suppliers</td>
                <td className="py-3 px-3 text-right font-semibold text-slate-700">
                  {formatCurrency(data.totalPurchase)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-700">Total Returns / Refunds</td>
                <td className="py-3 px-3 text-slate-500">Value of item and sales returns</td>
                <td className="py-3 px-3 text-right font-semibold text-amber-700">
                  {formatCurrency(data.totalReturns)}
                </td>
              </tr>
              <tr className="bg-slate-50/80">
                <td className="py-3 px-3 font-bold text-slate-800">Estimated Profit / Loss</td>
                <td className="py-3 px-3 text-slate-600">Total Sales minus Total Purchase and Returns</td>
                <td
                  className={`py-3 px-3 text-right font-bold ${
                    isProfit ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatCurrency(data.estimatedProfitLoss)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Batch 3 View Renderer
// ============================================================================
export function Batch3ViewRenderer({ activeView }: { activeView: string }) {
  switch (activeView) {
    // ------------------------------------------------------------------------
    // 1. INVENTORY
    // ------------------------------------------------------------------------
    case 'inv-category':
      return (
        <ErpCrudView
          key={activeView}
          title="Item Category"
          breadcrumb="Inventory / Item Category"
          endpoint="inventory/categories"
          fields={[
            { name: 'name', label: 'Category Name', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Category Name' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'inv-sub-category':
      return (
        <ErpCrudView
          key={activeView}
          title="Item Sub-Category"
          breadcrumb="Inventory / Item Sub-Category"
          endpoint="inventory/sub-categories"
          fields={[
            { name: 'categoryName', label: 'Parent Category', required: true },
            { name: 'name', label: 'Sub-Category Name', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'categoryName', label: 'Category' },
            { key: 'name', label: 'Sub-Category' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'inv-add-item':
      return (
        <ErpCrudView
          key={activeView}
          title="Items"
          breadcrumb="Inventory / Add Item"
          endpoint="inventory/items"
          layout="modal"
          fields={[
            { name: 'name', label: 'Item Name', required: true },
            { name: 'itemCode', label: 'Item Code' },
            { name: 'category', label: 'Category', required: true },
            { name: 'subCategory', label: 'Sub-Category' },
            { name: 'unit', label: 'Unit', placeholder: 'e.g. Pcs, Box, Kg' },
            { name: 'purchasePrice', label: 'Purchase Price', type: 'number' },
            { name: 'salePrice', label: 'Sale Price', type: 'number' },
            { name: 'minStockLevel', label: 'Min Stock Level', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'itemCode', label: 'Code' },
            { key: 'name', label: 'Item Name' },
            { key: 'category', label: 'Category' },
            { key: 'unit', label: 'Unit' },
            { key: 'purchasePrice', label: 'Purchase Price' },
            { key: 'salePrice', label: 'Sale Price' },
            { key: 'minStockLevel', label: 'Min Stock' },
          ]}
        />
      );

    case 'inv-item-set':
      return (
        <ErpCrudView
          key={activeView}
          title="Item Sets"
          breadcrumb="Inventory / Item Set"
          endpoint="inventory/item-sets"
          fields={[
            { name: 'setName', label: 'Set Name', required: true },
            { name: 'itemsSummary', label: 'Items Included', type: 'textarea', required: true },
            { name: 'totalPrice', label: 'Total Price', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'setName', label: 'Set Name' },
            { key: 'itemsSummary', label: 'Items Included' },
            { key: 'totalPrice', label: 'Total Price' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'inv-store':
      return (
        <ErpCrudView
          key={activeView}
          title="Item Stores"
          breadcrumb="Inventory / Item Store"
          endpoint="inventory/stores"
          fields={[
            { name: 'name', label: 'Store Name', required: true },
            { name: 'storeCode', label: 'Store Code' },
            { name: 'inCharge', label: 'In-Charge' },
            { name: 'phone', label: 'Phone' },
            { name: 'address', label: 'Address', type: 'textarea' },
          ]}
          columns={[
            { key: 'storeCode', label: 'Code' },
            { key: 'name', label: 'Store Name' },
            { key: 'inCharge', label: 'In-Charge' },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
          ]}
        />
      );

    case 'inv-supplier':
      return (
        <ErpCrudView
          key={activeView}
          title="Item Suppliers"
          breadcrumb="Inventory / Item Supplier"
          endpoint="inventory/suppliers"
          fields={[
            { name: 'name', label: 'Supplier Name', required: true },
            { name: 'contactPerson', label: 'Contact Person' },
            { name: 'phone', label: 'Phone', required: true },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'gstNumber', label: 'GST / Tax ID' },
            { name: 'address', label: 'Address', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Supplier Name' },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'gstNumber', label: 'GST / Tax ID' },
          ]}
        />
      );

    case 'inv-add-stock':
      return (
        <ErpCrudView
          key={activeView}
          title="Add Item Stock"
          breadcrumb="Inventory / Add Stock"
          endpoint="inventory/stocks"
          layout="modal"
          fields={[
            { name: 'itemName', label: 'Item Name', required: true },
            { name: 'category', label: 'Category' },
            { name: 'store', label: 'Store' },
            { name: 'supplier', label: 'Supplier' },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'purchasePrice', label: 'Unit Purchase Price', type: 'number', required: true },
            { name: 'totalCost', label: 'Total Cost', type: 'number' },
            { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
            { name: 'invoiceNo', label: 'Invoice No' },
            { name: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          columns={[
            { key: 'itemName', label: 'Item' },
            { key: 'store', label: 'Store' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'quantity', label: 'Qty' },
            { key: 'purchasePrice', label: 'Unit Cost' },
            { key: 'totalCost', label: 'Total Cost' },
            { key: 'purchaseDate', label: 'Date' },
            { key: 'invoiceNo', label: 'Invoice No' },
          ]}
        />
      );

    case 'inv-sell-item':
      return (
        <ErpCrudView
          key={activeView}
          title="Sell Item"
          breadcrumb="Inventory / Sell Item"
          endpoint="inventory/sales"
          layout="modal"
          fields={[
            { name: 'itemName', label: 'Item Name', required: true },
            {
              name: 'buyerType',
              label: 'Buyer Type',
              type: 'select',
              options: ['Student', 'Staff', 'External'],
              defaultValue: 'Student',
            },
            { name: 'buyerName', label: 'Buyer Name', required: true },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'unitPrice', label: 'Unit Price', type: 'number', required: true },
            { name: 'totalAmount', label: 'Total Amount', type: 'number', required: true },
            { name: 'saleDate', label: 'Sale Date', type: 'date', required: true },
            {
              name: 'paymentStatus',
              label: 'Payment Status',
              type: 'select',
              options: ['Paid', 'Unpaid', 'Partial'],
              defaultValue: 'Paid',
            },
            {
              name: 'paymentMode',
              label: 'Payment Mode',
              type: 'select',
              options: ['Cash', 'UPI', 'Card', 'Bank Transfer'],
              defaultValue: 'Cash',
            },
            { name: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          columns={[
            { key: 'itemName', label: 'Item' },
            { key: 'buyerName', label: 'Buyer' },
            { key: 'buyerType', label: 'Type' },
            { key: 'quantity', label: 'Qty' },
            { key: 'totalAmount', label: 'Total' },
            { key: 'saleDate', label: 'Sale Date' },
            {
              key: 'paymentStatus',
              label: 'Payment',
              render: (row) => <StatusBadge value={row.paymentStatus} />,
            },
          ]}
        />
      );

    case 'inv-issue-item':
      return (
        <ErpCrudView
          key={activeView}
          title="Issue Item"
          breadcrumb="Inventory / Issue Item"
          endpoint="inventory/issues"
          layout="modal"
          rowActions={[markIssueReturnedAction]}
          fields={[
            { name: 'itemName', label: 'Item Name', required: true },
            {
              name: 'issuedToType',
              label: 'Issued To',
              type: 'select',
              options: ['Staff', 'Student', 'Department'],
              defaultValue: 'Staff',
            },
            { name: 'issuedToName', label: 'Recipient Name', required: true },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'issueDate', label: 'Issue Date', type: 'date', required: true },
            { name: 'expectedReturnDate', label: 'Expected Return Date', type: 'date' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Issued', 'Returned'],
              defaultValue: 'Issued',
            },
            { name: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          columns={[
            { key: 'itemName', label: 'Item' },
            { key: 'issuedToType', label: 'Issued To' },
            { key: 'issuedToName', label: 'Recipient' },
            { key: 'quantity', label: 'Qty' },
            { key: 'issueDate', label: 'Issue Date' },
            { key: 'expectedReturnDate', label: 'Expected Return' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'inv-workorder':
      return (
        <ErpCrudView
          key={activeView}
          title="Workorders"
          breadcrumb="Inventory / Workorder"
          endpoint="inventory/workorders"
          layout="modal"
          fields={[
            { name: 'workorderNo', label: 'Workorder No', required: true },
            { name: 'vendorName', label: 'Vendor / Supplier', required: true },
            { name: 'title', label: 'Work Description', required: true },
            { name: 'totalAmount', label: 'Total Amount', type: 'number', required: true },
            { name: 'orderDate', label: 'Order Date', type: 'date', required: true },
            { name: 'dueDate', label: 'Due Date', type: 'date' },
            {
              name: 'paymentStatus',
              label: 'Payment Status',
              type: 'select',
              options: ['Unpaid', 'Paid', 'Partial'],
              defaultValue: 'Unpaid',
            },
            {
              name: 'status',
              label: 'Order Status',
              type: 'select',
              options: ['Pending', 'In Progress', 'Completed'],
              defaultValue: 'Pending',
            },
            { name: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          columns={[
            { key: 'workorderNo', label: 'Workorder No' },
            { key: 'vendorName', label: 'Vendor' },
            { key: 'title', label: 'Description' },
            { key: 'totalAmount', label: 'Amount' },
            { key: 'orderDate', label: 'Order Date' },
            {
              key: 'paymentStatus',
              label: 'Payment',
              render: (row) => <StatusBadge value={row.paymentStatus} />,
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'inv-workorder-payment':
      return (
        <ErpCrudView
          key={activeView}
          title="Workorder Payments"
          breadcrumb="Inventory / Workorder Payment"
          endpoint="inventory/workorders"
          layout="report"
          hideCreate
          hideEdit
          rowActions={[markWorkorderPaidAction]}
          filterFields={[
            {
              name: 'paymentStatus',
              label: 'Payment Status',
              type: 'select',
              options: ['Unpaid', 'Paid', 'Partial'],
            },
            { name: 'vendorName', label: 'Vendor' },
          ]}
          fields={[]}
          columns={[
            { key: 'workorderNo', label: 'Workorder No' },
            { key: 'vendorName', label: 'Vendor' },
            { key: 'title', label: 'Description' },
            { key: 'totalAmount', label: 'Amount' },
            { key: 'orderDate', label: 'Order Date' },
            { key: 'dueDate', label: 'Due Date' },
            {
              key: 'paymentStatus',
              label: 'Payment Status',
              render: (row) => <StatusBadge value={row.paymentStatus} />,
            },
          ]}
        />
      );

    case 'inv-sold-payments':
      return (
        <ErpCrudView
          key={activeView}
          title="Sold Item Payments"
          breadcrumb="Inventory / Sold Item Payments"
          endpoint="inventory/sales"
          layout="report"
          hideCreate
          hideEdit
          rowActions={[markSalePaidAction]}
          filterFields={[
            {
              name: 'paymentStatus',
              label: 'Payment Status',
              type: 'select',
              options: ['Paid', 'Unpaid', 'Partial'],
            },
            {
              name: 'buyerType',
              label: 'Buyer Type',
              type: 'select',
              options: ['Student', 'Staff', 'External'],
            },
          ]}
          fields={[]}
          columns={[
            { key: 'itemName', label: 'Item' },
            { key: 'buyerName', label: 'Buyer' },
            { key: 'buyerType', label: 'Buyer Type' },
            { key: 'quantity', label: 'Qty' },
            { key: 'totalAmount', label: 'Total Amount' },
            { key: 'saleDate', label: 'Sale Date' },
            { key: 'paymentMode', label: 'Mode' },
            {
              key: 'paymentStatus',
              label: 'Payment Status',
              render: (row) => <StatusBadge value={row.paymentStatus} />,
            },
          ]}
        />
      );

    case 'inv-sales-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Inventory Sales Report"
          breadcrumb="Inventory / Sales Report"
          endpoint="inventory/sales"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            {
              name: 'buyerType',
              label: 'Buyer Type',
              type: 'select',
              options: ['Student', 'Staff', 'External'],
            },
            {
              name: 'paymentStatus',
              label: 'Payment Status',
              type: 'select',
              options: ['Paid', 'Unpaid', 'Partial'],
            },
          ]}
          fields={[]}
          columns={[
            { key: 'itemName', label: 'Item' },
            { key: 'buyerName', label: 'Buyer' },
            { key: 'buyerType', label: 'Buyer Type' },
            { key: 'quantity', label: 'Qty' },
            { key: 'unitPrice', label: 'Unit Price' },
            { key: 'totalAmount', label: 'Total Amount' },
            { key: 'saleDate', label: 'Sale Date' },
            { key: 'paymentMode', label: 'Mode' },
            {
              key: 'paymentStatus',
              label: 'Payment Status',
              render: (row) => <StatusBadge value={row.paymentStatus} />,
            },
          ]}
        />
      );

    case 'inv-stock-reminder':
      return (
        <ErpCrudView
          key={activeView}
          title="Stock Reminder"
          breadcrumb="Inventory / Stock Reminder"
          endpoint="inventory/stock-reminders"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          fields={[]}
          columns={[
            { key: 'itemCode', label: 'Item Code' },
            { key: 'name', label: 'Item Name' },
            { key: 'category', label: 'Category' },
            { key: 'currentStock', label: 'Current Stock' },
            { key: 'minStockLevel', label: 'Min Stock Level' },
            {
              key: 'status',
              label: 'Alert Status',
              render: (row) => <StatusBadge value={row.status || 'Low Stock'} />,
            },
          ]}
        />
      );

    case 'inv-return-item':
      return (
        <ErpCrudView
          key={activeView}
          title="Return Item"
          breadcrumb="Inventory / Return Item"
          endpoint="inventory/returns"
          fixedFilters={{ returnType: 'Item Return' }}
          transformPayload={(data) => ({ ...data, returnType: 'Item Return' })}
          fields={[
            { name: 'itemName', label: 'Item Name', required: true },
            { name: 'partyName', label: 'Returned By / To', required: true },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'amount', label: 'Amount', type: 'number' },
            { name: 'returnDate', label: 'Return Date', type: 'date', required: true },
            { name: 'reason', label: 'Reason', type: 'textarea' },
          ]}
          columns={[
            { key: 'itemName', label: 'Item' },
            { key: 'partyName', label: 'Party' },
            { key: 'quantity', label: 'Qty' },
            { key: 'amount', label: 'Amount' },
            { key: 'returnDate', label: 'Return Date' },
            { key: 'reason', label: 'Reason' },
          ]}
        />
      );

    case 'inv-sales-return':
      return (
        <ErpCrudView
          key={activeView}
          title="Sales Return"
          breadcrumb="Inventory / Sales Return"
          endpoint="inventory/returns"
          fixedFilters={{ returnType: 'Sales Return' }}
          transformPayload={(data) => ({ ...data, returnType: 'Sales Return' })}
          fields={[
            { name: 'itemName', label: 'Item Name', required: true },
            { name: 'partyName', label: 'Buyer Name', required: true },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'amount', label: 'Refund Amount', type: 'number', required: true },
            { name: 'returnDate', label: 'Return Date', type: 'date', required: true },
            { name: 'reason', label: 'Reason', type: 'textarea' },
          ]}
          columns={[
            { key: 'itemName', label: 'Item' },
            { key: 'partyName', label: 'Buyer' },
            { key: 'quantity', label: 'Qty' },
            { key: 'amount', label: 'Refund Amount' },
            { key: 'returnDate', label: 'Return Date' },
            { key: 'reason', label: 'Reason' },
          ]}
        />
      );

    case 'inv-profit-loss':
      return <InventoryProfitLossView />;

    // ------------------------------------------------------------------------
    // 2. LIBRARY
    // ------------------------------------------------------------------------
    case 'lib-books':
      return (
        <ErpCrudView
          key={activeView}
          title="Library Books"
          breadcrumb="Library / Book List"
          endpoint="library/books"
          layout="modal"
          fields={[
            { name: 'title', label: 'Book Title', required: true },
            { name: 'bookNumber', label: 'Book / Accession No', required: true },
            { name: 'isbn', label: 'ISBN' },
            { name: 'author', label: 'Author', required: true },
            { name: 'publisher', label: 'Publisher' },
            { name: 'subject', label: 'Subject / Category' },
            { name: 'rackNumber', label: 'Rack No' },
            { name: 'quantity', label: 'Total Copies', type: 'number', required: true },
            { name: 'availableQty', label: 'Available Copies', type: 'number' },
            { name: 'price', label: 'Book Price', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'bookNumber', label: 'Book No' },
            { key: 'title', label: 'Title' },
            { key: 'author', label: 'Author' },
            { key: 'subject', label: 'Subject' },
            { key: 'rackNumber', label: 'Rack' },
            { key: 'quantity', label: 'Total' },
            { key: 'availableQty', label: 'Available' },
            { key: 'price', label: 'Price' },
          ]}
        />
      );

    case 'lib-issue-return':
      return (
        <ErpCrudView
          key={activeView}
          title="Issue / Return Books"
          breadcrumb="Library / Issue Return"
          endpoint="library/issues"
          layout="modal"
          rowActions={[returnBookAction]}
          fields={[
            { name: 'bookTitle', label: 'Book Title', required: true },
            { name: 'bookNumber', label: 'Book No' },
            {
              name: 'memberType',
              label: 'Member Type',
              type: 'select',
              options: ['Student', 'Staff'],
              defaultValue: 'Student',
              required: true,
            },
            { name: 'memberName', label: 'Member Name', required: true },
            { name: 'memberId', label: 'Member / Card ID', required: true },
            { name: 'issueDate', label: 'Issue Date', type: 'date', required: true },
            { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
            { name: 'returnDate', label: 'Return Date', type: 'date' },
            { name: 'fineAmount', label: 'Fine Amount', type: 'number' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Issued', 'Returned', 'Overdue'],
              defaultValue: 'Issued',
            },
          ]}
          columns={[
            { key: 'bookTitle', label: 'Book Title' },
            { key: 'memberType', label: 'Member Type' },
            { key: 'memberName', label: 'Member Name' },
            { key: 'memberId', label: 'Card ID' },
            { key: 'issueDate', label: 'Issue Date' },
            { key: 'dueDate', label: 'Due Date' },
            { key: 'returnDate', label: 'Return Date' },
            { key: 'fineAmount', label: 'Fine' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'lib-add-student':
      return (
        <ErpCrudView
          key={activeView}
          title="Library Student Members"
          breadcrumb="Library / Add Student"
          endpoint="library/members"
          fixedFilters={{ memberType: 'Student' }}
          transformPayload={(data) => ({ ...data, memberType: 'Student' })}
          fields={[
            { name: 'libraryCardNo', label: 'Library Card No', required: true },
            { name: 'memberName', label: 'Student Name', required: true },
            { name: 'memberId', label: 'Admission / Roll No', required: true },
            courseField(true),
            semesterField(false),
            { name: 'phone', label: 'Phone' },
            { name: 'email', label: 'Email', type: 'email' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'libraryCardNo', label: 'Card No' },
            { key: 'memberName', label: 'Student Name' },
            { key: 'memberId', label: 'Admission No' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'phone', label: 'Phone' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'lib-add-staff':
      return (
        <ErpCrudView
          key={activeView}
          title="Library Staff Members"
          breadcrumb="Library / Add Staff"
          endpoint="library/members"
          fixedFilters={{ memberType: 'Staff' }}
          transformPayload={(data) => ({ ...data, memberType: 'Staff' })}
          fields={[
            { name: 'libraryCardNo', label: 'Library Card No', required: true },
            { name: 'memberName', label: 'Staff Name', required: true },
            { name: 'memberId', label: 'Staff ID', required: true },
            { name: 'department', label: 'Department' },
            { name: 'phone', label: 'Phone' },
            { name: 'email', label: 'Email', type: 'email' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'libraryCardNo', label: 'Card No' },
            { key: 'memberName', label: 'Staff Name' },
            { key: 'memberId', label: 'Staff ID' },
            { key: 'department', label: 'Department' },
            { key: 'phone', label: 'Phone' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'lib-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Library Issue & Return Report"
          breadcrumb="Library / Reports"
          endpoint="library/issues"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Issued', 'Returned', 'Overdue'],
            },
            {
              name: 'memberType',
              label: 'Member Type',
              type: 'select',
              options: ['Student', 'Staff'],
            },
          ]}
          fields={[]}
          columns={[
            { key: 'bookTitle', label: 'Book Title' },
            { key: 'bookNumber', label: 'Book No' },
            { key: 'memberType', label: 'Member Type' },
            { key: 'memberName', label: 'Member Name' },
            { key: 'memberId', label: 'Card ID' },
            { key: 'issueDate', label: 'Issue Date' },
            { key: 'dueDate', label: 'Due Date' },
            { key: 'returnDate', label: 'Return Date' },
            { key: 'fineAmount', label: 'Fine' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    // ------------------------------------------------------------------------
    // 3. TRANSPORT
    // ------------------------------------------------------------------------
    case 'trans-route-vehicle':
      return (
        <ErpCrudView
          key={activeView}
          title="Routes & Vehicles"
          breadcrumb="Transport / Routes"
          endpoint="transport/routes"
          fields={[
            { name: 'routeTitle', label: 'Route Title', required: true },
            { name: 'vehicleNumber', label: 'Assigned Vehicle No' },
            { name: 'driverName', label: 'Driver Name' },
            { name: 'startPoint', label: 'Start Point' },
            { name: 'endPoint', label: 'End Point' },
            { name: 'fare', label: 'Monthly Fare', type: 'number', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'routeTitle', label: 'Route Title' },
            { key: 'vehicleNumber', label: 'Vehicle No' },
            { key: 'driverName', label: 'Driver' },
            { key: 'startPoint', label: 'Start' },
            { key: 'endPoint', label: 'End' },
            { key: 'fare', label: 'Fare' },
          ]}
        />
      );

    case 'trans-bus-stop':
      return (
        <ErpCrudView
          key={activeView}
          title="Bus Stops"
          breadcrumb="Transport / Bus Stops"
          endpoint="transport/stops"
          fields={[
            { name: 'stopName', label: 'Bus Stop Name', required: true },
            { name: 'routeTitle', label: 'Route Title', required: true },
            { name: 'pickupTime', label: 'Pickup Time', type: 'time' },
            { name: 'dropTime', label: 'Drop Time', type: 'time' },
            { name: 'fare', label: 'Stop Fare', type: 'number' },
          ]}
          columns={[
            { key: 'stopName', label: 'Bus Stop' },
            { key: 'routeTitle', label: 'Route' },
            { key: 'pickupTime', label: 'Pickup Time' },
            { key: 'dropTime', label: 'Drop Time' },
            { key: 'fare', label: 'Fare' },
          ]}
        />
      );

    case 'trans-assign':
      return (
        <ErpCrudView
          key={activeView}
          title="Assign Transport"
          breadcrumb="Transport / Assign Student"
          endpoint="transport/assignments"
          layout="modal"
          fields={[
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'admissionNo', label: 'Admission No', required: true },
            courseField(true),
            semesterField(false),
            { name: 'routeTitle', label: 'Route Title', required: true },
            { name: 'stopName', label: 'Bus Stop', required: true },
            { name: 'vehicleNumber', label: 'Vehicle No' },
            { name: 'fare', label: 'Monthly Fare', type: 'number', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'course', label: 'Course' },
            { key: 'routeTitle', label: 'Route' },
            { key: 'stopName', label: 'Bus Stop' },
            { key: 'vehicleNumber', label: 'Vehicle No' },
            { key: 'fare', label: 'Fare' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'trans-change-stop':
      return (
        <ErpCrudView
          key={activeView}
          title="Change Bus Stop"
          breadcrumb="Transport / Change Stop"
          endpoint="transport/assignments"
          layout="modal"
          hideCreate
          hideDelete
          fields={[
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'routeTitle', label: 'Route Title', required: true },
            { name: 'stopName', label: 'New Bus Stop', required: true },
            { name: 'vehicleNumber', label: 'Vehicle No' },
            { name: 'fare', label: 'Updated Fare', type: 'number' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'course', label: 'Course' },
            { key: 'routeTitle', label: 'Route' },
            { key: 'stopName', label: 'Bus Stop' },
            { key: 'fare', label: 'Fare' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'trans-vehicle':
      return (
        <ErpCrudView
          key={activeView}
          title="Vehicles"
          breadcrumb="Transport / Vehicles"
          endpoint="transport/vehicles"
          layout="modal"
          fields={[
            { name: 'vehicleNumber', label: 'Vehicle Number', required: true },
            { name: 'vehicleModel', label: 'Vehicle Model' },
            { name: 'yearMade', label: 'Year Made', type: 'number' },
            { name: 'seatingCapacity', label: 'Seating Capacity', type: 'number' },
            { name: 'driverName', label: 'Driver Name', required: true },
            { name: 'driverLicense', label: 'Driver License No' },
            { name: 'driverPhone', label: 'Driver Phone', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Maintenance', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'vehicleNumber', label: 'Vehicle No' },
            { key: 'vehicleModel', label: 'Model' },
            { key: 'seatingCapacity', label: 'Capacity' },
            { key: 'driverName', label: 'Driver' },
            { key: 'driverPhone', label: 'Driver Phone' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'trans-vehicle-doc':
      return (
        <ErpCrudView
          key={activeView}
          title="Vehicle Documents"
          breadcrumb="Transport / Vehicle Documents"
          endpoint="transport/documents"
          layout="modal"
          fields={[
            { name: 'vehicleNumber', label: 'Vehicle Number', required: true },
            {
              name: 'documentType',
              label: 'Document Type',
              type: 'select',
              options: ['RC', 'Insurance', 'Fitness', 'Permit', 'Pollution'],
              required: true,
            },
            { name: 'documentNumber', label: 'Document Number', required: true },
            { name: 'issueDate', label: 'Issue Date', type: 'date' },
            { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: true },
            { name: 'fileUrl', label: 'Document URL', type: 'url' },
            { name: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          columns={[
            { key: 'vehicleNumber', label: 'Vehicle No' },
            { key: 'documentType', label: 'Type' },
            { key: 'documentNumber', label: 'Document No' },
            { key: 'issueDate', label: 'Issue Date' },
            { key: 'expiryDate', label: 'Expiry Date' },
          ]}
        />
      );

    case 'trans-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Transport Report"
          breadcrumb="Transport / Reports"
          endpoint="transport/assignments"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            { name: 'routeTitle', label: 'Route Title' },
            courseField(false),
          ]}
          fields={[]}
          columns={[
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'routeTitle', label: 'Route' },
            { key: 'stopName', label: 'Bus Stop' },
            { key: 'vehicleNumber', label: 'Vehicle No' },
            { key: 'fare', label: 'Fare' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    // ------------------------------------------------------------------------
    // 4. HOSTEL
    // ------------------------------------------------------------------------
    case 'hostel-list':
      return (
        <ErpCrudView
          key={activeView}
          title="Hostel List"
          breadcrumb="Hostel / Hostels"
          endpoint="hostel/hostels"
          fields={[
            { name: 'name', label: 'Hostel Name', required: true },
            {
              name: 'type',
              label: 'Hostel Type',
              type: 'select',
              options: ['Boys', 'Girls', 'Combined'],
              required: true,
            },
            { name: 'intake', label: 'Total Intake / Capacity', type: 'number', required: true },
            { name: 'wardenName', label: 'Warden Name' },
            { name: 'wardenPhone', label: 'Warden Phone' },
            { name: 'address', label: 'Address', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Hostel Name' },
            { key: 'type', label: 'Type' },
            { key: 'intake', label: 'Intake' },
            { key: 'wardenName', label: 'Warden' },
            { key: 'wardenPhone', label: 'Phone' },
            { key: 'address', label: 'Address' },
          ]}
        />
      );

    case 'hostel-room-type':
      return (
        <ErpCrudView
          key={activeView}
          title="Hostel Room Types"
          breadcrumb="Hostel / Room Type"
          endpoint="hostel/room-types"
          fields={[
            { name: 'name', label: 'Room Type', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Room Type' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'hostel-rooms':
      return (
        <ErpCrudView
          key={activeView}
          title="Hostel Rooms"
          breadcrumb="Hostel / Hostel Rooms"
          endpoint="hostel/rooms"
          fields={[
            { name: 'roomNumber', label: 'Room Number / Name', required: true },
            { name: 'hostelName', label: 'Hostel Name', required: true },
            { name: 'roomType', label: 'Room Type', required: true },
            { name: 'noOfBeds', label: 'Number of Beds', type: 'number', required: true },
            { name: 'costPerBed', label: 'Cost Per Bed', type: 'number', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'roomNumber', label: 'Room No' },
            { key: 'hostelName', label: 'Hostel' },
            { key: 'roomType', label: 'Room Type' },
            { key: 'noOfBeds', label: 'Beds' },
            { key: 'costPerBed', label: 'Cost / Bed' },
          ]}
        />
      );

    case 'hostel-assign':
      return (
        <ErpCrudView
          key={activeView}
          title="Assign Hostel Room"
          breadcrumb="Hostel / Assign Hostel"
          endpoint="hostel/assignments"
          layout="modal"
          fields={[
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'admissionNo', label: 'Admission No', required: true },
            courseField(true),
            semesterField(false),
            { name: 'hostelName', label: 'Hostel Name', required: true },
            { name: 'roomNumber', label: 'Room No', required: true },
            { name: 'roomType', label: 'Room Type' },
            { name: 'bedNumber', label: 'Bed No' },
            { name: 'costPerBed', label: 'Monthly Fee', type: 'number', required: true },
            { name: 'allotmentDate', label: 'Allotment Date', type: 'date', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Vacated'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'course', label: 'Course' },
            { key: 'hostelName', label: 'Hostel' },
            { key: 'roomNumber', label: 'Room No' },
            { key: 'bedNumber', label: 'Bed No' },
            { key: 'costPerBed', label: 'Monthly Fee' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hostel-change':
      return (
        <ErpCrudView
          key={activeView}
          title="Change Hostel / Room"
          breadcrumb="Hostel / Change Hostel"
          endpoint="hostel/assignments"
          layout="modal"
          hideCreate
          hideDelete
          fields={[
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'hostelName', label: 'New Hostel Name', required: true },
            { name: 'roomNumber', label: 'New Room No', required: true },
            { name: 'roomType', label: 'Room Type' },
            { name: 'bedNumber', label: 'Bed No' },
            { name: 'costPerBed', label: 'Updated Monthly Fee', type: 'number' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Vacated'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'course', label: 'Course' },
            { key: 'hostelName', label: 'Hostel' },
            { key: 'roomNumber', label: 'Room No' },
            { key: 'bedNumber', label: 'Bed No' },
            { key: 'costPerBed', label: 'Monthly Fee' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hostel-students':
      return (
        <ErpCrudView
          key={activeView}
          title="Hostel Students Report"
          breadcrumb="Hostel / Hostel Students"
          endpoint="hostel/assignments"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            { name: 'hostelName', label: 'Hostel Name' },
            courseField(false),
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Vacated'],
            },
          ]}
          fields={[]}
          columns={[
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'hostelName', label: 'Hostel' },
            { key: 'roomNumber', label: 'Room No' },
            { key: 'bedNumber', label: 'Bed No' },
            { key: 'costPerBed', label: 'Monthly Fee' },
            { key: 'allotmentDate', label: 'Allotment Date' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    default:
      return null;
  }
}
