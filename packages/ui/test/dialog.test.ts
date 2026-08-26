import { fireEvent, render, screen } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h, useState } from 'react';
import { test } from 'vitest';

import { Button } from '../src/components/Button.tsx';
import { Dialog } from '../src/components/Dialog.tsx';

function Harness() {
  const [open, setOpen] = useState(false);

  return h('div', null, [
    h(
      Button,
      {
        key: 'opener',
        onClick: () => {
          setOpen(true);
        },
      },
      'Open',
    ),
    h(Dialog, {
      key: 'dialog',
      open,
      onClose: () => {
        setOpen(false);
      },
      title: 'New transaction',
      actions: h(Button, {}, 'Save'),
      children: h('input', { 'aria-label': 'Description' }),
    }),
  ]);
}

function openDialog() {
  render(h(Harness));
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
}

test('focus moves into the dialog on open', () => {
  openDialog();

  assert.equal(document.activeElement, screen.getByLabelText('Description'));
});

test('the title names the dialog', () => {
  openDialog();

  assert.ok(screen.getByRole('dialog', { name: 'New transaction' }));
});

test('Tab from the last control wraps to the first', () => {
  openDialog();

  screen.getByRole('button', { name: 'Save' }).focus();
  fireEvent.keyDown(document, { key: 'Tab' });

  assert.equal(document.activeElement, screen.getByLabelText('Description'));
});

test('Shift+Tab from the first control wraps to the last', () => {
  openDialog();

  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

  assert.equal(document.activeElement, screen.getByRole('button', { name: 'Save' }));
});
