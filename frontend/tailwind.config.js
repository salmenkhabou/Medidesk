/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#005451",
        "primary-container": "#0f6e6a",
        "on-primary": "#ffffff",
        "on-primary-container": "#9dede8",
        "primary-fixed": "#a1f1eb",
        "primary-fixed-dim": "#85d4cf",
        "on-primary-fixed": "#00201e",
        "on-primary-fixed-variant": "#00504d",

        "secondary": "#9f4122",
        "secondary-container": "#fd8863",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#722104",
        "secondary-fixed": "#ffdbd0",
        "secondary-fixed-dim": "#ffb59e",
        "on-secondary-fixed": "#3a0b00",
        "on-secondary-fixed-variant": "#7f2a0d",

        "tertiary": "#733c00",
        "tertiary-container": "#965000",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffd7ba",
        "tertiary-fixed": "#ffdcc3",
        "tertiary-fixed-dim": "#ffb77d",
        "on-tertiary-fixed": "#2f1500",
        "on-tertiary-fixed-variant": "#6e3900",

        "surface": "#f8f9ff",
        "surface-bright": "#f8f9ff",
        "surface-dim": "#d0dbed",
        "surface-variant": "#d9e3f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e6eeff",
        "surface-container-high": "#dee9fc",
        "surface-container-highest": "#d9e3f6",

        "on-surface": "#121c2a",
        "on-surface-variant": "#3e4948",
        "inverse-surface": "#27313f",
        "inverse-on-surface": "#eaf1ff",
        "inverse-primary": "#85d4cf",

        "outline": "#6e7978",
        "outline-variant": "#bec9c7",
        "surface-tint": "#046a66",
        "background": "#f8f9ff",
        "on-background": "#121c2a",

        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1.0rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "1rem",
        "gutter-md": "1.5rem",
        "gutter-lg": "2rem",
        "margin": "1rem",
        "margin-md": "1.5rem",
        "margin-lg": "2.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        "headline-xl": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "headline-sm": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
        "body-sm": ["Plus Jakarta Sans"],
        "label-lg": ["Plus Jakarta Sans"],
        "label-md": ["Plus Jakarta Sans"],
        "label-sm": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "headline-xl": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-md": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "headline-sm": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        "body-md": ["1.0rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-md": ["0.75rem", { lineHeight: "1.0rem", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-sm": ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.03em", fontWeight: "600" }]
      }
    },
  },
  plugins: [],
}
