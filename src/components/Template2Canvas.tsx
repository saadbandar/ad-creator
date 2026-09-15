/* ─────────────────────────────────────────────────────────────────
   PSAU Event Announcement — Template 2 "Full Immersion" — Portrait 1080×1920
   Design: full-bleed photo, deep gradient, floating info card at bottom
─────────────────────────────────────────────────────────────────── */
import patternTransparent from "@assets/pattern_transparent.png";
import iconClock    from "@assets/image6.png";
import iconCalendar from "@assets/image7.png";
import iconLocation from "@assets/image8.png";
import iconCert     from "@assets/image9.png";
import logoTeams    from "@assets/image10.png";
import logoZoom     from "@assets/image11.png";
import logoUnivWhite from "@assets/logo_white.png";

import type { EventAdData } from "./TemplateCanvas";
export { CANVAS_W, CANVAS_H } from "./TemplateCanvas";

const TEAL       = "#5ab8b0";
const DARK_TEAL  = "#3c7974";
const DEEP_GREEN = "#0e3020";

export function EventAdCanvas2({ data }: { data: EventAdData }) {
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
  const isOnline       = locationType !== "in-person";
  const platformLogo   = locationType === "teams" ? logoTeams : logoZoom;
  const platformName   = locationType === "teams" ? "Microsoft Teams" : "Zoom";

  const L = {
    card:        isAnnouncement ? (isEn ? "Announcement" : "إعلان") : (isEn ? "Invitation" : "دعوة"),
    verb:        isAnnouncement ? (isEn ? "announces"    : "تعلن")  : (isEn ? "invites you" : "تدعوكم"),
    college:     isEn ? "College of Business Administration" : "كلية إدارة الأعمال",
    repBy:       isEn ? "Represented by" : "ممثلة بـ",
    online:      isEn ? "Online"         : "عن بُعد",
    certificate: isEn ? "Attendance Certificate" : "يوجد شهادات حضور",
  };

  return (
    <div style={{
      width: 1080, height: 1920,
      position: "relative", overflow: "hidden",
      fontFamily: "'Cairo','Arial',sans-serif",
      direction: isEn ? "ltr" : "rtl",
    }}>

      {/* ── 1. FULL-BLEED BACKGROUND PHOTO ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <img src={bgImage} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
          transform: `scale(${bgZoom ?? 1})`,
          transformOrigin: `${bgPositionX ?? 50}% ${bgPositionY ?? 50}%`,
        }} />
      </div>

      {/* ── 2. LAYERED GRADIENTS ── */}
      {/* Top vignette — logo readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, ${DEEP_GREEN}e0 0%, transparent 38%)`,
      }} />
      {/* Bottom heavy gradient — info card area */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(0deg, ${DEEP_GREEN}f8 0%, ${DEEP_GREEN}d8 35%, transparent 65%)`,
      }} />

      {/* ── 3. SUBTLE PATTERN OVER GRADIENT ── */}
      <img src={patternTransparent} alt="" crossOrigin="anonymous" style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
        opacity: 0.06,
        pointerEvents: "none",
      }} />

      {/* ── 4. UNIVERSITY LOGO ── */}
      <div style={{ position: "absolute", top: 48, right: 48, zIndex: 20 }}>
        <img src={logoUnivWhite} alt="" crossOrigin="anonymous"
          style={{ width: 220, display: "block" }} />
      </div>

      {/* ── 5. TEAL LEFT ACCENT BAR ── */}
      <div style={{
        position: "absolute",
        top: 60, left: 48,
        width: 8, height: 140,
        borderRadius: 4,
        background: `linear-gradient(180deg, ${TEAL} 0%, transparent 100%)`,
        zIndex: 10,
      }} />

      {/* ── 6. CARD TYPE BADGE ── */}
      <div style={{
        position: "absolute",
        top: 68, left: 72,
        zIndex: 10,
      }}>
        <div style={{
          display: "inline-block",
          backgroundColor: TEAL,
          color: "#ffffff",
          fontSize: 42,
          fontWeight: 900,
          padding: "10px 40px",
          borderRadius: 50,
          letterSpacing: 2,
        }}>
          {L.card}
        </div>
      </div>

      {/* ── 7. COLLEGE & VERB TEXT ── */}
      <div style={{
        position: "absolute",
        top: 168, left: 72, right: 72,
        zIndex: 10,
      }}>
        <p style={{
          color: "rgba(255,255,255,0.80)",
          fontSize: 38,
          fontWeight: 500,
          margin: 0,
          lineHeight: 1.5,
        }}>
          {L.verb} {L.college}
        </p>
        {representedBy && (
          <p style={{
            color: TEAL,
            fontSize: 40,
            fontWeight: 600,
            margin: "6px 0 0",
            lineHeight: 1.5,
          }}>
            {L.repBy}: {representedBy}
          </p>
        )}
      </div>

      {/* ── 8. BOTTOM CONTENT AREA ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "0 60px 80px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>
        {/* Event type */}
        <p style={{
          color: TEAL,
          fontSize: 50,
          fontWeight: 700,
          margin: "0 0 16px",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
        }}>
          {eventType}
        </p>

        {/* Thin teal line divider */}
        <div style={{
          width: 120, height: 5,
          backgroundColor: TEAL,
          borderRadius: 3,
          marginBottom: 28,
          alignSelf: isEn ? "flex-start" : "flex-end",
        }} />

        {/* Event title */}
        <p style={{
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1.35,
          margin: "0 0 20px",
          whiteSpace: "pre-wrap",
        }}>
          {eventTitle}
        </p>

        {/* Presenter */}
        {data.presenter && (
          <p style={{
            color: "rgba(255,255,255,0.80)",
            fontSize: 44,
            fontWeight: 500,
            margin: "0 0 32px",
            lineHeight: 1.4,
          }}>
            {isEn ? "Presented by: " : "من تقديم: "}{data.presenter}
          </p>
        )}

        {/* ── INFO CARD (glass-style) ── */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.10)",
          border: `1.5px solid rgba(255,255,255,0.18)`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 28,
          padding: "36px 44px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 36,
          marginTop: data.presenter ? 0 : 12,
          boxSizing: "border-box",
          direction: "ltr",
        }}>
          {/* QR code column */}
          {isOnline && (
            <div style={{
              flexShrink: 0,
              width: 200, height: 200,
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {qrCodeImage ? (
                <img src={qrCodeImage} alt="QR" crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  border: `3px dashed ${TEAL}`,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ color: TEAL, fontSize: 22, fontWeight: 700 }}>QR</span>
                </div>
              )}
            </div>
          )}

          {/* Info rows */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            direction: isEn ? "ltr" : "rtl",
          }}>
            <InfoRow2 icon={iconClock}    text={timeDisplay} />
            <InfoRow2 icon={iconCalendar} text={`${day}  ${date}`} />
            {isOnline ? (
              <InfoRow2
                icon={iconLocation}
                text={L.online}
                subText={platformName}
                subLogo={platformLogo}
                urlText={meetingUrl || undefined}
              />
            ) : (
              <InfoRow2 icon={iconLocation} text={venue} />
            )}
            {hasCertificate && (
              <InfoRow2 icon={iconCert} text={L.certificate} accent />
            )}
          </div>
        </div>

        {/* Footer line */}
        <div style={{
          marginTop: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          direction: "ltr",
        }}>
          <div style={{
            height: 2,
            flex: 1,
            background: `linear-gradient(90deg, ${TEAL} 0%, transparent 100%)`,
            borderRadius: 2,
            marginLeft: 24,
          }} />
          <span style={{
            color: "rgba(255,255,255,0.60)",
            fontSize: 28,
            fontWeight: 500,
            flexShrink: 0,
          }}>
            {isEn ? "Public Relations Unit" : "وحدة العلاقات العامة"}
          </span>
        </div>

      </div>
    </div>
  );
}

function InfoRow2({
  icon, text, subText, subLogo, urlText, accent,
}: {
  icon: string;
  text: string;
  subText?: string;
  subLogo?: string;
  urlText?: string;
  accent?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    }}>
      <img src={icon} alt="" crossOrigin="anonymous"
        style={{ width: 52, height: 52, objectFit: "contain", flexShrink: 0, opacity: 0.9 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{
          color: accent ? TEAL : "#ffffff",
          fontSize: 36,
          fontWeight: accent ? 700 : 600,
          lineHeight: 1.25,
        }}>
          {text}
        </span>
        {subText && (
          <span style={{ color: "rgba(255,255,255,0.70)", fontSize: 30, fontWeight: 500, lineHeight: 1.25 }}>
            {subText}
          </span>
        )}
        {subLogo && (
          <img src={subLogo} alt="" crossOrigin="anonymous"
            style={{ height: 24, objectFit: "contain", alignSelf: "flex-start", marginTop: 2, filter: "brightness(10)" }} />
        )}
        {urlText && (
          <span style={{
            color: TEAL, fontSize: 26, fontWeight: 500,
            wordBreak: "break-all", direction: "ltr", textAlign: "left", marginTop: 2,
          }}>
            {urlText}
          </span>
        )}
      </div>
    </div>
  );
}
