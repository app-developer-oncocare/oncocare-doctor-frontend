import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import api, { setToken, setUser } from '../services/api';
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

export default function ProfileBuilderScreen({ navigation, routeParams }: any) {
  const mobileNo = routeParams?.mobileNo || '';
  const countryCode = routeParams?.countryCode || '+971';
  const email = routeParams?.email || '';

  // Current Step (1: Background, 2: License, 3: Availability)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Full screen image viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState('');

  // ─── Step 1 States (Background) ───────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [specialityCategory, setSpecialityCategory] = useState<'Medical' | 'Radiology' | 'Surgical'>('Medical');
  const [speciality, setSpeciality] = useState('Medical Oncologist');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subspecialityDropdownOpen, setSubspecialityDropdownOpen] = useState(false);
  
  // Education List
  const [educationInput, setEducationInput] = useState('');
  const [educationList, setEducationList] = useState<string[]>([]);
  
  const [cityOfPractice, setCityOfPractice] = useState('');
  
  // Hospital/Clinics List
  const [hospitalInput, setHospitalInput] = useState('');
  const [hospitalList, setHospitalList] = useState<string[]>([]);
  
  const [description, setDescription] = useState('');

  // Upload stubs
  const [uploadedProfilePicture, setUploadedProfilePicture] = useState<string | null>(null);

  // Pictures & Certificates
  const [pictureUrlInput, setPictureUrlInput] = useState('');
  const [pictureCaptionInput, setPictureCaptionInput] = useState('');
  const [picturesList, setPicturesList] = useState<{ url: string; caption: string }[]>([]);

  // Voice
  const [voiceUrl, setVoiceUrl] = useState('');
  const [voiceCaption, setVoiceCaption] = useState('');

  // Video
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');

  // Refs for web-based file browsing
  const profilePictureInputRef = useRef<any>(null);

  // ─── Step 2 States (License Details) ──────────────────────────────────────
  const [licenseUrlInput, setLicenseUrlInput] = useState('');
  const [licenseCaptionInput, setLicenseCaptionInput] = useState('');
  const [licensesList, setLicensesList] = useState<{ url: string; caption: string }[]>([]);

  // ─── Step 3 States (Availability) ─────────────────────────────────────────
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('1:00 PM');
  const [slotsList, setSlotsList] = useState<string[]>(['10:00 AM - 1:00 PM']);
  const [selectedDays, setSelectedDays] = useState<string[]>(['WED']);

  // Modals for Step 3 time selection
  const [startTimeModal, setStartTimeModal] = useState(false);
  const [endTimeModal, setEndTimeModal] = useState(false);

  const TIME_OPTIONS = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  // ─── Step 1 Action Helpers ────────────────────────────────────────────────
  const addEducation = () => {
    if (educationInput.trim()) {
      setEducationList([...educationList, educationInput.trim()]);
      setEducationInput('');
    }
  };

  const removeEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const addHospital = () => {
    if (hospitalInput.trim()) {
      setHospitalList([...hospitalList, hospitalInput.trim()]);
      setHospitalInput('');
    }
  };

  const removeHospital = (index: number) => {
    setHospitalList(hospitalList.filter((_, i) => i !== index));
  };

  const addPictureCombo = () => {
    if (pictureUrlInput.trim()) {
      setPicturesList([...picturesList, { url: pictureUrlInput.trim(), caption: pictureCaptionInput.trim() }]);
      setPictureUrlInput('');
      setPictureCaptionInput('');
    }
  };

  const removePictureCombo = (index: number) => {
    setPicturesList(picturesList.filter((_, i) => i !== index));
  };

  const triggerProfilePictureUpload = () => {
    if (Platform.OS === 'web') {
      profilePictureInputRef.current?.click();
    } else {
      setUploadedProfilePicture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  };

  const handleProfilePictureChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setUploadedProfilePicture(base64Data);
    };
    reader.onerror = (err) => {
      console.error("FileReader error: ", err);
    };
    reader.readAsDataURL(file);
  };

  const addLicenseCombo = () => {
    if (licenseUrlInput.trim()) {
      setLicensesList([...licensesList, { url: licenseUrlInput.trim(), caption: licenseCaptionInput.trim() }]);
      setLicenseUrlInput('');
      setLicenseCaptionInput('');
    }
  };

  const removeLicenseCombo = (index: number) => {
    setLicensesList(licensesList.filter((_, i) => i !== index));
  };

  // ─── Step 3 Action Helpers ────────────────────────────────────────────────
  const addTimeSlot = () => {
    const newSlot = `${startTime} - ${endTime}`;
    if (!slotsList.includes(newSlot)) {
      setSlotsList([...slotsList, newSlot]);
    }
  };

  const removeTimeSlot = (index: number) => {
    setSlotsList(slotsList.filter((_, i) => i !== index));
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

  // ─── Navigation/Validation Helpers ────────────────────────────────────────
  const handleProceedStep1 = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!speciality) {
      setError('Please select your speciality.');
      return;
    }
    if (!uploadedProfilePicture) {
      setError('Please upload a profile photo.');
      return;
    }
    if (educationList.length === 0) {
      setError('Please add at least one education credential.');
      return;
    }
    if (!cityOfPractice.trim()) {
      setError('Please enter your city of practice.');
      return;
    }
    if (hospitalList.length === 0) {
      setError('Please add at least one hospital or clinic.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleProceedStep2 = () => {
    if (licensesList.length === 0) {
      setError('Please add at least one medical licence certificate.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleConfirmRegistration = async () => {
    if (slotsList.length === 0) {
      setError('Please add at least one available time slot.');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one available day.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Map availability list and slots to the backend schedule format
      // key = day name lowercase, value = list of slots
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

      const payload: any = {
        name: fullName.trim(),
        specialization: speciality,
        education: educationList,
        city: cityOfPractice.trim(),
        hospital: hospitalList,
        description: description.trim() || undefined,
        profilePicture: uploadedProfilePicture,
        pictures: picturesList,
        voice: voiceUrl.trim() ? { url: voiceUrl.trim(), caption: voiceCaption.trim() } : null,
        video: videoUrl.trim() ? { url: videoUrl.trim(), caption: videoCaption.trim() } : null,
        licenses: licensesList,
        schedule: scheduleMap,
      };

      if (email) {
        payload.email = email;
      } else {
        payload.mobileNo = mobileNo;
        payload.countryCode = countryCode;
      }

      const response = await api.post('/auth/register', payload);
      const { token, user } = response.data;

      await setToken(token);
      await setUser(user);

      // Successfully registered, send to dashboard home!
      navigation.replace('Home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Hidden file inputs for web support */}
      {Platform.OS === 'web' && (
        <View style={{ display: 'none' }}>
          <input type="file" ref={profilePictureInputRef} onChange={handleProfilePictureChange} accept="image/*" />
        </View>
      )}

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigation.replace('Login');
            }
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backChevron}>〈</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE BUILDER</Text>
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Progress Indicators ── */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            {/* Step 1: Background */}
            <View style={styles.progressNode}>
              <View style={[styles.circle, step >= 1 && styles.circleActive]} />
              <Text style={[styles.progressLabel, step >= 1 && styles.progressLabelActive]}>BACKGROUND</Text>
            </View>

            <View style={[styles.line, step >= 2 && styles.lineActive]} />

            {/* Step 2: License Details */}
            <View style={styles.progressNode}>
              <View style={[styles.circle, step >= 2 && styles.circleActive]} />
              <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>LICENCE DETAILS</Text>
            </View>

            <View style={[styles.line, step >= 3 && styles.lineActive]} />

            {/* Step 3: Availability */}
            <View style={styles.progressNode}>
              <View style={[styles.circle, step >= 3 && styles.circleActive]} />
              <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>AVAILABILITY</Text>
            </View>
          </View>
        </View>

        {/* ── Red Notice Banner ── */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            * Your profile will be published only after our team has verified all the details
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── STEP 1: BACKGROUND ── */}
        {step === 1 && (
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.textInputStyle}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9aacac"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Speciality Category Dropdown */}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Speciality Category *</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setCategoryDropdownOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownValue}>{specialityCategory}</Text>
                <Text style={styles.chevronIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Subspeciality Dropdown */}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Subspeciality *</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setSubspecialityDropdownOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownValue}>{speciality}</Text>
                <Text style={styles.chevronIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Education */}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Education *</Text>
              <View style={styles.searchBarContainer}>
                <Text style={styles.searchPrefix}>🔍</Text>
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Search here"
                  placeholderTextColor="#9aacac"
                  value={educationInput}
                  onChangeText={setEducationInput}
                  onSubmitEditing={addEducation}
                />
                <Text style={styles.searchSuffix}>🎤</Text>
              </View>
              {educationList.length > 0 && (
                <View style={styles.chipRow}>
                  {educationList.map((edu, idx) => (
                    <View key={idx} style={styles.chip}>
                      <Text style={styles.chipText}>{edu}</Text>
                      <TouchableOpacity onPress={() => removeEducation(idx)}>
                        <Text style={styles.chipRemove}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.addButton} onPress={addEducation}>
                <Text style={styles.addPlus}>＋</Text>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* City of Practice */}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>City of Practice *</Text>
              <View style={styles.searchBarContainer}>
                <Text style={styles.searchPrefix}>🔍</Text>
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Search here"
                  placeholderTextColor="#9aacac"
                  value={cityOfPractice}
                  onChangeText={setCityOfPractice}
                />
                <Text style={styles.searchSuffix}>🎤</Text>
              </View>
            </View>

            {/* Hospital / Clinics */}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Hospital / Clinics *</Text>
              <View style={styles.searchBarContainer}>
                <Text style={styles.searchPrefix}>🔍</Text>
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Search here"
                  placeholderTextColor="#9aacac"
                  value={hospitalInput}
                  onChangeText={setHospitalInput}
                  onSubmitEditing={addHospital}
                />
                <Text style={styles.searchSuffix}>🎤</Text>
              </View>
              {hospitalList.length > 0 && (
                <View style={styles.chipRow}>
                  {hospitalList.map((hosp, idx) => (
                    <View key={idx} style={styles.chip}>
                      <Text style={styles.chipText}>{hosp}</Text>
                      <TouchableOpacity onPress={() => removeHospital(idx)}>
                        <Text style={styles.chipRemove}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.addButton} onPress={addHospital}>
                <Text style={styles.addPlus}>＋</Text>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Description (Optional) */}
            <View style={styles.inputWrapper}>
              <View style={styles.descriptionHeader}>
                <Text style={styles.fieldLabel}>Description (Optional)</Text>
                <Text style={styles.micIcon}>🎤</Text>
              </View>
              <TextInput
                style={[styles.textInputStyle, styles.textArea]}
                placeholder="Text..."
                placeholderTextColor="#9aacac"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Upload Profile Photo */}
            <View style={styles.uploadsContainer}>
              <Text style={styles.fieldLabel}>Profile Photo *</Text>
              <TouchableOpacity style={styles.profilePhotoUploadBox} onPress={triggerProfilePictureUpload}>
                {uploadedProfilePicture ? (
                  <View style={styles.profilePhotoPreviewContainer}>
                    <Image source={{ uri: uploadedProfilePicture }} style={styles.profilePhotoPreview} />
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); setUploadedProfilePicture(null); }}
                      style={styles.profilePhotoRemoveBtn}
                    >
                      <Text style={styles.removeBtnText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.profilePhotoPlaceholder}>
                    <Text style={styles.uploadIcon}>👤</Text>
                    <Text style={styles.uploadLabel}>Upload Profile Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Pictures & Certificates (Dynamic link + caption combos) */}
            <View style={[styles.uploadsContainer, { marginTop: 20 }]}>
              <Text style={styles.fieldLabel}>Pictures & Certificates (Optional)</Text>
              
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.textInputStyle, { flex: 2, marginRight: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Image URL"
                  placeholderTextColor="#9aacac"
                  value={pictureUrlInput}
                  onChangeText={setPictureUrlInput}
                />
                <TextInput
                  style={[styles.textInputStyle, { flex: 1.5, marginRight: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Caption"
                  placeholderTextColor="#9aacac"
                  value={pictureCaptionInput}
                  onChangeText={setPictureCaptionInput}
                />
                <TouchableOpacity style={styles.addMediaLinkBtn} onPress={addPictureCombo}>
                  <Text style={styles.addMediaLinkBtnText}>＋ Add</Text>
                </TouchableOpacity>
              </View>

              {picturesList.length > 0 && (
                <View style={styles.mediaLinksList}>
                  {picturesList.map((item, idx) => (
                    <View key={idx} style={styles.mediaLinkItem}>
                      <View style={styles.mediaLinkInfo}>
                        {item.url.startsWith('http') || item.url.startsWith('data:') ? (
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

            {/* Voice Introduction Link */}
            <View style={[styles.uploadsContainer, { marginTop: 20 }]}>
              <Text style={styles.fieldLabel}>Voice Introduction (Optional)</Text>
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.textInputStyle, { flex: 2, marginRight: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Audio Link URL"
                  placeholderTextColor="#9aacac"
                  value={voiceUrl}
                  onChangeText={setVoiceUrl}
                />
                <TextInput
                  style={[styles.textInputStyle, { flex: 1.5, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Caption"
                  placeholderTextColor="#9aacac"
                  value={voiceCaption}
                  onChangeText={setVoiceCaption}
                />
              </View>
            </View>

            {/* Presentation Video Link */}
            <View style={[styles.uploadsContainer, { marginTop: 20 }]}>
              <Text style={styles.fieldLabel}>Presentation Video (Optional)</Text>
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.textInputStyle, { flex: 2, marginRight: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Video Link URL"
                  placeholderTextColor="#9aacac"
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                />
                <TextInput
                  style={[styles.textInputStyle, { flex: 1.5, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Caption"
                  placeholderTextColor="#9aacac"
                  value={videoCaption}
                  onChangeText={setVideoCaption}
                />
              </View>
            </View>

            {/* Step 1 Button */}
            <TouchableOpacity style={styles.actionButton} onPress={handleProceedStep1}>
              <Text style={styles.actionButtonText}>SAVE & PROCEED</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: LICENCE DETAILS ── */}
        {step === 2 && (
          <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Enter your Medical Licence Details *</Text>

            <View style={styles.uploadsContainer}>
              <Text style={styles.fieldLabel}>Licence Link & Caption *</Text>
              
              <View style={styles.linkCaptionInputRow}>
                <TextInput
                  style={[styles.textInputStyle, { flex: 2, marginRight: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Licence Image URL"
                  placeholderTextColor="#9aacac"
                  value={licenseUrlInput}
                  onChangeText={setLicenseUrlInput}
                />
                <TextInput
                  style={[styles.textInputStyle, { flex: 1.5, marginRight: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#ffffff' }]}
                  placeholder="Caption (e.g. State Licence)"
                  placeholderTextColor="#9aacac"
                  value={licenseCaptionInput}
                  onChangeText={setLicenseCaptionInput}
                />
                <TouchableOpacity style={styles.addMediaLinkBtn} onPress={addLicenseCombo}>
                  <Text style={styles.addMediaLinkBtnText}>＋ Add</Text>
                </TouchableOpacity>
              </View>

              {licensesList.length > 0 && (
                <View style={styles.mediaLinksList}>
                  {licensesList.map((item, idx) => (
                    <View key={idx} style={styles.mediaLinkItem}>
                      <View style={styles.mediaLinkInfo}>
                        {item.url.startsWith('http') || item.url.startsWith('data:') ? (
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

            {/* Step 2 Button */}
            <TouchableOpacity style={styles.actionButton} onPress={handleProceedStep2}>
              <Text style={styles.actionButtonText}>SAVE & PROCEED</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 3: AVAILABILITY ── */}
        {step === 3 && (
          <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Available Time Slot *</Text>

            {/* Time Slot Picker Display */}
            <View style={styles.timeSlotsRow}>
              <TouchableOpacity style={styles.timeDropdown} onPress={() => setStartTimeModal(true)}>
                <Text style={styles.timeText}>{startTime}</Text>
                <Text style={styles.timeChevron}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.toSeparator}>to</Text>

              <TouchableOpacity style={styles.timeDropdown} onPress={() => setEndTimeModal(true)}>
                <Text style={styles.timeText}>{endTime}</Text>
                <Text style={styles.timeChevron}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* List of Slots */}
            {slotsList.length > 0 && (
              <View style={styles.slotsBlock}>
                {slotsList.map((slot, idx) => (
                  <View key={idx} style={styles.slotPill}>
                    <Text style={styles.slotText}>{slot}</Text>
                    <TouchableOpacity onPress={() => removeTimeSlot(idx)}>
                      <Text style={styles.slotRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Slot Button */}
            <TouchableOpacity style={styles.addButton} onPress={addTimeSlot}>
              <Text style={styles.addPlus}>＋</Text>
              <Text style={styles.addText}>Add Slot</Text>
            </TouchableOpacity>

            {/* Available Days */}
            <Text style={[styles.stepTitle, { marginTop: 32 }]}>Available Days *</Text>
            <View style={styles.daysGrid}>
              {DAYS.map((day) => {
                const selected = selectedDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayCell, selected && styles.dayCellActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayText, selected && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[
                  styles.dayCell,
                  styles.allDayCell,
                  selectedDays.length === DAYS.length && styles.dayCellActive
                ]}
                onPress={() => toggleDay('ALL')}
              >
                <Text style={[styles.dayText, selectedDays.length === DAYS.length && styles.dayTextActive]}>ALL</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.nonSelectedNotice}>
              * You will not receive any bookings on non-selected days
            </Text>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[styles.actionButton, loading && styles.actionButtonDisabled]}
              onPress={handleConfirmRegistration}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>CONFIRM</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Speciality Category Picker Modal ── */}
      <Modal
        visible={categoryDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryDropdownOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={['Medical', 'Radiology', 'Surgical']}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === specialityCategory && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSpecialityCategory(item as any);
                    setSpeciality(SPECIALITY_CATEGORIES[item as keyof typeof SPECIALITY_CATEGORIES][0]);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === specialityCategory && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Subspeciality Picker Modal ── */}
      <Modal
        visible={subspecialityDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSubspecialityDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSubspecialityDropdownOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Subspeciality</Text>
            <FlatList
              data={SPECIALITY_CATEGORIES[specialityCategory]}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === speciality && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSpeciality(item);
                    setSubspecialityDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === speciality && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Start Time Selection Modal ── */}
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

      {/* ── End Time Selection Modal ── */}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: {
    paddingBottom: 48,
  },

  // Header styles
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecebeb',
    backgroundColor: '#ffffff',
  },
  backBtn: { padding: 4 },
  backChevron: { fontSize: 18, color: '#1a3a3a', fontWeight: 'bold' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a3a3a', letterSpacing: 0.5 },
  searchIcon: { fontSize: 16, color: '#1a3a3a' },

  // Progress indicators
  progressContainer: {
    backgroundColor: '#f6fbfb',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f5f5',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  progressNode: {
    alignItems: 'center',
    width: 90,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#cbd5e1',
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  circleActive: {
    backgroundColor: '#007c7c',
  },
  progressLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#007c7c',
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: '#cbd5e1',
    marginHorizontal: -20,
    marginTop: -14, // align with circle centers
    zIndex: -1,
  },
  lineActive: {
    backgroundColor: '#007c7c',
  },

  // Notice banner
  noticeBanner: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  noticeText: {
    color: '#e05555',
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  errorBox: {
    backgroundColor: '#fce8e8',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#e05555',
  },
  errorText: { color: '#c0392b', fontSize: 12.5, fontWeight: '500' },

  // Form container
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2c374e',
    marginBottom: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchPrefix: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 6,
  },
  searchSuffix: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 6,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    padding: 0,
  } as any,
  textInputStyle: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    padding: 0,
  } as any,
  textArea: {
    height: 72,
    textAlignVertical: 'top',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },

  // Dropdown selector
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: '#ffffff',
  },
  dropdownValue: {
    fontSize: 13,
    color: '#1e293b',
  },
  chevronIcon: {
    fontSize: 10,
    color: '#94a3b8',
  },

  // Chip list
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 11.5,
    color: '#334155',
    marginRight: 4,
  },
  chipRemove: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: 'bold',
  },

  // Add button styles
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  addPlus: {
    fontSize: 14,
    color: '#1e3040',
    fontWeight: 'bold',
    marginRight: 4,
  },
  addText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e3040',
  },

  // Upload boxes
  uploadsContainer: {
    marginBottom: 32,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  uploadIcon: {
    fontSize: 24,
    color: '#475569',
    marginBottom: 6,
  },
  uploadLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  uploadedCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  checkText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Save Proceed button
  actionButton: {
    backgroundColor: '#1e3040',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Step 2 specific styles
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c374e',
    marginBottom: 16,
  },
  licenseDashedBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    aspectRatio: 1.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginBottom: 24,
    padding: 16,
  },
  licenseCameraIcon: {
    fontSize: 32,
    color: '#475569',
    marginBottom: 8,
  },
  dashedBoxPlaceholder: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  uploadedFileName: {
    fontSize: 12.5,
    color: '#0f766e',
    fontWeight: '600',
    textAlign: 'center',
  },
  browseBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    height: 42,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginBottom: 36,
  },
  browseInput: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  browseButton: {
    backgroundColor: '#1e3040',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Step 3 specific styles
  timeSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: '#ffffff',
  },
  timeText: {
    fontSize: 13,
    color: '#1e293b',
  },
  timeChevron: {
    fontSize: 9,
    color: '#94a3b8',
  },
  toSeparator: {
    fontSize: 13,
    color: '#64748b',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  slotsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slotText: {
    fontSize: 11.5,
    color: '#166534',
    marginRight: 4,
    fontWeight: '500',
  },
  slotRemove: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  dayCell: {
    width: '22%',
    aspectRatio: 1.6,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  allDayCell: {
    borderColor: '#0284c7',
  },
  dayCellActive: {
    backgroundColor: '#007c7c',
    borderColor: '#007c7c',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  dayTextActive: {
    color: '#ffffff',
  },
  nonSelectedNotice: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
    marginVertical: 12,
  },

  // Modal styles
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
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '750',
    color: '#1a3a3a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
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
  profilePhotoUploadBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
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
  addMediaLinkBtn: {
    backgroundColor: '#1e3040',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaLinkBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
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
