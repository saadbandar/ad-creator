/* ─────────────────────────────────────────────────────────────────
   PSAU "Invitation" Template — Portrait 1080×1920
   Design: full-bleed teal photo with curved bottom, two logos on top,
   big card word, white body with intro + title, rounded info card
   (QR + 2×2 icon grid), white footer with social bar + accreditation.
─────────────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from "react";
import patternTransparent from "@assets/pattern_transparent.png";
import socialBar    from "@assets/image3.png";
import badgeImg     from "@assets/image5.png";
import iconClock    from "@assets/image6.png";
import iconCalendar from "@assets/image7.png";
import iconLocation from "@assets/image8.png";
import iconCert     from "@assets/image9.png";
import logoTeams    from "@assets/image10.png";
import logoZoom     from "@assets/image11.png";
import logoUnivWhite from "@assets/logo_white.png";
import { CANVAS_W, CANVAS_H, type EventAdData } from "./TemplateCanvas";

const TEAL       = "#5ab8b0";
const DARK_TEAL  = "#3c7974";
const DEEP_GREEN = "#0e3020";
const INK        = "#1f2a28";

const PHOTO_H    = 830;   // teal photo block
const CURVE_TOP  = 700;   // where the SVG curve starts
const WHITE_TOP  = 820;   // body starts (under the curve)
const FOOTER_TOP = 1700;  // white footer block

export function EventAdInvitationCanvas({ data }: { data: EventAdData }) {
  const {
    bgImage, bgPositionX, bgPositionY, bgZoom,
    representedBy, eventType, eventTitle,
    time, timeTo, day, date,
    locationType, venue, meetingUrl,
    hasCertificate, qrCodeImage, adMode,
    language, presenter, partnerLogo,
  } = data;

  const isEn           = language === "en";
  const isAnnouncement = adMode === "announcement";
  const isOnline       = locationType !== "in-person";
  const platformLogo   = locationType === "teams" ? logoTeams : logoZoom;
  const platformName   = locationType === "teams" ? "Microsoft Teams" : "Zoom";
  const timeDisplay    = timeTo
    ? (isEn ? `${time} – ${timeTo}` : `من ${time}\nإلى ${timeTo}`)
    : time;

  const L = {
    card:    isAnnouncement ? (isEn ? "Announcement" : "إعلان") : (isEn ? "Invitation" : "دعوة"),
    college: isEn ? "College of Business Administration, Huta Bani Tamim" : "كلية إدارة الأعمال بحوطة بني تميم",
    repBy:   isEn ? "represented by" : "ممثلة بـ",
    online:  isEn ? "Online" : "عن بُعد",
    cert:    isEn ? "Attendance Certificate" : "شهادة حضور",
  };

  /* Intro sentence */
  const intro = (() => {
    const who = representedBy ? `${L.college} ${L.repBy} ${representedBy}` : L.college;
    if (isEn) {
      return isAnnouncement
        ? `${who} announces ${eventType || "an event"} entitled`
        : `${who} is pleased to invite you to attend ${eventType || "an event"} entitled`;
    }
    return isAnnouncement
      ? `تعلن ${who} عن إقامة ${eventType || "فعالية"} بعنوان`
      : `يسرّ ${who} دعوتكم لحضور ${eventType || "فعالية"} بعنوان`;
  })();

  /* Shrink body when it overflows the fixed white area */
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentScale, setContentScale] = useState(1);
  const MAX_CONTENT_H = FOOTER_TOP - WHITE_TOP - 24;
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const h = el.scrollHeight;
    setContentScale(h > MAX_CONTENT_H ? MAX_CONTENT_H / h : 1);
  });

  return (
    <div style={{
      width: CANVAS_W, height: CANVAS_H,
      position: "relative", overflow: "hidden",
      backgroundColor: "#ffffff",
      fontFamily: "'Cairo','Arial',sans-serif",
      direction: isEn ? "ltr" : "rtl",
      letterSpacing: 0,
    }}>

      {/* ── 1. PHOTO with teal wash ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: PHOTO_H, overflow: "hidden" }}>
        <img src={bgImage} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          objectPosition: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
          transform: `scale(${bgZoom ?? 1})`,
          transformOrigin: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
        }} />
        {/* Teal duotone wash */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, ${DARK_TEAL}cc 0%, ${DARK_TEAL}b8 55%, ${DEEP_GREEN}c8 100%)`,
        }} />
        <div style={{ position: "absolute", inset: 0, backgroundColor: DARK_TEAL, opacity: 0.35, mixBlendMode: "color" }} />

        {/* Card word */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", zIndex: 5 }}>
          <span style={{
            color: "#fff", fontSize: 118, fontWeight: 900, lineHeight: 1, display: "block",
            letterSpacing: isEn ? 2 : 6,
            textShadow: "0 4px 24px rgba(0,0,0,0.25)",
          }}>
            {L.card}
          </span>
        </div>
      </div>

      {/* ── 2. LOGOS ── */}
      <div style={{ position: "absolute", top: 44, right: 44, zIndex: 20 }}>
        <img src={logoUnivWhite} alt="" crossOrigin="anonymous" style={{ width: 300, display: "block" }} />
      </div>
      {partnerLogo && (
        <div style={{ position: "absolute", top: 44, left: 44, zIndex: 20 }}>
          <img src={partnerLogo} alt="" crossOrigin="anonymous"
            style={{ maxWidth: 300, maxHeight: 130, objectFit: "contain", display: "block" }} />
        </div>
      )}

      {/* ── 3. CURVE — teal band + white body edge ── */}
      <div style={{ position: "absolute", top: CURVE_TOP, left: 0, right: 0, height: 140, zIndex: 15 }}>
        <svg viewBox="0 0 1080 140" preserveAspectRatio="none" width="1080" height="140">
          {/* white body — symmetric dome, no band */}
          <path d="M0,140 L0,116 Q540,-44 1080,116 L1080,140 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* ── 4. WHITE BODY ── */}
      <div style={{
        position: "absolute", top: WHITE_TOP, left: 0, right: 0, bottom: CANVAS_H - FOOTER_TOP,
        backgroundColor: "#fff", zIndex: 5, overflow: "hidden",
      }}>
        <img src={patternTransparent} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center bottom",
          opacity: 0.10, pointerEvents: "none",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 45%, transparent 85%)",
          maskImage:        "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 45%, transparent 85%)",
        }} />

        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div ref={contentRef} style={{ width: "100%", transform: `scale(${contentScale})`, transformOrigin: "top center" }}>
            <div style={{
              position: "relative", zIndex: 2,
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "70px 60px 30px", boxSizing: "border-box",
            }}>

              {/* Intro */}
              <p style={{
                color: INK, fontSize: 42, fontWeight: 700, lineHeight: 1.7,
                margin: 0, textAlign: "center", whiteSpace: "pre-wrap",
              }}>
                {intro}
              </p>

              {/* Title */}
              <p style={{
                color: DARK_TEAL, fontSize: 74, fontWeight: 900, lineHeight: 1.35,
                margin: "34px 0 0", textAlign: "center", whiteSpace: "pre-wrap",
              }}>
                {eventTitle}
              </p>
              {presenter && (
                <p style={{ color: INK, fontSize: 40, fontWeight: 600, lineHeight: 1.5, margin: "14px 0 0", textAlign: "center" }}>
                  {isEn ? "Presented by: " : "من تقديم: "}{presenter}
                </p>
              )}

              {/* INFO CARD */}
              <div style={{
                marginTop: 48, width: "100%",
                backgroundColor: "#eef2f2", borderRadius: 34,
                padding: "34px 36px",
                display: "flex", flexDirection: "row", alignItems: "center",
                gap: 30, direction: "ltr", boxSizing: "border-box",
              }}>
                {/* QR */}
                {(isOnline || qrCodeImage) && (
                  <div style={{
                    flexShrink: 0, width: 260, height: 260,
                    backgroundColor: "#fff", borderRadius: 20, padding: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxSizing: "border-box",
                  }}>
                    {qrCodeImage ? (
                      <a href={meetingUrl || "#"} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", width: "100%", height: "100%", pointerEvents: "auto", cursor: "pointer" }}>
                        <img src={qrCodeImage} alt="QR" crossOrigin="anonymous"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </a>
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", border: `3px dashed ${TEAL}`, borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ color: TEAL, fontSize: 22, fontWeight: 600 }}>QR</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2×2 grid */}
                <div style={{
                  flex: 1, display: "grid",
                  gridTemplateColumns: "1fr 1fr", rowGap: 34, columnGap: 20,
                  direction: isEn ? "ltr" : "rtl",
                }}>
                  <Item icon={iconCalendar} text={day} sub={date} isEn={isEn} />
                  <Item icon={iconClock} text={timeDisplay} isEn={isEn} />
                  {isOnline
                    ? <Item icon={iconLocation} text={L.online} sub={platformName} logo={platformLogo} isEn={isEn} />
                    : <Item icon={iconLocation} text={venue} isEn={isEn} />}
                  {hasCertificate && <Item icon={iconCert} text={L.cert} isEn={isEn} />}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── 5. FOOTER (white) ── */}
      <div style={{
        position: "absolute", top: FOOTER_TOP, left: 0, right: 0, bottom: 0,
        backgroundColor: "#fff", zIndex: 20, direction: "ltr",
      }}>
        <img src={socialBar} alt="" crossOrigin="anonymous" style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          height: 120, objectFit: "contain",
        }} />
        <img src={badgeImg} alt="" crossOrigin="anonymous" style={{
          position: "absolute", left: 44, bottom: 36,
          width: 130, height: 130, objectFit: "contain",
        }} />
      </div>
    </div>
  );
}

function Item({ icon, text, sub, logo, isEn }: {
  icon: string; text: string; sub?: string; logo?: string; isEn: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, direction: isEn ? "ltr" : "rtl", minWidth: 0 }}>
      <img src={icon} alt="" crossOrigin="anonymous" style={{ width: 66, height: 66, objectFit: "contain", flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ color: INK, fontSize: 32, fontWeight: 700, lineHeight: 1.3, whiteSpace: "pre-wrap" }}>{text}</span>
        {sub && <span style={{ color: "#3b4644", fontSize: 28, fontWeight: 500, lineHeight: 1.3 }}>{sub}</span>}
        {logo && <img src={logo} alt="" crossOrigin="anonymous" style={{ height: 30, objectFit: "contain", alignSelf: "flex-start", marginTop: 4 }} />}
      </div>
    </div>
  );
}
