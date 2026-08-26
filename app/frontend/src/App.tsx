import { useState } from 'react';

import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { BalanceScope } from '@/components/BalanceScope';
import { Overview } from '@/features/overview';
import { Planning, ScheduleDialog } from '@/features/planning';
import { Reports } from '@/features/reports';
import { TransactionDialog, Transactions } from '@/features/transactions';
import { useScreenParam } from '@/hooks/useScreenParam';
import { today } from '@/utils/window';

type OpenDialog = 'transaction' | 'schedule' | null;

function App() {
  const [screen, setScreen] = useScreenParam('Overview');
  const [asOf, setAsOf] = useState(today);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const closeDialog = () => {
    setDialog(null);
  };

  return (
    <div className='flex min-h-screen flex-col'>
      <AppHeader
        screen={screen}
        onScreenChange={setScreen}
        scope={<BalanceScope value={asOf} onChange={setAsOf} />}
        onNewTransaction={() => {
          setDialog('transaction');
        }}
      />

      <main className='mx-auto w-full max-w-[1240px] px-4 pt-6 pb-8'>
        {screen === 'Overview' ? <Overview asOf={asOf} onGo={setScreen} /> : null}
        {screen === 'Transactions' ? <Transactions /> : null}
        {screen === 'Reports' ? <Reports /> : null}
        {screen === 'Planning' ? (
          <Planning
            onSchedule={() => {
              setDialog('schedule');
            }}
          />
        ) : null}
      </main>

      <AppFooter />

      <TransactionDialog open={dialog === 'transaction'} onClose={closeDialog} />
      <ScheduleDialog open={dialog === 'schedule'} onClose={closeDialog} />
    </div>
  );
}

export default App;
