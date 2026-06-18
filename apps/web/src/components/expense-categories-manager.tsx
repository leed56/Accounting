'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/components/language-switcher';
import { FormInput } from '@/components/form-fields';
import { PremiumButton } from '@/components/premium-button';
import { useToast } from '@/components/toast';
import {
  getExpenseCategories,
  getCompany,
  createExpenseCategory,
  updateExpenseCategory,
  setExpenseCategoryHidden,
  seedExpenseCategoriesForCompany,
  queryKeys,
} from '@bizmanager/supabase-client';
import { getCategoryName } from '@bizmanager/utils';
import { Eye, EyeOff, Pencil, Plus, Check, X } from 'lucide-react';

type Props = {
  companyId: string;
  canEdit: boolean;
};

export function ExpenseCategoriesManager({ companyId, canEdit }: Props) {
  const { t, language } = useTranslation();
  const toast = useToast((s) => s.show);
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: queryKeys.categories(companyId, 'all'),
    queryFn: () => getExpenseCategories(companyId, { includeHidden: true }),
  });

  const { data: company } = useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => getCompany(companyId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['categories', companyId] });
  };

  const createMutation = useMutation({
    mutationFn: () => createExpenseCategory({ name_en: newName }),
    onSuccess: () => {
      setNewName('');
      invalidate();
      toast(t('categoryAdded'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateExpenseCategory(id, { name_en: name }),
    onSuccess: () => {
      setEditingId(null);
      setEditName('');
      invalidate();
      toast(t('success'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const hideMutation = useMutation({
    mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) =>
      setExpenseCategoryHidden(id, hidden),
    onSuccess: () => {
      invalidate();
      toast(t('success'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const syncTemplateMutation = useMutation({
    mutationFn: () =>
      seedExpenseCategoriesForCompany(companyId, company?.business_type ?? 'other'),
    onSuccess: () => {
      invalidate();
      toast(t('templateCategoriesSynced'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('expenseCategoriesDesc')}</p>

      {isLoading ? (
        <p className="text-sm text-gray-500">{t('loading')}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {categories?.map((cat) => (
            <li
              key={cat.id}
              className={`flex items-center gap-3 py-3 ${cat.is_hidden ? 'opacity-60' : ''}`}
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color ?? '#64748B' }}
              />
              {editingId === cat.id ? (
                <>
                  <input
                    className="input-field flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => updateMutation.mutate({ id: cat.id, name: editName })}
                    disabled={!editName.trim() || updateMutation.isPending}
                    className="text-primary hover:text-primary-dark p-1"
                    aria-label={t('save')}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={cancelEdit} className="text-gray-400 p-1" aria-label={t('cancel')}>
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                    {getCategoryName(cat, language)}
                    {cat.is_hidden && (
                      <span className="ml-2 text-xs font-normal text-gray-500">({t('hidden')})</span>
                    )}
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(cat.id, cat.name_en)}
                        className="text-gray-400 hover:text-primary p-1"
                        aria-label={t('renameCategory')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => hideMutation.mutate({ id: cat.id, hidden: !cat.is_hidden })}
                        disabled={hideMutation.isPending}
                        className="text-gray-400 hover:text-primary p-1"
                        aria-label={cat.is_hidden ? t('showCategory') : t('hideCategory')}
                      >
                        {cat.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <FormInput
            label={t('newCategory')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('categoryNamePlaceholder')}
            className="flex-1"
          />
          <div className="flex items-end">
            <PremiumButton
              type="button"
              variant="secondary"
              loading={createMutation.isPending}
              disabled={!newName.trim()}
              onClick={() => createMutation.mutate()}
            >
              <Plus className="h-4 w-4" />
              {t('addCategory')}
            </PremiumButton>
          </div>
        </div>
      )}

      {canEdit && company?.business_type && (
        <PremiumButton
          type="button"
          variant="secondary"
          loading={syncTemplateMutation.isPending}
          onClick={() => syncTemplateMutation.mutate()}
        >
          {t('syncTemplateCategories')}
        </PremiumButton>
      )}

      {!canEdit && (
        <p className="text-sm text-gray-500">{t('onlyOwnerCategories')}</p>
      )}
    </div>
  );
}
