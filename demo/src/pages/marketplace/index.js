import React, { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

function MarketPlace() {
  const location = useLocation();
  const newLocation = location.search
    ? `https://xsoar-marketplace.pan.dev/${location.search}`
    : "https://xsoar-marketplace.pan.dev";

  useEffect(() => {
    window.location.href = newLocation;
  }, []);

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
