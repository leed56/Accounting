import type {
  BankReconciliation,
  BankStatementLine,
  Branch,
  JournalEntry,
  JournalLine,
  Product,
  SettlementItem,
  SettlementRun,
  StockMovement,
  Transaction,
  VendorCommissionRow,
} from '@bizmanager/types';
import type {
  BankReconciliationInput,
  BankStatementLineInput,
  BranchInput,
  JournalEntryInput,
  ProductInput,
  SettlementRunInput,
  StockAdjustmentInput,
} from '@bizmanager/types';
import {
  MULTI_VENDOR_COMMISSION_CATEGORIES,
  MULTI_VENDOR_SETTLEMENT_CATEGORY,
  toISODate,
} from '@bizmanager/utils';
import { getSupabase } from './client';
import { createAuditLog, getContext } from './mutations';
import { getAccounts } from './queries';

async function adjustSupplierBalance(supplierId: string, delta: number) {
  const supabase = getSupabase();
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('current_balance')
    .eq('id', supplierId)
    .single();
  if (!supplier) return;
  await supabase
    .from('suppliers')
    .update({ current_balance: Math.max(0, Number(supplier.current_balance) + delta) })
    .eq('id', supplierId);
}

export async function applySupplierSettlement(supplierId: string, amount: number) {
  await adjustSupplierBalance(supplierId, -amount);
}

// ─── Branches ───────────────────────────────────────────────────────────────

export async function getBranches(companyId: string): Promise<Branch[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as Branch[];
}

