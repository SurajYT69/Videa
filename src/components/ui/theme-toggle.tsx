// @ts-nocheck -- vendored 000h library code, written without noUncheckedIndexedAccess (which oovi enables). Its exports stay typed.
// Theme toggle from 000h by Cojeev — MIT licence — docs, variants and the full library: https://cojeev.com/ui/docs/theme-toggle/
// Adapted for oovi: the logic is upstream's, unchanged. The stylesheet at the bottom keeps only
// the rules this toggle uses, scoped to the toggle and mapped onto oovi's tokens, so it sets no
// global colour scheme, fonts or shadow tokens of its own.
"use client";

import * as React from "react";
import { type CSSProperties, useSyncExternalStore } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { animate, type AnimationPlaybackControls, frameSteps, motionValue, type Transition } from "motion";
import { AnimatePresence, type HTMLMotionProps, motion, type Target, type TargetAndTransition, useIsPresent } from "motion/react";
import { twMerge } from "tailwind-merge";

// ---- registry/cojeev/motion/clock.ts (inlined) ----
let time:number|null=null
const drivers=new Set<(time:number|null)=>void>()
const now=()=>time??performance.now()
function registerMotionClock(driver:(time:number|null)=>void){drivers.add(driver);return ()=>{drivers.delete(driver)}}
function getMotionTime(){return now()}
function isMotionClockFrozen(){return time!==null}

// ---- registry/cojeev/motion/settings.ts (inlined) ----
const RUNTIME={cfg:{rest:false,reach:true,merge:true,hold:true,jiggleOn:true,press:true,echo:false,dots:0,grain:.08,sheen:.6,curve:1.2,lobeK:130,lobeZ:1,mergeZ:.8,arcK:40,holdK:80,pressK:170,jiggle:.35,jiggleDecay:1.6,restSpeed:1,drift:1,quality:2.5},
 tier:{pill:{amp:0,reach:3,inside:1.2,press:.02},tile:{amp:0,reach:2.4,inside:1,press:.02},nav:{amp:0,reach:1.2,inside:.5,press:.008},card:{amp:0,reach:1,inside:.4,press:.004},blob:{amp:.006,reach:3,inside:1.2,press:.03}}};
const factoryTiers={pill:{amp:.008,reach:4,inside:2,sig:24,R:80,press:.03,lobes:0,depth:0,asym:0,spread:.55},tile:{amp:.008,reach:3.5,inside:1.6,sig:18,R:64,press:.035,lobes:0,depth:0,asym:0,spread:.55},nav:{amp:.0006,reach:3,inside:1.2,sig:24,R:64,press:.010,lobes:0,depth:0,asym:0,spread:.55},card:{amp:.0003,reach:2.5,inside:.9,sig:44,R:56,press:.004,lobes:0,depth:0,asym:0,spread:.55},blob:{amp:.012,reach:4,inside:1.8,sig:22,R:64,press:.05,lobes:0,depth:0,asym:0,spread:.55},spinner:{amp:.14,reach:0,inside:0,sig:1,R:0,press:0,lobes:0,depth:0,asym:0,spread:.55}};
const factoryCfg={quality:2.5,grain:.12,sheen:1,curve:1,lobeK:90,lobeZ:.9,mergeZ:.62,arcK:26,holdK:55,pressK:140,jiggle:.45,jiggleDecay:1.35,restSpeed:1,drift:1,rest:true,reach:true,merge:true,hold:true,jiggleOn:true,press:true,echo:false,echoOff:6,echoScale:1.04,dots:0};
type MorphConfig = typeof factoryCfg
type TierName = keyof typeof factoryTiers
type Tier = typeof factoryTiers.pill
type ProductCategory = "buttons" | "icons" | "pills" | "cards" | "skeleton"
type Category = ProductCategory | "nav" | "inputs" | "controls" | "surfaces"
type MotionSettings = {v:3;mode:"off"|"subtle";cats:Record<Category,boolean>}
type MorphProfile = {cfg:MorphConfig;TIER:Record<TierName,Tier>}
type FlowVariant = "glide"|"stretch"|"jelly"|"comet"|"drop"|"rubber"|"pebble"|"ripple"|"halo"|"off"
type FlowSettings = {variant:FlowVariant;hover:boolean;speed:number;intensity:number;hoverStrength:number}
type SettingsSnapshot = Readonly<{motion:MotionSettings;flow:FlowSettings;profile:MorphProfile;authored:boolean}>
const MOTION_KEY = "v-motion"
const MORPH_KEY = "v-morph-cfg-v3"
const FLOW_KEY = "v-flow-v1"
const PRODUCT_CATEGORIES:readonly ProductCategory[] = ["buttons","icons","pills","cards","skeleton"]
const FLOW_DEFAULTS:Readonly<FlowSettings> = Object.freeze({variant:"glide",hover:true,speed:1,intensity:1,hoverStrength:1})
const FLOW_CHARACTERS:Record<FlowVariant,{label:string;duration:number;ease:string;land:string;glow?:string}> = {
 glide:{label:"Glide",duration:.24,ease:"cubic-bezier(.2,.8,.2,1)",land:"none"},
 stretch:{label:"Stretch",duration:.3,ease:"cubic-bezier(.3,1.15,.4,1)",land:"vf-land"},
 jelly:{label:"Jelly",duration:.5,ease:"cubic-bezier(.3,1.3,.45,1)",land:"vf-jellyx"},
 comet:{label:"Comet",duration:.34,ease:"cubic-bezier(.2,.8,.2,1)",land:"vf-land"},
 drop:{label:"Ink drop",duration:.3,ease:"cubic-bezier(.3,1.25,.4,1)",land:"vf-bloom"},
 rubber:{label:"Rubber",duration:.36,ease:"cubic-bezier(.3,1.3,.4,1)",land:"vf-land"},
 pebble:{label:"Pebble",duration:.46,ease:"cubic-bezier(.32,1.25,.42,1)",land:"vf-lean"},
 ripple:{label:"Ripple",duration:.36,ease:"cubic-bezier(.2,.8,.2,1)",land:"vf-land",glow:"vf-ring"},
 halo:{label:"Halo",duration:.4,ease:"cubic-bezier(.3,1.2,.4,1)",land:"vf-land",glow:"vf-glow"},
 off:{label:"Off",duration:0,ease:"linear",land:"none"},
}
const defaultSettings:MotionSettings={v:3,mode:"subtle",cats:{buttons:true,icons:true,pills:true,cards:false,skeleton:true,nav:false,inputs:false,controls:false,surfaces:false}}
function runtime():MorphProfile {
 const TIER=structuredClone(factoryTiers)
 for(const name of Object.keys(RUNTIME.tier) as (keyof typeof RUNTIME.tier)[]) Object.assign(TIER[name],RUNTIME.tier[name])
 return {cfg:{...factoryCfg,...RUNTIME.cfg},TIER}
}
function immutable<T>(value:T):T {
 if(value && typeof value==="object"){Object.values(value).forEach(immutable);Object.freeze(value)}
 return value
}
const serverSnapshot:SettingsSnapshot=immutable({motion:structuredClone(defaultSettings),flow:{...FLOW_DEFAULTS},profile:runtime(),authored:false})
let settings=structuredClone(defaultSettings), profile=runtime(), flow={...FLOW_DEFAULTS}, authored=false, loaded=false
let snapshot=serverSnapshot
const listeners=new Set<()=>void>()
let releaseEvents:undefined|(()=>void), dispatching=false
function storage(){try{return typeof window==="undefined"?null:window.localStorage}catch{return null}}
function parse(key:string):unknown {try{return JSON.parse(storage()?.getItem(key)||"null")}catch{return null}}
function record(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==="object"&&!Array.isArray(value)}
function mergeProfile(value:unknown,base:MorphProfile,strict=false):MorphProfile {
 if(!record(value)||(!record(value.cfg)&&!record(value.TIER)))throw new Error("Profile must contain a cfg or TIER object.")
 const next=structuredClone(base)
 if(record(value.cfg)) for(const key of Object.keys(next.cfg) as (keyof MorphConfig)[]){
  const v=value.cfg[key];if(v===undefined)continue
  if(typeof v!==typeof next.cfg[key]||(typeof v==="number"&&!Number.isFinite(v))){if(strict)throw new Error(`Invalid cfg.${key}: expected a finite ${typeof next.cfg[key]}.`);continue}
  Object.assign(next.cfg,{[key]:v})
 }
 if(record(value.TIER))for(const name of Object.keys(next.TIER) as TierName[]){const saved=value.TIER[name];if(!record(saved))continue
  for(const key of Object.keys(next.TIER[name]) as (keyof Tier)[]){const v=saved[key];if(v===undefined)continue
   if(typeof v!=="number"||!Number.isFinite(v)){if(strict)throw new Error(`Invalid TIER.${name}.${key}: expected a finite number.`);continue}
   next.TIER[name][key]=v
  }
 }
 return next
}
function normalizeFlow(value:unknown):FlowSettings {
 const v=record(value)?value:{},number=(key:string,fallback:number,min:number)=>typeof v[key]==="number"&&Number.isFinite(v[key])?Math.max(min,v[key] as number):fallback
 return {variant:typeof v.variant==="string"&&Object.hasOwn(FLOW_CHARACTERS,v.variant)?v.variant as FlowVariant:"glide",hover:typeof v.hover==="boolean"?v.hover:true,speed:number("speed",1,.25),intensity:number("intensity",1,0),hoverStrength:number("hoverStrength",1,0)}
}
function flowToken(name:string,fallback:string,el?:Element){try{return getComputedStyle(el??document.documentElement).getPropertyValue(name).trim()||fallback}catch{return fallback}}
function flowTokenMs(name:string,fallback:number,el?:Element){const v=flowToken(name,"",el),n=parseFloat(v);return Number.isFinite(n)?n*(v.endsWith("ms")?1:1000):fallback}
function applyFlowSettings(){
 if(typeof document==="undefined")return
 const h=document.documentElement,variant=settings.mode==="off"?"off":flow.variant,c=FLOW_CHARACTERS[variant],hover=flow.hover?"on":"off"
 const values:Record<string,string>={"--flow-speed":String(flow.speed),"--flow-intensity":String(flow.intensity),"--flow-hover":String(flow.hoverStrength),
  "--flow-ease":variant==="off"?c.ease:flowToken("--e-flow-"+variant,c.ease),
  "--flow-dur":((variant==="off"?0:flowTokenMs("--t-flow-"+variant,c.duration*1000))/1000/flow.speed).toFixed(3)+"s",
  "--flow-land":c.land,"--flow-glow":c.glow||"none"}
 if(h.dataset.flow!==variant)h.dataset.flow=variant
 if(h.dataset.flowHover!==hover)h.dataset.flowHover=hover
 for(const [name,value] of Object.entries(values))if(h.style.getPropertyValue(name)!==value)h.style.setProperty(name,value)
}
function publish(){
 const next={motion:settings,flow,profile,authored}
 if(JSON.stringify(next)===JSON.stringify(snapshot)){applyFlowSettings();return}
 snapshot=immutable(structuredClone(next));applyFlowSettings();listeners.forEach(fn=>fn())
}
function loadMotionSettings(){
 if(loaded||typeof window==="undefined")return
 loaded=true;settings=structuredClone(defaultSettings);profile=runtime();flow={...FLOW_DEFAULTS};authored=false
 const raw=parse(MOTION_KEY)
 if(record(raw)){
  if(raw.mode==="off"||raw.mode==="subtle")settings.mode=raw.mode
  if(raw.v===3&&record(raw.cats))for(const key of PRODUCT_CATEGORIES)if(typeof raw.cats[key]==="boolean")settings.cats[key]=raw.cats[key]
 }
 flow=normalizeFlow(parse(FLOW_KEY))
 const saved=parse(MORPH_KEY)
 if(saved)try{profile=mergeProfile(saved,{cfg:{...factoryCfg},TIER:structuredClone(factoryTiers)});authored=true}catch{/* Corrupt saved data keeps a usable runtime. */}
 try{for(const key of ["v-alive-settings","v-morph-cfg","v-morph-cfg-v2","v-motion-cfg"])storage()?.removeItem(key)}catch{}
 publish()
}
function getMotionSettings(){loadMotionSettings();return structuredClone(settings)}
function getMorphProfile(){loadMotionSettings();return structuredClone(profile)}
function getFlowSettings(){loadMotionSettings();return {...flow}}
function getSettingsSnapshot(){loadMotionSettings();return snapshot}
function getServerSettingsSnapshot(){return serverSnapshot}
function reloadMotionSettings(){loaded=false;loadMotionSettings()}
function acquireEvents(){
 if(releaseEvents||typeof window==="undefined")return
 const onStorage=(event:StorageEvent)=>{if(event.key===null||[MOTION_KEY,MORPH_KEY,FLOW_KEY].includes(event.key))reloadMotionSettings()}
 const onEngine=()=>{if(!dispatching)reloadMotionSettings()}
 window.addEventListener("storage",onStorage);window.addEventListener("v-motion-change",onEngine);window.addEventListener("v-flow",onEngine)
 releaseEvents=()=>{window.removeEventListener("storage",onStorage);window.removeEventListener("v-motion-change",onEngine);window.removeEventListener("v-flow",onEngine);releaseEvents=undefined}
}
function subscribeSettings(fn:()=>void){loadMotionSettings();listeners.add(fn);acquireEvents();return ()=>{listeners.delete(fn);if(!listeners.size)releaseEvents?.()}}
const subscribeMotion=subscribeSettings

// ---- registry/cojeev/motion/use-reduced-motion.ts (inlined) ----
let query:MediaQueryList|undefined
const listeners_UseReducedMotion=new Set<()=>void>()
const changed=()=>listeners_UseReducedMotion.forEach(listener=>listener())
function media(){return query??=window.matchMedia('(prefers-reduced-motion: reduce)')}
function subscribe(listener:()=>void){
 const q=media();if(!listeners_UseReducedMotion.size)q.addEventListener('change',changed);listeners_UseReducedMotion.add(listener)
 return ()=>{listeners_UseReducedMotion.delete(listener);if(!listeners_UseReducedMotion.size){q.removeEventListener('change',changed);query=undefined}}
}
function snapshot_UseReducedMotion(){return typeof window==='undefined'?false:media().matches}
const serverSnapshot_UseReducedMotion=()=>false
function useReducedMotion(){return useSyncExternalStore(subscribe,snapshot_UseReducedMotion,serverSnapshot_UseReducedMotion)}

