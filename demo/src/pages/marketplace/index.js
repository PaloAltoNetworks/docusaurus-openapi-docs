import React from "react";
import { useLocation } from "@docusaurus/router";

function MarketPlace() {
  const location = useLocation();
  const newLocation = location.search
    ? `https://xsoar-marketplace.pan.dev/${location.search}`
    : "https://xsoar-marketplace.pan.dev";

  setTimeout(() => {
    window.location.href = newLocation;
  }, 10000);

  return (
    <span>
      Redirecting to Cortex XSOAR Marketplace... click{" "}
      <a target="_self" href={newLocation}>
        here
      </a>{" "}
      if the redirect fails or is taking too long.
    </span>
  );
}

export default MarketPlace;
