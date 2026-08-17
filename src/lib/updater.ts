import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForUpdates(): Promise<Update | null> {
  try {
    const update = await check();

    console.log("========== APPoint UPDATER ==========");
    console.log("Update object:", update);

    if (update) {
      console.log("Current version:", update.currentVersion);
      console.log("Available version:", update.version);
      console.log("Update URL:", update.downloadAndInstall);
    } else {
      console.log("NO UPDATE AVAILABLE");
    }

    return update;
  } catch (error) {
    console.error("========== APPoint UPDATER ERROR ==========");
    console.error(error);
    throw error;
  }
}

export async function installUpdate(update: Update): Promise<void> {
  console.log(
    `Installing APPoint update: ${update.currentVersion} → ${update.version}`,
  );

  await update.downloadAndInstall();
  await relaunch();
}
