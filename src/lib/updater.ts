import { check } from "@tauri-apps/plugin-updater";

export interface UpdateInfo {
  available: boolean;
  currentVersion?: string;
  version?: string;
  body?: string | null;
  update?: Awaited<ReturnType<typeof check>>;
  error?: unknown;
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  try {
    const update = await check();

    if (!update) {
      return {
        available: false,
      };
    }

    return {
      available: true,
      currentVersion: update.currentVersion,
      version: update.version,
      body: update.body,
      update,
    };
  } catch (error) {
    console.error("Update check failed:", error);

    return {
      available: false,
      error,
    };
  }
}

export async function downloadAndInstallUpdate() {
  const result = await check();

  if (!result) {
    return false;
  }

  await result.downloadAndInstall();

  return true;
}
