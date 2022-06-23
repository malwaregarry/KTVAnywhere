import { ReactNode } from 'react';
import { Drawer } from '@mui/material';
import { GetColorTheme } from './Settings';

interface SidebarProps {
  children: ReactNode;
}

const drawerHeight = 'calc(100vh - 130px)';
export const LeftSidebar = ({ children }: SidebarProps) => {
  const backgroundColor = GetColorTheme().sidebarBackground;

  return (
    <Drawer
      sx={{
        '& .MuiDrawer-paper': {
          height: drawerHeight,
          boxSizing: 'border-box',
          background: backgroundColor,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {children}
    </Drawer>
  );
};

export const RightSidebar = ({ children }: SidebarProps) => {
  const backgroundColor = GetColorTheme().sidebarBackground;
  return (
    <Drawer
      sx={{
        '& .MuiDrawer-paper': {
          minWidth: '330px',
          height: drawerHeight,
          boxSizing: 'border-box',
          alignItems: 'center',
          background: backgroundColor,
        },
      }}
      variant="permanent"
      anchor="right"
    >
      {children}
    </Drawer>
  );
};

export default LeftSidebar;
