const React = require("react");
module.exports = (props) =>
  React.createElement(
    "div",
    { "data-testid": "ResponseSchema", ...props },
    props.children
  );
