import { useEffect, useRef, useMemo, } from 'react';
import { Animated, PanResponder, View, Text, Image, Pressable, Alert, StyleSheet, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDisplay } from '../utils/dates';
import {useTheme} from '../theme/ThemeContext';

const SWIPE_DISTANCE = 70; // how far to drag before it counts

export default function CardItem({ card, index, onOpen, onFavorite, onDelete }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const appear = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  // Keep the newest props in a ref, so the swipe always uses fresh data
  const latest = useRef({});
  latest.current = { card, onFavorite, onDelete };

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 350,
      delay: 500 + index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  function slideBack() {
    Animated.spring(translateX, {
      toValue: 0,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      // Only react to mostly-horizontal drags, so up/down scrolling still works
      onMoveShouldSetPanResponder: (e, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,

      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (e, g) => {
        translateX.setValue(Math.max(-140, Math.min(140, g.dx)));
      },

      onPanResponderRelease: (e, g) => {
        slideBack();
        if (g.dx > SWIPE_DISTANCE) {
          // swiped right -> favorite
          latest.current.onFavorite();
        } else if (g.dx < -SWIPE_DISTANCE) {
          // swiped left -> delete (ask first)
          Alert.alert(
            'Delete memory?',
            `"${latest.current.card.title}" will be removed.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: latest.current.onDelete,
              },
            ]
          );
        }
      },

      onPanResponderTerminate: slideBack,
    })
  ).current;

  return (
    <Animated.View
      style={{
        height: 88,
        opacity: appear,
        transform: [
          {
            translateY: appear.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <View style={styles.swipeContainer}>
        {/* Panels behind the card: fade in as you drag */}
        <Animated.View
          style={[
            styles.panel,
            styles.favoritePanel,
            {
              opacity: translateX.interpolate({
                inputRange: [0, 60],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Ionicons name="heart" size={26} color="white" />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            styles.deletePanel,
            {
              opacity: translateX.interpolate({
                inputRange: [-60, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Ionicons name="trash" size={26} color="white" />
        </Animated.View>

        {/* The card itself, which moves with your finger */}
        <Animated.View
          style={{ transform: [{ translateX }] }}
          {...panResponder.panHandlers}
        >
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={onOpen}
          >
            {card.photoUri ? (
              <Image source={{ uri: card.photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.noPhoto]}>
                <Ionicons name="image-outline" size={24} color={colors.icon} />
              </View>
            )}

            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>
                {card.title}
              </Text>
              <Text style={styles.date}>{formatDisplay(card.date)}</Text>
              {card.note ? (
                <Text style={styles.note} numberOfLines={1}>
                  {card.note}
                </Text>
              ) : null}
            </View>

            <Pressable onPress={onFavorite} hitSlop={10}>
              <Ionicons
                name={card.favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={card.favorite ? colors.danger : colors.icon}
              />
            </Pressable>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    swipeContainer: { marginBottom: 8, borderRadius: 8, overflow: 'hidden' },
    panel: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    favoritePanel: { backgroundColor: colors.favoritePanel, alignItems: 'flex-start' },
    deletePanel: { backgroundColor: colors.danger, alignItems: 'flex-end' },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 10,
    },
    pressed: { opacity: 0.7 },
    photo: { width: 60, height: 60, borderRadius: 6 },
    noPhoto: {
      backgroundColor: colors.placeholderBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1, marginHorizontal: 12 },
    title: { fontSize: 16, fontWeight: '700', color: colors.text },
    date: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    note: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  });
}