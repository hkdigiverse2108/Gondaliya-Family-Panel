import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, InputAdornment, IconButton, CircularProgress, Avatar
} from '@mui/material';
import { Phone as PhoneIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { mode } = useThemeMode();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { phoneNumber, password });
      const responseData = response.data;
      const isSuccess =
        responseData &&
        (responseData.statusCode === 200 || responseData.status === 200 || response.status === 200);

      if (isSuccess) {
        const dataPayload = responseData.data || responseData;
        const token  = dataPayload.token  || responseData.token;
        const role   = dataPayload.role   || responseData.role;
        const _id    = dataPayload._id    || responseData._id;
        const phone  = dataPayload.phoneNumber || phoneNumber;

        if (!token) { toast.error('Login response missing token.'); setLoading(false); return; }
        if (role !== 'admin') { toast.error('Access Denied: Only administrators can log in!'); setLoading(false); return; }

        login(token, { _id, phoneNumber: phone, role });
        toast.success('Welcome back, Administrator!');
        navigate('/');
      } else {
        toast.error(responseData?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      background: mode === 'light'
        ? 'linear-gradient(135deg, #F0FDFC 0%, #CCFBF1 50%, #99F6E4 100%)'
        : 'linear-gradient(135deg, #040D18 0%, #071727 50%, #0A1F30 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: mode === 'light'
          ? 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)',
        top: -150,
        right: -100,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: mode === 'light'
          ? 'radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)',
        bottom: -100,
        left: -100,
      }
    }}>
      <Card sx={{
        maxWidth: 430,
        width: '100%',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(20px)',
        backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(7,23,39,0.85)',
        border: `1px solid ${mode === 'light' ? 'rgba(13,148,136,0.2)' : 'rgba(45,212,191,0.12)'}`,
        boxShadow: mode === 'light'
          ? '0 25px 50px -12px rgba(13,148,136,0.2)'
          : '0 25px 60px -12px rgba(0,0,0,0.8)',
        overflow: 'visible',
      }}>
        {/* Top accent bar */}
        <Box sx={{
          height: 4,
          background: 'linear-gradient(90deg, #0D9488 0%, #14B8A6 50%, #D97706 100%)',
          borderRadius: '14px 14px 0 0',
        }} />

        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{
              width: 64, height: 64, mb: 2,
              background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
              boxShadow: mode === 'light'
                ? '0 8px 24px rgba(13,148,136,0.35)'
                : '0 8px 24px rgba(45,212,191,0.3)',
            }}>
              <ShieldCheck size={30} color="#ffffff" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}>
              Admin Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Gondaliya Family Directory Administration
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleLoginSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Phone Number"
                fullWidth
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                label="Password"
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  mt: 0.5,
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: 2,
                  boxShadow: mode === 'light'
                    ? '0 8px 24px rgba(13,148,136,0.35)'
                    : '0 8px 24px rgba(45,212,191,0.25)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Dashboard'}
              </Button>
            </Box>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
            Restricted to administrators only. Unauthorized access is prohibited.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
