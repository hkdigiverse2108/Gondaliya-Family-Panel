import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Switch,
  Divider,
  Pagination
} from '@mui/material';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  UserPlus,
  Trash,
  Phone,
  MapPin,
  Home,
  Briefcase,
  GraduationCap,
  Calendar,
  Heart,
  Wrench,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

export const Users: React.FC = () => {
  const { mode } = useThemeMode();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Users data states
  const [users, setUsers] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Locations dropdown caching
  const [districts, setDistricts] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  // Dialog / Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Active form state
  const [formTab, setFormTab] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    phoneNumber2: '',
    password: '',
    profilePhoto: '',
    district: '',
    taluka: '',
    village: '',
    pincode: '',
    currentAddress: '',
    houseType: '',
    isActive: true,
    familyMembers: [] as any[]
  });

  // Enums mapped from backend definitions
  const HOUSE_TYPES = ['Own', 'Rented'];
  const RELATIONS = ['Father', 'Mother', 'Husband', 'Wife', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Daughter-in-law', 'Son-in-law', 'Other'];
  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchingRef = useRef(false);
  const districtsLoadedRef = useRef(false);

  useEffect(() => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    fetchUsers().finally(() => { fetchingRef.current = false; });
  }, [page, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDistricts();
  }, []);

  // Fetch Users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit, search: search || undefined };
      if (activeFilter !== 'all') params.activeFilter = activeFilter;

      const response = await api.get('/user', { params });
      const resData = response.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || response.status === 200;
      if (isOk) {
        setUsers(resData.data?.data || resData.data || []);
        setTotalData(resData.data?.totalData || resData.totalData || 0);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load family registry directory.');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, search, limit]);

  // Location APIs — districts fetched only once (cached in ref), talukas/villages on selection
  const fetchDistricts = useCallback(async () => {
    if (districtsLoadedRef.current) return; // prevent repeat calls
    try {
      const res = await api.get('/location/districts');
      const resData = res.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || res.status === 200;
      if (isOk) {
        const data = resData.data || [];
        setDistricts(Array.isArray(data) ? data : []);
        districtsLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  }, []);

  const handleDistrictChange = async (districtName: string) => {
    setFormData(prev => ({ ...prev, district: districtName, taluka: '', village: '', pincode: '' }));
    setTalukas([]);
    setVillages([]);
    if (!districtName) return;

    try {
      const res = await api.get('/location/talukas', { params: { district: districtName } });
      const resData = res.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || res.status === 200;
      if (isOk) setTalukas(Array.isArray(resData.data) ? resData.data : []);
    } catch (err) {
      console.error('Error fetching talukas:', err);
    }
  };

  const handleTalukaChange = async (talukaName: string) => {
    setFormData(prev => ({ ...prev, taluka: talukaName, village: '', pincode: '' }));
    setVillages([]);
    if (!talukaName || !formData.district) return;

    try {
      const res = await api.get('/location/villages', {
        params: { district: formData.district, taluka: talukaName }
      });
      const resData = res.data;
      const isOk = resData?.statusCode === 200 || resData?.status === 200 || res.status === 200;
      if (isOk) setVillages(Array.isArray(resData.data) ? resData.data : []);
    } catch (err) {
      console.error('Error fetching villages:', err);
    }
  };

  const handleVillageChange = (villageName: string) => {
    const selectedVillageObj = villages.find(v => v.village === villageName);
    setFormData(prev => ({ 
      ...prev, 
      village: villageName,
      pincode: selectedVillageObj ? selectedVillageObj.pincode : '' 
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Add / Edit Modal handlers
  const handleOpenAddForm = () => {
    setIsEditMode(false);
    setFormTab(0);
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      phoneNumber: '',
      phoneNumber2: '',
      password: '',
      profilePhoto: '',
      district: '',
      taluka: '',
      village: '',
      pincode: '',
      currentAddress: '',
      houseType: '',
      isActive: true,
      familyMembers: []
    });
    setTalukas([]);
    setVillages([]);
    fetchDistricts(); // Load districts when form opens
    setFormOpen(true);
  };

  const handleOpenEditForm = async (userObj: any) => {
    setIsEditMode(true);
    setFormTab(0);
    
    // Prefill form
    setFormData({
      firstName: userObj.firstName || '',
      middleName: userObj.middleName || '',
      lastName: userObj.lastName || '',
      phoneNumber: userObj.phoneNumber || '',
      phoneNumber2: userObj.phoneNumber2 || '',
      password: '', // Optional during edit
      profilePhoto: userObj.profilePhoto || '',
      district: userObj.district || '',
      taluka: userObj.taluka || '',
      village: userObj.village || '',
      pincode: userObj.pincode || '',
      currentAddress: userObj.currentAddress || '',
      houseType: userObj.houseType || '',
      isActive: userObj.isActive ?? true,
      familyMembers: userObj.familyMembers ? [...userObj.familyMembers] : []
    });

    setCurrentUser(userObj);
    fetchDistricts(); // Load districts when edit form opens
    setFormOpen(true);

    // Fetch related cascading locations if district/taluka is present
    if (userObj.district) {
      try {
        const talukasRes = await api.get('/location/talukas', { params: { district: userObj.district } });
        const tResData = talukasRes.data;
        const tOk = tResData?.statusCode === 200 || tResData?.status === 200 || talukasRes.status === 200;
        if (tOk) setTalukas(Array.isArray(tResData.data) ? tResData.data : []);

        if (userObj.taluka) {
          const villagesRes = await api.get('/location/villages', {
            params: { district: userObj.district, taluka: userObj.taluka }
          });
          const vResData = villagesRes.data;
          const vOk = vResData?.statusCode === 200 || vResData?.status === 200 || villagesRes.status === 200;
          if (vOk) setVillages(Array.isArray(vResData.data) ? vResData.data : []);
        }
      } catch (err) {
        console.error('Cascading prefill error:', err);
      }
    }
  };

  // Form submit handler
  const handleFormSubmit = async () => {
    // Validate inputs
    if (!formData.firstName || !formData.middleName || !formData.lastName) {
      toast.error('First Name, Middle Name, and Last Name are required.');
      return;
    }
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit primary phone number.');
      return;
    }
    if (!isEditMode && !formData.password) {
      toast.error('Password is required when creating a new user.');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      const payload: any = { ...formData };
      if (!payload.phoneNumber2) delete payload.phoneNumber2;
      if (!payload.profilePhoto) delete payload.profilePhoto;
      if (!payload.currentAddress) delete payload.currentAddress;
      if (!payload.houseType) delete payload.houseType;
      
      // Clean empty nested family members fields
      payload.familyMembers = payload.familyMembers.map((m: any) => {
        const cleaned: any = { ...m };
        if (!cleaned.fullName) delete cleaned.fullName;
        if (!cleaned.relation) delete cleaned.relation;
        if (!cleaned.dob) delete cleaned.dob;
        if (!cleaned.education) delete cleaned.education;
        if (!cleaned.occupation) delete cleaned.occupation;
        if (!cleaned.isMarried) delete cleaned.isMarried;
        if (!cleaned.bloodGroup) delete cleaned.bloodGroup;
        if (!cleaned.skills) delete cleaned.skills;
        if (!cleaned.phoneNumber) delete cleaned.phoneNumber;
        return cleaned;
      });

      if (isEditMode) {
        payload.userId = currentUser._id;
        if (!payload.password) delete payload.password; // Do not send empty password on update
        response = await api.put('/user/update', payload);
      } else {
        response = await api.post('/user/add', payload);
      }

      if (response.data && response.data.statusCode === 200) {
        toast.success(isEditMode ? 'Family member updated successfully!' : 'Family member created successfully!');
        setFormOpen(false);
        fetchUsers();
      } else {
        toast.error(response.data?.message || 'Operation failed.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to complete user registry change.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active state
  const handleToggleActive = async (userObj: any) => {
    try {
      const response = await api.put('/user/update', {
        userId: userObj._id,
        isActive: !userObj.isActive
      });
      if (response.data && response.data.statusCode === 200) {
        toast.success(`User successfully ${!userObj.isActive ? 'activated' : 'blocked'}.`);
        fetchUsers();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to change user activation state.');
    }
  };

  // Delete handlers
  const handleOpenDelete = (userObj: any) => {
    setCurrentUser(userObj);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const response = await api.delete(`/user/${currentUser._id}`);
      if (response.data && response.data.statusCode === 200) {
        toast.success('Family member successfully deleted from registry.');
        setDeleteOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete registry entry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Nested Family Members Managers
  const handleAddFamilyMemberRow = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        {
          fullName: '',
          relation: '',
          dob: '',
          education: '',
          occupation: '',
          isMarried: '',
          bloodGroup: '',
          skills: '',
          phoneNumber: ''
        }
      ]
    }));
  };

  const handleRemoveFamilyMemberRow = (index: number) => {
    const updated = [...formData.familyMembers];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, familyMembers: updated }));
  };

  const handleFamilyMemberChange = (index: number, field: string, value: any) => {
    const updated = [...formData.familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, familyMembers: updated }));
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2 
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.8 }}>
            Family Registry
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Manage, filter, and track Gondaliya family directories and records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenAddForm}
          sx={{ fontWeight: 600 }}
        >
          Add New Registry
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 5, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by first/last name, phone number, village..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <Search size={18} style={{ marginRight: 8, color: '#94A3B8' }} />
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={activeFilter}
                    label="Status"
                    onChange={(e) => {
                      setActiveFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="all">All Registries</MenuItem>
                    <MenuItem value="true">Active Only</MenuItem>
                    <MenuItem value="false">Blocked Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                <Button type="submit" variant="outlined" fullWidth sx={{ py: 1, fontWeight: 600 }}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : users.length > 0 ? (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Profile</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Village</TableCell>
                    <TableCell>Family Count</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userObj) => (
                    <TableRow key={userObj._id} hover>
                      <TableCell>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 38, height: 38 }}>
                          {userObj.firstName[0]}
                          {userObj.lastName[0]}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {`${userObj.firstName} ${userObj.middleName} ${userObj.lastName}`}
                      </TableCell>
                      <TableCell>{userObj.phoneNumber}</TableCell>
                      <TableCell>{userObj.village || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${userObj.familyMembers?.length || 0} Members`}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: mode === 'light' ? '#E0E7FF' : '#312E81', color: mode === 'light' ? '#4F46E5' : '#C7D2FE' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={userObj.isActive}
                          onChange={() => handleToggleActive(userObj)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => {
                              setCurrentUser(userObj);
                              setViewOpen(true);
                            }}
                          >
                            <Eye size={18} />
                          </IconButton>
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleOpenEditForm(userObj)}
                          >
                            <Edit2 size={18} />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleOpenDelete(userObj)}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={Math.ceil(totalData / limit)}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No Gondaliya family registries matched your search filters.
            </Typography>
            <Button variant="contained" onClick={handleOpenAddForm}>
              Add First Family Registry
            </Button>
          </Box>
        )}
      </Card>

      {/* Add / Edit dialog */}
      <Dialog 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        maxWidth="lg" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, p: 3 }}>
          {isEditMode ? 'Update Family Registry Entry' : 'Create New Family Registry Entry'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs 
            value={formTab} 
            onChange={(_, val) => setFormTab(val)}
            variant="fullWidth"
            sx={{ borderBottom: `1px solid ${mode === 'light' ? '#E2E8F0' : '#1F2937'}` }}
          >
            <Tab label="Personal & Address Details" sx={{ fontWeight: 600 }} />
            <Tab label={`Family Members (${formData.familyMembers.length})`} sx={{ fontWeight: 600 }} />
          </Tabs>

          {/* TAB 0: Personal and Address */}
          {formTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Middle Name (Father/Husband)"
                    required
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Primary Phone Number"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter 10 digit number"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Secondary Phone Number (Optional)"
                    value={formData.phoneNumber2}
                    onChange={(e) => setFormData({ ...formData, phoneNumber2: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter 10 digit number"
                  />
                </Grid>

                {!isEditMode && (
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Account Password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </Grid>
                )}

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Profile Photo URL (Optional)"
                    value={formData.profilePhoto}
                    onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                    placeholder="Enter visual avatar link"
                  />
                </Grid>

                <Grid size={12}><Divider sx={{ my: 1 }}><Chip label="Location & Address" size="small" /></Divider></Grid>

                {/* CASCADE SELECTORS */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Select District</InputLabel>
                    <Select
                      value={formData.district}
                      label="Select District"
                      onChange={(e) => handleDistrictChange(e.target.value)}
                    >
                      <MenuItem value="">-- Select --</MenuItem>
                      {districts.map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth disabled={!formData.district}>
                    <InputLabel>Select Taluka</InputLabel>
                    <Select
                      value={formData.taluka}
                      label="Select Taluka"
                      onChange={(e) => handleTalukaChange(e.target.value)}
                    >
                      <MenuItem value="">-- Select --</MenuItem>
                      {talukas.map(t => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth disabled={!formData.taluka}>
                    <InputLabel>Select Village</InputLabel>
                    <Select
                      value={formData.village}
                      label="Select Village"
                      onChange={(e) => handleVillageChange(e.target.value)}
                    >
                      <MenuItem value="">-- Select --</MenuItem>
                      {villages.map(v => (
                        <MenuItem key={v._id} value={v.village}>{v.village}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    disabled
                    value={formData.pincode}
                    placeholder="Fetched from village"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>House Ownership Type</InputLabel>
                    <Select
                      value={formData.houseType}
                      label="House Ownership Type"
                      onChange={(e) => setFormData({ ...formData, houseType: e.target.value })}
                    >
                      <MenuItem value="">-- None --</MenuItem>
                      {HOUSE_TYPES.map(h => (
                        <MenuItem key={h} value={h}>{h}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
                    <Typography>Registry Status:</Typography>
                    <Chip 
                      label={formData.isActive ? 'Active' : 'Blocked'} 
                      color={formData.isActive ? 'success' : 'error'} 
                      sx={{ fontWeight: 600 }}
                    />
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  </Box>
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Current Address Details"
                    value={formData.currentAddress}
                    onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 1: Nested Family Members Manager */}
          {formTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Add nested family details (Children, Spouse, Father, Mother, etc.)
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<UserPlus size={16} />}
                  onClick={handleAddFamilyMemberRow}
                  sx={{ fontWeight: 600 }}
                >
                  Add Member Row
                </Button>
              </Box>

              {formData.familyMembers.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {formData.familyMembers.map((member, index) => (
                    <Paper 
                      key={index} 
                      elevation={0} 
                      sx={{ 
                        p: 2.5, 
                        position: 'relative',
                        border: `1.5px solid ${mode === 'light' ? '#E2E8F0' : '#374151'}`,
                        borderRadius: 3
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleRemoveFamilyMemberRow(index)}
                        >
                          <Trash size={18} />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                        Family Member #{index + 1}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Full Name"
                            value={member.fullName}
                            onChange={(e) => handleFamilyMemberChange(index, 'fullName', e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Relation</InputLabel>
                            <Select
                              value={member.relation}
                              label="Relation"
                              onChange={(e) => handleFamilyMemberChange(index, 'relation', e.target.value)}
                            >
                              {RELATIONS.map(r => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Date of Birth"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={member.dob}
                            onChange={(e) => handleFamilyMemberChange(index, 'dob', e.target.value)}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Education Qualification"
                            value={member.education}
                            onChange={(e) => handleFamilyMemberChange(index, 'education', e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Occupation / Work"
                            value={member.occupation}
                            onChange={(e) => handleFamilyMemberChange(index, 'occupation', e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Marital Status</InputLabel>
                            <Select
                              value={member.isMarried}
                              label="Marital Status"
                              onChange={(e) => handleFamilyMemberChange(index, 'isMarried', e.target.value)}
                            >
                              <MenuItem value="married">Married</MenuItem>
                              <MenuItem value="unMarried">Single</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Blood Group</InputLabel>
                            <Select
                              value={member.bloodGroup}
                              label="Blood Group"
                              onChange={(e) => handleFamilyMemberChange(index, 'bloodGroup', e.target.value)}
                            >
                              {BLOOD_GROUPS.map(bg => (
                                <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Skills / Talents"
                            value={member.skills}
                            onChange={(e) => handleFamilyMemberChange(index, 'skills', e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Contact Phone"
                            value={member.phoneNumber}
                            onChange={(e) => handleFamilyMemberChange(index, 'phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Enter 10 digit number"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, border: '1.5px dashed #CBD5E1', borderRadius: 4 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>No family members registered inside this record yet.</Typography>
                  <Button variant="outlined" size="small" onClick={handleAddFamilyMemberRow}>
                    Add Family Member Row
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Save Entry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View modal */}
      <Dialog 
        open={viewOpen} 
        onClose={() => setViewOpen(false)} 
        maxWidth="md" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
      >
        {currentUser && (
          <>
            <DialogTitle sx={{ fontWeight: 800, p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                {currentUser.firstName[0]}{currentUser.lastName[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {`${currentUser.firstName} ${currentUser.middleName} ${currentUser.lastName}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gondaliya Family Registry Record Detail
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Phone size={18} style={{ color: '#6366F1' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Primary Phone</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentUser.phoneNumber}</Typography>
                    </Box>
                  </Box>
                  {currentUser.phoneNumber2 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Phone size={18} style={{ color: '#94A3B8' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Secondary Phone</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentUser.phoneNumber2}</Typography>
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Home size={18} style={{ color: '#D97706' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>House Type</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentUser.houseType || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <MapPin size={18} style={{ color: '#10B981' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>District / Taluka</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{`${currentUser.district || 'N/A'} / ${currentUser.taluka || 'N/A'}`}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <MapPin size={18} style={{ color: '#8B5CF6' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Village (Pincode)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{`${currentUser.village || 'N/A'} (${currentUser.pincode || 'N/A'})`}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <FileText size={18} style={{ color: '#EC4899' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Current Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentUser.currentAddress || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }}><Chip label="Family Members" size="small" /></Divider>

              {currentUser.familyMembers && currentUser.familyMembers.length > 0 ? (
                <Grid container spacing={2}>
                  {currentUser.familyMembers.map((member: any, i: number) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                      <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{member.fullName || 'No Name Provided'}</Typography>
                            <Chip label={member.relation || 'Relation'} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                          </Box>

                          <Grid container spacing={1}>
                            {member.dob && (
                              <Grid size={6} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Calendar size={13} style={{ color: '#6366F1' }} />
                                <Typography variant="caption">{member.dob}</Typography>
                              </Grid>
                            )}
                            {member.bloodGroup && (
                              <Grid size={6} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Heart size={13} style={{ color: '#EF4444' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#EF4444' }}>{member.bloodGroup}</Typography>
                              </Grid>
                            )}
                            {member.education && (
                              <Grid size={6} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <GraduationCap size={13} style={{ color: '#10B981' }} />
                                <Typography variant="caption" noWrap>{member.education}</Typography>
                              </Grid>
                            )}
                            {member.occupation && (
                              <Grid size={6} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Briefcase size={13} style={{ color: '#D97706' }} />
                                <Typography variant="caption" noWrap>{member.occupation}</Typography>
                              </Grid>
                            )}
                            {member.skills && (
                              <Grid size={12} sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.5 }}>
                                <Wrench size={13} style={{ color: '#EC4899' }} />
                                <Typography variant="caption" noWrap sx={{ fontStyle: 'italic' }}>Skills: {member.skills}</Typography>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No nested family members registered inside this record.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setViewOpen(false)} variant="contained">
                Close Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you absolutely sure you want to delete <b>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'this user'}</b> from the family registry? This action is permanent.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
