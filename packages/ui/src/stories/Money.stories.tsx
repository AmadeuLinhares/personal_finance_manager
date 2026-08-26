import { type Meta, type StoryObj } from '@storybook/react-vite';

import { DateText } from '../components/DateText';
import { Money } from '../components/Money';

const meta = {
  title: 'Data/Money & dates',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

export const Amounts: StoryObj = {
  render: () => (
    <table className='text-ui'>
      <tbody>
        {[
          [-4599, 'a normal expense', false],
          [4599, 'a refund — an inflow even in an expense category', true],
          [320000, 'salary', true],
          [0, 'a zero-amount reversal; these exist in the seed', false],
          [-1850000, 'the $18,500 outlier', false],
        ].map(([minor, note, signed]) => (
          <tr key={String(minor) + String(note)}>
            <td className='py-1 pr-4 text-right'>
              <Money minorUnits={minor as number} signed={signed as boolean} />
            </td>
            <td className='py-1 pr-4 text-label text-ink/70 tabular-nums'>
              stored as {String(minor)}
            </td>
            <td className='py-1 text-ui-sm text-ink/70'>{note as string}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Money is an integer number of minor units. The component takes cents, never a float, and renders a real minus sign (U+2212) so a column of figures stays aligned. Inflows are accent-700; outflows stay ink, because the sign already carries direction.',
      },
    },
  },
};

export const Currencies: StoryObj = {
  render: () => (
    <div className='flex flex-col gap-2 text-ui'>
      <span>
        <Money minorUnits={1041468} colorInflow={false} />{' '}
        <span className='text-ink/70'>CAD · the default scope</span>
      </span>
      <span>
        <Money minorUnits={133518} currency='USD' colorInflow={false} />{' '}
        <span className='text-ink/70'>USD · own total, own reports</span>
      </span>
      <span className='mt-2 text-ui-sm text-ink/70'>
        No exchange rates exist. The symbols differ so two totals can never be mistaken for one
        scope, and a cross-currency transfer is refused rather than guessed.
      </span>
    </div>
  ),
};

export const Dates: StoryObj = {
  render: () => (
    <div className='flex flex-col gap-2 text-ui'>
      <span className='tabular-nums'>
        2026-08-21 → <DateText value='2026-08-21' />
      </span>
      <span className='tabular-nums'>
        2026-01-05 → <DateText value='2026-01-05' year />
      </span>
      <span className='mt-2 max-w-[560px] text-ui-sm text-ink/70'>
        A transaction happens on a day, not at an instant. These are parsed by splitting the string:
        <span className='italic'> new Date(&apos;2026-08-21&apos;)</span> is UTC midnight and
        renders as the 20th anywhere west of Greenwich.
      </span>
    </div>
  ),
};
