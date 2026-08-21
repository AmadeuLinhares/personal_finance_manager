import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Button } from '../components/Button';
import { Card, CardMeta } from '../components/Card';
import { EmptyState, ErrorState, Notice, Skeleton } from '../components/states';

const meta = {
  title: 'Feedback/States',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const All: StoryObj = {
  name: 'Loading, empty, error, partial',
  render: () => (
    <div className='md:grid-cols-2 grid gap-4'>
      <Card>
        <CardMeta>loading · skeleton</CardMeta>
        <Skeleton lines={3} />
      </Card>
      <EmptyState
        title='No transactions match'
        description='Try a wider date range or clear filters.'
        action={<Button variant='ghost'>Clear filters</Button>}
      />
      <ErrorState
        title="Couldn't load transactions"
        description="The server didn't respond. Your balances may be out of date."
        onRetry={() => undefined}
      />
      <div className='flex flex-col gap-2'>
        <Notice action={<a href='#review'>Review</a>}>
          2 of 3 imported · 1 failed: amount must be integer minor units.
        </Notice>
        <Notice variant='muted'>
          Excluded from this report: 2 transfer legs · 1 other-currency
        </Notice>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The API can fail and be slow on demand (`?__latency=`, `?__error=`), and bulk writes answer 207 with a per-item errors[]. These four are what the app owes the user in each of those cases. The muted Notice is the honest footnote: a report that dropped rows says how many.',
      },
    },
  },
};

export const Loading: StoryObj = {
  render: () => <Skeleton lines={5} className='max-w-[420px]' />,
};