// ---- registry/cojeev/motion/choreography.ts (inlined) ----
const motionTokens = {
  spring: {
    responsive: { type: "spring", stiffness: 360, damping: 32, mass: .85 },
    expressive: { type: "spring", stiffness: 260, damping: 22, mass: 1 },
    gentle: { type: "spring", stiffness: 180, damping: 28, mass: 1 },
  },
  ease: { enter: [.2, .8, .2, 1], exit: [.4, 0, 1, 1], settle: [.2, .65, .25, 1] },
  duration: { quick: .16, enter: .32, exit: .18 },
  stagger: .035,
} as const;
const isQuiet = (snapshot: SettingsSnapshot) => snapshot.motion.mode === "off" || snapshot.flow.variant === "off";
function resolveChoreography(snapshot: SettingsSnapshot, reduced: boolean): { quiet: boolean; transition: Transition } {
  const quiet = reduced || isQuiet(snapshot);
  if (quiet) return { quiet, transition: { duration: 0, delay: 0 } };
  const speed = snapshot.flow.speed;
  const spring = ["jelly", "rubber", "drop", "pebble"].includes(snapshot.flow.variant)
    ? motionTokens.spring.expressive : motionTokens.spring.responsive;
  return { quiet, transition: { ...spring, stiffness: spring.stiffness * speed * speed, damping: spring.damping * speed } };
}
function useChoreography() {
  const snapshot = React.useSyncExternalStore(subscribeSettings, getSettingsSnapshot, getServerSettingsSnapshot);
  const reduced = useReducedMotion();
  return React.useMemo(() => resolveChoreography(snapshot, reduced), [snapshot, reduced]);
}
function trackMotion(controls: AnimationPlaybackControls) {
  let origin = getMotionTime() - controls.time * 1000;
  let frozen = isMotionClockFrozen();
  if (frozen) controls.pause();
  const release = registerMotionClock(time => {
    if (time === null) {
      if (frozen) controls.play();
      frozen = false;
      return;
    }
    if (!frozen) {
      origin = time - controls.time * 1000;
      controls.pause();
      frozen = true;
    }
    controls.time = Math.max(0, time - origin) / 1000;
    if (controls.time >= controls.duration) controls.complete();
    frameSteps.update.process({ delta: 0, timestamp: performance.now(), isProcessing: false });
  });
  void controls.finished.then(release, release);
  return () => { release(); controls.stop(); };
}
function createMotionLane(initial: number, render: (value: number) => void) {
  const value = motionValue(initial);
  const unsubscribe = value.on("change", render);
  let cancel = () => {};
  let generation = 0;
  const stop = () => { generation++; cancel(); cancel = () => {}; value.stop(); };
  const jump = (target: number) => { stop(); value.jump(target); render(target); };
  return {
    get: () => value.get(),
    jump,
    to(target: number, transition: Transition, complete?: () => void) {
      stop();
      if (transition.duration === 0) { jump(target); complete?.(); return; }
      const owner = generation;
      const controls = animate(value, target, {
        ...transition,
        autoplay: !isMotionClockFrozen(),
        onComplete: () => { if (generation === owner) complete?.(); },
      });
      cancel = trackMotion(controls);
    },
    stop,
    dispose: () => { stop(); unsubscribe(); value.destroy(); },
  };
}

// ---- registry/cojeev/motion/use-motion-visibility.ts (inlined) ----
function subscribePreferences(listener: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    media.removeEventListener("change", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}
function readPreferences() {
  return document.visibilityState === "visible" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function useMotionVisibility(ref: React.RefObject<Element | null>, mountedElement?: Element | null) {
  const { motion, flow } = React.useSyncExternalStore(subscribeSettings, getSettingsSnapshot, getServerSettingsSnapshot);
  const permitted = React.useSyncExternalStore(subscribePreferences, readPreferences, () => false);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const element = mountedElement ?? ref.current;
    if (!element) { setInView(false); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, mountedElement]);
  return { enabled: permitted && motion.mode !== "off" && flow.variant !== "off", inView };
}

// ---- registry/cojeev/motion/refs.ts (inlined) ----
function assignMotionRef<T>(ref:React.Ref<T>|undefined,value:T|null):()=>void{
 if(typeof ref==='function'){
  const cleanup=ref(value)
  return ()=>{if(typeof cleanup==='function')cleanup();else ref(null)}
 }
 if(ref)ref.current=value
 return ()=>{if(ref)ref.current=null}
}

// ---- registry/cojeev/lib/utils.ts (inlined) ----
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- registry/cojeev/ui/spinner.tsx (inlined) ----
const SpinnerVariants = cva(
  "v-pulse [display:inline-grid] [place-items:center] [width:var(--pulse,34px)] [height:var(--pulse,34px)] [position:relative]",
  {
    variants: {
      variant: { default: "", point: "-point" },
      size: { default: "" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
function seedPath(radius: (angle: number) => number) {
  return (
    "M" +
    Array.from({ length: 64 }, (_, i) => {
      const angle = (i / 64) * Math.PI * 2;
      const r = radius(angle);
      return `${(50 + r * Math.cos(angle)).toFixed(2)} ${(50 + r * Math.sin(angle)).toFixed(2)}`;
    }).join("L") +
    "Z"
  );
}
const pebble = seedPath(
  (t) => 41 + 2.4 * Math.cos(3 * t + 0.6) + 1.4 * Math.sin(5 * t),
);
const star = seedPath(
  (t) => 21 + 23 * Math.pow(Math.abs(Math.cos(2 * t)), 1.9),
);
const puff = seedPath((t) => 36 + 6 * Math.abs(Math.cos(4 * t)));
const point = seedPath(
  (t) => 12 + 32 * Math.pow(Math.abs(Math.cos(2 * t)), 2.4),
);
const pointSoft = seedPath(
  (t) => 16 + 28 * Math.pow(Math.abs(Math.cos(2 * t)), 2.2),
);
type SpinnerAppearance = "bloom" | "orbit" | "relay";
type SpinnerProps = React.ComponentProps<"span"> &
  VariantProps<typeof SpinnerVariants> & {
    label?: string;
    appearance?: SpinnerAppearance;
    paused?: boolean;
  };
function Spinner({
  ref,
  className,
  variant,
  size,
  label,
  children,
  appearance = "bloom",
  paused = false,
  ...props
}: SpinnerProps) {
  const host = React.useRef<HTMLSpanElement>(null);
  const { enabled, inView } = useMotionVisibility(host);
  const active =
    enabled &&
    inView &&
    !paused &&
    !className?.split(/\s+/).includes("-paused");
  const attach = React.useCallback(
    (element: HTMLSpanElement | null) => {
      host.current = element;
      const release = assignMotionRef(ref, element);
      return () => {
        host.current = null;
        release();
      };
    },
    [ref],
  );
  const pointed = variant === "point",
    still = pointed ? point : star;
  const caption =
    label ??
    ((props as Record<string, unknown>)["data-label"] as string | undefined);
  return (
    <span
      ref={attach}
      role="status"
      aria-label={caption || "Working"}
      data-slot="spinner"
      data-part="root"
      data-appearance={appearance}
      data-paused={paused || undefined}
      data-animated={active || undefined}
      className={cn(SpinnerVariants({ variant, size }), className)}
      {...props}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {appearance === "bloom" ? (
          <>
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: active ? [0, 360] : 0 }}
              transition={
                active
                  ? { duration: 16, repeat: Infinity, ease: "linear" }
                  : { duration: 0 }
              }
              style={{ transformOrigin: "50% 50%", transformBox: "view-box" }}
            >
              <motion.path
                className="seed"
                initial={{ d: still }}
                d={still}
                animate={{
                  d: active
                    ? pointed
                      ? [point, pointSoft, point]
                      : [pebble, star, star, puff, pebble]
                    : still,
                }}
                transition={
                  active
                    ? {
                        duration: pointed ? 2.8 : 4.2,
                        repeat: Infinity,
                        times: pointed ? [0, 0.5, 1] : [0, 0.3, 0.45, 0.75, 1],
                        ease: [...motionTokens.ease.settle],
                      }
                    : { duration: 0 }
                }
              />
            </motion.g>
            <motion.circle
              className="core"
              cx="50"
              cy="50"
              r="5"
              initial={{ scale: 1 }}
              animate={{ scale: active ? [1, 0.6, 1] : 1 }}
              transition={
                active
                  ? { duration: 2.1, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
              style={{ transformOrigin: "50% 50%", transformBox: "view-box" }}
            />
          </>
        ) : appearance === "orbit" ? (
          <>
            <circle className="v-pulse__orbit" cx="50" cy="50" r="33" />
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: active ? [0, 360] : 0 }}
              transition={
                active
                  ? { duration: 3.6, repeat: Infinity, ease: "linear" }
                  : { duration: 0 }
              }
              style={{ transformOrigin: "50% 50%", transformBox: "view-box" }}
            >
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`rotate(${i * 120} 50 50)`}>
                  <ellipse
                    className={`v-pulse__mark v-pulse__mark--${i}`}
                    cx="50"
                    cy="17"
                    rx={9 - i * 2}
                    ry={12 - i * 2}
                  />
                </g>
              ))}
            </motion.g>
            <path
              className="v-pulse__hub"
              d="M50 39Q51 49 61 50Q51 51 50 61Q49 51 39 50Q49 49 50 39Z"
            />
          </>
        ) : (
          <>
            <path className="v-pulse__orbit" d="M15 58H85" />
            {[0, 1, 2].map((i) => (
              <motion.rect
                key={i}
                className={`v-pulse__mark v-pulse__mark--${i}`}
                x={9 + i * 30}
                y="39"
                width="22"
                height="28"
                rx="10"
                initial={{ y: 0, rx: 10, opacity: 1 }}
                animate={{
                  y: active ? [0, -15, 0] : 0,
                  rx: active ? [10, 5, 10] : 10,
                  opacity: active ? [0.45, 1, 0.45] : 1,
                }}
                transition={
                  active
                    ? {
                        duration: 1.8,
                        repeat: Infinity,
                        delay: i * 0.22,
                        ease: [...motionTokens.ease.settle],
                      }
                    : { duration: 0 }
                }
              />
            ))}
          </>
        )}
      </svg>
      {caption && <SpinnerLabel>{caption}</SpinnerLabel>}
      {children}
    </span>
  );
}
const SpinnerLabelVariants = cva(
  "v-pulse__label [font-weight:var(--fw-medium)] [color:var(--v-text-2)] [opacity:1] [position:absolute] [inset:auto_auto_-20px_50%] [transform:translateX(-50%)] [font-size:var(--fs-caps)] [white-space:nowrap]",
  {
    variants: { variant: { default: "" }, size: { default: "" } },
    defaultVariants: { variant: "default", size: "default" },
  },
);
type SpinnerLabelProps = React.ComponentProps<"span"> &
  VariantProps<typeof SpinnerLabelVariants>;
