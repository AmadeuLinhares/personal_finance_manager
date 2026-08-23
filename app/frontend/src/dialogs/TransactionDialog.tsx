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

import type { FetchError } from '@/http/fetch/fetch';
import { useCreateTransaction } from '@/http/mutations/transactions/useCreateTransaction';
import { useCreateTransfer } from '@/http/mutations/transfers/useCreateTransfer';
import { useGetAccounts } from '@/http/queries/accounts/useGetAccounts';
import { useGetCategories } from '@/http/queries/categories/useGetCategories';
import { applyApiErrorToForm } from '@/utils/formErrors';

type Kind = 'expense' | 'income' | 'transfer';

interface TransactionForm {
  kind: Kind;
  description: string;
  /** Positive integer minor units. The sign comes from `kind`, not this field. */
  amount: number;
  date: string;
  accountId: string;
  toAccountId: string;
  categoryId: string;
  status: 'posted' | 'pending';
}

/** The fields a 422's `details[]` can be pinned to. */
const FORM_FIELDS = [
  'description',
  'amount',
  'date',
  'accountId',
  'toAccountId',
  'categoryId',
  'status',
] as const;

export interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionDialog({ open, onClose }: TransactionDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const kindLabelId = useId();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<TransactionForm>({
    defaultValues: {
      kind: 'expense',
      description: '',
      amount: 0,
      date: toIsoDate(new Date()),
      accountId: '',
      toAccountId: '',
      categoryId: '',
      status: 'posted',
    },
  });

  // useWatch, not watch(): it is the subscribing hook, and watch() returns a
  // function the React Compiler cannot memoize safely.
  const kind = useWatch({ control, name: 'kind' });
  const accountId = useWatch({ control, name: 'accountId' });
  const toAccountId = useWatch({ control, name: 'toAccountId' });
  const isTransfer = kind === 'transfer';

  const accountsQuery = useGetAccounts({ includeBalances: false });
  // Only the categories that match the segmented control — an expense form has no
  // business offering "Salary".
  const categoriesQuery = useGetCategories({ kind: kind === 'income' ? 'income' : 'expense' });

  const accounts = accountsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const firstAccountId = accounts[0]?.id ?? '';
  const secondAccountId = accounts[1]?.id ?? firstAccountId;

  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();
  const isSaving = createTransaction.isPending || createTransfer.isPending;

  /**
   * The accounts arrive after mount, so the defaults cannot come from `useForm`.
   * Both deps are ids: they only change when the account list really changes, not
   * on every refetch, so typing is never wiped out from under the user.
   */
  useEffect(() => {
    if (!open || firstAccountId === '') return;
    reset({
      kind: 'expense',
      description: '',
      amount: 0,
      date: toIsoDate(new Date()),
      accountId: firstAccountId,
      toAccountId: secondAccountId,
      categoryId: '',
      status: 'posted',
    });
  }, [open, firstAccountId, secondAccountId, reset]);

  const from = accounts.find((account) => account.id === accountId);
  const to = accounts.find((account) => account.id === toAccountId);
  /** Cross-currency transfers are refused rather than guessed — no FX rates exist. */
  const currencyMismatch = isTransfer && from && to && from.currency !== to.currency;

  const close = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = (values: TransactionForm) => {
    setFormError(null);

    const onError = (error: FetchError) => {
      setFormError(applyApiErrorToForm(error, setError, FORM_FIELDS));
    };

    if (values.kind === 'transfer') {
      // A positive magnitude: the server derives each leg's sign.
      createTransfer.mutate(
        {
          fromAccountId: values.accountId,
          toAccountId: values.toAccountId,
          amount: values.amount,
          date: values.date,
          description: values.description,
          status: values.status,
        },
        { onSuccess: close, onError },
      );
      return;
    }

    createTransaction.mutate(
      {
        accountId: values.accountId,
        date: values.date,
        // Signed at the edge: an expense leaves the account, income enters it.
        amount: values.kind === 'expense' ? -values.amount : values.amount,
        description: values.description,
        categoryId: values.categoryId === '' ? null : values.categoryId,
        status: values.status,
      },
      { onSuccess: close, onError },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={isTransfer ? 'New transfer' : 'New transaction'}
      className='w-[min(520px,100%)]'
      actions={
        <>
          <Button variant='ghost' onClick={close} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant='primary'
            disabled={currencyMismatch === true || isSaving || accountsQuery.isPending}
            onClick={() => {
              void handleSubmit(onSubmit)();
            }}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='sm:col-span-2'>
          <span id={kindLabelId} className='mb-1.5 block text-label text-ink/70'>
            Kind
          </span>
          <Segmented labelledBy={kindLabelId}>
            {(['expense', 'income', 'transfer'] as const).map((option) => (
              <SegmentedOption key={option} value={option} {...register('kind')}>
                {option === 'expense' ? 'Expense' : option === 'income' ? 'Income' : 'Transfer'}
              </SegmentedOption>
            ))}
          </Segmented>
        </div>

        <Field label='Description' className='sm:col-span-2' error={errors.description?.message}>
          {(field) => (
            <Input
              placeholder='e.g. Metro Plus'
              {...field}
              {...register('description', {
                required: 'VALIDATION_ERROR — description is required',
              })}
            />
          )}
        </Field>

        <Field
          label='Amount'
          error={errors.amount?.message}
          hint='stored as integer minor units (cents)'
        >
          {(field) => (
            <Input
              mask='money'
              prefix='$'
              placeholder='0.00'
              {...field}
              {...register('amount', {
                ...moneyRegisterOptions,
                // The field is a magnitude — the segmented control carries the direction.
                min: { value: 1, message: 'VALIDATION_ERROR — amount must be a positive value' },
              })}
            />
          )}
        </Field>

        <Field label='Date' error={errors.date?.message}>
          {(field) => (
            <Controller
              control={control}
              name='date'
              rules={{ required: 'VALIDATION_ERROR — date is required' }}
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

        <Field label={isTransfer ? 'From account' : 'Account'} error={errors.accountId?.message}>
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

        {isTransfer ? (
          <Field label='To account' error={errors.toAccountId?.message}>
            {(field) => (
              <Select {...field} {...register('toAccountId')} disabled={accountsQuery.isPending}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {account.currency}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        ) : (
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
        )}

        <Field label='Status'>
          {(field) => (
            <Select {...field} {...register('status')}>
              <option value='posted'>Posted</option>
              <option value='pending'>Pending</option>
            </Select>
          )}
        </Field>
      </div>

      {accountsQuery.isError ? (
        <Notice className='mt-3'>
          {accountsQuery.error.data.code} — accounts could not be loaded, so there is nothing to
          post to.
        </Notice>
      ) : null}

      {formError === null ? null : <Notice className='mt-3'>{formError}</Notice>}

      {currencyMismatch === true ? (
        <Notice className='mt-3'>
          UNSUPPORTED_OPERATION — cross-currency transfers are refused (no FX rates).
        </Notice>
      ) : null}

      {isTransfer ? (
        <Notice variant='muted' className='mt-2'>
          A transfer is two transactions sharing a transferId, one per leg — this collects the
          positive magnitude and the two accounts.
        </Notice>
      ) : null}
    </Dialog>
  );
}
