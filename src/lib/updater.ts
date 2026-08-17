import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForUpdates(): Promise<Update | null> {
  try {
    return await check();
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return null;
  }
}

export async function installUpdate(update: Update): Promise<void> {
  try {
    await update.downloadAndInstall();
    await relaunch();
  } catch (error) {
    console.error("Failed to install update:", error);
    throw error;
  }
}
