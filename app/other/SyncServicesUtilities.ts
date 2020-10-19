// Dropbox, Google Drive, One Drive, etc.... they all cause problems because
// they step on and interfere with programs like lameta that use the file system
// heavily. For example, with Dropbox, renaming a session folder fails immediately.

import * as Path from "path";
//import ps from "ps-node";
import find from "find-process";
import process from "process";

import {
  NotifyError,
  NotifySuccess,
  NotifyWarning,
} from "../components/Notify";

let stoppedService: string | undefined;

const servicesLowercase = ["dropbox"];
type processResult = {
  value: {
    pid: number;
    ppid?: number;
    uid?: number;
    gid?: number;
    name: string;
    cmd: string;
  }[];
};
// Normally this is only going to be one service. In theory there could be more,
// e.g. if a service could sync arbitrarily-located folders.
// But this will handling that case.
export function getSyncServiceForPath(path: string): string | undefined {
  // note, directory could be e.g. "Dropbox (Personal)", not just "Dropbox"
  const parts = path.split(Path.sep);
  return servicesLowercase.find((s) =>
    parts.some((p) => p.toLowerCase().startsWith(s))
  );
}
function findProcess(processName: string) {
  return find("name", processName, false);
}
export function stopSyncProcess(processName: string) {
  // findProcess(processName).then(
  //   (result: processResult) => {
  //     if (result) {
  //       process.kill(result.pid);
  //       NotifySuccess(`Stopped ${processName}`);
  //       stoppedService = processName;
  //     }
  //   },
  //   (failed) => {
  //     NotifyError(`Failed to stop ${processName}`);
  //   }
  // );
}

export function restartSyncProcess() {}
