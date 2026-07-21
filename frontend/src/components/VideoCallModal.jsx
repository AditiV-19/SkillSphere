// components/VideoCallModal.jsx
import {
  FaPhoneSlash,
  FaPhone,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

export default function VideoCallModal({
  callStatus,
  incomingCall,
  remoteUser,
  localVideoRef,
  remoteVideoRef,
  acceptCall,
  rejectCall,
  endCall,
  isMuted,
  isVideoOff,
  toggleAudio,
  toggleVideo,
}) {
  if (callStatus === "idle") return null;

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center">
      {callStatus === "ringing" && incomingCall && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm w-full mx-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 border border-blue-200">
            {incomingCall.fromUser?.username?.charAt(0) || "U"}
          </div>
          <p className="mb-6 font-bold text-slate-800">
            {incomingCall.fromUser?.username || "Someone"} is calling…
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={acceptCall}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <FaPhone size={14} /> Accept
            </button>
            <button
              onClick={rejectCall}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <FaPhoneSlash size={14} /> Decline
            </button>
          </div>
        </div>
      )}

      {(callStatus === "calling" || callStatus === "in-call") && (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-slate-900"
          />

          {/* Local preview — dim it when camera is off so it's clear nothing's broken */}
          <div className="absolute bottom-6 right-6 w-40 h-28 rounded-xl border-2 border-white shadow-lg overflow-hidden bg-slate-800">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity ${isVideoOff ? "opacity-0" : "opacity-100"}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                Camera off
              </div>
            )}
          </div>

          {callStatus === "calling" && (
            <p className="absolute top-8 text-white font-medium bg-black/40 px-4 py-2 rounded-full">
              Calling {remoteUser?.username}…
            </p>
          )}

          {/* Call controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={toggleAudio}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
              className={`p-3.5 rounded-full shadow-lg transition-colors ${
                isMuted
                  ? "bg-white text-slate-800"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {isMuted ? (
                <FaMicrophoneSlash size={16} />
              ) : (
                <FaMicrophone size={16} />
              )}
            </button>

            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3.5 rounded-full flex items-center gap-2 shadow-lg transition-colors"
            >
              <FaPhoneSlash size={16} /> End Call
            </button>

            <button
              onClick={toggleVideo}
              title={isVideoOff ? "Turn camera on" : "Turn camera off"}
              className={`p-3.5 rounded-full shadow-lg transition-colors ${
                isVideoOff
                  ? "bg-white text-slate-800"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {isVideoOff ? <FaVideoSlash size={16} /> : <FaVideo size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
