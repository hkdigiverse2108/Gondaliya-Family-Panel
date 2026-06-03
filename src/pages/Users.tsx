import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Chip,
  Avatar, Tabs, Tab, Switch, Pagination, Drawer, Tooltip,
  RadioGroup, FormControlLabel, Radio, InputAdornment, Grid, Autocomplete
} from '@mui/material';
import {
  Search, Plus, Edit2, Trash2, Trash, Phone, MapPin,
  Briefcase, Building, Mail, Globe, Upload, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useThemeMode } from '../context/ThemeContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const parseDate = (dateStr: string) => {
  if (!dateStr) return null;
  let parsed = dayjs(dateStr, 'DD/MM/YYYY', true);
  if (parsed.isValid()) return parsed;
  parsed = dayjs(dateStr, 'YYYY-MM-DD', true);
  if (parsed.isValid()) return parsed;
  parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed : null;
};

const BUSINESS_JOB_CATEGORIES: { [key: string]: string[] } = {
  "IT & Software": [
    "Software Developer", "Web Developer", "Mobile App Developer", "UI/UX Designer",
    "Graphic Designer", "QA Tester", "Network Engineer", "Hardware Engineer",
    "Data Entry Operator", "IT Support", "Other Jobs"
  ],
  "Accounting & Finance": [
    "Accountant", "CA Article", "Billing Executive", "Cashier", "GST Executive",
    "Finance Manager", "Banking Staff", "Other Jobs"
  ],
  "Sales & Marketing": [
    "Sales Executive", "Marketing Executive", "Telecaller", "Digital Marketing",
    "Field Sales", "Business Development", "SEO Executive", "Other Jobs"
  ],
  "Office & Administration": [
    "Office Assistant", "Back Office Staff", "Receptionist", "Computer Operator",
    "Office Manager", "Admin Executive", "Other Jobs"
  ],
  "Medical & Healthcare": [
    "Doctor", "Nurse", "Pharmacist", "Lab Technician", "Compounder",
    "Medical Representative", "Hospital Staff", "Other Jobs"
  ],
  "Education & Training": [
    "Teacher", "Professor", "Tuition Teacher", "Computer Trainer",
    "Spoken English Trainer", "Coaching Staff", "Other Jobs"
  ],
  "Engineering": [
    "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Site Supervisor",
    "AutoCAD Designer", "Production Engineer", "Other Jobs"
  ],
  "Hotel & Restaurant": [
    "Chef", "Cook", "Waiter", "Kitchen Staff", "Hotel Manager", "Delivery Staff", "Other Jobs"
  ],
  "Retail & Shopping": [
    "Shop Staff", "Store Manager", "Salesman", "Cash Counter", "Showroom Staff", "Other Jobs"
  ],
  "Automobile": [
    "Car Mechanic", "Bike Mechanic", "Driver", "Service Advisor", "Washing Staff", "Other Jobs"
  ],
  "Beauty & Fashion": [
    "Beautician", "Hair Stylist", "Makeup Artist", "Fashion Designer", "Tailor", "Other Jobs"
  ],
  "Labour & Helper": [
    "Helper", "Packing Staff", "Loading Staff", "Factory Worker", "Labour", "Other Jobs"
  ],
  "Security & Housekeeping": [
    "Security Guard", "Watchman", "Cleaner", "Housekeeping Staff", "Other Jobs"
  ],
  "Delivery & Logistics": [
    "Delivery Boy", "Courier Staff", "Warehouse Staff", "Transport Coordinator", "Other Jobs"
  ],
  "Construction & Real Estate": [
    "Mason", "Tile Fitter", "Carpenter", "Painter", "Real Estate Executive", "Other Jobs"
  ],
  "Media & Entertainment": [
    "Photographer", "Videographer", "Video Editor", "Content Creator", "Anchor", "Other Jobs"
  ],
  "Agriculture & Farming": [
    "Farm Worker", "Dairy Staff", "Agriculture Officer", "Poultry Worker", "Other Jobs"
  ],
  "Freelance & Part Time": [
    "Freelancer", "Part Time Staff", "Work From Home", "Internship", "Other Jobs"
  ],
  "Customer Support": [
    "Customer Care", "Call Center", "Support Executive", "Help Desk Staff", "Other Jobs"
  ],
  "Miscellaneous": [
    "Any Graduate", "Fresher", "Experienced Staff", "Multi Task Staff", "Other Jobs"
  ]
};

const JOB_CATEGORIES = Object.keys(BUSINESS_JOB_CATEGORIES);

const RELATIONS = ['Father', 'Mother', 'Husband', 'Wife', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Daughter-in-law', 'Son-in-law', 'Other'];
const HOUSE_TYPES = ['Own', 'Rented'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  helperText?: string;
}

const FileUploadInput: React.FC<FileUploadProps> = ({ label, value, onChange, accept = "image/*", helperText }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (value) {
        fd.append('oldFileUrl', value);
      }
      const response = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response.data?.data?.url;
      if (url) {
        onChange(url);
        toast.success(`${label} uploaded successfully!`);
      } else {
        toast.error('Failed to get uploaded file URL.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: 'action.hover', position: 'relative' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      {value ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <img src={value} alt={label} style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" component="label" size="small" disabled={uploading} sx={{ textTransform: 'none' }}>
              Change
              <input type="file" hidden accept={accept} onChange={handleFileChange} />
            </Button>
            <Button variant="outlined" color="error" size="small" onClick={handleRemove} disabled={uploading} sx={{ textTransform: 'none' }}>
              Remove
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ py: 1 }}>
          {uploading ? (
            <CircularProgress size={24} sx={{ color: '#10B981' }} />
          ) : (
            <Button variant="contained" component="label" size="small" startIcon={<Upload size={14} />} sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, color: '#fff', textTransform: 'none' }}>
              Choose File
              <input type="file" hidden accept={accept} onChange={handleFileChange} />
            </Button>
          )}
          {helperText && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {helperText}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

interface MultipleFileUploadProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
}

