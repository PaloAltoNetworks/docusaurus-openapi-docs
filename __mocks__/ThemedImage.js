module.exports = (props) => {
  const React = require("react");
  return React.createElement("img", {
    "data-testid": "themed-image",
    ...props,
  });
};
