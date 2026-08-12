"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) {
      return;
    }

    tracked.current = true;

    const recordView = async () => {
      try {
        const url = `http://192.168.1.15:8000/api/blogs/${encodeURIComponent(slug)}/view`;

        console.log("Sending view request:", url);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();

        console.log("View API status:", response.status);
        console.log("View API response:", data);

        if (!response.ok) {
          throw new Error(`View API failed with status ${response.status}`);
        }
      } catch (error) {
        console.error("View tracking error:", error);
      }
    };

    recordView();
  }, [slug]);

  return null;
}
