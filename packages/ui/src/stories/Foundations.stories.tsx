import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Divider } from '../components/Dialog';
import { Kicker } from '../components/Kicker';

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

// Literal class strings: Tailwind scans source text, so `bg-accent-${step}`
// would generate nothing at all.
const ACCENT_RAMP = [
  ['100', 'bg-accent-100'],
  ['200', 'bg-accent-200'],
  ['300', 'bg-accent-300'],
  ['400', 'bg-accent-400'],
  ['500', 'bg-accent-500'],
  ['600', 'bg-accent-600'],
  ['700', 'bg-accent-700'],
  ['800', 'bg-accent-800'],
  ['900', 'bg-accent-900'],
] as const;

const NEUTRAL_RAMP = [
  ['100', 'bg-neutral-100'],
  ['200', 'bg-neutral-200'],
  ['300', 'bg-neutral-300'],
  ['400', 'bg-neutral-400'],
  ['500', 'bg-neutral-500'],
  ['600', 'bg-neutral-600'],
  ['700', 'bg-neutral-700'],
  ['800', 'bg-neutral-800'],
  ['900', 'bg-neutral-900'],
] as const;

const RADII = [
  ['sm', 'rounded-sm'],
  ['md', 'rounded-md'],
  ['lg', 'rounded-lg'],
] as const;

const SHADOWS = [
  ['sm', 'shadow-sm'],
  ['md', 'shadow-md'],
  ['lg', 'shadow-lg'],
] as const;

function Swatch({ className, label, hex }: { className: string; label: string; hex?: string }) {
  return (
    <div>
      <div className={`h-14 rounded-md border border-divider ${className}`} />
      <div className='mt-1.5 text-ui-sm'>{label}</div>
      {hex ? <div className='text-label text-ink/55 tabular-nums'>{hex}</div> : null}
    </div>
  );
}

export const Color: StoryObj = {
  render: () => (
    <div>
      <Kicker>Ground</Kicker>
      <Divider className='mt-2 mb-4' />
      <div className='md:grid-cols-4 grid grid-cols-2 gap-3'>
        <Swatch className='bg-bg' label='bg' hex='#f3f2f2' />
        <Swatch className='bg-surface' label='surface' hex='#eae9e9' />
        <Swatch className='bg-ink' label='ink' hex='#201f1d' />
        <Swatch className='bg-accent' label='accent (brand)' hex='#b68235' />
      </div>

      <Kicker className='mt-8'>Accent ramp</Kicker>
      <Divider className='mt-2 mb-4' />
      <div className='grid grid-cols-9 gap-1'>
        {ACCENT_RAMP.map(([step, className]) => (
          <div key={step}>
            <div className={`h-10 rounded-sm ${className}`} />
            <div className='mt-1 text-label text-ink/55 tabular-nums'>{step}</div>
          </div>
        ))}
      </div>

      <Kicker className='mt-8'>Neutral ramp</Kicker>
      <Divider className='mt-2 mb-4' />
      <div className='grid grid-cols-9 gap-1'>
        {NEUTRAL_RAMP.map(([step, className]) => (
          <div key={step}>
            <div className={`h-10 rounded-sm border border-divider ${className}`} />
            <div className='mt-1 text-label text-ink/55 tabular-nums'>{step}</div>
          </div>
        ))}
      </div>

      <p className='mt-4 max-w-[680px] text-ui-sm text-ink/55'>
        100–300 tinted fills and hovers · 500 base · 700–900 text on tints and pressed states.
        Inflows use accent-700; outflows stay ink. Committed (future) money uses accent-300 against
        spent money&apos;s accent-500. There is no red in this palette — attention is carried by the
        deep accent steps.
      </p>
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className='grid max-w-[900px] grid-cols-[220px_1fr] items-baseline gap-y-3'>
      <span className='text-label text-ink/55'>display · 400 · 64px</span>
      <span className='font-normal font-heading text-display tabular-nums'>$10,414.68</span>
      <span className='text-label text-ink/55'>h1 · 600 · 42px</span>
      <span className='font-semibold font-heading text-h1'>Expenses by category</span>
      <span className='text-label text-ink/55'>h2 · 600 · 32px</span>
      <span className='font-semibold font-heading text-h2'>Transactions</span>
      <span className='text-label text-ink/55'>h6 kicker · 13px caps</span>
      <Kicker>Budget projection</Kicker>
      <span className='text-label text-ink/55'>body · Lora · 15px</span>
      <span className='text-body'>
        A smaller, well-reasoned slice is worth more than a broad, shallow one.
      </span>
      <span className='text-label text-ink/55'>figures · tabular</span>
      <span className='tabular-nums'>1,024.00 · 86.40 · 342 — equal-width, for every column</span>
    </div>
  ),
};

export const SpacingAndElevation: StoryObj = {
  name: 'Spacing, radii, elevation',
  render: () => (
    <div>
      <p className='mb-4 max-w-[680px] text-ui-sm text-ink/55'>
        The whole scale is one token: <span className='italic'>--spacing: 4.6px</span>. Steps
        1·2·3·4·6·8 reproduce the design system&apos;s 4.6 · 9.2 · 13.8 · 18.4 · 27.6 · 36.8
        exactly.
      </p>
      <div className='flex flex-wrap items-end gap-4'>
        {[1, 2, 3, 4, 6, 8].map((step) => (
          <div key={step}>
            <div className='bg-accent-400' style={{ width: step * 4.6, height: step * 4.6 }} />
            <div className='mt-1 text-label text-ink/55 tabular-nums'>
              {step} · {(step * 4.6).toFixed(1)}
            </div>
          </div>
        ))}
        <div className='w-6' />
        {RADII.map(([size, className]) => (
          <div key={size}>
            <div className={`h-9 w-14 border border-ink ${className}`} />
            <div className='mt-1 text-label text-ink/55'>radius {size}</div>
          </div>
        ))}
        <div className='w-6' />
        {SHADOWS.map(([size, className]) => (
          <div key={size}>
            <div className={`h-11 w-[72px] rounded-md border border-divider bg-bg ${className}`} />
            <div className='mt-1 text-label text-ink/55'>shadow {size}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
