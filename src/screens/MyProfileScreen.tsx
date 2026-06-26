import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import api, { getUser, setUser } from '../services/api';
import FullScreenImageViewer from '../components/FullScreenImageViewer';

const SPECIALITY_CATEGORIES = {
  Medical: [
    'Medical Oncologist',
    'Hematologist / Oncologist',
    'Pediatric Oncologist',
    'Neuro-Oncologist',
    'Thoracic Oncologist',
    'Urologic Oncologist',
    'Gastrointestinal Oncologist',
    'Head & Neck Oncologist',
    'Breast Oncologist',
    'Dermatologic Oncologist',
    'Bone & Soft Tissue Oncologist',
    'Palliative Care Specialist',
    'Cardiologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Pulmonologist',
    'Nephrologist',
    'Neurologist',
    'Rheumatologist',
    'Dermatologist',
    'Immunologist',
    'Infectious Disease Specialist',
    'Geriatrician'
  ],
  Radiology: [
    'Radiation Oncologist',
    'Nuclear Medicine Oncologist',
    'Diagnostic Radiologist',
    'Interventional Radiologist',
    'Neuroradiologist',
    'Pediatric Radiologist',
    'Musculoskeletal Radiologist',
    'Cardiovascular Radiologist',
    'Breast Imaging Specialist',
    'Abdominal Radiologist'
  ],
  Surgical: [
    'Surgical Oncologist',
    'Gynecologic Oncologist',
    'Cardiothoracic Surgeon',
    'Neurosurgeon',
    'Orthopedic Surgeon',
    'General Surgeon',
    'Plastic Surgeon',
    'Urologist',
    'Otolaryngologist (ENT)',
    'Pediatric Surgeon',
    'Vascular Surgeon',
    'Transplant Surgeon',
    'Ophthalmic Surgeon',
    'Oral & Maxillofacial Surgeon'
  ]
};

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const TIME_OPTIONS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM'
];

