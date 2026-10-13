import { useEffect, useRef, useMemo} from 'react';
import { Animated, LayoutAnimation, Platform, UIManager, View, Text, Pressable, StyleSheet, } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// Needed so the "slide to top" animation also works on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BoxItem({ box, count, onOpen, onPin, onEdit, fullWidth, selected }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const boxScale = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;

  // When the box becomes pinned, make the badge pop in
  useEffect(() => {
    if (box.pinned) {
      badgeScale.setValue(0);
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [box.pinned]);

  function handleLongPress() {
    // 1. vibrate
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 2. bounce the box: shrink a little, then spring back
    Animated.sequence([
      Animated.timing(boxScale, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(boxScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. smooth move to the new position, then pin/unpin
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPin();
  }

  return (
    <Animated.View style={[styles.wrapper, fullWidth && styles.wrapperFull, { transform: [{ scale: boxScale }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.box,
          box.pinned && styles.boxPinned,
          selected && styles.boxSelected,
          pressed && styles.boxPressed,
        ]}
        onPress={onOpen}
        onLongPress={handleLongPress}
      >
        <View style={styles.topRow}>
          {box.pinned ? (
            <Animated.View
              style={[styles.badge, { transform: [{ scale: badgeScale }] }]}
            >
              <Ionicons name="pin" size={12} color={colors.onPrimary} />
              <Text style={styles.badgeText}>Pinned</Text>
            </Animated.View>
          ) : (
            <View />
          )}
          <Pressable onPress={onEdit} hitSlop={10}>
            <Ionicons name="pencil" size={18} color={colors.boxText} />
          </Pressable>
        </View>

        <View style={styles.label}>
          <Text style={styles.boxName} numberOfLines={1}>
            {box.name}
          </Text>
          <Text style={styles.boxDesc} numberOfLines={2}>
            {box.description}
          </Text>
        </View>

        <Text style={styles.count}>{count} memories</Text>
      </Pressable>
    </Animated.View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    wrapper: { width: '48%', marginBottom: 16 },
    wrapperFull: { width: '100%' },
    box: {
      backgroundColor: colors.boxFill,
      borderRadius: 8,
      padding: 10,
      minHeight: 150,
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    boxPinned: { borderColor: colors.primary, backgroundColor: colors.boxFillPinned },
    boxSelected: { borderColor: colors.text },
    boxPressed: { opacity: 0.7 },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 22,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeText: { color: colors.onPrimary, fontSize: 11, fontWeight: '700', marginLeft: 3 },
    label: { backgroundColor: colors.boxLabel, borderRadius: 4, padding: 8 },
    boxName: { fontSize: 16, fontWeight: '700', color: colors.text },
    boxDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    count: { fontSize: 12, color: colors.boxText, marginTop: 8 },
  });
}