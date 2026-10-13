import { useLayoutEffect, useState, useMemo, } from 'react';
import { ScrollView, View, Text, TextInput, Image, Pressable, Alert, Platform, StyleSheet, } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../context/DataContext';
import { toDateString, parseDate, formatDisplay } from '../utils/dates';
import { useTheme } from '../theme/ThemeContext';

export default function AddCardScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { cards, addCard, updateCard } = useData();

  const boxId = route.params?.boxId;
  const cardId = route.params?.cardId;
  const existing = cards.find((c) => c.id === cardId);
  const isEditing = existing !== undefined;

  const [title, setTitle] = useState(isEditing ? existing.title : '');
  const [date, setDate] = useState(
    isEditing ? existing.date : toDateString(new Date())
  );
  const [photoUri, setPhotoUri] = useState(isEditing ? existing.photoUri : null);
  const [note, setNote] = useState(isEditing ? existing.note : '');
  const [showPicker, setShowPicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Memory' : 'New Memory' });
  }, []);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotoUri(`data:image/jpeg;base64,${asset.base64}`);
    }
  }

  function onDateChange(first, second) {
    const selected = second instanceof Date ? second : first;
    if (selected instanceof Date) {
      setDate(toDateString(selected));
    }
  }

  function closePicker() {
    setShowPicker(false);
  }

  function handleSave() {
    if (title.trim() === '') {
      Alert.alert('Title needed', 'Please give this memory a title.');
      return;
    }
    if (isEditing) {
      updateCard(cardId, { title: title.trim(), date, photoUri, note: note.trim() });
    } else {
      addCard(boxId, title.trim(), date, photoUri, note.trim());
    }
    navigation.goBack();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Beach day"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Date</Text>
      <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{formatDisplay(date)}</Text>
      </Pressable>
      {showPicker && (
        <View>
          <DateTimePicker
            value={parseDate(date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
            onValueChange={onDateChange}
            onDismiss={closePicker}
            themeVariant={isDark ? 'dark' : 'light'}
          />
          {Platform.OS === 'ios' && (
            <Pressable style={styles.doneButton} onPress={closePicker}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}

      <Text style={styles.label}>Photo</Text>
      {photoUri ? (
        <View>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Pressable onPress={() => setPhotoUri(null)}>
            <Text style={styles.removePhoto}>Remove photo</Text>
          </Pressable>
        </View>
      ) : null}
      <Pressable style={styles.photoButton} onPress={pickPhoto}>
        <Text style={styles.photoButtonText}>
          {photoUri ? 'Change photo' : 'Choose a photo'}
        </Text>
      </Pressable>

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={note}
        onChangeText={setNote}
        placeholder="Write what you want to remember..."
        multiline
        placeholderTextColor={colors.textMuted}
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>
          {isEditing ? 'Save changes' : 'Save memory'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 14 },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      color: colors.text,
    },
    dateText: { fontSize: 16, color: colors.text },
    multiline: { height: 120, textAlignVertical: 'top' },
    preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 6 },
    removePhoto: { color: colors.danger, marginBottom: 8 },
    photoButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    photoButtonText: { color: colors.primary, fontSize: 16 },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 28,
    },
    buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
    doneButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16 },
    doneText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    yearRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
    yearButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    yearButtonText: { color: colors.primary, fontSize: 14 },
  });
}