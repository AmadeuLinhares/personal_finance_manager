import { render, screen } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { test } from 'vitest';

import { Bar } from '../src/components/Bar.tsx';
import { Card, CardBody, CardKicker, CardMeta, CardTitle } from '../src/components/Card.tsx';
import { DateText } from '../src/components/DateText.tsx';
import { Kicker } from '../src/components/Kicker.tsx';
import { Money } from '../src/components/Money.tsx';
import { Nav, NavBrand, NavLink } from '../src/components/Nav.tsx';
import { Radio } from '../src/components/Radio.tsx';
import { Segmented, SegmentedOption } from '../src/components/Segmented.tsx';
import { SummaryCard } from '../src/components/SummaryCard.tsx';
import { Table, Td, Th, Tr } from '../src/components/Table.tsx';
import { Tag } from '../src/components/Tag.tsx';
import { VisuallyHidden } from '../src/components/VisuallyHidden.tsx';

const MINUS = '−';

const firstChild = (container: HTMLElement) => {
  const element = container.firstElementChild;
  assert.ok(element);
  return element;
};

const query = (container: HTMLElement, selector: string) => {
  const element = container.querySelector(selector);
  assert.ok(element);
  return element;
};

test('Money renders minor units, and colours only money coming in', () => {
  const { container } = render(h(Money, { minorUnits: 436800 }));
  const inflow = firstChild(container);
  assert.equal(inflow.textContent, '$4,368.00');
  assert.ok(inflow.className.includes('text-accent-700'));

  const outflow = firstChild(render(h(Money, { minorUnits: -4599 })).container);
  assert.equal(outflow.textContent, `${MINUS}$45.99`);
  assert.equal(outflow.className.includes('text-accent-700'), false);
});

test('a balance is a position, so it is never coloured and never abs()d', () => {
  const { container } = render(h(Money, { minorUnits: -132600, colorInflow: false }));
  assert.equal(firstChild(container).textContent, `${MINUS}$1,326.00`);
  assert.equal(firstChild(container).className.includes('text-accent-700'), false);
});

test('Money keeps the currencies apart on screen', () => {
  const { container } = render(h(Money, { minorUnits: 240000, currency: 'USD' }));
  assert.equal(firstChild(container).textContent, 'US$2,400.00');
});

test('SummaryCard shows the figure it is given, overdrawn included', () => {
  render(
    h(SummaryCard, {
      label: 'Travel Visa',
      minorUnits: -132600,
      meta: '$3,674.00 left of the limit',
    }),
  );
  assert.ok(screen.getByText('Travel Visa'));
  assert.ok(screen.getByText(`${MINUS}$1,326.00`));
  assert.ok(screen.getByText('$3,674.00 left of the limit'));
});

test('SummaryCard drops the meta line when there is nothing to explain', () => {
  const { container } = render(h(SummaryCard, { label: 'Cash tin', minorUnits: 0 }));
  assert.equal(container.textContent, 'Cash tin$0.00');
});

test('Bar measures spend against its budget', () => {
  const { container } = render(h(Bar, { spent: 50000, budget: 100000 }));
  const segments = firstChild(container).children;
  assert.equal(segments.length, 1);
  assert.equal((segments[0] as HTMLElement).style.width, '50%');
});

test('going over budget saturates the bar instead of overflowing it', () => {
  const { container } = render(h(Bar, { spent: 200000, budget: 100000, committed: 50000 }));
  const segments = firstChild(container).children;
  assert.equal(segments.length, 1);
  assert.equal((segments[0] as HTMLElement).style.width, '100%');
  assert.ok((segments[0] as HTMLElement).className.includes('bg-accent-700'));
});

test('committed money is drawn beside the spend, never inside it', () => {
  const { container } = render(h(Bar, { spent: 25000, budget: 100000, committed: 25000 }));
  const segments = firstChild(container).children;
  assert.equal(segments.length, 2);
  assert.equal((segments[0] as HTMLElement).style.width, '25%');
  assert.equal((segments[1] as HTMLElement).style.width, '25%');
  assert.ok((segments[1] as HTMLElement).className.includes('bg-accent-300'));
});

test('an unbudgeted bar scales against its own total, and zero draws nothing', () => {
  const scaled = firstChild(render(h(Bar, { spent: 30000, committed: 10000 })).container);
  assert.equal((scaled.children[0] as HTMLElement).style.width, '75%');

  const empty = firstChild(render(h(Bar, { spent: 0 })).container);
  assert.equal((empty.children[0] as HTMLElement).style.width, '0%');
});

