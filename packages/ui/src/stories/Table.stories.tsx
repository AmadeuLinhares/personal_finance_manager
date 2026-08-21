import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../components/Button';
import { DateText } from '../components/DateText';
import { Money } from '../components/Money';
import { Pagination } from '../components/states';
import { Table, Td, Th, Tr } from '../components/Table';
import { Tag } from '../components/Tag';

const meta = {
  title: 'Patterns/Table',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

interface Row {
  date: string;
  description: string;
  category: string;
  outline?: boolean;
  amount: number;
  running: number | null;
  flag?: string;
}

const LEDGER: Row[] = [
  {
    date: '2026-08-20',
    description: 'Metro Plus',
    category: 'Groceries',
    amount: -6430,
    running: 482055,
  },
  {
    date: '2026-08-19',
    description: 'Refund · Amazon return',
    category: 'Shopping',
    amount: 4599,
    running: 488485,
  },
  {
    date: '2026-08-17',
    description: 'Hotel hold · Fairmont',
    category: 'Travel',
    amount: -74500,
    running: null,
    flag: 'pending',
  },
  {
    date: '2026-08-13',
    description: 'POS PURCHASE 8841',
    category: 'Uncategorised',
    outline: true,
    amount: -3145,
    running: 491630,
  },
  {
    date: '2026-08-10',
    description: 'Transfer to Savings',
    category: 'Transfer',
    outline: true,
    amount: -50000,
    running: 494775,
    flag: 'transfer',
  },
];

export const Ledger: StoryObj = {
  render: () => {
    const Demo = () => {
      const [page, setPage] = useState(1);
      return (
        <div>
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Category</Th>
                <Th numeric>Amount</Th>
                <Th numeric>Running balance</Th>
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((row) => (
                <Tr key={row.date}>
                  <Td numeric className='text-left'>
                    <DateText value={row.date} />
                  </Td>
                  <Td>
                    {row.description}
                    {row.flag ? (
                      <Tag variant='outline' className='ml-1.5'>
                        {row.flag}
                      </Tag>
                    ) : null}
                  </Td>
                  <Td>
                    <Tag variant={row.outline ? 'outline' : 'neutral'}>{row.category}</Tag>
                  </Td>
                  <Td numeric>
                    <Money minorUnits={row.amount} signed />
                  </Td>
                  <Td numeric className='text-ink/55'>
                    {row.running === null ? (
                      'null · pending'
                    ) : (
                      <Money minorUnits={row.running} colorInflow={false} />
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            className='mt-3'
            page={page}
            pageCount={3}
            onPageChange={setPage}
            summary='Showing 1–5 of 21 · running balance over the whole ledger'
          />
        </div>
      );
    };
    return <Demo />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Running balance needs exactly one account and a date sort, so a pending row shows `null` — an unsettled row has no defensible total. Transfer legs stay in the ledger, tagged, and drop out of reports.',
      },
    },
  },
};

export const Occurrences: StoryObj = {
  name: 'Scheduled occurrences',
  render: () => (
    <Table>
      <thead>
        <tr>
          <Th>Due</Th>
          <Th>Item</Th>
          <Th>Status</Th>
          <Th numeric>Amount</Th>
          <Th numeric />
        </tr>
      </thead>
      <tbody>
        {[
          {
            date: '2026-08-19',
            item: 'Internet · Vidéotron',
            status: 'overdue',
            variant: 'accent',
            amount: -6499,
            actions: true,
          },
          {
            date: '2026-08-31',
            item: 'Water · quarterly',
            status: 'scheduled',
            variant: 'neutral',
            amount: -9800,
            actions: true,
            note: 'anchored to the 31st — clamps in short months',
          },
          {
            date: '2026-08-29',
            item: 'Salary · Acme Studio',
            status: 'scheduled',
            variant: 'neutral',
            amount: 172500,
            actions: true,
          },
          {
            date: '2026-08-20',
            item: 'Netflix',
            status: 'posted',
            variant: 'outline',
            amount: -1699,
            actions: false,
          },
          {
            date: '2026-08-25',
            item: 'Meal kit',
            status: 'skipped',
            variant: 'outline',
            amount: -8900,
            actions: false,
          },
        ].map((row) => (
          <Tr key={row.item}>
            <Td numeric className='text-left'>
              <DateText value={row.date} />
            </Td>
            <Td>
              {row.item}
              {row.note ? (
                <span className='ml-1.5 text-label text-ink/55'>· {row.note}</span>
              ) : null}
            </Td>
            <Td>
              <Tag variant={row.variant as 'accent' | 'neutral' | 'outline'}>{row.status}</Tag>
            </Td>
            <Td numeric className={row.actions ? undefined : 'text-ink/55'}>
              <Money minorUnits={row.amount} signed />
            </Td>
            <Td numeric>
              {row.actions ? (
                <>
                  <Button variant='ghost' size='sm'>
                    Post
                  </Button>
                  <Button variant='ghost' size='sm' className='text-ink'>
                    Skip
                  </Button>
                </>
              ) : null}
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A scheduled item is a rule, not a row. Post turns one occurrence into a real transaction (the amount may differ from the estimate), Skip dismisses one date. Posted and skipped rows lose their actions; paused items never appear at all.',
      },
    },
  },
};
