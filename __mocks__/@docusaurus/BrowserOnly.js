module.exports = function BrowserOnly({ children, fallback }) {
  return typeof children === "function"
    ? children()
    : children || fallback || null;
};
