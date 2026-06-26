import React, { useState } from 'react';
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
  SectionList,
} from 'react-native';
import api, { setToken, setUser } from '../services/api';

// ─── OncoCare Logo Component ─────────────────────────────────────────────────
function OncoCareLogoSmall() {
  return (
    <View style={logoStyles.row}>
      <View style={logoStyles.iconBox}>
        <View style={logoStyles.crossV} />
        <View style={logoStyles.crossH} />
        <View style={logoStyles.dot} />
      </View>
      <View>
        <Text style={logoStyles.name}>ONCOCARE</Text>
        <Text style={logoStyles.tagline}>CARE FOR CURE</Text>
      </View>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 46,
    height: 46,
    backgroundColor: '#2a8a8a',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
    overflow: 'hidden',
  },
  crossV: { position: 'absolute', width: 6, height: 24, backgroundColor: '#fff', borderRadius: 3 },
  crossH: { position: 'absolute', width: 24, height: 6, backgroundColor: '#fff', borderRadius: 3 },
  dot: {
    position: 'absolute',
    bottom: 5,
    right: 3,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: 'rgba(200,220,160,0.55)',
  },
  name: { fontSize: 17, fontWeight: '700', color: '#1a3a3a', letterSpacing: 2 },
  tagline: { fontSize: 8, fontWeight: '500', color: '#5a8a8a', letterSpacing: 3, marginTop: 1 },
});

// ─── Underline Input ─────────────────────────────────────────────────────────
function UnderlineInput({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      <TextInput
        style={[inputStyles.input, focused && inputStyles.inputFocused]}
        placeholder={placeholder}
        placeholderTextColor="#9aacac"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <View style={[inputStyles.underline, focused && inputStyles.underlineFocused]} />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 28 },
  input: {
    fontSize: 15,
    color: '#1a3a3a',
    paddingVertical: 6,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  } as any,
  inputFocused: {},
  underline: { height: 1, backgroundColor: '#9aacac', marginTop: 2 },
  underlineFocused: { backgroundColor: '#2a8a8a', height: 1.5 },
});

import { COUNTRY_CODES } from '../utils/countryCodes';

// Group and sort country codes alphabetically with section headers
interface CountryCode {
  code: string;
  name: string;
}

interface Section {
  title: string;
  data: CountryCode[];
}

const COUNTRY_CODES_SECTIONS: Section[] = COUNTRY_CODES.reduce((acc: Section[], item) => {
  // Get first letter of country name (e.g., "A" from "Afghanistan (+93)")
  const firstLetter = item.name.charAt(0).toUpperCase();
  let section = acc.find(s => s.title === firstLetter);
  if (!section) {
    section = { title: firstLetter, data: [] };
    acc.push(section);
  }
  section.data.push(item);
  return acc;
}, []).sort((a, b) => a.title.localeCompare(b.title));

// Ensure each section's data is sorted alphabetically by name
COUNTRY_CODES_SECTIONS.forEach(section => {
  section.data.sort((a, b) => a.name.localeCompare(b.name));
});

