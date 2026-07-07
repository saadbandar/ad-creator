import { useState, useRef, useCallback, useId, useEffect, type PointerEvent } from "react";
import QRCodeLib from "qrcode";
import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import defaultBg from "@assets/خلفية_الاعلان__1776680502994.png";
import logoImg from "@assets/تصميم_بدون_عنوان_1776144448792.png";
import logoTeams from "@assets/image10.png";
import logoZoom  from "@assets/image11.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, RefreshCw, ImageIcon, Eye, QrCode, Plus, Trash2 } from "lucide-react";
import {
  CANVAS_W, CANVAS_H,
  EventAdCanvas,
  type EventAdData,
  type LocationType,
} from "@/components/TemplateCanvas";
import {
  CANVAS_W_L, CANVAS_H_L,
  EventAdLandscapeCanvas,
} from "@/components/TemplateLandscapeCanvas";
import {
  FREE_CANVAS_W, FREE_CANVAS_H,
  FreeCard,
  type FreeCardData,
  type FreeTextBlock,
  type FreeQrBlock,
} from "@/components/FreeCardCanvas";
import {
  FREE_CANVAS_W_L, FREE_CANVAS_H_L,
  FreeCardLandscape,
} from "@/components/FreeCardLandscapeCanvas";

/* ── Default data ── */
/* ── University brand palette ── */
const BRAND_SWATCHES = [
  { hex: "#0e3020", label: "أخضر داكن"       },
  { hex: "#3c7974", label: "أخضر مائي داكن" },
  { hex: "#5ab8b0", label: "أخضر مائي"      },
  { hex: "#bbe3e7", label: "أخضر مائي فاتح" },
  { hex: "#ffffff", label: "أبيض"            },
] as const;

const DEFAULT_DATA: EventAdData = {
  bgImage: defaultBg,
  bgPositionX: 50,
  bgPositionY: 50,
  bgZoom: 1,
  departmentName: "",
  representedBy: "",
  eventType: "",
  eventTitle: "",
  presenter: "",
  time: "",
  day: "",
  date: "",
  locationType: "in-person",
  venue: "",
  meetingUrl: "",
  hasCertificate: false,
  qrCodeImage: undefined,
  adMode: "invitation",
};

const DEFAULT_FREE_DATA: FreeCardData = {
  bgImage: defaultBg,
  bgPositionX: 50, bgPositionY: 50, bgZoom: 1,
  headerText: "",
  headerColor: "#ffffff",
  headerSize: 110,
  textBlocks: [],
  qrBlocks: [],
  time: "",
  dayDate: "",
  venue: "",
};

/* ── Sanitise a title string into a safe filename (no extension) ── */
function toFilename(title: string, fallback: string): string {
  const s = title
    .trim()
    .replace(/[\r\n]+/g, " ")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80)
    .trim();
  return s || fallback;
}

type ExportFormat = "pdf" | "png" | "jpeg";

interface FormatOption {
  id: ExportFormat;
  label: string;
  mime: string;
  ext: string;
  quality: number;
  hint: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { id: "pdf",  mime: "application/pdf", ext: "pdf",  label: "PDF",  quality: 1,
    hint: "ملف PDF جاهز للطباعة" },
  { id: "png",  mime: "image/png",       ext: "png",  label: "PNG",  quality: 1,
    hint: "جودة لا تُفقد — حجم أكبر" },
  { id: "jpeg", mime: "image/jpeg",      ext: "jpg",  label: "JPEG", quality: 0.92,
    hint: "أصغر حجم — مناسب للمشاركة السريعة" },
];

