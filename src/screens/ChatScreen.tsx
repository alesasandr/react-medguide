// src/screens/ChatScreen.tsx
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Keyboard,
  Animated,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { RootStackParamList } from "../navigation/AppNavigation";
import { loadUserProfile, UserProfile } from "../storage/userStorage";
import { medicines } from "../db/medicines";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

type ChatMessage = {
  id: string;
  text: string;
  fromMe: boolean;
  createdAt: string;
};

const CHAT_MESSAGES_KEY = "chatMessages";

const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || "";
const modelName = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free";

const systemInstruction = `Ты — экспертный ИИ-помощник для фармацевтов. 
У тебя есть доступ к базе данных препаратов аптеки (предоставлена ниже). 
Твоя задача: консультировать сотрудников, предлагать подходящие препараты из БАЗЫ ДАННЫХ на основе симптомов и описаний, находить аналоги и давать краткие проф. рекомендации.

ПРАВИЛА:
1. Предлагай ТОЛЬКО препараты из списка ниже, если это возможно.
2. Если ты рекомендуешь конкретный препарат из списка, ОБЯЗАТЕЛЬНО в конце сообщения добавь его ID в формате [ID: номер], например [ID: 3]. Если препаратов несколько, перечисли их через запятую: [ID: 3, 5].
3. Отвечай в формате Markdown (используй жирный шрифт для названий, списки для перечислений).
4. Будь лаконичен и профессионален.
5. Напоминай о необходимости консультации с врачом при серьезных симптомах.

БАЗА ДАННЫХ ПРЕПАРАТОВ (JSON):
${JSON.stringify(medicines.map(m => ({ id: m.id, name: m.name, mnn: m.mnn, form: m.form, dosage: m.dosage })), null, 2)}
`;

