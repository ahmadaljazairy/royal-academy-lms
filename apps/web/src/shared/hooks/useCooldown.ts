import { useState, useEffect, useCallback } from 'react';

interface UseCooldownReturn {
    /** Remaining seconds on the cooldown timer */
    cooldown: number;
    /** Starts the cooldown timer and writes expiration timestamp to localStorage */
    startCooldown: (durationSeconds?: number) => void;
    /** True if the cooldown is actively running */
    isCoolingDown: boolean;
}

export function useCooldown(
    storageKey: string,
    defaultDurationSeconds = 60,
): UseCooldownReturn {
    const getRemainingSeconds = useCallback((): number => {
        try {
            const storedExpiry = localStorage.getItem(storageKey);
            if (!storedExpiry) return 0;

            const expiresAt = parseInt(storedExpiry, 10);
            if (Number.isNaN(expiresAt)) return 0;

            const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
            return remaining > 0 ? remaining : 0;
        } catch {
            return 0;
        }
    }, [storageKey]);

    const [cooldown, setCooldown] = useState<number>(getRemainingSeconds);

    useEffect(() => {
        const initial = getRemainingSeconds();
        setCooldown(initial);

        if (initial <= 0) {
            try {
                localStorage.removeItem(storageKey);
            } catch {
                // Ignore localStorage access failures (e.g., incognito storage restrictions)
            }
            return;
        }

        const interval = setInterval(() => {
            const remaining = getRemainingSeconds();
            setCooldown(remaining);

            if (remaining <= 0) {
                try {
                    localStorage.removeItem(storageKey);
                } catch {
                    // Ignore
                }
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [getRemainingSeconds, storageKey]);

    const startCooldown = useCallback(
        (durationSeconds = defaultDurationSeconds) => {
            const expiresAt = Date.now() + durationSeconds * 1000;
            try {
                localStorage.setItem(storageKey, expiresAt.toString());
            } catch {
                // Ignore
            }
            setCooldown(durationSeconds);
        },
        [storageKey, defaultDurationSeconds],
    );

    return {
        cooldown,
        startCooldown,
        isCoolingDown: cooldown > 0,
    };
}