// ─── Bottom Tab Bar Component ───────────────────────────────────────────────
function BottomTabBar({ active, navigation }: any) {
  const tabs = [
    { id: 'home', label: 'HOME', icon: '🏠' },
    { id: 'oncologists', label: 'ONCOLOGISTS', icon: '👥' },
    { id: 'call', label: '', icon: '', isCenter: true },
    { id: 'patients', label: 'PATIENTS', icon: '📅' },
    { id: 'profile', label: 'MY PROFILE', icon: '👤' },
  ];

  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab) =>
        tab.isCenter ? (
          <TouchableOpacity key={tab.id} style={tabStyles.centerBtn} onPress={() => navigation.navigate('Home')}>
            <View style={tabStyles.centerCircle}>
              <Text style={tabStyles.centerIcon}>📞</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={tab.id}
            style={tabStyles.tabItem}
            onPress={() => {
              if (tab.id === 'home') navigation.navigate('Home');
              if (tab.id === 'profile') navigation.navigate('MyProfile');
            }}
          >
            <Text style={[tabStyles.tabIcon, active === tab.id && tabStyles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[tabStyles.tabLabel, active === tab.id && tabStyles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8f0f0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 16, marginBottom: 3 },
  tabIconActive: {},
  tabLabel: { fontSize: 9, color: '#9aacac', fontWeight: '600', letterSpacing: 0.3 },
  tabLabelActive: { color: '#2a8a8a' },
  centerBtn: { flex: 1, alignItems: 'center' },
  centerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2a8a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#2a8a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerIcon: { fontSize: 20 },
});

// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function MyProfileScreen({ navigation }: any) {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Full screen image viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState('');

  // ─── Edit Form States ─────────────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editSpecialityCategory, setEditSpecialityCategory] = useState<'Medical' | 'Radiology' | 'Surgical'>('Medical');
  const [editSpeciality, setEditSpeciality] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subspecialityDropdownOpen, setSubspecialityDropdownOpen] = useState(false);

  // Education list
  const [eduInput, setEduInput] = useState('');
  const [eduList, setEduList] = useState<string[]>([]);

  const [editCity, setEditCity] = useState('');

  // Hospital list
  const [hospInput, setHospInput] = useState('');
  const [hospList, setHospList] = useState<string[]>([]);

  const [editDescription, setEditDescription] = useState('');

  // Availability slots
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('1:00 PM');
  const [slotsList, setSlotsList] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [startTimeModal, setStartTimeModal] = useState(false);
  const [endTimeModal, setEndTimeModal] = useState(false);

  // Media states
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [pictures, setPictures] = useState<{ url: string; caption: string }[]>([]);
  const [voiceFile, setVoiceFile] = useState<{ url: string; caption: string } | null>(null);
  const [videoFile, setVideoFile] = useState<{ url: string; caption: string } | null>(null);
  const [licenses, setLicenses] = useState<{ url: string; caption: string }[]>([]);

  // Edit fields for media links
  const [pictureUrlInput, setPictureUrlInput] = useState('');
  const [pictureCaptionInput, setPictureCaptionInput] = useState('');
  const [voiceUrlInput, setVoiceUrlInput] = useState('');
  const [voiceCaptionInput, setVoiceCaptionInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoCaptionInput, setVideoCaptionInput] = useState('');
  const [licenseUrlInput, setLicenseUrlInput] = useState('');
  const [licenseCaptionInput, setLicenseCaptionInput] = useState('');

  // Hidden refs for web uploads
  const profilePictureInputRef = useRef<any>(null);

  // Load doctor details
  const fetchDoctor = async () => {
    const u = await getUser();
    if (u) {
      setDoctor(u);
      
      // Initialize edit states
      setEditName(u.name || '');
      const spec = u.profile?.specialization || 'Medical Oncologist';
      setEditSpeciality(spec);
      
      let category: 'Medical' | 'Radiology' | 'Surgical' = 'Medical';
      if (SPECIALITY_CATEGORIES.Radiology.includes(spec)) {
        category = 'Radiology';
      } else if (SPECIALITY_CATEGORIES.Surgical.includes(spec)) {
        category = 'Surgical';
      }
      setEditSpecialityCategory(category);
      setEduList(u.profile?.education || []);
      setEditCity(u.profile?.city || '');
      setHospList(u.profile?.hospital || []);
      setEditDescription(u.profile?.description || '');
      
      setProfilePicture(u.profile?.profilePicture || '');
      setPictures(u.profile?.pictures || []);
      setVoiceFile(u.profile?.voice || null);
      setVideoFile(u.profile?.video || null);
      setLicenses(u.profile?.licenses || []);

      setVoiceUrlInput(u.profile?.voice?.url || '');
      setVoiceCaptionInput(u.profile?.voice?.caption || '');
      setVideoUrlInput(u.profile?.video?.url || '');
      setVideoCaptionInput(u.profile?.video?.caption || '');
      setLicenseUrlInput('');
      setLicenseCaptionInput('');

      // Parse schedule
      const sched = u.profile?.schedule || {};
      const activeDays: string[] = [];
      let slots: string[] = [];

      Object.entries(sched).forEach(([day, daySlots]) => {
        let key = '';
        if (day === 'monday') key = 'MON';
        else if (day === 'tuesday') key = 'TUE';
        else if (day === 'wednesday') key = 'WED';
        else if (day === 'thursday') key = 'THU';
        else if (day === 'friday') key = 'FRI';
        else if (day === 'saturday') key = 'SAT';
        else if (day === 'sunday') key = 'SUN';
        
        if (key) {
          activeDays.push(key);
          if (Array.isArray(daySlots) && slots.length === 0) {
            slots = daySlots;
          }
        }
      });

      setSelectedDays(activeDays);
      setSlotsList(slots.length > 0 ? slots : ['10:00 AM - 1:00 PM']);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  // ─── Edit Action Helpers ──────────────────────────────────────────────────
  const handleAddEdu = () => {
    if (eduInput.trim()) {
      setEduList([...eduList, eduInput.trim()]);
      setEduInput('');
    }
  };

  const handleRemoveEdu = (idx: number) => {
    setEduList(eduList.filter((_, i) => i !== idx));
  };

  const handleAddHosp = () => {
    if (hospInput.trim()) {
      setHospList([...hospList, hospInput.trim()]);
      setHospInput('');
    }
  };

  const handleRemoveHosp = (idx: number) => {
    setHospList(hospList.filter((_, i) => i !== idx));
  };

  const handleAddSlot = () => {
    const slot = `${startTime} - ${endTime}`;
    if (!slotsList.includes(slot)) {
      setSlotsList([...slotsList, slot]);
    }
  };

  const handleRemoveSlot = (idx: number) => {
    setSlotsList(slotsList.filter((_, i) => i !== idx));
  };

  const toggleDay = (day: string) => {
    if (day === 'ALL') {
      if (selectedDays.length === DAYS.length) {
        setSelectedDays([]);
      } else {
        setSelectedDays([...DAYS]);
      }
    } else {
      if (selectedDays.includes(day)) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      } else {
        setSelectedDays([...selectedDays, day]);
      }
    }
  };

  // Media link action helpers
  const addPictureCombo = () => {
    if (pictureUrlInput.trim()) {
      setPictures([...pictures, { url: pictureUrlInput.trim(), caption: pictureCaptionInput.trim() }]);
      setPictureUrlInput('');
      setPictureCaptionInput('');
    }
  };

  const removePictureCombo = (index: number) => {
    setPictures(pictures.filter((_, i) => i !== index));
  };

  const triggerProfilePictureUpload = () => {
    if (Platform.OS === 'web') {
      profilePictureInputRef.current?.click();
    } else {
      setProfilePicture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  };

  const handleProfilePictureChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setProfilePicture(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const addLicenseCombo = () => {
    if (licenseUrlInput.trim()) {
      setLicenses([...licenses, { url: licenseUrlInput.trim(), caption: licenseCaptionInput.trim() }]);
      setLicenseUrlInput('');
      setLicenseCaptionInput('');
    }
  };

  const removeLicenseCombo = (index: number) => {
    setLicenses(licenses.filter((_, i) => i !== index));
  };

  // ─── Save Profile Edits ───────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!editName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (eduList.length === 0) {
      setError('Please add at least one education credential.');
      return;
    }
    if (!editCity.trim()) {
      setError('City of practice cannot be empty.');
      return;
    }
    if (hospList.length === 0) {
      setError('Please add at least one hospital or clinic.');
      return;
    }
    if (slotsList.length === 0) {
      setError('Please add at least one availability slot.');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one available day.');
      return;
    }
    if (licenses.length === 0) {
      setError('Please add at least one medical licence certificate.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Map availability list and slots to the backend schedule format
      const scheduleMap: Record<string, string[]> = {};
      selectedDays.forEach((day) => {
        let key = '';
        if (day === 'MON') key = 'monday';
        else if (day === 'TUE') key = 'tuesday';
        else if (day === 'WED') key = 'wednesday';
        else if (day === 'THU') key = 'thursday';
        else if (day === 'FRI') key = 'friday';
        else if (day === 'SAT') key = 'saturday';
        else if (day === 'SUN') key = 'sunday';
        
        if (key) {
          scheduleMap[key] = slotsList;
        }
      });

      const payload = {
        name: editName.trim(),
        profile: {
          specialization: editSpeciality,
          education: eduList,
          city: editCity.trim(),
          hospital: hospList,
          description: editDescription.trim(),
          profilePicture: profilePicture || null,
          pictures: pictures,
          voice: voiceUrlInput.trim() ? { url: voiceUrlInput.trim(), caption: voiceCaptionInput.trim() } : null,
          video: videoUrlInput.trim() ? { url: videoUrlInput.trim(), caption: videoCaptionInput.trim() } : null,
          licenses: licenses,
          schedule: scheduleMap,
        }
      };

      const response = await api.put('/doctor/profile', payload);
      const updatedUser = response.data;
      
      await setUser(updatedUser);
      setDoctor(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdits = () => {
    setError('');
    setIsEditing(false);
    fetchDoctor(); // Reset states to original doc details
  };

  if (!doctor) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2a8a8a" />
      </View>
    );
  }

  const displayName = editName.replace(/^Dr\.?\s*/i, '').trim() || editName;

  return (
    <View style={styles.root}>
      {/* Hidden inputs for web uploading during edit */}
      {Platform.OS === 'web' && (
        <View style={{ display: 'none' }}>
          <input type="file" ref={profilePictureInputRef} onChange={handleProfilePictureChange} accept="image/*" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (isEditing ? handleCancelEdits() : navigation.navigate('Home'))} style={styles.backBtn}>
          <Text style={styles.backChevron}>〈</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'EDIT PROFILE' : 'MY PROFILE'}</Text>
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── VIEW MODE ── */}
        {!isEditing && (
          <>
            {/* Identity Card */}
            <View style={styles.profileCard}>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editProfileFloatBtn}>
                <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
              </TouchableOpacity>

              <View style={styles.avatarContainer}>
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.avatarCircleImage} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{displayName.substring(0, 2).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.activeBadge} />
              </View>
              
              <Text style={styles.docName}>Dr. {displayName}</Text>
              <Text style={styles.docSpec}>{editSpeciality}</Text>

              {/* Progress Completion Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Profile Completion</Text>
                  <Text style={styles.progressPercent}>90%</Text>
                </View>
                <View style={styles.barBackground}>
                  <View style={styles.barFill} />
                </View>
              </View>
            </View>

            {/* Background Info */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Background Details</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>About</Text>
                <Text style={styles.infoValue}>{editDescription || 'No professional bio added yet.'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Education</Text>
                {eduList.map((edu, index) => (
                  <View key={index} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={[styles.infoValue, { flex: 1 }]}>{edu}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>City of Practice</Text>
                <Text style={styles.infoValue}>{editCity}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hospital / Clinics</Text>
                <View style={styles.clinicsGrid}>
                  {hospList.map((hosp, index) => (
                    <View key={index} style={styles.clinicTag}>
                      <Text style={styles.clinicText}>{hosp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* License Details (With Live Image Preview!) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Credentials & Verification</Text>
              <View style={styles.licenseRow}>
                <View style={styles.licenseIcon}>
                  <Text style={styles.docFileIcon}>📄</Text>
                </View>
                <View style={styles.licenseTextWrapper}>
                  <Text style={styles.licenseTitle}>Medical Licence Certificate</Text>
                  <Text style={styles.licenseSub}>Verified Profile Document</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              </View>

              {/* Live Preview of Licenses if present */}
              {licenses && licenses.length > 0 ? (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.previewSubLabel}>Licence Documents (Click to view full screen):</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {licenses.map((item, idx) => (
                      <View key={idx} style={{ width: '47%', backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#cbd5e1' }}>
                        {item.url && (item.url.startsWith('data:image/') || item.url.startsWith('http')) ? (
                          <TouchableOpacity onPress={() => { setViewerUri(item.url); setViewerVisible(true); }} activeOpacity={0.9}>
                            <Image source={{ uri: item.url }} style={{ width: '100%', height: 100, borderRadius: 6 }} resizeMode="cover" />
                          </TouchableOpacity>
                        ) : (
                          <View style={{ width: '100%', height: 100, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }}>
                            <Text style={{ fontSize: 24 }}>📄</Text>
                          </View>
                        )}
                        <Text style={{ fontSize: 11, color: '#475569', marginTop: 6, textAlign: 'center', fontWeight: '500' }} numberOfLines={1}>
                          {item.caption || `Licence Certificate ${idx + 1}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            {/* Availability */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Availability Schedule</Text>
              <View style={styles.daysGrid}>
                {DAYS.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <View key={day} style={[styles.dayPill, active && styles.dayPillActive]}>
                      <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.slotsRow}>
                <Text style={styles.slotLabel}>Consultation Slots:</Text>
                <View style={styles.slotsList}>
                  {slotsList.map((slot, idx) => (
                    <View key={idx} style={styles.slotTag}>
                      <Text style={styles.slotText}>{slot}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Multimedia (Pictures, Voice & Video players!) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Multimedia Attachments</Text>

              {/* Photos Gallery */}
              <Text style={styles.mediaSubLabel}>Pictures & Certificates (Click to view full screen)</Text>
              <View style={styles.picturesGallery}>
                {pictures.length > 0 ? (
                  pictures.map((pic, idx) => (
                    <View key={idx} style={[styles.mediaBox, { height: 'auto', minHeight: 90, paddingBottom: 6 }]}>
                      {pic.url ? (
                        <TouchableOpacity onPress={() => { setViewerUri(pic.url); setViewerVisible(true); }} style={{ width: '100%', height: 70 }} activeOpacity={0.8}>
                          <Image source={{ uri: pic.url }} style={styles.galleryImage} />
                        </TouchableOpacity>
                      ) : (
                        <View style={{ height: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
                          <Text style={styles.mediaPlaceholderIcon}>📷</Text>
                        </View>
                      )}
                      <Text style={{ fontSize: 10, color: '#475569', textAlign: 'center', marginTop: 4, paddingHorizontal: 4 }} numberOfLines={2}>
                        {pic.caption || `Photo ${idx + 1}`}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyMediaText}>No pictures uploaded.</Text>
                )}
              </View>

              {/* HTML5 Voice Audio controls */}
              <Text style={[styles.mediaSubLabel, { marginTop: 20 }]}>Voice Introduction</Text>
              {voiceFile && voiceFile.url ? (
                <View>
                  {Platform.OS === 'web' ? (
                    <audio controls src={voiceFile.url} style={{ width: '100%', marginTop: 6 }} />
                  ) : (
                    <Text style={styles.emptyMediaText}>Voice Player available on Web.</Text>
                  )}
                  {voiceFile.caption ? (
                    <Text style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Caption: {voiceFile.caption}</Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.emptyMediaText}>No voice introduction uploaded.</Text>
              )}

              {/* HTML5 Presentation Video controls */}
              <Text style={[styles.mediaSubLabel, { marginTop: 20 }]}>Presentation Video</Text>
              {videoFile && videoFile.url ? (
                <View>
                  {Platform.OS === 'web' ? (
                    <video controls src={videoFile.url} style={{ width: '100%', borderRadius: 8, marginTop: 6, maxHeight: 220 }} />
                  ) : (
                    <Text style={styles.emptyMediaText}>Video Player available on Web.</Text>
                  )}
                  {videoFile.caption ? (
                    <Text style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Caption: {videoFile.caption}</Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.emptyMediaText}>No presentation video uploaded.</Text>
              )}
            </View>
          </>
        )}

        {/* ── EDIT MODE ── */}
        {isEditing && (
          <View style={styles.editForm}>
            {/* Save / Cancel buttons at the top of the form for convenience */}
            <View style={styles.editTopRowButtons}>
              <TouchableOpacity onPress={handleCancelEdits} style={[styles.editHeaderBtn, styles.cancelBtn]}>
                <Text style={styles.editHeaderBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveChanges}
                style={[styles.editHeaderBtn, styles.saveBtn, loading && styles.saveBtnDisabled]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={[styles.editHeaderBtnText, { color: '#ffffff' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Full Name *</Text>
              <TextInput
                style={styles.editTextInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
                placeholderTextColor="#9aacac"
              />
            </View>

            {/* Speciality Category Dropdown */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Speciality Category *</Text>
              <TouchableOpacity style={styles.editDropdownSelector} onPress={() => setCategoryDropdownOpen(true)}>
                <Text style={styles.editDropdownValue}>{editSpecialityCategory}</Text>
                <Text style={styles.editChevronIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Subspeciality Dropdown */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Subspeciality *</Text>
              <TouchableOpacity style={styles.editDropdownSelector} onPress={() => setSubspecialityDropdownOpen(true)}>
                <Text style={styles.editDropdownValue}>{editSpeciality}</Text>
                <Text style={styles.editChevronIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* City of Practice */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>City of Practice *</Text>
              <TextInput
                style={styles.editTextInput}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="Enter city"
                placeholderTextColor="#9aacac"
              />
            </View>

            {/* Description */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Bio Description</Text>
              <TextInput
                style={[styles.editTextInput, styles.editTextArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Describe your qualifications/bio"
                placeholderTextColor="#9aacac"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Education lists */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Education *</Text>
              <View style={styles.editAddRow}>
                <TextInput
                  style={[styles.editTextInput, { flex: 1, marginRight: 8 }]}
                  value={eduInput}
                  onChangeText={setEduInput}
                  placeholder="Harvard Medical School, etc."
                  placeholderTextColor="#9aacac"
                  onSubmitEditing={handleAddEdu}
                />
                <TouchableOpacity onPress={handleAddEdu} style={styles.editAddTagBtn}>
                  <Text style={styles.editAddTagBtnText}>＋ Add</Text>
                </TouchableOpacity>
              </View>
              {eduList.length > 0 && (
                <View style={styles.editChipsRow}>
                  {eduList.map((edu, idx) => (
                    <View key={idx} style={styles.editChip}>
                      <Text style={styles.editChipText}>{edu}</Text>
                      <TouchableOpacity onPress={() => handleRemoveEdu(idx)}>
                        <Text style={styles.editChipRemove}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Hospital lists */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Hospital / Clinics *</Text>
              <View style={styles.editAddRow}>
                <TextInput
                  style={[styles.editTextInput, { flex: 1, marginRight: 8 }]}
                  value={hospInput}
                  onChangeText={setHospInput}
                  placeholder="Clinic name..."
                  placeholderTextColor="#9aacac"
                  onSubmitEditing={handleAddHosp}
                />
                <TouchableOpacity onPress={handleAddHosp} style={styles.editAddTagBtn}>
                  <Text style={styles.editAddTagBtnText}>＋ Add</Text>
                </TouchableOpacity>
              </View>
              {hospList.length > 0 && (
                <View style={styles.editChipsRow}>
                  {hospList.map((hosp, idx) => (
                    <View key={idx} style={styles.editChip}>
                      <Text style={styles.editChipText}>{hosp}</Text>
                      <TouchableOpacity onPress={() => handleRemoveHosp(idx)}>
                        <Text style={styles.editChipRemove}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Edit Availability Schedule */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Working Days *</Text>
              <View style={styles.editDaysGrid}>
                {DAYS.map((day) => {
                  const selected = selectedDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.editDayCell, selected && styles.editDayCellActive]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[styles.editDayText, selected && styles.editDayTextActive]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.editDayCell, styles.editAllDayCell, selectedDays.length === DAYS.length && styles.editDayCellActive]}
                  onPress={() => toggleDay('ALL')}
                >
                  <Text style={[styles.editDayText, selectedDays.length === DAYS.length && styles.editDayTextActive]}>ALL</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Edit Slots */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Consultation Slots *</Text>
              <View style={styles.editSlotsRow}>
                <TouchableOpacity style={styles.editTimeDropdown} onPress={() => setStartTimeModal(true)}>
                  <Text style={styles.editTimeText}>{startTime}</Text>
                </TouchableOpacity>
                <Text style={styles.editToSeparator}>to</Text>
                <TouchableOpacity style={styles.editTimeDropdown} onPress={() => setEndTimeModal(true)}>
                  <Text style={styles.editTimeText}>{endTime}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddSlot} style={styles.editAddTagBtn}>
                  <Text style={styles.editAddTagBtnText}>＋ Add</Text>
                </TouchableOpacity>
              </View>

              {slotsList.length > 0 && (
                <View style={styles.editChipsRow}>
                  {slotsList.map((slot, idx) => (
                    <View key={idx} style={styles.editSlotChip}>
                      <Text style={styles.editSlotChipText}>{slot}</Text>
                      <TouchableOpacity onPress={() => handleRemoveSlot(idx)}>
                        <Text style={styles.editSlotChipRemove}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Edit Multimedia Uploads */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Profile Photo *</Text>
              <TouchableOpacity style={styles.profilePhotoUploadBox} onPress={triggerProfilePictureUpload}>
                {profilePicture ? (
                  <View style={styles.profilePhotoPreviewContainer}>
                    <Image source={{ uri: profilePicture }} style={styles.profilePhotoPreview} />
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); setProfilePicture(''); }}
                      style={styles.profilePhotoRemoveBtn}
                    >
                      <Text style={styles.removeBtnText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.profilePhotoPlaceholder}>
                    <Text style={styles.editUploadIcon}>👤</Text>
                    <Text style={styles.editUploadLabel}>Upload Profile Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Pictures & Certificates */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Pictures & Certificates (Optional)</Text>
              
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.editTextInput, { flex: 2, marginRight: 8 }]}
                  placeholder="Image URL"
                  placeholderTextColor="#9aacac"
                  value={pictureUrlInput}
                  onChangeText={setPictureUrlInput}
                />
                <TextInput
                  style={[styles.editTextInput, { flex: 1.5, marginRight: 8 }]}
                  placeholder="Caption"
                  placeholderTextColor="#9aacac"
                  value={pictureCaptionInput}
                  onChangeText={setPictureCaptionInput}
                />
                <TouchableOpacity style={styles.editAddTagBtn} onPress={addPictureCombo}>
                  <Text style={styles.editAddTagBtnText}>＋ Add</Text>
                </TouchableOpacity>
              </View>

              {pictures.length > 0 && (
                <View style={styles.mediaLinksList}>
                  {pictures.map((item, idx) => (
                    <View key={idx} style={styles.mediaLinkItem}>
                      <View style={styles.mediaLinkInfo}>
                        {item.url && (item.url.startsWith('http') || item.url.startsWith('data:')) ? (
                          <Image source={{ uri: item.url }} style={styles.smallMediaThumb} />
                        ) : (
                          <View style={[styles.smallMediaThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 16 }}>📷</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.mediaLinkUrl} numberOfLines={1}>{item.url}</Text>
                          <Text style={styles.mediaLinkCaption} numberOfLines={1}>{item.caption || 'No caption'}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removePictureCombo(idx)} style={styles.mediaLinkRemoveBtn}>
                        <Text style={styles.removeBtnText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Edit Voice */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Voice Introduction (Optional)</Text>
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.editTextInput, { flex: 2, marginRight: 8 }]}
                  placeholder="Voice Audio Link URL"
                  placeholderTextColor="#9aacac"
                  value={voiceUrlInput}
                  onChangeText={setVoiceUrlInput}
                />
                <TextInput
                  style={[styles.editTextInput, { flex: 1.5 }]}
                  placeholder="Caption"
                  placeholderTextColor="#9aacac"
                  value={voiceCaptionInput}
                  onChangeText={setVoiceCaptionInput}
                />
              </View>
            </View>

            {/* Edit Video */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Presentation Video (Optional)</Text>
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.editTextInput, { flex: 2, marginRight: 8 }]}
                  placeholder="Video Link URL"
                  placeholderTextColor="#9aacac"
                  value={videoUrlInput}
                  onChangeText={setVideoUrlInput}
                />
                <TextInput
                  style={[styles.editTextInput, { flex: 1.5 }]}
                  placeholder="Caption"
                  placeholderTextColor="#9aacac"
                  value={videoCaptionInput}
                  onChangeText={setVideoCaptionInput}
                />
              </View>
            </View>

            {/* Edit License */}
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>Medical Licence Certificate(s) *</Text>
              
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.editTextInput, { flex: 2, marginRight: 8 }]}
                  placeholder="Licence Image URL"
                  placeholderTextColor="#9aacac"
                  value={licenseUrlInput}
                  onChangeText={setLicenseUrlInput}
                />
                <TextInput
                  style={[styles.editTextInput, { flex: 1.5, marginRight: 8 }]}
                  placeholder="Caption"
                  placeholderTextColor="#9aacac"
                  value={licenseCaptionInput}
                  onChangeText={setLicenseCaptionInput}
                />
                <TouchableOpacity style={styles.editAddTagBtn} onPress={addLicenseCombo}>
                  <Text style={styles.editAddTagBtnText}>＋ Add</Text>
                </TouchableOpacity>
              </View>

              {licenses.length > 0 && (
                <View style={styles.mediaLinksList}>
                  {licenses.map((item, idx) => (
                    <View key={idx} style={styles.mediaLinkItem}>
                      <View style={styles.mediaLinkInfo}>
                        {item.url && (item.url.startsWith('http') || item.url.startsWith('data:')) ? (
                          <Image source={{ uri: item.url }} style={styles.smallMediaThumb} />
                        ) : (
                          <View style={[styles.smallMediaThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 16 }}>📄</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.mediaLinkUrl} numberOfLines={1}>{item.url}</Text>
                          <Text style={styles.mediaLinkCaption} numberOfLines={1}>{item.caption || 'No caption'}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removeLicenseCombo(idx)} style={styles.mediaLinkRemoveBtn}>
                        <Text style={styles.removeBtnText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation (Not visible in edit mode to avoid losing changes) */}
      {!isEditing && <BottomTabBar active="profile" navigation={navigation} />}

      {/* ── Speciality Category Picker Modal ── */}
      <Modal visible={categoryDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setCategoryDropdownOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={['Medical', 'Radiology', 'Surgical']}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, item === editSpecialityCategory && styles.modalItemSelected]}
                  onPress={() => {
                    setEditSpecialityCategory(item as any);
                    setEditSpeciality(SPECIALITY_CATEGORIES[item as keyof typeof SPECIALITY_CATEGORIES][0]);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.modalItemText, item === editSpecialityCategory && styles.modalItemTextSelected]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Subspeciality Picker Modal ── */}
      <Modal visible={subspecialityDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSubspecialityDropdownOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Subspeciality</Text>
            <FlatList
              data={SPECIALITY_CATEGORIES[editSpecialityCategory]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, item === editSpeciality && styles.modalItemSelected]}
                  onPress={() => {
                    setEditSpeciality(item);
                    setSubspecialityDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.modalItemText, item === editSpeciality && styles.modalItemTextSelected]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Start Time Modal ── */}
      <Modal visible={startTimeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setStartTimeModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Start Time</Text>
            <FlatList
              data={TIME_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setStartTime(item);
                    setStartTimeModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── End Time Modal ── */}
      <Modal visible={endTimeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setEndTimeModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select End Time</Text>
            <FlatList
              data={TIME_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setEndTime(item);
                    setEndTimeModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Full Screen Image Viewer Modal ── */}
      <FullScreenImageViewer
        visible={viewerVisible}
        imageUri={viewerUri}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4fafa',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4fafa',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f0f0',
    backgroundColor: '#ffffff',
  },
  backBtn: { padding: 4 },
  backChevron: { fontSize: 18, color: '#1a3a3a', fontWeight: 'bold' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a3a3a', letterSpacing: 0.5 },
  searchIcon: { fontSize: 16, color: '#1a3a3a' },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },

  errorBox: {
    backgroundColor: '#fce8e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#e05555',
  },
  errorText: { color: '#c0392b', fontSize: 12.5, fontWeight: '500' },

  // Profile completion card
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#2a8a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  editProfileFloatBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderWidth: 1,
    borderColor: '#007c7c',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f6fbfb',
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007c7c',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#d6ecee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#007c7c',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  docName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3040',
    marginBottom: 4,
  },
  docSpec: {
    fontSize: 13,
    color: '#2a8a8a',
    fontWeight: '600',
    marginBottom: 20,
  },
  progressBarWrapper: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 11,
    color: '#007c7c',
    fontWeight: '700',
  },
  barBackground: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    width: '90%',
    height: '100%',
    backgroundColor: '#007c7c',
    borderRadius: 3,
  },

  // Section cards
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#2a8a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '750',
    color: '#1a3a3a',
    borderBottomWidth: 1.5,
    borderBottomColor: '#f0f5f5',
    paddingBottom: 8,
    marginBottom: 16,
    letterSpacing: 0.2,
  },

  // Info details rows
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    color: '#2a8a8a',
    marginRight: 8,
  },
  clinicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  clinicTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clinicText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },

  // License row styles
  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  licenseIcon: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docFileIcon: { fontSize: 20 },
  licenseTextWrapper: { flex: 1 },
  licenseTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  licenseSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  verifiedTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 10, color: '#166534', fontWeight: '700' },
  licenseImagePreviewBox: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  previewSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  licensePreviewImage: {
    width: '100%',
    height: 180,
    borderRadius: 6,
  },

  // Availability schedule
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  dayPill: {
    flex: 1,
    marginHorizontal: 2,
    aspectRatio: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dayPillActive: {
    backgroundColor: '#007c7c',
    borderColor: '#007c7c',
  },
  dayText: { fontSize: 9, fontWeight: '700', color: '#64748b' },
  dayTextActive: { color: '#ffffff' },

  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginRight: 8 },
  slotsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  slotTag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  slotText: { fontSize: 11, color: '#166534', fontWeight: '600' },

  // Multimedia details
  mediaSubLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 10 },
  picturesGallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mediaBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  mediaPlaceholderIcon: { fontSize: 22, color: '#64748b', marginBottom: 2 },
  mediaFileName: { fontSize: 8.5, color: '#64748b', textAlign: 'center', width: '100%' },
  emptyMediaText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },

  // ─── EDIT FORM STYLES ───────────────────────────────────────────────────
  editForm: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#2a8a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  editTopRowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  editHeaderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#64748b',
    backgroundColor: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#007c7c',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  editHeaderBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  editInputWrapper: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '750',
    color: '#1e3040',
    marginBottom: 8,
  },
  editTextInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#334155',
    backgroundColor: '#ffffff',
    outlineStyle: 'none',
  } as any,
  editTextArea: {
    height: 68,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  editDropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#ffffff',
  },
  editDropdownValue: {
    fontSize: 13,
    color: '#334155',
  },
  editChevronIcon: {
    fontSize: 9,
    color: '#94a3b8',
  },
  editAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editAddTagBtn: {
    backgroundColor: '#1e3040',
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  editAddTagBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  editChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editChipText: {
    fontSize: 11,
    color: '#475569',
    marginRight: 4,
  },
  editChipRemove: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: 'bold',
  },

  // Edit days grid
  editDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  editDayCell: {
    width: '22%',
    aspectRatio: 1.6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  editAllDayCell: {
    borderColor: '#0284c7',
  },
  editDayCellActive: {
    backgroundColor: '#007c7c',
    borderColor: '#007c7c',
  },
  editDayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  editDayTextActive: {
    color: '#ffffff',
  },

  // Edit slots
  editSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  editTimeDropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
  },
  editTimeText: {
    fontSize: 12,
    color: '#334155',
  },
  editToSeparator: {
    fontSize: 11,
    color: '#64748b',
  },
  editSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editSlotChipText: {
    fontSize: 11,
    color: '#166534',
    marginRight: 4,
    fontWeight: '500',
  },
  editSlotChipRemove: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: 'bold',
  },

  // Edit mediauploads
  editUploadsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  editUploadBox: {
    flex: 1,
    aspectRatio: 1.4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  editUploadIcon: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 4,
  },
  editUploadLabel: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '600',
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '40%',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '750',
    color: '#1a3a3a',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f4',
  },
  modalItemSelected: { backgroundColor: '#e8f6f8' },
  modalItemText: { fontSize: 13, color: '#2d4a4a', fontWeight: '500' },
  modalItemTextSelected: { color: '#2a8a8a', fontWeight: '700' },
  avatarCircleImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  profilePhotoUploadBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    marginTop: 6,
  },
  profilePhotoPreviewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profilePhotoPreview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#007c7c',
  },
  profilePhotoRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  linkCaptionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  mediaLinksList: {
    marginTop: 12,
    gap: 8,
  },
  mediaLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mediaLinkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smallMediaThumb: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  mediaLinkUrl: {
    fontSize: 11.5,
    color: '#1e293b',
    fontWeight: '600',
  },
  mediaLinkCaption: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  mediaLinkRemoveBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
