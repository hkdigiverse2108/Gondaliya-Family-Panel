import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Grid, Divider, InputAdornment, IconButton, Avatar
} from '@mui/material';
import { ShieldCheck, Key, Eye, EyeOff, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

export const ChangePassword: React.FC = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.phoneNumber) { toast.error('Admin phone number not found in session.'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters long.'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/reset-password', { phoneNumber: user.phoneNumber, password });
      const resData = response.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || response.status === 200;
      if (isOk) {
        toast.success('Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(resData?.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not update credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const tips = [
    'Use at least 6 characters',
    'Mix letters, numbers & symbols',
    'Avoid common words or dates',
    'Store your credentials safely',
  ];

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Security Settings
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Update your administrator account password
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Change Password Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            {/* Top accent */}
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #2E3192 0%, #129B63 100%)' }} />
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
                <Avatar sx={{
                  bgcolor: mode === 'light' ? 'rgba(46,49,146,0.08)' : 'rgba(99,102,241,0.15)',
                  width: 46, height: 46
                }}>
                  <ShieldCheck size={22} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Change Admin Password
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All sessions will require re-authentication
                  </Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Account (read-only) */}
                  <TextField
                    fullWidth
                    label="Logged-in Account"
                    disabled
                    value={user?.phoneNumber || ''}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key size={17} style={{ color: '#94A3B8' }} />
                          </InputAdornment>
                        )
                      }
                    }}
                  />

                  <Divider sx={{ my: 0.5 }} />

                  {/* New Password */}
                  <TextField
                    fullWidth
                    type={showPass ? 'text' : 'password'}
                    label="New Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key size={17} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />

                  {/* Confirm Password */}
                  <TextField
                    fullWidth
                    type={showConfirmPass ? 'text' : 'password'}
                    label="Confirm New Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    error={!!confirmPassword && password !== confirmPassword}
                    helperText={!!confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key size={17} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end" size="small">
                              {showConfirmPass ? <EyeOff size={17} /> : <Eye size={17} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    sx={{ py: 1.5, fontWeight: 800, mt: 0.5 }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Tips panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{
            height: '100%',
            background: mode === 'light'
              ? 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FB 100%)'
              : 'linear-gradient(135deg, #111827 0%, #0B0F19 100%)',
            border: `1px solid ${mode === 'light' ? '#E2E8F0' : '#1F2937'}`,
          }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ bgcolor: mode === 'light' ? 'rgba(46,49,146,0.12)' : 'rgba(99,102,241,0.18)', width: 40, height: 40 }}>
                  <Info size={18} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Password Policy
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {tips.map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: mode === 'light'
                        ? 'linear-gradient(135deg, #2E3192, #1B1C63)'
                        : 'linear-gradient(135deg, #6366F1, #4F46E5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800, color: '#ffffff',
                    }}>
                      {i + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, pt: 0.2 }}>
                      {tip}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{
                p: 2, borderRadius: 2,
                bgcolor: mode === 'light' ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.15)'
              }}>
                <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  ⚠ Important
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Self-service signup and forgot-password are disabled on this panel. Keep your credentials in a secure place.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChangePassword;
