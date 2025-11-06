import { File } from 'expo-file-system';
import { Audio } from 'expo-av';

// Request microphone permission
export const requestAudioPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permission:', error);
    return false;
  }
};

// Audio recording options
const getRecordingOptions = () => {
  return Audio.RecordingOptionsPresets.HIGH_QUALITY;
};

// Start recording audio
export const startRecording = async (): Promise<Audio.Recording | null> => {
  try {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      return null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      getRecordingOptions()
    );

    return recording;
  } catch (error) {
    console.error('Error starting recording:', error);
    return null;
  }
};

// Stop recording audio
export const stopRecording = async (
  recording: Audio.Recording
): Promise<string | null> => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return null;
  }
};

// Get recording status
export const getRecordingStatus = async (
  recording: Audio.Recording
): Promise<Audio.RecordingStatus | null> => {
  try {
    const status = await recording.getStatusAsync();
    return status;
  } catch (error) {
    console.error('Error getting recording status:', error);
    return null;
  }
};

// Convert audio URI to base64 with data URI prefix
export const audioUriToBase64 = async (
  uri: string
): Promise<string | null> => {
  try {
    // Use new File class to read the file
    const file = new File(uri);
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert ArrayBuffer to base64
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Determine the mime type based on the file extension
    let mimeType = 'audio/mp3'; // default
    const extension = uri.split('.').pop()?.toLowerCase();
    
    if (extension === 'm4a') {
      mimeType = 'audio/m4a';
    } else if (extension === 'wav') {
      mimeType = 'audio/wav';
    } else if (extension === 'webm') {
      mimeType = 'audio/webm';
    }

    // Return with data URI prefix
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting audio to base64:', error);
    return null;
  }
};

// Validate audio file size (max 25MB as per API docs)
export const validateAudioSize = async (uri: string): Promise<boolean> => {
  try {
    const file = new File(uri);
    const fileInfo = await file.info();
    
    if (!fileInfo.exists || !fileInfo.size) {
      return false;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    return fileInfo.size <= maxSize;
  } catch (error) {
    console.error('Error validating audio size:', error);
    return false;
  }
};

// Format recording duration (milliseconds to mm:ss)
export const formatDuration = (durationMillis: number): string => {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

