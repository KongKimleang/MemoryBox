import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataContext = createContext();
const STORAGE_KEY = 'memorybox-data';

export function DataProvider({ children }) {
  const [boxes, setBoxes] = useState([]);
  const [cards, setCards] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [userName, setUserName] = useState('');

  // Load saved data when the app starts
  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setBoxes(data.boxes);
          setCards(data.cards);
          setUserName(data.userName || '');
        }
      } catch (error) {
        console.log('Could not load data', error);
      }
      setLoaded(true);
    }
    loadData();
  }, []);

  // Save every time boxes, cards, or user name change
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ boxes, cards, userName })
    ).catch((error) => console.log('Could not save data', error));
  }, [boxes, cards, userName, loaded]);

  // ----- Box functions -----
  function addBox(name, description) {
    const newBox = {
      id: Date.now().toString(),
      name: name,
      description: description,
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    setBoxes([...boxes, newBox]);
  }

  function togglePinBox(boxId) {
    setBoxes(
      boxes.map((box) =>
        box.id === boxId ? { ...box, pinned: !box.pinned } : box
      )
    );
  }

  function updateBox(boxId, name, description) {
    setBoxes(
      boxes.map((box) =>
        box.id === boxId ? { ...box, name: name, description: description } : box
      )
    );
  }

  // ----- Card functions -----
  function addCard(boxId, title, date, photoUri, note) {
    const newCard = {
      id: Date.now().toString(),
      boxId: boxId,
      title: title,
      date: date,
      photoUri: photoUri,
      note: note,
      favorite: false,
    };
    setCards([...cards, newCard]);
  }

  function updateCard(cardId, changes) {
    setCards(
      cards.map((card) => (card.id === cardId ? { ...card, ...changes } : card))
    );
  }

  function deleteCard(cardId) {
    setCards(cards.filter((card) => card.id !== cardId));
  }

  function toggleFavorite(cardId) {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, favorite: !card.favorite } : card
      )
    );
  }

  const value = {
    boxes,
    cards,
    loaded,
    userName,
    setUserName,
    addBox,
    updateBox,
    togglePinBox,
    addCard,
    updateCard,
    deleteCard,
    toggleFavorite,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// A shortcut so screens can write: const { boxes } = useData();
export function useData() {
  return useContext(DataContext);
}