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
import { useForm } from 'react-hook-form';

import { TODAY } from '../mock/data';

interface ScheduleForm {
  name: string;
  amount: number;
  startDate: string;
  kind: 'bill' | 'income';
  frequency: string;
}

export interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ScheduleDialog({ open, onClose }: ScheduleDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleForm>({
    defaultValues: {
      name: '',
      amount: 0,
      startDate: TODAY,
      kind: 'bill',
      frequency: 'monthly',
    },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title='Schedule item'
      className='w-[min(480px,100%)]'
      actions={
        <>
          <Button variant='ghost' onClick={close}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={() => {
              void handleSubmit(close)();
            }}
          >
            Save item
          </Button>
        </>
      }
    >
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

        <Field label='Start date' hint='monthly items stay anchored to this day of month'>
          {(field) => <Input type='date' {...field} {...register('startDate')} />}
        </Field>

        <div>
          <span className='mb-1.5 block text-label text-ink/70'>Kind</span>
          <Segmented>
            {(['bill', 'income'] as const).map((option) => (
              <SegmentedOption key={option} value={option} {...register('kind')}>
                {option === 'bill' ? 'Bill' : 'Income'}
              </SegmentedOption>
            ))}
          </Segmented>
        </div>

        <Field label='Frequency'>
          {(field) => (
            <Select {...field} {...register('frequency')}>
              <option value='once'>Once</option>
              <option value='weekly'>Weekly</option>
              <option value='biweekly'>Biweekly</option>
              <option value='monthly'>Monthly</option>
              <option value='quarterly'>Quarterly</option>
              <option value='yearly'>Yearly</option>
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
