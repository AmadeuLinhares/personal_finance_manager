import { twMerge } from 'tailwind-merge';

/** Merge class names with Tailwind conflict resolution, so a caller's
 * `className` beats the component's own class instead of both landing in the
 * attribute and the later one winning by accident. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(' '));
}
