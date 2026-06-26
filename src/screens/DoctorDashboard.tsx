import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { getUser, setToken, setUser } from '../services/api';

// ─── Mock upcoming appointments (will be replaced by API data later) ─────────
const MOCK_APPOINTMENTS = [
  {
    id: '1',
    patientName: 'Mariam Matar',
    initials: 'MM',
    diagnosis: 'Lung Cancer',
    stage: 'Stage III',
    timeSlot: '10 - 11 AM',
  },
  {
    id: '2',
    patientName: 'Ahmed Hassan',
    initials: 'AH',
    diagnosis: 'Breast Cancer',
    stage: 'Stage II',
    timeSlot: '11 - 12 PM',
  },
];

// ─── OncoCare Top Logo ────────────────────────────────────────────────────────
function OncoCareTopLogo() {
  return (
    <View style={logoStyles.row}>
      <View style={logoStyles.iconBox}>
        <View style={logoStyles.crossV} />
        <View style={logoStyles.crossH} />
        <View style={logoStyles.dot} />
      </View>
      <Text style={logoStyles.name}>ONCOCARE</Text>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: {
    width: 34,
    height: 34,
    backgroundColor: '#2a8a8a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
    overflow: 'hidden',
  },
  crossV: { position: 'absolute', width: 5, height: 18, backgroundColor: '#fff', borderRadius: 3 },
  crossH: { position: 'absolute', width: 18, height: 5, backgroundColor: '#fff', borderRadius: 3 },
  dot: {
    position: 'absolute', bottom: 3, right: 2,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: 'rgba(200,220,160,0.55)',
  },
  name: { fontSize: 14, fontWeight: '700', color: '#1a3a3a', letterSpacing: 1.5 },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, subLabel }: { label: string; value: string; subLabel: string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.sub}>{subLabel}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#2a8a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 10, color: '#6b9a9a', textAlign: 'center', marginBottom: 6, fontWeight: '500' },
  value: { fontSize: 20, fontWeight: '800', color: '#1a3a3a', marginBottom: 2 },
  sub: { fontSize: 10, color: '#9aacac', textAlign: 'center' },
});

