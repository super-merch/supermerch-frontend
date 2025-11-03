/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#009688",
        secondary: "#333333",
        customBlue: "rgba(12, 0, 71, 1)",
        white: "#ffffff",
        linkColor: "rgba(53, 53, 53, 1)",
        smallHeader: "rgba(8, 10, 84, 1)",
        header: "rgba(45, 165, 243, 1)",
        hero1: "rgba(48, 43, 44, 1)",
        hero2: "rgba(0, 103, 170, 1)",
        line: "rgba(255, 255, 255, 1)",
        border: "hsl(var(--border))",
        shadow: "box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
        heading: "rgba(255, 49, 126, 1)",
        brand: "rgba(25, 28, 31, 1)",
        border2: "rgba(228, 231, 233, 1)",
        icons: "rgba(193, 194, 255, 1)",
        borderb: "rgba(223, 222, 222, 1)",
        bgColor: "rgba(244, 244, 244, 1)",
        list: "rgba(245, 245, 245, 1)",
        tabsColor: "rgba(95, 108, 114, 1)",
        shipping: "rgba(240, 246, 255, 1)",
        footer: "rgba(173, 183, 188, 1)",
        category: "rgba(146, 159, 165, 1)",
        minPrice: "rgba(119, 135, 143, 1)",
        yellow: "rgba(243, 222, 109, 1)",
        activeFilter: "rgba(242, 244, 245, 1)",
        stock: "rgba(95, 108, 114, 1)",
        dots: "rgba(192, 194, 255, 0.24)",
        buy: "rgba(53, 56, 169, 1)",
        perUnit: "rgba(250, 250, 250, 1)",
        gren: "rgba(24, 191, 124, 1)",
        gogle: "rgba(71, 81, 86, 1)",
        hoverColor: "rgba(0, 103, 170, 1)",
        phoneHover: "rgba(234, 246, 254, 1)",
        pink: "rgba(255, 49, 126, 1)",
        drag: "rgba(242, 242, 242, 1)",
        textarea: "rgba(228, 231, 233, 1)",
        blog: "rgba(75, 107, 251, 0.05)",
        blogText: "rgba(75, 107, 251, 1)",
        tracy: "rgba(151, 152, 159, 1)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        "custom-190": "190px",
        "custom-280": "280px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "custom-bg": "url('/bg-img.png')",
        "pink-color": "url('/pinkcolor.png')",
        "shop-now": "url('/bg-pic.png')",
      },
      screens: {
        "custom-1282": {
          max: "1300px",
        },
        "custom-card": {
          max: "1270px",
        },
        "max-md": {
          max: "1200px",
        },
        "max-sm": {
          max: "950px",
        },
        "max-sm2": {
          max: "870px",
        },
        sm2: {
          min: "870px",
        },
        "max-default": {
          max: "650px",
        },
      },
    },
  },
  plugins: [tailwindcssAnimate, require("tailwindcss-animate")],
};
