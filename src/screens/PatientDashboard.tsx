import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import { getUser, setToken, setUser } from '../services/api';

export default function PatientDashboard({ navigation }: any) {
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getUser();
      setPatient(u);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await setToken(null);
    await setUser(null);
    navigation.replace('Login');
  };

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.nameText}>{patient.name}</Text>
        </View>
        <Button 
          title="Sign Out" 
          onPress={handleLogout} 
          variant="secondary"
          style={styles.logoutBtn}
          textStyle={styles.logoutText}
        />
      </View>

      <View style={styles.grid}>
        {/* Info Card */}
        <Card style={styles.gridCard}>
          <Text style={styles.cardTitle}>My Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>Patient</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{patient.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registered On:</Text>
            <Text style={styles.infoValue}>
              {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </Card>

        {/* Appointments Summary */}
        <Card style={styles.gridCard}>
          <Text style={styles.cardTitle}>Upcoming Consultations</Text>
          <Text style={styles.noAppointments}>No active bookings found.</Text>
          <Button 
            title="Book New Appointment" 
            onPress={() => {}} 
            style={styles.bookBtn}
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 1024,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    borderBottomWidth: 1.5,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  logoutBtn: {
    marginVertical: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 14,
  },
  grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
  },
  gridCard: {
    flex: 1,
    minWidth: 280,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#4b5563',
  },
  infoValue: {
    color: '#111827',
  },
  noAppointments: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 24,
  },
  bookBtn: {
    marginTop: 8,
  },
});
