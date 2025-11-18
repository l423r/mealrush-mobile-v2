import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // TouchableOpacity removed (unused)
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BarcodeScanningResult } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert } from '../../hooks/useAlert';

type ScannerScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Scanner'
>;
type ScannerScreenRouteProp = RouteProp<MainStackParamList, 'Scanner'>;

const { width } = Dimensions.get('window');

const ScannerScreen: React.FC = observer(() => {
  const navigation = useNavigation<ScannerScreenNavigationProp>();
  const route = useRoute<ScannerScreenRouteProp>();
  const { productStore, uiStore } = useStores();
  const { alertState, showAlert, hideAlert } = useAlert();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    setIsProcessing(true);

    try {
      const products = await productStore.searchByBarcode(data);

      if (products.length > 0) {
        // Navigate to product selection or directly to meal element
        const product = products[0];
        navigation.navigate('MealElement', {
          item: product,
          date: route.params?.date,
          mealId: route.params?.mealId,
          fromSearch: true,
        });
      } else {
        showAlert(
          {
            title: 'Продукт не найден',
            message: 'Продукт с таким штрихкодом не найден в базе данных. Хотите создать новый продукт?',
            type: 'info',
            confirmText: 'Создать',
            cancelText: 'Отмена',
          },
          () => {
            navigation.navigate('Product', { barcode: data });
          },
          () => {
            setScanned(false);
          }
        );
      }
    } catch {
      uiStore.showSnackbar(
        'Не удалось найти продукт. Попробуйте еще раз',
        'error'
      );
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setScanned(false);
  };

  if (!permission) {
    return <Loading message="Запрос разрешений..." />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Header
          title="Сканер штрихкодов"
          showBackButton
          onBackPress={handleBack}
        />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={styles.permissionTitle}>Нет доступа к камере</Text>
          <Text style={styles.permissionSubtitle}>
            Для сканирования штрихкодов необходимо разрешение на использование
            камеры
          </Text>
          <Button
            title="Разрешить доступ"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Сканер штрихкодов"
        showBackButton
        onBackPress={handleBack}
      />

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'qr', 'code128'],
          }}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Наведите камеру на штрихкод продукта
          </Text>
        </View>

        {/* Processing Overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <Loading message="Поиск продукта..." />
          </View>
        )}

        {/* Controls */}
        {scanned && !isProcessing && (
          <View style={styles.controls}>
            <Button
              title="Сканировать еще"
              onPress={handleRetry}
              variant="outline"
              style={styles.controlButton}
            />
          </View>
        )}
      </View>

      {/* Alert Dialog */}
      <AlertDialog
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        onDismiss={hideAlert}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: colors.primary,
    top: 0,
    left: 0,
  },
  topRight: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    right: 0,
    left: 'auto',
  },
  bottomLeft: {
    borderTopWidth: 0,
    borderBottomWidth: 4,
    bottom: 0,
    top: 'auto',
  },
  bottomRight: {
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    right: 0,
    bottom: 0,
    left: 'auto',
    top: 'auto',
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  instructionsText: {
    ...typography.body1,
    color: colors.white,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    backgroundColor: colors.background.paper,
    minWidth: 200,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  permissionEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  permissionSubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    minWidth: 200,
  },
});

export default ScannerScreen;
