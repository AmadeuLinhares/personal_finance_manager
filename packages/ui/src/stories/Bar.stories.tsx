import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Bar } from '../components/Bar';
import { Money } from '../components/Money';
import { Tag } from '../components/Tag';

const meta = {
  title: 'Data/Bar',
  component: Bar,
  args: { spent: 20640, budget: 60000 },
} satisfies Meta<typeof Bar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const CategoryVsBudget: Story = {
  name: 'Category vs budget',
  render: () => (
    <div className='md:grid-cols-2 grid max-w-[900px] gap-6'>
      <div>
        <div className='mb-1.5 flex justify-between gap-2 text-ui'>
          <span>Groceries</span>
          <span>
            <Money minorUnits={20640} colorInflow={false} />{' '}
            <span className='text-ink/70'>of $600.00 budget</span>
          </span>
        </div>
        <Bar spent={20640} budget={60000} />
        <div className='mt-1.5 text-label text-ink/70'>track neutral-200 · mark accent-500</div>
      </div>
      <div>
        <div className='mb-1.5 flex justify-between gap-2 text-ui'>
          <span>
            Housing{' '}
            <Tag variant='accent' className='ml-1'>
              over budget
            </Tag>
          </span>
          <span>
            <Money minorUnits={215000} colorInflow={false} />{' '}
            <span className='text-ink/70'>of $2,000.00</span>
          </span>
        </div>
        <Bar spent={215000} budget={200000} />
        <div className='mt-1.5 text-label text-ink/70'>
          saturates at 100% in accent-700 rather than overflowing
        </div>
      </div>
    </div>
  ),
};

export const SpentPlusCommitted: Story = {
  name: 'Spent + committed',
  render: () => (
    <div className='md:grid-cols-2 grid max-w-[900px] gap-6'>
      <div>
        <div className='mb-1.5 flex justify-between gap-2 text-ui-sm'>
          <span className='text-ink/70'>$31,606.50 of $34,000.00 budget</span>
          <span className='tabular-nums'>94%</span>
        </div>
        <Bar spent={3160650} budget={3400000} committed={30000} size='sm' />
      </div>
      <div>
        <div className='mb-1.5 flex justify-between gap-2 text-ui-sm'>
          <span className='text-ink/70'>$1,180.00 of $3,500.00 budget</span>
          <span className='tabular-nums'>40%</span>
        </div>
        <Bar spent={118000} budget={350000} committed={22000} size='sm' />
        <div className='mt-1.5 text-label text-ink/70 tabular-nums'>
          committed $220.00 · projected total $1,400.00
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The lighter accent-300 segment is money that is scheduled but not yet posted. It has to read differently from accent-500 because a forecast is not an actual — the projection seam is exactly where a chart can lie.',
      },
    },
  },
};
