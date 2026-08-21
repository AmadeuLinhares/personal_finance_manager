import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Card, CardBody, CardKicker, CardMeta, CardTitle } from '../components/Card';
import { SummaryCard } from '../components/SummaryCard';

const meta = {
  title: 'Primitives/Card',
  component: Card,
  argTypes: { elevation: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] } },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Anatomy: Story = {
  args: { elevation: 'none' },
  render: (args) => (
    <div className='max-w-[320px]'>
      <Card {...args}>
        <CardKicker>Chequing · Banque Nationale</CardKicker>
        <CardTitle>Everyday Chequing</CardTitle>
        <CardBody>Bordered and unfilled — cards are never filled with accent.</CardBody>
        <CardMeta>370 transactions · CAD</CardMeta>
      </Card>
    </div>
  ),
};

export const Balances: Story = {
  render: () => (
    <div className='md:grid-cols-3 grid gap-3'>
      <SummaryCard
        label='Chequing · Banque Nationale'
        minorUnits={482055}
        meta='posted · no pending activity'
      />
      <SummaryCard
        label='Credit card · Travel Rewards Visa'
        minorUnits={-701622}
        meta='pending −$745.00 · available credit $7,983.78'
      />
      <SummaryCard
        label='USD Chequing'
        minorUnits={133518}
        currency='USD'
        meta='own total, own reports — never summed with CAD'
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Balances are derived, never stored. Negative is honest — overdrawn, or owed on a card — so the figure is never abs()-ed, and inflow colouring is off because a balance is a position, not a movement. The second card is the one to look at: the headline is `available`, and the meta line carries the decomposition.',
      },
    },
  },
};
