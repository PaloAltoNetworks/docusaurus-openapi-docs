const React = require("react");
module.exports = function TabItem(props) {
  // Only pick allowed props for a div
  const { value, label, children, ...rest } = props;
  return React.createElement(
    "div",
    {
      "data-testid": "TabItem",
      "data-value": value,
      "data-label": label,
      ...rest,
    },
    children
  );
};
