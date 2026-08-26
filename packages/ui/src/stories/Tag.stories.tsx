import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Tag } from '../components/Tag';

const meta = {
  title: 'Primitives/Tag',
  component: Tag,
  args: { children: 'Groceries' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['accent', 'accent2', 'neutral', 'outline'] },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Roles: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='mr-1 text-label text-ink/70'>needs attention:</span>
        <Tag variant='accent'>Income</Tag>
        <Tag variant='accent'>overdue</Tag>
        <Tag variant='accent'>Active</Tag>
        <Tag variant='accent'>over budget</Tag>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='mr-1 text-label text-ink/70'>categories:</span>
        <Tag>Groceries</Tag>
        <Tag>Housing</Tag>
        <Tag>scheduled</Tag>
        <Tag>Completed</Tag>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='mr-1 text-label text-ink/70'>metadata:</span>
        <Tag variant='outline'>pending</Tag>
        <Tag variant='outline'>transfer</Tag>
        <Tag variant='outline'>Uncategorised</Tag>
        <Tag variant='outline'>posted</Tag>
        <Tag variant='outline'>skipped</Tag>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Accent marks what needs attention, neutral marks categories, outline marks metadata. The variant carries the meaning, so the same word can be either depending on what it is doing.',
      },
    },
  },
};
