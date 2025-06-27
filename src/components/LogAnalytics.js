"use client"; // This ensures that the component only runs on the client

import { useEffect } from "react";
import { logEvent } from "firebase/analytics";
import { analytics } from "../libs/firebase";

const LogAnalytics = ({ eventName, eventParams }) => {
  useEffect(() => {
    // Log the event when the component is mounted
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  }, [eventName, eventParams]);

  return null;
};

export default LogAnalytics;