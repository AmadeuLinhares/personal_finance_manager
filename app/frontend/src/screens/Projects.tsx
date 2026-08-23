import {
  Bar,
  Button,
  Card,
  CardTitle,
  DateText,
  Divider,
  Money,
  Tag,
  type TagProps,
} from '@pfm/ui';
import { Plus } from 'lucide-react';

import { type ProjectStatus, PROJECTS } from '../mock/data';

const STATUS_VARIANT: Record<ProjectStatus, NonNullable<TagProps['variant']>> = {
  active: 'accent',
  planned: 'outline',
  completed: 'neutral',
};

export interface ProjectsProps {
  onNewProject: () => void;
  onViewTransactions: () => void;
}

export function Projects({ onNewProject, onViewTransactions }: ProjectsProps) {
  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Projects</h2>
          <p className='max-w-[620px] text-ui-sm text-pretty text-ink/55'>
            A label with a budget, not a container — spending stays in its account&apos;s ledger
          </p>
        </div>
        <Button variant='primary' className='whitespace-nowrap' onClick={onNewProject}>
          <Plus className='size-3.5' aria-hidden='true' />
          New project
        </Button>
      </div>

      <Divider />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {PROJECTS.map((project) => {
          const projected = project.spent + project.committed;
          const percent = Math.round((projected / project.budget) * 100);
          return (
            <Card key={project.id} className='gap-3'>
              <div className='flex items-baseline justify-between gap-2'>
                <CardTitle className='text-[22px]'>{project.name}</CardTitle>
                <Tag variant={STATUS_VARIANT[project.status]} className='whitespace-nowrap'>
                  {project.status}
                </Tag>
              </div>

              <div>
                <div className='mb-1.5 flex justify-between gap-2 text-ui-sm'>
                  <span className='text-ink/55'>
                    <Money minorUnits={project.spent} colorInflow={false} /> of{' '}
                    <Money minorUnits={project.budget} colorInflow={false} /> budget
                  </span>
                  <span className='whitespace-nowrap tabular-nums'>{percent}%</span>
                </div>
                <Bar
                  spent={project.spent}
                  budget={project.budget}
                  committed={project.committed}
                  size='sm'
                />
                <p className='mt-1.5 text-label text-ink/55 tabular-nums'>
                  committed <Money minorUnits={project.committed} colorInflow={false} /> · projected{' '}
                  <Money minorUnits={projected} colorInflow={false} />
                </p>
              </div>

              <ul className='flex flex-col'>
                {project.recent.map((expense) => (
                  <li
                    key={`${expense.date}-${expense.label}`}
                    className='flex justify-between gap-2 border-b border-divider py-2 text-ui'
                  >
                    <span>
                      <DateText value={expense.date} className='text-ink/55' /> · {expense.label}
                    </span>
                    <Money minorUnits={expense.amount} colorInflow={false} />
                  </li>
                ))}
              </ul>

              <button
                type='button'
                className='cursor-pointer self-start text-ui-sm text-accent hover:text-accent-600'
                onClick={onViewTransactions}
              >
                All {project.transactionCount} transactions →
              </button>
            </Card>
          );
        })}
      </div>
    </>
  );
}
