module.exports = {
  sanitizeTabsChildren: (children) => children,
  useTabs: () => ({
    selectedValue: "tab1",
    selectValue: jest.fn(),
    tabValues: [
      { value: "tab1", label: "Tab 1" },
      { value: "tab2", label: "Tab 2" },
    ],
  }),
  useScrollPositionBlocker: () => ({
    blockElementScrollPositionUntilNextRender: jest.fn(),
  }),
};