const MultipleFileUploadInput: React.FC<MultipleFileUploadProps> = ({ label, values = [], onChange, accept = "image/*" }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response.data?.data?.url;
      if (url) {
        onChange([...values, url]);
        toast.success(`Photo uploaded successfully!`);
      } else {
        toast.error('Failed to get uploaded file URL.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(values.filter(url => url !== urlToRemove));
  };

  return (
    <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'action.hover' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      {values.length > 0 && (
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {values.map((url, idx) => (
            <Grid key={idx} size={{ xs: 4, sm: 3, md: 2 }} sx={{ position: 'relative' }}>
              <Box sx={{ position: 'relative', width: '100%', pt: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <img src={url} alt={`Preview ${idx}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <IconButton
                  size="small"
                  onClick={() => handleRemove(url)}
                  sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }, p: 0.5 }}
                >
                  <Trash size={12} />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ textAlign: 'center' }}>
        {uploading ? (
          <CircularProgress size={24} sx={{ color: '#10B981' }} />
        ) : (
          <Button variant="outlined" component="label" size="small" startIcon={<Plus size={14} />} sx={{ textTransform: 'none', borderColor: '#10B981', color: '#10B981', '&:hover': { borderColor: '#059669', color: '#059669' } }}>
            Add Photo
            <input type="file" hidden accept={accept} onChange={handleFileChange} />
          </Button>
        )}
      </Box>
    </Box>
  );
};

export const Users: React.FC = () => {
  const { mode } = useThemeMode();
  
  // Theme Colors (Navy & Emerald)
  const isLight = mode === 'light';
  const cardBg = isLight ? '#FFFFFF' : '#111827';
  const primaryBg = isLight ? '#F8FAFC' : '#0B1120';
  const navyColor = '#0F172A';
  const emeraldColor = '#10B981';
  const borderColor = isLight ? '#E2E8F0' : '#1F2937';

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
  const [showPassword, setShowPassword] = useState(false);

  // Locations dropdown caching
  const [allLocations, setAllLocations] = useState<any[]>([]);

  // Dialog / Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [workDetailsOpen, setWorkDetailsOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [drawerUser, setDrawerUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Active form state
  const [formTab, setFormTab] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', phoneNumber: '', phoneNumber2: '',
    password: '', profilePhoto: '', dob: '', bloodGroup: '', education: '', isMarried: '',
    nativeVillage: '', nativeTaluka: '', nativeDistrict: '',
    district: '', taluka: '', village: '',
    pincode: '', currentAddress: '', currentCity: '', currentState: '', houseType: '', isActive: true,
    familyMembers: [] as any[],
    workDetails: {
      hasOwnBusiness: null as boolean | null,
      businessDetails: {
        category: '',
        subCategory: [] as string[],
        businessName: '',
        ownerName: '',
        description: '',
        businessLogo: '',
        businessBanner: '',
        businessPhotos: [] as string[],
        locations: [] as any[],
        contactInfo: { mobile1: '', mobile2: '', email: '', website: '', portfolioLink: '' }
      },
      jobDetails: { jobCategory: '', jobRole: '', companyName: '', jobLocation: '' }
    }
  });

  // Derived location dropdown options
  const activeLocs = allLocations.filter((l: any) => l.isActive && !l.isDeleted);

  // ── Current Address Dropdown Options ──
  const currentDistricts = Array.from(new Set(activeLocs.map((l: any) => l.district).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const currentTalukas = Array.from(
    new Set(
      (formData.district
        ? activeLocs.filter((l: any) => l.district === formData.district)
        : activeLocs
      ).map((l: any) => l.taluka).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const currentVillages = (() => {
    let list = activeLocs;
    if (formData.taluka) {
      list = list.filter((l: any) => l.taluka === formData.taluka);
    } else if (formData.district) {
      list = list.filter((l: any) => l.district === formData.district);
    }
    const seen = new Set();
    return list.filter((l: any) => {
      const key = `${l.village}|${l.taluka}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.village.localeCompare(b.village));
  })();

  // ── Native Place Dropdown Options ──
  const nativeDistricts = Array.from(new Set(activeLocs.map((l: any) => l.district).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const nativeTalukas = Array.from(
    new Set(
      (formData.nativeDistrict
        ? activeLocs.filter((l: any) => l.district === formData.nativeDistrict)
        : activeLocs
      ).map((l: any) => l.taluka).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const nativeVillages = (() => {
    let list = activeLocs;
    if (formData.nativeTaluka) {
      list = list.filter((l: any) => l.taluka === formData.nativeTaluka);
    } else if (formData.nativeDistrict) {
      list = list.filter((l: any) => l.district === formData.nativeDistrict);
    }
    const seen = new Set();
    return list.filter((l: any) => {
      const key = `${l.village}|${l.taluka}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.village.localeCompare(b.village));
  })();

  // ── Current Address Handlers ──
  const handleCurrentVillageSelect = (newValue: any) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        village: newValue.village,
        taluka: newValue.taluka,
        district: newValue.district,
        pincode: newValue.pincode || prev.pincode || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        village: '',
        taluka: '',
        district: '',
        pincode: ''
      }));
    }
  };

  const handleCurrentTalukaSelect = (newValue: string | null) => {
    if (newValue) {
      const match = activeLocs.find((l: any) => l.taluka === newValue);
      setFormData(prev => {
        const updates: any = { taluka: newValue };
        if (match) {
          updates.district = match.district;
        }
        const currentVillageIsValid = activeLocs.some((l: any) => l.village === prev.village && l.taluka === newValue);
        if (!currentVillageIsValid) {
          updates.village = '';
          updates.pincode = '';
        }
        return { ...prev, ...updates };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        taluka: '',
        village: '',
        pincode: ''
      }));
    }
  };

  const handleCurrentDistrictSelect = (newValue: string | null) => {
    if (newValue) {
      setFormData(prev => {
        const updates: any = { district: newValue };
        const currentTalukaIsValid = activeLocs.some((l: any) => l.taluka === prev.taluka && l.district === newValue);
        if (!currentTalukaIsValid) {
          updates.taluka = '';
          updates.village = '';
          updates.pincode = '';
        }
        return { ...prev, ...updates };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        district: '',
        taluka: '',
        village: '',
        pincode: ''
      }));
    }
  };

  // ── Native Place Handlers ──
  const handleNativeVillageSelect = (newValue: any) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        nativeVillage: newValue.village,
        nativeTaluka: newValue.taluka,
        nativeDistrict: newValue.district
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        nativeVillage: '',
        nativeTaluka: '',
        nativeDistrict: ''
      }));
    }
  };

  const handleNativeTalukaSelect = (newValue: string | null) => {
    if (newValue) {
      const match = activeLocs.find((l: any) => l.taluka === newValue);
      setFormData(prev => {
        const updates: any = { nativeTaluka: newValue };
        if (match) {
          updates.nativeDistrict = match.district;
        }
        const currentVillageIsValid = activeLocs.some((l: any) => l.village === prev.nativeVillage && l.taluka === newValue);
        if (!currentVillageIsValid) {
          updates.nativeVillage = '';
        }
        return { ...prev, ...updates };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        nativeTaluka: '',
        nativeVillage: ''
      }));
    }
  };

  const handleNativeDistrictSelect = (newValue: string | null) => {
    if (newValue) {
      setFormData(prev => {
        const updates: any = { nativeDistrict: newValue };
        const currentTalukaIsValid = activeLocs.some((l: any) => l.taluka === prev.nativeTaluka && l.district === newValue);
        if (!currentTalukaIsValid) {
          updates.nativeTaluka = '';
          updates.nativeVillage = '';
        }
        return { ...prev, ...updates };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        nativeDistrict: '',
        nativeTaluka: '',
        nativeVillage: ''
      }));
    }
  };

  const fetchingRef = useRef(false);
  const districtsLoadedRef = useRef(false);

  useEffect(() => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    fetchUsers().finally(() => { fetchingRef.current = false; });
  }, [page, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAllLocations(); }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit, search: search || undefined };
      if (activeFilter !== 'all') params.activeFilter = activeFilter;
      const response = await api.get('/user/all', { params });
      const isOk = response.data?.statusCode === 200 || response.data?.status === 200 || response.status === 200;
      if (isOk) {
        setUsers(response.data.data?.data || []);
        setTotalData(response.data.data?.totalData || 0);
      }
    } catch (err: any) {
      toast.error('Failed to load family registry directory.');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, search, limit]);

  const fetchAllLocations = useCallback(async () => {
    if (districtsLoadedRef.current) return;
    try {
      const res = await api.get('/location/all', { params: { limit: 10000 } });
      const isOk = res.data?.statusCode === 200 || res.data?.status === 200 || res.status === 200;
      if (isOk) {
        const locs = res.data.data?.data || res.data.data || [];
        setAllLocations(locs);
        districtsLoadedRef.current = true;
      }
    } catch (err) { }
  }, []);



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const initFormData = () => ({
    firstName: '', middleName: '', lastName: '', phoneNumber: '', phoneNumber2: '',
    password: '', profilePhoto: '', dob: '', bloodGroup: '', education: '', isMarried: '',
    nativeVillage: '', nativeTaluka: '', nativeDistrict: '',
    district: '', taluka: '', village: '',
    pincode: '', currentAddress: '', currentCity: '', currentState: '', houseType: '', isActive: true,
    familyMembers: [],
    workDetails: {
      hasOwnBusiness: null,
      businessDetails: {
        category: '',
        subCategory: [],
        businessName: '',
        ownerName: '',
        description: '',
        businessLogo: '',
        businessBanner: '',
        businessPhotos: [],
        locations: [],
        contactInfo: { mobile1: '', mobile2: '', email: '', website: '', portfolioLink: '' }
      },
      jobDetails: { jobCategory: '', jobRole: '', companyName: '', jobLocation: '' }
    }
  });

  const handleOpenAddForm = async () => {
    setIsEditMode(false); setFormTab(0);
    setFormData(initFormData());
    setErrors({});
    
    if (!districtsLoadedRef.current) {
      try {
        const res = await api.get('/location/all', { params: { limit: 10000 } });
        const isOk = res.data?.statusCode === 200 || res.data?.status === 200 || res.status === 200;
        if (isOk) {
          const locs = res.data.data?.data || res.data.data || [];
          setAllLocations(locs);
          districtsLoadedRef.current = true;
        }
      } catch (err) {}
    }
    setFormOpen(true);
  };

  const handleOpenEditForm = async (userObj: any) => {
    setIsEditMode(true); setFormTab(0);
    const wd = userObj.workDetails || initFormData().workDetails;
    const bd = wd.businessDetails || initFormData().workDetails.businessDetails;
    setFormData({
      firstName: userObj.firstName || '', middleName: userObj.middleName || '',
      lastName: userObj.lastName || '', phoneNumber: userObj.phoneNumber || '',
      phoneNumber2: userObj.phoneNumber2 || '', password: '', profilePhoto: userObj.profilePhoto || '',
      dob: userObj.dob || '', bloodGroup: userObj.bloodGroup || '',
      education: userObj.education || '', isMarried: userObj.isMarried || '',
      nativeVillage: userObj.nativeVillage || '', nativeTaluka: userObj.nativeTaluka || '', nativeDistrict: userObj.nativeDistrict || '',
      district: userObj.district || '', taluka: userObj.taluka || '', village: userObj.village || '',
      pincode: userObj.pincode || '', currentAddress: userObj.currentAddress || '',
      currentCity: userObj.currentCity || '', currentState: userObj.currentState || '',
      houseType: userObj.houseType || '', isActive: userObj.isActive ?? true,
      familyMembers: userObj.familyMembers ? [...userObj.familyMembers] : [],
      workDetails: {
        hasOwnBusiness: wd.hasOwnBusiness ?? null,
        businessDetails: {
          category: bd.category || '',
          subCategory: Array.isArray(bd.subCategory) ? bd.subCategory : bd.subCategory ? [bd.subCategory] : [],
          businessName: bd.businessName || '',
          ownerName: bd.ownerName || '',
          description: bd.description || '',
          businessLogo: bd.businessLogo || '',
          businessBanner: bd.businessBanner || '',
          businessPhotos: bd.businessPhotos || [],
          locations: bd.locations || [],
          contactInfo: bd.contactInfo || { mobile1: '', mobile2: '', email: '', website: '', portfolioLink: '' }
        },
        jobDetails: wd.jobDetails || { jobCategory: '', jobRole: '', companyName: '', jobLocation: '' }
      }
    });
    setCurrentUser(userObj);
    setErrors({});
    
    if (!districtsLoadedRef.current) {
      try {
        const res = await api.get('/location/all', { params: { limit: 10000 } });
        const isOk = res.data?.statusCode === 200 || res.data?.status === 200 || res.status === 200;
        if (isOk) {
          const locs = res.data.data?.data || res.data.data || [];
          setAllLocations(locs);
          districtsLoadedRef.current = true;
        }
      } catch (err) {}
    }
    setFormOpen(true);
  };

  const handleNextTab = () => {
    if (formTab === 0) {
      const newErrors: any = {};
      if (!formData.firstName) newErrors.firstName = 'First Name is required';
      if (!formData.lastName) newErrors.lastName = 'Last Name is required';
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Primary Phone is required';
      if (!isEditMode && !formData.password) newErrors.password = 'Password is required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
    }
    setFormTab(formTab + 1);
  };

  const handleFormSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      toast.error('First Name, Last Name, and Phone Number are required.');
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      toast.error('Primary Phone number must be exactly 10 digits.');
      return;
    }
    if (formData.phoneNumber2 && formData.phoneNumber2.length !== 10) {
      toast.error('Secondary Phone number must be exactly 10 digits.');
      return;
    }

    setSubmitting(true);
    try {
      let payload: any = { ...formData };
      
      // Validate family members
      if (payload.familyMembers && Array.isArray(payload.familyMembers)) {
        for (let i = 0; i < payload.familyMembers.length; i++) {
          const m = payload.familyMembers[i];
          // If the family member row is empty, we can skip it, but let's check first name
          if (!m.firstName?.trim() && !m.lastName?.trim() && !m.relation) {
            continue;
          }
          if (!m.firstName?.trim()) {
            toast.error(`First Name is required for family member #${i + 1}.`);
            setSubmitting(false);
            return;
          }
          if (m.phoneNumber && m.phoneNumber.length !== 10) {
            toast.error(`Phone number for family member #${i + 1} must be exactly 10 digits.`);
            setSubmitting(false);
            return;
          }
        }
      }

      // Cleanup workDetails if not active
      if (payload.workDetails.hasOwnBusiness === null) {
        payload.workDetails = null;
      } else {
        if (payload.workDetails.hasOwnBusiness === true) {
          payload.workDetails.jobDetails = null;
        } else {
          payload.workDetails.businessDetails = null;
        }
      }
      
      if (isEditMode) {
        payload.userId = currentUser._id;
        if (!payload.password) delete payload.password;
        const response = await api.put('/user/update', payload);
        const isOk = response.data?.statusCode === 200 || response.data?.status === 200 || response.status === 200;
        if (isOk) { toast.success('Updated successfully!'); setFormOpen(false); fetchUsers(); }
      } else {
        const response = await api.post('/user/add', payload);
        const isOk = response.data?.statusCode === 200 || response.data?.status === 200 || response.status === 200;
        if (isOk) { toast.success('Created successfully!'); setFormOpen(false); fetchUsers(); }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userObj: any) => {
    try {
      const res = await api.put('/user/update', { userId: userObj._id, isActive: !userObj.isActive });
      const isOk = res.data?.statusCode === 200 || res.data?.status === 200 || res.status === 200;
      if (isOk) { toast.success('Status updated.'); fetchUsers(); }
    } catch (err) {}
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/user/${currentUser._id}`);
      const isOk = res.data?.statusCode === 200 || res.data?.status === 200 || res.status === 200;
      if (isOk) { toast.success('User deleted.'); setDeleteOpen(false); fetchUsers(); }
    } catch (err) {} finally { setSubmitting(false); }
  };
  
  // Work Details Methods
  const addBusinessLocation = () => {
    const newLoc = { shopAddress: '', areaCity: '', state: '', pincode: '', googleMapLink: '' };
    setFormData(prev => ({
      ...prev, workDetails: { ...prev.workDetails, businessDetails: { ...prev.workDetails.businessDetails, locations: [...prev.workDetails.businessDetails.locations, newLoc] } }
    }));
  };
  
  const removeBusinessLocation = (idx: number) => {
    setFormData(prev => {
      const newLocs = [...prev.workDetails.businessDetails.locations];
      newLocs.splice(idx, 1);
      return { ...prev, workDetails: { ...prev.workDetails, businessDetails: { ...prev.workDetails.businessDetails, locations: newLocs } } };
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isLight ? navyColor : '#F8FAFC' }}>
            Users & Work Registry
          </Typography>
          <Typography variant="subtitle2" sx={{ color: isLight ? '#64748B' : '#94A3B8', mt: 0.5 }}>
            Manage families, jobs, and business records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenAddForm}
          sx={{ bgcolor: emeraldColor, '&:hover': { bgcolor: '#059669' }, color: '#fff', borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}
        >
          Add New Registry
        </Button>
      </Box>

      {/* Modern Filter Section */}
      <Card sx={{ mb: 4, borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6, md: 7 }}>
                <TextField
                  fullWidth
                  placeholder="Search name, phone, village..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><Search size={18} color="#94A3B8" /></InputAdornment>,
                      sx: { borderRadius: 2, bgcolor: primaryBg }
                    }
                  }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Account Status</InputLabel>
                  <Select
                    value={activeFilter}
                    label="Account Status"
                    onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                    sx={{ borderRadius: 2, bgcolor: primaryBg }}
                  >
                    <MenuItem value="all">All Accounts</MenuItem>
                    <MenuItem value="true">Active Only</MenuItem>
                    <MenuItem value="false">Blocked Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 2, md: 2 }}>
                <Button type="submit" variant="outlined" fullWidth sx={{ borderRadius: 2, py: 1, borderColor: emeraldColor, color: emeraldColor, '&:hover': { borderColor: '#059669', color: '#059669' } }}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, boxShadow: 'none', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: emeraldColor }} /></Box>
        ) : users.length > 0 ? (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: primaryBg }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: isLight ? navyColor : '#F8FAFC' }}>Sr. No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: isLight ? navyColor : '#F8FAFC' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: isLight ? navyColor : '#F8FAFC' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: isLight ? navyColor : '#F8FAFC' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: isLight ? navyColor : '#F8FAFC' }}>Work Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: isLight ? navyColor : '#F8FAFC' }}>Access</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: isLight ? navyColor : '#F8FAFC' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userObj, index) => (
                    <TableRow key={userObj._id} hover sx={{ '&:hover': { bgcolor: isLight ? '#F1F5F9' : '#1E293B' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: emeraldColor, fontWeight: 700, width: 40, height: 40 }}>
                            {userObj.firstName[0]}{userObj.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {`${userObj.firstName} ${userObj.middleName} ${userObj.lastName}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {userObj.familyMembers?.length || 0} Family Members
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{userObj.phoneNumber}</TableCell>
                      <TableCell>
                        {userObj.village ? (
                          <Chip label={userObj.village} size="small" sx={{ bgcolor: isLight ? '#E0F2FE' : '#0284C7', color: isLight ? '#0284C7' : '#E0F2FE', fontWeight: 600 }} />
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {userObj.workDetails?.hasOwnBusiness === true ? (
                          <Chip icon={<Building size={14} />} label="Business" size="small" sx={{ bgcolor: isLight ? '#FEF3C7' : '#D97706', color: isLight ? '#D97706' : '#FEF3C7', fontWeight: 600 }} />
                        ) : userObj.workDetails?.hasOwnBusiness === false ? (
                          <Chip icon={<Briefcase size={14} />} label="Job" size="small" sx={{ bgcolor: isLight ? '#E0E7FF' : '#4F46E5', color: isLight ? '#4F46E5' : '#E0E7FF', fontWeight: 600 }} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">Not Specified</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch checked={userObj.isActive} onChange={() => handleToggleActive(userObj)} color="success" />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View Work Details">
                            <IconButton 
                              size="small" 
                              onClick={() => { setDrawerUser(userObj); setWorkDetailsOpen(true); }}
                              sx={{ color: '#F59E0B', bgcolor: isLight ? '#FEF3C7' : 'transparent', '&:hover': { bgcolor: '#FCD34D' } }}
                            >
                              <Briefcase size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenEditForm(userObj)}
                              sx={{ color: emeraldColor, bgcolor: isLight ? '#D1FAE5' : 'transparent', '&:hover': { bgcolor: '#A7F3D0' } }}
                            >
                              <Edit2 size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={() => { setCurrentUser(userObj); setDeleteOpen(true); }}
                              sx={{ color: '#EF4444', bgcolor: isLight ? '#FEE2E2' : 'transparent', '&:hover': { bgcolor: '#FECACA' } }}
                            >
                              <Trash2 size={16} />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: `1px solid ${borderColor}` }}>
              <Typography variant="caption" color="text.secondary">
                Showing {users.length} of {totalData} users
              </Typography>
              <Pagination
                count={Math.ceil(totalData / limit)}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                shape="rounded"
                size="small"
              />
            </Box>
          </>
        ) : (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No users found matching your filters.</Typography>
          </Box>
        )}
      </Card>

      {/* Work Details Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={workDetailsOpen}
        onClose={() => setWorkDetailsOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 450 }, bgcolor: cardBg } }}
      >
        {drawerUser && (
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Work Profile</Typography>
              <Chip label={drawerUser.firstName} color="primary" variant="outlined" />
            </Box>
            
            {drawerUser.workDetails?.hasOwnBusiness === true ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: isLight ? '#FEF3C7' : '#451A03', borderRadius: 2 }}>
                  <Building size={32} color="#D97706" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#D97706', fontWeight: 700 }}>BUSINESS OWNER</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{drawerUser.workDetails.businessDetails?.businessName || 'Unnamed Business'}</Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{drawerUser.workDetails.businessDetails?.category || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Owner Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{drawerUser.workDetails.businessDetails?.ownerName || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Description</Typography>
                    <Typography variant="body2">{drawerUser.workDetails.businessDetails?.description || 'No description provided.'}</Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, borderBottom: `1px solid ${borderColor}`, pb: 1 }}>Contact Info</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Phone size={16} color={emeraldColor} /><Typography variant="body2">{drawerUser.workDetails.businessDetails?.contactInfo?.mobile1 || '-'}</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Mail size={16} color={emeraldColor} /><Typography variant="body2">{drawerUser.workDetails.businessDetails?.contactInfo?.email || '-'}</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Globe size={16} color={emeraldColor} /><Typography variant="body2">{drawerUser.workDetails.businessDetails?.contactInfo?.website || '-'}</Typography></Box>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, borderBottom: `1px solid ${borderColor}`, pb: 1 }}>Locations ({drawerUser.workDetails.businessDetails?.locations?.length || 0})</Typography>
                {drawerUser.workDetails.businessDetails?.locations?.map((loc: any, i: number) => (
                  <Card key={i} sx={{ mb: 2, bgcolor: primaryBg, boxShadow: 'none', border: `1px solid ${borderColor}` }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <MapPin size={18} color="#0EA5E9" style={{ marginTop: 2 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{loc.shopAddress}</Typography>
                          <Typography variant="caption" color="text.secondary">{loc.areaCity}, {loc.state} - {loc.pincode}</Typography>
                          {loc.googleMapLink && (
                            <Button size="small" href={loc.googleMapLink} target="_blank" sx={{ mt: 1, p: 0, minWidth: 'auto', textTransform: 'none' }}>View on Maps</Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : drawerUser.workDetails?.hasOwnBusiness === false ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: isLight ? '#E0E7FF' : '#1E1B4B', borderRadius: 2 }}>
                  <Briefcase size={32} color="#4F46E5" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', fontWeight: 700 }}>JOB / PROFESSIONAL</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{drawerUser.workDetails.jobDetails?.jobRole || 'Unknown Role'}</Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Job Category</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{drawerUser.workDetails.jobDetails?.jobCategory || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Company Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{drawerUser.workDetails.jobDetails?.companyName || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Job Location</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{drawerUser.workDetails.jobDetails?.jobLocation || '-'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Briefcase size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
                <Typography color="text.secondary">This user has not provided any business or job details.</Typography>
              </Box>
            )}
            
            <Button fullWidth variant="outlined" sx={{ mt: 4 }} onClick={() => setWorkDetailsOpen(false)}>Close Sidebar</Button>
          </Box>
        )}
      </Drawer>

      {/* Add / Edit Form Modal */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, bgcolor: cardBg } }}>
        <DialogTitle sx={{ fontWeight: 800, p: 3, borderBottom: `1px solid ${borderColor}` }}>
          {isEditMode ? 'Update User Registry' : 'Create New User Registry'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Tabs value={formTab} onChange={(_, val) => setFormTab(val)} variant="fullWidth" sx={{ borderBottom: `1px solid ${borderColor}`, bgcolor: primaryBg }}>
            <Tab label="Personal Details" sx={{ fontWeight: 700 }} />
            <Tab label="Family Members" sx={{ fontWeight: 700 }} />
            <Tab label="Work / Business" sx={{ fontWeight: 700, color: emeraldColor }} />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {formTab === 0 && (
              <Grid container spacing={3}>
                {/* ── Name ── */}
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="First Name" required value={formData.firstName} onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); if(errors.firstName) setErrors({...errors, firstName: ''}); }} error={!!errors.firstName} helperText={errors.firstName} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Middle Name" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Last Name" required value={formData.lastName} onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); if(errors.lastName) setErrors({...errors, lastName: ''}); }} error={!!errors.lastName} helperText={errors.lastName} /></Grid>

                {/* ── Contact & Auth ── */}
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Primary Phone" required value={formData.phoneNumber} onChange={(e) => { setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0,10) }); if(errors.phoneNumber) setErrors({...errors, phoneNumber: ''}); }} error={!!errors.phoneNumber} helperText={errors.phoneNumber} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Secondary Phone" value={formData.phoneNumber2} onChange={(e) => setFormData({ ...formData, phoneNumber2: e.target.value.replace(/\D/g, '').slice(0,10) })} /></Grid>
                {!isEditMode && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      error={!!errors.password}
                      helperText={errors.password}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  </Grid>
                )}

                {/* ── Personal Info ── */}
                <Grid size={{ xs: 12 }}><Typography variant="subtitle2" sx={{ mt: 1, mb: -1, fontWeight: 700, color: emeraldColor }}>Personal Info</Typography></Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Date of Birth"
                    format="DD/MM/YYYY"
                    value={parseDate(formData.dob)}
                    onChange={(newValue) => {
                      setFormData({
                        ...formData,
                        dob: newValue ? newValue.format('DD/MM/YYYY') : ''
                      });
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select value={formData.bloodGroup} label="Blood Group" onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                      <MenuItem value="">None</MenuItem>
                      {BLOOD_GROUPS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Marital Status</InputLabel>
                    <Select value={formData.isMarried} label="Marital Status" onChange={(e) => setFormData({ ...formData, isMarried: e.target.value })}>
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="married">Married</MenuItem>
                      <MenuItem value="unMarried">Single</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Education" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FileUploadInput
                    label="Profile Photo"
                    value={formData.profilePhoto}
                    onChange={(url) => setFormData({ ...formData, profilePhoto: url })}
                  />
                </Grid>

                {/* ── Native Place ── */}
                <Grid size={{ xs: 12 }}><Typography variant="subtitle2" sx={{ mt: 1, mb: -1, fontWeight: 700, color: emeraldColor }}>Native Place (મૂળ ગામ)</Typography></Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    options={nativeVillages}
                    getOptionLabel={(option: any) => option.village || ''}
                    value={
                      formData.nativeVillage
                        ? activeLocs.find((l: any) => l.village === formData.nativeVillage && l.taluka === formData.nativeTaluka) || null
                        : null
                    }
                    onChange={(_event: any, newValue: any) => handleNativeVillageSelect(newValue)}
                    renderOption={(props, option: any) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <li key={key} {...optionProps}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.village}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.taluka}, {option.district}</Typography>
                          </Box>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Native Village"
                        placeholder="Search native village..."
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    options={nativeTalukas}
                    value={formData.nativeTaluka || null}
                    onChange={(_event: any, newValue: string | null) => handleNativeTalukaSelect(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Native Taluka"
                        placeholder="Search native taluka..."
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    options={nativeDistricts}
                    value={formData.nativeDistrict || null}
                    onChange={(_event: any, newValue: string | null) => handleNativeDistrictSelect(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Native District"
                        placeholder="Search native district..."
                      />
                    )}
                  />
                </Grid>

                {/* ── Current Address ── */}
                <Grid size={{ xs: 12 }}><Typography variant="subtitle2" sx={{ mt: 1, mb: -1, fontWeight: 700, color: emeraldColor }}>Current Address (હાલનું સ‍રનામું)</Typography></Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    options={currentVillages}
                    getOptionLabel={(option: any) => option.village || ''}
                    value={
                      formData.village
                        ? activeLocs.find((l: any) => l.village === formData.village && l.taluka === formData.taluka) || null
                        : null
                    }
                    onChange={(_event: any, newValue: any) => handleCurrentVillageSelect(newValue)}
                    renderOption={(props, option: any) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <li key={key} {...optionProps}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.village}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.taluka}, {option.district}</Typography>
                          </Box>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Village"
                        placeholder="Search village..."
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    options={currentTalukas}
                    value={formData.taluka || null}
                    onChange={(_event: any, newValue: string | null) => handleCurrentTalukaSelect(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Taluka"
                        placeholder="Search taluka..."
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    options={currentDistricts}
                    value={formData.district || null}
                    onChange={(_event: any, newValue: string | null) => handleCurrentDistrictSelect(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="District"
                        placeholder="Search district..."
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth label="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth label="City" value={formData.currentCity} onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth label="State" value={formData.currentState} onChange={(e) => setFormData({ ...formData, currentState: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 3 }}><FormControl fullWidth><InputLabel>House Type</InputLabel><Select value={formData.houseType} label="House Type" onChange={(e) => setFormData({ ...formData, houseType: e.target.value })}><MenuItem value="">None</MenuItem>{HOUSE_TYPES.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}</Select></FormControl></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth label="Current Address (Full)" value={formData.currentAddress} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} /></Grid>
              </Grid>
            )}

            {formTab === 1 && (
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<Plus />}
                  onClick={() => setFormData(p => ({ ...p, familyMembers: [...p.familyMembers, { firstName: '', middleName: '', lastName: '', relation: '', phoneNumber: '', dob: '', education: '', isMarried: '', bloodGroup: '', profilePhoto: '' }] }))}
                >
                  Add Member
                </Button>

                {formData.familyMembers.map((m, idx) => (
                  <Card key={idx} sx={{ mt: 2, p: 2.5, border: `1px solid ${borderColor}`, boxShadow: 'none', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: emeraldColor }}>Member #{idx + 1}</Typography>
                      <IconButton color="error" size="small" onClick={() => { const f = [...formData.familyMembers]; f.splice(idx, 1); setFormData({ ...formData, familyMembers: f }); }}><Trash size={16} /></IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      {/* Name row */}
                      <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" label="First Name" value={m.firstName || ''} onChange={(e) => { const f = [...formData.familyMembers]; f[idx].firstName = e.target.value; setFormData({ ...formData, familyMembers: f }); }} /></Grid>
                      <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" label="Middle Name" value={m.middleName || ''} onChange={(e) => { const f = [...formData.familyMembers]; f[idx].middleName = e.target.value; setFormData({ ...formData, familyMembers: f }); }} /></Grid>
                      <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" label="Last Name" value={m.lastName || ''} onChange={(e) => { const f = [...formData.familyMembers]; f[idx].lastName = e.target.value; setFormData({ ...formData, familyMembers: f }); }} /></Grid>

                      {/* Relation & Phone */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small"><InputLabel>Relation</InputLabel><Select value={m.relation || ''} label="Relation" onChange={(e) => { const f = [...formData.familyMembers]; f[idx].relation = e.target.value; setFormData({ ...formData, familyMembers: f }); }}><MenuItem value="">None</MenuItem>{RELATIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}</Select></FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" label="Phone (10 digits)" value={m.phoneNumber || ''} onChange={(e) => { const f = [...formData.familyMembers]; f[idx].phoneNumber = e.target.value.replace(/\D/g, '').slice(0,10); setFormData({ ...formData, familyMembers: f }); }} slotProps={{ htmlInput: { maxLength: 10 } }} /></Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <DatePicker
                          label="Date of Birth"
                          format="DD/MM/YYYY"
                          value={parseDate(m.dob)}
                          onChange={(newValue) => {
                            const f = [...formData.familyMembers];
                            f[idx].dob = newValue ? newValue.format('DD/MM/YYYY') : '';
                            setFormData({ ...formData, familyMembers: f });
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small'
                            }
                          }}
                        />
                      </Grid>

                      {/* Personal details */}
                      <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" label="Education" value={m.education || ''} onChange={(e) => { const f = [...formData.familyMembers]; f[idx].education = e.target.value; setFormData({ ...formData, familyMembers: f }); }} /></Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small"><InputLabel>Marital Status</InputLabel><Select value={m.isMarried || ''} label="Marital Status" onChange={(e) => { const f = [...formData.familyMembers]; f[idx].isMarried = e.target.value; setFormData({ ...formData, familyMembers: f }); }}><MenuItem value="">None</MenuItem><MenuItem value="married">Married</MenuItem><MenuItem value="unMarried">Single</MenuItem></Select></FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small"><InputLabel>Blood Group</InputLabel><Select value={m.bloodGroup || ''} label="Blood Group" onChange={(e) => { const f = [...formData.familyMembers]; f[idx].bloodGroup = e.target.value; setFormData({ ...formData, familyMembers: f }); }}><MenuItem value="">None</MenuItem>{BLOOD_GROUPS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}</Select></FormControl>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <FileUploadInput
                          label="Profile Photo"
                          value={m.profilePhoto || ''}
                          onChange={(url) => {
                            const f = [...formData.familyMembers];
                            f[idx].profilePhoto = url;
                            setFormData({ ...formData, familyMembers: f });
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            )}

            {formTab === 2 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Work Profile Setup</Typography>
                <FormControl component="fieldset" sx={{ mb: 4 }}>
                  <RadioGroup row value={formData.workDetails.hasOwnBusiness === null ? 'none' : formData.workDetails.hasOwnBusiness.toString()} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, hasOwnBusiness: e.target.value === 'none' ? null : e.target.value === 'true' } }))}>
                    <FormControlLabel value="none" control={<Radio color="default" />} label="Skip / Not Specified" />
                    <FormControlLabel value="true" control={<Radio color="success" />} label="Has Own Business" />
                    <FormControlLabel value="false" control={<Radio color="primary" />} label="Doing a Job / Looking for Job" />
                  </RadioGroup>
                </FormControl>

                {formData.workDetails.hasOwnBusiness === null && (
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Briefcase size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                      Work Details Skipped
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      You can save the user profile without specifying business or job status.
                    </Typography>
                  </Box>
                )}

                {formData.workDetails.hasOwnBusiness === true && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Business Name" value={formData.workDetails.businessDetails.businessName} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, businessName: e.target.value } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Owner Name" value={formData.workDetails.businessDetails.ownerName} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, ownerName: e.target.value } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={formData.workDetails.businessDetails.category || ''}
                          label="Category"
                          onChange={(e) => {
                            const cat = e.target.value;
                            setFormData(p => ({
                              ...p,
                              workDetails: {
                                ...p.workDetails,
                                businessDetails: {
                                  ...p.workDetails.businessDetails,
                                  category: cat,
                                  subCategory: []
                                }
                              }
                            }));
                          }}
                        >
                          <MenuItem value="">None</MenuItem>
                          {Object.keys(BUSINESS_JOB_CATEGORIES).map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth disabled={!formData.workDetails.businessDetails.category}>
                        <InputLabel>Sub Category</InputLabel>
                        <Select
                          multiple
                          value={
                            Array.isArray(formData.workDetails.businessDetails.subCategory)
                              ? formData.workDetails.businessDetails.subCategory
                              : formData.workDetails.businessDetails.subCategory
                                ? [formData.workDetails.businessDetails.subCategory]
                                : []
                          }
                          label="Sub Category"
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(p => ({
                              ...p,
                              workDetails: {
                                ...p.workDetails,
                                businessDetails: {
                                  ...p.workDetails.businessDetails,
                                  subCategory: typeof val === 'string' ? val.split(',') : val
                                }
                              }
                            }));
                          }}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {formData.workDetails.businessDetails.category &&
                            (BUSINESS_JOB_CATEGORIES[formData.workDetails.businessDetails.category] || []).map((sub) => (
                              <MenuItem key={sub} value={sub}>
                                {sub}
                              </MenuItem>
                            ))
                          }
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="Business Description" value={formData.workDetails.businessDetails.description || ''} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, description: e.target.value } } }))} /></Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FileUploadInput
                        label="Business Logo"
                        value={formData.workDetails.businessDetails.businessLogo || ''}
                        onChange={(url) => setFormData(p => ({
                          ...p,
                          workDetails: {
                            ...p.workDetails,
                            businessDetails: {
                              ...p.workDetails.businessDetails,
                              businessLogo: url
                            }
                          }
                        }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FileUploadInput
                        label="Business Banner"
                        value={formData.workDetails.businessDetails.businessBanner || ''}
                        onChange={(url) => setFormData(p => ({
                          ...p,
                          workDetails: {
                            ...p.workDetails,
                            businessDetails: {
                              ...p.workDetails.businessDetails,
                              businessBanner: url
                            }
                          }
                        }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <MultipleFileUploadInput
                        label="Business Photos"
                        values={formData.workDetails.businessDetails.businessPhotos || []}
                        onChange={(urls) => setFormData(p => ({
                          ...p,
                          workDetails: {
                            ...p.workDetails,
                            businessDetails: {
                              ...p.workDetails.businessDetails,
                              businessPhotos: urls
                            }
                          }
                        }))}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: emeraldColor }}>Business Locations</Typography>
                      {formData.workDetails.businessDetails.locations.map((loc, idx) => (
                        <Card key={idx} sx={{ mb: 2, p: 2, border: `1px solid ${borderColor}`, boxShadow: 'none' }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 12 }}><TextField fullWidth size="small" label="Shop Address" value={loc.shopAddress} onChange={(e) => { const l = [...formData.workDetails.businessDetails.locations]; l[idx].shopAddress = e.target.value; setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, locations: l } } })); }} /></Grid>
                            <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Area/City" value={loc.areaCity} onChange={(e) => { const l = [...formData.workDetails.businessDetails.locations]; l[idx].areaCity = e.target.value; setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, locations: l } } })); }} /></Grid>
                            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" label="Pincode" value={loc.pincode} onChange={(e) => { const l = [...formData.workDetails.businessDetails.locations]; l[idx].pincode = e.target.value; setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, locations: l } } })); }} /></Grid>
                            <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="State" value={loc.state} onChange={(e) => { const l = [...formData.workDetails.businessDetails.locations]; l[idx].state = e.target.value; setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, locations: l } } })); }} /></Grid>
                            <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Google Map Link" value={loc.googleMapLink || ''} onChange={(e) => { const l = [...formData.workDetails.businessDetails.locations]; l[idx].googleMapLink = e.target.value; setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, locations: l } } })); }} /></Grid>
                            <Grid size={{ xs: 12, sm: 1 }}><IconButton color="error" onClick={() => removeBusinessLocation(idx)}><Trash size={18} /></IconButton></Grid>
                          </Grid>
                        </Card>
                      ))}
                      <Button size="small" variant="outlined" onClick={addBusinessLocation} startIcon={<Plus />}>Add Location</Button>
                    </Grid>

                    <Grid size={{ xs: 12 }}><Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, color: emeraldColor }}>Contact Info</Typography></Grid>
                    <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Mobile 1" value={formData.workDetails.businessDetails.contactInfo.mobile1} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, contactInfo: { ...p.workDetails.businessDetails.contactInfo, mobile1: e.target.value } } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth size="small" label="Mobile 2" value={formData.workDetails.businessDetails.contactInfo.mobile2 || ''} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, contactInfo: { ...p.workDetails.businessDetails.contactInfo, mobile2: e.target.value } } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" label="Email" value={formData.workDetails.businessDetails.contactInfo.email} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, contactInfo: { ...p.workDetails.businessDetails.contactInfo, email: e.target.value } } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" label="Website" value={formData.workDetails.businessDetails.contactInfo.website} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, contactInfo: { ...p.workDetails.businessDetails.contactInfo, website: e.target.value } } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth size="small" label="Portfolio Link" value={formData.workDetails.businessDetails.contactInfo.portfolioLink || ''} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, businessDetails: { ...p.workDetails.businessDetails, contactInfo: { ...p.workDetails.businessDetails.contactInfo, portfolioLink: e.target.value } } } }))} /></Grid>
                  </Grid>
                )}

                {formData.workDetails.hasOwnBusiness === false && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Job Category</InputLabel>
                        <Select value={formData.workDetails.jobDetails.jobCategory || ''} label="Job Category" onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, jobDetails: { ...p.workDetails.jobDetails, jobCategory: e.target.value } } }))}>
                          <MenuItem value="">None</MenuItem>
                          {JOB_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Job Role / Designation" value={formData.workDetails.jobDetails.jobRole} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, jobDetails: { ...p.workDetails.jobDetails, jobRole: e.target.value } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Company Name (Optional)" value={formData.workDetails.jobDetails.companyName} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, jobDetails: { ...p.workDetails.jobDetails, companyName: e.target.value } } }))} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Job Location" value={formData.workDetails.jobDetails.jobLocation} onChange={(e) => setFormData(p => ({ ...p, workDetails: { ...p.workDetails, jobDetails: { ...p.workDetails.jobDetails, jobLocation: e.target.value } } }))} /></Grid>
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${borderColor}`, justifyContent: 'space-between' }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ color: isLight ? navyColor : '#fff', borderColor: borderColor }}>Cancel</Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {formTab > 0 && (
              <Button onClick={() => setFormTab(formTab - 1)} variant="outlined" sx={{ color: isLight ? navyColor : '#fff', borderColor: borderColor }}>Previous</Button>
            )}
            {formTab < 2 ? (
              <Button onClick={handleNextTab} variant="contained" sx={{ bgcolor: emeraldColor, '&:hover': { bgcolor: '#059669' } }}>Next</Button>
            ) : (
              <Button onClick={handleFormSubmit} variant="contained" disabled={submitting} sx={{ bgcolor: emeraldColor, '&:hover': { bgcolor: '#059669' } }}>
                {submitting ? <CircularProgress size={20} /> : 'Save Entry'}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
      
      {/* Delete Modal */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3, bgcolor: cardBg } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this registry?</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">{submitting ? <CircularProgress size={20} /> : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default Users;
