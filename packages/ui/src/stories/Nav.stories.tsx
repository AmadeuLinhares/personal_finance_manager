import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Nav, NavBrand, NavLink } from '../components/Nav';

const meta = {
  title: 'Patterns/Nav',
  component: Nav,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Nav>;

export default meta;

export const Header: StoryObj = {
  render: () => (
    <Nav>
      <NavBrand>Folio</NavBrand>
      <NavLink href='#accounts' aria-current='page'>
        Accounts
      </NavLink>
      <NavLink href='#transactions'>Transactions</NavLink>
      <NavLink href='#reports'>Reports</NavLink>
      <NavLink href='#projects'>Projects</NavLink>
    </Nav>
  ),
};
