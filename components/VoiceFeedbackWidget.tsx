"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CallStatus = "idle" | "connecting" | "in-call" | "ended" | "error";
type SpeakerState = "idle" | "agent" | "user";

interface VapiInstance {
  start: (assistantId: string, assistantOverrides?: Record<string, unknown>) => Promise<unknown>;
  stop: () => Promise<void>;
  on: (event: string, callback: (...args: never[]) => void) => void;
  removeAllListeners?: () => void;
  getDailyCallObject?: () => DailyCallObject | null;
}

interface DailyCallObject {
  updateInputSettings?: (settings: {
    audio?: { processor?: { type?: string } };
  }) => Promise<unknown>;
}

type VapiConstructor = new (
  publicKey: string,
  apiBaseUrl?: string,
  config?: { alwaysIncludeMicInPermissionPrompt: boolean },
) => VapiInstance;

const INITIAL_GREETING =
  "Hey, I am Notyc voice agent. I will listen to your idea. Can you share your idea so I can give better suggestions or feedback?";

// Web call setup (Vapi API + Daily join + assistant "listening") routinely exceeds 5s.
const CONNECTION_TIMEOUT_MS = 45_000;
const LISTENING_TIMEOUT_MS = 20_000;

type VapiModule = { default: VapiConstructor };

let vapiModulePromise: Promise<VapiModule> | null = null;
function getVapiModule(): Promise<VapiModule> {
  vapiModulePromise ??= import("@vapi-ai/web")
    .then((mod) => mod as unknown as VapiModule)
    .catch((error) => {
      vapiModulePromise = null;
      throw error;
    });
  return vapiModulePromise;
}

function isVoiceInfrastructureError(message: string): boolean {
  return /meeting|voice|vapi|daily|join|does not exist|webrtc|peer/i.test(message);
}

function extractErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    if (record.error && typeof record.error === "object") {
      const nested = record.error as Record<string, unknown>;
      if (typeof nested.message === "string") return nested.message;
    }
    if (typeof record.message === "string") return record.message;
  }
  return String(error);
}

function installKrispBypass(instance: VapiInstance): boolean {
  const call = instance.getDailyCallObject?.();
  const originalUpdateInputSettings = call?.updateInputSettings;
  if (!call || !originalUpdateInputSettings) return false;

  call.updateInputSettings = (settings) => {
    const processorType = settings.audio?.processor?.type;
    if (processorType === "noise-cancellation" || processorType === "none") {
      return Promise.resolve();
    }
    try {
      return originalUpdateInputSettings.call(call, settings);
    } catch {
      return Promise.resolve();
    }
  };
  return true;
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // Track may already be stopped when the device is unplugged or a call ends.
    }
  });
}

async function safelyStopVapi(instance: VapiInstance) {
  try {
    await instance.stop();
  } catch {
    // Remote ejection and repeated cleanup can both leave no call object to destroy.
  } finally {
    instance.removeAllListeners?.();
  }
}

function getAudioSupportError(): string | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "Voice review is only available in a supported browser.";
  }
  if (!window.isSecureContext && window.location.hostname !== "localhost") {
    return "Voice review requires a secure (HTTPS) connection.";
  }
  if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
    return "This browser does not support microphone-based voice review.";
  }
  if (!(window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)) {
    return "This browser does not support the audio features required for voice review.";
  }
  return null;
}

async function requestMicrophonePermission(): Promise<string | null> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Microphone access is not available in this browser.";
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stopTracks(stream);
    return null;
  } catch {
    return "Microphone access was denied. Allow the microphone in your browser settings and try again.";
  }
}

