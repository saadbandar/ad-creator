/* ─────────────────────────────────────────────────────────────────
   PSAU Event Announcement Template — Portrait 1080×1920
   Layout matches reference: 36adf217-6621-47c2-94ea-1518ac99ca8b
─────────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import patternImg        from "@assets/image2.png";
import patternTransparent from "@assets/pattern_transparent.png";
import socialBar    from "@assets/image3.png";
import badgeImg     from "@assets/image5.png";
import iconClock    from "@assets/image6.png";
import iconCalendar from "@assets/image7.png";
import iconLocation from "@assets/image8.png";
import iconCert     from "@assets/image9.png";
import logoTeams    from "@assets/image10.png";
import logoZoom     from "@assets/image11.png";
import logoUniv      from "@assets/تصميم_بدون_عنوان_1776144448792.png";
import logoUnivWhite from "@assets/logo_white.png";

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

export type LocationType = "in-person" | "teams" | "zoom";

export interface EventAdData {
  bgImage: string;
  bgPositionX: number;
  bgPositionY: number;
  bgZoom: number;
  departmentName: string;
  representedBy?: string;
  eventType: string;
  eventTitle: string;
  time: string;
  timeTo?: string;
  day: string;
  date: string;
  locationType: LocationType;
  venue: string;
  meetingUrl: string;
  hasCertificate: boolean;
  qrCodeImage?: string;
  adMode: "invitation" | "announcement";
  language?: "ar" | "en";
  presenter?: string;
}

const TEAL       = "#5ab8b0";
const DARK_TEAL  = "#3c7974";
const DEEP_GREEN = "#0e3020";

export interface TemplatePreset {
  id: number;
  label: string;
  locationType: LocationType;
  hasCertificate: boolean;
}
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  { id: 1, label: "حضوري — بدون شهادة",  locationType: "in-person", hasCertificate: false },
  { id: 2, label: "حضوري — مع شهادة",     locationType: "in-person", hasCertificate: true  },
  { id: 3, label: "Teams — مع شهادة",     locationType: "teams",     hasCertificate: true  },
  { id: 4, label: "Teams — بدون شهادة",   locationType: "teams",     hasCertificate: false },
  { id: 5, label: "Zoom — مع شهادة",      locationType: "zoom",      hasCertificate: true  },
  { id: 6, label: "Zoom — بدون شهادة",    locationType: "zoom",      hasCertificate: false },
];

export function EventAdCanvas({ data }: { data: EventAdData }) {
  const {
    bgImage, bgPositionX, bgPositionY, bgZoom,
    departmentName, representedBy, eventType, eventTitle,
    time, timeTo, day, date,
    locationType, venue, meetingUrl,
    hasCertificate, qrCodeImage, adMode,
    language,
  } = data;
  const timeDisplay = timeTo ? `${time} — ${timeTo}` : time;

  const isEn           = language === "en";
  const isAnnouncement = adMode === "announcement";
  const isOnline       = locationType !== "in-person";
  const platformLogo   = locationType === "teams" ? logoTeams : logoZoom;
  const platformName   = locationType === "teams" ? "Microsoft Teams" : "Zoom";

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

  const PHOTO_H    = 700;
  const CURVE_TOP  = 598;
  const WHITE_TOP  = 710;
  const FOOTER_TOP = 1790;

  return (
    <div style={{
      width: CANVAS_W, height: CANVAS_H,
      position: "relative", overflow: "hidden",
      backgroundColor: "#ffffff",
      fontFamily: "'Cairo','Arial',sans-serif",
      direction: isEn ? "ltr" : "rtl",
      letterSpacing: 0,
    }}>

      {/* ══════════════════════════════════════
          1. PHOTO SECTION + DARK TEAL OVERLAY
      ══════════════════════════════════════ */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: PHOTO_H }}>

        {/* Background photo — with pan + zoom */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src={bgImage} alt="" crossOrigin="anonymous" style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
            transform: `scale(${bgZoom ?? 1})`,
            transformOrigin: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
          }} />
        </div>

        {/* Dark teal gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(170deg,
            ${DEEP_GREEN}e8 0%,
            ${DARK_TEAL}d4 45%,
            ${DARK_TEAL}c0 80%,
            ${DARK_TEAL}95 100%)`,
        }} />

        {/* Pattern / vector watermark over the dark overlay */}
        <img src={patternImg} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.07, pointerEvents: "none",
          mixBlendMode: "overlay",
        }} />

        {/* ── Card type label — large white text over the photo ── */}
        <div style={{
          position: "absolute",
          bottom: 148,
          left: 0, right: 0,
          padding: "0 64px",
          textAlign: "center",
          zIndex: 5,
        }}>
          <span style={{
            color: "#ffffff",
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1,
            display: "block",
          }}>
            {L.card}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════
          2. UNIVERSITY LOGO — top (white)
      ══════════════════════════════════════ */}
      <div style={{
        position: "absolute", top: 32, right: 36, zIndex: 20,
      }}>
        <img src={logoUnivWhite} alt="" crossOrigin="anonymous"
          style={{ width: 240, display: "block" }} />
      </div>

      {/* ══════════════════════════════════════
          3. SVG WAVE CURVE + decorative arc
      ══════════════════════════════════════ */}
      <div style={{
        position: "absolute", top: CURVE_TOP, left: 0, right: 0,
        height: 120, zIndex: 15,
      }}>
        <svg viewBox="0 0 1080 120" preserveAspectRatio="none" width="1080" height="120">
          <defs>
            <linearGradient id="arcFillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={TEAL} stopOpacity="0"   />
              <stop offset="25%"  stopColor={TEAL} stopOpacity="0.75"/>
              <stop offset="50%"  stopColor={TEAL} stopOpacity="1"   />
              <stop offset="75%"  stopColor={TEAL} stopOpacity="0.75"/>
              <stop offset="100%" stopColor={TEAL} stopOpacity="0"   />
            </linearGradient>
          </defs>
          <path d="M0,120 L0,72 Q540,8 1080,72 L1080,120 Z" fill="#ffffff" />
          <path
            d="M0,72 Q540,8 1080,72 Q540,36 0,72 Z"
            fill="url(#arcFillGrad)"
          />
        </svg>
      </div>

      {/* ══════════════════════════════════════
          4. WHITE SECTION
      ══════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        top: WHITE_TOP, left: 0, right: 0,
        bottom: CANVAS_H - FOOTER_TOP,
        backgroundColor: "#ffffff",
        zIndex: 5, overflow: "hidden",
      }}>
        {/* Pattern overlay */}
        <img src={patternTransparent} alt="" crossOrigin="anonymous" style={{
          position: "absolute",
          inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          opacity: 0.13,
          pointerEvents: "none",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 80%)",
          maskImage:        "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 80%)",
        }} />

        {/* Content column */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center",
          padding: "90px 64px 40px 64px",
          height: "100%",
          boxSizing: "border-box",
          gap: 0,
        }}>

          {/* ── Invitation / announcement text ── */}
          <div style={{
            width: "100%",
            textAlign: "center",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <p style={{ color: DEEP_GREEN, fontSize: 44, fontWeight: 700, margin: 0, lineHeight: 1.65 }}>
              {L.verb} {L.college}
            </p>
            {representedBy && (
              <p style={{ color: DARK_TEAL, fontSize: 46, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                {L.repBy} {representedBy}
              </p>
            )}
            <p style={{ color: "#1a1a1a", fontSize: 52, fontWeight: 500, margin: 0, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
              {eventType}
            </p>
          </div>

          {/* ── Event title ── */}
          <div style={{ marginTop: 36, width: "100%", textAlign: "center" }}>
            <p style={{
              color: TEAL,
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.45,
              margin: 0,
              whiteSpace: "pre-wrap",
            }}>
              {eventTitle}
            </p>
            {data.presenter && (
              <p style={{
                color: DARK_TEAL,
                fontSize: 46,
                fontWeight: 600,
                lineHeight: 1.5,
                margin: "18px 0 0",
                whiteSpace: "pre-wrap",
              }}>
                من تقديم: {data.presenter}
              </p>
            )}
          </div>

          {/* ── INFO CARD ── */}
          <div style={{
            marginTop: "auto",
            width: "100%",
            backgroundColor: "#eaf5f4",
            borderRadius: 26,
            padding: "36px 40px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
            direction: "ltr",
            boxSizing: "border-box",
          }}>

            {/* QR CODE */}
            {isOnline && (
              <div style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 220,
                height: 220,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 8,
              }}>
                {qrCodeImage ? (
                  <img src={qrCodeImage} alt="QR" crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    border: `3px dashed ${TEAL}`,
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: TEAL, fontSize: 22, textAlign: "center", fontWeight: 600 }}>QR</span>
                  </div>
                )}
              </div>
            )}

            {/* INFO ROWS */}
            <div style={{
              flex: 1,
              display: "flex", flexDirection: "column",
              gap: 22,
              direction: isEn ? "ltr" : "rtl",
            }}>
              <InfoRow icon={iconClock}    text={timeDisplay} isEn={isEn} />
              <InfoRow icon={iconCalendar} text={`${day}  ${date}`} isEn={isEn} />
              {isOnline ? (
                <InfoRow
                  icon={iconLocation}
                  text={L.online}
                  subText={platformName}
                  subLogo={platformLogo}
                  urlText={meetingUrl || undefined}
                  isEn={isEn}
                />
              ) : (
                <InfoRow icon={iconLocation} text={venue} isEn={isEn} />
              )}
              {hasCertificate && (
                <InfoRow icon={iconCert} text={L.certificate} isEn={isEn} />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          5. FOOTER — dark teal bar
      ══════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        top: FOOTER_TOP, left: 0, right: 0, bottom: 0,
        backgroundColor: DARK_TEAL,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        padding: "0 36px",
        direction: "ltr",
        gap: 24,
      }}>
        <span style={{
          color: "#ffffff",
          fontSize: 32,
          fontWeight: 700,
          fontFamily: "inherit",
          flexShrink: 0,
          letterSpacing: 0,
        }}>
          {L.footer}
        </span>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <img src={whiteSocial} alt="" crossOrigin="anonymous"
            style={{ height: 80, objectFit: "contain" }} />
        </div>
      </div>

    </div>
  );
}

/* ── Single info row ── */
function InfoRow({
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
    <div style={{
      display: "flex", flexDirection: "row",
      alignItems: "center",
      gap: 16,
      direction: isEn ? "ltr" : "rtl",
    }}>
      <img src={icon} alt="" crossOrigin="anonymous"
        style={{ width: 58, height: 58, objectFit: "contain", flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ color: DEEP_GREEN, fontSize: 38, fontWeight: 700, lineHeight: 1.25 }}>
          {text}
        </span>
        {subText && (
          <span style={{ color: "#444", fontSize: 33, fontWeight: 500, lineHeight: 1.25 }}>
            {subText}
          </span>
        )}
        {subLogo && (
          <img src={subLogo} alt="" crossOrigin="anonymous"
            style={{ height: 28, objectFit: "contain", alignSelf: "flex-start", marginTop: 2 }} />
        )}
        {urlText && (
          <span style={{
            color: DARK_TEAL, fontSize: 28, fontWeight: 500, lineHeight: 1.3,
            wordBreak: "break-all", direction: "ltr", textAlign: "left",
            marginTop: 4,
          }}>
            {urlText}
          </span>
        )}
      </div>
    </div>
  );
}
