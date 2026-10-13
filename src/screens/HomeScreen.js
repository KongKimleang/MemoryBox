import { ScrollView, View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { toDateString } from '../utils/dates';
import { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';

const PROMPTS = [
  'What made you smile this week?',
  'Who did you spend time with recently?',
  'What is a small moment you want to remember?',
  'Where did you go that you loved?',
  'What did you learn today?',
  'What are you grateful for right now?',
  'What song or food reminds you of this season?',
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getTodayPrompt() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { boxes, cards, userName } = useData();

  const favoriteCount = cards.filter((c) => c.favorite).length;
  const pinnedBoxes = boxes.filter((b) => b.pinned);

  // "On this day": memories with the same month and day, from earlier years
  const today = toDateString(new Date());
  const onThisDay = cards.filter(
    (c) => c.date.slice(5) === today.slice(5) && c.date.slice(0, 4) !== today.slice(0, 4)
  );

  // Count them per box (we only show counts, never the card content)
  const onThisDayBoxes = [];
  onThisDay.forEach((card) => {
    const found = onThisDayBoxes.find((item) => item.boxId === card.boxId);
    if (found) {
      found.count += 1;
    } else {
      onThisDayBoxes.push({ boxId: card.boxId, count: 1 });
    }
  });

  function openBox(boxId) {
    navigation.navigate('BoxDetail', { boxId });
  }

  function handlePromptButton() {
    if (boxes.length === 0) {
      navigation.navigate('AddBox');
    } else {
      navigation.navigate('Boxes');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Greeting */}
      <Text style={styles.greeting}>
        {getGreeting()}
        {userName ? `, ${userName}` : ''}
      </Text>
      <Text style={styles.tagline}>
        Keep your memories safe, one box at a time.
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{boxes.length}</Text>
          <Text style={styles.statLabel}>Boxes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{cards.length}</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      {/* On this day */}
      {onThisDayBoxes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>On this day</Text>
          {onThisDayBoxes.map((item) => {
            const box = boxes.find((b) => b.id === item.boxId);
            if (!box) return null;
            return (
              <Pressable
                key={item.boxId}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => openBox(item.boxId)}
              >
                <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                <Text style={styles.cardText}>
                  {item.count} {item.count === 1 ? 'memory' : 'memories'} from
                  this day in past years {item.count === 1 ? 'is' : 'are'} waiting
                  in "{box.name}"
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Prompt of the day */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's prompt</Text>
        <View style={styles.card}>
          <View style={styles.promptContent}>
            <Text style={styles.promptText}>{getTodayPrompt()}</Text>
            <Pressable style={styles.smallButton} onPress={handlePromptButton}>
              <Text style={styles.smallButtonText}>
                {boxes.length === 0 ? 'Make a box first' : 'Choose a box to write in'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Pinned boxes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pinned boxes</Text>
        {pinnedBoxes.length === 0 ? (
          <Text style={styles.emptyText}>
            Long press a box in the Boxes tab to pin it here.
          </Text>
        ) : (
          <FlatList
            data={pinnedBoxes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.pinnedBox, pressed && styles.pressed]}
                onPress={() => openBox(item.id)}
              >
                <Ionicons name="pin" size={14} color={colors.boxText} />
                <Text style={styles.pinnedName} numberOfLines={2}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>

      {/* New box button */}
      <Pressable style={styles.newButton} onPress={() => navigation.navigate('AddBox')}>
        <Text style={styles.newButtonText}>+ New Box</Text>
      </Pressable>
    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingTop: 60, paddingBottom: 40, width: '100%', maxWidth: 700, alignSelf: 'center' },
    greeting: { fontSize: 26, fontWeight: '700', color: colors.text },
    tagline: { fontSize: 14, color: colors.textMuted, marginTop: 4 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    statBox: {
      width: '31%',
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
    },
    statNumber: { fontSize: 24, fontWeight: '700', color: colors.primary },
    statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

    section: { marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 14,
      marginBottom: 8,
    },
    pressed: { opacity: 0.7 },
    cardText: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.text, lineHeight: 20 },

    promptContent: { flex: 1 },
    promptText: { fontSize: 16, color: colors.text, marginBottom: 10 },
    smallButton: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    smallButtonText: { color: colors.primary, fontSize: 14 },

    emptyText: { color: colors.textMuted, fontSize: 14 },
    pinnedBox: {
      width: 120,
      minHeight: 80,
      backgroundColor: colors.boxFill,
      borderRadius: 8,
      padding: 10,
      marginRight: 10,
      justifyContent: 'space-between',
    },
    pinnedName: { fontSize: 15, fontWeight: '700', color: colors.boxText },

    newButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 28,
    },
    newButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  });
}