/**
 * ====================================
 * WEBRTC SERVICE — Audio + Video Calling
 * ====================================
 * Manages peer-to-peer audio/video connections using a mesh topology.
 * Each user in the room has a direct RTCPeerConnection to every other user.
 *
 * Flow:
 *   1. User joins room → gets participant list
 *   2. For each existing participant → create offer (caller role)
 *   3. New user joins → they send offer to us → we answer (callee role)
 *   4. ICE candidates are exchanged peer-to-peer via socket signaling
 */

import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

import {
  sendWebRTCOffer,
  sendWebRTCAnswer,
  sendWebRTCIceCandidate,
  onWebRTCOfferReceived,
  onWebRTCAnswerReceived,
  onWebRTCIceCandidateReceived,
  getSocket,
  requestMicPermission,
  requestCamPermission,
} from './socket.service';

import InCallManager from 'react-native-incall-manager';

// ─── Config ──────────────────────────────────────────────────────────────────

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

/** Map of userId → RTCPeerConnection */
const peerConnections = new Map<string, RTCPeerConnection>();

/** Map of userId → remote MediaStream (their audio/video) */
const remoteStreams = new Map<string, MediaStream>();

/** Buffered ICE candidates that arrived before remote description was set */
const pendingCandidates = new Map<string, RTCIceCandidate[]>();

/** Our local audio+video stream */
let localStream: MediaStream | null = null;

/** Current room ID */
let currentRoomId: string | null = null;

/** Whether mic is muted (track disabled but stream alive) */
let isMicMuted = false;

/** Whether camera is enabled */
let isCameraEnabled = false;

/** Callback to notify UI of remote stream changes */
let onRemoteStreamUpdate: ((streams: Map<string, MediaStream>) => void) | null = null;

/** Callback to notify UI when a peer disconnects */
let onPeerDisconnected: ((userId: string) => void) | null = null;

/** Callback to notify UI when local stream changes (camera on/off) */
let onLocalStreamUpdate: ((stream: MediaStream | null) => void) | null = null;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Initialize WebRTC for a room — captures local audio+video and sets up signaling listeners.
 */
export async function initWebRTC(
  roomId: string,
  callbacks?: {
    onRemoteStream?: (streams: Map<string, MediaStream>) => void;
    onPeerDisconnect?: (userId: string) => void;
    onLocalStream?: (stream: MediaStream | null) => void;
  }
): Promise<MediaStream | null> {
  console.log('🎙️ [WebRTC] Initializing for room:', roomId);
  currentRoomId = roomId;

  if (callbacks?.onRemoteStream) {
    onRemoteStreamUpdate = callbacks.onRemoteStream;
  }
  if (callbacks?.onPeerDisconnect) {
    onPeerDisconnected = callbacks.onPeerDisconnect;
  }
  if (callbacks?.onLocalStream) {
    onLocalStreamUpdate = callbacks.onLocalStream;
  }

  // Request mic permission before accessing media
  const hasMicPermission = await requestMicPermission();
  if (!hasMicPermission) {
    console.error('❌ [WebRTC] Failed to get local audio: Permission denied by user.');
    return null;
  }

  // Capture local audio only — camera starts OFF, user enables it manually
  try {
    localStream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    }) as MediaStream;
    isCameraEnabled = false;
    console.log('✅ [WebRTC] Local audio stream acquired (camera OFF by default)');
  } catch (err: any) {
    console.error('❌ [WebRTC] Failed to get local audio:', err.message);
    return null;
  }

  // Register socket signaling listeners
  setupSignalingListeners();

  // Start InCallManager to route audio to the speaker instead of the earpiece
  InCallManager.start({ media: 'audio' });
  InCallManager.setForceSpeakerphoneOn(true);

  return localStream;
}

/**
 * Create peer connections to all existing participants in the room.
 * Call this after receiving the room-participants-list event.
 */
