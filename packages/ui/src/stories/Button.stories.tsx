import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';

import { Button } from '../components/Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Save transaction' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { variant: 'primary' } };

export const Variants: Story = {
  render: () => (
    <div className='flex flex-wrap items-center gap-3'>
      <Button variant='primary'>Primary · outline</Button>
      <Button variant='secondary'>Secondary</Button>
      <Button variant='ghost'>Ghost</Button>
      <Button variant='ghost' size='sm'>
        Row action (Post / Skip)
      </Button>
      <Button variant='primary' disabled>
        Disabled
      </Button>
      <Button variant='secondary' icon aria-label='Add transaction'>
        <Plus className='size-3.5' aria-hidden='true' />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Primary is an accent outline, never a fill — the system draws with strokes. Hover and pressed states are accent tints from the ramp, never browser defaults.',
      },
    },
  },
};

export const Block: Story = {
  render: () => (
    <div className='max-w-[320px]'>
      <Button variant='primary' block>
        Save
      </Button>
    </div>
  ),
};