test('DateText is a time element carrying the machine-readable day', () => {
  const { container } = render(h(DateText, { value: '2026-08-21' }));
  const time = query(container, 'time');
  assert.equal(time.getAttribute('datetime'), '2026-08-21');
  assert.equal(time.textContent, '21 Aug');

  const withYear = render(h(DateText, { value: '2026-08-21', year: true })).container;
  assert.equal(query(withYear, 'time').textContent, '21 Aug 2026');
});

test('Tag carries its variant, and neutral is the default', () => {
  const { container } = render(h(Tag, null, 'overdue'));
  assert.ok(firstChild(container).className.includes('bg-neutral-100'));

  const accent = render(h(Tag, { variant: 'accent' }, 'over budget')).container;
  assert.ok(firstChild(accent).className.includes('bg-accent-100'));

  const outline = render(h(Tag, { variant: 'outline' }, 'planned')).container;
  assert.ok(firstChild(outline).className.includes('border-accent'));
});

test('Kicker is an h3, so it does not skip levels under a screen heading', () => {
  render(h(Kicker, null, 'Accounts'));
  assert.equal(screen.getByRole('heading', { name: 'Accounts' }).tagName, 'H3');
});

test('VisuallyHidden keeps the text in the accessibility tree', () => {
  const { container } = render(h(VisuallyHidden, null, 'available across 4 accounts'));
  assert.ok(firstChild(container).className.includes('sr-only'));
  assert.equal(container.textContent, 'available across 4 accounts');
});

test('the Card family stacks its four slots', () => {
  const { container } = render(
    h(
      Card,
      null,
      h(CardKicker, null, 'Ending balance'),
      h(CardTitle, null, '$47,177.38'),
      h(CardBody, null, 'on commitments alone'),
      h(CardMeta, null, '+$4,993.18 vs today'),
    ),
  );
  assert.equal(
    container.textContent,
    'Ending balance$47,177.38on commitments alone+$4,993.18 vs today',
  );
});

test('an elevated Card takes the shadow it asked for', () => {
  const { container } = render(h(Card, { elevation: 'md' }));
  assert.ok(firstChild(container).className.includes('shadow-md'));
});

test('a table caption is for screen readers only, and headers declare their scope', () => {
  render(
    h(
      Table,
      { caption: 'Upcoming bills and income' },
      h('thead', null, h('tr', null, h(Th, null, 'Item'), h(Th, { numeric: true }, 'Amount'))),
      h('tbody', null, h(Tr, null, h(Td, null, 'Rent'), h(Td, { numeric: true }, '−$2,150.00'))),
    ),
  );

  const table = screen.getByRole('table', { name: 'Upcoming bills and income' });
  assert.ok(query(table, 'caption').className.includes('sr-only'));

  const headers = screen.getAllByRole('columnheader');
  assert.equal(headers[0].getAttribute('scope'), 'col');
  assert.ok(headers[1].className.includes('text-right'));

  const cells = screen.getAllByRole('cell');
  assert.ok(cells[1].className.includes('tabular-nums'));
});

test('the nav marks the page you are on', () => {
  render(
    h(
      Nav,
      { 'aria-label': 'Primary' },
      h(NavBrand, null, 'Folio'),
      h(NavLink, { href: '#a', 'aria-current': 'page' }, 'Transactions'),
      h(NavLink, { href: '#b' }, 'Reports'),
    ),
  );

  assert.ok(screen.getByRole('navigation', { name: 'Primary' }));
  assert.ok(screen.getByText('Folio'));
  assert.equal(screen.getByRole('link', { current: 'page' }).textContent, 'Transactions');
});

test('a Radio is a real input wrapped by its own label', () => {
  render(h(Radio, { name: 'scope', value: 'all', defaultChecked: true, children: 'All accounts' }));
  const radio = screen.getByRole('radio', { name: 'All accounts' });
  assert.ok(radio instanceof HTMLInputElement);
  assert.equal(radio.checked, true);
  assert.equal(radio.name, 'scope');
});

test('Segmented is a named group, so the options are read as a set', () => {
  render(
    h(Segmented, {
      label: 'Horizon',
      children: [
        h(SegmentedOption, {
          key: '3',
          name: 'horizon',
          defaultChecked: true,
          children: '3 months',
        }),
        h(SegmentedOption, { key: '6', name: 'horizon', children: '6 months' }),
      ],
    }),
  );

  const group = screen.getByRole('group', { name: 'Horizon' });
  assert.equal(group.querySelectorAll('input[type=radio]').length, 2);
  const checked = screen.getByRole('radio', { name: '3 months' });
  assert.ok(checked instanceof HTMLInputElement);
  assert.equal(checked.checked, true);
});

test('an unnamed Segmented is not announced as a group at all', () => {
  const { container } = render(
    h(Segmented, { children: h(SegmentedOption, { name: 'x', children: 'One' }) }),
  );
  assert.equal(firstChild(container).getAttribute('role'), null);
});
