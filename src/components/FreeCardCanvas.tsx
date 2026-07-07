/* ─────────────────────────────────────────────────────────────────
   PSAU Free-Form Card — Portrait 1080×1920
   Full visual identity frame; all content blocks are user-defined.
─────────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import patternImg         from "@assets/image2.png";
import patternTransparent from "@assets/pattern_transparent.png";
import socialBar          from "@assets/image3.png";
import logoUnivWhite      from "@assets/logo_white.png";
import iconClock    from "@assets/image6.png";
import iconCalendar from "@assets/image7.png";
import iconLocation from "@assets/image8.png";

export const FREE_CANVAS_W = 1080;
export const FREE_CANVAS_H = 1920;

const TEAL       = "#5ab8b0";
const DARK_TEAL  = "#3c7974";
const DEEP_GREEN = "#0e3020";

/* ── Data types (exported so AdGenerator can use them) ── */
export interface FreeTextBlock {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  align: "center" | "right" | "left";
}

export interface FreeQrBlock {
  id: string;
  qrImage?: string;
  label: string;
}

export interface FreeCardData {
  bgImage: string;
  bgPositionX: number;
  bgPositionY: number;
  bgZoom: number;
  headerText: string;
  headerColor: string;
  headerSize: number;
  textBlocks: FreeTextBlock[];
  qrBlocks: FreeQrBlock[];
  time?: string;
  timeTo?: string;
  dayDate?: string;
  venue?: string;
}

