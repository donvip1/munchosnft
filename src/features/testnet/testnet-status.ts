export type TestnetCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function hasTestnetEnded(nowMs: number, endsAtMs: number) {
  return nowMs >= endsAtMs;
}

export function getTestnetCountdown(nowMs: number, endsAtMs: number): TestnetCountdown {
  const remainingSeconds = Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000));

  return {
    days: Math.floor(remainingSeconds / 86_400),
    hours: Math.floor((remainingSeconds % 86_400) / 3_600),
    minutes: Math.floor((remainingSeconds % 3_600) / 60),
    seconds: remainingSeconds % 60
  };
}
