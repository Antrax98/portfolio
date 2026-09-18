'use client';

import { useState, type ReactNode } from 'react';
import { Box, Tab, Tabs } from '@mui/material';

export interface ProjectTab {
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: ProjectTab[];
  /**
   * Mantiene montados los paneles inactivos. En una galería de solo lectura no
   * hace falta; en un formulario sí, porque desmontar pierde lo que el usuario
   * estaba escribiendo al cambiar de pestaña.
   */
  keepMounted?: boolean;
}

export function ProjectTabs({ tabs, keepMounted = false }: Props) {
  const [active, setActive] = useState(0);

  if (tabs.length === 0) return null;
  if (tabs.length === 1) return <Box sx={{ pt: 2 }}>{tabs[0].content}</Box>;

  return (
    <Box>
      <Tabs
        value={active}
        onChange={(_, value: number) => setActive(value)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>

      {tabs.map((tab, index) => (
        <Box
          key={tab.label}
          role="tabpanel"
          hidden={active !== index}
          sx={{ pt: 3 }}
        >
          {(keepMounted || active === index) && tab.content}
        </Box>
      ))}
    </Box>
  );
}
