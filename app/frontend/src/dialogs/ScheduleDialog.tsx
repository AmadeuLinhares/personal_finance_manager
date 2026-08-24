import {
  Button,
  DatePicker,
  Dialog,
  Field,
  Input,
  Notice,
  Segmented,
  SegmentedOption,
  Select,
  moneyRegisterOptions,
  toIsoDate,
} from '@pfm/ui';
import { useEffect, useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import type { Frequency, ScheduledItemKind } from '@/http/api-types';
import type { FetchError } from '@/http/fetch/fetch';
import { useCreateScheduledItem } from '@/http/mutations/scheduledItems/useCreateScheduledItem';
import { useGetAccounts } from '@/http/queries/accounts/useGetAccounts';
import { useGetCategories } from '@/http/queries/categories/useGetCategories';
import { applyApiErrorToForm } from '@/utils/formErrors';

interface ScheduleForm {
  name: string;
  kind: ScheduledItemKind;
  /** Positive integer minor units. The sign comes from `kind`, not this field. */
  amount: number;
  startDate: string;
  frequency: Frequency;
  accountId: string;
  categoryId: string;
}

/** The fields a 422's `details[]` can be pinned to. */
const FORM_FIELDS = [
  'name',
  'amount',
  'startDate',
  'frequency',
  'accountId',
  'categoryId',
] as const;

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ScheduleDialog({ open, onClose }: ScheduleDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const kindLabelId = useId();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ScheduleForm>({
    defaultValues: {
      name: '',
      kind: 'bill',
      amount: 0,
      startDate: toIsoDate(new Date()),
      frequency: 'monthly',
      accountId: '',
      categoryId: '',
    },
  });

  const kind = useWatch({ control, name: 'kind' });

  const accountsQuery = useGetAccounts({ includeBalances: false });
  // A bill has no business offering "Salary", and income has none offering "Rent".
  const categoriesQuery = useGetCategories({ kind: kind === 'income' ? 'income' : 'expense' });

  const accounts = accountsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const firstAccountId = accounts[0]?.id ?? '';

  const createScheduledItem = useCreateScheduledItem();

  // The accounts arrive after mount, so the default cannot come from `useForm`.
  useEffect(() => {
    if (!open || firstAccountId === '') return;
    reset({
      name: '',
      kind: 'bill',
      amount: 0,
      startDate: toIsoDate(new Date()),
      frequency: 'monthly',
      accountId: firstAccountId,
      categoryId: '',
    });
  }, [open, firstAccountId, reset]);

  const close = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = (values: ScheduleForm) => {
    setFormError(null);

    createScheduledItem.mutate(
      {
        name: values.name,
        kind: values.kind,
        accountId: values.accountId,
        categoryId: values.categoryId === '' ? null : values.categoryId,
        // Signed at the edge: bills leave the account, income enters it.
        amount: values.kind === 'bill' ? -values.amount : values.amount,
        frequency: values.frequency,
        startDate: values.startDate,
      },
      {
        onSuccess: close,
        onError: (error: FetchError) => {
          setFormError(applyApiErrorToForm(error, setError, FORM_FIELDS));
        },
      },
    );
  };

  const isSaving = createScheduledItem.isPending;

  return (
    <Dialog
      open={open}
      onClose={close}
      title='Schedule item'
      className='w-[min(480px,100%)]'
      actions={
        <>
          <Button variant='ghost' onClick={close} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant='primary'
            disabled={isSaving || accountsQuery.isPending}
            onClick={() => {
              void handleSubmit(onSubmit)();
            }}
          >
            {isSaving ? 'Saving…' : 'Save item'}
          </Button>
        </>
      }
    >
      {formError === null ? null : <Notice className='mb-3'>{formError}</Notice>}

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Field label='Name' className='sm:col-span-2' error={errors.name?.message}>
          {(field) => (
            <Input
              placeholder='e.g. Gym membership'
              {...field}
              {...register('name', { required: 'VALIDATION_ERROR — name is required' })}
            />
          )}
        </Field>

        <div>
          <span id={kindLabelId} className='mb-1.5 block text-label text-ink/70'>
            Kind
          </span>
          <Segmented labelledBy={kindLabelId}>
            {(['bill', 'income'] as const).map((option) => (
              <SegmentedOption key={option} value={option} {...register('kind')}>
                {option === 'bill' ? 'Bill' : 'Income'}
              </SegmentedOption>
            ))}
          </Segmented>
        </div>

        <Field
          label='Amount'
          error={errors.amount?.message}
          hint='the sign comes from Kind, not from this field'
        >
          {(field) => (
            <Input
              mask='money'
              prefix='$'
              placeholder='0.00'
              {...field}
              {...register('amount', {
                ...moneyRegisterOptions,
                min: { value: 1, message: 'VALIDATION_ERROR — amount cannot be zero' },
              })}
            />
          )}
        </Field>

        <Field
          label='Start date'
          error={errors.startDate?.message}
          hint='monthly items stay anchored to this day of month'
        >
          {(field) => (
            <Controller
              control={control}
              name='startDate'
              rules={{ required: 'VALIDATION_ERROR — start date is required' }}
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <DatePicker
                  ref={ref}
                  portal={false}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  {...field}
                />
              )}
            />
          )}
        </Field>

        <Field label='Frequency' error={errors.frequency?.message}>
          {(field) => (
            <Select {...field} {...register('frequency')}>
              {FREQUENCIES.map((frequency) => (
                <option key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label='Account' error={errors.accountId?.message}>
          {(field) => (
            <Select {...field} {...register('accountId')} disabled={accountsQuery.isPending}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {account.currency}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label='Category' error={errors.categoryId?.message}>
          {(field) => (
            <Select {...field} {...register('categoryId')} disabled={categoriesQuery.isPending}>
              <option value=''>Uncategorised</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Notice variant='muted' className='mt-3'>
        A scheduled item is a rule, not a row — nothing is materialised in advance, so the forecast
        stays live.
      </Notice>
    </Dialog>
  );
}
