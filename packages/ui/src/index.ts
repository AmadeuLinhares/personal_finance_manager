/**
 * Classical design system — the public surface.
 *
 * Everything here is built from @pfm/tokens. A consumer imports components from
 * this module and the stylesheet from '@pfm/ui/styles.css'.
 *
 * This file is the package's `exports` entry: we ship source, not a build. Before
 * adding a build step, read "Decision: this package ships source, not a build" in
 * README.md — Tailwind's @source scan depends on src/ being what actually ships.
 */

export { Bar, type BarProps } from './components/Bar';
export { Button, type ButtonProps } from './components/Button';
export { Card, CardBody, CardKicker, CardMeta, CardTitle, type CardProps } from './components/Card';
export { DatePicker, type DatePickerProps } from './components/DatePicker';
export { DateText, type DateTextProps } from './components/DateText';
export { Dialog, Divider, type DialogProps } from './components/Dialog';
export {
  Field,
  Input,
  Select,
  Textarea,
  type FieldControlProps,
  type FieldProps,
  type InputProps,
} from './components/Field';
export { Kicker } from './components/Kicker';
export { Money, type MoneyProps } from './components/Money';
export { Nav, NavBrand, NavLink } from './components/Nav';
export { Radio, type RadioProps } from './components/Radio';
export {
  Segmented,
  SegmentedOption,
  type SegmentedOptionProps,
  type SegmentedProps,
} from './components/Segmented';
export { SummaryCard, type SummaryCardProps } from './components/SummaryCard';
export { Table, Td, Th, Tr, type CellProps, type TableProps } from './components/Table';
export { Tag, type TagProps } from './components/Tag';
export { TrendChart, type TrendChartProps, type TrendPoint } from './components/TrendChart';
export { VisuallyHidden } from './components/VisuallyHidden';
export { EmptyState, ErrorState, Notice, Pagination, Skeleton } from './components/states';

export { cn } from './lib/cn';
export { composeRefs } from './lib/composeRefs';
export {
  coerceMoneyDisplay,
  formatMoneyInput,
  isValueTransformMask,
  maskDefinitions,
  moneyRegisterOptions,
  parseMoneyInput,
  valueTransformMasks,
  type CharacterMask,
  type MaskName,
  type ValueTransformMaskName,
} from './lib/masks';
export {
  formatDate,
  formatMonth,
  formatMoney,
  inputToMinor,
  isBefore,
  minorToInput,
  parseIsoDate,
  toIsoDate,
  toIsoMonth,
  type Currency,
} from './lib/format';
