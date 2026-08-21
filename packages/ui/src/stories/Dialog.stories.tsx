import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Field, Input, Select } from '../components/Field';
import { Segmented, SegmentedOption } from '../components/Segmented';
import { Notice } from '../components/states';

const meta = {
  title: 'Patterns/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;

export const NewTransfer: StoryObj = {
  name: 'New transfer',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Button
            variant='primary'
            onClick={() => {
              setOpen(true);
            }}
          >
            New transfer
          </Button>
          <Dialog
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            title='New transfer'
            actions={
              <>
                <Button
                  variant='ghost'
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button variant='primary'>Save</Button>
              </>
            }
          >
            <div className='mb-3'>
              <span className='mb-1.5 block text-label text-ink/70'>Kind</span>
              <Segmented>
                <SegmentedOption name='dialog-kind'>Expense</SegmentedOption>
                <SegmentedOption name='dialog-kind'>Income</SegmentedOption>
                <SegmentedOption name='dialog-kind' defaultChecked>
                  Transfer
                </SegmentedOption>
              </Segmented>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <Field label='From account'>
                {(props) => (
                  <Select {...props}>
                    <option>Everyday Chequing · CAD</option>
                  </Select>
                )}
              </Field>
              <Field label='To account'>
                {(props) => (
                  <Select {...props}>
                    <option>USD Chequing · USD</option>
                  </Select>
                )}
              </Field>
              <Field label='Amount ($)'>
                {(props) => (
                  <Input className='text-right tabular-nums' defaultValue='500.00' {...props} />
                )}
              </Field>
              <Field label='Date'>
                {(props) => <Input type='date' defaultValue='2026-08-21' {...props} />}
              </Field>
            </div>
            <Notice className='mt-3'>
              UNSUPPORTED_OPERATION — cross-currency transfers are refused (no FX rates).
            </Notice>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A transfer is two transactions sharing a transferId, one per leg — so the dialog only collects the positive magnitude and the two accounts. Escape and a backdrop click both close it.',
      },
    },
  },
};