export default function VoiceFeedbackWidget() {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [speakerState, setSpeakerState] = useState<SpeakerState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState("");
  const [connectionStage, setConnectionStage] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");

  const vapiRef = useRef<VapiInstance | null>(null);
  const statusRef = useRef<CallStatus>("idle");
  const permissionStreamRef = useRef<MediaStream | null>(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(false);
  const connectionTimeoutRef = useRef<number | null>(null);
  const failedStartRef = useRef(false);
  const krispBypassInstalledRef = useRef(false);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  const setCallStatus = useCallback((next: CallStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const releasePermissionStream = useCallback(() => {
    stopTracks(permissionStreamRef.current);
    permissionStreamRef.current = null;
  }, []);

  const clearConnectionTimeout = useCallback(() => {
    if (connectionTimeoutRef.current !== null) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  const failConnection = useCallback(
    (message: string, instance?: VapiInstance | null) => {
      clearConnectionTimeout();
      failedStartRef.current = true;
      releasePermissionStream();
      setConnectionStage("");
      setCallStatus("error");
      setSpeakerState("idle");
      setAudioLevel(0);
      setError(message);
      const active = instance ?? vapiRef.current;
      if (active) {
        vapiRef.current = null;
        void safelyStopVapi(active);
      }
    },
    [clearConnectionTimeout, releasePermissionStream, setCallStatus],
  );

  const markInCall = useCallback(() => {
    clearConnectionTimeout();
    failedStartRef.current = false;
    setConnectionStage("");
    setCallStatus("in-call");
    setSpeakerState("agent");
  }, [clearConnectionTimeout, setCallStatus]);

  const scheduleConnectionTimeout = useCallback(
    (instance: VapiInstance, ms: number, message: string) => {
      clearConnectionTimeout();
      connectionTimeoutRef.current = window.setTimeout(() => {
        if (!mountedRef.current || vapiRef.current !== instance) return;
        if (statusRef.current === "in-call") return;
        connectionTimeoutRef.current = null;
        failConnection(message, instance);
      }, ms);
    },
    [clearConnectionTimeout, failConnection],
  );

  const attachVapiListeners = useCallback(
    (instance: VapiInstance) => {
      const updateForActiveInstance = (active: VapiInstance, update: () => void) => {
        if (mountedRef.current && vapiRef.current === active) update();
      };

      instance.on("call-start-progress", (event: unknown) => {
        const progress = event as { stage?: string; status?: string; metadata?: { error?: string } } | null;
        if (!progress?.stage) return;

        updateForActiveInstance(instance, () => {
          if (progress.status === "failed") {
            const stageError = progress.metadata?.error;
            const stageName = progress.stage ?? "setup";
            if (stageError) {
              failConnection(`Voice connection failed during ${stageName.replace(/-/g, " ")}: ${stageError}`, instance);
            }
            return;
          }

          if (statusRef.current !== "connecting") return;

          const stageLabels: Record<string, string> = {
            "web-call-creation": "Creating secure voice session...",
            "daily-call-object-creation": "Initializing audio engine...",
            "daily-call-join": "Joining voice room...",
            "audio-processing-setup": "Setting up microphone...",
            "audio-observer-setup": "Calibrating audio levels...",
            "mobile-permissions": "Checking device permissions...",
          };
          if (progress.status === "started" && progress.stage && stageLabels[progress.stage]) {
            setConnectionStage(stageLabels[progress.stage]);
          }
        });

        if (
          progress.stage === "daily-call-object-creation" &&
          progress.status === "completed" &&
          !krispBypassInstalledRef.current
        ) {
          krispBypassInstalledRef.current = installKrispBypass(instance);
        }
      });

      instance.on("call-start-success", () => {
        updateForActiveInstance(instance, () => {
          // start() finished; give the assistant a little longer to emit "listening".
          if (statusRef.current === "connecting") {
            scheduleConnectionTimeout(
              instance,
              LISTENING_TIMEOUT_MS,
              "The voice agent connected but did not respond in time. Please try again.",
            );
          }
        });
      });

      instance.on("call-start", () => {
        updateForActiveInstance(instance, markInCall);
      });

      instance.on("call-end", () => {
        updateForActiveInstance(instance, () => {
          clearConnectionTimeout();
          releasePermissionStream();
          setConnectionStage("");

          if (statusRef.current === "connecting") {
            failConnection("The voice connection ended before the agent could join. Please try again.");
            return;
          }

          if (!failedStartRef.current) setCallStatus("ended");
          setSpeakerState("idle");
          setAudioLevel(0);
        });
      });

      instance.on("speech-start", () => updateForActiveInstance(instance, () => setSpeakerState("agent")));
      instance.on("speech-end", () => updateForActiveInstance(instance, () => setSpeakerState("user")));
      instance.on("volume-level", (level: number) => {
        updateForActiveInstance(instance, () => {
          if (typeof level === "number" && Number.isFinite(level)) {
            setAudioLevel(Math.min(Math.max(level, 0), 1));
          }
        });
      });

      instance.on("message", (message: unknown) => {
        updateForActiveInstance(instance, () => {
          const transcriptMessage = message as {
            type?: string;
            transcript?: string;
            role?: string;
            transcriptType?: string;
          } | null;
          if (transcriptMessage?.type === "transcript" && transcriptMessage.transcript) {
            setLastTranscript(transcriptMessage.transcript);
            if (transcriptMessage.role === "assistant" || transcriptMessage.transcriptType === "final") {
              setSpeakerState(transcriptMessage.role === "user" ? "user" : "agent");
            }
          }
        });
      });

      instance.on("call-start-failed", (event: unknown) => {
        updateForActiveInstance(instance, () => {
          const failure = event as { error?: string; stage?: string } | null;
          const detail = failure?.error ? `: ${failure.error}` : "";
          failConnection(`Could not start the voice call${detail}. Check your microphone and Vapi configuration.`, instance);
        });
      });

      instance.on("error", (event: unknown) => {
        updateForActiveInstance(instance, () => {
          if (statusRef.current === "in-call") {
            setCallStatus("error");
            setSpeakerState("idle");
            setAudioLevel(0);
            setError(extractErrorMessage(event) || "The voice connection ended unexpectedly.");
            return;
          }

          if (statusRef.current === "connecting") {
            failConnection(
              extractErrorMessage(event) || "Could not connect to the voice agent. Check your microphone and try again.",
              instance,
            );
          }
        });
      });
    },
    [
      clearConnectionTimeout,
      failConnection,
      markInCall,
      releasePermissionStream,
      scheduleConnectionTimeout,
      setCallStatus,
    ],
  );

  useEffect(() => {
    mountedRef.current = true;
    let disposed = false;

    async function loadVapi() {
      if (!publicKey?.trim() || !assistantId?.trim()) {
        if (mountedRef.current) setError("Voice assistant is not configured. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID.");
        return;
      }

      try {
        const { default: Vapi } = await getVapiModule();
        if (disposed) return;

        let instance: VapiInstance;
        try {
          instance = new (Vapi as VapiConstructor)(publicKey, undefined, {
            alwaysIncludeMicInPermissionPrompt: true,
          }) as VapiInstance;
        } catch {
          if (!disposed && mountedRef.current) {
            setError("Voice review could not initialize. Please refresh and try again.");
          }
          return;
        }

        vapiRef.current = instance;
        attachVapiListeners(instance);
      } catch {
        if (!disposed && mountedRef.current) {
          setError("Voice review could not load. Please refresh and try again.");
        }
      }
    }

    void loadVapi();

    const handleWindowError = (event: ErrorEvent) => {
      if (!isVoiceInfrastructureError(event.message || "") || !mountedRef.current) return;
      if (statusRef.current !== "connecting" && statusRef.current !== "in-call") return;
      event.preventDefault();
      failConnection("Could not connect to the voice call. Please check your microphone and try again.", vapiRef.current);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason ?? "");
      if (!isVoiceInfrastructureError(message) || !mountedRef.current) return;
      if (statusRef.current !== "connecting" && statusRef.current !== "in-call") return;
      event.preventDefault();
      failConnection("Could not connect to the voice call. Please check your microphone and try again.", vapiRef.current);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      disposed = true;
      mountedRef.current = false;
      inFlightRef.current = false;
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      clearConnectionTimeout();
      releasePermissionStream();

      const instance = vapiRef.current;
      vapiRef.current = null;
      if (instance && statusRef.current !== "connecting" && statusRef.current !== "in-call") {
        void safelyStopVapi(instance);
      }
    };
  }, [assistantId, attachVapiListeners, clearConnectionTimeout, failConnection, publicKey, releasePermissionStream]);

  const handleStart = async () => {
    if (inFlightRef.current) return;
    if (!publicKey?.trim() || !assistantId?.trim()) {
      setError("Voice assistant is not configured.");
      return;
    }

    const supportError = getAudioSupportError();
    if (supportError) {
      setError(supportError);
      return;
    }

    inFlightRef.current = true;
    failedStartRef.current = false;
    krispBypassInstalledRef.current = false;
    setError("");
    setLastTranscript("");
    setConnectionStage("Requesting microphone access...");

    const micError = await requestMicrophonePermission();
    if (micError) {
      setConnectionStage("");
      setError(micError);
      inFlightRef.current = false;
      return;
    }

    try {
      let instance = vapiRef.current;

      if (!instance) {
        try {
          const { default: Vapi } = await getVapiModule();
          if (publicKey?.trim() && assistantId?.trim()) {
            instance = new (Vapi as VapiConstructor)(publicKey, undefined, {
              alwaysIncludeMicInPermissionPrompt: true,
            }) as VapiInstance;
            vapiRef.current = instance;
            attachVapiListeners(instance);
          }
        } catch {
          if (mountedRef.current) setError("Voice review could not initialize. Please refresh and try again.");
          return;
        }
        if (!instance || !mountedRef.current || vapiRef.current !== instance) return;
      }

      setCallStatus("connecting");
      setConnectionStage("Connecting to Notyc voice agent...");
      scheduleConnectionTimeout(
        instance,
        CONNECTION_TIMEOUT_MS,
        "Voice review could not connect in time. Check your network and microphone, then try again.",
      );

      try {
        const call = await instance.start(assistantId, { firstMessage: INITIAL_GREETING });
        if (!krispBypassInstalledRef.current) {
          krispBypassInstalledRef.current = installKrispBypass(instance);
        }
        if (!call && mountedRef.current && vapiRef.current === instance && statusRef.current === "connecting") {
          failConnection("Voice review could not start. Verify your Vapi public key and assistant ID.", instance);
        }
      } catch (startError) {
        if (mountedRef.current && vapiRef.current === instance && statusRef.current === "connecting") {
          const detail = extractErrorMessage(startError);
          failConnection(
            detail
              ? `Could not start the voice call: ${detail}`
              : "Could not start the voice call. Check your microphone and try again.",
            instance,
          );
        }
      }
    } finally {
      inFlightRef.current = false;
    }
  };

  const handleStop = async () => {
    const instance = vapiRef.current;
    clearConnectionTimeout();
    failedStartRef.current = false;
    releasePermissionStream();
    setConnectionStage("");
    setCallStatus("ended");
    setSpeakerState("idle");
    setAudioLevel(0);
    if (!instance) return;
    try {
      await instance.stop();
    } catch {
      // The SDK may already have destroyed the call after a remote ejection.
    }
  };

  const statusLabel =
    status === "in-call"
      ? speakerState === "agent"
        ? "🔊 Agent Speaking"
        : "🎤 Listening..."
      : status === "connecting"
        ? "⏳ Connecting..."
        : status === "ended"
          ? "✓ Call Ended"
          : status === "error"
            ? "⚠ Connection Failed"
            : "🎙 Ready";

  return (
    <div className="yc-voice-widget">
      <div className="yc-voice-header">
        <p className="yc-voice-widget-label">Notyc AI Voice Review</p>
        <span className={`yc-voice-badge yc-voice-badge-${status}`}>{statusLabel}</span>
      </div>
      <p className="yc-voice-widget-note">
        Talk through your startup idea with Notyc voice agent. Get instant feedback and stress-test your value proposition.
      </p>
      {status === "in-call" ? (
        <div className="yc-voice-active-panel">
          <div className="yc-voice-indicator-container">
            <div className={`yc-voice-avatar ${speakerState === "agent" ? "is-speaking" : "is-listening"}`}>
              <span className="yc-voice-icon">{speakerState === "agent" ? "🗣" : "🎙"}</span>
              <div
                className="yc-voice-pulse-ring"
                style={{ transform: `scale(${1 + audioLevel * 0.5})`, opacity: 0.3 + audioLevel * 0.7 }}
              />
            </div>
            <div className="yc-voice-audio-bars">
              {[0.4, 0.8, 0.5, 0.9, 0.6].map((multiplier, idx) => (
                <span
                  key={idx}
                  className="yc-voice-bar"
                  style={{ height: `${Math.max(12, audioLevel * 40 * multiplier)}px` }}
                />
              ))}
            </div>
          </div>
          {lastTranscript ? (
            <div className="yc-voice-transcript-box">
              <span className="yc-voice-transcript-label">Live transcript:</span>
              <p className="yc-voice-transcript-text">&ldquo;{lastTranscript}&rdquo;</p>
            </div>
          ) : (
            <p className="yc-voice-prompt-hint">
              {speakerState === "agent"
                ? "Notyc voice agent is speaking..."
                : "Speak into your microphone to share your idea details..."}
            </p>
          )}
          <button type="button" className="yc-voice-stop" onClick={handleStop}>
            <span className="yc-phone-icon">📵</span> End Call
          </button>
        </div>
      ) : (
        <div className="yc-voice-idle-panel">
          <button
            type="button"
            className="yc-voice-start"
            onClick={handleStart}
            disabled={status === "connecting"}
          >
            <span className="yc-mic-icon">🎙</span>
            {status === "connecting"
              ? connectionStage || "Connecting to Voice Agent..."
              : status === "error"
                ? "Try Voice Review Again"
                : "Start Voice Review"}
          </button>
        </div>
      )}
      {error ? <p className="yc-error-message" role="alert">{error}</p> : null}
    </div>
  );
}
