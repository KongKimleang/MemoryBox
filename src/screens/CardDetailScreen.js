import { useLayoutEffect, useRef, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, Alert, Animated, PanResponder, StyleSheet, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useData } from '../context/DataContext';
import { formatDisplay } from '../utils/dates';
import { useTheme } from '../theme/ThemeContext';

// Distance between two fingers
function fingerDistance(touches) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function CardDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { cards, toggleFavorite, deleteCard } = useData();
  const cardId = route.params.cardId;
  const card = cards.find((c) => c.id === cardId);

  // ----- Animated values -----
  const zoom = useRef(new Animated.Value(1)).current; // photo size
  const bigHeart = useRef(new Animated.Value(0)).current; // heart over photo
  const smallHeart = useRef(new Animated.Value(1)).current; // heart button

  // Latest card info for the gesture code
  const latest = useRef({});
  latest.current = { card, toggleFavorite };

  // ----- Pinch to zoom -----
  const startDistance = useRef(null);

  const pinchResponder = useRef(
    PanResponder.create({
      // Take over only when two fingers are on the screen
      onMoveShouldSetPanResponderCapture: (e) =>
        e.nativeEvent.touches.length === 2,
      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (e) => {
        const touches = e.nativeEvent.touches;
        if (touches.length !== 2) return;
        const distance = fingerDistance(touches);
        if (startDistance.current === null) {
          startDistance.current = distance;
        }
        const scale = distance / startDistance.current;
        zoom.setValue(Math.min(3, Math.max(1, scale)));
      },

      onPanResponderRelease: () => {
        startDistance.current = null;
        Animated.spring(zoom, { toValue: 1, useNativeDriver: true }).start();
      },
      onPanResponderTerminate: () => {
        startDistance.current = null;
        Animated.spring(zoom, { toValue: 1, useNativeDriver: true }).start();
      },
    })
  ).current;

  // ----- Heart animations -----
  function popBigHeart() {
    bigHeart.setValue(0);
    Animated.sequence([
      Animated.spring(bigHeart, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(bigHeart, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }

  function bounceSmallHeart() {
    smallHeart.setValue(0.5);
    Animated.spring(smallHeart, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }

  function handleHeartButton() {
    if (!card.favorite) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      bounceSmallHeart();
    }
    toggleFavorite(cardId);
  }

  // ----- Double tap to favorite -----
  const lastTap = useRef(0);

  function handlePhotoTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // second tap came quickly -> it's a double tap
      popBigHeart();
      if (!card.favorite) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        bounceSmallHeart();
        toggleFavorite(cardId);
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  // ----- Delete with confirmation -----
  function handleDelete() {
    Alert.alert('Delete memory?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
          deleteCard(cardId);
        },
      },
    ]);
  }

  // ----- Header buttons: edit and delete -----
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => navigation.navigate('AddCard', { cardId })}
            hitSlop={10}
          >
            <Ionicons name="pencil" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={10}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, cardId, colors]);

  if (!card) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {card.photoUri ? (
        <View style={styles.photoWrap} {...pinchResponder.panHandlers}>
          <Pressable onPress={handlePhotoTap} style={styles.photoPressable}>
            <Animated.Image
              source={{ uri: card.photoUri }}
              style={[styles.photo, { transform: [{ scale: zoom }] }]}
            />
          </Pressable>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bigHeart,
              {
                opacity: bigHeart,
                transform: [
                  {
                    scale: bigHeart.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="heart" size={90} color="white" />
          </Animated.View>
        </View>
      ) : null}

      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.date}>{formatDisplay(card.date)}</Text>
        </View>
        <Pressable onPress={handleHeartButton} hitSlop={10}>
          <Animated.View style={{ transform: [{ scale: smallHeart }] }}>
            <Ionicons
              name={card.favorite ? 'heart' : 'heart-outline'}
              size={30}
              color={card.favorite ? colors.danger : colors.icon}
            />
          </Animated.View>
        </Pressable>
      </View>

      <Text style={styles.note}>{card.note || 'No note.'}</Text>

      {card.photoUri ? (
        <Text style={styles.hint}>Double tap the photo to favorite. Pinch to zoom.</Text>
      ) : null}
    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    headerButtons: { flexDirection: 'row', gap: 18 },
    photoWrap: {
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoPressable: { width: '100%' },
    photo: { width: '100%', height: 280 },
    bigHeart: { position: 'absolute' },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    titleText: { flex: 1 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    date: { color: colors.textMuted, marginTop: 4, marginBottom: 12 },
    note: { fontSize: 16, lineHeight: 23, color: colors.text, marginTop: 8 },
    hint: { fontSize: 12, color: colors.textMuted, marginTop: 24, textAlign: 'center' },
  });
} 