function SpinnerLabel({
  className,
  variant,
  size,
  ...props
}: SpinnerLabelProps) {
  return (
    <span
      data-slot="spinner-label"
      data-part="label"
      className={cn(SpinnerLabelVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// ---- registry/cojeev/ui/presence.tsx (inlined) ----
const shown = { opacity: 1, "--presence-x": "0px", "--presence-y": "0px", "--presence-scale": 1 };
const presencePresets = {
  fade: { initial: { ...shown, opacity: 0 }, animate: shown, exit: { ...shown, opacity: 0 } },
  rise: { initial: { ...shown, opacity: 0, "--presence-y": "10px" }, animate: shown, exit: { ...shown, opacity: 0, "--presence-y": "-6px" } },
  slide: { initial: { ...shown, opacity: 0, "--presence-x": "16px" }, animate: shown, exit: { ...shown, opacity: 0, "--presence-x": "-10px" } },
  scale: { initial: { ...shown, opacity: 0, "--presence-scale": .96 }, animate: shown, exit: { ...shown, opacity: 0, "--presence-scale": .985 } },
  settle: { initial: { ...shown, opacity: 0, "--presence-y": "6px", "--presence-scale": 1.04 }, animate: shown, exit: { ...shown, opacity: 0, "--presence-y": "-5px", "--presence-scale": .94 } },
  soften: { initial: { ...shown, opacity: 0, "--presence-y": "8px", "--presence-blur": "5px" }, animate: { ...shown, "--presence-blur": "0px" }, exit: { ...shown, opacity: 0, "--presence-y": "-10px", "--presence-blur": "6px" } },
  focus: { initial: { ...shown, opacity: 0, "--presence-y": "10px", "--presence-scale": 1.015, "--presence-blur": "9px" }, animate: { ...shown, "--presence-blur": "0px" }, exit: { ...shown, opacity: 0, "--presence-y": "-8px", "--presence-blur": "7px" } },
  mask: {
    initial: { ...shown, opacity: 0, clipPath: "inset(0% 0% 100% 0% round 16px)" },
    animate: { ...shown, clipPath: "inset(0% 0% 0% 0% round 16px)" },
    exit: { ...shown, opacity: 0, clipPath: "inset(0% 0% 100% 0% round 16px)" },
  },
} satisfies Record<string, { initial: Target; animate: Target; exit: Target }>;
type PresencePreset = keyof typeof presencePresets;
type MotionPresenceProps = React.ComponentProps<typeof AnimatePresence>;
function MotionPresence({ initial = false, ...props }: MotionPresenceProps) {
  const { quiet } = useChoreography();
  return <AnimatePresence initial={quiet ? false : initial} {...props} />;
}
const MotionSlot = motion.create(Slot);
type MotionSurfaceProps = HTMLMotionProps<"div"> & {
  "data-slot"?: string;
  asChild?: boolean;
  preset?: PresencePreset;
  delay?: number;
  exitDelay?: number;
  exitDuration?: number;
};
function MotionSurface({
  asChild = false, preset = "rise", delay = 0, exitDelay = 0, exitDuration, className,
  initial, animate, exit, transition: suppliedTransition, ...props
}: MotionSurfaceProps) {
  const { quiet, transition } = useChoreography();
  const isPresent = useIsPresent();
  const states = presencePresets[preset];
  const Element = asChild ? MotionSlot : motion.div;
  const entrance = { ...transition, delay: Math.max(0, Number.isFinite(delay) ? delay : 0), ...suppliedTransition };
  const soft = ["soften", "focus", "settle"].includes(preset);
  const exitTime = exitDuration === undefined || !Number.isFinite(exitDuration) ? soft ? .42 : motionTokens.duration.exit : Math.min(2, Math.max(0, exitDuration));
  const exitState: TargetAndTransition = { ...states.exit, transition: { duration: exitTime, delay: Number.isFinite(exitDelay) ? Math.min(.6, Math.max(0, exitDelay)) : 0, ease: [...(soft ? motionTokens.ease.settle : motionTokens.ease.exit)] } };
  const children = !isPresent && asChild && React.isValidElement(props.children)
    ? React.cloneElement(props.children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, { inert: true, "aria-hidden": true })
    : props.children;
  return <Element
    {...props}
    {...(asChild ? {} : { "data-slot": props["data-slot"] ?? "motion-surface" })}
    data-motion-surface={preset}
    data-motion-quiet={quiet ? "true" : undefined}
    data-motion-exiting={!isPresent ? "true" : undefined}
    inert={!isPresent || props.inert || undefined}
    aria-hidden={!isPresent ? true : props["aria-hidden"]}
    className={cn("v-motion-surface", className)}
    initial={quiet ? false : initial ?? states.initial}
    animate={quiet ? states.animate : animate ?? states.animate}
    exit={quiet ? { ...states.animate, transition: { duration: 0, delay: 0 } } : exit ?? exitState}
    transition={quiet ? { duration: 0, delay: 0 } : entrance}
  >{children}</Element>;
}

// ---- registry/cojeev/motion/flow.ts (inlined) ----
type Group={element:HTMLElement;place:(animate?:boolean)=>void;resolve:()=>void;dispose:()=>void}
const groups=new Map<HTMLElement,Group>()
let users=0,releaseEnvironment=()=>{},trigger:null|{x:number;y:number;t:number}=null
function isFlowQuiet(el?:HTMLElement){return getMotionSettings().mode==='off'||getFlowSettings().variant==='off'||(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches)||!!el?.closest('[data-flow="off"],[data-no-glide]')}
function acquireFlowEnvironment(){
 if(users++===0){
  const ac=new AbortController(),opts={signal:ac.signal,capture:true},rm=matchMedia('(prefers-reduced-motion: reduce)')
  const refresh=()=>{applyFlowSettings();groups.forEach(group=>group.resolve())}
  window.addEventListener('pointerdown',event=>{trigger={x:event.clientX,y:event.clientY,t:getMotionTime()}},opts)
  window.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target instanceof Element){const r=event.target.getBoundingClientRect();trigger={x:r.left+r.width/2,y:r.top+r.height/2,t:getMotionTime()}}},opts)
  window.addEventListener('resize',()=>replaceFlow(),{signal:ac.signal,passive:true})
  document.addEventListener('visibilitychange',()=>groups.forEach(group=>group.resolve()),{signal:ac.signal})
  rm.addEventListener('change',refresh,{signal:ac.signal})
  const unsubscribe=subscribeSettings(refresh);applyFlowSettings()
  releaseEnvironment=()=>{ac.abort();unsubscribe();trigger=null}
 }
 let released=false;return ()=>{if(released)return;released=true;if(--users===0)releaseEnvironment()}
}
function replaceFlow(root?:HTMLElement){groups.forEach(group=>{if(!root||group.element===root||root.contains(group.element))group.place(false)})}
const pulses=new WeakMap<HTMLElement,()=>void>()
function cancelFlowPulse(el:HTMLElement){pulses.get(el)?.();pulses.delete(el)}
function pulseFlow(el:HTMLElement){
 cancelFlowPulse(el)
 if(isFlowQuiet(el)||document.hidden||el.closest('.v-glide')||el.matches(':disabled,[aria-disabled="true"],[data-disabled]:not([data-disabled="false"])')||el.closest('[inert],[hidden]'))return
 const surface=el.hasAttribute('data-stable-hit')?el.querySelector<SVGElement>('svg.v-morph'):el
 if(!surface)return
 const scale=surface.style.getPropertyValue('scale'),intensity=Math.min(getFlowSettings().intensity,2)
 let active=true
 const lane=createMotionLane(.975,value=>{if(active)surface.style.setProperty('scale',String(1+(value-1)*intensity))})
 const cleanup=()=>{if(!active)return;active=false;lane.dispose();if(scale)surface.style.setProperty('scale',scale);else surface.style.removeProperty('scale');pulses.delete(el)}
 pulses.set(el,cleanup)
 lane.to(1,resolveChoreography(getSettingsSnapshot(),false).transition,cleanup)
}

// ---- registry/cojeev/motion/flow-press.ts (inlined) ----
const semanticStateTransitions=new Set(['checked:unchecked','unchecked:checked','on:off','off:on','open:closed','closed:open'])
function useFlowPress<T extends HTMLElement>(externalRef?:React.Ref<T>):React.RefCallback<T>{
 return React.useCallback((el:T|null)=>{
  let externalCleanup:void|(()=>void)
  if(typeof externalRef==='function')externalCleanup=externalRef(el);else if(externalRef)externalRef.current=el
  if(!el)return
  const release=acquireFlowEnvironment(),ac=new AbortController(),options={capture:true,signal:ac.signal},touched=new Map<HTMLElement,{attribute:string|null;styles:Map<string,string>}>()
  const pulse=(target:HTMLElement)=>{
   if(!touched.has(target))touched.set(target,{attribute:target.getAttribute('data-flow-land'),styles:new Map(['--flow-ease','--flow-dur','--flow-land','--flow-glow'].map(key=>[key,target.style.getPropertyValue(key)]))})
   pulseFlow(target)
  }
  const restore=()=>{for(const [target,old]of touched){cancelFlowPulse(target);if(old.attribute===null)target.removeAttribute('data-flow-land');else target.setAttribute('data-flow-land',old.attribute);for(const [key,value]of old.styles){if(value)target.style.setProperty(key,value);else target.style.removeProperty(key)}}touched.clear()}
  const change=(event:Event)=>{const target=event.target
   if(el.matches('.v-slider,.v-sliderwrap')||target instanceof Element&&target.matches('.v-slider,[role="slider"]')){const output=el.closest('.v-sliderwrap')?.querySelector<HTMLElement>('output');if(output)pulse(output);return}
   if(target instanceof HTMLElement&&target.matches('input[type="checkbox"],input[type="radio"]')){const host=target.closest<HTMLElement>('.v-switch,.v-check,.v-radio,.v-iradio,.v-quest__opt');pulse(host?.matches('.v-check,.v-radio')?target:host??el)}else pulse(el)
  }
  el.addEventListener('pointerup',()=>pulse(el),options)
  el.addEventListener('keyup',event=>{if(event.key==='Enter'||event.key===' ')pulse(el)},options)
  el.addEventListener('change',change,options);el.addEventListener('input',change,options)
  const states=new MutationObserver(records=>{
   if(el.matches(':disabled,[aria-disabled="true"],[data-disabled]:not([data-disabled="false"]),[inert],[hidden]')){restore();return}
   const nextValues=new Map<string,string|null>();let changed=false
   for(let index=records.length-1;index>=0;index--){const record=records[index],name=record.attributeName;if(record.target!==el||!name)continue
    const next=nextValues.has(name)?nextValues.get(name)!:el.getAttribute(name);nextValues.set(name,record.oldValue)
    if(name==='data-state')changed ||= semanticStateTransitions.has(`${record.oldValue}:${next}`)
    else if(name==='aria-checked'||name==='aria-pressed')changed ||= record.oldValue!==next
   }
   if(changed)pulse(el)
  })
  states.observe(el,{attributes:true,attributeOldValue:true,attributeFilter:['data-state','aria-checked','aria-pressed','disabled','aria-disabled','data-disabled','inert','hidden']})
  const rm=matchMedia('(prefers-reduced-motion: reduce)'),quiet=()=>{if(isFlowQuiet(el)||document.hidden)restore()}
  rm.addEventListener('change',quiet,{signal:ac.signal});document.addEventListener('visibilitychange',quiet,{signal:ac.signal});const unsubscribe=subscribeSettings(quiet)
  return ()=>{ac.abort();states.disconnect();unsubscribe();restore();release();if(typeof externalCleanup==='function')externalCleanup();else if(typeof externalRef==='function')externalRef(null);else if(externalRef)externalRef.current=null}
 },[externalRef])
}

// ---- registry/cojeev/motion/geometry.ts (inlined) ----
type Spring = {x:number;v:number;to:number;k:number;z:number}
type Rim = number[][] & {per:number;poly?:boolean}
function rim(w:number,h:number,r:number,step:number){const sw=Math.max(0,w-2*r),sh=Math.max(0,h-2*r),qa=Math.PI*r/2,per=2*sw+2*sh+4*qa,n=Math.max(64,Math.min(320,Math.round(per/step))),out=[] as unknown as Rim;
for(let i=0;i<n;i++){let d=(i/n)*per;const arc=d;let x,y,nx,ny;
if(d<sw){x=r+d;y=0;nx=0;ny=-1}else if((d-=sw)<qa){const a=-Math.PI/2+d/r;x=w-r+r*Math.cos(a);y=r+r*Math.sin(a);nx=Math.cos(a);ny=Math.sin(a)}
else if((d-=qa)<sh){x=w;y=r+d;nx=1;ny=0}else if((d-=sh)<qa){const a=d/r;x=w-r+r*Math.cos(a);y=h-r+r*Math.sin(a);nx=Math.cos(a);ny=Math.sin(a)}
else if((d-=qa)<sw){x=w-r-d;y=h;nx=0;ny=1}else if((d-=sw)<qa){const a=Math.PI/2+d/r;x=r+r*Math.cos(a);y=h-r+r*Math.sin(a);nx=Math.cos(a);ny=Math.sin(a)}
else if((d-=qa)<sh){x=0;y=h-r-d;nx=-1;ny=0}else{d-=sh;const a=Math.PI+d/r;x=r+r*Math.cos(a);y=r+r*Math.sin(a);nx=Math.cos(a);ny=Math.sin(a)}
out.push([x,y,nx,ny,arc])}out.per=per;return out}
const f2=(v:number)=>v.toFixed(2);
function path_Geometry(p:number[][],poly=false){const n=p.length;if(poly){let d='M'+f2(p[0][0])+' '+f2(p[0][1]);for(let i=1;i<n;i++)d+='L'+f2(p[i][0])+' '+f2(p[i][1]);return d+'Z'}
let d='';for(let i=0;i<n;i++){const p0=p[(i-1+n)%n],p1=p[i],p2=p[(i+1)%n],p3=p[(i+2)%n];d+=(i?'':`M${f2(p1[0])} ${f2(p1[1])}`)+`C${f2(p1[0]+(p2[0]-p0[0])/6)} ${f2(p1[1]+(p2[1]-p0[1])/6)} ${f2(p2[0]-(p3[0]-p1[0])/6)} ${f2(p2[1]-(p3[1]-p1[1])/6)} ${f2(p2[0])} ${f2(p2[1])}`}return d+'Z'}
const SETTLE=.0008;
const spring=(s:Spring,dt:number)=>{const k=s.k||120,c=2*Math.sqrt(k)*(s.z??1);let t=Math.min(dt,.1);while(t>0){const h=Math.min(.004,t);s.v+=((s.to-s.x)*k-s.v*c)*h;s.x+=s.v*h;t-=h}if(Math.abs(s.to-s.x)<SETTLE&&Math.abs(s.v)<SETTLE){s.x=s.to;s.v=0}};

// ---- registry/cojeev/lib/signature-shapes.ts (inlined) ----
type Point = readonly [number, number];
const tau = Math.PI * 2;
function shapeContour(sample: (angle: number) => Point) {
  const points = Array.from({ length: 96 }, (_, i) => sample(i / 96 * tau));
  const f = (n: number) => Number(n.toFixed(3));
  let path = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length; i++) {
    const before = points[(i + 95) % 96], a = points[i], b = points[(i + 1) % 96], after = points[(i + 2) % 96];
    path += `C${f(a[0] + (b[0] - before[0]) / 6)} ${f(a[1] + (b[1] - before[1]) / 6)} ${f(b[0] - (after[0] - a[0]) / 6)} ${f(b[1] - (after[1] - a[1]) / 6)} ${f(b[0])} ${f(b[1])}`;
  }
  return path + "Z";
}
const radial = (radius: (angle: number) => number, sx = 1, sy = 1) => shapeContour(t => [50 + radius(t) * Math.cos(t) * sx, 50 + radius(t) * Math.sin(t) * sy]);
const signatureShapePaths = {
  "daisy-12": radial(t => 35 + 10 * Math.cos(12 * t)),
  "petal-7": radial(t => 32 + 14 * Math.cos(7 * t)),
  "aster-9": radial(t => 29 + 16 * Math.pow((1 + Math.cos(9 * t)) / 2, 1.6)),
  "sunburst-24": radial(t => 39 + 7 * Math.cos(24 * t)),
  "clover-soft": radial(t => 35 + 10 * Math.cos(4 * t)),
  "cloud-3": radial(t => 37 + 7 * Math.cos(3 * t - .8), 1, .82),
  "pebble-soft": radial(t => 38 + 5 * Math.cos(3 * t + .6) + 2 * Math.sin(5 * t)),
  "pebble-tall": radial(t => 38 + 5 * Math.cos(3 * t + .2) + 2 * Math.sin(2 * t), .68, 1),
  "ribbon-soft": radial(t => 29 + 15 * Math.cos(2 * t) + 2 * Math.sin(5 * t), 1, .82),
  "scalloped-square": radial(t => (36 / Math.pow(Math.pow(Math.abs(Math.cos(t)), 6) + Math.pow(Math.abs(Math.sin(t)), 6), 1 / 6)) + 2.2 * Math.cos(16 * t)),
  "cushion": radial(t => 37 - 5 * Math.cos(4 * t) + 1.5 * Math.cos(8 * t)),
  "seed-wing": radial(t => 34 + 8 * Math.cos(3 * t) + 4 * Math.sin(2 * t)),
} as const;

