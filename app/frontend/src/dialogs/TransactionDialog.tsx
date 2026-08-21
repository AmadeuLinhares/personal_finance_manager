import {
  Button,
  Dialog,
  Field,
  Input,
  Notice,
  Segmented,
  SegmentedOption,
  Select,
  moneyRegisterOptions,
} from '@pfm/ui';
import { useForm, useWatch } from 'react-hook-form';

import { ACCOUNTS, CATEGORIES, TODAY } from '../mock/data';

type Kind = 'expense' | 'income' | 'transfer';

interface TransactionForm {
  kind: Kind;
  description: string;
  /** Integer minor units. The sign comes from `kind`, not from this field. */
  amount: number;
  date: string;
  accountId: string;
  toAccountId: string;
  category: string;
  status: 'posted' | 'pending';
}

export interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionDialog({ open, onClose }: TransactionDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    defaultValues: {
      kind: 'expense',
      description: '',
      amount: 0,
      date: TODAY,
      accountId: 'acc_chequing',
      toAccountId: 'acc_savings',
      category: 'Groceries',
      status: 'posted',
    },
  });

  // useWatch, not watch(): it is the subscribing hook, and watch() returns a
  // function the React Compiler cannot memoize safely.
  const kind = useWatch({ control, name: 'kind' });
  const accountId = useWatch({ control, name: 'accountId' });
  const toAccountId = useWatch({ control, name: 'toAccountId' });
  const isTransfer = kind === 'transfer';
  const from = ACCOUNTS.find((account) => account.id === accountId);
  const to = ACCOUNTS.find((account) => account.id === toAccountId);
  /** Cross-currency transfers are refused rather than guessed — no FX rates exist. */
  const currencyMismatch = isTransfer && from && to && from.currency !== to.currency;

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={isTransfer ? 'New transfer' : 'New transaction'}
      className='w-[min(520px,100%)]'
      actions={
        <>
          <Button variant='ghost' onClick={close}>
            Cancel
          </Button>
          <Button
            variant='primary'
            disabled={currencyMismatch === true}
            onClick={() => {
              void handleSubmit(close)();
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='sm:col-span-2'>
          <span className='mb-1.5 block text-label text-ink/70'>Kind</span>
          <Segmented>
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
                min: { value: 1, message: 'VALIDATION_ERROR — amount cannot be zero' },
              })}
            />
          )}
        </Field>

        <Field label='Date' error={errors.date?.message}>
          {(field) => <Input type='date' {...field} {...register('date')} />}
        </Field>

        <Field label={isTransfer ? 'From account' : 'Account'}>
          {(field) => (
            <Select {...field} {...register('accountId')}>
              {ACCOUNTS.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {account.currency}
                </option>
              ))}
            </Select>
          )}
        </Field>

        {isTransfer ? (
          <Field label='To account'>
            {(field) => (
              <Select {...field} {...register('toAccountId')}>
                {ACCOUNTS.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {account.currency}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        ) : (
          <Field label='Category'>
            {(field) => (
              <Select {...field} {...register('category')}>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
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
