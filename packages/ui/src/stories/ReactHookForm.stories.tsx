import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';

import { Button } from '../components/Button';
import { Field, Input, Select } from '../components/Field';
import { Money } from '../components/Money';
import { Segmented, SegmentedOption } from '../components/Segmented';
import { Notice } from '../components/states';
import { moneyRegisterOptions } from '../lib/masks';

const meta = {
  title: 'Patterns/React Hook Form',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

interface TransactionForm {
  description: string;
  /** Integer minor units. 4599, never 45.99. */
  amount: number;
  accountId: string;
  date: string;
  kind: 'expense' | 'income';
}

export const NewTransaction: StoryObj = {
  name: 'New transaction',
  render: () => {
    const Demo = () => {
      const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitSuccessful },
      } = useForm<TransactionForm>({
        defaultValues: {
          description: '',
          amount: 4599,
          accountId: 'acc_chequing',
          date: '2026-08-21',
          kind: 'expense',
        },
      });

      const values = watch();
      const signed = values.kind === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount);

      return (
        <div className='md:grid-cols-[1fr_320px] grid max-w-[900px] gap-6'>
          <form onSubmit={handleSubmit(() => undefined)} className='flex flex-col gap-4' noValidate>
            <Field
              label='Description'
              error={errors.description?.message}
              hint='What the row will say in the ledger'
            >
              {(field) => (
                <Input
                  placeholder='e.g. Metro Plus'
                  {...field}
                  {...register('description', { required: 'Description is required' })}
                />
              )}
            </Field>

            <Field
              label='Amount'
              error={errors.amount?.message}
              hint='Type digits — they fill from the right, so 4599 reads as 45.99'
            >
              {(field) => (
                <Input
                  mask='money'
                  prefix='$'
                  suffix='CAD'
                  placeholder='0.00'
                  {...field}
                  defaultValue={4599}
                  {...register('amount', {
                    ...moneyRegisterOptions,
                    min: { value: 1, message: 'Amount cannot be zero' },
                  })}
                />
              )}
            </Field>

            <Field label='Account' error={errors.accountId?.message}>
              {(field) => (
                <Select {...field} {...register('accountId')}>
                  <option value='acc_chequing'>Everyday Chequing · CAD</option>
                  <option value='acc_visa'>Travel Rewards Visa · CAD</option>
                  <option value='acc_usd'>USD Chequing · USD</option>
                </Select>
              )}
            </Field>

            <Field
              label='Date'
              error={errors.date?.message}
              hint='YYYY-MM-DD, as the API stores it'
            >
              {(field) => (
                <Input mask='isoDate' placeholder='2026-08-21' {...field} {...register('date')} />
              )}
            </Field>

            <div>
              <span className='mb-1.5 block text-label text-ink/70'>Kind</span>
              <Segmented>
                <SegmentedOption value='expense' {...register('kind')}>
                  Expense
                </SegmentedOption>
                <SegmentedOption value='income' {...register('kind')}>
                  Income
                </SegmentedOption>
              </Segmented>
            </div>

            <div className='flex gap-2'>
              <Button variant='primary' type='submit'>
                Save
              </Button>
              <Button variant='ghost' type='reset'>
                Reset
              </Button>
            </div>
            {isSubmitSuccessful ? <Notice variant='muted'>Submitted.</Notice> : null}
          </form>

          <aside className='flex flex-col gap-2 rounded-md border border-divider p-3'>
            <span className='text-micro tracking-[0.1em] text-accent uppercase'>
              Live form state
            </span>
            <pre className='overflow-x-auto text-label text-ink/70 tabular-nums'>
              {JSON.stringify(values, null, 2)}
            </pre>
            <span className='text-label text-ink/55'>
              typeof amount: <span className='text-accent-700'>{typeof values.amount}</span>
            </span>
            <span className='mt-2 text-ui'>
              renders as <Money minorUnits={signed} signed />
            </span>
          </aside>
        </div>
      );
    };
    return <Demo />;
  },
  parameters: {
    docs: {
      description: {
        story: `Nothing in this design system imports react-hook-form. The components behave like native inputs — they forward \`ref\` and pass \`name\`, \`onChange\` and \`onBlur\` straight through — so \`{...register(...)}\` is all the wiring there is.

The money mask is the interesting case, because what the user sees and what the form holds are different things. Watch the panel on the right: the field shows \`45.99\` while \`amount\` is the number \`4599\`. That is integer minor units, exactly what the API stores, so nothing has to be converted on submit and no float ever exists to carry a rounding error.

The translation is done by \`setValueAs\`, which is RHF's public hook for it, bundled as \`moneyRegisterOptions\`. It runs on every path RHF reads a value on, so the change event and any later re-read of the DOM node land the same integer. Do not swap it for \`valueAsNumber\`: that is \`+value\` on the raw field, and \`+'10,414.68'\` is NaN.`,
      },
    },
  },
};