// Компонент для плавной анимации появления сообщения
const AnimatedMessage = ({ children, style }: { children: React.ReactNode; style: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  // Отслеживаем клавиатуру
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Авто-скролл вниз
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading, isKeyboardVisible]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const storedProfile = await loadUserProfile();
      if (isMounted) setProfile(storedProfile);
      const json = await AsyncStorage.getItem(CHAT_MESSAGES_KEY);
      if (json && isMounted) {
        try {
          const parsed = JSON.parse(json) as ChatMessage[];
          if (isMounted) setMessages(parsed);
        } catch { }
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleClearHistory} style={{ marginRight: 15 }}>
          <Text style={{ fontSize: 20 }}>🗑️</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, messages]);

  const persistMessages = async (list: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(list));
    } catch { }
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Очистить историю?",
      "Вы уверены, что хотите удалить все сообщения?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            setMessages([]);
            await AsyncStorage.removeItem(CHAT_MESSAGES_KEY);
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Тактильный отклик при отправке
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
      const apiMessages = [
        { role: "system", content: systemInstruction },
        ...messages.slice(-10).map((msg) => ({
          role: msg.fromMe ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: text },
      ];

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model: modelName, messages: apiMessages },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://medguide.com",
            "X-Title": "MedGuide App",
          },
          timeout: 45000,
        }
      );

      const aiResponseText = response.data?.choices?.[0]?.message?.content || "Не удалось получить ответ.";
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
      console.error("OpenRouter Error:", error?.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const time = new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Извлечение ID препаратов для карточек (поддерживает [ID: 1] и (ID: 1))
    let drugIds: number[] = [];
    const tagRegex = /(?:\[|\()ID:\s*([\d\s,]+)(?:\]|\))/gi;

    if (!item.fromMe) {
      const uniqueIds = new Set<number>();
      const matches = item.text.matchAll(tagRegex);
      for (const match of matches) {
        match[1].split(",").forEach((idStr) => {
          const id = parseInt(idStr.trim(), 10);
          if (!isNaN(id)) uniqueIds.add(id);
        });
      }
      drugIds = Array.from(uniqueIds);
    }

    // Очистка текста от любых тегов ID для отображения
    const displayMessage = item.text.replace(tagRegex, "").trim();

    return (
      <AnimatedMessage style={[styles.messageWrapper, item.fromMe ? styles.wrapperMe : styles.wrapperOther]}>
        {!item.fromMe ? (
          <View style={[styles.avatar, styles.avatarAI]}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        ) : (
          /* Спейсер для выравнивания, если аватар справа */
          <View style={styles.avatarSpacer} />
        )}

        <View style={[styles.messageGroup, item.fromMe ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
          <View style={[
            styles.messageBubble,
            item.fromMe ? styles.messageFromMe : styles.messageFromOther,
            { alignSelf: item.fromMe ? "flex-end" : "flex-start" }
          ]}>
            {item.fromMe ? (
              <LinearGradient
                colors={["#6366f1", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bubbleGradient}
              >
                <Text style={styles.messageTextMe}>{displayMessage}</Text>
                <Text style={styles.timestampMe}>{time}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.bubbleContent}>
                <Markdown style={markdownStyles}>{displayMessage}</Markdown>
                <Text style={styles.timestampOther}>{time}</Text>
              </View>
            )}
          </View>

          {/* Интерактивные карточки препаратов */}
          {drugIds.length > 0 && (
            <View style={styles.cardsContainer}>
              {drugIds.map((id, index) => {
                const med = medicines.find((m) => m.id === id);
                if (!med) return null;
                return (
                  <TouchableOpacity
                    key={`${id}-${index}`}
                    style={styles.drugCard}
                    onPress={() => {
                      Haptics.selectionAsync();
                      navigation.navigate("MedicineDetails", { id: med.id });
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.drugCardRow}>
                      <View style={styles.drugCardInfo}>
                        <Text style={styles.drugCardName} numberOfLines={2}>{med.name}</Text>
                        <Text style={styles.drugCardSub} numberOfLines={1}>
                          {med.mnn} • {med.dosage}
                        </Text>
                      </View>
                      <View style={styles.cardAction}>
                        <Text style={styles.cardActionIcon}>→</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {item.fromMe ? (
          <View style={[styles.avatar, styles.avatarMe]}>
            <Text style={styles.avatarText}>{profile?.name ? profile.name[0].toUpperCase() : "U"}</Text>
          </View>
        ) : (
          /* Спейсер для выравнивания, если аватар слева */
          <View style={styles.avatarSpacer} />
        )}
      </AnimatedMessage>
    );
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.messagesContainer, { paddingBottom: 20 }]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyLogo}>
                <Text style={styles.emptyIcon}>✦</Text>
              </View>
              <Text style={styles.emptyTitle}>МедГайд ИИ</Text>
              <Text style={styles.emptyText}>Чем я могу помочь вам сегодня?</Text>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#a855f7" />
                <Text style={styles.loadingText}>ИИ обдумывает ответ...</Text>
              </View>
            ) : null
          }
        />

        <View style={[
          styles.inputContainer,
          { paddingBottom: isKeyboardVisible ? 10 : Math.max(insets.bottom, 16) }
        ]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Спросите что-нибудь..."
              placeholderTextColor="#94a3b8"
              value={input}
              onChangeText={setInput}
              editable={!isLoading}
              multiline
            />
            <TouchableOpacity onPress={handleSend} disabled={!input.trim() || isLoading}>
              <LinearGradient
                colors={!input.trim() || isLoading ? ["#e5eaf2", "#e5eaf2"] : ["#6366f1", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <Text style={styles.sendButtonText}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f2f4f7" },
  messagesContainer: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 20 },
  messageWrapper: { flexDirection: "row", alignItems: "flex-start", marginVertical: 6 },
  wrapperMe: { justifyContent: "flex-end" },
  wrapperOther: { justifyContent: "flex-start" },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  avatarMe: { backgroundColor: "#6366f1", marginLeft: 8 },
  avatarAI: { backgroundColor: "#a855f7", marginRight: 8 },
  avatarText: { color: "#ffffff", fontSize: 9, fontWeight: "900" },
  avatarSpacer: { width: 36 }, // 28 (width) + 8 (margin)
  messageGroup: { flex: 1, maxWidth: "80%", gap: 6 },
  messageBubble: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  messageFromMe: {
    backgroundColor: "#6366f1",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden"
  },
  messageFromOther: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  bubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageTextMe: { color: "#ffffff", fontSize: 16, lineHeight: 22 },
  timestampMe: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 6, alignSelf: "flex-end" },
  timestampOther: { fontSize: 10, color: "#94a3b8", marginTop: 6, alignSelf: "flex-end" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 120, paddingHorizontal: 40 },
  emptyLogo: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", marginBottom: 24, shadowColor: "#a855f7", shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
  emptyIcon: { fontSize: 36, color: "#a855f7" },
  emptyTitle: { fontSize: 24, fontWeight: "900", color: "#1e293b", marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#64748b", textAlign: "center", lineHeight: 24 },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: "center",
    shadowColor: "#a855f7",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  loadingText: { fontSize: 12, color: "#7e22ce", marginLeft: 10, fontWeight: "600" },
  cardsContainer: { alignSelf: "stretch", gap: 8, marginTop: 4 },
  drugCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    width: "100%",
    minWidth: 240,
    borderWidth: 1,
    borderColor: "#e5eaf2",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  drugCardRow: { flexDirection: "row", alignItems: "center" },
  drugCardInfo: { flex: 1, marginRight: 12 },
  drugCardName: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  drugCardSub: { fontSize: 12, color: "#64748b", marginTop: 4 },
  cardAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center"
  },
  cardActionIcon: { fontSize: 18, color: "#a855f7", fontWeight: "700" },
  inputContainer: {
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  input: {
    flex: 1,
    maxHeight: 120,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 8
  },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  sendButtonText: { color: "#fff", fontSize: 22, fontWeight: "900" },
});

const markdownStyles: any = {
  body: {
    color: "#27303f",
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontWeight: "800",
    color: "#0f172a",
  },
  bullet_list: {
    marginVertical: 8,
  },
  list_item: {
    marginVertical: 6,
  },
  paragraph: {
    marginBottom: 10,
  },
  heading1: { fontSize: 24, fontWeight: "900", color: "#1e293b", marginVertical: 14 },
  heading2: { fontSize: 22, fontWeight: "900", color: "#1e293b", marginVertical: 12 },
  heading3: { fontSize: 20, fontWeight: "800", color: "#1e293b", marginVertical: 10 },
  heading4: { fontSize: 18, fontWeight: "800", color: "#1e293b", marginVertical: 8 },
};

export default ChatScreen;