export async function connectToParticipants(
  participants: { userId: string; socketId: string }[],
  myUserId: string
): Promise<void> {
  for (const p of participants) {
    if (p.userId === myUserId) continue; // skip self
    if (peerConnections.has(p.userId)) continue; // already connected

    if (myUserId > p.userId) {
      console.log('📞 [WebRTC] Creating offer for participant:', p.userId);
      await createPeerConnection(p.userId, true); // true = we are the caller
    } else {
      console.log('📞 [WebRTC] Waiting for offer from participant:', p.userId);
    }
  }
}

/**
 * Handle a new user joining — create a peer connection and send an offer.
 */
export async function handleNewParticipant(userId: string, myUserId: string): Promise<void> {
  if (peerConnections.has(userId)) return;
  
  if (myUserId > userId) {
    console.log('📞 [WebRTC] New participant joined, creating offer:', userId);
    await createPeerConnection(userId, true);
  } else {
    console.log('📞 [WebRTC] New participant joined, waiting for offer:', userId);
  }
}

/**
 * Mute/unmute the local mic without destroying the stream.
 */
export function setMicEnabled(enabled: boolean): void {
  if (!localStream) return;
  const audioTracks = localStream.getAudioTracks();
  audioTracks.forEach((track: any) => {
    track.enabled = enabled;
  });
  isMicMuted = !enabled;
  console.log(`🎤 [WebRTC] Mic ${enabled ? 'enabled' : 'muted'}`);
}

/**
 * Check if mic is currently enabled.
 */
export function isMicEnabled(): boolean {
  return !isMicMuted;
}

/**
 * Enable/disable the local camera track.
 * When enabling, adds video track to existing peer connections and triggers renegotiation.
 * When disabling, removes video track from peer connections.
 */
export async function setCameraEnabled(enabled: boolean): Promise<boolean> {
  if (!localStream) return false;

  const videoTracks = localStream.getVideoTracks();

  if (enabled && videoTracks.length === 0) {
    // Request camera permission before accessing media
    const hasCamPermission = await requestCamPermission();
    if (!hasCamPermission) {
      console.warn('📷 [WebRTC] Camera toggle failed (permission denied)');
      return false;
    }

    // Camera was off, need to acquire a new video track
    try {
      const camStream = await mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      }) as MediaStream;
      const camTrack = camStream.getVideoTracks()[0];
      if (camTrack) {
        localStream.addTrack(camTrack);
        isCameraEnabled = true;

        // Add the new video track to all existing peer connections
        const peerEntries = Array.from(peerConnections.entries());
        for (const [userId, pc] of peerEntries) {
          try {
            pc.addTrack(camTrack, localStream);
            // Renegotiate: create new offer to include the video track
            await renegotiatePeer(userId, pc);
          } catch (err) {
            console.warn(`⚠️ [WebRTC] Failed to add video track to peer ${userId}:`, err);
          }
        }

        // Notify UI
        if (onLocalStreamUpdate) {
          onLocalStreamUpdate(localStream);
        }

        console.log('📷 [WebRTC] Camera enabled, added to', peerConnections.size, 'peers');
        return true;
      }
    } catch (err) {
      console.warn('📷 [WebRTC] Could not get camera:', err);
      return false;
    }
  }

  // Toggle existing video tracks
  videoTracks.forEach((track: any) => {
    track.enabled = enabled;
  });
  isCameraEnabled = enabled;

  // If disabling, remove video tracks from peer connections
  if (!enabled) {
    const peerEntries = Array.from(peerConnections.entries());
    for (const [userId, pc] of peerEntries) {
      try {
        const senders = (pc as any).getSenders?.() || [];
        for (const sender of senders) {
          if (sender.track && sender.track.kind === 'video') {
            pc.removeTrack(sender);
            // Renegotiate to tell the remote peer video is gone
            await renegotiatePeer(userId, pc);
          }
        }
      } catch (err) {
        console.warn(`⚠️ [WebRTC] Failed to remove video from peer ${userId}:`, err);
      }
    }
  }

  // Notify UI
  if (onLocalStreamUpdate) {
    onLocalStreamUpdate(localStream);
  }

  console.log(`📷 [WebRTC] Camera ${enabled ? 'enabled' : 'disabled'}`);
  return true;
}

