import { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';
import BoxItem from '../components/BoxItem';
import BoxContent from '../components/BoxContent';

const WIDE_SCREEN = 700; // this wide or wider = tablet / landscape layout

export default function BoxesScreen({ navigation }) {
  const { boxes, cards, togglePinBox } = useData();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_SCREEN;

  const [selectedId, setSelectedId] = useState(null);

  const sortedBoxes = [...boxes].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });

  function countCards(boxId) {
    return cards.filter((card) => card.boxId === boxId).length;
  }

  function handleOpen(boxId) {
    if (isWide) {
      setSelectedId(boxId); // show it on the right
    } else {
      navigation.navigate('BoxDetail', { boxId }); // open a new screen
    }
  }

  return (
    <View
      style={[
        styles.container,
        isWide && styles.containerWide,
        { paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      {/* Left side: the list of boxes */}
      <View style={isWide ? styles.leftPane : styles.fullPane}>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBox')}
        >
          <Text style={styles.addButtonText}>+ New Box</Text>
        </Pressable>

        <FlatList
          key={isWide ? 'wide' : 'phone'} // a new key lets numColumns change
          data={sortedBoxes}
          keyExtractor={(item) => item.id}
          numColumns={isWide ? 1 : 2}
          columnWrapperStyle={isWide ? undefined : styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BoxItem
              box={item}
              count={countCards(item.id)}
              fullWidth={isWide}
              selected={isWide && item.id === selectedId}
              onOpen={() => handleOpen(item.id)}
              onPin={() => togglePinBox(item.id)}
              onEdit={() => navigation.navigate('AddBox', { boxId: item.id })}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No boxes yet. Tap "+ New Box" to make your first one.
            </Text>
          }
        />
        {boxes.length > 0 && (
          <Text style={styles.hint}>Long press a box to pin it</Text>
        )}
      </View>

      {/* Right side: the open box (tablet / landscape only) */}
      {isWide && (
        <View style={styles.rightPane}>
          {selectedId ? (
            <BoxContent
              key={selectedId} // a new key replays the lid animation
              boxId={selectedId}
              navigation={navigation}
              wide
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Select a box to open it</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    containerWide: { flexDirection: 'row' },
    fullPane: { flex: 1 },
    leftPane: {
      width: 320,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    rightPane: { flex: 1 },
    addButton: {
      backgroundColor: colors.primary,
      margin: 16,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    addButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
    list: { paddingHorizontal: 16, paddingBottom: 20 },
    row: { justifyContent: 'space-between' },
    empty: { textAlign: 'center', marginTop: 40, color: colors.textSecondary },
    hint: { textAlign: 'center', color: colors.textMuted, padding: 8, fontSize: 12 },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    placeholderText: { color: colors.textMuted, fontSize: 16 },
  });
}