/*eslint-env node*/

/* eslint-disable @typescript-eslint/no-require-imports */
const plugin = require('tailwindcss/plugin');
const negateValue = require('tailwindcss/lib/util/negateValue').default;
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * @type {import("tailwindcss/tailwind-config").TailwindConfig}
 */
module.exports = {
  darkMode: 'media',
  theme: {
    extend: {
      boxShadow: {
        'no-top': '0 1px 0px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        menu: '0px 6.7px 32px 0px rgba(0, 0, 0, 0.02), 0px 2.3px 5.55px 0px rgba(0, 0, 0, 0.05), 0px 0.652px 1.75px 0px rgba(0, 0, 0, 0.02), 0px -0.044px 0.882px 0px rgba(0, 0, 0, 0.05)',
        onboarding: '0px 2px 2px 0px rgba(0, 0, 0, 0.15)',
        card: '0px 2px 2px 0px rgba(0, 0, 0, 0.05)',
        inner: '0px 2px 4px 0px rgba(0, 0, 0, 0.05) inset',
      },
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        'animate-height-closed': '0fr',
        'animate-height-open': '1fr',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
      },
      animation: {
        'ping-slow': 'ping 6s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
    fontFamily: {
      'sangbleu-republic': 'SangBleuRepublic',
      'helvetica-neue': ['"Helvetica Neue"', 'Helvetica', 'Arial', '"Lucida Grande"', 'sans-serif'],
    },
    screens: {
      tablet: '768px',
      laptop: '1024px',
      desktop: '1280px',
      monitor: '1440px',
      '2xl': '1536px',
    },
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      'semi-transparent': '#00000014',
      black: '#000000',
      white: '#FFFFFF',
      gray: {
        1100: '#1A1919',
        1000: '#252525',
        900: '#313131',
        800: '#3C3C3C',
        700: '#505050',
        600: '#636363',
        500: '#767575',
        400: '#8A8A8A',
        300: '#B1B1B1',
        200: '#D8D8D8',
        100: '#EBEBEB',
        50: '#F5F5F5',
        25: '#FAFAFA',
        0: '#FFFFFF',
      },
      teal: {
        1200: '#19564A',
        1100: '#1F6154',
        1000: '#27685C',
        900: '#337266',
        800: '#3D8073',
        700: '#468E81',
        600: '#4D988A',
        500: '#5AA395',
        400: '#7BB5AA',
        300: '#9CC8BF',
        200: '#BDDAD5',
        100: '#DEEDEA',
        50: '#EEF6F4',
        25: '#F7FBFA',
        '05': '#FCFDFD',
      },
      'tiger-lily': {
        1000: '#B93116',
        900: '#C33B20',
        800: '#CB472D',
        700: '#D24F35',
        600: '#DC583E',
        500: '#E36147',
        400: '#E76950',
        300: '#EC8773',
        200: '#F1A596',
        100: '#F5C3B9',
        50: '#F7CFC7',
        25: '#FAE1DC',
        '05': '#FDF0ED',
      },
      information: {
        1000: '#146BA7',
        900: '#1774B2',
        800: '#1F7CBB',
        700: '#2B89C9',
        600: '#429CDA',
        500: '#68B8EF',
        400: '#83C8F7',
        300: '#9DD6FB',
        200: '#B1DEFC',
        100: '#C4E6FD',
        50: '#D8EEFD',
        25: '#EBF7FE',
      },
      alert: {
        1000: '#AE8300',
        900: '#F0B912',
        800: '#F8BF16',
        700: '#FCC932',
        600: '#FED455',
        500: '#FFD967',
        400: '#FFE185',
        300: '#FFE8A4',
        200: '#FFF0C2',
        100: '#FFF7E1',
      },
      'dark-teal': {
        900: '#274540',
        100: '#97A9A1',
      },
      'dark-tiger-lily': {
        900: '#8A7D7B',
        100: '#F2DAD5',
      },
      'blue-pantone': {
        900: '#291B95',
      },
      'cornflower-blue': {
        600: '#7690FB',
        500: '#91A6FC',
        400: '#9FB1FC',
        300: '#B1BFF8',
        200: '#CBD6FB',
        100: '#EAEDF8',
      },
      turquoise: {
        500: '#B8BCBB',
        400: '#D2D7D7',
        300: '#E0E6E5',
        200: '#ECF1F0',
        100: '#F0F5F4',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/forms')({ strategy: 'class' }),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
    plugin(({ theme, matchUtilities }) => {
      matchUtilities(
        {
          'inset-underline-ring': (value) => ({
            '--tw-inset-underline-ring-width': value,
          }),
          'inset-underline': (value) => ({
            '--tw-inset-underline-offset': negateValue(value),
            '--tw-inset-underline-shadow': `inset 0 var(--tw-inset-underline-offset) 0 0 var(--tw-inset-underline-color)`,
            '--tw-inset-underline-ring-shadow': `inset 0 0 0 var(--tw-inset-underline-ring-width, 0) var(--tw-ring-color)`,
            'box-shadow': 'var(--tw-inset-underline-shadow), var(--tw-inset-underline-ring-shadow)',
          }),
        },
        {
          values: theme('ringWidth'),
          type: 'length',
        }
      );

      matchUtilities(
        {
          'inset-underline': (value) => ({
            '--tw-inset-underline-color': value,
          }),
        },
        {
          values: Object.fromEntries(
            Object.entries(flattenColorPalette(theme('ringColor'))).filter(([modifier]) => modifier !== 'DEFAULT')
          ),
          type: 'color',
        }
      );
    }),
  ],
};
