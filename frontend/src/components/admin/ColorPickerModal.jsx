import { useEffect, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

const GRID_COLORS = [
  "#000000","#666666","#999999","#CCCCCC","#FFFFFF",
  "#1E3A8A","#2563EB","#1D4ED8","#60A5FA","#93C5FD",
  "#991B1B","#DC2626","#EF4444","#F87171","#FCA5A5",
  "#065F46","#059669","#10B981","#34D399","#6EE7B7",
  "#92400E","#D97706","#F59E0B","#FBBF24","#FCD34D",
  "#4C1D95","#7C3AED","#8B5CF6","#A78BFA","#C4B5FD",
];

function hexToRgb(hex) {
  const c = hex.replace("#","").trim();
  const m = c.length === 3 ? c.split("").map(ch => ch+ch).join("") : c.padEnd(6,"0").slice(0,6);
  return { r: parseInt(m.slice(0,2),16), g: parseInt(m.slice(2,4),16), b: parseInt(m.slice(4,6),16) };
}
function rgbToHex({r,g,b}) {
  const p = (v)=>Math.min(255,Math.max(0,Math.round(v))).toString(16).padStart(2,"0");
  return `#${p(r)}${p(g)}${p(b)}`;
}

export default function ColorPickerModal({
  isOpen,
  initialHex = "#1E3763",
  initialOpacity = 1,
  onCancel,
  onApply, // (hex, opacity) => void
}) {
  const [tab, setTab] = useState("grid"); // grid | spectrum | sliders
  const [hex, setHex] = useState(initialHex);
  const [opacity, setOpacity] = useState(initialOpacity);
  const rgb = useMemo(()=>hexToRgb(hex),[hex]);
  const [r,setR] = useState(rgb.r), [g,setG] = useState(rgb.g), [b,setB] = useState(rgb.b);

  useEffect(()=>{ // sync sliders when hex changes
    const {r,g,b} = hexToRgb(hex); setR(r); setG(g); setB(b);
  },[hex]);

  useEffect(()=>{
    if (!isOpen) return;
    const onEsc = (e)=> e.key==="Escape" && onCancel?.();
    document.addEventListener("keydown", onEsc);
    return ()=> document.removeEventListener("keydown", onEsc);
  },[isOpen,onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      {/* modal */}
      <div className="relative z-[61] w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1 rounded-full bg-gray-100 p-1">
            {["grid","spectrum","sliders"].map(k=>(
              <button key={k}
                onClick={()=>setTab(k)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  tab===k ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {k==="grid"?"Grid":k==="spectrum"?"Spectrum":"Sliders"}
              </button>
            ))}
          </div>
          <button
            onClick={onCancel}
            className="rounded-full px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* body */}
        {tab==="grid" && (
          <div className="grid grid-cols-10 gap-1">
            {GRID_COLORS.map(c=>(
              <button key={c}
                className="h-7 w-7 rounded-md ring-1 ring-black/10 hover:scale-105 transition"
                style={{background:c}}
                onClick={()=>setHex(c)}
                title={c}
              />
            ))}
          </div>
        )}

        {tab==="spectrum" && (
          <div className="rounded-lg border border-gray-200 p-3">
            <HexColorPicker color={hex} onChange={setHex}/>
          </div>
        )}

        {tab==="sliders" && (
          <div className="space-y-3">
            {[
              {label:"R", value:r, set:setR},
              {label:"G", value:g, set:setG},
              {label:"B", value:b, set:setB},
            ].map(s=>(
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-xs font-medium text-gray-700">
                  <span>{s.label}</span><span>{s.value}</span>
                </div>
                <input type="range" min={0} max={255} value={s.value}
                  onChange={(e)=>{
                    const nv=+e.target.value; s.set(nv);
                    setHex(rgbToHex({ r: s.label==="R"?nv:r, g: s.label==="G"?nv:g, b: s.label==="B"?nv:b }));
                  }}
                  className="w-full accent-gray-800"
                />
              </div>
            ))}
          </div>
        )}

        {/* opacity */}
        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-700">
            <span>Opacity</span><span>{Math.round(opacity*100)}%</span>
          </div>
          <input
            type="range" min={0} max={100} value={Math.round(opacity*100)}
            onChange={(e)=>setOpacity(e.target.value/100)}
            className="w-full accent-gray-800"
          />
        </div>

        {/* footer */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-700">{hex.toUpperCase()}</span>
            <span className="h-6 w-6 rounded-md ring-1 ring-black/10"
                  style={{background:hex, opacity}}/>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              Cancelar
            </button>
            <button onClick={()=>onApply?.(hex,opacity)}
              className="rounded-lg bg-[#1E3763] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16294a]">
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