// ─── Appointment Card ─────────────────────────────────────────────────────────
function AppointmentCard({ appt, navigation }: any) {
  return (
    <View style={apptStyles.wrapper}>
      {/* Time Slot Header */}
      <Text style={apptStyles.timeLabel}>
        Time slot :{' '}
        <Text style={apptStyles.timeValue}>{appt.timeSlot}</Text>
      </Text>

      {/* Patient Row */}
      <View style={apptStyles.patientRow}>
        <View style={apptStyles.initialsBox}>
          <Text style={apptStyles.initialsText}>{appt.initials}</Text>
        </View>
        <View style={apptStyles.patientInfo}>
          <Text style={apptStyles.patientName}>{appt.patientName}</Text>
          <Text style={apptStyles.diagnosis}>{appt.diagnosis}</Text>
          <Text style={apptStyles.stage}>{appt.stage}</Text>
        </View>
      </View>

      {/* Action Row 1 */}
      <View style={apptStyles.actionRow}>
        <TouchableOpacity style={apptStyles.actionBtn}>
          <Text style={apptStyles.actionBtnText}>VIEW CONVERSATIONS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={apptStyles.actionBtn}>
          <Text style={apptStyles.actionBtnText}>CHECK PROGRESS</Text>
        </TouchableOpacity>
      </View>

      {/* Action Row 2 */}
      <View style={apptStyles.actionRow2}>
        <TouchableOpacity style={apptStyles.cancelBtn}>
          <Text style={apptStyles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={apptStyles.rescheduleBtn}>
          <Text style={apptStyles.rescheduleText}>RESCHEDULE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={apptStyles.callBtn}>
          <Text style={apptStyles.callText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const apptStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2a8a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  timeLabel: { fontSize: 15, fontWeight: '700', color: '#1a3a3a', marginBottom: 12 },
  timeValue: { fontWeight: '800', color: '#1a3a3a' },
  patientRow: { flexDirection: 'row', marginBottom: 16, gap: 14 },
  initialsBox: {
    width: 64,
    height: 64,
    backgroundColor: '#2a8a8a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  patientInfo: { justifyContent: 'center', gap: 4 },
  patientName: { fontSize: 16, fontWeight: '700', color: '#1a3a3a' },
  diagnosis: { fontSize: 13, color: '#4a7a7a', fontWeight: '500' },
  stage: { fontSize: 12, color: '#7a9a9a' },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c0d8d8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 11, fontWeight: '600', color: '#2a8a8a', letterSpacing: 0.5 },
  actionRow2: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c0d8d8',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: { fontSize: 12, fontWeight: '600', color: '#4a7a7a', letterSpacing: 0.5 },
  rescheduleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c0d8d8',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rescheduleText: { fontSize: 12, fontWeight: '600', color: '#4a7a7a', letterSpacing: 0.5 },
  callBtn: {
    flex: 1,
    backgroundColor: '#2a8a8a',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  callText: { fontSize: 12, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
});

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
function BottomTabBar({ active, navigation }: { active: string; navigation: any }) {
  const tabs = [
    { id: 'home', label: 'HOME', icon: '⊞' },
    { id: 'oncologists', label: 'ONCOLOGISTS', icon: '👩‍⚕️' },
    { id: 'calls', label: '', icon: '📞', isCenter: true },
    { id: 'patients', label: 'PATIENTS', icon: '👤' },
    { id: 'profile', label: 'MY PROFILE', icon: '◉' },
  ];

  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab) =>
        tab.isCenter ? (
          <TouchableOpacity key={tab.id} style={tabStyles.centerBtn}>
            <View style={tabStyles.centerCircle}>
              <Text style={tabStyles.centerIcon}>📞</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={tab.id}
            style={tabStyles.tabItem}
            onPress={() => tab.id === 'profile' && navigation.navigate('MyProfile')}
          >
            <Text style={tabStyles.tabIcon}>{tab.icon}</Text>
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

// ─── Main Home Screen ─────────────────────────────────────────────────────────
export default function DoctorDashboard({ navigation }: any) {
  const [doctor, setDoctor] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getUser();
      setDoctor(u);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await setToken(null);
    await setUser(null);
    navigation.replace('Login');
  };

  if (!doctor) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2a8a8a" />
      </View>
    );
  }

  // Use full name for greeting; strip leading "Dr." prefix if present to avoid "Hi Dr. Dr. X"
  const rawName: string = doctor.name || '';
  const displayName = rawName.replace(/^Dr\.?\s*/i, '').trim() || rawName;
  const remaining = doctor.profile?.remainingCalls ?? 2;
  const totalCalls = doctor.profile?.totalCalls ?? 5;
  const remainingMeetings = doctor.profile?.remainingMeetings ?? 4;
  const totalMeetings = doctor.profile?.totalMeetings ?? 5;
  const payments = doctor.profile?.paymentsReceived ?? 9500;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <OncoCareTopLogo />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutTouch}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9aacac"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Text style={styles.micIcon}>🎙️</Text>
        </View>

        {/* ── Greeting ── */}
        <Text style={styles.greeting}>Hi Dr. {displayName}</Text>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard
            label={'Consultation\ncalls with patients'}
            value={`${remaining}/${totalCalls}`}
            subLabel="Remaining Calls"
          />
          <StatCard
            label={'Meetings with\nother Oncologist'}
            value={`${remainingMeetings}/${totalMeetings}`}
            subLabel="Remaining Meetings"
          />
          <StatCard
            label={'Consultation\nfees'}
            value={`AED ${(payments / 1000).toFixed(1)}k`}
            subLabel="Payment Received"
          />
        </View>

        {/* ── Upcoming Calls ── */}
        <Text style={styles.sectionTitle}>Upcoming calls</Text>

        {MOCK_APPOINTMENTS.map((appt) => (
          <AppointmentCard key={appt.id} appt={appt} navigation={navigation} />
        ))}
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar active="home" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4fafa',
    minHeight: ('100vh' as any),
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4fafa',
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoutTouch: { padding: 6 },
  logoutText: { fontSize: 12, color: '#9aacac', fontWeight: '600' },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    shadowColor: '#2a8a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a3a3a',
    outlineStyle: 'none',
  } as any,
  micIcon: { fontSize: 14, marginLeft: 8 },

  // Greeting
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a3a3a',
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a3a3a',
    marginBottom: 14,
  },
});