/**
 * Check if camera is currently enabled.
 */
export function isCameraEnabledStatus(): boolean {
  return isCameraEnabled;
}

/**
 * Get the local audio+video stream.
 */
export function getLocalStream(): MediaStream | null {
  return localStream;
}

/**
 * Get all remote streams.
 */
export function getRemoteStreams(): Map<string, MediaStream> {
  return new Map(remoteStreams);
}

/**
 * Remove a specific peer connection (e.g., when a user leaves).
 */
export function removePeer(userId: string): void {
  const pc = peerConnections.get(userId);
  if (pc) {
    pc.close();
    peerConnections.delete(userId);
    console.log(`🔌 [WebRTC] Peer connection closed for: ${userId}`);
  }
  remoteStreams.delete(userId);
  pendingCandidates.delete(userId);

  if (onPeerDisconnected) {
    onPeerDisconnected(userId);
  }
  if (onRemoteStreamUpdate) {
    onRemoteStreamUpdate(new Map(remoteStreams));
  }
}

/**
 * Tear down everything — call when leaving the room.
 */
export function cleanupWebRTC(): void {
  console.log('🧹 [WebRTC] Cleaning up all connections');

  // Close all peer connections
  peerConnections.forEach((pc, userId) => {
    pc.close();
    console.log(`🔌 [WebRTC] Closed peer: ${userId}`);
  });
  peerConnections.clear();
  remoteStreams.clear();
  pendingCandidates.clear();

  // Stop local tracks
  if (localStream) {
    localStream.getTracks().forEach((track: any) => track.stop());
    localStream = null;
    console.log('🔇 [WebRTC] Local stream stopped');
  }

  // Remove socket listeners
  removeSignalingListeners();

  currentRoomId = null;
  isMicMuted = false;
  isCameraEnabled = false;
  onRemoteStreamUpdate = null;
  onPeerDisconnected = null;
  onLocalStreamUpdate = null;

  // Stop InCallManager
  InCallManager.stop();
}

// ─── Internal: Peer Connection Management ────────────────────────────────────

async function createPeerConnection(
  remoteUserId: string,
  isCaller: boolean
): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  peerConnections.set(remoteUserId, pc);
  pendingCandidates.set(remoteUserId, []);

  // Add local audio+video tracks to the connection
  if (localStream) {
    localStream.getTracks().forEach((track: any) => {
      pc.addTrack(track, localStream!);
    });
  }

  // Handle incoming remote audio/video tracks
  (pc as any).ontrack = (event: any) => {
    console.log('🔊 [WebRTC] Remote track received from:', remoteUserId, 'kind:', event.track?.kind);
    if (event.streams && event.streams[0]) {
      remoteStreams.set(remoteUserId, event.streams[0]);
      if (onRemoteStreamUpdate) {
        onRemoteStreamUpdate(new Map(remoteStreams));
      }
    }
  };

  // Handle ICE candidates — send to remote peer via signaling
  (pc as any).onicecandidate = (event: any) => {
    if (event.candidate && currentRoomId) {
      sendWebRTCIceCandidate(currentRoomId, remoteUserId, event.candidate.toJSON());
    }
  };

  // Handle connection state changes
  (pc as any).onconnectionstatechange = () => {
    const state = pc.connectionState;
    console.log(`📶 [WebRTC] Connection state for ${remoteUserId}: ${state}`);

    if (state === 'failed' || state === 'disconnected' || state === 'closed') {
      removePeer(remoteUserId);
    }
  };

  (pc as any).oniceconnectionstatechange = () => {
    console.log(`🧊 [WebRTC] ICE state for ${remoteUserId}: ${(pc as any).iceConnectionState}`);
  };

  // If we are the caller, create and send an offer
  if (isCaller) {
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      } as any);
      await pc.setLocalDescription(offer);

      if (currentRoomId) {
        sendWebRTCOffer(currentRoomId, remoteUserId, offer);
        console.log('📤 [WebRTC] Offer sent to:', remoteUserId);
      }
    } catch (err: any) {
      console.error('❌ [WebRTC] Failed to create offer:', err.message);
    }
  }

  return pc;
}

