// Boot file to enable dark mode by default for the desktop app
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dark } from 'quasar';

export default async () => {
  // Default to dark, but respect persisted user setting when available
  try {
    // window.nebulaAPI is injected by preload in Electron
    if (typeof window !== 'undefined' && window.nebulaAPI && window.nebulaAPI.loadSettings) {
      const s = await window.nebulaAPI.loadSettings();
      if (s && typeof s === 'object' && 'theme' in s) {
        const themeRaw = (s as any).theme;
        const themeVal = typeof themeRaw === 'string' ? themeRaw : 'dark';
        Dark.set(themeVal === 'dark');
        return;
      }
    }
  } catch {
    // ignore and fall back to dark
  }

  Dark.set(true);
};
