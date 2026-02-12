/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fadde1',
                    100: '#ffc4d6',
                    200: '#ffa6c1',
                    300: '#ff87ab',
                    400: '#ff5d8f',
                    500: '#ff97b7',
                    600: '#ffacc5',
                    700: '#ffcad4',
                    800: '#f4acb7',
                },
                accent: '#ff5d8f',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-up': 'fade-up 0.5s ease-out',
                'fade-in': 'fade-in 0.4s ease-out',
            },
        },
    },
    plugins: [],
}