/**
 * Renegotiate an existing peer connection after adding/removing tracks.
 * Creates a new offer and sends it to the remote peer.
 */
async function renegotiatePeer(remoteUserId: string, pc: RTCPeerConnection): Promise<void> {
  try {
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    } as any);
    await pc.setLocalDescription(offer);

    if (currentRoomId) {
      sendWebRTCOffer(currentRoomId, remoteUserId, offer);
      console.log('📤 [WebRTC] Renegotiation offer sent to:', remoteUserId);
    }
  } catch (err: any) {
    console.error('❌ [WebRTC] Failed to renegotiate with:', remoteUserId, err.message);
  }
}

// ─── Internal: Signaling Handlers ────────────────────────────────────────────

function setupSignalingListeners(): void {
  // When we receive an offer from another user
  onWebRTCOfferReceived(async (payload) => {
    const { fromUserId, roomId, offer } = payload;
    console.log('📥 [WebRTC] Offer received from:', fromUserId);

    let pc = peerConnections.get(fromUserId);
    if (!pc) {
      pc = await createPeerConnection(fromUserId, false); // false = we are callee
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush any buffered ICE candidates
      const buffered = pendingCandidates.get(fromUserId) || [];
      for (const candidate of buffered) {
        await pc.addIceCandidate(candidate);
      }
      pendingCandidates.set(fromUserId, []);

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (currentRoomId) {
        sendWebRTCAnswer(currentRoomId, fromUserId, answer);
        console.log('📤 [WebRTC] Answer sent to:', fromUserId);
      }
    } catch (err: any) {
      console.error('❌ [WebRTC] Failed to handle offer:', err.message);
    }
  });

  // When we receive an answer to our offer
  onWebRTCAnswerReceived(async (payload) => {
    const { fromUserId, answer } = payload;
    console.log('📥 [WebRTC] Answer received from:', fromUserId);

    const pc = peerConnections.get(fromUserId);
    if (!pc) {
      console.warn('⚠️ [WebRTC] No peer connection for answer from:', fromUserId);
      return;
    }

    try {
      if (pc.signalingState === 'stable') {
        console.log('⚠️ [WebRTC] Ignoring answer, connection already stable with:', fromUserId);
        return;
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // Flush any buffered ICE candidates
      const buffered = pendingCandidates.get(fromUserId) || [];
      for (const candidate of buffered) {
        await pc.addIceCandidate(candidate);
      }
      pendingCandidates.set(fromUserId, []);

      console.log('✅ [WebRTC] Connection established with:', fromUserId);
    } catch (err: any) {
      console.error('❌ [WebRTC] Failed to handle answer:', err.message);
    }
  });

  // When we receive an ICE candidate from a peer
  onWebRTCIceCandidateReceived(async (payload) => {
    const { fromUserId, candidate } = payload;

    const pc = peerConnections.get(fromUserId);
    if (!pc) {
      // Buffer the candidate — the peer connection hasn't been created yet
      const buffer = pendingCandidates.get(fromUserId) || [];
      buffer.push(new RTCIceCandidate(candidate));
      pendingCandidates.set(fromUserId, buffer);
      return;
    }

    // If remote description isn't set yet, buffer the candidate
    if (!pc.remoteDescription) {
      const buffer = pendingCandidates.get(fromUserId) || [];
      buffer.push(new RTCIceCandidate(candidate));
      pendingCandidates.set(fromUserId, buffer);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err: any) {
      console.error('❌ [WebRTC] Failed to add ICE candidate:', err.message);
    }
  });
}

function removeSignalingListeners(): void {
  const s = getSocket();
  s.off('webrtc-offer-received');
  s.off('webrtc-answer-received');
  s.off('webrtc-ice-candidate-received');
}
