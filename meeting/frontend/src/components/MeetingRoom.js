import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchPublicMeetingByCode } from "../api/meetingsApi";
import { useAuth } from "../context/AuthContext";

/** Jitsi room name: stable, URL-safe, tied to meeting code */
function jitsiRoomName(code) {
  return `MSA-${String(code || "").trim().toUpperCase()}`;
}

export default function MeetingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = (code || "").trim().toUpperCase();
        const m = await fetchPublicMeetingByCode(c);
        if (!cancelled) {
          setInfo(m);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setInfo(null);
          setError("notfound");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  function leave() {
    navigate(user ? "/meetings" : "/");
  }

  if (error === "notfound") {
    return (
      <div className="room room--empty">
        <div className="room__dialog">
          <h1>Invalid or expired code</h1>
          <p className="lede">Check the code and try again.</p>
          <Link to="/join" className="btn btn--primary">
            Enter code
          </Link>
          <Link to="/" className="link room__home">
            Home
          </Link>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="room room--empty">
        <p className="lede">Loading meeting…</p>
      </div>
    );
  }

  if (info.status === "cancelled") {
    return (
      <div className="room room--empty">
        <div className="room__dialog">
          <h1>Meeting cancelled</h1>
          <p className="lede">This session is no longer active.</p>
          <button type="button" className="btn btn--primary" onClick={leave}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const room = jitsiRoomName(info.code);
  const displayName = user?.email || "Guest";
  const jitsiSrc = `https://meet.jit.si/${encodeURIComponent(
    room
  )}#userInfo.displayName=${encodeURIComponent(
    displayName
  )}&config.prejoinPageEnabled=false&config.startWithAudioMuted=false`;

  return (
    <div className="room room--jitsi">
      <header className="room__bar room__bar--jitsi">
        <div>
          <p className="room__eyebrow">Jitsi video call</p>
          <h1 className="room__title">{info.title}</h1>
        </div>
        <div className="room__bar-actions">
          <code className="room__code">{info.code}</code>
          <button type="button" className="btn btn--secondary btn--sm" onClick={leave}>
            Leave
          </button>
        </div>
      </header>
      <iframe
        title="Jitsi Meet"
        className="jitsi-frame"
        src={jitsiSrc}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
      />
    </div>
  );
}
