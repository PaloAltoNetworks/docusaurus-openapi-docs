const React = require("react");
module.exports = (props) =>
  React.createElement(
    "div",
    { "data-testid": "Heading", ...props },
    props.children
  );
