import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForUpdates(): Promise<Update | null> {
  try {
    const update = await check();

    if (update) {
      console.log(
        `Update available: ${update.currentVersion} → ${update.version}`,
      );
    } else {
      console.log("APPoint is up to date.");
    }

    return update;
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return null;
  }
}

export async function installUpdate(update: Update): Promise<void> {
  try {
    console.log(
      `Installing APPoint update: ${update.currentVersion} → ${update.version}`,
    );

    await update.downloadAndInstall();
    await relaunch();
  } catch (error) {
    console.error("Failed to install update:", error);
    throw error;
  }
}
