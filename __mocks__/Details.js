const React = require("react");
module.exports = (props) =>
  React.createElement(
    "div",
    { "data-testid": "Details", ...props },
    props.children
  );
