/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html" // أضف هذا إذا كنت تستخدم Tailwind في ملفات HTML
    ],
    theme: {
        extend: {
            screens: {
                'xs': '475px',
            },
            colors: {
                'it-turquoise': '#218A7A',
                'it-dark-blue': '#003366',
                'it-yellow': '#FFDD33',
            },
            fontFamily: {
                sans: ['Poppins', 'Cairo', 'sans-serif'],
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideOutLeft: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(-100%)', opacity: '0' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideOutRight: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(100%)', opacity: '0' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                },
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'scale-in': 'scaleIn 0.3s ease-out forwards',
                'slide-up': 'slide-up 0.7s ease-out forwards',
                'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
                'slideInLeft': 'slideInLeft 0.3s ease-out forwards',
                'slideOutLeft': 'slideOutLeft 0.3s ease-out forwards',
                'slideInRight': 'slideInRight 0.3s ease-out forwards',
                'slideOutRight': 'slideOutRight 0.3s ease-out forwards',
            },
        },
    },
plugins: [
      require('tailwindcss-rtl')
    ],
};