/* ── Interactive image pan control ── */
const ImagePanControl = ({
  src, x, y, zoom, onChange, onZoomChange,
}: {
  src: string;
  x: number;
  y: number;
  zoom: number;
  onChange: (x: number, y: number) => void;
  onZoomChange: (z: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging   = useRef(false);

  const calcPos = (e: { clientX: number; clientY: number }) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width)  * 100));
    const py = Math.max(0, Math.min(100, ((e.clientY - rect.top)  / rect.height) * 100));
    onChange(Math.round(px), Math.round(py));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calcPos(e);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    calcPos(e);
  };
  const onPointerUp = () => { isDragging.current = false; };

  return (
    <>
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "crosshair",
        userSelect: "none",
        border: "2px solid var(--primary)",
      }}
    >
      <img src={src} alt="" draggable={false} style={{
        width: "100%", height: "100%",
        objectFit: "cover",
        objectPosition: `${x}% ${y}%`,
        transform: `scale(${zoom})`,
        transformOrigin: `${x}% ${y}%`,
        pointerEvents: "none",
        display: "block",
      }} />

      {/* Semi-dark overlay outside the focus area */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.38)",
        pointerEvents: "none",
      }} />

      {/* Crosshair focus indicator */}
      <div style={{
        position: "absolute",
        left: `${x}%`, top: `${y}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}>
        {/* Outer ring */}
        <div style={{
          width: 36, height: 36,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.9)",
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
        }} />
        {/* Inner dot */}
        <div style={{
          width: 10, height: 10,
          borderRadius: "50%",
          backgroundColor: "#5ab8b0",
          border: "1.5px solid white",
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
        }} />
        {/* Cross lines */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}>
          <div style={{ position:"absolute", left:-14, top:-1, width:28, height:2, background:"rgba(255,255,255,0.8)" }} />
          <div style={{ position:"absolute", top:-14, left:-1, width:2, height:28, background:"rgba(255,255,255,0.8)" }} />
        </div>
      </div>

      {/* Tip label */}
      <div style={{
        position: "absolute", bottom: 6, right: 6,
        background: "rgba(0,0,0,0.65)",
        color: "#fff", fontSize: 10, padding: "2px 7px",
        borderRadius: 4, pointerEvents: "none",
        direction: "rtl",
      }}>
        اسحب لتحريك الصورة
      </div>

      {/* Zoom badge */}
      <div style={{
        position: "absolute", bottom: 6, left: 6,
        background: "rgba(0,0,0,0.65)",
        color: "#fff", fontSize: 10, padding: "2px 7px",
        borderRadius: 4, pointerEvents: "none",
        fontFamily: "monospace",
      }}>
        {zoom.toFixed(1)}×
      </div>
    </div>

    {/* Zoom slider */}
    <div className="flex items-center gap-2 px-1 pt-1">
      <span className="text-xs text-muted-foreground shrink-0">🔍</span>
      <input
        type="range"
        min={1} max={3} step={0.05}
        value={zoom}
        onChange={e => onZoomChange(parseFloat(e.target.value))}
        className="w-full accent-primary h-1.5 cursor-pointer"
      />
      <span className="text-xs text-muted-foreground shrink-0 font-mono w-8 text-right">
        {zoom.toFixed(1)}×
      </span>
    </div>
    </>
  );
};

export default function AdGenerator() {
  /* ── Standard card state ── */
  const [data, setData] = useState<EventAdData>({ ...DEFAULT_DATA });
  const [exportFormat, setExportFormat] = useState<ExportFormat>("jpeg");
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingEn, setIsExportingEn] = useState(false);
  const [enData, setEnData] = useState<EventAdData | null>(null);
  const enExportRef = useRef<HTMLDivElement>(null);

  const [rawTime, setRawTime] = useState("");
  const [rawTimeTo, setRawTimeTo] = useState("");
  const [rawDate, setRawDate] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [scale, setScale] = useState(0.35);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const exportRef  = useRef<HTMLDivElement>(null);
  const bgInputId  = useId();
  const qrInputId  = useId();
  const [qrUrl, setQrUrl] = useState("");

  /* ── Free card state ── */
  const [cardMode, setCardMode] = useState<"standard" | "free">("standard");
  const [freeOrientation, setFreeOrientation] = useState<"portrait" | "landscape">("portrait");
  const [freeData, setFreeData] = useState<FreeCardData>({ ...DEFAULT_FREE_DATA });
  const [isExportingFree, setIsExportingFree] = useState(false);
  const freeExportRef = useRef<HTMLDivElement>(null);
  const freeLandscapeExportRef = useRef<HTMLDivElement>(null);
  const freeBgInputId = useId();
  const [hasTime, setHasTime] = useState(false);
  const [freeHasTime, setFreeHasTime] = useState(false);
  const [freeRawTime, setFreeRawTime] = useState("");
  const [freeRawTimeTo, setFreeRawTimeTo] = useState("");
  const [freeRawDate, setFreeRawDate] = useState("");
  const [freeDateMode, setFreeDateMode] = useState<"hijri" | "gregorian">("hijri");

  /* ── Google Translate (unofficial free endpoint) ── */
  const tr = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) return text;
    try {
      const r = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`
      );
      const j = await r.json();
      return (j[0] as [string, ...unknown[]][]).map(x => x[0]).join("");
    } catch { return text; }
  }, []);

  /* ── Export in English ── */
  const exportAsEnglish = useCallback(async () => {
    setIsExportingEn(true);
    const fmt = FORMAT_OPTIONS.find(f => f.id === exportFormat)!;
    const activeW = orientation === "portrait" ? CANVAS_W   : CANVAS_W_L;
    const activeH = orientation === "portrait" ? CANVAS_H   : CANVAS_H_L;
    try {
      /* Translate user-entered fields in parallel */
      const [repTr, typeTr, titleTr, venueTr] = await Promise.all([
        tr(data.representedBy ?? ""),
        tr(data.eventType),
        tr(data.eventTitle),
        tr(data.venue),
      ]);

      /* Re-format date/time in English */
      let timeEn   = data.time;
      let timeToEn = data.timeTo;
      let dayEn    = data.day;
      let dateEn   = data.date;
      if (rawTime)   timeEn   = formatEn12(rawTime);
      if (rawTimeTo) timeToEn = formatEn12(rawTimeTo);
      if (rawDate) {
        const d = new Date(rawDate + "T12:00:00");
        dayEn  = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
        dateEn = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(d);
      }

      const translated: EventAdData = {
        ...data,
        representedBy: repTr,
        eventType:  typeTr,
        eventTitle: titleTr,
        venue:      venueTr,
        time: timeEn, timeTo: timeToEn, day: dayEn, date: dateEn,
        language: "en",
      };
      setEnData(translated);

      /* Wait for re-render */
      await new Promise(r => setTimeout(r, 500));

      const el = enExportRef.current;
      if (!el) return;
      await new Promise(r => setTimeout(r, 300));
      const canvas = await toCanvas(el, {
        pixelRatio: 1,
        width: activeW,
        height: activeH,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      if (fmt.id === "pdf") {
        const isLandscape = activeW > activeH;
        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "px", format: [activeW, activeH],
          hotfixes: ["px_scaling"],
        });
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, activeW, activeH);
        pdf.save(`${toFilename(titleTr, "event-announcement")}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `${toFilename(titleTr, "event-announcement")}.${fmt.ext}`;
        link.href = canvas.toDataURL(fmt.mime, fmt.quality);
        link.click();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingEn(false);
      setEnData(null);
    }
  }, [data, exportFormat, rawTime, rawDate, orientation, tr]);

  const generateQrFromUrl = useCallback(async (url: string) => {
    if (!url.trim()) return;
    try {
      const dataUrl = await QRCodeLib.toDataURL(url.trim(), {
        width: 400, margin: 1,
        color: { dark: "#0e3020", light: "#ffffff" },
      });
      set("qrCodeImage", dataUrl);
    } catch (_) {}
  }, []);

  /* ── Free card helpers ── */
  const setFree = <K extends keyof FreeCardData>(key: K, value: FreeCardData[K]) =>
    setFreeData(prev => ({ ...prev, [key]: value }));

  const formatAr12 = (raw: string) => {
    if (!raw) return "";
    const [hStr, mStr] = raw.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const period = h >= 12 ? "م" : "ص";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const handleFreeTimeChange = (raw: string) => {
    setFreeRawTime(raw);
    setFree("time", formatAr12(raw));
  };

  const handleFreeTimeToChange = (raw: string) => {
    setFreeRawTimeTo(raw);
    setFree("timeTo", raw ? formatAr12(raw) : undefined);
  };

  const handleFreeDateChange = (raw: string, mode: "hijri" | "gregorian") => {
    setFreeRawDate(raw);
    if (!raw) { setFree("dayDate", ""); return; }
    const d = new Date(raw + "T12:00:00");
    const dayName = new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(d);
    if (mode === "hijri") {
      const dateStr = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
        day: "numeric", month: "numeric", year: "numeric",
      }).format(d);
      setFree("dayDate", `${dayName}  ${dateStr}`);
    } else {
      const dateStr = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
        day: "numeric", month: "numeric", year: "numeric",
      }).format(d);
      setFree("dayDate", `${dayName}  ${dateStr}`);
    }
  };

  const handleFreeBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => ev.target?.result && setFree("bgImage", ev.target.result as string);
    reader.readAsDataURL(file);
  };

  const addTextBlock = () => {
    const block: FreeTextBlock = {
      id: crypto.randomUUID(),
      text: "",
      color: "#0e3020",
      fontSize: 48,
      fontWeight: 700,
      align: "center",
    };
    setFreeData(prev => ({ ...prev, textBlocks: [...prev.textBlocks, block] }));
  };

  const updateTextBlock = (id: string, patch: Partial<FreeTextBlock>) =>
    setFreeData(prev => ({
      ...prev,
      textBlocks: prev.textBlocks.map(b => b.id === id ? { ...b, ...patch } : b),
    }));

  const removeTextBlock = (id: string) =>
    setFreeData(prev => ({ ...prev, textBlocks: prev.textBlocks.filter(b => b.id !== id) }));

  const addQrBlock = () => {
    const block: FreeQrBlock = { id: crypto.randomUUID(), label: "", qrImage: undefined };
    setFreeData(prev => ({ ...prev, qrBlocks: [...prev.qrBlocks, block] }));
  };

  const updateQrBlock = (id: string, patch: Partial<FreeQrBlock>) =>
    setFreeData(prev => ({
      ...prev,
      qrBlocks: prev.qrBlocks.map(b => b.id === id ? { ...b, ...patch } : b),
    }));

  const removeQrBlock = (id: string) =>
    setFreeData(prev => ({ ...prev, qrBlocks: prev.qrBlocks.filter(b => b.id !== id) }));

  const generateFreeQr = useCallback(async (blockId: string, url: string) => {
    if (!url.trim()) { updateQrBlock(blockId, { qrImage: undefined }); return; }
    try {
      const dataUrl = await QRCodeLib.toDataURL(url.trim(), {
        width: 400, margin: 1,
        color: { dark: "#0e3020", light: "#ffffff" },
      });
      updateQrBlock(blockId, { qrImage: dataUrl });
    } catch (_) {}
  }, []); // eslint-disable-line

  const exportFreeCard = useCallback(async () => {
    const isLand = freeOrientation === "landscape";
    const el = isLand ? freeLandscapeExportRef.current : freeExportRef.current;
    if (!el) return;
    setIsExportingFree(true);
    const fmt = FORMAT_OPTIONS.find(f => f.id === exportFormat)!;
    const cW = isLand ? FREE_CANVAS_W_L : FREE_CANVAS_W;
    const cH = isLand ? FREE_CANVAS_H_L : FREE_CANVAS_H;
    try {
      await new Promise(r => setTimeout(r, 300));
      const canvas = await toCanvas(el, {
        pixelRatio: 1,
        width: cW, height: cH,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const title = freeData.textBlocks[0]?.text || freeData.headerText || "بطاقة-حرة";
      if (fmt.id === "pdf") {
        const pdf = new jsPDF({
          orientation: isLand ? "landscape" : "portrait",
          unit: "px", format: [cW, cH], hotfixes: ["px_scaling"],
        });
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, cW, cH);
        pdf.save(`${toFilename(title, "بطاقة-حرة")}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `${toFilename(title, "بطاقة-حرة")}.${fmt.ext}`;
        link.href = canvas.toDataURL(fmt.mime, fmt.quality);
        link.click();
      }
    } catch (err) { console.error(err); }
    finally { setIsExportingFree(false); }
  }, [exportFormat, freeData, freeOrientation]);

  const activeW = orientation === "portrait" ? CANVAS_W   : CANVAS_W_L;
  const activeH = orientation === "portrait" ? CANVAS_H   : CANVAS_H_L;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / activeW);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [orientation, activeW]);

  const set = <K extends keyof EventAdData>(key: K, value: EventAdData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => ev.target?.result && set("bgImage", ev.target.result as string);
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => ev.target?.result && set("qrCodeImage", ev.target.result as string);
    reader.readAsDataURL(file);
  };

  /* ── Time picker: "HH:MM" → "٩:٣٠ ص" ── */
  const formatEn12 = (raw: string) => {
    if (!raw) return "";
    const [hStr, mStr] = raw.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  const handleTimeChange = (raw: string) => {
    setRawTime(raw);
    set("time", formatEn12(raw).replace("PM", "م").replace("AM", "ص"));
  };

  const handleTimeToChange = (raw: string) => {
    setRawTimeTo(raw);
    set("timeTo", raw ? formatEn12(raw).replace("PM", "م").replace("AM", "ص") : undefined);
  };

  /* ── Date picker: "YYYY-MM-DD" → day name + Hijri formatted date ── */
  const handleDateChange = (raw: string) => {
    setRawDate(raw);
    if (!raw) return;
    const d = new Date(raw + "T12:00:00"); // noon avoids timezone flips
    const dayName = new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(d);
    const dateStr = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
      day: "numeric", month: "numeric", year: "numeric",
    }).format(d);
    set("day",  dayName);
    set("date", dateStr);
  };

  const exportAsImage = useCallback(async () => {
    const el = exportRef.current;
    if (!el) return;
    setIsExporting(true);
    const fmt = FORMAT_OPTIONS.find(f => f.id === exportFormat)!;
    try {
      await new Promise(r => setTimeout(r, 300));
      const canvas = await toCanvas(el, {
        pixelRatio: 1,
        width: activeW,
        height: activeH,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      if (fmt.id === "pdf") {
        const isLandscape = activeW > activeH;
        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "px",
          format: [activeW, activeH],
          hotfixes: ["px_scaling"],
        });
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, activeW, activeH);
        pdf.save(`${toFilename(data.eventTitle, "إعلان-فعالية")}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `${toFilename(data.eventTitle, "إعلان-فعالية")}.${fmt.ext}`;
        link.href = canvas.toDataURL(fmt.mime, fmt.quality);
        link.click();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, activeW, activeH, orientation, data]);

  const isOnline = data.locationType === "teams" || data.locationType === "zoom";

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Export canvases – clipped to zero-size wrapper so the browser renders
          them at position (0,0) and doesn't skip off-screen paint. */}
      <div style={{
        position: "fixed", top: 0, left: 0,
        width: 0, height: 0, overflow: "hidden",
        zIndex: -1, pointerEvents: "none",
      }}>
        <div ref={exportRef} style={{ width: activeW, height: activeH }}>
          {orientation === "portrait"
            ? <EventAdCanvas data={data} />
            : <EventAdLandscapeCanvas data={data} />
          }
        </div>
      </div>

      {/* Free card export canvas — portrait */}
      <div style={{
        position: "fixed", top: 0, left: 0,
        width: 0, height: 0, overflow: "hidden",
        zIndex: -1, pointerEvents: "none",
      }}>
        <div ref={freeExportRef} style={{ width: FREE_CANVAS_W, height: FREE_CANVAS_H }}>
          <FreeCard data={freeData} />
        </div>
      </div>

      {/* Free card export canvas — landscape */}
      <div style={{
        position: "fixed", top: 0, left: 0,
        width: 0, height: 0, overflow: "hidden",
        zIndex: -1, pointerEvents: "none",
      }}>
        <div ref={freeLandscapeExportRef} style={{ width: FREE_CANVAS_W_L, height: FREE_CANVAS_H_L }}>
          <FreeCardLandscape data={freeData} />
        </div>
      </div>

      <div style={{
        position: "fixed", top: 0, left: 0,
        width: 0, height: 0, overflow: "hidden",
        zIndex: -1, pointerEvents: "none",
      }}>
        <div ref={enExportRef} style={{ width: activeW, height: activeH }}>
          {enData && (orientation === "portrait"
            ? <EventAdCanvas data={enData} />
            : <EventAdLandscapeCanvas data={enData} />
          )}
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#0e3020] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div style={{ backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 8, padding: "4px 10px" }}>
            <img src={logoImg} alt="شعار الجامعة"
              style={{ height: 38, display: "block", mixBlendMode: "screen" }} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">مولّد إعلانات الفعاليات</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">

        {/* ── Controls ── */}
        <div className="space-y-4">

          {/* Background image — standard card only */}
          {cardMode === "standard" && <Section title="صورة الخلفية">
            <label htmlFor={bgInputId} data-testid="label-upload"
              className="flex flex-col items-center gap-2 border-2 border-dashed border-primary/40 rounded-lg p-4 cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-all">
              <ImageIcon className="h-6 w-6 text-primary/60" />
              <span className="text-xs text-muted-foreground text-center">
                اضغط لرفع صورة خلفية<br />
                <span className="text-primary font-medium">JPG, PNG, WEBP</span>
              </span>
              <input id={bgInputId} data-testid="input-image" type="file" accept="image/*"
                className="hidden" onChange={handleBgUpload} />
            </label>

            {/* Image pan control — shown after upload */}
            {data.bgImage !== defaultBg && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  اسحب لاختيار الجزء المرئي من الصورة
                </p>
                <ImagePanControl
                  src={data.bgImage}
                  x={data.bgPositionX}
                  y={data.bgPositionY}
                  zoom={data.bgZoom}
                  onChange={(x, y) => setData(prev => ({ ...prev, bgPositionX: x, bgPositionY: y }))}
                  onZoomChange={z => set("bgZoom", z)}
                />
                <button onClick={() => set("bgImage", defaultBg)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← استخدام الصورة الافتراضية
                </button>
              </div>
            )}
          </Section>}

          {/* Card type selector */}
          <Section title="نوع البطاقة">
            <div className="flex gap-2">
              {([
                { id: "standard-invitation",   label: "دعوة",        adMode: "invitation"   },
                { id: "standard-announcement", label: "إعلان",       adMode: "announcement" },
                { id: "free",                  label: "بطاقة حرة",   adMode: null           },
              ] as const).map(opt => {
                const isActive = opt.id === "free"
                  ? cardMode === "free"
                  : cardMode === "standard" && data.adMode === opt.adMode;
                return (
                  <button key={opt.id}
                    onClick={() => {
                      if (opt.id === "free") {
                        setCardMode("free");
                      } else {
                        setCardMode("standard");
                        set("adMode", opt.adMode!);
                      }
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ══ FREE CARD FORM ══ */}
          {cardMode === "free" && (<>

            {/* Free background image */}
            <Section title="صورة الخلفية">
              <label htmlFor={freeBgInputId}
                className="flex flex-col items-center gap-2 border-2 border-dashed border-primary/40 rounded-lg p-4 cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-all">
                <ImageIcon className="h-6 w-6 text-primary/60" />
                <span className="text-xs text-muted-foreground text-center">
                  اضغط لرفع صورة خلفية<br />
                  <span className="text-primary font-medium">JPG, PNG, WEBP</span>
                </span>
                <input id={freeBgInputId} type="file" accept="image/*"
                  className="hidden" onChange={handleFreeBgUpload} />
              </label>
              {freeData.bgImage !== defaultBg && (
                <button onClick={() => setFree("bgImage", defaultBg)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← استخدام الصورة الافتراضية
                </button>
              )}
            </Section>

            {/* Header text (over photo) */}
            <Section title="النص الكبير (فوق الصورة)">
              <Field label="النص" value={freeData.headerText}
                onChange={v => setFree("headerText", v)} hint="مثال: دعوة / إعلان / نتائج" />
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs text-muted-foreground font-medium shrink-0">الحجم</label>
                <input type="range" min={60} max={160} step={2}
                  value={freeData.headerSize}
                  onChange={e => setFree("headerSize", Number(e.target.value))}
                  className="flex-1 accent-primary h-1.5 cursor-pointer" />
                <span className="text-xs text-muted-foreground font-mono w-10 text-left">{freeData.headerSize}px</span>
              </div>
            </Section>

            {/* Text blocks */}
            <Section title="مقاطع النص">
              {freeData.textBlocks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  لا توجد مقاطع بعد — اضغط "إضافة نص"
                </p>
              )}
              {freeData.textBlocks.map((block, idx) => (
                <div key={block.id} className="border border-border rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">نص {idx + 1}</span>
                    <button onClick={() => removeTextBlock(block.id)}
                      className="text-destructive hover:opacity-70 transition-opacity">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Textarea value={block.text}
                    onChange={e => {
                      updateTextBlock(block.id, { text: e.target.value });
                      const t = e.target;
                      t.style.height = "auto";
                      t.style.height = t.scrollHeight + "px";
                    }}
                    placeholder="اكتب النص هنا..." rows={2}
                    className="text-right text-sm resize-none overflow-hidden" />

                  {/* Color + size row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-xs text-muted-foreground shrink-0">اللون</label>
                    <div className="flex gap-1">
                      {BRAND_SWATCHES.map(sw => (
                        <button key={sw.hex} title={sw.label}
                          onClick={() => updateTextBlock(block.id, { color: sw.hex })}
                          style={{ backgroundColor: sw.hex, border: block.color === sw.hex ? "3px solid #5ab8b0" : "2px solid #ccc" }}
                          className="w-6 h-6 rounded-full transition-transform hover:scale-110 shrink-0"
                        />
                      ))}
                    </div>
                    <label className="text-xs text-muted-foreground shrink-0 mr-1">الحجم</label>
                    <input type="range" min={24} max={100} step={2}
                      value={block.fontSize}
                      onChange={e => updateTextBlock(block.id, { fontSize: Number(e.target.value) })}
                      className="w-24 accent-primary h-1.5 cursor-pointer" />
                    <span className="text-xs font-mono text-muted-foreground w-10">{block.fontSize}px</span>
                  </div>

                  {/* Weight buttons */}
                  <div className="flex gap-1">
                    {([
                      { w: 400, label: "عادي" },
                      { w: 600, label: "متوسط" },
                      { w: 700, label: "عريض" },
                      { w: 900, label: "أسود" },
                    ] as const).map(({ w, label }) => (
                      <button key={w}
                        onClick={() => updateTextBlock(block.id, { fontWeight: w })}
                        className={`flex-1 text-xs py-1 rounded-md border transition-all ${
                          block.fontWeight === w
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                        style={{ fontWeight: w }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Alignment buttons */}
                  <div className="flex gap-1">
                    {([
                      { a: "right",  label: "يمين" },
                      { a: "center", label: "وسط"  },
                      { a: "left",   label: "يسار" },
                    ] as const).map(({ a, label }) => (
                      <button key={a}
                        onClick={() => updateTextBlock(block.id, { align: a })}
                        className={`flex-1 text-xs py-1 rounded-md border transition-all ${
                          block.align === a
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={addTextBlock}
                className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 py-2 text-sm text-primary hover:border-primary hover:bg-primary/5 transition-all">
                <Plus className="h-4 w-4" />
                إضافة نص
              </button>
            </Section>

            {/* Time / Date / Venue */}
            <Section title="الوقت والتاريخ والمكان (اختياري)">
              {/* Time picker + optional range */}
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium">الساعة</p>
                  <input
                    type="time"
                    value={freeRawTime}
                    onChange={e => handleFreeTimeChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                    style={{ direction: "ltr", colorScheme: "light" }}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={freeHasTime}
                    onChange={e => {
                      setFreeHasTime(e.target.checked);
                      if (!e.target.checked) {
                        setFreeRawTimeTo("");
                        setFree("timeTo", undefined);
                      }
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">محدد بوقت (من … إلى …)</span>
                </label>
                {freeHasTime && (
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-muted-foreground">إلى الساعة</p>
                    <input
                      type="time"
                      value={freeRawTimeTo}
                      onChange={e => handleFreeTimeToChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                      style={{ direction: "ltr", colorScheme: "light" }}
                    />
                  </div>
                )}
                {freeData.time && (
                  <p className="text-[11px] text-primary font-medium text-right">
                    سيظهر: {freeData.time}{freeData.timeTo ? ` — ${freeData.timeTo}` : ""}
                  </p>
                )}
              </div>

              {/* Date picker + Hijri/Gregorian toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">التاريخ</p>
                  <div className="flex rounded-md overflow-hidden border border-input text-[11px]">
                    {(["hijri", "gregorian"] as const).map(mode => (
                      <button key={mode}
                        onClick={() => {
                          setFreeDateMode(mode);
                          if (freeRawDate) handleFreeDateChange(freeRawDate, mode);
                        }}
                        className={`px-2 py-0.5 transition-colors ${
                          freeDateMode === mode
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {mode === "hijri" ? "هجري" : "ميلادي"}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="date"
                  value={freeRawDate}
                  onChange={e => handleFreeDateChange(e.target.value, freeDateMode)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                  style={{ direction: "ltr", colorScheme: "light" }}
                />
                {freeData.dayDate && (
                  <p className="text-[11px] text-primary font-medium text-right">سيظهر: {freeData.dayDate}</p>
                )}
              </div>

              {/* Venue */}
              <Field label="المكان" value={freeData.venue ?? ""}
                onChange={v => setFree("venue", v)} hint="قاعة المؤتمرات — المبنى الرئيسي" />
            </Section>

            {/* QR codes */}
            <Section title="رموز QR (باركود)">
              {freeData.qrBlocks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  لا توجد باركودات بعد — اضغط "إضافة باركود"
                </p>
              )}
              {freeData.qrBlocks.map((qr, idx) => (
                <FreeQrEditor key={qr.id} qr={qr} idx={idx}
                  onGenerate={url => generateFreeQr(qr.id, url)}
                  onLabelChange={label => updateQrBlock(qr.id, { label })}
                  onRemove={() => removeQrBlock(qr.id)}
                  onUpload={img => updateQrBlock(qr.id, { qrImage: img })}
                />
              ))}
              <button onClick={addQrBlock}
                className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 py-2 text-sm text-primary hover:border-primary hover:bg-primary/5 transition-all">
                <Plus className="h-4 w-4" />
                إضافة باركود
              </button>
            </Section>

          </>)}

          {/* ══ STANDARD CARD FORM ══ */}
          {cardMode === "standard" && (<>

          {/* Event info */}
          <Section title="بيانات الفعالية">
            <Field label='ممثلة بـ (اختياري — اتركه فارغاً لإخفائه)' value={data.representedBy ?? ""}
              onChange={v => set("representedBy", v)}
              hint="وحدة …. / قسم …." />
            <Field label="نوع الفعالية" value={data.eventType}
              onChange={v => set("eventType", v)} multiline
              hint="دورة تدريبية / ورشة عمل / محاضرة علمية" />
            <Field label="عنوان الفعالية" value={data.eventTitle}
              onChange={v => set("eventTitle", v)} multiline />
            <Field label='من تقديم (اختياري)' value={data.presenter ?? ""}
              onChange={v => set("presenter", v)}
              hint="د. فلان / أ. فلانة …" />
          </Section>

          {/* Date & Time */}
          <Section title="التاريخ والوقت">
            {/* ── Time picker + optional range ── */}
            <div className="space-y-2">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">الساعة</p>
                <input
                  type="time"
                  value={rawTime}
                  onChange={e => handleTimeChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-1 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                  style={{ direction: "ltr", colorScheme: "light" }}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasTime}
                  onChange={e => {
                    setHasTime(e.target.checked);
                    if (!e.target.checked) {
                      setRawTimeTo("");
                      set("timeTo", undefined);
                    }
                  }}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-xs text-muted-foreground">محدد بوقت (من … إلى …)</span>
              </label>
              {hasTime && (
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">إلى الساعة</p>
                  <input
                    type="time"
                    value={rawTimeTo}
                    onChange={e => handleTimeToChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-1 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                    style={{ direction: "ltr", colorScheme: "light" }}
                  />
                </div>
              )}
              {data.time && (
                <p className="text-[11px] text-primary font-medium text-right">
                  سيظهر: {data.time}{data.timeTo ? ` — ${data.timeTo}` : ""}
                </p>
              )}
            </div>

            {/* ── Date picker ── */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">التاريخ</p>
              <input
                type="date"
                value={rawDate}
                onChange={e => handleDateChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-1 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                style={{ direction: "ltr", colorScheme: "light" }}
              />
              {data.date && rawDate && (
                <p className="text-[11px] text-primary font-medium text-right">
                  {data.day} — {data.date}
                </p>
              )}
            </div>
          </Section>

          {/* Location type */}
          <Section title="طريقة الحضور">
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "in-person", label: "حضوري",  logo: null,      logoClass: "" },
                { id: "teams",     label: "Teams",   logo: logoTeams, logoClass: "h-7" },
                { id: "zoom",      label: "Zoom",    logo: logoZoom,  logoClass: "h-5" },
              ] as { id: LocationType; label: string; logo: string | null; logoClass: string }[]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => set("locationType", opt.id)}
                  className={`rounded-lg p-3 border-2 transition-all text-sm font-medium flex flex-col items-center gap-1.5 ${
                    data.locationType === opt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {opt.logo
                    ? <img src={opt.logo} alt={opt.label} className={`${opt.logoClass} w-auto object-contain`} />
                    : <span className="text-2xl leading-none">📍</span>
                  }
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* In-person: venue field */}
            {data.locationType === "in-person" && (
              <div className="mt-3">
                <Field label="وصف المكان" value={data.venue} onChange={v => set("venue", v)} />
              </div>
            )}

            {/* Online: QR code — URL input + upload */}
            {isOnline && (
              <div className="mt-3 space-y-2">
                {/* URL → QR + shown in ad */}
                <p className="text-xs text-muted-foreground mb-1">رابط الاجتماع (يظهر في الإعلان ويتحول لـ QR تلقائياً)</p>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <QrCode className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      dir="ltr"
                      placeholder="https://…"
                      value={qrUrl}
                      className="pr-8 text-xs placeholder:text-right"
                      onChange={e => {
                        const v = e.target.value;
                        setQrUrl(v);
                        set("meetingUrl", v);
                        generateQrFromUrl(v);
                      }}
                    />
                  </div>
                  {qrUrl && (
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      onClick={() => { setQrUrl(""); set("meetingUrl", ""); set("qrCodeImage", undefined); }}
                    >✕</button>
                  )}
                </div>

                {/* — or upload — */}
                <label htmlFor={qrInputId}
                  className="flex items-center gap-2 border border-dashed border-primary/30 rounded-lg px-3 py-2 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
                  <span className="text-xs text-muted-foreground">
                    {data.qrCodeImage && !qrUrl
                      ? <span className="text-primary font-medium">✓ تم رفع الباركود — اضغط للتغيير</span>
                      : <span>أو ارفع صورة QR جاهزة</span>
                    }
                  </span>
                  <input id={qrInputId} data-testid="input-qr" type="file" accept="image/*"
                    className="hidden" onChange={e => { setQrUrl(""); handleQrUpload(e); }} />
                </label>

                {data.qrCodeImage && (
                  <button onClick={() => { set("qrCodeImage", undefined); setQrUrl(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    ✕ إزالة الباركود
                  </button>
                )}
              </div>
            )}
          </Section>

          {/* Certificate toggle */}
          <Section title="شهادات الحضور">
            <button
              onClick={() => set("hasCertificate", !data.hasCertificate)}
              className={`w-full rounded-lg p-3 border-2 transition-all flex items-center justify-between ${
                data.hasCertificate
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <span className="font-medium">
                {data.hasCertificate ? "✓ يوجد شهادات حضور" : "لا يوجد شهادات حضور"}
              </span>
            </button>
          </Section>

          </>)} {/* end standard form */}

          {/* ══ EXPORT FORMAT (shared) ══ */}
          <Section title="صيغة الحفظ">
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map(fmt => (
                <button
                  key={fmt.id}
                  data-testid={`format-${fmt.id}`}
                  onClick={() => setExportFormat(fmt.id)}
                  className={`rounded-xl border-2 p-3 transition-all flex flex-col items-center gap-1 ${
                    exportFormat === fmt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <span className="text-sm font-bold tracking-wider">{fmt.label}</span>
                  <span className="text-[10px] text-center text-muted-foreground leading-tight">
                    {fmt.hint}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* ── Free card actions ── */}
            {cardMode === "free" && (
              <div className="flex gap-3">
                <Button onClick={exportFreeCard} disabled={isExportingFree}
                  className="flex-1 gap-2 bg-[#0e3020] hover:bg-[#1a4030] text-white">
                  {isExportingFree ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isExportingFree ? "جاري التصدير..." : `تحميل البطاقة (${FORMAT_OPTIONS.find(f => f.id === exportFormat)?.label})`}
                </Button>
                <Button variant="outline"
                  onClick={() => setFreeData({ ...DEFAULT_FREE_DATA })}
                  className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  إعادة تعيين
                </Button>
              </div>
            )}
            {/* ── Standard card actions ── */}
            {cardMode === "standard" && (
            <>
              <div className="flex gap-3">
                <Button data-testid="button-export" onClick={exportAsImage} disabled={isExporting || isExportingEn}
                  className="flex-1 gap-2 bg-[#0e3020] hover:bg-[#1a4030] text-white">
                  {isExporting
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Download className="h-4 w-4" />}
                  {isExporting
                    ? "جاري التصدير..."
                    : `تحميل ${exportFormat === "pdf" ? "الملف" : "الصورة"} (${FORMAT_OPTIONS.find(f => f.id === exportFormat)?.label})`}
                </Button>
                <Button data-testid="button-reset" variant="outline"
                  onClick={() => {
                    setData({ ...DEFAULT_DATA });
                    setRawTime("");
                    setRawDate("");
                    setQrUrl("");
                  }}
                  className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  إعادة تعيين
                </Button>
              </div>
              <Button
                data-testid="button-export-en"
                onClick={exportAsEnglish}
                disabled={isExporting || isExportingEn}
                variant="outline"
                className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/5"
              >
                {isExportingEn
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : <Download className="h-4 w-4" />}
                {isExportingEn
                  ? "Translating & exporting..."
                  : `Download in English (${FORMAT_OPTIONS.find(f => f.id === exportFormat)?.label})`}
              </Button>
            </>
            )} {/* end standard card actions */}
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="space-y-3">
          <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h2 className="text-sm font-bold">معاينة الإعلان</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                {cardMode === "free"
                  ? (freeOrientation === "landscape" ? "1920 × 1080" : "1080 × 1920")
                  : (orientation === "portrait" ? "1080 × 1920" : "1920 × 1080")} بكسل
              </div>
            </div>

            {/* Orientation toggle — all card types */}
            <div className="flex gap-2 mb-3">
              {(["portrait", "landscape"] as const).map(o => (
                <button
                  key={o}
                  onClick={() => cardMode === "free" ? setFreeOrientation(o) : setOrientation(o)}
                  className={`flex-1 py-2 rounded-lg border-2 text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    (cardMode === "free" ? freeOrientation : orientation) === o
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {o === "portrait"
                    ? <><span style={{ fontSize: 16 }}>▮</span> عمودي (Story)</>
                    : <><span style={{ fontSize: 16 }}>▬</span> أفقي (Landscape)</>
                  }
                </button>
              ))}
            </div>

            {/* Canvas wrapper */}
            <PreviewCanvas
              cardMode={cardMode}
              freeOrientation={freeOrientation}
              orientation={orientation}
              wrapperRef={wrapperRef}
              scale={scale}
              freeData={freeData}
              data={data}
              activeW={activeW}
              activeH={activeH}
            />
          </div>

          <div className="bg-accent/20 border border-accent-border rounded-lg px-4 py-2.5">
            <p className="text-xs text-foreground/70">
              {cardMode === "free"
                ? freeOrientation === "landscape"
                  ? <><strong>أفقي حر:</strong> 1920×1080 بكسل — مناسب للشاشات والعروض التقديمية.</>
                  : <><strong>عمودي حر:</strong> 1080×1920 بكسل — مناسب لقصص سناب شات وإنستغرام.</>
                : orientation === "portrait"
                  ? <><strong>عمودي:</strong> 1080×1920 بكسل — مناسب لقصص سناب شات وإنستغرام.</>
                  : <><strong>أفقي:</strong> 1920×1080 بكسل — مناسب للشاشات والعروض التقديمية.</>
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Preview canvas — isolated to avoid IIFE in JSX ── */
function PreviewCanvas({
  cardMode, freeOrientation, orientation, wrapperRef, scale,
  freeData, data, activeW, activeH,
}: {
  cardMode: "standard" | "free";
  freeOrientation: "portrait" | "landscape";
  orientation: "portrait" | "landscape";
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  freeData: FreeCardData;
  data: EventAdData;
  activeW: number;
  activeH: number;
}) {
  const isFreeLand = cardMode === "free" && freeOrientation === "landscape";
  const isPortrait = cardMode === "free" ? freeOrientation === "portrait" : orientation === "portrait";
  const cW = cardMode === "free" ? (isFreeLand ? FREE_CANVAS_W_L : FREE_CANVAS_W) : activeW;
  const cH = cardMode === "free" ? (isFreeLand ? FREE_CANVAS_H_L : FREE_CANVAS_H) : activeH;
  const wrapperW = wrapperRef.current?.getBoundingClientRect().width ?? 400;
  const previewScale = cardMode === "free" ? wrapperW / cW : scale;

  return (
    <div
      ref={wrapperRef}
      className="w-full bg-muted/30 rounded-lg mx-auto"
      style={{
        aspectRatio: isPortrait ? "9/16" : "16/9",
        position: "relative", overflow: "hidden",
        maxWidth: isPortrait ? 420 : "100%",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0,
        transform: `scale(${previewScale})`,
        transformOrigin: "top left",
        width: cW, height: cH,
        pointerEvents: "none",
      }}>
        {cardMode === "free"
          ? (freeOrientation === "landscape"
              ? <FreeCardLandscape data={freeData} />
              : <FreeCard data={freeData} />)
          : orientation === "portrait"
            ? <EventAdCanvas data={data} />
            : <EventAdLandscapeCanvas data={data} />
        }
      </div>
    </div>
  );
}

/* ── Layout helpers ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-bold mb-3 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ── QR editor row for free card ── */
function FreeQrEditor({ qr, idx, onGenerate, onLabelChange, onRemove, onUpload }: {
  qr: FreeQrBlock;
  idx: number;
  onGenerate: (url: string) => void;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
  onUpload: (dataUrl: string) => void;
}) {
  const [url, setUrl] = useState("");
  const uploadId = useId();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => ev.target?.result && onUpload(ev.target.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-border rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">باركود {idx + 1}</span>
        <button onClick={onRemove} className="text-destructive hover:opacity-70 transition-opacity">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* URL → auto QR */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <QrCode className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input dir="ltr" placeholder="https://…"
            value={url}
            className="pr-8 text-xs placeholder:text-right"
            onChange={e => { setUrl(e.target.value); onGenerate(e.target.value); }} />
        </div>
        {url && (
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            onClick={() => { setUrl(""); onGenerate(""); }}>✕</button>
        )}
      </div>

      {/* Or upload */}
      <label htmlFor={uploadId}
        className="flex items-center gap-2 border border-dashed border-primary/30 rounded-lg px-3 py-1.5 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
        <span className="text-xs text-muted-foreground">
          {qr.qrImage && !url
            ? <span className="text-primary font-medium">✓ تم رفع الباركود — اضغط للتغيير</span>
            : <span>أو ارفع صورة QR جاهزة</span>}
        </span>
        <input id={uploadId} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>

      {/* Label below QR */}
      <Input value={qr.label}
        onChange={e => onLabelChange(e.target.value)}
        placeholder="عنوان الباركود (مثال: للتسجيل)"
        className="text-right text-sm" />

      {/* Preview thumbnail */}
      {qr.qrImage && (
        <div className="flex justify-center">
          <img src={qr.qrImage} alt="QR preview"
            className="w-16 h-16 rounded border border-border object-contain" />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, multiline, hint }: {
  label: string; value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      {hint && (
        <p className="text-[11px] text-primary/70 bg-primary/5 rounded px-2 py-1 leading-relaxed">
          {hint}
        </p>
      )}
      {multiline ? (
        <Textarea value={value}
          onChange={e => {
            onChange(e.target.value);
            const t = e.target;
            t.style.height = "auto";
            t.style.height = t.scrollHeight + "px";
          }}
          placeholder="اكتب هنا..." rows={2}
          className="text-right text-sm resize-none overflow-hidden" />
      ) : (
        <Input value={value} onChange={e => onChange(e.target.value)}
          placeholder="اكتب هنا..." className="text-right text-sm" />
      )}
    </div>
  );
}

