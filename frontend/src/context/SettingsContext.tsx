import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CompanySettings {
  company_name: string;
  company_name_zh: string;
  whatsapp: string;
  email: string;
  address: string;
  phone: string;
}

interface SettingsContextType {
  settings: CompanySettings | null;
  loading: boolean;
  refreshSettings: () => void;
}

const defaultSettings: CompanySettings = {
  company_name: '',
  company_name_zh: '',
  whatsapp: '',
  email: '',
  address: '',
  phone: '',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    setLoading(true);
    fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
