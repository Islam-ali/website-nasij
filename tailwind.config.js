// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./public/index.html"
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
    // Essential dynamic grid classes (only what's actually used)
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
    'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4',
    'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4',
    'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4',
    // Essential responsive utilities
    'hidden', 'md:hidden', 'lg:hidden', 'xl:hidden',
    'block', 'md:block', 'lg:block', 'xl:block',
    'flex', 'md:flex', 'lg:flex', 'xl:flex',
    'grid', 'md:grid', 'lg:grid', 'xl:grid',
    // Essential sizing
    'w-full', 'h-full', 'text-center',
    // Essential colors (dark mode)
    'bg-white', 'bg-gray-50', 'bg-gray-900',
    'text-white', 'text-gray-900', 'text-gray-600',
    // Essential layout
    'justify-center', 'justify-between', 'items-center',
    'flex-row', 'flex-col', 'p-4', 'p-6', 'p-8',
    // Essential styling
    'border', 'rounded-lg', 'rounded-xl', 'shadow-lg',
    'transition-all', 'duration-300',
    // Dark mode essentials
    'dark:bg-gray-800', 'dark:bg-gray-900', 'dark:text-white', 'dark:text-gray-300',
    'dark:border-gray-700', 'dark:shadow-gray-900/50',
  ],
  plugins: [],
};
