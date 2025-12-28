// src/screens/ScanMedicineScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { getMedicineByAnyCode } from "../db/medicines";

type Props = NativeStackScreenProps<RootStackParamList, "ScanMedicine">;

const ScanMedicineScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const normalizePayload = (payload: string) => {
    const trimmed = payload.trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("med:")) {
      return trimmed.slice(4);
    }

    if (trimmed.toLowerCase().startsWith("https://medguide.app/medicine/")) {
      return trimmed.split("/").pop() ?? "";
    }

    return trimmed;
  };

  const handleBarCodeScanned = (result: any) => {
    if (scanned) return;

    setScanned(true);

    const raw = String(result?.data ?? "");
    const normalized = normalizePayload(raw);
    if (!normalized) {
      setMessage("Неверный формат QR-кода");
      return;
    }

    const med = getMedicineByAnyCode(normalized);
    if (!med) {
      setMessage(`Препарат с артикулом ${normalized} не найден`);
      return;
    }

    setMessage(`Найден препарат: ${med.name}`);

    setTimeout(() => {
      navigation.replace("MedicineDetails", { id: med.id });
    }, 800);
  };

  const handleScanAgain = () => {
    setScanned(false);
    setMessage(null);
  };

  const platformNote = Platform.select({
    ios: "На iOS запрос доступа к камере отображается системным диалогом.",
    android: "На Android разрешение на камеру запрашивается через системное окно.",
    default: "Доступ к камере запрашивается через системный диалог.",
  });

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Запрос доступа к камере...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Нет доступа к камере. Разрешите использование камеры в настройках устройства.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Разрешить камеру</Text>
        </TouchableOpacity>
        <Text style={styles.platformText}>{platformNote}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.mask}>
          <Text style={styles.maskText}>
            Наведите камеру на QR-код препарата
          </Text>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        {message && <Text style={styles.messageText}>{message}</Text>}

        {scanned && (
          <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
            <Text style={styles.buttonText}>Сканировать ещё раз</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.platformText}>{platformNote}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  scannerContainer: {
    flex: 3,
    overflow: "hidden",
  },
  mask: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
  },
  maskText: {
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontSize: 13,
  },
  bottomPanel: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
    justifyContent: "center",
    gap: 12,
  },
  messageText: {
    fontSize: 15,
    color: "#f9fafb",
  },
  button: {
    borderRadius: 999,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  platformText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  infoText: {
    marginTop: 8,
    fontSize: 13,
    color: "#e5e7eb",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#fecaca",
    textAlign: "center",
    marginBottom: 12,
  },
});

export default ScanMedicineScreen;
