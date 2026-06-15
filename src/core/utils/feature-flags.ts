const isEnabled = (value?: string) => value?.toLowerCase() === "true";

export const isAvatarEnabled = () =>
  isEnabled(process.env.NEXT_PUBLIC_ENABLE_AVATAR);

export const isVoiceEnabled = () =>
  isEnabled(process.env.NEXT_PUBLIC_ENABLE_VOICE);
