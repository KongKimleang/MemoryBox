import { useLayoutEffect } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';
import BoxContent from '../components/BoxContent';

export default function BoxDetailScreen({ route, navigation }) {
  const { boxId } = route.params;
  const { boxes } = useData();
  const { colors } = useTheme();
  const box = boxes.find((b) => b.id === boxId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: box ? box.name : 'Box',
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('AddCard', { boxId })}
          hitSlop={10}
        >
          <Ionicons name="add" size={28} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, box, colors]);

  if (!box) return null;

  return <BoxContent boxId={boxId} navigation={navigation} />;
}