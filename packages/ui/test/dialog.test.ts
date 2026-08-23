import { fireEvent, render, screen } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h, useState } from 'react';
import { test } from 'vitest';

import { Button } from '../src/components/Button.tsx';
import { Dialog } from '../src/components/Dialog.tsx';

/*
 * Focus is the part of a modal that no reviewer notices working and every
 * keyboard user notices broken, so it is what this file tests. Node's type
 * stripping does not handle JSX, hence createElement.
 *
 * NOT TESTED HERE: focus returning to the opener on close. The component does it
 * (effect cleanup calls focus() on whatever was focused before), but under
 * happy-dom, focusing a still-attached element while another subtree unmounts
 * loops forever and hangs the run — the same test with the focus() call removed
 * passes in 350ms. Verifying it needs a real browser, so it is checked by hand
 * and left out rather than deleted from the component.
 */

/** A dialog opened from a button, the way the app actually opens one. */
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
    // children goes in the props object: DialogProps requires it, so the
    // createElement overload that takes children as a rest argument does not match.
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

  // The first focusable inside the panel, not the panel itself.
  assert.equal(document.activeElement, screen.getByLabelText('Description'));
});

test('the title names the dialog', () => {
  openDialog();

  // aria-labelledby resolved: the accessible name comes from the title element,
  // which is a div and would otherwise name nothing.
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

  // Focus starts on the first control, so this is the backwards edge.
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

  assert.equal(document.activeElement, screen.getByRole('button', { name: 'Save' }));
});
