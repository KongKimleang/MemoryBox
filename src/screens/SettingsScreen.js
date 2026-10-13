import { useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';

const OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { userName, setUserName } = useData();
  const { mode, changeMode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Profile</Text>
      <Text style={styles.label}>Your name</Text>
      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder="Enter your name"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.hint}>This name shows in the greeting on Home.</Text>

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Appearance</Text>
      <View style={styles.segment}>
        {OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.segBtn, mode === option.value && styles.segActive]}
            onPress={() => changeMode(option.value)}
          >
            <Text
              style={mode === option.value ? styles.segTextActive : styles.segText}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>
        System follows your phone's light or dark setting.
      </Text>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
    sectionGap: { marginTop: 32 },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      color: colors.text,
    },
    hint: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.segmentBg,
      borderRadius: 8,
    },
    segBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    segActive: { backgroundColor: colors.primary },
    segText: { color: colors.textSecondary, fontSize: 15 },
    segTextActive: { color: colors.onPrimary, fontSize: 15, fontWeight: '600' },
  });
}