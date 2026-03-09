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
import axios from "axios";
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

// Initialize OpenRouter API Key
const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || "";

const systemInstruction = `Ты — экспертный ИИ-помощник, созданный для консультации фармацевтов и аптечных работников.
Твоя главная задача — помогать сотрудникам аптек правильно выдавать препараты пациентам, предлагать подходящие аналоги в случае отсутствия препарата, и давать общие краткие и безопасные медицинские рекомендации в рамках компетенции фармацевта.
Отвечай профессионально, вежливо и лаконично. Всегда напоминай, что при серьезных симптомах пациенту следует обратиться к врачу.`;

const ChatScreen: React.FC<Props> = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // загружаем профиль и сохранённые сообщения
  useEffect(() => {
    let isMounted = true; // Флаг для отслеживания mount state

    const load = async () => {
      const storedProfile = await loadUserProfile();
      if (isMounted) setProfile(storedProfile); // Проверка перед setState

      const json = await AsyncStorage.getItem(CHAT_MESSAGES_KEY);
      if (json && isMounted) {
        // ✅ Проверка перед setState
        try {
          const parsed = JSON.parse(json) as ChatMessage[];
          if (isMounted) setMessages(parsed);
        } catch {
          // если что-то сломано в JSON — просто игнорируем
        }
      }
    };

    load();

    // Cleanup функция для предотвращения утечки памяти
    return () => {
      isMounted = false;
    };
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
    if (!text || isLoading) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      fromMe: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMessage];
      persistMessages(updated);
      return updated;
    });

    setInput("");
    setIsLoading(true);

    try {
      // Подготовка контекста сообщений для OpenRouter API
      const apiMessages = [
        { role: "system", content: systemInstruction },
        ...messages.slice(-10).map((msg) => ({ // берем последние 10 сообщений для контекста
          role: msg.fromMe ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: text },
      ];

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-chat", // Используем deepseek-v3 через OpenRouter
          messages: apiMessages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://medguide.com", // Важно для OpenRouter
            "X-Title": "MedGuide App", // Важно для OpenRouter
          },
          timeout: 45000,
        }
      );

      const aiResponseText =
        response.data?.choices?.[0]?.message?.content || "Не удалось получить ответ от ИИ.";

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        fromMe: false,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        persistMessages(updated);
        return updated;
      });
    } catch (error: any) {
      console.error("OpenRouter API Error:", error?.response?.data || error.message);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Извините, произошла ошибка: ${error?.response?.data?.error?.message || error.message || "Неизвестная ошибка"}.\nПроверьте API ключ и подключение к сети.`,
        fromMe: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => {
        const updated = [...prev, errorMessage];
        persistMessages(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.fromMe ? styles.messageFromMe : styles.messageFromOther,
      ]}
    >
      <Text style={item.fromMe ? styles.messageTextMe : styles.messageTextOther}>
        {item.text}
      </Text>
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
            placeholder="Напишите сообщение ИИ..."
            placeholderTextColor="#9ca6b5"
            value={input}
            onChangeText={setInput}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Text style={styles.sendButtonText}>{isLoading ? "..." : "↑"}</Text>
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
  messageTextMe: {
    color: "#ffffff",
  },
  messageTextOther: {
    color: "#333333",
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
  sendButtonDisabled: {
    backgroundColor: "#9ca6b5",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default ChatScreen;
