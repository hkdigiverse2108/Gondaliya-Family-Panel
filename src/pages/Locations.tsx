import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Switch, Pagination, FormControl, InputLabel,
  Select, MenuItem, Chip, Tooltip, Avatar, Divider, InputAdornment
} from '@mui/material';
import { Search, Plus, Edit2, Trash2, MapPin, Map, Navigation, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

export const Locations: React.FC = () => {
  const { mode } = useThemeMode();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    village: '',
    taluka: '',
    district: '',
    pincode: '',     // optional
    isActive: true   // only used in edit mode
  });

  const fetchingRef = useRef(false);

  const fetchLocations = useCallback(async (overridePage?: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const params: any = {
        page: overridePage ?? page,
        limit,
        search: search || undefined
      };
      if (activeFilter !== 'all') params.activeFilter = activeFilter;

      const response = await api.get('/location/all', { params });
      const resData = response.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || response.status === 200;
      if (isOk) {
        const items = resData.data?.data ?? resData.data ?? [];
        const total =
          resData.data?.totalData ?? resData.data?.total ??
          resData.totalData ?? resData.total ??
          (Array.isArray(items) ? items.length : 0);
        setLocations(Array.isArray(items) ? items : []);
        setTotalData(Number(total) || 0);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load locations.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, activeFilter, search, limit]);

  useEffect(() => {
    fetchLocations();
  }, [page, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLocations(1);
  };

  const resetForm = () => setFormData({ village: '', taluka: '', district: '', pincode: '', isActive: true });

  const handleOpenAddForm = () => {
    setIsEditMode(false);
    resetForm();
    setFormOpen(true);
  };

  const handleOpenEditForm = (loc: any) => {
    setIsEditMode(true);
    setCurrentLocation(loc);
    setFormData({
      village: loc.village || '',
      taluka: loc.taluka || '',
      district: loc.district || '',
      pincode: loc.pincode || '',
      isActive: loc.isActive ?? true
    });
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.village.trim() || !formData.taluka.trim() || !formData.district.trim()) {
      toast.error('Village, Taluka, and District are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        village: formData.village,
        taluka: formData.taluka,
        district: formData.district,
      };
      if (formData.pincode) payload.pincode = formData.pincode;
      // isActive only sent on edit
      if (isEditMode) payload.isActive = formData.isActive;

      const response = isEditMode
        ? await api.put('/location/update', { id: currentLocation._id, ...payload })
        : await api.post('/location/add', payload);

      const resData = response.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || response.status === 200;
      if (isOk) {
        toast.success(isEditMode ? 'Location updated!' : 'Location added!');
        setFormOpen(false);
        fetchLocations();
      } else {
        toast.error(resData?.message || 'Operation failed.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (loc: any) => {
    try {
      const response = await api.put('/location/update', { id: loc._id, isActive: !loc.isActive });
      const resData = response.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || response.status === 200;
      if (isOk) {
        toast.success(`Location ${!loc.isActive ? 'activated' : 'deactivated'}.`);
        fetchLocations();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  const handleOpenDelete = (loc: any) => { setCurrentLocation(loc); setDeleteOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!currentLocation) return;
    setSubmitting(true);
    try {
      const response = await api.delete(`/location/${currentLocation._id}`);
      const resData = response.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || response.status === 200;
      if (isOk) {
        toast.success('Location deleted.');
        setDeleteOpen(false);
        fetchLocations();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete location.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalData / limit));
  const activeCount = locations.filter(l => l.isActive).length;
  const inactiveCount = locations.filter(l => !l.isActive).length;

  return (
    <Box sx={{ py: 1 }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            Location Master
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Manage villages, talukas, districts and pincodes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenAddForm}
          sx={{ fontWeight: 700, px: 3, whiteSpace: 'nowrap' }}
        >
          Add Location
        </Button>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: totalData, color: mode === 'light' ? '#2E3192' : '#6366F1', icon: <MapPin size={20} /> },
          { label: 'Active', value: activeCount, color: '#10B981', icon: <ToggleRight size={20} /> },
          { label: 'Inactive', value: inactiveCount, color: '#F59E0B', icon: <ToggleLeft size={20} /> },
        ].map((s) => (
          <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
            <Card sx={{ border: `1px solid ${s.color}22` }}>
              <CardContent sx={{ p: '14px 18px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${s.color}18`, color: s.color, width: 42, height: 42 }}>
                  {s.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label} Locations</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Search Bar ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: '12px 20px !important' }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth size="small"
                  placeholder="Search village, taluka, district, pincode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={16} style={{ color: '#94A3B8' }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 8, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={activeFilter} label="Status"
                    onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4, sm: 2 }}>
                <Button type="submit" variant="outlined" fullWidth sx={{ fontWeight: 600 }}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={44} color="primary" />
          </Box>
        ) : locations.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sr. No.</TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><Navigation size={13} />Village</Box></TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><Map size={13} />Taluka</Box></TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><MapPin size={13} />District</Box></TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}><Hash size={13} />Pincode</Box></TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.map((loc, index) => (
                    <TableRow key={loc._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{loc.village}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{loc.taluka}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={loc.district} size="small" sx={{
                          fontWeight: 600, fontSize: '0.72rem',
                          bgcolor: mode === 'light' ? 'rgba(46,49,146,0.1)' : 'rgba(99,102,241,0.1)',
                          color: mode === 'light' ? '#2E3192' : '#6366F1',
                        }} />
                      </TableCell>
                      <TableCell>
                        {loc.pincode
                          ? <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#D97706' }}>{loc.pincode}</Typography>
                          : <Typography variant="caption" color="text.disabled">—</Typography>
                        }
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          <Switch checked={loc.isActive} onChange={() => handleToggleActive(loc)} color="success" size="small" />
                          <Chip
                            label={loc.isActive ? 'Active' : 'Inactive'}
                            color={loc.isActive ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.68rem', height: 18 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditForm(loc)} sx={{ borderRadius: 1.5 }}>
                              <Edit2 size={15} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleOpenDelete(loc)} sx={{ borderRadius: 1.5 }}>
                              <Trash2 size={15} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: `1px solid`, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Showing {locations.length} of {totalData} locations
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                shape="rounded"
                size="small"
              />
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
            <Avatar sx={{ bgcolor: mode === 'light' ? 'rgba(46,49,146,0.1)' : 'rgba(99,102,241,0.1)', width: 64, height: 64 }}>
              <MapPin size={28} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>No Locations Found</Typography>
            <Typography variant="body2" color="text.secondary">Try different search terms or add the first location.</Typography>
            <Button variant="contained" onClick={handleOpenAddForm} startIcon={<Plus size={16} />}>Add Location</Button>
          </Box>
        )}
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogTitle sx={{ p: 3, pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: mode === 'light' ? 'rgba(46,49,146,0.1)' : 'rgba(99,102,241,0.1)', width: 40, height: 40 }}>
              {isEditMode ? <Edit2 size={18} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} /> : <Plus size={18} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} />}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {isEditMode ? 'Edit Location' : 'Add New Location'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEditMode ? 'Update existing record' : 'Village, Taluka & District are required'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <Divider sx={{ mx: 3 }} />
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth label="Village Name" required
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Navigation size={15} style={{ color: mode === 'light' ? '#2E3192' : '#6366F1' }} /></InputAdornment> } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Taluka" required
                value={formData.taluka}
                onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Map size={15} style={{ color: '#10B981' }} /></InputAdornment> } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="District" required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><MapPin size={15} style={{ color: '#D97706' }} /></InputAdornment> } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth label="Pincode (Optional)"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                placeholder="6-digit pincode"
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start"><Hash size={15} style={{ color: '#94A3B8' }} /></InputAdornment> },
                  htmlInput: { maxLength: 6 }
                }}
              />
            </Grid>
            {/* isActive ONLY shown in Edit mode */}
            {isEditMode && (
              <Grid size={12}>
                <Card sx={{ bgcolor: 'transparent', border: '1px dashed', borderColor: 'divider' }}>
                  <CardContent sx={{ p: '12px 16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Active Status</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.isActive ? 'Visible in dropdowns' : 'Hidden from dropdowns'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={formData.isActive ? 'Active' : 'Inactive'} color={formData.isActive ? 'success' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                      <Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} color="success" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" disabled={submitting} sx={{ flex: 2, fontWeight: 700 }}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? 'Save Changes' : 'Add Location')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} sx={{ '& .MuiDialog-paper': { maxWidth: 420 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(239,68,68,0.1)', width: 40, height: 40 }}>
              <Trash2 size={18} style={{ color: '#EF4444' }} />
            </Avatar>
            Confirm Delete
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Remove <strong style={{ color: '#EF4444' }}>
              {currentLocation ? `${currentLocation.village}, ${currentLocation.taluka}` : 'this location'}
            </strong> from the master directory? This removes it from all cascading dropdowns.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={submitting} sx={{ flex: 1, fontWeight: 700 }}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Locations;
