// src/screens/ChatScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { loadUserProfile, UserProfile } from "../storage/userStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

type ChatMessage = {
  id: string;
  text: string;
  fromMe: boolean;
  createdAt: string;
};

const CHAT_MESSAGES_KEY = "chatMessages";

const ChatScreen: React.FC<Props> = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  // загружаем профиль и сохранённые сообщения
  useEffect(() => {
    const load = async () => {
      const storedProfile = await loadUserProfile();
      setProfile(storedProfile);

      const json = await AsyncStorage.getItem(CHAT_MESSAGES_KEY);
      if (json) {
        try {
          const parsed = JSON.parse(json) as ChatMessage[];
          setMessages(parsed);
        } catch {
          // если что-то сломано в JSON — просто игнорируем
        }
      }
    };

    load();
  }, []);

  const persistMessages = async (list: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(list));
    } catch {
      // не рушим UI, если сохранение не удалось
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      fromMe: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMessage];
      // сохраняем в AsyncStorage
      persistMessages(updated);
      return updated;
    });

    setInput("");
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.fromMe ? styles.messageFromMe : styles.messageFromOther,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const headerText = profile
    ? `Чат пользователя ${profile.name}`
    : "Чат (вы не авторизованы)";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{headerText}</Text>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesContainer}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Напишите сообщение..."
            placeholderTextColor="#9ca6b5"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#e9edf5",
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  messagesContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
  },
  messageFromMe: {
    alignSelf: "flex-end",
    backgroundColor: "#3390ec",
  },
  messageFromOther: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f2f7",
  },
  messageText: {
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d0d7e6",
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3390ec",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default ChatScreen;