// ---- registry/cojeev/motion/shapes.ts (inlined) ----
const star_Shapes=(n:number,ro:number,ri:number)=>{const a=[];for(let i=0;i<n*2;i++){const r=i%2?ri:ro,t=-Math.PI/2+i*Math.PI/n;a.push([50+r*Math.cos(t),50+r*Math.sin(t)])}return 'M'+a.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')+'Z'};
const polar=(f:(th:number)=>number)=>(t:number)=>{const th=t*Math.PI*2;const r=f(th);return [50+r*Math.cos(th),50+r*Math.sin(th)]};
const SHAPES:Record<string,string|((t:number)=>number[])>={
...signatureShapePaths,
heart:'M50 90C22 68 6 52 6 33A20 20 0 0 1 50 21A20 20 0 0 1 94 33C94 52 78 68 50 90Z',
crescent:'M60 5A45 45 0 1 0 60 95A50 50 0 0 1 60 5Z',
'star-8':star_Shapes(8,48,30),'star-5':star_Shapes(5,48,22),'star-6':star_Shapes(6,48,28),
'star-4':'M50 2Q58 42 98 50Q58 58 50 98Q42 58 2 50Q42 42 50 2Z',
'blob-4':'M50 4C62 4 70 14 70 24C70 30 66 34 66 34C66 34 70 30 76 30C86 30 96 38 96 50C96 62 86 70 76 70C70 70 66 66 66 66C66 66 70 70 70 76C70 86 62 96 50 96C38 96 30 86 30 76C30 70 34 66 34 66C34 66 30 70 24 70C14 70 4 62 4 50C4 38 14 30 24 30C30 30 34 34 34 34C34 34 30 30 30 24C30 14 38 4 50 4Z',
cross:'M36 4H64Q68 4 68 8V32H92Q96 32 96 36V64Q96 68 92 68H68V92Q68 96 64 96H36Q32 96 32 92V68H8Q4 68 4 64V36Q4 32 8 32H32V8Q32 4 36 4Z',
droplet:'M50 4C50 4 12 46 12 64A38 38 0 0 0 88 64C88 46 50 4 50 4Z',
circle:'M50 4A46 46 0 1 1 49.99 4Z',
triangle:'M46 10Q50 4 54 10L94 84Q97 90 90 90H10Q3 90 6 84Z',
hex:'M25 6.7L75 6.7L100 50L75 93.3L25 93.3L0 50Z',
'flower-5':polar(th=>36+10*Math.cos(5*th)),'flower-6':polar(th=>36+10*Math.cos(6*th)),'flower-8':polar(th=>38+8*Math.cos(8*th)),
'splat-4':polar(th=>33+13*Math.cos(4*th)+2*Math.cos(8*th)),'splat-5':polar(th=>34+12*Math.cos(5*th)),
scallop:polar(th=>44.5+3*Math.cos(16*th)),pebble:polar(th=>42+3*Math.cos(3*th+.6)+2*Math.sin(5*th)),
squircle:t=>{const th=t*Math.PI*2,c=Math.cos(th),s=Math.sin(th);return [50+46*Math.sign(c)*Math.pow(Math.abs(c),.5),50+46*Math.sign(s)*Math.pow(Math.abs(s),.5)]},
egg:t=>{const th=t*Math.PI*2;return [50+38*Math.cos(th)*(1-.16*Math.sin(th)),50+44*Math.sin(th)]},
bean:t=>{const th=t*Math.PI*2,s=Math.sin(th);return [50+42*Math.cos(th),50-(26*s+14*Math.cos(2*th)*(1+s)/2)]},
leaf:t=>{const th=t*Math.PI*2,s=Math.sin(th),x=46*Math.cos(th),y=28*s*Math.pow(Math.abs(s),.45),c=Math.SQRT1_2;return [50+(x-y)*c,50+(x+y)*c]}};
function rawShape(name:string){const s=SHAPES[name];const N=600,out=[];if(typeof s==='function'){for(let i=0;i<N;i++)out.push(s(i/N));return out}const pr=document.createElementNS('http://www.w3.org/2000/svg','path');pr.setAttribute('d',s);const L=pr.getTotalLength();for(let i=0;i<N;i++){const p=pr.getPointAtLength(L*i/N);out.push([p.x,p.y])}return out}
function fromShape(name:string,w:number,h:number,step:number){const raw=rawShape(name);let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;for(const [x,y] of raw){if(x<minx)minx=x;if(y<miny)miny=y;if(x>maxx)maxx=x;if(y>maxy)maxy=y}const sc=Math.min(w/(maxx-minx),h/(maxy-miny)),ox=(w-(maxx-minx)*sc)/2-minx*sc,oy=(h-(maxy-miny)*sc)/2-miny*sc;const pts=raw.map(([x,y])=>[x*sc+ox,y*sc+oy]);
const N=pts.length,cum=[0];for(let i=1;i<=N;i++){const a=pts[i-1],b=pts[i%N];cum.push(cum[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}const per=cum[N];const n=Math.max(48,Math.min(420,Math.round(per/step)));const out=[] as unknown as Rim;let j=0;
for(let i=0;i<n;i++){const d=per*i/n;while(j<N-1&&cum[j+1]<d)j++;const a=pts[j],b=pts[(j+1)%N],t=(d-cum[j])/((cum[j+1]-cum[j])||1);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,0,0,d])}
let cx=0,cy=0;for(const p of out){cx+=p[0];cy+=p[1]}cx/=n;cy/=n;let sgn=0;for(let i=0;i<n;i++){const a=out[(i-1+n)%n],b=out[(i+1)%n];const tx=b[0]-a[0],ty=b[1]-a[1];const L=Math.hypot(tx,ty)||1;const nx=ty/L,ny=-tx/L;out[i][2]=nx;out[i][3]=ny;sgn+=nx*(out[i][0]-cx)+ny*(out[i][1]-cy)}if(sgn<0)for(const p of out){p[2]=-p[2];p[3]=-p[3]}
out.per=per;out.poly=true;return out}

// ---- registry/cojeev/motion/body.ts (inlined) ----
type BodyFrame={d:string;points:number[][];press:number;active:boolean}
const drawnFrames=new WeakMap<Body,{at:number;frame:BodyFrame}>()
type Body = {
 tier:Tier;tierName:TierName;seed:number;w:number;h:number;base:Rim;R:{left:number;top:number;right:number;bottom:number;width:number;height:number};
 lobe:Spring;arc:Spring;hold:Spring;press:Spring;dirS:{x:Spring;y:Spring};dir:{x:number;y:number};
 ripple:number;jiggle:number;jArc:number;mergeT:number;inside:boolean;near:boolean;focus:boolean;
 lob:null|{n:number;a:number;L:{c:number;a:number;w:number}[]}
}
const scalar=(k:number,z=1):Spring=>({x:0,v:0,to:0,k,z})
function createBody(tier:Tier,tierName:TierName,seed=0):Body{return {tier,tierName,seed,w:0,h:0,base:rim(1,1,.5,2.5),R:{left:0,top:0,right:1,bottom:1,width:1,height:1},lobe:scalar(90,.9),arc:scalar(26),hold:scalar(55),press:scalar(140,.9),dirS:{x:scalar(40),y:scalar(40)},dir:{x:0,y:-1},ripple:0,jiggle:0,jArc:0,mergeT:0,inside:false,near:false,focus:false,lob:null}}
function rewindBody(b:Body){for(const s of [b.lobe,b.arc,b.hold,b.press,b.dirS.x,b.dirS.y]){s.x=s.v=s.to=0}b.jiggle=b.ripple=b.mergeT=0;b.inside=b.near=b.focus=false;b.lob=null;drawnFrames.delete(b)}
function bodyPadding(tier:Tier,cfg:MorphConfig,w:number,h:number){const m=Math.min(w,h);return Math.ceil(tier.reach+(tier.press+tier.depth*1.6)*m+(cfg.echo?cfg.echoOff+m*Math.abs(cfg.echoScale-1)+2:0)+(cfg.dots?16:0))+6}
function stepBody(b:Body,P:{x:number;y:number},dt:number,T:number,cfg:MorphConfig,RM=false,throttleRest=false):BodyFrame{
const tier=b.tier,base=b.base,per=base.per,m=Math.min(b.w,b.h);
const R=b.R!;const sx=b.w/R.width,sy=b.h/R.height;const cx=(P.x-R.left)*sx,cy=(P.y-R.top)*sy;const inBox=P.x>R.left-tier.R&&P.x<R.right+tier.R&&P.y>R.top-tier.R&&P.y<R.bottom+tier.R;const has=P.x>-1e3&&!RM&&tier.reach>0&&inBox;
let ni=0,nd=1e9;if(has){for(let i=0;i<base.length;i+=2){const q=base[i];const dd=(q[0]-cx)**2+(q[1]-cy)**2;if(dd<nd){nd=dd;ni=i}}}
const ins=has&&cx>0&&cx<b.w&&cy>0&&cy<b.h;const dist=Math.sqrt(nd);const near=has&&!ins&&dist<tier.R;
if(has&&(near||ins)){const q=base[ni];let da=q[4]-b.arc.x;da-=Math.round(da/per)*per;b.arc.to=b.arc.x+da;const dx=cx-q[0],dy=cy-q[1],L=Math.hypot(dx,dy)||1;b.dirS.x.to=dx/L;b.dirS.y.to=dy/L}
b.lobe.to=(near&&cfg.reach)?tier.reach*Math.pow(.5*(1-Math.cos(Math.PI*(1-dist/tier.R))),cfg.curve):0;
b.arc.k=cfg.arcK;b.hold.k=cfg.holdK;b.press.k=b.press.to?260:cfg.pressK;if(b.mergeT>0){b.mergeT-=dt;b.lobe.z=cfg.mergeZ;b.lobe.k=105}else{b.lobe.z=cfg.lobeZ;b.lobe.k=cfg.lobeK}
b.hold.to=cfg.hold?(ins?tier.inside*Math.max(.35,1-Math.min(dist,60)/80):(b.focus?tier.inside*.6:0)):0;
if(ins&&!b.inside&&cfg.merge)b.mergeT=.6;if(b.near&&!near&&!ins&&!RM&&cfg.jiggleOn){b.jiggle=1;b.jArc=b.arc.x}
b.inside=ins;b.near=near;
const active=near||ins||b.lobe.x>.02||b.hold.x>.02||b.press.x>.002||b.press.to||b.ripple>0||b.jiggle>0||b.mergeT>0;
const cached=drawnFrames.get(b),moving=tier.depth&&tier.lobes&&cfg.drift&&(near||ins)
if(throttleRest&&!active&&!moving&&cached&&T*1000-cached.at<250)return {...cached.frame,active:false}
if(b.jiggle>0)b.jiggle=Math.max(0,b.jiggle-dt*cfg.jiggleDecay);if(b.ripple>0)b.ripple=Math.max(0,b.ripple-dt*1.25);
spring(b.lobe,dt);spring(b.arc,dt);spring(b.hold,dt);spring(b.press,dt);spring(b.dirS.x,dt);spring(b.dirS.y,dt);const dl=Math.hypot(b.dirS.x.x,b.dirS.y.x)||1;b.dir={x:b.dirS.x.x/dl,y:b.dirS.y.x/dl};
const idle=(RM||!cfg.rest)?0:tier.amp*m,lobe=b.lobe.x,hold=b.hold.x,pr=b.press.x,rip=b.ripple,jg=b.jiggle;const isSpin=b.tierName==='spinner';const sig2=2*tier.sig*tier.sig;const pa=Math.atan2(cy-b.h/2,(cx-b.w/2)*(b.h/b.w));
if(tier.depth&&tier.lobes&&(!b.lob||b.lob.n!==tier.lobes||b.lob.a!==tier.asym)){const L=[];let s=b.seed;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};for(let j=0;j<tier.lobes;j++)L.push({c:j/tier.lobes+(rnd()-.5)*tier.asym*.5/tier.lobes,a:1+(rnd()-.5)*tier.asym*.9,w:1+(rnd()-.5)*tier.asym*.6});b.lob={n:tier.lobes,a:tier.asym,L}}
const dr=RM?0:T*.05*cfg.drift,armSig=tier.lobes?(tier.spread||.55)/tier.lobes*.5:0;
const N=base.length,pts=new Array<number[]>(N);
for(let i=0;i<N;i++){const q=base[i],x=q[0],y=q[1],nx=q[2],ny=q[3],arc=q[4],u=arc/per;
 let k=idle*(Math.sin(u*Math.PI*2*(isSpin?3:2)+T*.38*cfg.restSpeed+b.seed)*.6+Math.sin(u*Math.PI*2*3-T*.26*cfg.restSpeed+b.seed*1.3)*.4);
 if(armSig){let bump=-.35;for(const l of b.lob!.L){let du=u-l.c-dr*(1+l.a*.2);du-=Math.round(du);const s2=armSig*l.w;bump+=l.a*Math.exp(-(du*du)/(2*s2*s2))}k+=tier.depth*m*bump}
 let da=arc-b.arc.x;da-=Math.round(da/per)*per;const g=Math.exp(-(da*da)/sig2);
 k+=hold*(g*1.2-.15);
 if(pr&&cfg.press){const a=Math.atan2(ny,nx);const c=Math.cos(a-pa);k+=pr*tier.press*m*(-.9*c*c+.5*(1-c*c))}
 if(rip)k+=Math.sin(u*Math.PI*2*2-(1-rip)*Math.PI*4)*rip*rip*tier.press*m*.6;
 if(jg){let dj=arc-b.jArc;dj-=Math.round(dj/per)*per;const gj=Math.exp(-(dj*dj)/sig2);const t=1-jg;k+=gj*tier.reach*cfg.jiggle*Math.exp(-t*3.2)*Math.cos(t*Math.PI*3.4)}
 const lx=lobe*g*b.dir.x,ly=lobe*g*b.dir.y;const px=x+nx*k+lx,py=y+ny*k+ly;pts[i]=[px,py];}

const output={d:path_Geometry(pts,!!base.poly),points:pts,press:pr,active:!!active};drawnFrames.set(b,{at:T*1000,frame:output});return output
}