/* ── Component ── */
export function FreeCard({ data }: { data: FreeCardData }) {
  const {
    bgImage, bgPositionX, bgPositionY, bgZoom,
    headerText, headerColor, headerSize,
    textBlocks, qrBlocks,
    time, timeTo, dayDate, venue,
  } = data;
  const timeDisplay = timeTo ? `${time} — ${timeTo}` : time;
  const hasInfo = !!(time || dayDate || venue);

  /* Pre-convert social bar to pure-white data URL (export-safe) */
  const [whiteSocial, setWhiteSocial] = useState(socialBar);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
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

  const PHOTO_H    = 700;
  const CURVE_TOP  = 598;
  const WHITE_TOP  = 710;
  const FOOTER_TOP = 1790;

  const HAS_QR = qrBlocks.length > 0;
  const QR_SIZE = qrBlocks.length <= 1 ? 280
                : qrBlocks.length === 2 ? 240
                : 190;

  return (
    <div style={{
      width: FREE_CANVAS_W, height: FREE_CANVAS_H,
      position: "relative", overflow: "hidden",
      backgroundColor: "#ffffff",
      fontFamily: "'Cairo','Arial',sans-serif",
      direction: "rtl",
      letterSpacing: 0,
    }}>

      {/* ══════════════════════════════════════
          1. PHOTO + DARK TEAL OVERLAY
      ══════════════════════════════════════ */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: PHOTO_H }}>

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
          background: `linear-gradient(170deg,
            ${DEEP_GREEN}e8 0%, ${DARK_TEAL}d4 45%,
            ${DARK_TEAL}c0 80%, ${DARK_TEAL}95 100%)`,
        }} />

        <img src={patternImg} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.07, pointerEvents: "none",
          mixBlendMode: "overlay",
        }} />

        {/* Big header text */}
        {headerText && (
          <div style={{
            position: "absolute", bottom: 148,
            left: 0, right: 0,
            padding: "0 64px",
            textAlign: "center",
            zIndex: 5,
          }}>
            <span style={{
              color: headerColor || "#ffffff",
              fontSize: headerSize || 110,
              fontWeight: 900,
              lineHeight: 1,
              display: "block",
            }}>
              {headerText}
            </span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          2. UNIVERSITY LOGO — top right
      ══════════════════════════════════════ */}
      <div style={{ position: "absolute", top: 32, right: 36, zIndex: 20 }}>
        <img src={logoUnivWhite} alt="" crossOrigin="anonymous"
          style={{ width: 240, display: "block" }} />
      </div>

      {/* ══════════════════════════════════════
          3. SVG WAVE CURVE
      ══════════════════════════════════════ */}
      <div style={{
        position: "absolute", top: CURVE_TOP, left: 0, right: 0,
        height: 120, zIndex: 15,
      }}>
        <svg viewBox="0 0 1080 120" preserveAspectRatio="none" width="1080" height="120">
          <defs>
            <linearGradient id="freeArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={TEAL} stopOpacity="0"   />
              <stop offset="25%"  stopColor={TEAL} stopOpacity="0.75"/>
              <stop offset="50%"  stopColor={TEAL} stopOpacity="1"   />
              <stop offset="75%"  stopColor={TEAL} stopOpacity="0.75"/>
              <stop offset="100%" stopColor={TEAL} stopOpacity="0"   />
            </linearGradient>
          </defs>
          <path d="M0,120 L0,72 Q540,8 1080,72 L1080,120 Z" fill="#ffffff" />
          <path d="M0,72 Q540,8 1080,72 Q540,36 0,72 Z" fill="url(#freeArcGrad)" />
        </svg>
      </div>

      {/* ══════════════════════════════════════
          4. WHITE CONTENT SECTION
      ══════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        top: WHITE_TOP, left: 0, right: 0,
        bottom: FREE_CANVAS_H - FOOTER_TOP,
        backgroundColor: "#ffffff",
        zIndex: 5, overflow: "hidden",
      }}>
        {/* Subtle pattern overlay */}
        <img src={patternTransparent} alt="" crossOrigin="anonymous" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center top",
          opacity: 0.13, pointerEvents: "none",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 80%)",
          maskImage:        "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 80%)",
        }} />

        {/* Content column */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          padding: "64px 70px 36px",
          height: "100%",
          boxSizing: "border-box",
          gap: 32,
        }}>

          {/* ── Free text blocks ── */}
          {textBlocks.map(block => (
            <div key={block.id} style={{ textAlign: block.align, width: "100%" }}>
              <p style={{
                color:      block.color,
                fontSize:   block.fontSize,
                fontWeight: block.fontWeight,
                margin: 0,
                lineHeight: 1.6,
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
              borderRadius: 26,
              padding: "32px 40px",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 48,
              direction: "rtl",
              alignItems: "flex-start",
              justifyContent: "center",
            }}>
              {time && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 120 }}>
                  <img src={iconClock} alt="" crossOrigin="anonymous" style={{ width: 56, height: 56, objectFit: "contain" }} />
                  <span style={{ color: DEEP_GREEN, fontSize: 34, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{timeDisplay}</span>
                </div>
              )}
              {dayDate && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 180 }}>
                  <img src={iconCalendar} alt="" crossOrigin="anonymous" style={{ width: 56, height: 56, objectFit: "contain" }} />
                  <span style={{ color: DEEP_GREEN, fontSize: 34, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{dayDate}</span>
                </div>
              )}
              {venue && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 160 }}>
                  <img src={iconLocation} alt="" crossOrigin="anonymous" style={{ width: 56, height: 56, objectFit: "contain" }} />
                  <span style={{ color: DEEP_GREEN, fontSize: 34, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{venue}</span>
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
              gap: 72,
              justifyContent: "center",
              alignItems: "flex-start",
              flexWrap: "wrap",
              paddingTop: 16,
              paddingBottom: 40,
            }}>
              {qrBlocks.map(qr => (
                <div key={qr.id} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 16,
                }}>
                  {/* QR image box */}
                  <div style={{
                    width: QR_SIZE, height: QR_SIZE,
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    padding: 10,
                    boxShadow: "0 3px 16px rgba(0,0,0,0.12)",
                    boxSizing: "border-box",
                  }}>
                    {qr.qrImage ? (
                      <img src={qr.qrImage} alt="QR" crossOrigin="anonymous"
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 10 }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        border: `3px dashed ${TEAL}`,
                        borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ color: TEAL, fontSize: 22, fontWeight: 600 }}>QR</span>
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  {qr.label && (
                    <span style={{
                      color: DEEP_GREEN,
                      fontSize: 34,
                      fontWeight: 700,
                      textAlign: "center",
                      maxWidth: QR_SIZE + 40,
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
          color: "#ffffff", fontSize: 32, fontWeight: 700,
          fontFamily: "inherit", flexShrink: 0, letterSpacing: 0,
        }}>
          وحدة العلاقات العامة
        </span>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <img src={whiteSocial} alt="" crossOrigin="anonymous"
            style={{ height: 80, objectFit: "contain" }} />
        </div>
      </div>

    </div>
  );
}
