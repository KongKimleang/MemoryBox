import { useEffect, useState, useMemo, } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, } from 'react-native';
import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';

export default function AddBoxScreen({ navigation, route }) {
  const { boxes, addBox, updateBox } = useData();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // If we were sent a boxId, we are editing
  const boxId = route.params?.boxId;
  const existingBox = boxes.find((b) => b.id === boxId);
  const isEditing = existingBox !== undefined;

  const [name, setName] = useState(isEditing ? existingBox.name : '');
  const [description, setDescription] = useState(
    isEditing ? existingBox.description : ''
  );

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Box' : 'New Box' });
  }, []);

  function handleSave() {
    if (name.trim() === '') {
      Alert.alert('Name needed', 'Please give your box a name.');
      return;
    }
    if (isEditing) {
      updateBox(boxId, name.trim(), description.trim());
    } else {
      addBox(name.trim(), description.trim());
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Box name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Trip 2026"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Short description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="What goes in this box?"
        placeholderTextColor={colors.textMuted}
        multiline
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>
          {isEditing ? 'Save changes' : 'Save box'}
        </Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 12 },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      color: colors.text,
    },
    multiline: { height: 80, textAlignVertical: 'top' },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 24,
    },
    buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  });
}