// ---- registry/cojeev/motion/category.ts (inlined) ----
const CATS:Record<Category,{sel:string;tier:TierName}>={
buttons:{sel:'.v-btn:not(.-ghost),.v-select,.v-toggle,.v-native,.v-dock__action,.v-menubar__trigger,.v-cal__month,.v-caption-pill',tier:'pill'},
icons:{sel:'.v-ibtn,.v-disk:not(.v-input>.v-disk):not(.v-igroup>.v-disk):not(.v-select .v-disk):not(.v-menu__item .v-disk),.v-search__disk,.v-collapse,.v-assist__close,.v-attached,.v-play,.v-edit,.v-node__port,.v-receipt__dot,.v-mood .v-face',tier:'tile'},
pills:{sel:'.v-badge:not(.-count):not(.-sm),.v-time,.v-stamp,.v-delta,.v-kbd,.v-capsule__name,.v-nav__count,.v-cal__wk.-on,.v-week__day,.v-bubble,.v-pager button,.v-marker,.v-prov',tier:'tile'},
cards:{sel:'.v-card,.v-record,.v-resource,.v-file,.v-alert,.v-state,.v-md__detail,.v-event,.v-needs,.v-upgrade,.v-node,.v-inspector,.v-palette__item,.v-validation,.v-compact,.v-widget,.v-capsule,.v-band,.v-kv.-panel,.v-quest__opt,.v-collapsible__body,.v-acc>details,.v-acc>[data-slot="accordion-item"],.v-empty,.v-feature__body,.v-resizable,.v-table-wrap,.v-list.-grouped,.v-mobile,.v-notch',tier:'card'},
nav:{sel:'.v-nav__item[aria-current="page"],.v-tabs:not(.-underline) .v-tabs:not(.-underline) .v-tab[aria-selected="true"],.v-item,.v-tabs.-pills,.v-tabs.-lenses,.v-seg,.v-menubar,.v-dock__item[aria-current="page"],.v-datestrip button[aria-pressed="true"],.v-cal__d:is([aria-selected="true"],[aria-pressed="true"],[data-state="active"]),.v-menu__item:is([aria-selected="true"],[data-highlighted],[data-state="checked"])',tier:'nav'},
inputs:{sel:'label.v-input,div.v-input,.v-igroup,.v-cmd__input,.v-combo .v-input,.v-otp input,.v-textarea',tier:'nav'},
controls:{sel:'.v-switch,.v-weekdays label,.v-iradio,.v-check input,.v-radio input,.v-slider,.v-track,.v-mood button,.v-hex,.v-avatar:not(.-square),.v-ratio,.v-file__thumb,.v-mask,.v-drops .v-drop',tier:'tile'},
surfaces:{sel:'.v-dialog,.v-sheet,.v-drawer,.v-menu,.v-popover,.v-cmd,.v-toast,.v-assist,.v-dock,.v-dockpanel,.v-sidebar,.v-scroller,.v-scroll,.v-hovercard>.v-popover,.v-collage,.v-feature,.v-ring,.v-prose',tier:'card'},
skeleton:{sel:'.v-skel',tier:'pill'}};
const FILL_SEL='.v-btn:not(.-outline):not(.-ghost):not(.v-seg .v-btn),.v-badge:not(.-dashed):not(.-test),.v-card,.v-disk,.v-ibtn.-ink,.v-ibtn.-pink,.v-ibtn.-beige,.v-ibtn.-cream,.v-select,.v-time,.v-stamp,.v-delta,.v-toggle[aria-pressed="true"],.v-alert,.v-state:not(.-filtered),.v-event,.v-item.-selected,.v-md__detail,.v-tabs:not(.-underline) .v-tab[aria-selected="true"],.v-nav__item[aria-current="page"],.v-dock__action,.v-kbd,.v-bubble,.v-capsule__name,.v-nav__count,.v-week__day,.v-cal__month,.v-caption-pill,.v-menubar__trigger[aria-expanded="true"],.v-search__disk,.v-collapse,.v-assist__close,.v-attached,.v-play,.v-receipt__dot,.v-mood .v-face,.v-pager button[aria-current="page"],.v-datestrip button[aria-pressed="true"],.v-cal__d:is([aria-selected="true"],[aria-pressed="true"],[data-state="active"]),.v-cal__wk.-on,.v-switch,.v-weekdays label,.v-iradio:has(input:checked),.v-hex,.v-avatar,.v-skel,.v-track,.v-quest__opt,.v-band,.v-compact,.v-widget,.v-capsule,.v-node,.v-inspector,.v-palette__item,.v-validation,.v-upgrade,.v-needs,.v-record,.v-resource,.v-file,.v-kv.-panel,.v-collapsible__body,.v-acc>details,.v-acc>[data-slot="accordion-item"],.v-list.-grouped,.v-table-wrap,.v-mobile,.v-notch,.v-dialog,.v-sheet,.v-drawer,.v-menu,.v-popover,.v-cmd,.v-toast,.v-assist,.v-dock,.v-dockpanel,.v-sidebar,.v-scroller,.v-collage,.v-feature__body,.v-feature,.v-ratio,.v-file__thumb,.v-mask,.v-igroup,label.v-input,div.v-input,.v-cmd__input,.v-item,.v-menu__item:is([aria-selected="true"],[data-highlighted],[data-state="checked"]),.v-dock__item[aria-current="page"],.v-toggle';
const STROKE_SEL='.v-btn.-outline,.v-badge.-dashed,.v-badge.-test,.v-ibtn,.v-menubar,.v-otp,.v-ring,.v-pager button,.v-resizable,.v-scroll,.v-state.-filtered,.v-drops .v-drop,.v-mood button,.v-node__port,.v-hovercard>.v-popover';
const NEVER_SEL='.v-label,.v-field,.v-help,.v-prov,.v-marker,.v-prose,.v-caps,.v-meta,.v-quiet,.v-sr,label:not(.v-switch):not(.v-weekdays label),legend,dt,dd,p,h1,h2,h3,h4,caption,th:not([data-slot="calendar-week-number"])';
const VOID=/^(INPUT|SELECT|TEXTAREA|HR|IMG|BR)$/
type MorphHost={mode:"fill"|"stroke"|"both";tierName:TierName;explicit:boolean}
function resolveMorphHost(el:HTMLElement,category:Category,settings:MotionSettings):MorphHost|null {
 if(VOID.test(el.tagName)||el.closest('[data-motion="off"],[hidden],svg,.tp,.ap,.code'))return null
 const css=getComputedStyle(el);if(/auto|scroll/.test(css.overflowX+css.overflowY))return null
 const ownClasses=/^(v-alive|v-morph-host|v-morph-rel|v-morph-live)$/
 const bare=/^(DIV|SPAN)$/.test(el.tagName)&&!el.dataset.shape&&!el.dataset.tier&&[...el.classList].every(name=>ownClasses.test(name))
 if(el.matches(NEVER_SEL)||el.matches('.v-tip,.v-tooltip')||bare)return null
 const explicit=el.dataset.morph
 if(explicit==='none')return null
 if(explicit==='fill'||explicit==='stroke'||explicit==='both'){
  const tierName=(el.dataset.tier||(el.dataset.shape?'blob':el.matches('.v-card,[role="tablist"]')?'card':el.matches('.v-nav__item,.v-tab')?'nav':el.matches('.v-ibtn')?'tile':'pill')) as TierName
  return {mode:explicit,tierName,explicit:true}
 }
 if(settings.mode==='off'||!settings.cats[category]||!el.matches(CATS[category].sel)||el.matches(NEVER_SEL))return null
 const fill=el.matches(FILL_SEL),stroke=!fill&&el.matches(STROKE_SEL)
 if(!fill&&!stroke)return null
 return {mode:stroke?'stroke':'fill',tierName:(el.dataset.tier||CATS[category].tier) as TierName,explicit:false}
}
function resolveMorphTier(el:HTMLElement,name:TierName,profile:MorphProfile){
 const current=profile.TIER[name],factory=factoryTiers[name];if(!current)return null
 const tier={...current}
 for(const key of ['reach','inside','amp','lobes','depth','asym','spread'] as const){const value=el.dataset[key];if(value!=null&&Number.isFinite(+value)&&current[key]===factory[key])tier[key]=+value}
 return tier
}
const hosts=new Map<HTMLElement,{refresh:()=>void;disable:()=>void}>()
function registerMorphHost(el:HTMLElement,host:{refresh:()=>void;disable:()=>void}){hosts.set(el,host);return ()=>{hosts.delete(el)}}

