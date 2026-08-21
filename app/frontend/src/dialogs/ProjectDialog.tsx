import { Button, Dialog, Field, Input, Select, moneyRegisterOptions } from '@pfm/ui';
import { useForm } from 'react-hook-form';

interface ProjectForm {
  name: string;
  budget: number;
  status: 'active' | 'planned';
}

export interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectDialog({ open, onClose }: ProjectDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectForm>({
    defaultValues: { name: '', budget: 0, status: 'active' },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title='New project'
      className='w-[min(440px,100%)]'
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
            Create project
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Field label='Name' className='sm:col-span-2' error={errors.name?.message}>
          {(field) => (
            <Input
              placeholder='e.g. Bathroom renovation'
              {...field}
              {...register('name', { required: 'VALIDATION_ERROR — name is required' })}
            />
          )}
        </Field>

        <Field label='Budget' error={errors.budget?.message}>
          {(field) => (
            <Input
              mask='money'
              prefix='$'
              placeholder='0.00'
              {...field}
              {...register('budget', {
                ...moneyRegisterOptions,
                min: { value: 1, message: 'VALIDATION_ERROR — budget must be greater than zero' },
              })}
            />
          )}
        </Field>

        <Field label='Status'>
          {(field) => (
            <Select {...field} {...register('status')}>
              <option value='active'>Active</option>
              <option value='planned'>Planned</option>
            </Select>
          )}
        </Field>
      </div>
    </Dialog>
  );
}
