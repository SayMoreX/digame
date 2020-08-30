/* This gives us type safety while implementing electron's Context Bridge security model. 
Every method added via preload.js should be added here.*/

import { MessageBoxSyncOptions } from "electron";

export class LametaMethodsExposedViaMainProcess {
  //MessageBox(options: MessageBoxSyncOptions);
  ConsoleLogToTerminal(s: string) {
    console.log(s);
  }
}

export {}; // This weirdness from https://github.com/microsoft/TypeScript/issues/33128
declare global {
  interface Window {
    //MessageBox(options: MessageBoxSyncOptions);
    Lameta: LametaMethodsExposedViaMainProcess;
  }
}
console.log("##333################## setting window.lameta");
window.Lameta = new LametaMethodsExposedViaMainProcess();
