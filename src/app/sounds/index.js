// This resolves to a real URL at build time
export const notifySoundUrl = new URL("./notify.wav", import.meta.url).href;
