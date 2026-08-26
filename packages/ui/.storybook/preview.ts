import { color } from '@pfm/tokens';
import { type Preview } from '@storybook/react-vite';

import './preview.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: ['Foundations', 'Primitives', 'Data', 'Feedback', 'Patterns'],
      },
    },
    backgrounds: {
      options: {
        ground: { name: 'Ground (bg)', value: color.bg },
        surface: { name: 'Surface', value: color.surface },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'ground' },
  },
};

export default preview;
