import fs from "fs";
import Path from "path";
import * as git from "isomorphic-git";
import { NotifyWarning } from "./components/Notify";

let repo: { dir: string } = { dir: "" };

export async function GitInit(directory: string) {
  repo = { dir: directory };
  git.plugins.set("fs", fs);
  await git.init({ dir: directory, noOverwrite: true });
}
export async function GitCommitEverything(commitMessage: string) {
  if (!repo.dir) {
    throw new Error("directory is '' in CommitEverything()");
  }
  try {
    let needCommit = false;
    await git.statusMatrix({ ...repo }).then(status =>
      Promise.all(
        status.map(([filepath, headStatus, worktreeStatus, stageStatus]) => {
          // isomorphic-git may report a changed file as unmodified, so always add if not removing
          if (worktreeStatus) {
            if (
              [".jpg", ".mp4", ".mp3"].indexOf(
                Path.extname(filepath).toLowerCase()
              ) < 0 &&
              filepath !== "saymorex.log"
            ) {
              needCommit =
                needCommit || !(worktreeStatus === 1 && stageStatus === 1); // that means it's unmodified
              git.add({ ...repo, filepath });
            } else {
              console.log("Skipping " + filepath);
            }
          } else {
            needCommit = true;
            git.remove({ ...repo, filepath });
          }
        })
      )
    );
    if (needCommit) {
      await git.commit({
        ...repo,
        message: commitMessage,
        author: { name: "SayMoreX", email: "none@example.com" }
      });
      console.log("Committing to git");
    } else {
      console.log("Nothing to Commit.");
    }
  } catch (err) {
    NotifyWarning("Problem saving to git:\r\n" + err.message);
  }
}
