/* ─────────────────────────────────────────────────────────────────
   PSAU Event Announcement Template — Landscape 1920×1080
   Mirror of the portrait template, rotated to horizontal layout.
─────────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import patternImg         from "@assets/image2.png";
import patternTransparent from "@assets/pattern_transparent.png";
import socialBar          from "@assets/image3.png";
import iconClock          from "@assets/image6.png";
import iconCalendar       from "@assets/image7.png";
import iconLocation       from "@assets/image8.png";
import iconCert           from "@assets/image9.png";
import logoTeams          from "@assets/image10.png";
import logoZoom           from "@assets/image11.png";
import logoUnivWhite      from "@assets/logo_white.png";
import type { EventAdData } from "./TemplateCanvas";

export const CANVAS_W_L = 1920;
export const CANVAS_H_L = 1080;

const TEAL       = "#5ab8b0";
const DARK_TEAL  = "#3c7974";
const DEEP_GREEN = "#0e3020";

const PHOTO_W   = 710;
const ARC_START = 628;
const ARC_W     = 160;
const WHITE_LEFT = 768;
const FOOTER_H   = 118;

export function EventAdLandscapeCanvas({ data }: { data: EventAdData }) {
  const {
    bgImage, bgPositionX, bgPositionY, bgZoom,
    representedBy, eventType, eventTitle,
    time, timeTo, day, date,
    locationType, venue, meetingUrl,
    hasCertificate, qrCodeImage, adMode,
    language,
  } = data;
  const timeDisplay = timeTo ? `${time} — ${timeTo}` : time;

  const isEn           = language === "en";
  const isAnnouncement = adMode === "announcement";
  const isOnline     = locationType !== "in-person";
  const platformLogo = locationType === "teams" ? logoTeams : logoZoom;
  const platformName = locationType === "teams" ? "Microsoft Teams" : "Zoom";

  /* Localised labels */
  const L = {
    card:        isAnnouncement ? (isEn ? "Announcement" : "إعلان") : (isEn ? "Invitation" : "دعوة"),
    verb:        isAnnouncement ? (isEn ? "announces"    : "تعلن")  : (isEn ? "invites you" : "تدعوكم"),
    college:     isEn ? "College of Business Administration, Huta Bani Tamim" : "كلية إدارة الأعمال بحوطة بني تميم",
    repBy:       isEn ? "Represented by" : "ممثلة بـ",
    online:      isEn ? "Online"         : "عن بُعد",
    certificate: isEn ? "Attendance Certificate Available" : "يوجد شهادات حضور",
    footer:      isEn ? "Public Relations Unit" : "وحدة العلاقات العامة",
  };

  /* Pre-convert social bar to white so CSS filter isn't needed during export */
  const [whiteSocial, setWhiteSocial] = useState(socialBar);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const ctx = cv.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, cv.width, cv.height);
      for (let i = 0; i < id.data.length; i += 4) {
        if (id.data[i + 3] > 0) { id.data[i] = 255; id.data[i+1] = 255; id.data[i+2] = 255; }
      }
      ctx.putImageData(id, 0, 0);
      setWhiteSocial(cv.toDataURL());
    };
    img.src = socialBar;
  }, []);

  return (
    <div style={{
      width: CANVAS_W_L, height: CANVAS_H_L,
      position: "relative", overflow: "hidden",
      backgroundColor: "#ffffff",
      fontFamily: "'Cairo','Arial',sans-serif",
      direction: isEn ? "ltr" : "rtl",
      letterSpacing: 0,
    }}>

      {/* ══ 1. PHOTO SECTION — right side ══ */}
      <div style={{ position: "absolute", top: 0, right: 0, width: PHOTO_W, bottom: 0 }}>

        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src={bgImage} alt="" crossOrigin="anonymous" style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
            transform: `scale(${bgZoom ?? 1})`,
            transformOrigin: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
          }} />
        </div>

        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(150deg,
            ${DEEP_GREEN}e8 0%,
            ${DARK_TEAL}d4 45%,
            ${DARK_TEAL}c0 80%,
            ${DARK_TEAL}95 100%)`,
        }} />

        <img src={patternImg} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.07, pointerEvents: "none",
          mixBlendMode: "overlay",
        }} />

        {/* University logo — centered at top */}
        <div style={{
          position: "absolute", top: 36, left: 0, right: 0,
          display: "flex", justifyContent: "center", zIndex: 10,
        }}>
          <img src={logoUnivWhite} alt="" crossOrigin="anonymous"
            style={{ width: 210, display: "block" }} />
        </div>

      </div>

      {/* ══ 2. VERTICAL ARC SEPARATOR ══ */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        right: ARC_START, width: ARC_W, zIndex: 15,
      }}>
        <svg
          viewBox={`0 0 ${ARC_W} ${CANVAS_H_L}`}
          preserveAspectRatio="none"
          width={ARC_W} height={CANVAS_H_L}
          style={{ transform: "scaleX(-1)", display: "block" }}
        >
          <defs>
            <linearGradient id="arcVGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={TEAL} stopOpacity="0"    />
              <stop offset="25%"  stopColor={TEAL} stopOpacity="0.75" />
              <stop offset="50%"  stopColor={TEAL} stopOpacity="1"    />
              <stop offset="75%"  stopColor={TEAL} stopOpacity="0.75" />
              <stop offset="100%" stopColor={TEAL} stopOpacity="0"    />
            </linearGradient>
          </defs>
          <path
            d={`M${ARC_W},0 L${ARC_W},${CANVAS_H_L} L0,${CANVAS_H_L} Q${ARC_W * 0.72},${CANVAS_H_L / 2} 0,0 Z`}
            fill="#ffffff"
          />
          <path
            d={`M0,0 Q${ARC_W * 0.72},${CANVAS_H_L / 2} 0,${CANVAS_H_L}
                Q${ARC_W * 0.42},${CANVAS_H_L / 2} 0,0 Z`}
            fill="url(#arcVGrad)"
          />
        </svg>
      </div>

      {/* ══ 3. WHITE SECTION — left side (above footer) ══ */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: WHITE_LEFT,
        bottom: FOOTER_H,
        backgroundColor: "#ffffff",
        zIndex: 5, overflow: "hidden",
      }}>
        {/* Pattern overlay */}
        <img src={patternTransparent} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          opacity: 0.11, pointerEvents: "none",
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, transparent 100%)",
          maskImage:        "linear-gradient(to right, rgba(0,0,0,1) 30%, transparent 100%)",
        }} />

        {/* Content column */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center",
          padding: "75px 60px 32px 44px",
          height: "100%", boxSizing: "border-box",
        }}>

          {/* Card type heading */}
          <div style={{ width: "100%", textAlign: "center", marginBottom: 10 }}>
            <span style={{
              color: DARK_TEAL,
              fontSize: 90,
              fontWeight: 900,
              lineHeight: 1,
              display: "block",
            }}>
              {L.card}
            </span>
          </div>

          {/* Invitation / announcement text */}
          <div style={{
            width: "100%", textAlign: "center",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <p style={{ color: DEEP_GREEN, fontSize: 38, fontWeight: 700, margin: 0, lineHeight: 1.55 }}>
              {L.verb} {L.college}
            </p>
            {representedBy && (
              <p style={{ color: DARK_TEAL, fontSize: 40, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                {L.repBy} {representedBy}
              </p>
            )}
            <p style={{ color: "#1a1a1a", fontSize: 44, fontWeight: 500, margin: 0, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
              {eventType}
            </p>
          </div>

          {/* Event title */}
          <div style={{ marginTop: 22, width: "100%", textAlign: "center" }}>
            <p style={{
              color: TEAL, fontSize: 56, fontWeight: 900,
              lineHeight: 1.4, margin: 0, whiteSpace: "pre-wrap",
            }}>
              {eventTitle}
            </p>
            {data.presenter && (
              <p style={{
                color: DARK_TEAL,
                fontSize: 38,
                fontWeight: 600,
                lineHeight: 1.5,
                margin: "14px 0 0",
                whiteSpace: "pre-wrap",
              }}>
                من تقديم: {data.presenter}
              </p>
            )}
          </div>

          {/* Info card */}
          <div style={{
            marginTop: "auto",
            width: "100%",
            backgroundColor: "#eaf5f4",
            borderRadius: 22,
            padding: "26px 34px",
            display: "flex", flexDirection: "row",
            alignItems: "center",
            gap: 30, direction: "ltr", boxSizing: "border-box",
          }}>

            {/* QR — left side */}
            {isOnline && (
              <div style={{
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 170, height: 170,
                backgroundColor: "#fff", borderRadius: 14, padding: 7,
              }}>
                {qrCodeImage ? (
                  <img src={qrCodeImage} alt="QR" crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 7 }} />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    border: `3px dashed ${TEAL}`, borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: TEAL, fontSize: 20, fontWeight: 600 }}>QR</span>
                  </div>
                )}
              </div>
            )}

            {/* Info rows */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, direction: isEn ? "ltr" : "rtl" }}>
              <LInfoRow icon={iconClock}    text={timeDisplay} isEn={isEn} />
              <LInfoRow icon={iconCalendar} text={`${day}  ${date}`} isEn={isEn} />
              {isOnline ? (
                <LInfoRow icon={iconLocation} text={L.online} subText={platformName} subLogo={platformLogo} urlText={meetingUrl || undefined} isEn={isEn} />
              ) : (
                <LInfoRow icon={iconLocation} text={venue} isEn={isEn} />
              )}
              {hasCertificate && (
                <LInfoRow icon={iconCert} text={L.certificate} isEn={isEn} />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ══ 4. FOOTER — dark teal, spans left section ══ */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: WHITE_LEFT,
        height: FOOTER_H,
        backgroundColor: DARK_TEAL,
        zIndex: 20,
        display: "flex", alignItems: "center",
        padding: "0 34px", direction: "ltr", gap: 22,
      }}>
        <span style={{
          color: "#ffffff", fontSize: 28, fontWeight: 700,
          flexShrink: 0, letterSpacing: 0,
        }}>
          {L.footer}
        </span>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <img src={whiteSocial} alt="" crossOrigin="anonymous"
            style={{ height: 68, objectFit: "contain" }} />
        </div>
      </div>

    </div>
  );
}

function LInfoRow({
  icon, text, subText, subLogo, urlText, isEn,
}: {
  icon: string;
  text: string;
  subText?: string;
  subLogo?: string;
  urlText?: string;
  isEn?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 14, direction: isEn ? "ltr" : "rtl" }}>
      <img src={icon} alt="" crossOrigin="anonymous"
        style={{ width: 50, height: 50, objectFit: "contain", flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ color: DEEP_GREEN, fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
          {text}
        </span>
        {subText && (
          <span style={{ color: "#444", fontSize: 28, fontWeight: 500, lineHeight: 1.2 }}>
            {subText}
          </span>
        )}
        {subLogo && (
          <img src={subLogo} alt="" crossOrigin="anonymous"
            style={{ height: 24, objectFit: "contain", alignSelf: "flex-start", marginTop: 2 }} />
        )}
        {urlText && (
          <span style={{
            color: DARK_TEAL, fontSize: 22, fontWeight: 500, lineHeight: 1.3,
            wordBreak: "break-all", direction: "ltr", textAlign: "left", marginTop: 3,
          }}>
            {urlText}
          </span>
        )}
      </div>
    </div>
  );
}
