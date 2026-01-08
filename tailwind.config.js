// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary colors - Black
        primary: {
          DEFAULT: 'var(--primary-DEFAULT, #976735)',
          50: 'var(--primary-50, #CEAE8C)',
          100: 'var(--primary-100, #CBA881)',
          200: 'var(--primary-200, #BD976F)',
          300: 'var(--primary-300, #A9865F)',
          400: 'var(--primary-400, #97754F)',
          500: 'var(--primary-500, #85643F)',
          600: 'var(--primary-600, #73532F)',
          700: 'var(--primary-700, #61421F)',
          800: 'var(--primary-800, #4F310F)',
          900: 'var(--primary-900, #3D2000)',
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#000000', // Emerald-500
          50: '#F3F4F6',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#1F2937',
          800: '#111827',
          900: '#000000',
        },
        // Accent colors
        accent: {
          DEFAULT: '#8B5CF6', // Violet-500
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Neutral colors
        neutral: {
          DEFAULT: '#6B7280', // Gray-500
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Success, Warning, Error, Info
        success: {
          DEFAULT: '#10B981', // Emerald-500
          light: '#D1FAE5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber-500
          light: '#FEF3C7',
          dark: '#92400E',
        },
        error: {
          DEFAULT: '#EF4444', // Red-500
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
        info: {
          DEFAULT: '#3B82F6', // Blue-500
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        // Dark mode specific colors
        dark: {
          bg: '#0F172A', // slate-900
          surface: '#1E293B', // slate-800
          surfaceHover: '#334155', // slate-700
          border: '#334155', // slate-700
          text: '#F1F5F9', // slate-100
          textSecondary: '#CBD5E1', // slate-300
          textMuted: '#64748B', // slate-500
        }
      },
      screens: {
        xs: '425px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  safelist: [
    {
      pattern: /^(sm|md|lg|xl):(grid-cols|col-span|flex|items|justify|gap|w|h|min-w|max-w|min-h|max-h|text|p|px|py|m|mx|my|aspect|basis|grow|shrink)-/,
    },
    // Grid columns (base)
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
    'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11', 'grid-cols-12',
    // Grid columns (responsive)
    'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4', 'md:grid-cols-5', 'md:grid-cols-6',
    'md:grid-cols-7', 'md:grid-cols-8', 'md:grid-cols-9', 'md:grid-cols-10', 'md:grid-cols-11', 'md:grid-cols-12',
    'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5', 'lg:grid-cols-6',
    'lg:grid-cols-7', 'lg:grid-cols-8', 'lg:grid-cols-9', 'lg:grid-cols-10', 'lg:grid-cols-11', 'lg:grid-cols-12',
    'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4', 'xl:grid-cols-5', 'xl:grid-cols-6',
    'xl:grid-cols-7', 'xl:grid-cols-8', 'xl:grid-cols-9', 'xl:grid-cols-10', 'xl:grid-cols-11', 'xl:grid-cols-12',
    // Column spans (base)
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6',
    'col-span-7', 'col-span-8', 'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12',
    // Column spans (responsive)
    'md:col-span-1', 'md:col-span-2', 'md:col-span-3', 'md:col-span-4', 'md:col-span-5', 'md:col-span-6',
    'md:col-span-7', 'md:col-span-8', 'md:col-span-9', 'md:col-span-10', 'md:col-span-11', 'md:col-span-12',
    'lg:col-span-1', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4', 'lg:col-span-5', 'lg:col-span-6',
    'lg:col-span-7', 'lg:col-span-8', 'lg:col-span-9', 'lg:col-span-10', 'lg:col-span-11', 'lg:col-span-12',
    'xl:col-span-1', 'xl:col-span-2', 'xl:col-span-3', 'xl:col-span-4', 'xl:col-span-5', 'xl:col-span-6',
    'xl:col-span-7', 'xl:col-span-8', 'xl:col-span-9', 'xl:col-span-10', 'xl:col-span-11', 'xl:col-span-12',
    // Justify Content (Horizontal Alignment)
    'justify-center', 'justify-start', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly',
    // Align Items (Vertical Alignment)
    'items-center', 'items-start', 'items-end', 'items-stretch',
    // Flex Direction
    'flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse',
    // Flex Wrap
    'flex-wrap', 'flex-nowrap', 'flex-wrap-reverse',
    // Flex Grow (0-12)
    'grow-0', 'grow', 'grow-[2]', 'grow-[3]', 'grow-[4]', 'grow-[5]', 'grow-[6]',
    'md:grow-0', 'md:grow', 'md:grow-[2]', 'md:grow-[3]', 'md:grow-[4]', 'md:grow-[5]', 'md:grow-[6]',
    'lg:grow-0', 'lg:grow', 'lg:grow-[2]', 'lg:grow-[3]', 'lg:grow-[4]', 'lg:grow-[5]', 'lg:grow-[6]',
    'xl:grow-0', 'xl:grow', 'xl:grow-[2]', 'xl:grow-[3]', 'xl:grow-[4]', 'xl:grow-[5]', 'xl:grow-[6]',
    // Flex Shrink (0-12)
    'shrink-0', 'shrink', 'shrink-[2]', 'shrink-[3]',
    'md:shrink-0', 'md:shrink', 'md:shrink-[2]', 'md:shrink-[3]',
    'lg:shrink-0', 'lg:shrink', 'lg:shrink-[2]', 'lg:shrink-[3]',
    'xl:shrink-0', 'xl:shrink', 'xl:shrink-[2]', 'xl:shrink-[3]',
    // Flex Basis
    'basis-0', 'basis-auto', 'basis-full', 'basis-1/2', 'basis-1/3', 'basis-2/3', 'basis-1/4', 'basis-3/4',
    'md:basis-0', 'md:basis-auto', 'md:basis-full', 'md:basis-1/2', 'md:basis-1/3', 'md:basis-2/3', 'md:basis-1/4', 'md:basis-3/4',
    'lg:basis-0', 'lg:basis-auto', 'lg:basis-full', 'lg:basis-1/2', 'lg:basis-1/3', 'lg:basis-2/3', 'lg:basis-1/4', 'lg:basis-3/4',
    'xl:basis-0', 'xl:basis-auto', 'xl:basis-full', 'xl:basis-1/2', 'xl:basis-1/3', 'xl:basis-2/3', 'xl:basis-1/4', 'xl:basis-3/4',

    // any sm , md , lg , xl class
    'sm:*', 'md:*', 'lg:*', 'xl:*',
    'sm:w-full', 'sm:w-auto', 'sm:w-max', 'sm:w-min', 'sm:w-fit', 'sm:w-screen', 'sm:w-1/2', 'sm:w-1/3', 'sm:w-2/3', 'sm:w-1/4', 'sm:w-3/4',
    'md:w-full', 'md:w-auto', 'md:w-max', 'md:w-min', 'md:w-fit', 'md:w-screen', 'md:w-1/2', 'md:w-1/3', 'md:w-2/3', 'md:w-1/4', 'md:w-3/4',
    'lg:w-full', 'lg:w-auto', 'lg:w-max', 'lg:w-min', 'lg:w-fit', 'lg:w-screen', 'lg:w-1/2', 'lg:w-1/3', 'lg:w-2/3', 'lg:w-1/4', 'lg:w-3/4',
    'xl:w-full', 'xl:w-auto', 'xl:w-max', 'xl:w-min', 'xl:w-fit', 'xl:w-screen', 'xl:w-1/2', 'xl:w-1/3', 'xl:w-2/3', 'xl:w-1/4', 'xl:w-3/4',
    // any sm , md , lg , xl class

  ],
  plugins: [],
};
