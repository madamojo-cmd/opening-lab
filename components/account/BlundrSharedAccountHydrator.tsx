"use client";

import { useEffect } from "react";
import { hydrateSharedAccountBootstrap } from "@/lib/blundr/accounts/accountHydration";

export function BlundrSharedAccountHydrator() {
  useEffect(() => {
    void hydrateSharedAccountBootstrap();
  }, []);

  return null;
}
