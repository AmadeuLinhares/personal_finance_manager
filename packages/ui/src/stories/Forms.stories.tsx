import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field, Input, Select, Textarea } from '../components/Field';
import { Radio } from '../components/Radio';
import { Segmented, SegmentedOption } from '../components/Segmented';

const meta = {
  title: 'Primitives/Forms',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const Fields: StoryObj = {
  render: () => (
    <div className='md:grid-cols-3 grid max-w-[900px] gap-4'>
      <Field label='Description'>
        {(props) => <Input placeholder='e.g. Metro Plus' {...props} />}
      </Field>
      <Field label='Amount ($)' hint='stored as integer minor units (cents)'>
        {(props) => (
          <Input
            className='text-right tabular-nums'
            inputMode='decimal'
            placeholder='0.00'
            {...props}
          />
        )}
      </Field>
      <Field label='Account'>
        {(props) => (
          <Select {...props}>
            <option>Everyday Chequing · CAD</option>
            <option>Travel Rewards Visa · CAD</option>
            <option>USD Chequing · USD</option>
          </Select>
        )}
      </Field>
      <Field label='Date'>
        {(props) => <Input type='date' defaultValue='2026-08-21' {...props} />}
      </Field>
      <Field label='Frequency' hint="monthly items anchor to the start date's day of month">
        {(props) => (
          <Select {...props}>
            <option>Once</option>
            <option>Weekly</option>
            <option>Biweekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </Select>
        )}
      </Field>
      <Field label='Note'>{(props) => <Textarea placeholder='Optional' {...props} />}</Field>
    </div>
  ),
};

export const ErrorState: StoryObj = {
  name: 'Field error',
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState('45,9.9');
      return (
        <div className='max-w-[360px]'>
          <Field
            label='Amount ($)'
            error='VALIDATION_ERROR — must convert to integer minor units, e.g. 45.99 → 4599'
          >
            {(props) => (
              <Input
                className='text-right tabular-nums'
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                }}
                {...props}
              />
            )}
          </Field>
        </div>
      );
    };
    return <Demo />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Field errors surface the API's own vocabulary — VALIDATION_ERROR, CURRENCY_MISMATCH, UNSUPPORTED_OPERATION — in accent-800. There is no red in this palette. Setting `error` also marks the control aria-invalid, which is what draws the accent-700 border.",
      },
    },
  },
};

export const Choices: StoryObj = {
  render: () => (
    <div className='flex flex-col gap-6'>
      <div>
        <span className='mb-1.5 block text-label text-ink/70'>Kind</span>
        <Segmented>
          <SegmentedOption name='kind' defaultChecked>
            Expense
          </SegmentedOption>
          <SegmentedOption name='kind'>Income</SegmentedOption>
          <SegmentedOption name='kind'>Transfer</SegmentedOption>
        </Segmented>
      </div>
      <div>
        <span className='mb-1.5 block text-label text-ink/70'>Status</span>
        <div className='flex gap-4'>
          <Radio name='status' defaultChecked>
            Posted
          </Radio>
          <Radio name='status'>Pending</Radio>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Both are native inputs, visually replaced with CSS. No script, no state to manage — selection lives in the radio group.',
      },
    },
  },
};
