import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  FlatList,
  SectionList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';
import CardItem from './CardItem';
import { formatDisplay } from '../utils/dates';

// wide = true when shown in the split view (adds a title and an add button)
export default function BoxContent({ boxId, navigation, wide = false }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { boxes, cards, toggleFavorite, deleteCard } = useData();
  const box = boxes.find((b) => b.id === boxId);

  const [mode, setMode] = useState('list'); // 'list' or 'date'
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // ----- Lid animation -----
  const lid = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(lid, {
      toValue: 1,
      duration: 500,
      delay: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!box) return null;

  // ----- Prepare the cards -----
  let boxCards = cards.filter((c) => c.boxId === boxId);
  if (onlyFavorites) {
    boxCards = boxCards.filter((c) => c.favorite);
  }
  boxCards.sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

  const sections = [];
  boxCards.forEach((card) => {
    const last = sections[sections.length - 1];
    if (last && last.date === card.date) {
      last.data.push(card);
    } else {
      sections.push({ date: card.date, data: [card] });
    }
  });

  function renderCard({ item, index }) {
    return (
      <CardItem
        card={item}
        index={index}
        onOpen={() => navigation.navigate('CardDetail', { cardId: item.id })}
        onFavorite={() => toggleFavorite(item.id)}
        onDelete={() => deleteCard(item.id)}
      />
    );
  }

  const emptyText = onlyFavorites
    ? 'No favorite memories in this box yet.'
    : 'This box is empty. Add your first memory.';

  return (
    <View style={styles.container}>
      {/* Title and add button (split view only, because the phone uses the header) */}
      {wide && (
        <View style={styles.titleRow}>
          <Text style={styles.boxTitle} numberOfLines={1}>
            {box.name}
          </Text>
          <Pressable
            style={styles.addButton}
            onPress={() => navigation.navigate('AddCard', { boxId })}
          >
            <Text style={styles.addButtonText}>+ Add memory</Text>
          </Pressable>
        </View>
      )}

      {/* The box with its lid */}
      <View style={styles.boxArea}>
        <Animated.View
          style={[
            styles.lid,
            {
              transform: [
                {
                  translateY: lid.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -12], // the lid moves up or down
                  }),
                },
                {
                  rotate: lid.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-4deg'], // tilt the lid
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.boxBody}>
          <Text style={styles.boxDesc} numberOfLines={2}>
            {box.description || 'No description'}
          </Text>
        </View>
      </View>

      {/* Switches */}
      <View style={styles.controls}>
        <View style={styles.segment}>
          <Pressable
            style={[styles.segBtn, mode === 'list' && styles.segActive]}
            onPress={() => setMode('list')}
          >
            <Text style={mode === 'list' ? styles.segTextActive : styles.segText}>
              By list
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segBtn, mode === 'date' && styles.segActive]}
            onPress={() => setMode('date')}
          >
            <Text style={mode === 'date' ? styles.segTextActive : styles.segText}>
              By date
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => setOnlyFavorites(!onlyFavorites)} hitSlop={10}>
          <Ionicons
            name={onlyFavorites ? 'heart' : 'heart-outline'}
            size={26}
            color={onlyFavorites ? colors.danger : colors.icon}
          />
        </Pressable>
      </View>

      {/* The cards */}
      {mode === 'list' ? (
        <FlatList
          data={boxCards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{formatDisplay(section.date)}</Text>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
        />
      )}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    boxTitle: {
      flex: 1,
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginRight: 12,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    addButtonText: { color: colors.onPrimary, fontWeight: '600' },
    boxArea: { height: 110, marginHorizontal: 16, marginTop: 30 },
    lid: {
      position: 'absolute',
      top: 0,
      left: -6,
      right: -6,
      height: 26,
      backgroundColor: colors.lid,
      borderRadius: 6,
      zIndex: 2,
    },
    boxBody: {
      position: 'absolute',
      top: 20,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.boxFill,
      borderRadius: 8,
      padding: 12,
      justifyContent: 'center',
    },
    boxDesc: {
      backgroundColor: colors.boxLabel,
      borderRadius: 4,
      padding: 8,
      color: colors.textSecondary,
      fontSize: 13,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.segmentBg,
      borderRadius: 8,
    },
    segBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
    segActive: { backgroundColor: colors.primary },
    segText: { color: colors.textSecondary },
    segTextActive: { color: colors.onPrimary, fontWeight: '600' },
    list: { paddingHorizontal: 16, paddingBottom: 30 },
    sectionHeader: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 8,
      marginBottom: 6,
    },
    empty: { textAlign: 'center', marginTop: 30, color: colors.textSecondary },
  });
}