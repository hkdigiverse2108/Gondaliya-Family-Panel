import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Button, useTheme, useMediaQuery, Chip, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4 as MoonIcon,
  Brightness7 as SunIcon
} from '@mui/icons-material';
import { LayoutDashboard, Users, MapPin, KeyRound, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const DRAWER_WIDTH = 255;
const COLLAPSED_WIDTH = 72;

export const AdminLayout: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { text: 'Dashboard',       path: '/',               icon: <LayoutDashboard size={20} />, badge: null },
    { text: 'Family Registry', path: '/users',           icon: <Users size={20} />,           badge: null },
    { text: 'Location Master', path: '/locations',       icon: <MapPin size={20} />,          badge: null },
    { text: 'Change Password', path: '/change-password', icon: <KeyRound size={20} />,        badge: null },
  ];

  const currentItem = menuItems.find(i => i.path === location.pathname) || menuItems[0];
  const drawerW = collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, minHeight: 64,
        borderBottom: `1px solid ${theme.palette.divider}`,
        justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        background: mode === 'light'
          ? 'linear-gradient(135deg, #F0FDFC 0%, #CCFBF1 100%)'
          : 'linear-gradient(135deg, #071727 0%, #050F1C 100%)'
      }}>
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{
              bgcolor: 'primary.main',
              background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
              width: 36, height: 36, fontWeight: 800, fontSize: '0.85rem'
            }}>
              GF
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1, color: 'primary.main' }}>
                Gondaliya
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Family Directory
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && !isMobile && (
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontWeight: 800, fontSize: '0.85rem' }}>
            GF
          </Avatar>
        )}
        {!isMobile && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement='right'>
            <IconButton size='small' onClick={() => setCollapsed(!collapsed)} sx={{ color: 'primary.main' }}>
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeftIcon fontSize='small' />}
            </IconButton>
          </Tooltip>
        )}
        {isMobile && (
          <IconButton size='small' onClick={() => setMobileOpen(false)} sx={{ color: 'text.secondary' }}>
            <ChevronLeftIcon fontSize='small' />
          </IconButton>
        )}
      </Box>

      {/* Nav Menu */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed && !isMobile ? item.text : ''} placement='right'>
                <ListItemButton
                  onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                  sx={{
                    borderRadius: 2,
                    py: 1.1,
                    px: collapsed && !isMobile ? 1.5 : 1.8,
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    minHeight: 46,
                    backgroundColor: isActive
                      ? (mode === 'light' ? 'rgba(13,148,136,0.1)' : 'rgba(45,212,191,0.12)')
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: mode === 'light' ? 'rgba(13,148,136,0.07)' : 'rgba(45,212,191,0.08)',
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0, top: '20%', bottom: '20%',
                      width: 3,
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: 'primary.main',
                    } : {},
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: collapsed && !isMobile ? 0 : 38,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      slotProps={{ primary: { sx: { fontWeight: isActive ? 700 : 500, fontSize: '0.88rem', color: isActive ? 'primary.main' : 'text.primary' } } }}
                    />
                  )}
                  {(!collapsed || isMobile) && item.badge && (
                    <Chip label={item.badge} color='primary' size='small' sx={{ height: 18, fontSize: '0.65rem' }} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Footer */}
      <Box sx={{
        p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
      }}>
        <Avatar sx={{
          bgcolor: mode === 'light' ? 'rgba(13,148,136,0.15)' : 'rgba(45,212,191,0.15)',
          color: 'primary.main', width: 36, height: 36, fontWeight: 800, fontSize: '0.8rem'
        }}>
          AD
        </Avatar>
        {(!collapsed || isMobile) && (
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant='caption' sx={{ fontWeight: 700, display: 'block', color: 'text.primary' }}>Administrator</Typography>
            <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.phoneNumber}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar position='fixed' sx={{
        zIndex: theme.zIndex.drawer + 1,
        width: { md: `calc(100% - ${drawerW}px)` },
        ml: { md: `${drawerW}px` },
        color: 'text.primary',
        transition: theme.transitions.create(['width', 'margin'], { duration: theme.transitions.duration.standard }),
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color='inherit'
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '1.1rem' }, lineHeight: 1 }}>
                {currentItem.text}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                Gondaliya Family Admin Portal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
              <IconButton onClick={toggleTheme} size='small' sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2, p: 0.8,
                color: mode === 'dark' ? '#FBBF24' : '#0F766E',
              }}>
                {mode === 'dark' ? <SunIcon fontSize='small' /> : <MoonIcon fontSize='small' />}
              </IconButton>
            </Tooltip>

            <Button
              variant='outlined'
              color='error'
              size='small'
              startIcon={<LogOut size={14} />}
              onClick={handleLogout}
              sx={{ fontWeight: 700, borderRadius: 2, px: 2, display: { xs: 'none', sm: 'flex' } }}
            >
              Logout
            </Button>
            <IconButton onClick={handleLogout} color='error' size='small' sx={{ display: { xs: 'flex', sm: 'none' } }}>
              <LogOut size={18} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Nav */}
      <Box component='nav' sx={{ width: { md: drawerW }, flexShrink: { md: 0 }, transition: theme.transitions.create('width', { duration: theme.transitions.duration.standard }) }}>
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {sidebarContent}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerW, overflowX: 'hidden', transition: theme.transitions.create('width', { duration: theme.transitions.duration.standard }) } }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component='main' sx={{
        flexGrow: 1,
        width: { md: `calc(100% - ${drawerW}px)` },
        mt: '64px',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create('width', { duration: theme.transitions.duration.standard }),
      }}>
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
        <Box sx={{
          px: { xs: 2, md: 4 }, py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 1
        }}>
          <Typography variant='caption' color='text.secondary'>
            &copy; {new Date().getFullYear()} Gondaliya Family Directory. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>System Online</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
