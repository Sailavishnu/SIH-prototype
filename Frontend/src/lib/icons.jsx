/* Inline stroke icons (24x24 grid, currentColor). No icon library dependency. */
import React from 'react';

const Svg = ({ size = 18, children, fill = 'none', sw = 1.8, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

export const IconHome = (p) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.6V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.6" /></Svg>;
export const IconMap = (p) => <Svg {...p}><path d="m9 3-6 3v15l6-3 6 3 6-3V3l-6 3-6-3Z" /><path d="M9 3v15M15 6v15" /></Svg>;
export const IconPin = (p) => <Svg {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></Svg>;
export const IconGrid = (p) => <Svg {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></Svg>;
export const IconTable = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9.5h18M9 9.5V20M3 15h18" /></Svg>;
export const IconAlert = (p) => <Svg {...p}><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4.2M12 17h.01" /></Svg>;
export const IconTraffic = (p) => <Svg {...p}><rect x="7" y="2.5" width="10" height="19" rx="4" /><path d="M12 7.2h.01M12 12h.01M12 16.8h.01" /></Svg>;
export const IconRoad = (p) => <Svg {...p}><path d="M6 3 3 21M18 3l3 18M12 4v3M12 10.5v3M12 17v3" /></Svg>;
export const IconBus = (p) => <Svg {...p}><rect x="3.5" y="3.5" width="17" height="13" rx="2.5" /><path d="M3.5 10.5h17M7 20v1.2M17 20v1.2M6.5 16.5v3.5M17.5 16.5v3.5" /><circle cx="7.5" cy="13.6" r="1" fill="currentColor" stroke="none" /><circle cx="16.5" cy="13.6" r="1" fill="currentColor" stroke="none" /></Svg>;
export const IconChart = (p) => <Svg {...p}><path d="M3 21h18" /><rect x="5" y="11" width="3.6" height="7" rx="1" /><rect x="10.2" y="6.5" width="3.6" height="11.5" rx="1" /><rect x="15.4" y="14" width="3.6" height="4" rx="1" /></Svg>;
export const IconFile = (p) => <Svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></Svg>;
export const IconUsers = (p) => <Svg {...p}><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" /><path d="M16.5 5.2a3.4 3.4 0 0 1 0 5.9M17.6 14.4A6.2 6.2 0 0 1 21.2 20" /></Svg>;
export const IconDownload = (p) => <Svg {...p}><path d="M12 3v12" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 20h16" /></Svg>;
export const IconUpload = (p) => <Svg {...p}><path d="M12 16V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M4 20h16" /></Svg>;
export const IconCamera = (p) => <Svg {...p}><path d="M4 7.5h3l1.6-2.4h6.8L17 7.5h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z" /><circle cx="12" cy="13" r="3.4" /></Svg>;
export const IconImage = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m3.5 17 4.8-4.6a2 2 0 0 1 2.7 0L20.5 20" /></Svg>;
export const IconSearch = (p) => <Svg {...p}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m20 20-4.4-4.4" /></Svg>;
export const IconFilter = (p) => <Svg {...p}><path d="M3.5 5.5h17l-6.6 7.8V20l-3.8-2v-4.7L3.5 5.5Z" /></Svg>;
export const IconCheck = (p) => <Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>;
export const IconCheckCircle = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12.3 2.7 2.7L16 9.5" /></Svg>;
export const IconX = (p) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const IconChevronRight = (p) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>;
export const IconChevronLeft = (p) => <Svg {...p}><path d="m15 5-7 7 7 7" /></Svg>;
export const IconChevronDown = (p) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
export const IconArrowUp = (p) => <Svg {...p}><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></Svg>;
export const IconArrowDown = (p) => <Svg {...p}><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></Svg>;
export const IconArrowRight = (p) => <Svg {...p}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></Svg>;
export const IconArrowLeft = (p) => <Svg {...p}><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></Svg>;
export const IconClock = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" /></Svg>;
export const IconCalendar = (p) => <Svg {...p}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
export const IconLayers = (p) => <Svg {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3.5 13 8.5 4.7L20.5 13" /></Svg>;
export const IconFlame = (p) => <Svg {...p}><path d="M12 3s5 4.2 5 8.6a5 5 0 0 1-10 0C7 9.4 9 7.6 9 7.6s.4 2.2 1.7 2.2C11.8 9.8 12 6.6 12 3Z" /></Svg>;
export const IconSparkle = (p) => <Svg {...p}><path d="M12 3.2 13.7 9l5.8 1.7-5.8 1.7L12 18.2 10.3 12.4 4.5 10.7 10.3 9 12 3.2Z" /><path d="M18.6 3v3M20.1 4.5h-3" /></Svg>;
export const IconShield = (p) => <Svg {...p}><path d="M12 3 5 6v5.6c0 4.4 3 7.6 7 9.4 4-1.8 7-5 7-9.4V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.2 10" /></Svg>;
export const IconLock = (p) => <Svg {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></Svg>;
export const IconMail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.6 6.5 8.4 6 8.4-6" /></Svg>;
export const IconLogout = (p) => <Svg {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 8 6 12l4 4M6 12h9" /></Svg>;
export const IconUser = (p) => <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" /></Svg>;
export const IconBell = (p) => <Svg {...p}><path d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5h-14S6.5 14 6.5 10Z" /><path d="M10.2 19a2 2 0 0 0 3.6 0" /></Svg>;
export const IconSettings = (p) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z" /></Svg>;
export const IconShare = (p) => <Svg {...p}><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4" /></Svg>;
export const IconStar = (p) => <Svg {...p}><path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z" /></Svg>;
export const IconPlus = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconMinus = (p) => <Svg {...p}><path d="M5 12h14" /></Svg>;
export const IconInbox = (p) => <Svg {...p}><path d="M3.5 13.5 6 5.2A2 2 0 0 1 7.9 4h8.2a2 2 0 0 1 1.9 1.2l2.5 8.3" /><path d="M3.5 13.5H8l1.4 2.6h5.2l1.4-2.6h4.5V18a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-4.5Z" /></Svg>;
export const IconWater = (p) => <Svg {...p}><path d="M12 3.2s6 6.2 6 10.1a6 6 0 0 1-12 0C6 9.4 12 3.2 12 3.2Z" /></Svg>;
export const IconSignal = (p) => <Svg {...p}><path d="M4 20V13M9.3 20V9M14.7 20V5.5M20 20v-9" /></Svg>;
export const IconWifiOff = (p) => <Svg {...p}><path d="m2.5 2.5 19 19" /><path d="M8.2 15.4a5.5 5.5 0 0 1 7.4-.3M4.6 11.5a10.5 10.5 0 0 1 4-2.4M19.4 11.5a10.6 10.6 0 0 0-8.6-2.8M12 19.5h.01" /></Svg>;
export const IconRefresh = (p) => <Svg {...p}><path d="M20.5 12a8.5 8.5 0 0 1-14.7 5.8L3.5 15.5" /><path d="M3.5 12A8.5 8.5 0 0 1 18.2 6.2l2.3 2.3" /><path d="M20.5 4v4.5H16M3.5 20v-4.5H8" /></Svg>;
export const IconEye = (p) => <Svg {...p}><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></Svg>;
export const IconTarget = (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></Svg>;
export const IconGauge = (p) => <Svg {...p}><path d="M4 17a9 9 0 1 1 16 0" /><path d="m12 13.5 4-4" /><circle cx="12" cy="14.5" r="1.4" /></Svg>;
export const IconBuilding = (p) => <Svg {...p}><path d="M4 21V6.5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 13 6.5V21" /><path d="M13 11h5.5A1.5 1.5 0 0 1 20 12.5V21M2.5 21h19M7 9h2.5M7 13h2.5M7 17h2.5M16 15h1.5M16 18h1.5" /></Svg>;
export const IconMenu = (p) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const IconInfo = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>;
export const IconExternal = (p) => <Svg {...p}><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" /></Svg>;
export const IconLocate = (p) => <Svg {...p}><circle cx="12" cy="12" r="7" /><path d="M12 2v3M12 19v3M22 12h-3M5 12H2" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /></Svg>;
export const IconPen = (p) => <Svg {...p}><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4.2 1.2L5 15 16.5 3.5Z" /></Svg>;
export const IconLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#155EEF" />
    <path d="M16 7.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 3.2a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Z" fill="#fff" opacity=".92" />
    <circle cx="16" cy="16" r="2.6" fill="#14B8A6" />
  </svg>
);
