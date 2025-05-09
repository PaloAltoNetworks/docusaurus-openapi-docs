const React = require("react");
module.exports = (props) =>
  React.createElement(
    "div",
    { "data-testid": "Markdown", ...props },
    props.children
  );
