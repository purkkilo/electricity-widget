export const cleanTerminalFromDumbWarnings = () => {
  const originalConsoleWarn = console.warn;

  console.warn = (...args) => {
    // https://github.com/react-navigation/react-navigation/issues/11730
    // https://github.com/expo/expo/issues/33248
    if (
      args[0] === "props.pointerEvents is deprecated. Use style.pointerEvents"
    ) {
      return;
    }
    if (
      args[0] === '"shadow*" style props are deprecated. Use "boxShadow".' &&
      new Error().stack?.includes("useNavigationBuilder")
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
};
