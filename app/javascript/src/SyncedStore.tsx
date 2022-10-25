import * as React from "react";
import { useSyncedStore } from "@syncedstore/react";
import { store } from "./syncstore";

// Could set defaultStory as default here instead of null
export const SyncedStoreContext = React.createContext<any>(null);

export default function SyncedStore({ children }: { children: React.ReactNode }) {
  const state = useSyncedStore(store);

  return <SyncedStoreContext.Provider value={{ state: state.state }}>{children}</SyncedStoreContext.Provider>
}