export default function LoginScreen({ navigation }: any) {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState('+971');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetStarted = async () => {
    if (authMethod === 'phone') {
      if (!mobileNo.trim()) {
        setError('Please enter your mobile number.');
        return;
      }
    } else {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }
    setError('');
    setLoading(true);

    try {
      const payload = authMethod === 'phone'
        ? { countryCode, mobileNo: mobileNo.trim() }
        : { email: email.trim().toLowerCase() };

      const response = await api.post('/auth/login', payload);
      
      const { token, user } = response.data;
      await setToken(token);
      await setUser(user);
      
      navigation.replace('Home');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 400 || (err.response?.data?.error && (err.response.data.error.includes('not found') || err.response.data.error.includes('does not exist')))) {
        if (authMethod === 'phone') {
          navigation.navigate('ProfileBuilder', { countryCode: countryCode, mobileNo: mobileNo.trim() });
        } else {
          navigation.navigate('ProfileBuilder', { email: email.trim().toLowerCase() });
        }
      } else {
        setError(err.response?.data?.error || 'Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top section with logo ── */}
        <View style={styles.topSection}>
          <OncoCareLogoSmall />
        </View>

        {/* ── Bottom form section ── */}
        <View style={styles.bottomSection}>
          <Text style={styles.title}>Welcome to OncoCare</Text>
          <Text style={styles.subtitle}>
            {authMethod === 'phone' ? 'Enter your mobile number to get started.' : 'Enter your email address to get started.'}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Toggle tabs for Phone vs Email */}
          <View style={styles.selectorRow}>
            <TouchableOpacity
              style={[
                styles.selectorBtn,
                authMethod === 'phone' ? styles.selectorBtnActive : styles.selectorBtnInactive,
              ]}
              onPress={() => {
                setError('');
                setAuthMethod('phone');
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.selectorText,
                  authMethod === 'phone' ? styles.selectorTextActive : styles.selectorTextInactive,
                ]}
              >
                Phone Number
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectorBtn,
                authMethod === 'email' ? styles.selectorBtnActive : styles.selectorBtnInactive,
              ]}
              onPress={() => {
                setError('');
                setAuthMethod('email');
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.selectorText,
                  authMethod === 'email' ? styles.selectorTextActive : styles.selectorTextInactive,
                ]}
              >
                Email Address
              </Text>
            </TouchableOpacity>
          </View>

          {authMethod === 'phone' ? (
            /* Phone Input Row */
            <View style={styles.phoneInputRow}>
              {/* Country Code Trigger */}
              <TouchableOpacity
                style={styles.countryCodeSelector}
                onPress={() => setCodeModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.countryCodeText}>{countryCode}</Text>
              </TouchableOpacity>

              {/* Mobile Number Input */}
              <View style={styles.mobileInputContainer}>
                <TextInput
                  style={[styles.input, inputFocused && styles.inputFocused]}
                  placeholder="Mobile No."
                  placeholderTextColor="#9aacac"
                  value={mobileNo}
                  onChangeText={(text) => setMobileNo(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  outlineStyle="none"
                />
                <View style={[styles.underline, inputFocused && styles.underlineFocused]} />
              </View>
            </View>
          ) : (
            /* Email Input Container */
            <View style={{ width: '100%', marginBottom: 28 }}>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                placeholder="Email Address"
                placeholderTextColor="#9aacac"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                outlineStyle="none"
              />
              <View style={[styles.underline, emailFocused && styles.underlineFocused]} />
            </View>
          )}

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* GET STARTED button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGetStarted}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>GET STARTED</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Code Selector Modal */}
      <Modal
        visible={codeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCodeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCodeModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <SectionList
              sections={COUNTRY_CODES_SECTIONS}
              keyExtractor={(item) => item.code + '-' + item.name}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.code === countryCode && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCodeModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item.code === countryCode && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined,
  },
  topSection: {
    backgroundColor: '#ffffff',
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#d6ecee',
    paddingTop: 48,
    paddingHorizontal: 36,
    paddingBottom: 48,
    minHeight: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a3a3a',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7a7a',
    marginBottom: 36,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fce8e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#e05555',
  },
  errorText: { color: '#c0392b', fontSize: 13, fontWeight: '500' },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  countryCodeSelector: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#9aacac',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 54,
  },
  countryCodeText: {
    fontSize: 15,
    color: '#1a3a3a',
    fontWeight: '700',
  },
  mobileInputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 15,
    color: '#1a3a3a',
    paddingVertical: 6,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  } as any,
  inputFocused: {},
  underline: { height: 1, backgroundColor: '#9aacac', marginTop: 2 },
  underlineFocused: { backgroundColor: '#2a8a8a', height: 1.5 },
  spacer: { flex: 1, minHeight: 40 },
  button: {
    backgroundColor: '#1e3040',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: '72%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3a3a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalItemSelected: {
    backgroundColor: '#eaf6f7',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1a3a3a',
    fontWeight: '500',
  },
  modalItemTextSelected: {
    color: '#2a8a8a',
    fontWeight: '700',
  },
  selectorRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    marginBottom: 28,
  },
  selectorBtn: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selectorBtnActive: {
    backgroundColor: '#007c7c',
    borderColor: '#007c7c',
    shadowColor: '#007c7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  selectorBtnInactive: {
    backgroundColor: '#eaf6f7',
    borderColor: '#2c374e',
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  selectorTextInactive: {
    color: '#2c374e',
  },
  sectionHeader: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    alignItems: 'flex-start',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
