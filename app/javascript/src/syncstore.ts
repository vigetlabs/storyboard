import { syncedStore, getYjsValue } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
import { ApplicationState } from "./Store";
import { AbstractType } from "yjs";

// Create your SyncedStore store
export const store = syncedStore({ state: {} as ApplicationState });

// Get the Yjs document and sync automatically using y-webrtc
const doc = getYjsValue(store);
if (doc && !(doc instanceof AbstractType)) {
  const webrtcProvider = new WebrtcProvider("viget-storyboard-id", doc);
}
