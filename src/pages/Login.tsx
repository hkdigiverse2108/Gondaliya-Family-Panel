import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Phone as PhoneIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';
import FamilyLogo from '../components/FamilyLogo';

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
        ? 'linear-gradient(135deg, #F5F7FB 0%, #E0E7FF 50%, #D1FAE5 100%)'
        : 'linear-gradient(135deg, #0B0F19 0%, #171C35 50%, #0F2D24 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: mode === 'light'
          ? 'radial-gradient(circle, rgba(46,49,146,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
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
          ? 'radial-gradient(circle, rgba(18,155,99,0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(34,211,125,0.06) 0%, transparent 70%)',
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
        backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(17,24,39,0.85)',
        border: `1px solid ${mode === 'light' ? 'rgba(46,49,146,0.15)' : 'rgba(99,102,241,0.15)'}`,
        boxShadow: mode === 'light'
          ? '0 25px 50px -12px rgba(46,49,146,0.18)'
          : '0 25px 60px -12px rgba(0,0,0,0.8)',
        overflow: 'visible',
      }}>
        {/* Top accent bar */}
        <Box sx={{
          height: 4,
          background: 'linear-gradient(90deg, #2E3192 0%, #129B63 100%)',
          borderRadius: '14px 14px 0 0',
        }} />

        <CardContent sx={{ p: 4 }}>
          {/* Logo Centerpiece */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ width: 140, height: 140, mb: 1, mt: -1 }}>
              <FamilyLogo size={140} variant="full" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5, mt: 1 }}>
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
                    ? '0 8px 24px rgba(46,49,146,0.25)'
                    : '0 8px 24px rgba(99,102,241,0.25)',
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