export async function createBranch(input: BranchInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  if (input.isDefault) {
    await supabase
      .from('branches')
      .update({ is_default: false })
      .eq('company_id', profile.company_id);
  }
  const { data, error } = await supabase
    .from('branches')
    .insert({
      company_id: profile.company_id,
      name: input.name,
      address: input.address || null,
      phone: input.phone || null,
      is_default: input.isDefault ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'create', 'branch', data.id);
  return data as Branch;
}

// ─── Inventory ──────────────────────────────────────────────────────────────

export async function getProducts(companyId: string): Promise<Product[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(input: ProductInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .insert({
      company_id: profile.company_id,
      branch_id: input.branchId || null,
      sku: input.sku || null,
      name: input.name,
      unit: input.unit || 'pcs',
      cost_price: input.costPrice ?? 0,
      sale_price: input.salePrice ?? 0,
      quantity_on_hand: input.quantityOnHand ?? 0,
      reorder_level: input.reorderLevel ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  if (input.quantityOnHand && input.quantityOnHand > 0) {
    await supabase.from('stock_movements').insert({
      company_id: profile.company_id,
      product_id: data.id,
      movement_type: 'in',
      quantity: input.quantityOnHand,
      unit_cost: input.costPrice ?? 0,
      notes: 'Opening stock',
      created_by: profile.id,
    });
  }
  await createAuditLog(profile.company_id, profile.id, 'create', 'product', data.id);
  return data as Product;
}

export async function adjustStock(input: StockAdjustmentInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data: product, error: pErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', input.productId)
    .eq('company_id', profile.company_id)
    .single();
  if (pErr || !product) throw new Error('Product not found');

  const qty = Number(input.quantity);
  const delta =
    input.movementType === 'out' ? -qty : input.movementType === 'in' ? qty : qty - Number(product.quantity_on_hand);
  const newQty = Math.max(0, Number(product.quantity_on_hand) + delta);

  await supabase.from('stock_movements').insert({
    company_id: profile.company_id,
    product_id: input.productId,
    movement_type: input.movementType,
    quantity: qty,
    unit_cost: input.unitCost ?? null,
    notes: input.notes || null,
    created_by: profile.id,
  });

  const { data, error } = await supabase
    .from('products')
    .update({ quantity_on_hand: newQty })
    .eq('id', input.productId)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function getStockMovements(productId: string): Promise<StockMovement[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as StockMovement[];
}

// ─── Journal / Ledger ───────────────────────────────────────────────────────

export async function getJournalEntries(companyId: string): Promise<(JournalEntry & { lines?: JournalLine[] })[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('company_id', companyId)
    .order('entry_date', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as JournalEntry[];
}

export async function getJournalEntry(id: string) {
  const supabase = getSupabase();
  const { data: entry, error } = await supabase.from('journal_entries').select('*').eq('id', id).single();
  if (error) throw error;
  const { data: lines } = await supabase
    .from('journal_lines')
    .select('*')
    .eq('journal_entry_id', id)
    .order('id');
  return { ...(entry as JournalEntry), lines: (lines ?? []) as JournalLine[] };
}

export async function createJournalEntry(input: JournalEntryInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const totalDebit = input.lines.reduce((s, l) => s + Number(l.debit), 0);
  const totalCredit = input.lines.reduce((s, l) => s + Number(l.credit), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error('Debits and credits must balance');
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert({
      company_id: profile.company_id,
      branch_id: input.branchId || null,
      entry_date: input.entryDate,
      reference: input.reference || null,
      description: input.description,
      created_by: profile.id,
    })
    .select()
    .single();
  if (error) throw error;

  const lineRows = input.lines.map((l) => ({
    journal_entry_id: entry.id,
    account_code: l.accountCode,
    account_id: l.accountId || null,
    debit: l.debit,
    credit: l.credit,
    description: l.description || null,
  }));
  const { error: lineErr } = await supabase.from('journal_lines').insert(lineRows);
  if (lineErr) throw lineErr;

  await createAuditLog(profile.company_id, profile.id, 'create', 'journal_entry', entry.id);
  return entry as JournalEntry;
}

// ─── Vendor settlements ─────────────────────────────────────────────────────

export async function getSettlementRuns(companyId: string): Promise<SettlementRun[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('settlement_runs')
    .select('*')
    .eq('company_id', companyId)
    .order('run_date', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as SettlementRun[];
}

export async function getSettlementRun(id: string) {
  const supabase = getSupabase();
  const { data: run, error } = await supabase.from('settlement_runs').select('*').eq('id', id).single();
  if (error) throw error;
  const { data: items } = await supabase.from('settlement_items').select('*').eq('settlement_run_id', id);
  return { ...(run as SettlementRun), items: (items ?? []) as SettlementItem[] };
}

export async function createSettlementRun(input: SettlementRunInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const total = input.items.reduce((s, i) => s + Number(i.amount), 0);
  const accounts = await getAccounts(profile.company_id);
  const accountId = input.accountId || accounts.find((a) => a.type === 'cash')?.id || null;

  const { data: run, error } = await supabase
    .from('settlement_runs')
    .insert({
      company_id: profile.company_id,
      run_date: input.runDate,
      status: 'paid',
      total_amount: total,
      notes: input.notes || null,
      account_id: accountId,
      created_by: profile.id,
      approved_by: profile.id,
    })
    .select()
    .single();
  if (error) throw error;

  for (const item of input.items) {
    const { data: tx, error: txErr } = await supabase
      .from('transactions')
      .insert({
        company_id: profile.company_id,
        type: 'expense',
        category: MULTI_VENDOR_SETTLEMENT_CATEGORY,
        amount: item.amount,
        payment_method: 'bank_transfer',
        account_id: accountId,
        supplier_id: item.supplierId,
        description: item.notes || `Batch settlement — ${run.id.slice(0, 8)}`,
        transaction_date: input.runDate,
        status: 'approved',
        requires_approval: false,
        created_by: profile.id,
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (txErr) throw txErr;

    await supabase.from('settlement_items').insert({
      settlement_run_id: run.id,
      supplier_id: item.supplierId,
      amount: item.amount,
      transaction_id: tx.id,
      notes: item.notes || null,
    });

    await applySupplierSettlement(item.supplierId, item.amount);
  }

  if (accountId) {
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      await supabase
        .from('accounts')
        .update({ current_balance: Number(account.current_balance) - total })
        .eq('id', accountId);
    }
  }

  await createAuditLog(profile.company_id, profile.id, 'create', 'settlement_run', run.id, undefined, {
    total,
    vendorCount: input.items.length,
  });

  return run as SettlementRun;
}

// ─── Bank reconciliation ────────────────────────────────────────────────────

export async function getBankReconciliations(companyId: string): Promise<BankReconciliation[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .select('*')
    .eq('company_id', companyId)
    .order('statement_date', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as BankReconciliation[];
}

export async function createBankReconciliation(input: BankReconciliationInput) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .insert({
      company_id: profile.company_id,
      account_id: input.accountId,
      statement_date: input.statementDate,
      opening_balance: input.openingBalance,
      closing_balance: input.closingBalance,
      notes: input.notes || null,
      created_by: profile.id,
    })
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'create', 'bank_reconciliation', data.id);
  return data as BankReconciliation;
}

export async function getBankStatementLines(reconciliationId: string): Promise<BankStatementLine[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bank_statement_lines')
    .select('*')
    .eq('reconciliation_id', reconciliationId)
    .order('line_date');
  if (error) throw error;
  return (data ?? []) as BankStatementLine[];
}

export async function addBankStatementLine(reconciliationId: string, input: BankStatementLineInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bank_statement_lines')
    .insert({
      reconciliation_id: reconciliationId,
      line_date: input.lineDate,
      description: input.description || null,
      amount: input.amount,
      reference: input.reference || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as BankStatementLine;
}

export async function matchBankLine(lineId: string, transactionId: string) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bank_statement_lines')
    .update({ transaction_id: transactionId, is_matched: true })
    .eq('id', lineId)
    .select()
    .single();
  if (error) throw error;
  await createAuditLog(profile.company_id, profile.id, 'update', 'bank_statement_line', lineId);
  return data as BankStatementLine;
}

export async function closeBankReconciliation(id: string) {
  const { profile } = await getContext();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bank_reconciliations')
    .update({ status: 'closed' })
    .eq('id', id)
    .eq('company_id', profile.company_id)
    .select()
    .single();
  if (error) throw error;
  return data as BankReconciliation;
}

// ─── Vendor reports ─────────────────────────────────────────────────────────

export async function getSupplierTransactions(
  supplierId: string,
  limit = 50
): Promise<Transaction[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('transaction_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function getVendorCommissionReport(
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<VendorCommissionRow[]> {
  const supabase = getSupabase();
  const start = startDate ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
  const end = endDate ?? toISODate();

  const { data: suppliers, error: sErr } = await supabase
    .from('suppliers')
    .select('id, name, commission_rate, current_balance')
    .eq('company_id', companyId);
  if (sErr) throw sErr;

  const { data: commissionTx } = await supabase
    .from('transactions')
    .select('supplier_id, amount')
    .eq('company_id', companyId)
    .eq('type', 'income')
    .in('category', [...MULTI_VENDOR_COMMISSION_CATEGORIES])
    .gte('transaction_date', start)
    .lte('transaction_date', end)
    .in('status', ['approved', 'paid']);

  const { data: settlementTx } = await supabase
    .from('transactions')
    .select('supplier_id, amount')
    .eq('company_id', companyId)
    .eq('type', 'expense')
    .eq('category', MULTI_VENDOR_SETTLEMENT_CATEGORY)
    .gte('transaction_date', start)
    .lte('transaction_date', end)
    .in('status', ['approved', 'paid']);

  return (suppliers ?? []).map((s) => ({
    supplier_id: s.id,
    supplier_name: s.name,
    commission_rate: Number(s.commission_rate ?? 0),
    commission_total:
      commissionTx?.filter((t) => t.supplier_id === s.id).reduce((sum, t) => sum + Number(t.amount), 0) ?? 0,
    settlements_total:
      settlementTx?.filter((t) => t.supplier_id === s.id).reduce((sum, t) => sum + Number(t.amount), 0) ?? 0,
    balance: Number(s.current_balance),
  }));
}
