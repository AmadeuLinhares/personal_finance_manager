import { Notice, Tag } from '@pfm/ui';
import { useState } from 'react';

import { AppFooter } from './app/AppFooter';
import { AppHeader } from './app/AppHeader';
import { IMPLEMENTED_SCREENS, type Screen } from './app/screens';
import { ProjectDialog } from './dialogs/ProjectDialog';
import { ScheduleDialog } from './dialogs/ScheduleDialog';
import { TransactionDialog } from './dialogs/TransactionDialog';
import { Overview } from './screens/Overview';
import { Planning } from './screens/Planning';
import { Projects } from './screens/Projects';
import { Reports } from './screens/Reports';
import { Transactions } from './screens/Transactions';

type OpenDialog = 'transaction' | 'schedule' | 'project' | null;

/**
 * The app shell.
 *
 * Screens are switched from local state rather than a router — layout only, so
 * there is nothing to deep-link to yet. A router is the first thing to add once
 * the screens read from the API.
 */
function App() {
  const [screen, setScreen] = useState<Screen>('Overview');
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const closeDialog = () => {
    setDialog(null);
  };

  return (
    <div className='flex min-h-screen flex-col'>
      <AppHeader
        screen={screen}
        onScreenChange={setScreen}
        scope='August 2026 · CAD'
        onNewTransaction={() => {
          setDialog('transaction');
        }}
      />

      <main className='mx-auto w-full max-w-[1240px] px-4 pt-6 pb-8'>
        {IMPLEMENTED_SCREENS.includes(screen) ? null : (
          <Notice variant='muted' className='mb-4'>
            <Tag variant='outline' className='mr-2'>
              not implemented
            </Tag>
            Layout only — this screen still reads from fixtures. Transactions, Reports and Planning
            are the ones wired to the API.
          </Notice>
        )}

        {screen === 'Overview' ? <Overview onGo={setScreen} /> : null}
        {screen === 'Transactions' ? <Transactions /> : null}
        {screen === 'Reports' ? <Reports /> : null}
        {screen === 'Planning' ? (
          <Planning
            onSchedule={() => {
              setDialog('schedule');
            }}
          />
        ) : null}
        {screen === 'Projects' ? (
          <Projects
            onNewProject={() => {
              setDialog('project');
            }}
            onViewTransactions={() => {
              setScreen('Transactions');
            }}
          />
        ) : null}
      </main>

      <AppFooter />

      <TransactionDialog open={dialog === 'transaction'} onClose={closeDialog} />
      <ScheduleDialog open={dialog === 'schedule'} onClose={closeDialog} />
      <ProjectDialog open={dialog === 'project'} onClose={closeDialog} />
    </div>
  );
}

export default App;
