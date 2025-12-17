"use client";

import { useState, useEffect, useCallback } from "react";

interface DashboardSettings {
  showCharts: boolean;
  showRecentCalls: boolean;
  recentCallsLimit: number;
  defaultPageSize: number;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  showCharts: true,
  showRecentCalls: true,
  recentCallsLimit: 10,
  defaultPageSize: 20,
};

const SETTINGS_KEY = "dashboard-settings";

export function useSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<DashboardSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error("Error saving settings:", error);
      }
      return newSettings;
    });
  }, []);

  return {
    settings,
    updateSettings,
    isLoaded,
  };
}


