// hooks/useVideoCall.js
import { useRef, useState, useCallback, useEffect } from "react";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useVideoCall = (socket, currentUser) => {
  const [callStatus, setCallStatus] = useState("idle"); // idle | calling | ringing | in-call
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null);

  // NEW: streams live in state so effects can react to them
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const otherUserIdRef = useRef(null);
  const localStreamRef = useRef(null);

  // ADD near the other useState declarations
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // ADD these two functions, anywhere near endCall
  const toggleAudio = useCallback(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((prev) => !prev);
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff((prev) => !prev);
  }, [localStream]);

  const createPeerConnection = useCallback(
    (toUserId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:ice-candidate", {
            toUserId,
            candidate: event.candidate,
          });
        }
      };

      // Just store the stream — don't touch the DOM here directly
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          endCall();
        }
      };

      return pc;
    },
    [socket],
  );

  const getLocalStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localStreamRef.current = stream;   
  setLocalStream(stream);
  return stream;
};

  // NEW: attach local stream to <video> whenever either becomes available
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  // NEW: attach remote stream to <video> whenever either becomes available
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  const startCall = async (toUser, conversationId) => {
    otherUserIdRef.current = toUser._id;
    setRemoteUser(toUser);
    setCallStatus("calling");

    try {
      const pc = createPeerConnection(toUser._id);
      peerConnectionRef.current = pc;

      const stream = await getLocalStream();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:initiate", {
        toUserId: toUser._id,
        fromUser: { id: currentUser.id, username: currentUser.username },
        conversationId,
        offer,
      });
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("Could not start the call. Check your camera/microphone.");
      setCallStatus("idle");
      setRemoteUser(null);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    const { fromUser, offer } = incomingCall;
    otherUserIdRef.current = fromUser.id || fromUser._id;
    setRemoteUser(fromUser);

    try {
      const pc = createPeerConnection(fromUser.id);
      peerConnectionRef.current = pc;

      const stream = await getLocalStream();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { toUserId: fromUser.id, answer });
      setCallStatus("in-call"); // now the <video> tags mount, effects above attach the streams
      setIncomingCall(null);
    } catch (err) {
      console.error("Failed to accept call:", err);
      alert("Could not join the call. Check your camera/microphone.");
      setCallStatus("idle");
      setIncomingCall(null);
      setRemoteUser(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      const callerId = incomingCall.fromUser._id || incomingCall.fromUser.id
      socket.emit("call:reject", { toUserId: callerId });
    }
    setIncomingCall(null);
    setCallStatus("idle");
  };

  const endCall = useCallback(() => {
  if (otherUserIdRef.current) {
    socket.emit("call:end", { toUserId: otherUserIdRef.current });
  }
  peerConnectionRef.current?.close();
  peerConnectionRef.current = null;

  localStreamRef.current?.getTracks().forEach((t) => t.stop());
  localStreamRef.current = null;
  setLocalStream(null);
  setRemoteStream(null);

  setIsMuted(false);
  setIsVideoOff(false);

  otherUserIdRef.current = null;
  setRemoteUser(null);
  setCallStatus("idle");
}, [socket]); 

  useEffect(() => {
    if (!socket) return;

    socket.on("call:incoming", ({ fromUser, conversationId, offer }) => {
      setIncomingCall({ fromUser, conversationId, offer });
      setCallStatus("ringing");
    });

    socket.on("call:answer", async ({ answer }) => {
      await peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      setCallStatus("in-call");
    });

    socket.on("call:ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    socket.on("call:rejected", endCall);
    socket.on("call:ended", endCall);

    socket.on("call:peer-disconnected", ({ userId }) => {
      if (userId === otherUserIdRef.current) endCall();
    });

    socket.on("call:unavailable", () => {
      alert("User is offline");
      endCall();
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:answer");
      socket.off("call:ice-candidate");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:peer-disconnected");
      socket.off("call:unavailable");
    };
  }, [socket, endCall]);

  return {
    callStatus,
    incomingCall,
    remoteUser,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    isMuted,
    isVideoOff,
    toggleAudio,
    toggleVideo,
  };
};
