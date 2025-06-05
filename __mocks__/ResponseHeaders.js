const React = require("react");
module.exports = (props) =>
  React.createElement(
    "div",
    { "data-testid": "ResponseHeaders", ...props },
    props.children
  );
