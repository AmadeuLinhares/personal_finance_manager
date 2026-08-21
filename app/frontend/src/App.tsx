import { EmptyState, Kicker, Nav, NavBrand, NavLink } from '@pfm/ui';

/**
 * The app shell. The component reference lives in Storybook now
 * (`pnpm storybook`), so this stays a shell until the real screens land — it is
 * here to prove the design system renders in the app, nothing more.
 */
function App() {
  return (
    <>
      <Nav>
        <NavBrand>Folio</NavBrand>
        <NavLink href='#accounts' aria-current='page'>
          Accounts
        </NavLink>
        <NavLink href='#transactions'>Transactions</NavLink>
        <NavLink href='#reports'>Reports</NavLink>
        <NavLink href='#projects'>Projects</NavLink>
      </Nav>
      <main className='mx-auto max-w-[1100px] px-4 py-8'>
        <Kicker>Personal Finance Manager</Kicker>
        <h1 className='mt-1.5 mb-4 font-heading text-h1 font-semibold'>Accounts</h1>
        <EmptyState
          title='No screens built yet'
          description='The API is on port 4000 and the design system is browsable with pnpm storybook.'
        />
      </main>
    </>
  );
}

export default App;