// ---- registry/cojeev/motion/morph-paint.ts (inlined) ----
const NS='http://www.w3.org/2000/svg'
let shared:SVGSVGElement|null=null,users_MorphPaint=0,serial=0
function node<K extends keyof SVGElementTagNameMap>(tag:K,attrs:Record<string,string>={}):SVGElementTagNameMap[K]{const el=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,value);return el}
function acquireDefs(){
 if(!shared){
  const id=++serial;shared=node('svg',{id:'v-morph-defs',width:'0',height:'0','aria-hidden':'true'});shared.style.cssText='position:absolute;width:0;height:0;overflow:hidden'
  const defs=node('defs'),gradient=node('linearGradient',{id:'v-sheen-'+id,x1:'0',y1:'0',x2:'0',y2:'1'}),pattern=node('pattern',{id:'v-grain-'+id,patternUnits:'userSpaceOnUse',width:'160',height:'160'})
  for(const [offset,color,opacity]of [['0','rgb(255,255,255)','.09'],['.45','rgb(255,255,255)','0'],['1','rgb(0,0,0)','.03']])gradient.append(node('stop',{offset,'stop-color':color,'stop-opacity':opacity}))
  const grain=encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>")
  pattern.append(node('image',{href:'data:image/svg+xml,'+grain,width:'160',height:'160'}));defs.append(gradient,pattern);shared.append(defs);document.body.prepend(shared)
 }
 users_MorphPaint++;const id=serial;let released=false
 return {id,release:()=>{if(released)return;released=true;if(--users_MorphPaint===0){shared?.remove();shared=null}}}
}
function createMorphOverlays(svg:SVGElement){
 const defs=acquireDefs(),sheen=node('path',{'data-morph-overlay':'sheen',fill:`url(#v-sheen-${defs.id})`}),grain=node('path',{'data-morph-overlay':'grain',fill:`url(#v-grain-${defs.id})`})
 grain.style.mixBlendMode='soft-light';svg.append(sheen,grain);let previous=''
 return {paint:(points:number[][],body:Body,cfg:MorphConfig)=>{
  const inset=path_Geometry(points.map(([x,y],i)=>[x-body.base[i][2]*.75,y-body.base[i][3]*.75]),!!body.base.poly)
  if(inset!==previous){sheen.setAttribute('d',inset);grain.setAttribute('d',inset);previous=inset}
  sheen.style.opacity=String(cfg.sheen);grain.style.opacity=String(cfg.grain)
 },dispose:()=>{sheen.remove();grain.remove();defs.release()}}
}
function morphColor(colors:string[],seconds:number){
 const fraction=(seconds*.35)%colors.length,index=Math.floor(fraction),a=colors[index],b=colors[(index+1)%colors.length]
 const rgb=(color:string)=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),A=rgb(a),B=rgb(b)
 return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*(fraction-index))).join(',')})`
}

// ---- registry/cojeev/motion/use-morph.ts (inlined) ----
const instances=new Set<{measure:(t:number)=>void;invalidate:()=>void;frame:(t:number,dt:number)=>boolean;rewind:()=>void;reseed:()=>void;refresh:()=>void}>()
let clock:number|null=null,previous:number|null=null,raf=0,seed:number|null=null
const pointer={x:-1e4,y:-1e4}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
function frame(t:number){const dt=previous===null?0:Math.min(.05,Math.max(0,(t-previous)/1000));previous=t;let active=false;instances.forEach(b=>b.measure(t));instances.forEach(b=>{active=b.frame(t,dt)||active});return active}
function wake(){if(clock!==null||raf||!instances.size||document.hidden)return;raf=requestAnimationFrame(t=>{raf=0;if(frame(t))wake()})}
function bodySeed(el:HTMLElement){const raw=el.ownerDocument.documentElement.dataset.seed;const n=seed??(raw!=null&&raw!==""&&Number.isFinite(+raw)?+raw:null);if(n===null)return Math.random()*100;
 let key="",node:Element|null=el;while(node&&node!==el.ownerDocument.documentElement){let i=0,s=node.previousElementSibling;while(s){if(!s.matches("svg.v-morph,#v-morph-defs,.v-glide__pill,.v-glide__hover,.v-glide__trail"))i++;s=s.previousElementSibling}key=node.tagName+i+"/"+key;node=node.parentElement}
 let h=2166136261;for(const c of key+"#"+n){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h%100000/1000
}
const ns="http://www.w3.org/2000/svg"
function svgNode(tag:string,attrs:Record<string,string>={}){const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el}
const clear=(v:string)=>!v||v==="transparent"||v==="rgba(0, 0, 0, 0)"
function surfaceFill(el:HTMLElement){let bg="";for(let p=el.parentElement;p;p=p.parentElement){bg=getComputedStyle(p).backgroundColor;if(!clear(bg))break}const m=/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(bg);const rgb=m?m.slice(1).map(n=>{const v=+n/255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}):[1,1,1];return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]<.18?"rgba(251,244,230,.14)":"var(--v-beige)"}
let keyedSnapshot:unknown,morphKey=''
function morphInputs(){const s=getSettingsSnapshot();if(s!==keyedSnapshot){keyedSnapshot=s;morphKey=JSON.stringify([s.motion,s.profile])}return morphKey}
let environmentUsers=0,disposeEnvironment=()=>{}
const rootStyleHosts=new Set<()=>void>()
function acquireEnvironment(sync:()=>void){
 rootStyleHosts.add(sync)
 if(environmentUsers++===0){
  const ac=new AbortController(),opts={signal:ac.signal}
  const refresh=()=>{rootStyleHosts.forEach(sync=>sync());instances.forEach(b=>b.refresh())}
  const style=document.createElement('span').style
  const nonFlowStyle=(value:string|null)=>{style.cssText=value??'';for(const name of Array.from(style))if(name.startsWith('--flow-'))style.removeProperty(name);return style.cssText}
  const theme=new MutationObserver(records=>{
   if(records.some(record=>record.attributeName==='style')){
    const next=nonFlowStyle(document.documentElement.getAttribute('style'))
    if(records.some(record=>record.attributeName==='style'&&nonFlowStyle(record.oldValue)!==next))rootStyleHosts.forEach(sync=>sync())
   }
   if(records.some(record=>record.attributeName!=='style'))refresh()
  })
  theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-mode','data-skin','style'],attributeOldValue:true})
  window.addEventListener('v-theme',refresh,opts);window.addEventListener('v-palette',refresh,opts)
  document.addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;wake()},{...opts,passive:true})
  document.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-1e4;wake()},opts)
  const layout=()=>{instances.forEach(b=>b.invalidate());wake()}
  window.addEventListener('resize',layout,opts);window.addEventListener('scroll',layout,{...opts,capture:true,passive:true})
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else{previous=performance.now();wake()}},opts)
  disposeEnvironment=()=>{ac.abort();theme.disconnect();stop();previous=null}
 }
 return ()=>{rootStyleHosts.delete(sync);if(--environmentUsers===0)disposeEnvironment()}
}
function useMorph<T extends HTMLElement>(category:Category,externalRef?:React.Ref<T>){
 const [host,setHost]=React.useState<T|null>(null)
 const syncHost=React.useRef<()=>void>(()=>{})
 const ref=React.useCallback((node:T|null)=>{setHost(node);if(typeof externalRef==="function"){const cleanup=externalRef(node);return ()=>{setHost(null);if(typeof cleanup==="function")cleanup();else externalRef(null)}}if(externalRef)externalRef.current=node;return ()=>{setHost(null);if(externalRef)externalRef.current=null}},[externalRef])
 React.useLayoutEffect(()=>{
  if(!host)return
  const el=host,ac=new AbortController(),opts={signal:ac.signal}
  const mq=matchMedia("(prefers-reduced-motion: reduce)")
  let destroyBody:()=>void=()=>{},retuneProfile:()=>void=()=>attach()
  let retainedBody:Body|undefined,repairBody=()=>{},signature='',autoMode:string|undefined,lastPaint:{fill:string;stroke:string}|null=null
  let automaticRadius:number|undefined
  let cornerSignature=''
  const visualSignature=()=>JSON.stringify([
   getComputedStyle(el).borderTopLeftRadius,
   el.className.split(/\s+/).filter(c=>!['v-morph-host','v-morph-live','v-morph-rel'].includes(c)).join(' '),
   ...['motion','tier','reach','inside','amp','lobes','depth','asym','spread','r','shape','sw','dash','colors'].map(k=>el.dataset[k]),
   el.dataset.morph===autoMode?'':el.dataset.morph,el.style.getPropertyValue('--mfill'),el.style.getPropertyValue('--mstroke'),
   ...['aria-selected','aria-current','aria-pressed','aria-checked','aria-expanded','disabled','aria-disabled','aria-busy','data-state','data-highlighted'].map(name=>el.getAttribute(name)),
  ])
  function attach(){
   const nextCorner=getComputedStyle(el).borderTopLeftRadius
   if(nextCorner!==cornerSignature){automaticRadius=undefined;cornerSignature=nextCorner}
   const overrides=new Map<string,string>()
   if(lastPaint)for(const key of ['fill','stroke'] as const){const value=el.style.getPropertyValue('--m'+key);if(value!==lastPaint[key])overrides.set('--m'+key,value)}
   destroyBody();destroyBody=()=>{};lastPaint=null
   for(const [key,value]of overrides){if(value)el.style.setProperty(key,value);else el.style.removeProperty(key)}
   repairBody=()=>{};retuneProfile=()=>attach();autoMode=undefined
   const settings=getMotionSettings(),profile=getMorphProfile(),resolved=resolveMorphHost(el,category,settings)
   if(!resolved){automaticRadius=undefined;return}
   const {mode,tierName,explicit}=resolved,cs=getComputedStyle(el)
   const resolvedTier=resolveMorphTier(el,tierName,profile);if(!resolvedTier){automaticRadius=undefined;return};const tier={...resolvedTier}
   const selectionGroup=el.closest<HTMLElement>('[data-flow-owned].v-glide')
   const groupBody=!!selectionGroup&&selectionGroup.dataset.flowKind!=='fill'&&selectionGroup.matches('.v-tabs,.v-seg,.v-pager,.v-iradios,[role="tablist"],[data-slot="toggle-group"]')
   const cfg={...profile.cfg};if(settings.mode==="off"||mq.matches||groupBody)for(const k of ["rest","reach","merge","hold","jiggleOn","press"] as const)cfg[k]=false
   const b=retainedBody??createBody(tier,tierName,bodySeed(el));retainedBody=b
   b.tier=tier;b.tierName=tierName;b.w=b.h=0;b.focus=el===el.ownerDocument.activeElement||el.contains(el.ownerDocument.activeElement)
   if(mq.matches||settings.mode==="off"||groupBody)rewindBody(b)
   const old={fill:el.style.getPropertyValue('--mfill'),stroke:el.style.getPropertyValue('--mstroke'),pad:el.style.getPropertyValue('--mpad'),transform:el.style.transform}
   const svg=svgNode('svg',{class:'v-morph','aria-hidden':'true','shape-rendering':'geometricPrecision'})
   svg.style.cssText="position:absolute;width:0;height:0;pointer-events:none"
   const path=svgNode('path',{'data-morph-body':'',fill:mode!=='stroke'?'var(--mfill,var(--v-beige))':'none'})
   if(mode!=='fill'){path.setAttribute('stroke','var(--mstroke,transparent)');path.setAttribute('stroke-width',el.dataset.sw||(el.matches('.v-badge.-test')?'1.5':'1'));path.setAttribute('stroke-linejoin','round');const dash=el.dataset.dash||(el.matches('.v-badge.-dashed')?'3 3':'');if(dash)path.setAttribute('stroke-dasharray',dash)}
   const echo=svgNode('path',{'data-morph-echo':'',fill:'none',stroke:'var(--mstroke,var(--mfill,transparent))','stroke-width':'1.5','vector-effect':'non-scaling-stroke'}),dots=svgNode('g',{fill:'var(--mfill,transparent)'})
   echo.style.display=dots.style.display='none';svg.append(path,echo,dots)
   const overlays=el.matches('.v-alive,.combo')?createMorphOverlays(svg):null
   const colors=el.dataset.colors?.split(',').map(color=>color.trim()).filter(color=>/^#[0-9a-f]{6}$/i.test(color))??[]
   const staticBody=mq.matches||settings.mode==='off'||groupBody
   if(colors.length&&!staticBody)path.setAttribute('data-morph-colors','')

   if(!explicit){el.dataset.morph=mode;el.dataset.autoMorph=category;autoMode=mode}
   el.classList.add('v-morph-host','v-morph-live');const relative=cs.position==='static';if(relative)el.classList.add('v-morph-rel')
   const focused=el.ownerDocument.activeElement;el.prepend(svg);if(focused instanceof HTMLElement&&el.contains(focused)&&el.ownerDocument.activeElement!==focused)focused.focus({preventScroll:true})
   const repaint=()=>{
    if(!explicit&&mode!=='fill')el.style.setProperty('--mstroke',old.stroke||(el.matches('.v-badge.-test')?'var(--v-ink)':el.matches('.v-badge.-dashed')?'var(--v-text-2)':'var(--v-border)'))
    if(!explicit&&mode!=='stroke'){
     const transition=el.style.getPropertyValue('transition-property'),transitionPriority=el.style.getPropertyPriority('transition-property')
     el.style.setProperty('transition-property','none','important')
     svg.classList.remove('v-morph')
     el.style.removeProperty('--mfill')
     const paint=getComputedStyle(el),bg=paint.backgroundColor,cssFill=paint.getPropertyValue('--mfill').trim()
     const fill=!clear(bg)?bg:old.fill||cssFill||surfaceFill(el)
     svg.classList.add('v-morph')
     el.style.setProperty('--mfill',fill)
     if(transition)el.style.setProperty('transition-property',transition,transitionPriority)
     else el.style.removeProperty('transition-property')
    }
    lastPaint={fill:el.style.getPropertyValue('--mfill'),stroke:el.style.getPropertyValue('--mstroke')};signature=visualSignature()
   }
   let rectValid=false,rAt=0,resize=true
   let lastD='',dirty=true
   repairBody=()=>{
    if(svg.parentNode!==el){el.prepend(svg);dirty=true}
    el.classList.add('v-morph-host','v-morph-live');if(relative)el.classList.add('v-morph-rel')
    if(!explicit&&!el.dataset.morph)el.dataset.morph=mode
   }
   function measure(){const R=el.getBoundingClientRect();b.R=R;const w=Math.round(R.width),h=Math.round(R.height);if(!w||!h)return;if(w===b.w&&h===b.h)return;b.w=w;b.h=h;const authored=el.dataset.r;const corner=getComputedStyle(el).borderTopLeftRadius,original=parseFloat(corner);
    const cssRadius=Number.isFinite(original)?Math.min(Math.min(w,h)/2,corner.endsWith('%')?Math.min(w,h)*original/100:original):Math.min(w,h)/2;
    const radius=authored==='css'?cssRadius:authored?+authored:explicit?Math.min(w,h)/2:Number.isFinite(original)&&original<200?(automaticRadius??=Math.min(original,Math.min(el.offsetWidth,el.offsetHeight)/2)):Math.min(w,h)/2;b.base=el.dataset.shape&&SHAPES[el.dataset.shape]?fromShape(el.dataset.shape,w,h,Math.max(1,cfg.quality)*.7):rim(w,h,radius,Math.max(1,cfg.quality));const pad=bodyPadding(tier,cfg,w,h);svg.setAttribute('viewBox',`${-pad} ${-pad} ${w+2*pad} ${h+2*pad}`);svg.style.cssText=`position:absolute;left:${-pad}px;top:${-pad}px;width:${w+2*pad}px;height:${h+2*pad}px;pointer-events:none;overflow:visible;z-index:-1`;el.style.setProperty('--mpad',pad+'px');dirty=true}
   function premeasure(t:number){
    if(!el.isConnected){automaticRadius=undefined;rectValid=false;return}
    const R=b.R,margin=tier.R+40
    const near=rectValid&&pointer.x>-1e3&&pointer.x>R.left-margin&&pointer.x<R.right+margin&&pointer.y>R.top-margin&&pointer.y<R.bottom+margin
    if(!rectValid||t-rAt>250||near||b.press.to||b.lobe.x>.02||b.jiggle>0){b.R=el.getBoundingClientRect();rAt=t;rectValid=true}
    resize=Math.round(b.R.width)!==b.w||Math.round(b.R.height)!==b.h
   }
   const invalidate=()=>{rectValid=false;dirty=true}
   const instance={measure:premeasure,invalidate,frame:(t:number,dt:number)=>{if(!el.isConnected)return false;if(resize){resize=false;b.lob=null;dirty=true;lastD='';measure()}if(!b.w||!b.h||!b.R.width||!b.R.height)return false;const out=stepBody(b,pointer,dt,(staticBody?0:t/1000),cfg,staticBody,!dirty&&!colors.length&&tierName!=='spinner');if(out.d!==lastD){path.setAttribute('d',out.d);lastD=out.d}if(cfg.echo){const m=cfg.echoScale,ox=cfg.echoOff*Math.cos(b.seed),oy=cfg.echoOff*Math.sin(b.seed);echo.setAttribute('d',path_Geometry(out.points.map(([x,y])=>[b.w/2+(x-b.w/2)*m+ox,b.h/2+(y-b.h/2)*m+oy]),!!b.base.poly));echo.style.display=''}else echo.style.display='none';if(cfg.dots){while(dots.childElementCount>cfg.dots)dots.lastElementChild?.remove();while(dots.childElementCount<cfg.dots)dots.append(svgNode('circle',{r:(2+((dots.childElementCount*7+b.seed)%3)).toFixed(1)}));for(let i=0;i<cfg.dots;i++){const j=Math.floor((i/cfg.dots)*b.base.length+b.seed*3)%b.base.length,q=b.base[j],dot=dots.children[i];dot.setAttribute('cx',(out.points[j][0]+q[2]*(8+i*3)).toFixed(2));dot.setAttribute('cy',(out.points[j][1]+q[3]*(8+i*3)).toFixed(2))}dots.style.display=''}else dots.style.display='none';overlays?.paint(out.points,b,cfg);if(colors.length&&!staticBody)path.setAttribute('fill',morphColor(colors,t/1000));if(tierName==='spinner')svg.style.transform=staticBody?'':`rotate(${((t/1000)*40)%360}deg)`;if(el.hasAttribute('data-stable-hit')){el.style.transform=old.transform;if(tierName!=='spinner')svg.style.transform=out.press>.004&&!staticBody?`scale(${1-out.press*.03},${1-out.press*.015})`:''}else if(out.press>.004&&!staticBody)el.style.transform=`scale(${1-out.press*.03},${1-out.press*.015})`;else el.style.transform=old.transform;const work=out.active||dirty||(!staticBody&&(colors.length>0||tierName==='spinner'||!!(tier.depth&&tier.lobes&&cfg.drift&&(b.near||b.inside))));dirty=false;return work},rewind:()=>{rewindBody(b);rectValid=false;rAt=0;dirty=true;lastD=''},reseed:()=>{b.seed=bodySeed(el)},refresh:()=>{repaint();dirty=true;wake()}}
   const bodyAC=new AbortController(),bo={signal:bodyAC.signal}
   const press=()=>{if(!cfg.press||el.matches(':disabled,[aria-disabled="true"]'))return;b.press.to=1;b.press.k=260;wake()}
   const release=()=>{if(b.press.to){b.press.to=0;b.ripple=1;wake()}}
   el.addEventListener('focusin',()=>{b.focus=true;repaint();wake()},bo);el.addEventListener('focusout',()=>{b.focus=false;release();repaint();wake()},bo)
   el.addEventListener('pointerenter',()=>{el.setAttribute('data-hover','');repaint();wake()},bo);el.addEventListener('pointerleave',()=>{el.removeAttribute('data-hover');repaint();wake()},bo)
   el.addEventListener('pointerdown',press,bo);el.addEventListener('pointercancel',release,bo);document.addEventListener('pointerup',release,bo)
   el.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')press()},bo);el.addEventListener('keyup',release,bo)
   const ro=new ResizeObserver(entries=>{for(const entry of entries){const R=entry.contentRect;if(Math.abs(Math.round(R.width)-b.w)<1&&Math.abs(Math.round(R.height)-b.h)<1)continue;invalidate();wake()}});ro.observe(el)
   retuneProfile=()=>{
    const nextSettings=getMotionSettings(),nextProfile=getMorphProfile()
    if(nextSettings.mode!==settings.mode||nextSettings.cats[category]!==settings.cats[category]){attach();signature=visualSignature();return}
    const nextTier=resolveMorphTier(el,tierName,nextProfile);if(!nextTier)return
    const nextCfg={...nextProfile.cfg};if(staticBody)for(const key of ['rest','reach','merge','hold','jiggleOn','press'] as const)nextCfg[key]=false
    if(JSON.stringify(cfg)===JSON.stringify(nextCfg)&&JSON.stringify(tier)===JSON.stringify(nextTier))return
    const resize=cfg.quality!==nextCfg.quality||cfg.echo!==nextCfg.echo||cfg.echoOff!==nextCfg.echoOff||cfg.echoScale!==nextCfg.echoScale||cfg.dots!==nextCfg.dots||tier.reach!==nextTier.reach||tier.press!==nextTier.press||tier.depth!==nextTier.depth
    Object.assign(cfg,nextCfg);Object.assign(tier,nextTier)
    if(resize)b.w=b.h=0
    dirty=true;const time=clock??performance.now();instance.measure(time);instance.frame(time,0);wake()
   }
   repaint();instances.add(instance);const time=clock??performance.now();instance.measure(time);instance.frame(time,0);wake()
   destroyBody=()=>{instances.delete(instance);bodyAC.abort();ro.disconnect();overlays?.dispose();svg.remove();el.classList.remove('v-morph-host','v-morph-live');if(relative)el.classList.remove('v-morph-rel');el.removeAttribute('data-hover');if(!explicit&&el.dataset.morph===mode)delete el.dataset.morph;if(!explicit)delete el.dataset.autoMorph;for(const [key,value]of [['--mfill',old.fill],['--mstroke',old.stroke],['--mpad',old.pad]]){if(value)el.style.setProperty(key,value);else el.style.removeProperty(key)}el.style.transform=old.transform;if(!instances.size)stop()}
  }
  attach()
  signature=visualSignature()
  const sync=()=>{if(visualSignature()!==signature){attach();signature=visualSignature()}else repairBody()}
  syncHost.current=sync
  const children=new MutationObserver(()=>{repairBody()});children.observe(el,{childList:true})
  let inputs=morphInputs()
  const unsubscribe=subscribeMotion(()=>{const next=morphInputs();if(next===inputs)return;inputs=next;retuneProfile();signature=visualSignature()})
  const unregister=registerMorphHost(el,{refresh:()=>{attach();signature=visualSignature()},disable:()=>{destroyBody();automaticRadius=undefined;destroyBody=()=>{};repairBody=()=>{}}})
  const attributes=new MutationObserver(()=>{if(visualSignature()!==signature){attach();signature=visualSignature()}})
  attributes.observe(el,{attributes:true,attributeFilter:['class','style','data-morph','data-tier','data-motion','data-reach','data-inside','data-amp','data-lobes','data-depth','data-asym','data-spread','data-r','data-shape','data-sw','data-dash','data-colors','aria-selected','aria-current','aria-pressed','aria-checked','aria-expanded','disabled','aria-disabled','aria-busy','data-state','data-highlighted']})
  const ancestors=new MutationObserver(records=>{if(records.some(record=>record.attributeName==='data-motion'||record.attributeName==='hidden')||visualSignature()!==signature){attach();signature=visualSignature()}})
  for(let parent=el.parentElement;parent;parent=parent.parentElement)ancestors.observe(parent,{attributes:true,attributeFilter:parent===el.ownerDocument.documentElement?['data-motion','hidden','class']:['data-motion','hidden','style','class']})
  mq.addEventListener('change',attach,opts)
  const releaseEnvironment=acquireEnvironment(sync)
  return ()=>{syncHost.current=()=>{};children.disconnect();attributes.disconnect();ancestors.disconnect();unregister();unsubscribe();destroyBody();automaticRadius=undefined;ac.abort();releaseEnvironment()}
 },[host,category])
 React.useLayoutEffect(()=>{syncHost.current()})
 return ref
}

// ---- registry/cojeev/lib/control-appearance.ts (inlined) ----
type ControlRadius = "square" | "soft" | "round" | "pill";
function controlRadiusStyle(radius?: ControlRadius): CSSProperties | undefined {
  if (!radius) return undefined;
  return { "--v-control-radius": { square: "0px", soft: "8px", round: "20px", pill: "999px" }[radius] } as CSSProperties;
}

// ---- registry/cojeev/ui/button.tsx (inlined) ----
const buttonVariants = cva(
  "v-btn [display:inline-flex] items-center justify-center gap-[var(--s-2)] h-[var(--ctl-md)] px-[var(--s-5)] py-0 rounded-[var(--r-pill)] text-[length:var(--fs-control)] font-[number:var(--fw-control)] leading-none whitespace-nowrap bg-[var(--v-ink)] text-[color:var(--v-on-ink)] motion-safe:active:[transform:translateY(1px)]",
  {
    variants: {
      variant: {
        default: "",
        accent:
          "-accent bg-[var(--v-pink)] text-[color:var(--v-on-accent)] hover:bg-[var(--v-pink-deep)]",
        secondary:
          "-secondary bg-[var(--v-blue)] text-[color:var(--v-on-accent)]",
        ghost:
          "-ghost bg-transparent text-[color:var(--v-text)] hover:bg-[var(--v-beige)]",
        outline:
          "-outline bg-transparent text-[color:var(--v-text)] [box-shadow:inset_0_0_0_1px_var(--v-edge)] hover:bg-[var(--v-beige-2)]",
        danger:
          "-danger bg-[var(--v-danger-fill)] text-[color:#fff]",
        block: "-block w-full",
      },
      size: {
        default: "",
        sm: "-sm h-[var(--ctl-sm)] px-[var(--s-4)] text-[length:var(--fs-small)]",
        lg: "-lg h-[var(--ctl-lg)] px-[var(--s-6)] text-[length:var(--fs-body)]",
      },
      shape: { pill: "", card: "-card" },
      fullWidth: { true: "-block w-full", false: "" },
    },
    defaultVariants: { variant: "default", size: "default", shape: "pill", fullWidth: false },
  },
);
type ButtonProps = Omit<React.ComponentProps<"button">, "ref"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    ref?: React.Ref<HTMLButtonElement | HTMLAnchorElement>;
    loading?: boolean;
    loadingIndicator?: React.ReactNode;
    radius?: ControlRadius;
  };
function Button({
  ref: externalRef,
  className,
  variant,
  size,
  shape,
  radius, style,
  fullWidth,
  loading,
  loadingIndicator,
  children,
  asChild = false,
  disabled,
  type = "button",
  "aria-busy": ariaBusy,
  "aria-disabled": ariaDisabled,
  onClick,
  onClickCapture,
  onAuxClickCapture,
  ...props
}: ButtonProps) {
  const morphRef = useMorph<HTMLButtonElement | HTMLAnchorElement>("buttons", externalRef);
  const pressRef = useFlowPress(morphRef);
  const busy = loading ?? (ariaBusy === true || ariaBusy === "true");
  const blocked = disabled || busy || ariaDisabled === true || ariaDisabled === "true";
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={pressRef}
      data-slot="button"
      data-part="root"
      data-r={shape === "card" ? 12 : undefined}
      data-control-shape={shape ?? undefined}
      style={{ ...style, ...controlRadiusStyle(radius) }}
      data-state={disabled ? "disabled" : busy ? "busy" : "rest"}
      type={asChild ? undefined : type}
      disabled={asChild ? undefined : disabled}
      aria-busy={busy || undefined}
      aria-disabled={blocked || undefined}
      onClickCapture={(event) => {
        if (asChild && blocked) { event.preventDefault(); event.stopPropagation(); return; }
        onClickCapture?.(event);
      }}
      onAuxClickCapture={(event) => {
        if (asChild && blocked) { event.preventDefault(); event.stopPropagation(); return; }
        onAuxClickCapture?.(event);
      }}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={cn(
        buttonVariants({ variant, size, shape, fullWidth }),
        "leading-none",
        className,
      )}
      {...props}
      tabIndex={asChild && disabled ? -1 : props.tabIndex}
    >
      <MotionPresence>
        {busy && (
          <MotionSurface key="loading" asChild preset="scale">
            <span
              data-slot="button-loading"
              className="v-btn__loading"
              aria-hidden="true"
            >
              {loadingIndicator ?? <ButtonIndicator />}
            </span>
          </MotionSurface>
        )}
      </MotionPresence>
      {asChild ? <Slottable>{children}</Slottable> : children}
    </Comp>
  );
}
function ButtonIndicator({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <Spinner
      data-slot="button-indicator"
      data-part="indicator"
      data-label=""
      aria-hidden="true"
      className={className}
      {...props}
    />
  );
}

// ---- registry/cojeev/motion/theme-transition.ts (inlined) ----
type ThemeRevealOrigin = { x:number; y:number };
type ThemeChangeDetails = { origin:ThemeRevealOrigin };
type ThemeRevealOptions = { origin?:ThemeRevealOrigin };
type ThemeMode_ThemeTransition = "light" | "dark";
let pendingOrigin: {origin:ThemeRevealOrigin; element:HTMLElement; time:number} | undefined;
let previousZone=-1;
function variedThemeOrigin(width:number,height:number,random= Math.random,previous=-1) {
  const zones=[[.07,.07],[.93,.07],[.93,.93],[.07,.93],[.06,.5],[.94,.5],[.5,.06],[.5,.94],[.5,.5]];
  const draw=Math.max(0,Math.min(.999999,random()));
  let zone=Math.floor(draw*(previous>=0?8:9));
  if(previous>=0&&zone>=previous)zone++;
  const [x,y]=zones[zone];
  const jitter=()=> (Math.max(0,Math.min(1,random()))-.5)*.07;
  return {origin:{x:Math.max(12,Math.min(width-12,width*(x+jitter()))),y:Math.max(12,Math.min(height-12,height*(y+jitter())))},zone};
}
function rememberThemeOrigin(element:HTMLElement):ThemeChangeDetails {
  const root=element.ownerDocument.documentElement;
  const choice=variedThemeOrigin(root.clientWidth,root.clientHeight,Math.random,previousZone);
  const origin=choice.origin;previousZone=choice.zone;
  pendingOrigin={origin,element,time:performance.now()};
  return {origin};
}
function themeRevealPath(progress:number,origin:ThemeRevealOrigin,width:number,height:number,phase=0) {
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
  const w=Math.max(1,Number.isFinite(width)?width:1),h=Math.max(1,Number.isFinite(height)?height:1);
  const x=Math.max(0,Math.min(w,Number.isFinite(origin.x)?origin.x:w/2)),y=Math.max(0,Math.min(h,Number.isFinite(origin.y)?origin.y:h/2));
  const reach=Math.hypot(Math.max(x,w-x),Math.max(y,h-y))/.72;
  const points=Array.from({length:12},(_,index)=>{
    const angle=index*Math.PI/6;
    const radius=reach*p*(1+.12*Math.sin(angle*3+p*.65+phase)+.065*Math.cos(angle*5-p*.35-phase*.7));
    return {x:x+Math.cos(angle)*radius,y:y+Math.sin(angle)*radius};
  });
  const f=(n:number)=>Number(n.toFixed(2));
  let path=`M${f(points[0].x)} ${f(points[0].y)}`;
  for(let i=0;i<points.length;i++){
    const before=points[(i+11)%12],start=points[i],end=points[(i+1)%12],after=points[(i+2)%12];
    path+=`C${f(start.x+(end.x-before.x)/6)} ${f(start.y+(end.y-before.y)/6)} ${f(end.x-(after.x-start.x)/6)} ${f(end.y-(after.y-start.y)/6)} ${f(end.x)} ${f(end.y)}`;
  }
  return path+"Z";
}
type Reveal = {scope:HTMLElement;from:ThemeMode_ThemeTransition;to:ThemeMode_ThemeTransition;requested:ThemeMode_ThemeTransition;ready:boolean;done:boolean;lane:ReturnType<typeof createMotionLane>;view:ViewTransition|null;anim?:Animation;finish:()=>void;run:()=>void};
let active:Reveal|undefined;
function applyTheme(mode:ThemeMode_ThemeTransition,quiet=false,root?:HTMLElement,options:ThemeRevealOptions={}) {
  if(typeof document==="undefined")return;
  const scope=root??document.documentElement,doc=scope.ownerDocument,canvas=doc.documentElement;
  const reduced=()=>doc.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches??false;
  const isQuiet=()=>quiet||doc.hidden||resolveChoreography(getSettingsSnapshot(),reduced()).quiet;
  if(active?.scope===scope&&!active.done){
    const reveal=active,changed=reveal.requested!==mode;
    reveal.requested=mode;pendingOrigin=undefined;
    if(isQuiet())reveal.finish();
    else if(changed&&reveal.ready)reveal.run();
    return;
  }
  active?.finish();
  if(scope.dataset.mode===mode){pendingOrigin=undefined;return;}
  const activation=pendingOrigin&&performance.now()-pendingOrigin.time<1500?pendingOrigin:undefined;
  const choice=variedThemeOrigin(canvas.clientWidth,canvas.clientHeight,Math.random,previousZone);
  const origin=options.origin??activation?.origin??choice.origin;
  if(!options.origin&&!activation)previousZone=choice.zone;
  const toggle=activation?.element.isConnected?activation.element:undefined;
  pendingOrigin=undefined;
  if(isQuiet()||typeof doc.startViewTransition!=="function"||!CSS.supports("clip-path",'path("M0 0L1 0L1 1Z")')){scope.dataset.mode=mode;return;}
  const from:ThemeMode_ThemeTransition=scope.dataset.mode==="dark"?"dark":"light";
  const width=canvas.clientWidth,height=canvas.clientHeight;
  // oovi: ~0.65s instead of upstream 1.2-1.38s; the long reveal read as lag.
  const phase=Math.random()*Math.PI*2,duration=.6+Math.random()*.08;
  const savedStyles=new Map(["--v-theme-clip","--v-theme-glyph","--v-theme-glyph-position","--v-theme-glyph-size","--v-theme-glyph-mask"].map(name=>[name,canvas.style.getPropertyValue(name)]));
  const savedAttributes=new Map(["data-theme-reveal","data-theme-progress","data-theme-origin"].map(name=>[name,canvas.getAttribute(name)]));
  const control=toggle?.getBoundingClientRect();
  const controlPath=control?`M${control.left+control.height/2} ${control.top}H${control.right-control.height/2}Q${control.right} ${control.top} ${control.right} ${control.top+control.height/2}Q${control.right} ${control.bottom} ${control.right-control.height/2} ${control.bottom}H${control.left+control.height/2}Q${control.left} ${control.bottom} ${control.left} ${control.top+control.height/2}Q${control.left} ${control.top} ${control.left+control.height/2} ${control.top}Z`:"";
  const glyph=toggle?.querySelector<SVGSVGElement>("svg:not(.v-morph)");
  const glyphBox=glyph?.getBoundingClientRect();
  const ratio=doc.defaultView?.devicePixelRatio||1;
  const glyphTile=glyphBox?{
    x:Math.floor(glyphBox.x*ratio)/ratio,
    y:Math.floor(glyphBox.y*ratio)/ratio,
    right:Math.ceil(glyphBox.right*ratio)/ratio,
    bottom:Math.ceil(glyphBox.bottom*ratio)/ratio,
  }:undefined;
  const image=(svg:string)=>`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  if(glyphTile){
    const{x,y,right,bottom}=glyphTile,w=right-x,h=bottom-y;
    canvas.style.setProperty("--v-theme-glyph-position",`${x}px ${y}px`);
    canvas.style.setProperty("--v-theme-glyph-size",`${w}px ${h}px`);
    canvas.style.setProperty("--v-theme-glyph-mask",image(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path fill="white" fill-rule="evenodd" d="M0 0H${width}V${height}H0ZM${x} ${y}H${x+w}V${y+h}H${x}Z"/></svg>`));
  }
  const paintGlyph=()=>{
    if(!glyph||!toggle||!glyphBox||!glyphTile)return;
    const face=toggle.querySelector<SVGPathElement>("svg.v-morph [data-morph-body]");
    const paint=face?getComputedStyle(face).fill:getComputedStyle(toggle).backgroundColor;
    const alpha=paint.match(/(?:rgba\([^,]+,[^,]+,[^,]+,|\/)\s*([\d.]+)(%)?\s*\)/);
    const opaque=paint!=="none"&&paint!=="transparent"&&(!alpha||Number(alpha[1])/(alpha[2]?100:1)>=.999)&&(!face||Number(getComputedStyle(face).opacity)>=.999);
    if(!opaque){
      canvas.style.removeProperty("--v-theme-glyph");
      canvas.style.removeProperty("--v-theme-glyph-mask");
      return;
    }
    const{x,y,right,bottom}=glyphTile;
    canvas.style.setProperty("--v-theme-glyph-mask",image(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path fill="white" fill-rule="evenodd" d="M0 0H${width}V${height}H0ZM${x} ${y}H${right}V${bottom}H${x}Z"/></svg>`));
    const copy=glyph.cloneNode(true) as SVGSVGElement;
    copy.setAttribute("xmlns","http://www.w3.org/2000/svg");copy.style.color=getComputedStyle(glyph).color;
    copy.setAttribute("width",String(glyphBox.width));copy.setAttribute("height",String(glyphBox.height));
    const tile=doc.createElementNS("http://www.w3.org/2000/svg","svg");
    tile.setAttribute("xmlns","http://www.w3.org/2000/svg");
    tile.setAttribute("width",String(glyphTile.right-glyphTile.x));
    tile.setAttribute("height",String(glyphTile.bottom-glyphTile.y));
    copy.setAttribute("x",String(glyphBox.x-glyphTile.x));
    copy.setAttribute("y",String(glyphBox.y-glyphTile.y));
    const back=doc.createElementNS("http://www.w3.org/2000/svg","rect");back.setAttribute("width","100%");back.setAttribute("height","100%");
    back.setAttribute("fill",paint);
    tile.append(back,copy);canvas.style.setProperty("--v-theme-glyph",image(tile.outerHTML));
  };
  let unsubscribe=()=>{};
  const media=doc.defaultView!.matchMedia("(prefers-reduced-motion: reduce)");
  const interrupt=()=>reveal.finish();
  const quietChanged=()=>{if(isQuiet())reveal.finish();};
  const lane=createMotionLane(0,value=>{
    if(reveal.done)return;
    paintGlyph();
    canvas.style.setProperty("--v-theme-clip",`path("${themeRevealPath(value,origin,width,height,phase)}${controlPath}")`);
    canvas.setAttribute("data-theme-progress",String(Number(value.toFixed(4))));
  });
  const reveal:Reveal={scope,from,to:mode,requested:mode,ready:false,done:false,lane,view:null,
    finish(){
      if(reveal.done)return;
      reveal.done=true;lane.dispose();scope.dataset.mode=reveal.requested;reveal.view?.skipTransition();
      unsubscribe();media.removeEventListener("change",quietChanged);doc.removeEventListener("visibilitychange",quietChanged);
      doc.removeEventListener("scroll",interrupt,true);doc.defaultView?.removeEventListener("resize",interrupt);
      if(active===reveal){
        for(const[name,value]of savedStyles){if(value)canvas.style.setProperty(name,value);else canvas.style.removeProperty(name);}
        for(const[name,value]of savedAttributes){if(value===null)canvas.removeAttribute(name);else canvas.setAttribute(name,value);}
        active=undefined;
      }
    },
    run(){
      // oovi: upstream tweened a value in JS and wrote the clip path to <html> every frame.
      // An inherited custom property on the root restyles the whole document each frame, and
      // paintGlyph rebuilt a data URL alongside it, which is what made the switch stutter.
      // The same organic contour is sampled once and handed to the browser as one animation on
      // the snapshot pseudo-element, so nothing on the page is touched while it plays.
      if(reveal.anim){reveal.anim.reverse();return}
      const frames=Array.from({length:25},(_,i)=>`path("${themeRevealPath(i/24,origin,width,height,phase)}${controlPath}")`);
      try{
        const anim=canvas.animate({clipPath:frames},{duration:duration*1000/Math.max(.25,getSettingsSnapshot().flow.speed),easing:"cubic-bezier(.42,0,.18,1)",fill:"forwards",pseudoElement:"::view-transition-new(root)"});
        reveal.anim=anim;
        void anim.finished.then(()=>reveal.finish(),()=>{});
      }catch{reveal.finish();}
    },
  };
  active=reveal;canvas.setAttribute("data-theme-reveal",mode);canvas.setAttribute("data-theme-origin",`${origin.x} ${origin.y}`);lane.jump(0);
  unsubscribe=subscribeSettings(quietChanged);media.addEventListener("change",quietChanged);doc.addEventListener("visibilitychange",quietChanged);
  doc.addEventListener("scroll",interrupt,{capture:true,passive:true});doc.defaultView?.addEventListener("resize",interrupt,{passive:true});
  try{
    reveal.view=doc.startViewTransition(()=>{if(!reveal.done)scope.dataset.mode=reveal.to;});
    void reveal.view.ready.then(()=>{if(!reveal.done){reveal.ready=true;if(isQuiet())reveal.finish();else reveal.run();}},()=>reveal.finish());
    void reveal.view.finished.then(()=>reveal.finish(),()=>reveal.finish());
  }catch{reveal.finish();}
}

