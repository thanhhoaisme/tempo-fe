import { useCallback } from 'react';

const FORMATS = {
  SHORT: 'short', // "5m 30s"
  LONG: 'long',   // "5 minutes 30 seconds"
  CLOCK: 'clock', // "00:05:30"
};

export function useTimeFormat() {
  const formatSeconds = useCallback((seconds: number, format = FORMATS.CLOCK): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (format === FORMATS.CLOCK) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (format === FORMATS.SHORT) {
      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${secs}s`;
      return `${secs}s`;
    }

    if (format === FORMATS.LONG) {
      const parts = [];
      if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
      if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
      return parts.join(' ');
    }

    return '';
  }, []);

  return { formatSeconds, FORMATS };
}
