import { Platform } from 'react-native';
import { config } from '../constants/config';
import { getItemAsync } from '../utils/storage';
import api from './api';

import { 
    AudioModule, 
    RecordingPresets, 
    createAudioPlayer, 
    setAudioModeAsync, 
    requestRecordingPermissionsAsync,
    type AudioPlayer,
    type AudioRecorder,
    type AudioStatus
} from 'expo-audio';

class AudioService {
    private recorder: AudioRecorder | null = null;
    private player: AudioPlayer | null = null;
    private isRecording: boolean = false;
    private playingUri: string | null = null;
    private statusListeners: ((status: AudioStatus | null, uri: string | null) => void)[] = [];

    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await requestRecordingPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Microphone permission not granted');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting mic permissions:', error);
            return false;
        }
    }

    async startRecording(): Promise<boolean> {
        try {
            if (this.isRecording) return false;

            // Configure global audio mode for recording
            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
                interruptionMode: 'duckOthers',
            });

            // Create recorder using AudioModule.AudioRecorder class
            this.recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
            
            // Prepare and record
            await this.recorder.prepareToRecordAsync();
            this.recorder.record();
            
            this.isRecording = true;
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.isRecording = false;
            return false;
        }
    }

    async stopRecording(): Promise<string | null> {
        try {
            if (!this.recorder || !this.isRecording) return null;

            this.isRecording = false;
            await this.recorder.stop();
            const uri = this.recorder.uri;
            
            // Clean up recorder
            this.recorder = null;
            
            // Restore audio mode (disable recording)
            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            return uri;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.isRecording = false;
            return null;
        }
    }

    async cancelRecording(): Promise<void> {
        try {
            if (!this.recorder) return;

            this.isRecording = false;
            await this.recorder.stop();
            this.recorder = null;

            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });
        } catch (error) {
            console.error('Failed to cancel recording:', error);
        }
    }

    async transcribeAudio(uri: string): Promise<string> {
        try {
            console.log('Transcribing audio from:', uri);
            const formData = new FormData();
            
            // Fix for React Native / Expo FormData
            const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
            const filename = uri.split('/').pop() || 'recording.m4a';
            
            // @ts-ignore - FormData.append signature in RN
            formData.append('file', {
                uri: Platform.OS === 'ios' ? `file://${fileUri}` : fileUri,
                name: filename,
                type: 'audio/m4a',
            });

            const { data } = await api.post('chat/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Increase timeout for transcription
                timeout: 30000,
            });

            return data.text || '';
        } catch (error) {
            console.error('Audio transcription error:', error);
            throw error;
        }
    }

    /**
     * Subscribes to playback status updates.
     */
    subscribe(listener: (status: AudioStatus | null, uri: string | null) => void) {
        this.statusListeners.push(listener);
        // Initial notify if something is already playing
        if (this.player && this.player.isLoaded) {
            listener(this.player.currentStatus, this.playingUri);
        }
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(status: AudioStatus | null, uri: string | null) {
        this.statusListeners.forEach(listener => listener(status, uri));
    }

    async togglePlayback(uri: string): Promise<void> {
        try {
            // Toggle if same URI and player exists
            if (this.playingUri === uri && this.player) {
                if (this.player.playing) {
                    this.player.pause();
                } else {
                    this.player.play();
                }
                return;
            }

            // Stop current playback if any
            if (this.player) {
                this.player.remove();
                this.player = null;
            }

            this.playingUri = uri;
            this.player = createAudioPlayer(uri);
            
            this.player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
                if (status.didJustFinish) {
                    this.playingUri = null;
                    this.notifyListeners(null, null);
                } else {
                    this.notifyListeners(status, uri);
                }
            });

            this.player.play();
        } catch (error) {
            console.error('Failed to toggle playback:', error);
        }
    }

    /**
     * @deprecated Use togglePlayback instead
     */
    async playRecording(uri: string): Promise<void> {
        return this.togglePlayback(uri);
    }
}

export default new AudioService();