// ---- registry/cojeev/ui/theme-toggle.tsx ----
export type ThemeMode = "light" | "dark";
export type ThemeToggleProps = Omit<ButtonProps,"onChange"> & {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode, details?:ThemeChangeDetails) => void;
  showLabel?: boolean;
  label?: React.ReactNode;
  responsive?: boolean;
};
const sun = "M12 5C15.866 5 19 8.134 19 12C19 15.866 15.866 19 12 19C8.134 19 5 15.866 5 12C5 8.134 8.134 5 12 5Z";
const moon = "M18.9 15.2C17.2 19.3 12.9 21.2 8.8 19.4C4.7 17.6 2.7 13 4.4 8.8C5.4 6.2 7.7 4.3 10.4 3.8C8.1 10.4 12.3 16.8 18.9 15.2Z";
function ThemeToggleImpl({mode,onModeChange,showLabel=true,label,responsive=false,className,onClick,...props}:ThemeToggleProps) {
  const {quiet,transition}=useChoreography();
  const dark=mode==="dark";
  return <Button variant="ghost" size="sm" data-label={showLabel?"visible":"hidden"} data-responsive={responsive} data-morph="both" data-tier="pill" data-lobes="3" data-depth=".008" data-asym=".05" role="switch" aria-checked={dark} aria-label="Dark appearance" title={`Switch to ${dark?"light":"dark"} theme`} className={cn("v-theme-toggle",className)} onClick={event=>{onClick?.(event);if(!event.defaultPrevented)onModeChange(dark?"light":"dark",rememberThemeOrigin(event.currentTarget))}} {...props} data-slot="theme-toggle">
    <svg data-slot="theme-toggle-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" focusable="false">
      <motion.g initial={false} animate={{rotate:dark?45:0}} transition={transition} style={{transformOrigin:"12px 12px"}}>
        {Array.from({length:8},(_,i)=><motion.path key={i} d="M12 1.5V3" transform={`rotate(${i*45} 12 12)`} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" initial={false} animate={{pathLength:dark?0:1,opacity:dark?0:1}} transition={{duration:quiet?0:.2,delay:quiet?0:i*.015}}/>)}
      </motion.g>
      <motion.path initial={false} d={dark?moon:sun} animate={{d:dark?moon:sun,rotate:dark?-12:0}} transition={transition} fill="currentColor" style={{transformOrigin:"12px 12px"}}/>
    </svg>
    {showLabel&&<span className="v-theme-toggle__label">{label ?? (dark?"Dark":"Light")}</span>}
  </Button>;
}
export function ThemeToggle(props: Parameters<typeof ThemeToggleImpl>[0]) {
  return (
    <>
      <CojeevStyles />
      {ThemeToggleImpl(props)}
    </>
  );
}

export { applyTheme, type ThemeChangeDetails, type ThemeRevealOrigin, type ThemeRevealOptions };

// ---- Styles ----
// Upstream ships ~900 lines: its whole token sheet, two remote fonts, the flow-group and form
// rules. Only the toggle renders here, so this keeps the rules it uses. Its --v-* tokens are
// pointed at oovi's tokens on the toggle itself, so they follow oovi's light and dark modes and
// nothing leaks onto :root.
const COJEEV_CSS = `
@layer theme, base, components, utilities, cojeev-states, cojeev-flow, cojeev-morph, cojeev-accessibility;

[data-slot="theme-toggle"] {
  --v-paper: var(--color-raised); --v-beige: var(--color-surface); --v-beige-2: var(--color-surface);
  --v-border: var(--color-line-strong); --v-edge: var(--color-line-strong);
  --v-text: var(--color-fg); --v-text-2: var(--color-fg-2); --v-ink: var(--color-fg); --v-on-ink: var(--color-ink);
  --v-brand: var(--color-accent); --v-pink: var(--color-accent); --v-on-accent: var(--color-ink);
  --v-disabled-face: var(--color-surface); --v-disabled-ink: var(--color-fg-3); --v-disabled-edge: var(--color-line-strong);
  --font-text: var(--font-sans);
  --s-2: 8px; --s-4: 16px; --s-5: 20px; --ctl-sm: 32px; --ctl-md: 40px; --r-pill: 999px; --r-md: 12px;
  --fs-small: 13px; --fs-control: 14px; --fs-caps: 11px; --fw-medium: 500; --fw-control: 500;
  --t-micro: 120ms; --enter: cubic-bezier(.2,.8,.2,1);
  font-family: var(--font-text);
}

@layer base {
  :where([data-slot="theme-toggle"]) { box-sizing: border-box; border: 0; background: none; padding: 0; cursor: pointer; color: var(--v-text); font: inherit; }
  :where([data-slot="theme-toggle"]) svg { display: block; max-width: 100%; }
  [data-slot="theme-toggle"]:focus-visible { outline: 2px solid var(--v-brand); outline-offset: 2px; }
}

@layer cojeev-flow {
  [data-morph]:where([data-slot].v-morph-host) { transition: transform 0s; }
}

@layer cojeev-morph {
  [data-slot].v-morph-host { isolation: isolate; }
  [data-slot].v-morph-rel { position: relative; }
  [data-slot].v-morph-host > svg.v-morph { max-width: none; max-height: none; }
  [data-slot].v-morph-host > svg.v-morph, [data-slot].v-morph-host > svg.v-morph * { pointer-events: none; }
  [data-slot].v-morph-host > svg.v-morph > [data-morph-body]:not([data-morph-colors]) { fill: var(--mfill, transparent); }
  [data-slot].v-morph-host > svg.v-morph > [data-morph-body][stroke] { stroke: var(--mstroke, transparent); }
  [data-slot].v-morph-host[data-morph="stroke"] > svg.v-morph > [data-morph-body] { fill: none; }
  [data-slot].v-morph-host > svg.v-morph > [data-morph-echo] { fill: none; }
  [data-slot].v-morph-live[data-morph="stroke"], [data-slot].v-morph-live[data-morph="both"] { border-color: transparent; box-shadow: none; }
}

@layer cojeev-states {
  .v-btn[data-slot] { text-decoration: none; transition: background var(--t-micro) var(--enter), color var(--t-micro), transform var(--t-micro) var(--enter); }
  .v-btn[data-slot][aria-busy="true"] { position: relative; cursor: progress; }
  .v-btn__loading[data-slot] { --pulse: 20px; display: inline-flex; align-items: center; justify-content: center; flex: none; pointer-events: none; }
  .v-pulse[data-slot] svg { width: 100%; height: 100%; overflow: visible; }
  .v-pulse[data-slot] .seed { fill: currentColor; }
  .v-pulse[data-slot] .core { fill: transparent; }
  .v-motion-surface[data-motion-surface] { translate: var(--presence-x,0px) var(--presence-y,0px); scale: var(--presence-scale,1); }
  .v-motion-surface[data-motion-quiet="true"] { translate: none; scale: none; }

  :root .v-btn.v-theme-toggle[data-slot][data-label] {
    --mfill: var(--v-paper); --mstroke: var(--v-border);
    gap: var(--s-2); height: 44px; width: 112px; min-width: 112px; padding: 0 var(--s-4); border-radius: var(--r-pill);
    background: var(--mfill); color: var(--v-text); box-shadow: inset 0 0 0 1px var(--v-border);
  }
  :root .v-btn.v-theme-toggle[data-slot][data-label]:is(:hover,:focus-visible) { --mfill: var(--v-beige); --mstroke: var(--v-text-2); }
  :root .v-btn.v-theme-toggle[data-slot][data-label]:has(>svg.v-morph) { background: transparent; box-shadow: none; }
  [data-slot="theme-toggle-icon"] { flex: none; overflow: visible; }
  .v-theme-toggle__label { color: inherit; font: var(--fw-medium) var(--fs-small)/1 var(--font-text); }
  :root .v-btn.v-theme-toggle[data-slot][data-label="hidden"] { min-width: 44px; width: 44px; padding: 0; }
  @media (max-width: 640px) {
    :root .v-btn.v-theme-toggle[data-slot][data-responsive="true"] { min-width: 44px; width: 44px; padding: 0; }
    .v-theme-toggle[data-responsive="true"] .v-theme-toggle__label { display: none; }
  }

  /* The destination DOM is clipped; Motion owns the changing organic contour. */
  :root[data-theme-reveal]::view-transition { pointer-events: none; }
  :root[data-theme-reveal]::view-transition-group(root) { animation: none; background-image: var(--v-theme-glyph,none); background-position: var(--v-theme-glyph-position,0 0); background-size: var(--v-theme-glyph-size,0 0); background-repeat: no-repeat; }
  :root[data-theme-reveal]::view-transition-image-pair(root) { isolation: isolate; }
  :root[data-theme-reveal]::view-transition-old(root),
  :root[data-theme-reveal]::view-transition-new(root) { mix-blend-mode: normal; opacity: 1; mask-image: var(--v-theme-glyph-mask,none); mask-size: 100% 100%; }
  :root[data-theme-reveal]::view-transition-old(root) { animation: none; z-index: 1; }
  :root[data-theme-reveal]::view-transition-new(root) { animation: v-theme-retain 8s linear; clip-path: var(--v-theme-clip); z-index: 2; }
  @keyframes v-theme-retain { from { opacity: 1; } to { opacity: 1; } }
}

@layer cojeev-accessibility {
  @media (prefers-reduced-motion: reduce) {
    [data-slot="theme-toggle"], [data-slot="theme-toggle"] * { animation-duration: 0s; transition-duration: 0s; }
  }
}
`;

function CojeevStyles() {
  return (
    <style href="000h-theme-toggle" precedence="default">
      {COJEEV_CSS}
    </style>
  );
}
