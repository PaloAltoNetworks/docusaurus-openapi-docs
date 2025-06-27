const React = require("react");
module.exports = (props) =>
  React.createElement(
    "div",
    { "data-testid": "ApiTabs", ...props },
    props.children
  );
