/* ─────────────────────────────────────────────────────────────────
   PSAU Free-Form Card — Landscape 1920×1080
   Same identity frame as the portrait version, horizontal layout.
─────────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import patternImg         from "@assets/image2.png";
import patternTransparent from "@assets/pattern_transparent.png";
import socialBar          from "@assets/image3.png";
import logoUnivWhite      from "@assets/logo_white.png";
import iconClock    from "@assets/image6.png";
import iconCalendar from "@assets/image7.png";
import iconLocation from "@assets/image8.png";
import type { FreeCardData } from "./FreeCardCanvas";

export const FREE_CANVAS_W_L = 1920;
export const FREE_CANVAS_H_L = 1080;

const TEAL       = "#5ab8b0";
const DARK_TEAL  = "#3c7974";
const DEEP_GREEN = "#0e3020";

const PHOTO_W   = 720;
const ARC_START = 630;
const ARC_W     = 160;
const WHITE_LEFT = 778;
const FOOTER_H  = 110;

export function FreeCardLandscape({ data }: { data: FreeCardData }) {
  const {
    bgImage, bgPositionX, bgPositionY, bgZoom,
    headerText, headerColor, headerSize,
    textBlocks, qrBlocks,
    time, timeTo, dayDate, venue,
  } = data;
  const timeDisplay = timeTo ? `${time} — ${timeTo}` : time;
  const hasInfo = !!(time || dayDate || venue);

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
        if (id.data[i + 3] > 0) {
          id.data[i] = 255; id.data[i + 1] = 255; id.data[i + 2] = 255;
        }
      }
      ctx.putImageData(id, 0, 0);
      setWhiteSocial(cv.toDataURL());
    };
    img.src = socialBar;
  }, []);

  const HAS_QR = qrBlocks.length > 0;
  const QR_SIZE = qrBlocks.length <= 1 ? 220
                : qrBlocks.length === 2 ? 190
                : 155;

  return (
    <div style={{
      width: FREE_CANVAS_W_L, height: FREE_CANVAS_H_L,
      position: "relative", overflow: "hidden",
      backgroundColor: "#ffffff",
      fontFamily: "'Cairo','Arial',sans-serif",
      direction: "rtl",
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

        {/* Overlay gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg,
            ${DEEP_GREEN}f0 0%, ${DARK_TEAL}d8 50%,
            ${DARK_TEAL}b0 100%)`,
        }} />

        {/* Pattern texture */}
        <img src={patternImg} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.07, pointerEvents: "none",
          mixBlendMode: "overlay",
        }} />

        {/* Logo — top right of photo area */}
        <div style={{ position: "absolute", top: 28, right: 28, zIndex: 10 }}>
          <img src={logoUnivWhite} alt="" crossOrigin="anonymous"
            style={{ width: 180, display: "block" }} />
        </div>

        {/* Header text — centred in photo */}
        {headerText && (
          <div style={{
            position: "absolute",
            top: 0, bottom: FOOTER_H,
            left: 0, right: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 44px",
            zIndex: 5,
          }}>
            <span style={{
              color: headerColor || "#ffffff",
              fontSize: (headerSize || 110) * 0.72,
              fontWeight: 900,
              lineHeight: 1.1,
              textAlign: "center",
              display: "block",
            }}>
              {headerText}
            </span>
          </div>
        )}
      </div>

      {/* ══ 2. VERTICAL ARC — between photo and white ══ */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        right: ARC_START, width: ARC_W + 2,
        zIndex: 15,
      }}>
        <svg viewBox="0 0 162 1080" preserveAspectRatio="none"
          width={ARC_W + 2} height={FREE_CANVAS_H_L}
          style={{ transform: "scaleX(-1)", display: "block" }}>
          <defs>
            <linearGradient id="freeArcGradL" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={TEAL} stopOpacity="0"   />
              <stop offset="25%"  stopColor={TEAL} stopOpacity="0.75"/>
              <stop offset="50%"  stopColor={TEAL} stopOpacity="1"   />
              <stop offset="75%"  stopColor={TEAL} stopOpacity="0.75"/>
              <stop offset="100%" stopColor={TEAL} stopOpacity="0"   />
            </linearGradient>
          </defs>
          {/* White fill */}
          <path d="M162,0 L80,0 Q0,540 80,1080 L162,1080 Z" fill="#ffffff" />
          {/* Teal accent stroke */}
          <path d="M80,0 Q0,540 80,1080 Q40,540 80,0 Z" fill="url(#freeArcGradL)" />
        </svg>
      </div>

      {/* ══ 3. WHITE CONTENT SECTION — left side ══ */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: WHITE_LEFT,
        bottom: FOOTER_H,
        backgroundColor: "#ffffff",
        zIndex: 5, overflow: "hidden",
      }}>
        {/* Subtle pattern */}
        <img src={patternTransparent} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          opacity: 0.10, pointerEvents: "none",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          maskImage:        "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
        }} />

        {/* Content column */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          padding: "52px 64px 36px",
          height: "100%",
          boxSizing: "border-box",
          gap: 28,
        }}>

          {/* ── Free text blocks ── */}
          {textBlocks.map(block => (
            <div key={block.id} style={{ textAlign: block.align, width: "100%" }}>
              <p style={{
                color:      block.color,
                fontSize:   block.fontSize * 0.72,
                fontWeight: block.fontWeight,
                margin: 0,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}>
                {block.text || ""}
              </p>
            </div>
          ))}

          {/* ── Info row (time / date / venue) — icon above, text below ── */}
          {hasInfo && (
            <div style={{
              width: "100%",
              backgroundColor: "#eaf5f4",
              borderRadius: 18,
              padding: "18px 28px",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 36,
              direction: "rtl",
              alignItems: "flex-start",
              justifyContent: "center",
            }}>
              {time && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 90 }}>
                  <img src={iconClock} alt="" crossOrigin="anonymous" style={{ width: 38, height: 38, objectFit: "contain" }} />
                  <span style={{ color: DEEP_GREEN, fontSize: 24, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{timeDisplay}</span>
                </div>
              )}
              {dayDate && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 140 }}>
                  <img src={iconCalendar} alt="" crossOrigin="anonymous" style={{ width: 38, height: 38, objectFit: "contain" }} />
                  <span style={{ color: DEEP_GREEN, fontSize: 24, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{dayDate}</span>
                </div>
              )}
              {venue && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 120 }}>
                  <img src={iconLocation} alt="" crossOrigin="anonymous" style={{ width: 38, height: 38, objectFit: "contain" }} />
                  <span style={{ color: DEEP_GREEN, fontSize: 24, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{venue}</span>
                </div>
              )}
            </div>
          )}

          {/* ── QR codes row ── */}
          {HAS_QR && (
            <div style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "row",
              gap: 60,
              justifyContent: "center",
              alignItems: "flex-start",
              flexWrap: "wrap",
              paddingTop: 12,
              paddingBottom: 28,
            }}>
              {qrBlocks.map(qr => (
                <div key={qr.id} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: QR_SIZE, height: QR_SIZE,
                    backgroundColor: "#fff",
                    borderRadius: 14,
                    padding: 8,
                    boxShadow: "0 3px 14px rgba(0,0,0,0.12)",
                    boxSizing: "border-box",
                  }}>
                    {qr.qrImage ? (
                      <img src={qr.qrImage} alt="QR" crossOrigin="anonymous"
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        border: `3px dashed ${TEAL}`,
                        borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ color: TEAL, fontSize: 18, fontWeight: 600 }}>QR</span>
                      </div>
                    )}
                  </div>
                  {qr.label && (
                    <span style={{
                      color: DEEP_GREEN,
                      fontSize: 26,
                      fontWeight: 700,
                      textAlign: "center",
                      maxWidth: QR_SIZE + 32,
                      lineHeight: 1.4,
                      display: "block",
                    }}>
                      {qr.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ 4. FOOTER — dark teal bar ══ */}
      <div style={{
        position: "absolute",
        left: 0, right: WHITE_LEFT,
        bottom: 0, height: FOOTER_H,
        backgroundColor: DARK_TEAL,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
        direction: "ltr",
        gap: 20,
      }}>
        <span style={{
          color: "#ffffff", fontSize: 26, fontWeight: 700,
          fontFamily: "inherit", flexShrink: 0, letterSpacing: 0,
        }}>
          وحدة العلاقات العامة
        </span>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <img src={whiteSocial} alt="" crossOrigin="anonymous"
            style={{ height: 62, objectFit: "contain" }} />
        </div>
      </div>

    </div>
  );
}
