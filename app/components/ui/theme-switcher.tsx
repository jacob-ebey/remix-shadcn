export function ThemeSwitcherSafeHTML({
  children,
  lang,
  ...props
}: React.HTMLProps<HTMLHtmlElement> & { lang: string }) {
  const dataTheme =
    typeof document === "undefined"
      ? undefined
      : document.documentElement.getAttribute("data-theme") || undefined;

  return (
    <html {...props} lang={lang} data-theme={dataTheme}>
      {children}
    </html>
  );
}

export function ThemeSwitcherScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var theme = localStorage.getItem("theme");
            if (theme) {
              document.documentElement.setAttribute("data-theme", theme);
            }
          })();
        `,
      }}
    />
  );
}

export function toggleTheme() {
  let currentTheme = validateTheme(localStorage.getItem("theme"));
  if (!currentTheme) {
    currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  const newTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  document.documentElement.setAttribute("data-theme", newTheme);
}

function validateTheme(theme: string | null) {
  return theme === "light" || theme === "dark" ? theme : null;
}
