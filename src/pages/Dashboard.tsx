import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme
} from '@mui/material';
import { 
  Users as UsersIcon, 
  MapPin as MapIcon, 
  CheckCircle2 as ActiveIcon, 
  PlusCircle as PlusIcon, 
  Activity, 
  TrendingUp, 
  HeartHandshake
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

export const Dashboard: React.FC = () => {
  const { mode } = useThemeMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalVillages: 0,
    totalDistricts: 0
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [bloodGroupData, setBloodGroupData] = useState<any[]>([]);
  const [houseTypeData, setHouseTypeData] = useState<any[]>([]);
  const [villageData, setVillageData] = useState<any[]>([]);

  const COLORS = ['#2E3192', '#129B63', '#4F52C9', '#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#EC4899'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard');
      const resData = response.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || response.status === 200;
      if (isOk) {
        const payload = resData.data;
        setStats(payload.stats || { totalMembers: 0, activeMembers: 0, totalVillages: 0, totalDistricts: 0 });
        setRecentUsers(payload.recentUsers || []);
        setBloodGroupData(payload.bloodGroupData || []);
        setHouseTypeData(payload.houseTypeData || []);
        setVillageData(payload.villageData || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load dashboard statistics!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  const statCards = [
    { 
      title: 'Total Members', 
      value: stats.totalMembers, 
      icon: <UsersIcon size={24} />, 
      color: mode === 'light' ? '#2E3192' : '#6366F1',
      bgGradient: mode === 'light' 
        ? 'linear-gradient(135deg, rgba(46, 49, 146, 0.08) 0%, rgba(46, 49, 146, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.03) 100%)'
    },
    { 
      title: 'Active Accounts', 
      value: stats.activeMembers, 
      icon: <ActiveIcon size={24} />, 
      color: mode === 'light' ? '#129B63' : '#1EC47D',
      bgGradient: mode === 'light' 
        ? 'linear-gradient(135deg, rgba(18, 155, 99, 0.08) 0%, rgba(18, 155, 99, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(30, 196, 125, 0.15) 0%, rgba(30, 196, 125, 0.03) 100%)'
    },
    { 
      title: 'Master Villages', 
      value: stats.totalVillages, 
      icon: <MapIcon size={24} />, 
      color: '#F59E0B',
      bgGradient: mode === 'light' 
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.03) 100%)'
    },
    { 
      title: 'Total Districts', 
      value: stats.totalDistricts, 
      icon: <Activity size={24} />, 
      color: '#3B82F6',
      bgGradient: mode === 'light' 
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.03) 100%)'
    },
  ];

  return (
    <Box sx={{ py: 2 }}>
      {/* Welcome Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.8 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Dynamic real-time summary of the Gondaliya Family registry database
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="contained" 
            startIcon={<PlusIcon size={18} />} 
            onClick={() => navigate('/users')}
            sx={{ fontWeight: 600 }}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ 
              background: card.bgGradient,
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0, right: 0, width: 4, height: '100%',
                backgroundColor: card.color
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Avatar sx={{ 
                    bgcolor: mode === 'light' ? '#FFFFFF' : '#1F2937', 
                    color: card.color,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    border: `1px solid ${mode === 'light' ? '#E2E8F0' : '#374151'}`
                  }}>
                    {card.icon}
                  </Avatar>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10B981', fontWeight: 600 }}>
                  <TrendingUp size={14} /> Synchronized live
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Village Demographics */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Members by Villages (Top 6)
              </Typography>
              <Box sx={{ height: 320 }}>
                {villageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={villageData}>
                      <XAxis dataKey="name" stroke={mode === 'light' ? '#475569' : '#94A3B8'} fontSize={12} tickLine={false} />
                      <YAxis stroke={mode === 'light' ? '#475569' : '#94A3B8'} fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
                          borderColor: mode === 'light' ? '#E2E8F0' : '#334155',
                          borderRadius: 8
                        }} 
                      />
                      <Bar dataKey="count" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} barSize={38} />
                    </ReBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">No data available for villages.</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* House Type Ratio */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                House Ownership
              </Typography>
              <Box sx={{ height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                {houseTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="80%">
                    <RePieChart>
                      <Pie
                        data={houseTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {houseTypeData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
                          borderColor: mode === 'light' ? '#E2E8F0' : '#334155',
                          borderRadius: 8
                        }} 
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary">No house type data available.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Charts Row & Recent Members */}
      <Grid container spacing={3}>
        {/* Family Member Blood Groups */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HeartHandshake size={20} color="#EF4444" /> Blood Groups (Emergency Registry)
              </Typography>
              <Box sx={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {bloodGroupData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={bloodGroupData}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      >
                        {bloodGroupData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                    No blood groups registered in family members yet. Add family members with blood groups to populate.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recently Registered Members */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Family Additions
              </Typography>
              {recentUsers.length > 0 ? (
                <TableContainer component={Paper} elevation={0} sx={{ border: 'none', backgroundColor: 'transparent' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Sr. No.</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Village</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentUsers.map((userItem, index) => (
                        <TableRow key={userItem._id}>
                          <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {`${userItem.firstName} ${userItem.lastName}`}
                          </TableCell>
                          <TableCell>{userItem.phoneNumber}</TableCell>
                          <TableCell>{userItem.village || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={userItem.isActive ? 'Active' : 'Blocked'} 
                              color={userItem.isActive ? 'success' : 'error'} 
                              size="small" 
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography color="text.secondary">No registered members found.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
