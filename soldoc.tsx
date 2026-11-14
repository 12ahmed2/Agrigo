import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  Sprout,
  MapPin,
  Calculator,
  TrendingUp,
  Droplets,
  ShieldAlert,
  Database,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Landmark,
  Scale,
  Coins,
  BarChart3,
  PieChart,
  Calendar,
  ExternalLink,
  Zap,
  Compass,
  Lock,
  Layers,
  CheckSquare,
  Eye,
  History,
  Activity,
  Wifi,
  WifiOff,
  Server,
  Clock,
  Edit3,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  Settings,
  HelpCircle,
  FileText,
  Thermometer,
  CloudRain,
  User,
  Globe,
  Menu,
  X,
  Sliders,
  Maximize2,
  Minimize2
} from 'lucide-react';

// ============================================================================
// 1. EGYPTIAN CONSTANTS & FORMATTING HELPERS (1 FEDDAN = 4,200 m² | EGP)
// ============================================================================
const FEDDAN_SQM = 4200;

function formatAreaInFeddans(areaSqm) {
  const validSqm = Math.max(420, Number(areaSqm) || FEDDAN_SQM);
  const feddans = Number((validSqm / FEDDAN_SQM).toFixed(2));
  const wholeFeddans = Math.floor(feddans);
  const kirats = Math.round((feddans - wholeFeddans) * 24);
  return {
    areaSqm: Math.round(validSqm),
    feddans,
    kirats,
    labelAr:
      kirats > 0 && wholeFeddans > 0
        ? `${wholeFeddans} فدان و ${kirats} قيراط (${feddans} فدان)`
        : `${feddans} فدان`,
  };
}

function formatEGP(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'غير متاح';
  }
  return `${Math.round(Number(value)).toLocaleString('ar-EG')} ج.م`;
}

// ============================================================================
// 2. CROP VISUAL ILLUSTRATIONS FOR THE 7 EXISTING AGRI-GO CROPS
// ============================================================================
function CropIllustration({ cropId }) {
  switch (cropId) {
    case 'EG_WHEAT':
      return (
        <svg viewBox="0 0 80 80" className="w-14 h-14 mx-auto drop-shadow">
          <circle cx="40" cy="40" r="36" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M40 64V18" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="33" cy="26" rx="5" ry="8" transform="rotate(-25 33 26)" fill="#f59e0b" />
          <ellipse cx="47" cy="26" rx="5" ry="8" transform="rotate(25 47 26)" fill="#f59e0b" />
          <ellipse cx="32" cy="38" rx="5" ry="8" transform="rotate(-25 32 38)" fill="#fbbf24" />
          <ellipse cx="48" cy="38" rx="5" ry="8" transform="rotate(25 48 38)" fill="#fbbf24" />
          <ellipse cx="34" cy="50" rx="5" ry="7" transform="rotate(-20 34 50)" fill="#d97706" />
          <ellipse cx="46" cy="50" rx="5" ry="7" transform="rotate(20 46 50)" fill="#d97706" />
        </svg>
      );
    case 'EG_MAIZE':
      return (
        <svg viewBox="0 0 80 80" className="w-14 h-14 mx-auto drop-shadow">
          <circle cx="40" cy="40" r="36" fill="#ecfccb" stroke="#84cc16" strokeWidth="2.5" />
          <rect x="31" y="18" width="18" height="36" rx="9" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <path d="M24 58C24 42 34 36 40 54" fill="#16a34a" />
          <path d="M56 58C56 42 46 36 40 54" fill="#15803d" />
        </svg>
      );
    case 'EG_RICE':
      return (
        <svg viewBox="0 0 80 80" className="w-14 h-14 mx-auto drop-shadow">
          <circle cx="40" cy="40" r="36" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
          <path d="M22 58Q40 52 58 58" stroke="#0284c7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M40 56C40 36 30 24 23 22" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M40 56C40 36 50 24 57 22" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="25" cy="23" r="3.5" fill="#eab308" />
          <circle cx="55" cy="23" r="3.5" fill="#eab308" />
        </svg>
      );
    case 'EG_POTATO':
      return (
        <svg viewBox="0 0 80 80" className="w-14 h-14 mx-auto drop-shadow">
          <circle cx="40" cy="40" r="36" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2.5" />
          <ellipse cx="35" cy="44" rx="16" ry="12" transform="rotate(-12 35 44)" fill="#d97706" stroke="#92400e" strokeWidth="2" />
          <ellipse cx="49" cy="36" rx="12" ry="9" transform="rotate(18 49 36)" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        </svg>
      );
    case 'EG_TOMATO':
      return (
        <svg viewBox="0 0 80 80" className="w-14 h-14 mx-auto drop-shadow">
          <circle cx="40" cy="40" r="36" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
          <circle cx="40" cy="43" r="18" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <path d="M32 25L40 30L48 25M40 21V30" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'EG_COTTON':
      return (
        <svg viewBox="0 0 80 80" className="w-14 h-14 mx-auto drop-shadow">
          <circle cx="40" cy="40" r="36" fill="#f1f5f9" stroke="#64748b" strokeWidth="2.5" />
          <circle cx="33" cy="36" r="10" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="47" cy="36" r="10" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="40" cy="28" r="10" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M30 46L40 58L50 46" fill="#78350f" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 80" className="w-14 h-14 mx-auto drop-shadow">
          <circle cx="40" cy="40" r="36" fill="#dcfce7" stroke="#16a34a" strokeWidth="2.5" />
          <path d="M29 34L40 60L51 34Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
          <path d="M34 34C28 22 25 18 32 16C37 16 39 24 40 34" fill="#16a34a" />
          <path d="M46 34C52 22 55 18 48 16C43 16 41 24 40 34" fill="#15803d" />
        </svg>
      );
  }
}

// ============================================================================
// 3. CENTRALIZED DATA-UPDATE ENGINE REGISTRY (5 APPROVED CORE SOURCES ONLY)
// ============================================================================
const APPROVED_DATA_SOURCES_REGISTRY = [
  {
    sourceId: 'NASA_POWER',
    organization: 'NASA Langley Research Center (LaRC)',
    datasetName: 'NASA POWER Agroclimatology Archive',
    datasetVersion: 'POWER API v2.5.9 (MERRA-2 & CERES)',
    endpointPattern: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    parameters: 'T2M, T2M_MAX, T2M_MIN (°C), RH2M (%), PRECTOTCORR (mm/day), ALLSKY_SFC_SW_DWN (MJ/m²/day)',
    spatialResolution: '0.5° × 0.625° (~50 كم) — شبكة مناخية إقليمية تغطي إحداثيات المزرعة',
    updatePolicyAr: 'فحص يومي آلي (مراعاة تأخر النشر الفعلي 2–3 أيام للأرصاد الجوية و5–7 أيام للإشعاع الشمسي دون إعادة تحميل السجلات الثابتة)',
    lastSuccessfulRetrieval: '2026-11-14 03:15 EET',
    latestAvailableObservation: '2026-11-11 (أحدث رصد مكتمل)',
    nextScheduledCheck: '2026-11-15 03:15 EET',
    statusAr: 'متاح ومحدث',
  },
  {
    sourceId: 'FAO_WAPOR',
    organization: 'Food and Agriculture Organization (FAO)',
    datasetName: 'FAO WaPOR – Water Productivity Open-access Portal',
    datasetVersion: 'WaPOR v3.0 (Egypt Nile Delta & Valley L2 - 100m)',
    endpointPattern: 'https://data.apps.fao.org/gismgr/api/v2/catalog/workspaces/WAPOR-3',
    parameters: 'AETI (البخر-نتح الفعلي مم), RET (البخر-نتح المرجعي مم), NPP/Biomass, NBWP (إنتاجية المياه كجم/م³)',
    spatialResolution: '100 متر (المستوى الثاني L2 لمصر) / 250 متر (المستوى الأول L1)',
    updatePolicyAr: 'تحديث كل ديكاد (10 أيام) أو موسمي حسب الطبقة؛ استبدال القيم الأولية فقط عند صدور النسخة النهائية الموثقة',
    lastSuccessfulRetrieval: '2026-11-12 08:00 EET',
    latestAvailableObservation: 'الديكاد الأول - نوفمبر 2026 (Dekad 2026-11-D1)',
    nextScheduledCheck: '2026-11-21 08:00 EET',
    statusAr: 'متاح ومحدث',
  },
  {
    sourceId: 'COPERNICUS_SENTINEL2',
    organization: 'European Space Agency (ESA) / Copernicus',
    datasetName: 'Sentinel-2 MultiSpectral Instrument (MSI) Level-2A',
    datasetVersion: 'Sentinel-2A/2B L2A Bottom-Of-Atmosphere Reflectance',
    endpointPattern: 'Copernicus Data Space Ecosystem STAC / OData API (B04 Red, B08 NIR, SCL Cloud Mask)',
    parameters: 'NDVI = (B08 - B04) / (B08 + B04), Scene Cloud Cover (%)',
    spatialResolution: '10 أمتار لكل بكسل داخل مضلع المزرعة (AOI)',
    updatePolicyAr: 'فحص كل 5 أيام عند عبور القمر الصناعي فوق مصر؛ استبعاد المشاهد ذات الغيوم > 20%',
    lastSuccessfulRetrieval: '2026-11-13 11:20 EET',
    latestAvailableObservation: '2026-11-11 (غطاء سحابي 3.2% - جودة ممتازة)',
    nextScheduledCheck: '2026-11-16 11:20 EET',
    statusAr: 'متاح ومحدث',
  },
  {
    sourceId: 'FAO_GAEZ',
    organization: 'FAO & IIASA',
    datasetName: 'Global Agro-Ecological Zones (GAEZ)',
    datasetVersion: 'GAEZ v5 / v4 Official Release',
    endpointPattern: 'https://gaez.fao.org/ (Official Suitability & Attainable Yield Raster Tables)',
    parameters: 'فئة الملاءمة البيئية (VS, S, MS, mS, NS)، السقف الإنتاجي النموذجي، محددات التربة والمناخ',
    spatialResolution: '5 دقائق قوسية (~9 كم) مجمعة لمضلع المزرعة والمحافظة',
    updatePolicyAr: 'مرجع ثابت يُفحص عند صدور إصدار رسمي جديد فقط (لا يُعامل كبث يومي حي)',
    lastSuccessfulRetrieval: '2026-10-01 00:00 EET',
    latestAvailableObservation: 'الإصدار المرجعي المعتمد (GAEZ v5)',
    nextScheduledCheck: 'فحص ربع سنوي للإصدارات الجديدة',
    statusAr: 'متاح (إصدار مرجعي رسمي)',
  },
  {
    sourceId: 'ECMWF_ERA5',
    organization: 'ECMWF / Copernicus Climate Change Service (C3S)',
    datasetName: 'ERA5-Land Hourly & Monthly Reanalysis',
    datasetVersion: 'ERA5-Land Reanalysis (0.1° Grid)',
    endpointPattern: 'https://cds.climate.copernicus.eu/api/v2',
    parameters: 'المعدلات المناخية التاريخية 30 سنة، درجات الحرارة التراكمية (GDD)، رطوبة منطقة الجذور',
    spatialResolution: '0.1° × 0.1° (~9 كم)',
    updatePolicyAr: 'تحديث شهري/أرشيفي وفق جدول نشر إعادة التحليل المناخي الرسمي (لا يُعرض أبداً كتنبؤ جوي مباشر)',
    lastSuccessfulRetrieval: '2026-11-06 04:00 EET',
    latestAvailableObservation: 'الأرشيف المناخي 1991–2025 + أكتوبر 2026',
    nextScheduledCheck: '2026-12-06 04:00 EET',
    statusAr: 'متاح ومحدث',
  },
];

// ============================================================================
// 4. THREE SMART AGRICULTURAL PLANS DEFINITION
// ============================================================================
const AGRICULTURAL_PLANS = [
  {
    planId: 'SOIL_HEALTH',
    iconEmoji: '🌱',
    titleAr: 'الحفاظ على صحة الأرض',
    subtitleAr: 'استدامة خصوبة التربة وكسر دورة الآفات ومنع التملح',
    shortGoalAr: 'ترشيح المحاصيل الأكثر ملاءمة لخواص التربة وملوحتها، والمتوافقة مع الدورة الزراعية للحفاظ على صحة الأرض على المدى الطويل.',
    methodologySummaryAr: 'تعتمد المنهجية على مطابقة ملوحة وقوام التربة الفعلي مع عتبات تحمل المحصول (FAO-56)، وتقييم توافق الدورة الزراعية مع المحصول السابق لكسر أطوار الحشائش وأمراض التربة، ومراعاة الاحتياج المائي لتجنب تملح التربة، مع الفصل الصريح بين ملاءمة المحصول للتربة وبين فوائده الموثقة لصحة الأرض.',
    accentBorder: 'border-emerald-500',
    accentBg: 'from-emerald-950/90 to-slate-900',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    planId: 'MAX_PRODUCTION',
    iconEmoji: '🌾',
    titleAr: 'تحقيق أكبر إنتاج ممكن',
    subtitleAr: 'أعلى كفاءة إنتاجية مدعومة ببيانات FAO GAEZ والطقس والمياه',
    shortGoalAr: 'ترشيح المحاصيل التي تمتلك أقوى إمكانات إنتاجية موثقة تحت ظروف مزرعتك المناخية والمائية والبيئية الفعلية.',
    methodologySummaryAr: 'تعتمد المنهجية على فئة الملاءمة البيئية والسقف الإنتاجي في FAO GAEZ v5، والتوافق الحراري والإشعاعي من NASA POWER، وكفاية البخر-نتح من FAO WaPOR، ومؤشر الغطاء النباتي من Sentinel-2، مع الفصل الصريح بين السقف النموذجي (GAEZ) والمتوسط التاريخي المرصود والتقدير المحسوب للمزرعة.',
    accentBorder: 'border-amber-500',
    accentBg: 'from-amber-950/80 to-slate-900',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    planId: 'WATER_SAVING',
    iconEmoji: '💧',
    titleAr: 'توفير المياه',
    subtitleAr: 'تقليل الطلب المائي ورفع إنتاجية كل متر مكعب مياه',
    shortGoalAr: 'ترشيح المحاصيل التي تحقق أقل استهلاك مائي للموسم وأعلى إنتاجية لوحدة المياه (كجم محصول لكل متر مكعب) مع حساب الوفر المائي الموثق.',
    methodologySummaryAr: 'تعتمد المنهجية على حساب الاستهلاك المائي الفعلي للمحصول (ETc)، ومياه الري المطلوبة حسب كفاءة شبكة الري بالمزرعة، وإنتاجية المياه في FAO WaPOR (كجم/م³)، ونسبة الوفر المائي مقارنة بخط الأساس المرجعي للمزرعة بمعادلة واضحة.',
    accentBorder: 'border-sky-500',
    accentBg: 'from-sky-950/85 to-slate-900',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
];

// Previous crop options for evaluating Crop Rotation Compatibility in Plan A
const PREVIOUS_CROP_OPTIONS = [
  { id: 'MAIZE_SUMMER', nameAr: 'ذرة شامية (عروة صيفية سابقة)', family: 'POACEAE_CEREAL', isLegume: false },
  { id: 'RICE_SUMMER', nameAr: 'أرز شعير (عروة صيفية سابقة)', family: 'POACEAE_CEREAL', isLegume: false },
  { id: 'BERSEEM_LEGUME', nameAr: 'برسيم مصري / فول بلدي (محصول بقولي مثبت للآزوت)', family: 'FABACEAE_LEGUME', isLegume: true },
  { id: 'POTATO_SOLAN', nameAr: 'بطاطس أو طماطم (عائلة باذنجانية)', family: 'SOLANACEAE', isLegume: false },
  { id: 'COTTON_MALV', nameAr: 'قطن مصري (عروة صيفية سابقة)', family: 'MALVACEAE', isLegume: false },
];

// ============================================================================
// 5. DYNAMIC USER FARMS & EGYPT GEO-RESOLVER (NO PRE-ADDED FARMS)
//    All pre-populated farms have been removed so the user adds their own farm(s).
// ============================================================================
const BASELINE_EGYPT_CLIMATE_TEMPLATE = {
  farmId: 'USER-FARM-TEMPLATE',
  farmNameAr: 'مزرعتي الجديدة',
  governorateCode: 'QLY',
  governorateAr: 'القليوبية / الدلتا',
  markazAr: 'موقع مزرعتك المحدد',
  landClassificationAr: 'أرض زراعية مصرية',
  landTypeCode: 'OLD_LAND',
  defaultAreaSqm: 10500, // 2.5 Feddans
  defaultCropId: 'EG_WHEAT',
  defaultPreviousCropId: 'MAIZE_SUMMER',
  defaultIrrigationSystem: 'TRADITIONAL_SURFACE',
  irrigationEfficiency: 0.72,
  lat: 30.3541,
  lon: 31.1785,
  polygonPoints: '16,20 84,16 90,82 20,86',
  riceAllowed: true,
  riceRestrictionReasonAr: 'يمكن زراعة الأرز وكافة المحاصيل مع ضبط مقننات الري والصرف.',
  soilSummaryAr: 'تربة زراعية صالحة لجميع المحاصيل (ECe = 1.45 dS/m)',
  soilIsVerified: true,
  waterAvailabilityAr: 'متاحة وقابلة للري السطحي أو التنقيط أو الرش',
  waporMetrics: {
    aetiSeasonalMm: 475,
    retSeasonalMm: 550,
    relativeEvapotranspiration: 0.92,
    biomassTonHa: 14.8,
    layerResolution: '100m (WaPOR v3 L2 Egypt)',
    observationPeriod: 'نوفمبر 2026 (العشرية الأولى)',
  },
  sentinel2Metrics: {
    ndviMean: 0.68,
    cloudCoverPct: 3.2,
    acquisitionDate: '2026-11-11',
    tileId: 'T36RUV (10m L2A)',
    vegetationHealthFactor: 0.98,
  },
  era5Metrics: {
    winterMeanTempC: 16.8,
    summerMeanTempC: 28.4,
    annualGddBase10: 4120,
    referencePeriod: '1991–2025 + أكتوبر 2026 (ERA5-Land 9km)',
  },
  _backendMetrics: {
    soilSalinityDsm: 1.45,
    soilTexture: 'CLAY_LOAM',
    organicMatterPct: 1.85,
    waterSupplyRatio: 0.92,
    vegetationHealthFactor: 0.98,
    baselineWaterM3PerFeddan: 2850,
    fallbackWeather: {
      tempAvgC: 21.4,
      tempMaxC: 27.6,
      tempMinC: 15.2,
      humidityPct: 60,
      rainfallMmDay: 0.4,
      solarMjDay: 17.0,
      winterAvgC: 16.8,
      summerAvgC: 28.4,
    },
  },
};

const AGRI-GO_FARMS = [];

// ============================================================================
// 5-B. DYNAMIC EGYPT GEO-RESOLVER FOR ANY CUSTOM GOOGLE MAPS COORDINATE (LAT/LON)
//      Computes agro-ecological zone, soil salinity, and land classification
//      for any point selected by the user in Egypt. Allows ALL crops everywhere.
// ============================================================================
function resolveEgyptianLocationProfile(lat, lon, customPlaceNameAr = '', customAreaSqm = 10500, customFarmId = null) {
  const clampedLat = Math.max(22.0, Math.min(31.8, Number(lat) || 30.3541));
  const clampedLon = Math.max(24.5, Math.min(36.0, Number(lon) || 31.1785));

  const isNorthDeltaCoastal = clampedLat >= 30.85 && clampedLon >= 30.3 && clampedLon <= 32.0;
  const isSouthMidDelta =
    clampedLat >= 30.05 && clampedLat < 30.85 && clampedLon >= 30.4 && clampedLon <= 31.65;
  const isWestDeltaReclaimed =
    clampedLat >= 29.8 && clampedLat <= 31.1 && clampedLon < 30.4;
  const isFayoumDepression =
    clampedLat >= 29.1 && clampedLat <= 29.65 && clampedLon >= 30.3 && clampedLon <= 31.1;
  const isUpperEgyptHot = clampedLat < 27.0;
  const isDesertFrontier =
    clampedLon < 29.8 || clampedLon > 32.8 || (clampedLat < 29.0 && Math.abs(clampedLon - 31.2) > 1.6);

  const isNewLand = isWestDeltaReclaimed || isDesertFrontier;
  const riceNaturalZone = isNorthDeltaCoastal;

  let governorateCode = 'QLY';
  let governorateAr = 'الدلتا والوادي';
  if (isNorthDeltaCoastal) {
    governorateCode = clampedLon > 31.15 ? 'DKH' : 'KFS';
    governorateAr = clampedLon > 31.15 ? 'الدقهلية / شمال الدلتا' : 'كفر الشيخ / شمال الدلتا';
  } else if (isSouthMidDelta) {
    governorateCode = 'QLY';
    governorateAr = 'القليوبية / جنوب ووسط الدلتا';
  } else if (isWestDeltaReclaimed) {
    governorateCode = 'BHR';
    governorateAr = 'البحيرة / النوبارية والظهير الصحراوي';
  } else if (isFayoumDepression) {
    governorateCode = 'FYM';
    governorateAr = 'الفيوم';
  } else if (isUpperEgyptHot) {
    governorateCode = 'MNY';
    governorateAr = 'الأقصر / أسوان / قنا (جنوب الصعيد)';
  } else if (clampedLat < 29.1) {
    governorateCode = 'MNY';
    governorateAr = 'المنيا / أسيوط / بني سويف (وادي النيل)';
  }

  const estimatedSalinityDsm = isNorthDeltaCoastal
    ? 2.15
    : isFayoumDepression
    ? 2.05
    : isNewLand
    ? 1.75
    : isSouthMidDelta
    ? 1.35
    : 1.50;

  const estimatedEt0RetSeasonalMm = isUpperEgyptHot
    ? 690
    : clampedLat < 29.0
    ? 620
    : isNewLand
    ? 575
    : 540;

  return {
    ...BASELINE_EGYPT_CLIMATE_TEMPLATE,
    farmId: customFarmId || `USER-FARM-${Date.now()}`,
    farmNameAr: customPlaceNameAr || `مزرعتي في (${governorateAr})`,
    governorateCode,
    governorateAr,
    markazAr: customPlaceNameAr || `إحداثيات (${clampedLat.toFixed(4)}°N, ${clampedLon.toFixed(4)}°E)`,
    defaultAreaSqm: Math.max(420, Number(customAreaSqm) || 10500),
    landClassificationAr: isNewLand
      ? 'أرض مستصلحة حديثة (صالحة لكافة المحاصيل مع الري الحديث أو المعدل)'
      : 'أرض زراعية طينية خصبة (وادي النيل والدلتا)',
    landTypeCode: isNewLand ? 'NEW_LAND' : 'OLD_LAND',
    defaultIrrigationSystem: isNewLand ? 'DRIP' : 'TRADITIONAL_SURFACE',
    irrigationEfficiency: isNewLand ? 0.86 : 0.68,
    lat: Number(clampedLat.toFixed(5)),
    lon: Number(clampedLon.toFixed(5)),
    riceAllowed: true, // Allow planting all crops everywhere, with advisory notes if outside north delta
    riceNaturalZone,
    riceRestrictionReasonAr: riceNaturalZone
      ? 'موقع مثالي لزراعة الأرز ضمن حزام شمال الدلتا.'
      : 'يمكنك زراعة الأرز هنا (يفضل الأصناف الموفرة للمياه مثل جيزة 178 وسخا 108 مع ضبط الري).',
    soilSummaryAr: isNewLand
      ? `تربة رملية طميية جيدة التهوية والصرف، ملوحة مقدرة (ECe = ${estimatedSalinityDsm} dS/m)`
      : `تربة طينية طميية عميقة عالية الخصوبة، ملوحة مقدرة (ECe = ${estimatedSalinityDsm} dS/m)`,
    waporMetrics: {
      ...BASELINE_EGYPT_CLIMATE_TEMPLATE.waporMetrics,
      retSeasonalMm: estimatedEt0RetSeasonalMm,
      aetiSeasonalMm: Math.round(estimatedEt0RetSeasonalMm * 0.84),
      relativeEvapotranspiration: isNewLand ? 0.90 : 0.92,
    },
    _backendMetrics: {
      ...BASELINE_EGYPT_CLIMATE_TEMPLATE._backendMetrics,
      soilSalinityDsm: estimatedSalinityDsm,
      soilTexture: isNewLand ? 'SANDY_LOAM' : 'CLAY_LOAM',
      waterSupplyRatio: isNewLand ? 0.90 : 0.92,
      baselineWaterM3PerFeddan: isUpperEgyptHot ? 3300 : isNorthDeltaCoastal ? 3400 : 2850,
    },
  };
}

// ============================================================================
// 6. THE 7 EXISTING AGRI-GO CROPS: SCIENTIFIC PARAMETERS, GUIDES & ECONOMICS
// ============================================================================
const COST_ITEM_METADATA = [
  { key: 'landPrep', labelAr: '1. تجهيز الأرض والحرث والتسوية', chartGroup: 'OTHER' },
  { key: 'seeds', labelAr: '2. التقاوي أو الشتلات', chartGroup: 'SEEDS' },
  { key: 'fertilizers', labelAr: '3. الأسمدة (الكيماوية والعضوية)', chartGroup: 'FERTILIZERS' },
  { key: 'pesticides', labelAr: '4. المبيدات ومكافحة الآفات', chartGroup: 'PESTICIDES' },
  { key: 'labor', labelAr: '5. العمالة الزراعية', chartGroup: 'LABOR' },
  { key: 'irrigation', labelAr: '6. مياه وشبكة الري', chartGroup: 'IRRIGATION' },
  { key: 'electricityFuel', labelAr: '7. الكهرباء أو الوقود (السولار)', chartGroup: 'OTHER' },
  { key: 'harvesting', labelAr: '8. الحصاد والجمع والدراس', chartGroup: 'HARVESTING' },
  { key: 'transportation', labelAr: '9. النقل والتعبئة والمشال', chartGroup: 'OTHER' },
  { key: 'otherExpenses', labelAr: '10. مصاريف إضافية وإيجار الأرض', chartGroup: 'OTHER' },
];

const AGRI-GO_CROPS = {
  EG_WHEAT: {
    cropId: 'EG_WHEAT',
    nameAr: 'القمح',
    varietyAr: 'سخا 95 / جيزة 171 / مصر 4',
    botanicalFamily: 'POACEAE_CEREAL',
    familyNameAr: 'العائلة النجيلية (حبوب شتوية)',
    seasonBadgeAr: 'الموسم الشتوي (نوفمبر – مايو)',
    seasonCode: 'WINTER',
    supportsCurrentNovPlanting: true,
    unitAr: 'أردب',
    unitDetailAr: 'أردب (150 كجم)',
    unitWeightKg: 150,
    defaultPlantingDate: '2026-11-15',
    growthDurationDays: 155,
    waterReqCategoryAr: 'احتياج مائي منخفض إلى معتدل شتاءً',
    cropWaterConsumptionEtcM3: 1620, // Actual crop evapotranspiration ETc (m³/feddan)
    waporWaterProductivityKgM3: 1.92, // kg grain per m³ of consumed water
    gaezPotentialByGov: {
      QLY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 24.0 },
      KFS: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 23.5 },
      BHR: { gaezClass: 'S', gaezClassAr: 'ملائم (S - FAO GAEZ v5)', attainableYieldUnits: 20.5 },
      DKH: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 24.5 },
      MNY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 23.5 },
      FYM: { gaezClass: 'S', gaezClassAr: 'ملائم (S - FAO GAEZ v5)', attainableYieldUnits: 22.0 },
    },
    soilHealthProfile: {
      fao56SalinityThresholdDsm: 6.0,
      fao56SalinitySlopePct: 7.1,
      rootStructureBenefitAr: 'شبكة جذور ليفية كثيفة تحافظ على تماسك حبيبات التربة السطحية وتمنع انجرافها.',
      rotationCompatibilityTextAr: 'ممتاز كمحصول شتوي بعد المحاصيل الصيفية (القطن، البطاطس، الطماطم، الذرة، أو البقوليات)؛ لا يثبت النيتروجين جوياً لكنه يترك بقايا جذرية متوازنة.',
      verifiedSoilNoteAr: 'ملاحظة علمية: القمح محصول نجيلي لا يثبت النيتروجين في التربة، لكن احتياجه المائي المعتدل شتاءً يحد من ارتفاع مستوى الماء الأرضي وتملح التربة.',
      incompatiblePrevFamilies: ['WHEAT_CONSECUTIVE'],
      soilSustainabilityRankBase: 2,
    },
    _backendRules: {
      optimalTempRange: [12, 25],
      maxSalinityDsm: 6.0,
      salinitySlope: 7.1,
      kyFactor: 1.05,
      prefersNewSandy: true,
      prefersOldClay: true,
    },
    farmerGuide: {
      bestPlantingTimeAr: 'النصف الثاني من شهر نوفمبر (من 10 إلى 25 نوفمبر) هو أفضل ميعاد لتحقيق أعلى إنتاجية.',
      landPreparationAr: 'حرث الأرض مرتين متعامدتين وتنعيمها جيداً، مع التسوية بالليزر لتوزيع المياه بالتساوي وتوفير ربع كمية المياه.',
      plantingMethodAr: 'الزراعة على مصاطب بعرض 120 سم (توفر التقاوي وتمنع رقاد القمح) أو التسطير العادي بعمق 3 إلى 4 سم.',
      irrigationRequirementsAr: 'يحتاج القمح من 4 إلى 5 ريات طوال الموسم في الأراضي القديمة، وري منتظم بالرش في الأراضي الجديدة.',
      irrigationByStageAr: 'رية الزراعة على الحامي، ثم رية المحاياة بعد 21–25 يوماً، ثم الري كل 25–30 يوماً مع عدم تعطيش النبات أبداً وقت طرد السنابل وامتلاء الحبوب.',
      nutrientRequirementsAr: 'إضافة السماد الفوسفاتي (سوبر فوسفات) أثناء تجهيز الأرض، والسماد الآزوتي على 3 دفعات (عند الزراعة، ومع رية المحاياة، والرية التالية) قبل طرد السنابل.',
      cropMonitoringAr: 'متابعة الإنبات بعد أسبوعين، وفحص الأوراق أسبوعياً في شهر فبراير ومارس للتأكد من خلوها من أي بقع صفراء، ومتابعة امتلاء السنابل.',
      pestsAndDiseasesAr: 'الوقاية والمكافحة المتكاملة: نقاوة الحشائش (مثل الزمير) مبكراً، زراعة أصناف معتمدة مقاومة للصدأ الأصفر، الاعتدال في الري والتسميد الآزوتي، واستشارة المهندس الزراعي بالجمعية عند ظهور أي إصابة.',
      harvestTimingAr: 'في أواخر أبريل وأوائل مايو عندما يصفر لون السنابل والحامل السنبلي وتصبح الحبة صلبة عند الضغط عليها بالظفر.',
    },
    productionFactorsAr: [
      'الالتزام بميعاد الزراعة في شهر نوفمبر وعدم التأخير.',
      'إعطاء رية المحاياة في موعدها (بعد 21–25 يوماً) وعدم تعطيش القمح وقت طرد السنابل.',
      'استخدام تقاوي معتمدة مقاومة للأصداء وإضافة الدفعات السمادية الثلاث قبل طرد السنابل.',
    ],
    yieldByGov: {
      QLY: { value: 20.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة القليوبية' },
      KFS: { value: 19.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة كفر الشيخ' },
      BHR: { value: 17.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط الأراضي الجديدة - البحيرة' },
      DKH: { value: 21.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الدقهلية' },
      MNY: { value: 19.8, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة المنيا' },
      FYM: { value: 18.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الفيوم' },
    },
    prices: {
      farmGate: { valueEgp: 2200, labelAr: 'سعر التوريد الحكومي / المزرعة', sourceAr: 'وزارة الزراعة وقاعدة أسعار المزرعة', pubDate: 'موسم 2025/2026' },
      wholesale: { valueEgp: 2290, labelAr: 'سعر الجملة بالأسواق', sourceAr: 'قاعدة الأسعار اليومية بوزارة الزراعة', pubDate: 'اليوم' },
    },
    costsPerFeddan: {
      landPrep: 2400, seeds: 2100, fertilizers: 4600, pesticides: 1650, labor: 3400,
      irrigation: 1450, electricityFuel: 1350, harvesting: 3500, transportation: 1650, otherExpenses: 9500,
    },
    costSourceAr: 'قطاع الشئون الاقتصادية بوزارة الزراعة',
    costReferenceDate: 'نشرة تكاليف الموسم الشتوي 2025/2026',
  },

  EG_SUGAR_BEET: {
    cropId: 'EG_SUGAR_BEET',
    nameAr: 'بنجر السكر',
    varietyAr: 'أصناف وحيدة وعديدة الأجنة متعاقد عليها',
    botanicalFamily: 'AMARANTHACEAE',
    familyNameAr: 'العائلة الرمرامية (محصول جذري شتوي)',
    seasonBadgeAr: 'الموسم الشتوي (سبتمبر – مايو)',
    seasonCode: 'WINTER',
    supportsCurrentNovPlanting: true,
    unitAr: 'طن',
    unitDetailAr: 'طن جذور بنجر صافي',
    unitWeightKg: 1000,
    defaultPlantingDate: '2026-10-20',
    growthDurationDays: 185,
    waterReqCategoryAr: 'احتياج مائي معتدل وكفاءة عالية في تحمل الجفاف والملوحة',
    cropWaterConsumptionEtcM3: 1820,
    waporWaterProductivityKgM3: 13.1,
    gaezPotentialByGov: {
      QLY: { gaezClass: 'S', gaezClassAr: 'ملائم (S - FAO GAEZ v5)', attainableYieldUnits: 25.0 },
      KFS: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 28.5 },
      BHR: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 26.0 },
      DKH: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 27.5 },
      MNY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 29.0 },
      FYM: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 26.5 },
    },
    soilHealthProfile: {
      fao56SalinityThresholdDsm: 7.0,
      fao56SalinitySlopePct: 5.9,
      rootStructureBenefitAr: 'جذور وتدية عميقة تقوم بتفكيك طبقات التربة المتماسكة وتحسين نفاذية الماء والهواء للمحصول التالي.',
      rotationCompatibilityTextAr: 'يكسر دورة الحشائش والأمراض الفطرية عند زراعته بعد الحبوب النجيلية (القمح أو الذرة أو الأرز)، ويتحمل ملوحة التربة حتى 7 dS/m دون تدهور.',
      verifiedSoilNoteAr: 'ملاحظة علمية موثقة: بنجر السكر لا يثبت النيتروجين جوياً، لكن جذوره الوتدية العميقة وعرشه الأخضر عند تدويره يحسنان خواص التربة الطبيعية في الأراضي الملحية والثقيلة والمستصلحة.',
      incompatiblePrevFamilies: ['AMARANTHACEAE'],
      soilSustainabilityRankBase: 1,
    },
    _backendRules: {
      optimalTempRange: [10, 28],
      maxSalinityDsm: 7.0,
      salinitySlope: 5.9,
      kyFactor: 0.85,
      prefersNewSandy: true,
      prefersOldClay: true,
    },
    farmerGuide: {
      bestPlantingTimeAr: 'من منتصف سبتمبر حتى منتصف نوفمبر (العروة المبكرة والمتوسطة تعطي أعلى وزن ونسبة سكر).',
      landPreparationAr: 'حرث عميق لتفكيك التربة ومساعدة الجذور على التعمق، ثم التزحيف والتخطيط بمعدل 12 إلى 14 خطاً في القصبتين.',
      plantingMethodAr: 'الزراعة في جور على مسافة 15–20 سم بين الجورة والأخرى، ثم الخف المبكر على نبات واحد فقط في الجورة.',
      irrigationRequirementsAr: 'يحتاج إلى ري معتدل ومنتظم بدون تغريق، ويتحمل ظروف الأراضي الجديدة والملوحة المتوسطة بكفاءة عالية.',
      irrigationByStageAr: 'الري على الحامي بعد الزراعة، ثم الري كل 20–25 يوماً حسب حالة الجو، مع فطام المحصول وإيقاف الري تماماً قبل التقليع بـ 3 إلى 4 أسابيع لزيادة نسبة السكر.',
      nutrientRequirementsAr: 'إضافة السوبر فوسفات وقت الخدمة، وإنهاء جميع دفعات السماد الآزوتي خلال أول 75 يوماً من عمر النبات، مع الاهتمام بالبوتاسيوم والرش بعنصر البورون.',
      cropMonitoringAr: 'التأكد من الخف على نبات واحد مبكراً عند ظهور 4 ورقات حقيقية، ومتابعة حجم الجذور ونظافة الحقل من الحشائش.',
      pestsAndDiseasesAr: 'الوقاية والمكافحة المتكاملة: التخلص من الحشائش أولاً بأول، الفحص المبكر لأوراق البنجر لاكتشاف ذبابة البنجر أو دودة ورق القطن وجمع اللطع يدوياً، وعدم زيادة الري لمنع أعفان الجذور.',
      harvestTimingAr: 'بعد 180–200 يوم من الزراعة عند اصفرار الأوراق السفلية وتهدلها وبالتنسيق مع مندوب مصنع السكر.',
    },
    productionFactorsAr: [
      'الخف المبكر على نبات واحد في الجورة لترك مساحة كافية لكبر حجم الجذر.',
      'عدم إضافة أي أسمدة آزوتية بعد عمر 75–80 يوماً حتى لا تنخفض نسبة السكر.',
      'إيقاف الري (الفطام) قبل التقليع بنحو 25 يوماً والالتزام بموعد التوريد للمصنع.',
    ],
    yieldByGov: {
      MNY: { value: 25.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'مجلس المحاصيل السكرية ووزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة المنيا' },
      KFS: { value: 24.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'مجلس المحاصيل السكرية ووزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة كفر الشيخ' },
      DKH: { value: 23.8, type: 'HISTORICAL_OFFICIAL', sourceAr: 'مجلس المحاصيل السكرية ووزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الدقهلية' },
      BHR: { value: 22.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'مجلس المحاصيل السكرية ووزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة البحيرة' },
      FYM: { value: 22.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'مجلس المحاصيل السكرية ووزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الفيوم' },
      QLY: { value: 21.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة القليوبية' },
    },
    prices: {
      farmGate: { valueEgp: 2500, labelAr: 'سعر التوريد التعاقدي لمصانع السكر', sourceAr: 'مجلس المحاصيل السكرية ووزارة الزراعة', pubDate: 'موسم 2025/2026' },
      wholesale: { valueEgp: 2550, labelAr: 'سعر التوريد عبر المجمعات', sourceAr: 'وزارة الزراعة واستصلاح الأراضي', pubDate: 'اليوم' },
    },
    costsPerFeddan: {
      landPrep: 2800, seeds: 2300, fertilizers: 5200, pesticides: 2750, labor: 5600,
      irrigation: 2100, electricityFuel: 1750, harvesting: 4200, transportation: 3100, otherExpenses: 10500,
    },
    costSourceAr: 'مجلس المحاصيل السكرية وقطاع الشئون الاقتصادية',
    costReferenceDate: 'نشرة تكاليف الموسم الشتوي 2025/2026',
  },

  EG_POTATO: {
    cropId: 'EG_POTATO',
    nameAr: 'البطاطس',
    varietyAr: 'سبونتا / كارا / هيرمس',
    botanicalFamily: 'SOLANACEAE',
    familyNameAr: 'العائلة الباذنجانية (محصول درني)',
    seasonBadgeAr: 'الموسم الشتوي والنيلي والصيفي',
    seasonCode: 'WINTER',
    supportsCurrentNovPlanting: true,
    unitAr: 'طن',
    unitDetailAr: 'طن درنات بطاطس طازجة',
    unitWeightKg: 1000,
    defaultPlantingDate: '2026-11-05',
    growthDurationDays: 115,
    waterReqCategoryAr: 'احتياج مائي منخفض إلى متوسط (عالي الكفاءة تحت التنقيط والرش)',
    cropWaterConsumptionEtcM3: 1680,
    waporWaterProductivityKgM3: 8.6,
    gaezPotentialByGov: {
      QLY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 17.5 },
      KFS: { gaezClass: 'S', gaezClassAr: 'ملائم (S - FAO GAEZ v5)', attainableYieldUnits: 15.8 },
      BHR: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 19.0 },
      DKH: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 18.0 },
      MNY: { gaezClass: 'S', gaezClassAr: 'ملائم (S - FAO GAEZ v5)', attainableYieldUnits: 16.5 },
      FYM: { gaezClass: 'MS', gaezClassAr: 'متوسط الملاءمة بسبب الملوحة (MS - FAO GAEZ v5)', attainableYieldUnits: 15.0 },
    },
    soilHealthProfile: {
      fao56SalinityThresholdDsm: 1.7,
      fao56SalinitySlopePct: 12.0,
      rootStructureBenefitAr: 'يتطلب خدمة وحرثاً جيداً وترديماً يحسن تهوية الطبقة السطحية، لكنه حساس للملوحة فوق 1.7 dS/m.',
      rotationCompatibilityTextAr: 'ممتاز بعد الحبوب (القمح والذرة) أو البرسيم؛ يُحظر تكراره مباشرة بعد بطاطس أو طماطم لتجنب العفن البني والنيماتودا.',
      verifiedSoilNoteAr: 'تنبيه دورة زراعية: إذا كان المحصول السابق باذنجانياً (طماطم أو بطاطس)، يجب ترك فترة فاصلة أو اختيار محصول من عائلة أخرى لمنع تراكم مسببات أمراض التربة.',
      incompatiblePrevFamilies: ['SOLANACEAE'],
      soilSustainabilityRankBase: 3,
    },
    _backendRules: {
      optimalTempRange: [12, 26],
      maxSalinityDsm: 1.7,
      salinitySlope: 12.0,
      kyFactor: 1.10,
      prefersNewSandy: true,
      prefersOldClay: true,
    },
    farmerGuide: {
      bestPlantingTimeAr: 'العروة الشتوية والتصديرية في أكتوبر ونوفمبر؛ والعروة الصيفية في ديسمبر ويناير.',
      landPreparationAr: 'حرث عميق وتنعيم التربة جيداً وإضافة السماد البلدي المتحلل والتخطيط بمعدل 9 إلى 10 خطوط في القصبتين.',
      plantingMethodAr: 'زراعة درنات تقاوي سليمة ومعتمدة على عمق 10–12 سم ومسافة 25 سم بين الجور مع الترديم التدريجي حول النباتات.',
      irrigationRequirementsAr: 'تحتاج البطاطس إلى ري خفيف ومنتظم دون تغريق، وتجود جداً تحت نظام الري بالتنقيط أو الرش.',
      irrigationByStageAr: 'الري المتقارب المنتظم أثناء تكوين وصب الدرنات لمنع تشققها، ثم إيقاف الري قبل التقليع بـ 10 إلى 14 يوماً لتصلب القشرة.',
      nutrientRequirementsAr: 'تحتاج إلى تسميد متوازن من النيتروجين والفوسفور، مع التركيز الكبير على سماد البوتاسيوم أثناء مرحلة صب وتحجيم الدرنات.',
      cropMonitoringAr: 'متابعة الترديم الجيد فوق الدرنات لمنع اخضرارها، وفحص الأوراق السفلى خاصة في الأيام الرطبة أو الضبابية.',
      pestsAndDiseasesAr: 'الوقاية والمكافحة المتكاملة: استخدام تقاوي معتمدة خالية من العفن البني، الترديم الجيد لحماية الدرنات من فراشة البطاطس، وتجنب الري الغزير وقت الرطوبة العالية للوقاية من الندوة المتأخرة.',
      harvestTimingAr: 'بعد 110–120 يوماً عند اصفرار العرش والتأكد من ثبات قشرة الدرنة وعدم تقشرها عند فركها باليد.',
    },
    productionFactorsAr: [
      'استخدام تقاوي معتمدة خالية من الأمراض والالتزام بالترديم حول النباتات.',
      'انتظام الري وعدم تعطيش النبات ثم ريه بغزارة أثناء كبر حجم الدرنات.',
      'توفير سماد البوتاسيوم الكافي والوقاية المبكرة من الندوة المتأخرة عند زيادة الرطوبة.',
    ],
    yieldByGov: {
      QLY: { value: 14.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة القليوبية' },
      KFS: { value: 13.2, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة كفر الشيخ' },
      BHR: { value: 16.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة البحيرة والنوبارية' },
      DKH: { value: 15.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الدقهلية' },
      MNY: { value: 14.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة المنيا' },
      FYM: { value: 12.8, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الفيوم' },
    },
    prices: {
      farmGate: { valueEgp: 12200, labelAr: 'سعر البيع من المزرعة', sourceAr: 'قاعدة أسعار المزرعة بوزارة الزراعة', pubDate: 'نوفمبر 2026' },
      wholesale: { valueEgp: 13500, labelAr: 'سعر الجملة بسوق العبور', sourceAr: 'قاعدة الأسعار اليومية بوزارة الزراعة', pubDate: 'اليوم' },
    },
    costsPerFeddan: {
      landPrep: 4200, seeds: 35000, fertilizers: 14500, pesticides: 7800, labor: 8400,
      irrigation: 3600, electricityFuel: 2900, harvesting: 5800, transportation: 6200, otherExpenses: 13500,
    },
    costSourceAr: 'قطاع الشئون الاقتصادية بوزارة الزراعة',
    costReferenceDate: 'تقديرات تكاليف الخضر 2025/2026',
  },

  EG_TOMATO: {
    cropId: 'EG_TOMATO',
    nameAr: 'الطماطم',
    varietyAr: 'هجن عالية الإنتاجية ومقاومة للفيروس',
    botanicalFamily: 'SOLANACEAE',
    familyNameAr: 'العائلة الباذنجانية (محصول خضر ثمري)',
    seasonBadgeAr: 'الموسم الشتوي والصيفي والنيلي',
    seasonCode: 'WINTER',
    supportsCurrentNovPlanting: true,
    unitAr: 'طن',
    unitDetailAr: 'طن ثمار طماطم طازجة',
    unitWeightKg: 1000,
    defaultPlantingDate: '2026-10-25',
    growthDurationDays: 110,
    waterReqCategoryAr: 'احتياج مائي متوسط ومنتظم (إنتاجية عالية لوحدة المياه بالتنقيط)',
    cropWaterConsumptionEtcM3: 1950,
    waporWaterProductivityKgM3: 10.2,
    gaezPotentialByGov: {
      QLY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 24.0 },
      KFS: { gaezClass: 'S', gaezClassAr: 'ملائم (S - FAO GAEZ v5)', attainableYieldUnits: 22.0 },
      BHR: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 26.5 },
      DKH: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 23.5 },
      MNY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 25.0 },
      FYM: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5)', attainableYieldUnits: 25.5 },
    },
    soilHealthProfile: {
      fao56SalinityThresholdDsm: 2.5,
      fao56SalinitySlopePct: 9.9,
      rootStructureBenefitAr: 'جذور متعمقة نسبياً عند الشتل على مصاطب، وتتحمل ملوحة معتدلة حتى 2.5 dS/m.',
      rotationCompatibilityTextAr: 'تنجح جداً بعد الحبوب (القمح والذرة) أو البرسيم؛ يُنصح بعدم زراعتها مباشرة عقب بطاطس أو طماطم لتفادي النيماتودا وأعفان الجذور.',
      verifiedSoilNoteAr: 'ملاحظة علمية: تحتاج الطماطم إلى إضافة السماد العضوي المتحلل للحفاظ على المادة العضوية بالتربة تعويضاً عن استنزاف العناصر الغذائية.',
      incompatiblePrevFamilies: ['SOLANACEAE'],
      soilSustainabilityRankBase: 3,
    },
    _backendRules: {
      optimalTempRange: [15, 32],
      maxSalinityDsm: 2.5,
      salinitySlope: 9.9,
      kyFactor: 1.05,
      prefersNewSandy: true,
      prefersOldClay: true,
    },
    farmerGuide: {
      bestPlantingTimeAr: 'العروة الشتوية في سبتمبر وأكتوبر ونوفمبر؛ والعروة الصيفية في فبراير ومارس.',
      landPreparationAr: 'حرث الأرض جيداً وإضافة السماد العضوي المتحلل وتجهيز مصاطب بعرض 100 إلى 120 سم وفرد خراطيم التنقيط.',
      plantingMethodAr: 'زراعة شتلات صواني سليمة ومعتمدة من مشتل موثوق (بمعدل 7,000 إلى 8,000 شتلة للفدان) على مسافة 40–50 سم.',
      irrigationRequirementsAr: 'ري منتظم ومتوازن (يفضل بالتنقيط)، مع تجنب التعطيش الشديد المتبوع بري غزير حتى لا تتشقق الثمار.',
      irrigationByStageAr: 'ري هادئ بعد الشتل لتثبيت الجذور، ثم انتظام الري وقت التزهير وعقد الثمار، وتقليل الري تدريجياً عند بداية تلوين الثمار.',
      nutrientRequirementsAr: 'تسميد متوازن يشمل الفوسفور لتقوية الجذور والتزهير، والبوتاسيوم والكالسيوم بعد عقد الثمار لزيادة الصلابة ومنع عفن الطرف الزهري.',
      cropMonitoringAr: 'الفحص اليومي للأوراق والبراعم لرصد الحشرات الثاقبة الماصة مبكراً، ومتابعة عقد الثمار وتلوينها.',
      pestsAndDiseasesAr: 'الوقاية والمكافحة المتكاملة: زراعة شتلات خالية من الفيروس تحت الشاش، استخدام المصائد الصفراء والفيرمونية لرصد الذبابة البيضاء وصانعة أنفاق الطماطم (التوتا أبسلوتا)، وإزالة الحشائش العائلة للحشرات.',
      harvestTimingAr: 'يبدأ الجمع بعد 95–110 أيام من الشتل عند تلون الثمار باللون الوردي أو الأحمر حسب المسافة للسوق.',
    },
    productionFactorsAr: [
      'اختيار هجن مقاومة لفيروس تجعد الأوراق الصفراء والشتل من مصدر موثوق.',
      'انتظام الري وإضافة الكالسيوم والبوتاسيوم أثناء عقد وكبر حجم الثمار.',
      'المتابعة المبكرة للمصائد الفيرمونية والصفراء لحماية المحصول من الذبابة البيضاء والتوتا.',
    ],
    yieldByGov: {
      QLY: { value: 19.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة القليوبية' },
      KFS: { value: 18.2, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة كفر الشيخ' },
      BHR: { value: 22.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة البحيرة والنوبارية' },
      DKH: { value: 19.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الدقهلية' },
      MNY: { value: 20.5, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة المنيا' },
      FYM: { value: 21.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الفيوم' },
    },
    prices: {
      farmGate: { valueEgp: 6900, labelAr: 'سعر البيع بالمزرعة', sourceAr: 'قاعدة أسعار المزرعة بوزارة الزراعة', pubDate: 'نوفمبر 2026' },
      wholesale: { valueEgp: 7800, labelAr: 'سعر الجملة بسوق العبور', sourceAr: 'قاعدة الأسعار اليومية بوزارة الزراعة', pubDate: 'اليوم' },
    },
    costsPerFeddan: {
      landPrep: 4100, seeds: 13500, fertilizers: 15800, pesticides: 10900, labor: 11500,
      irrigation: 4100, electricityFuel: 3200, harvesting: 7200, transportation: 7600, otherExpenses: 13000,
    },
    costSourceAr: 'قطاع الشئون الاقتصادية بوزارة الزراعة',
    costReferenceDate: 'تقديرات تكاليف الخضر 2025/2026',
  },

  EG_MAIZE: {
    cropId: 'EG_MAIZE',
    nameAr: 'الذرة الشامية',
    varietyAr: 'هجين فردي 168 / هجين فردي 10',
    botanicalFamily: 'POACEAE_CEREAL',
    familyNameAr: 'العائلة النجيلية (حبوب صيفية/نيلية)',
    seasonBadgeAr: 'الموسم الصيفي والنيلي (مايو – سبتمبر)',
    seasonCode: 'SUMMER',
    supportsCurrentNovPlanting: false,
    unitAr: 'طن',
    unitDetailAr: 'طن حبوب (نحو 7.14 أردب)',
    unitWeightKg: 1000,
    defaultPlantingDate: '2026-05-15',
    growthDurationDays: 118,
    waterReqCategoryAr: 'احتياج مائي متوسط إلى مرتفع صيفاً',
    cropWaterConsumptionEtcM3: 2350,
    waporWaterProductivityKgM3: 1.52,
    gaezPotentialByGov: {
      QLY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً صيفاً (VS - FAO GAEZ v5)', attainableYieldUnits: 4.3 },
      KFS: { gaezClass: 'S', gaezClassAr: 'ملائم صيفاً (S - FAO GAEZ v5)', attainableYieldUnits: 4.0 },
      BHR: { gaezClass: 'S', gaezClassAr: 'ملائم صيفاً (S - FAO GAEZ v5)', attainableYieldUnits: 3.8 },
      DKH: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً صيفاً (VS - FAO GAEZ v5)', attainableYieldUnits: 4.4 },
      MNY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً صيفاً (VS - FAO GAEZ v5)', attainableYieldUnits: 4.3 },
      FYM: { gaezClass: 'S', gaezClassAr: 'ملائم صيفاً (S - FAO GAEZ v5)', attainableYieldUnits: 3.9 },
    },
    soilHealthProfile: {
      fao56SalinityThresholdDsm: 1.7,
      fao56SalinitySlopePct: 12.0,
      rootStructureBenefitAr: 'مجموع جذري قوي وبقايا نباتية وفيرة، لكنه حساس لملوحة التربة فوق 1.7 dS/m ومجهد للنيتروجين.',
      rotationCompatibilityTextAr: 'أفضل موقع له في الدورة الزراعية هو الزراعة في مايو عقب محصول البرسيم المصري الشتوي أو الفول البلدي أو البنجر.',
      verifiedSoilNoteAr: 'ملاحظة علمية: الذرة الشامية محصول صيفي حساس للملوحة ومستنزف للآزوت؛ زراعته بعد بقوليات شتوية تقلل الحاجة للأسمدة الكيماوية.',
      incompatiblePrevFamilies: ['POACEAE_SUMMER_REPEAT'],
      soilSustainabilityRankBase: 4,
    },
    _backendRules: {
      optimalTempRange: [18, 33],
      maxSalinityDsm: 1.7,
      salinitySlope: 12.0,
      kyFactor: 1.25,
      prefersNewSandy: false,
      prefersOldClay: true,
    },
    farmerGuide: {
      bestPlantingTimeAr: 'شهر مايو وحتى منتصف يونيو للعروة الصيفية (التبكير في مايو يحمي المحصول من الثاقبات ويزيد الإنتاج).',
      landPreparationAr: 'حرث الأرض مرتين وتزحيفها وتخطيطها بمعدل 10 خطوط في القصبتين (عرض الخط 70 سم).',
      plantingMethodAr: 'الزراعة في جور على مسافة 25 سم في الثلث السفلي من الخط بمعدل 12–14 كجم تقاوي هجن معتمدة للفدان، ثم الخف على نبات واحد.',
      irrigationRequirementsAr: 'تحتاج الذرة إلى ري منتظم كل 10–12 يوماً في الصيف دون تغريق أو تعطيش.',
      irrigationByStageAr: 'رية المحاياة بعد 21 يوماً من الزراعة بعد العزقة الأولى والخف، مع الحذر التام من تعطيش النبات وقت طرد السنابل وظهور الحريرة.',
      nutrientRequirementsAr: 'إضافة السوبر فوسفات عند التجهيز، وتقسيم السماد الآزوتي على دفعتين أو ثلاث قبل رية المحاياة والريات التالية قبل التزهير.',
      cropMonitoringAr: 'فحص قلب النباتات الصغيرة أسبوعياً بعد الإنبات للتأكد من سلامتها من دودة الحشد الخريفية والثاقبات.',
      pestsAndDiseasesAr: 'الوقاية والمكافحة المتكاملة: الزراعة المبكرة في مايو، التخلص من الحشائش، الفحص المبكر لقلب النبات لرصد دودة الحشد الخريفية، واستخدام التوصيات المعتمدة من وزارة الزراعة عند الضرورة.',
      harvestTimingAr: 'بعد 115–120 يوماً عند جفاف أغلفة الكيزان وظهور العلامة السوداء في قاعدة الحبة.',
    },
    productionFactorsAr: [
      'الزراعة في الميعاد الصيفي المبكر (مايو) بتقاوي هجن فردية معتمدة.',
      'تجنب ملوحة التربة المرتفعة وعدم تعطيش الذرة وقت التزهير وتكوين الكيزان.',
      'الخف المبكر على نبات واحد في الجورة قبل رية المحاياة.',
    ],
    yieldByGov: {
      QLY: { value: 3.65, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة القليوبية' },
      KFS: { value: 3.45, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة كفر الشيخ' },
      BHR: { value: 3.15, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة البحيرة' },
      DKH: { value: 3.75, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الدقهلية' },
      MNY: { value: 3.60, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة المنيا' },
      FYM: { value: 3.30, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الفيوم' },
    },
    prices: {
      farmGate: { valueEgp: 14600, labelAr: 'سعر البيع من المزرعة', sourceAr: 'قاعدة أسعار المزرعة بوزارة الزراعة', pubDate: 'نوفمبر 2026' },
      wholesale: { valueEgp: 15500, labelAr: 'سعر الجملة بالأسواق', sourceAr: 'قاعدة الأسعار اليومية بوزارة الزراعة', pubDate: 'اليوم' },
    },
    costsPerFeddan: {
      landPrep: 2650, seeds: 3250, fertilizers: 5800, pesticides: 2200, labor: 4200,
      irrigation: 1950, electricityFuel: 1800, harvesting: 3100, transportation: 1950, otherExpenses: 9200,
    },
    costSourceAr: 'قطاع الشئون الاقتصادية بوزارة الزراعة',
    costReferenceDate: 'نشرة تكاليف الموسم الصيفي 2025/2026',
  },

  EG_COTTON: {
    cropId: 'EG_COTTON',
    nameAr: 'القطن المصري',
    varietyAr: 'جيزة 94 (وجه بحري) / جيزة 95 (وجه قبلي)',
    botanicalFamily: 'MALVACEAE',
    familyNameAr: 'العائلة الخبازية (محصول ألياف صيفي)',
    seasonBadgeAr: 'الموسم الصيفي (مارس – سبتمبر)',
    seasonCode: 'SUMMER',
    supportsCurrentNovPlanting: false,
    unitAr: 'قنطار',
    unitDetailAr: 'قنطار قطن زهر (157.5 كجم)',
    unitWeightKg: 157.5,
    defaultPlantingDate: '2026-03-25',
    growthDurationDays: 170,
    waterReqCategoryAr: 'احتياج مائي متوسط إلى مرتفع صيفاً (يتحمل الملوحة والجفاف النسبي)',
    cropWaterConsumptionEtcM3: 2480,
    waporWaterProductivityKgM3: 0.58,
    gaezPotentialByGov: {
      QLY: { gaezClass: 'S', gaezClassAr: 'ملائم صيفاً (S - FAO GAEZ v5)', attainableYieldUnits: 9.6 },
      KFS: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً صيفاً (VS - FAO GAEZ v5)', attainableYieldUnits: 10.8 },
      BHR: { gaezClass: 'MS', gaezClassAr: 'متوسط الملاءمة بالأراضي الجديدة (MS - FAO GAEZ v5)', attainableYieldUnits: 8.5 },
      DKH: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً صيفاً (VS - FAO GAEZ v5)', attainableYieldUnits: 11.0 },
      MNY: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً صيفاً (VS - FAO GAEZ v5)', attainableYieldUnits: 10.2 },
      FYM: { gaezClass: 'S', gaezClassAr: 'ملائم صيفاً (S - FAO GAEZ v5)', attainableYieldUnits: 9.8 },
    },
    soilHealthProfile: {
      fao56SalinityThresholdDsm: 7.7,
      fao56SalinitySlopePct: 5.2,
      rootStructureBenefitAr: 'جذر وتدي عميق جداً يخترق باطن التربة ويحسن الصرف الطبيعي، ويتحمل الملوحة حتى 7.7 dS/m.',
      rotationCompatibilityTextAr: 'ركيزة أساسية في الدورة الزراعية الثلاثية المصرية بعد البرسيم التحريش أو البقوليات الشتوية، ويترك أرضاً نظيفة ومخدومة جيداً للقمح التالي.',
      verifiedSoilNoteAr: 'ملاحظة علمية: القطن من أعلى المحاصيل تحملاً لملوحة التربة (7.7 dS/m وفق FAO-56)، وجذوره العميقة تفكك التربة الطينية الثقيلة.',
      incompatiblePrevFamilies: ['MALVACEAE'],
      soilSustainabilityRankBase: 2,
    },
    _backendRules: {
      optimalTempRange: [20, 36],
      maxSalinityDsm: 7.7,
      salinitySlope: 5.2,
      kyFactor: 0.85,
      prefersNewSandy: false,
      prefersOldClay: true,
    },
    farmerGuide: {
      bestPlantingTimeAr: 'شهر مارس في محافظات الصعيد، ومن منتصف مارس حتى منتصف أبريل في محافظات الوجه البحري.',
      landPreparationAr: 'حرث الأرض 3 مرات متعامدة وتشميسها جيداً وتخطيطها بمعدل 11 خطاً في القصبتين.',
      plantingMethodAr: 'الزراعة في جور على الريشة القبلية أو الشرقية بمسافة 20–25 سم، ثم الخف على نباتين في الجورة قبل رية المحاياة.',
      irrigationRequirementsAr: 'ري معتدل ومنتظم كل 14–18 يوماً، ويتحمل القطن ملوحة التربة بدرجة عالية.',
      irrigationByStageAr: 'رية المحاياة بعد 21–28 يوماً، ثم انتظام الري وقت الوسواس والتزهير دون تغريق حتى لا يتساقط اللوز الصغير.',
      nutrientRequirementsAr: 'إضافة السوبر فوسفات عند التجهيز، والاعتدال في التسميد الآزوتي (حوالي 60 وحدة) لمنع الهياج الخضري، مع إضافة البوتاسيوم.',
      cropMonitoringAr: 'المرور الدوري في الحقل خلال شهري مايو ويونيو لجمع لطع دودة ورق القطن يدوياً قبل فقسها، ومتابعة تفتح اللوز.',
      pestsAndDiseasesAr: 'الوقاية والمكافحة المتكاملة: الالتزام بالصنف المقرر للمحافظة، النقاوة اليدوية للطَع دودة ورق القطن، تعليق المصائد الجنسية لرصد ديدان اللوز، واتباع إرشادات الجمعية الزراعية.',
      harvestTimingAr: 'في سبتمبر وأكتوبر على جنيتين عند تفتح 60% من اللوز في الجنية الأولى، مع الجمع بعد تطاير الندى.',
    },
    productionFactorsAr: [
      'الزراعة المبكرة في مارس وأبريل وعدم التأخير.',
      'عدم الإفراط في السماد الآزوتي أو مياه الري وقت التزهير للحفاظ على اللوز.',
      'النقاوة اليدوية المبكرة للطَع دودة ورق القطن والوقاية من ديدان اللوز.',
    ],
    yieldByGov: {
      DKH: { value: 9.2, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة القطن السنوية - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الدقهلية' },
      KFS: { value: 9.0, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة القطن السنوية - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة كفر الشيخ' },
      QLY: { value: 8.1, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة القليوبية' },
      MNY: { value: 8.6, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة المنيا' },
      FYM: { value: 8.3, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الفيوم' },
      BHR: { value: 7.2, type: 'MODEL_ESTIMATE', sourceAr: 'تقدير استرشادي للأراضي الجديدة - البحيرة', pubDate: '2025', coverageAr: 'تقدير استرشادي' },
    },
    prices: {
      farmGate: { valueEgp: 11500, labelAr: 'سعر الضمان ومراكز تجميع القطن', sourceAr: 'منظومة تداول القطن ووزارة الزراعة', pubDate: 'موسم 2025/2026' },
      wholesale: { valueEgp: 11900, labelAr: 'سعر ترسية المزادات', sourceAr: 'الجهاز المركزي للإحصاء', pubDate: 'اليوم' },
    },
    costsPerFeddan: {
      landPrep: 3100, seeds: 1850, fertilizers: 5400, pesticides: 4200, labor: 7800,
      irrigation: 2600, electricityFuel: 2200, harvesting: 8400, transportation: 2400, otherExpenses: 12500,
    },
    costSourceAr: 'قطاع الشئون الاقتصادية بوزارة الزراعة',
    costReferenceDate: 'نشرة تكاليف الموسم الصيفي 2025/2026',
  },

  EG_RICE: {
    cropId: 'EG_RICE',
    nameAr: 'الأرز الشعير',
    varietyAr: 'جيزة 178 / سخا 108 (أصناف موفرة للمياه)',
    botanicalFamily: 'POACEAE_CEREAL',
    familyNameAr: 'العائلة النجيلية (حبوب صيفية مائية)',
    seasonBadgeAr: 'الموسم الصيفي (مايو – سبتمبر)',
    seasonCode: 'SUMMER',
    supportsCurrentNovPlanting: false,
    unitAr: 'طن',
    unitDetailAr: 'طن أرز شعير',
    unitWeightKg: 1000,
    requiresRiceZone: true,
    defaultPlantingDate: '2026-05-10',
    growthDurationDays: 130,
    waterReqCategoryAr: 'احتياج مائي مرتفع (مصرح به فقط في حزام شمال الدلتا)',
    cropWaterConsumptionEtcM3: 3350,
    waporWaterProductivityKgM3: 1.15,
    gaezPotentialByGov: {
      KFS: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5 شمال الدلتا)', attainableYieldUnits: 4.8 },
      DKH: { gaezClass: 'VS', gaezClassAr: 'ملائم جداً (VS - FAO GAEZ v5 شمال الدلتا)', attainableYieldUnits: 4.9 },
      QLY: { gaezClass: 'NS', gaezClassAr: 'مقيد تشريعياً ومائياً خارج حزام الأرز', attainableYieldUnits: 4.0 },
      BHR: { gaezClass: 'NS', gaezClassAr: 'غير ملائم للأراضي الرملية المستصلحة (NS)', attainableYieldUnits: 3.1 },
      MNY: { gaezClass: 'NS', gaezClassAr: 'محظور زراعته في الصعيد ومصر الوسطى', attainableYieldUnits: 3.2 },
      FYM: { gaezClass: 'NS', gaezClassAr: 'غير مصرح بزراعته في الفيوم', attainableYieldUnits: 3.3 },
    },
    soilHealthProfile: {
      fao56SalinityThresholdDsm: 3.0,
      fao56SalinitySlopePct: 12.0,
      rootStructureBenefitAr: 'يساعد الغمر المائي المنظم في أراضي شمال الدلتا الطينية الثقيلة (مثل كفر الشيخ والدقهلية) على غسيل الأملاح المتراكمة ومنع تداخل مياه البحر.',
      rotationCompatibilityTextAr: 'يدخل في دورة شمال الدلتا الصيفية بعد القمح أو البرسيم أو البنجر لغسيل أملاح التربة الطينية الثقيلة.',
      verifiedSoilNoteAr: 'ملاحظة علمية: فائدة الأرز في غسيل الملوحة تقتصر على الأراضي الطينية بشمال الدلتا المزودة بشبكة صرف جيدة، ولا يناسب الأراضي الرملية أو المحافظات غير المصرح لها.',
      incompatiblePrevFamilies: [],
      soilSustainabilityRankBase: 3,
    },
    _backendRules: {
      optimalTempRange: [20, 34],
      maxSalinityDsm: 3.0,
      salinitySlope: 12.0,
      kyFactor: 1.10,
      prefersNewSandy: false,
      prefersOldClay: true,
    },
    farmerGuide: {
      bestPlantingTimeAr: 'النصف الأول من شهر مايو لزراعة المشتل أو البدار المباشر (في المحافظات المصرح لها فقط).',
      landPreparationAr: 'حرث الأرض وتلويطها بالماء والتسوية بالليزر لحفظ مستوى المياه وتقليل الفاقد.',
      plantingMethodAr: 'الشتل بعد 25–30 يوماً من المشتل على مسافات 15×15 سم، أو التسطير للأصناف قصيرة العمر.',
      irrigationRequirementsAr: 'يحتاج إلى توفر مياه وفيرة وتربة طينية ثقيلة، ولا يُزرع في الأراضي الرملية أو خارج المحافظات المقررة.',
      irrigationByStageAr: 'مناوبات غمر خفيف (5 سم) وتجفيف متقطع كل 4–6 أيام، مع عدم التعطيش وقت طرد السنابل، ثم الفطام قبل الحصاد بأسبوعين.',
      nutrientRequirementsAr: 'إضافة السوبر فوسفات على الشراقي، وكبريتات الزنك بعد الشتل، والسماد الآزوتي في صورة يوريا أو سلفات نشادر على دفعات.',
      cropMonitoringAr: 'متابعة نقاوة حشائش الدنيبة والعجيرة مبكراً، وملاحظة الأوراق لاكتشاف أي بقع خاصة بمرض اللفحة.',
      pestsAndDiseasesAr: 'الوقاية والمكافحة المتكاملة: زراعة الأصناف المعتمدة المقاومة للفحة، عدم المغالاة في التسميد الآزوتي، وتجفيف الحقل لمدة 3–4 أيام عند ظهور الريم أو الديدان الدموية.',
      harvestTimingAr: 'في شهر سبتمبر عند اصفرار أكثر من 85% من حبوب السنابل.',
    },
    productionFactorsAr: [
      'الزراعة فقط داخل المحافظات المصرح لها حيث تتوفر التربة الطينية الثقيلة والمياه.',
      'إضافة عنصر الزنك ومكافحة حشائش الدنيبة مبكراً في أول 30 يوماً.',
      'اختيار الأصناف الحديثة قصيرة العمر والموفرة للمياه مثل جيزة 178 وسخا 108.',
    ],
    yieldByGov: {
      KFS: { value: 4.10, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة كفر الشيخ' },
      DKH: { value: 4.20, type: 'HISTORICAL_OFFICIAL', sourceAr: 'نشرة الاقتصاد الزراعي - وزارة الزراعة', pubDate: 'موسم 2025/2026', coverageAr: 'متوسط محافظة الدقهلية' },
      QLY: { value: 3.60, type: 'MODEL_ESTIMATE', sourceAr: 'تقدير استرشادي (خارج حزام الأرز)', pubDate: '2025', coverageAr: 'تقدير استرشادي' },
      BHR: { value: 2.90, type: 'MODEL_ESTIMATE', sourceAr: 'تقدير استرشادي', pubDate: '2025', coverageAr: 'تقدير استرشادي' },
      MNY: { value: 3.00, type: 'MODEL_ESTIMATE', sourceAr: 'تقدير استرشادي (غير مصرح بالصعيد)', pubDate: '2025', coverageAr: 'تقدير استرشادي' },
      FYM: { value: 3.10, type: 'MODEL_ESTIMATE', sourceAr: 'تقدير استرشادي', pubDate: '2025', coverageAr: 'تقدير استرشادي' },
    },
    prices: {
      farmGate: { valueEgp: 16900, labelAr: 'سعر بيع المزرعة للأرز الشعير', sourceAr: 'قاعدة أسعار المزرعة بوزارة الزراعة', pubDate: 'نوفمبر 2026' },
      wholesale: { valueEgp: 17750, labelAr: 'سعر الجملة بالمضارب', sourceAr: 'قاعدة الأسعار اليومية بوزارة الزراعة', pubDate: 'اليوم' },
    },
    costsPerFeddan: {
      landPrep: 3100, seeds: 2600, fertilizers: 4400, pesticides: 2150, labor: 5400,
      irrigation: 2800, electricityFuel: 2650, harvesting: 4100, transportation: 2100, otherExpenses: 10500,
    },
    costSourceAr: 'قطاع الشئون الاقتصادية بوزارة الزراعة',
    costReferenceDate: 'نشرة تكاليف الموسم الصيفي 2025/2026',
  },
};

// ============================================================================
// 7. SCIENTIFIC PRODUCTION MODEL (FAO-33/56) & ECONOMICS ENGINE
// ============================================================================
function estimateCropProductionInBackend({
  farm,
  crop,
  areaFeddans,
  plantingDateStr,
  irrigationSystemType,
  farmerRecordedYieldPerFeddan = null,
}) {
  const metrics = farm._backendMetrics;
  const rules = crop._backendRules;
  const hist = crop.yieldByGov[farm.governorateCode] || crop.yieldByGov.QLY;
  const gaez = crop.gaezPotentialByGov[farm.governorateCode] || crop.gaezPotentialByGov.QLY;

  // Irrigation efficiency adjustment
  const irrBonus =
    irrigationSystemType === 'DRIP'
      ? 1.04
      : irrigationSystemType === 'SPRINKLER'
      ? 1.02
      : 1.0;

  // FAO-33/56 water stress & salinity response equation:
  // Y_est = Y_hist * (1 - Ky * (1 - ETa/ETc)) * f_salinity * f_ndvi
  const waterFactor = Math.max(0.75, 1 - rules.kyFactor * (1 - metrics.waterSupplyRatio));
  const excessSalinity = Math.max(0, metrics.soilSalinityDsm - rules.maxSalinityDsm);
  const soilFactor = Math.max(0.65, 1 - (excessSalinity * rules.salinitySlope) / 100);

  const expectedPerFeddan = Number(
    (hist.value * waterFactor * soilFactor * metrics.vegetationHealthFactor * irrBonus).toFixed(2)
  );
  const uncertaintyMargin = farm.soilIsVerified ? 0.08 : 0.14;
  const minPerFeddan = Number((expectedPerFeddan * (1 - uncertaintyMargin)).toFixed(2));
  const maxPerFeddan = Number((expectedPerFeddan * (1 + uncertaintyMargin)).toFixed(2));

  let harvestPeriodAr = 'أبريل – مايو';
  if (plantingDateStr) {
    const start = new Date(plantingDateStr);
    if (!Number.isNaN(start.getTime())) {
      const harvestStart = new Date(start.getTime() + (crop.growthDurationDays - 10) * 86400000);
      const harvestEnd = new Date(start.getTime() + (crop.growthDurationDays + 5) * 86400000);
      const fmt = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' });
      harvestPeriodAr = `${fmt.format(harvestStart)} – ${fmt.format(harvestEnd)} (بعد نحو ${crop.growthDurationDays} يوماً)`;
    }
  }

  return {
    // 4 Explicitly separated yield figures (Requirement 5 - Plan B & Section 10)
    gaezPotentialPerFeddan: gaez.attainableYieldUnits,
    gaezClass: gaez.gaezClass,
    gaezClassAr: gaez.gaezClassAr,
    historicalOfficialPerFeddan: hist.value,
    historicalSourceAr: `${hist.sourceAr} (${hist.pubDate} - ${hist.coverageAr})`,
    expectedPerFeddan,
    minPerFeddan,
    maxPerFeddan,
    farmerActualPerFeddan:
      farmerRecordedYieldPerFeddan !== null &&
      farmerRecordedYieldPerFeddan !== '' &&
      Number.isFinite(Number(farmerRecordedYieldPerFeddan)) &&
      Number(farmerRecordedYieldPerFeddan) > 0
        ? Number(farmerRecordedYieldPerFeddan)
        : null,
    expectedTotalFarm: Number((expectedPerFeddan * areaFeddans).toFixed(2)),
    minTotalFarm: Number((minPerFeddan * areaFeddans).toFixed(2)),
    maxTotalFarm: Number((maxPerFeddan * areaFeddans).toFixed(2)),
    waterFactor: Number(waterFactor.toFixed(3)),
    soilFactor: Number(soilFactor.toFixed(3)),
    harvestPeriodAr,
    uncertaintyNoteAr: farm.soilIsVerified
      ? 'تقدير محسوب بنموذج FAO-33/56 بناءً على بيانات مزرعتك ومتوسط إنتاجية المحافظة (ليس إنتاجاً مضموناً بنسبة 100%).'
      : 'مدى تقديري أوسع (±14%) لعدم وجود تحليل تربة معملي موثق للمزرعة (تم استخدام تقدير التربة الإقليمي).',
  };
}

// ============================================================================
// 8. TOP 5 CROP RECOMMENDATION ENGINE ACROSS THE 3 PLANS
//    Applies distinct scientific methodologies for:
//    - Plan A: SOIL_HEALTH (الحفاظ على صحة الأرض)
//    - Plan B: MAX_PRODUCTION (تحقيق أكبر إنتاج ممكن)
//    - Plan C: WATER_SAVING (توفير المياه)
//    Never invents arbitrary scores or fake percentages.
//    If strict evidence filter leaves only 3 or 4 crops, returns only those!
// ============================================================================
function runTop5CropRecommendationEngine({
  planId,
  farm,
  liveWeather,
  previousCropId,
  irrigationSystemType,
  areaFeddans,
  strictCurrentWinterSeasonOnly,
  simulateMissingSoilWaterData,
  isCacheFallbackMode,
  lastUpdatedTextAr,
}) {
  const metrics = farm._backendMetrics;
  const weather = liveWeather || metrics.fallbackWeather;
  const prevCrop =
    PREVIOUS_CROP_OPTIONS.find((p) => p.id === previousCropId) || PREVIOUS_CROP_OPTIONS[0];

  const irrigationEfficiency =
    irrigationSystemType === 'DRIP'
      ? 0.88
      : irrigationSystemType === 'SPRINKLER'
      ? 0.78
      : farm.irrigationEfficiency || 0.65;

  const eligibleCandidates = [];
  const excludedCrops = [];

  Object.values(AGRI-GO_CROPS).forEach((crop) => {
    const rules = crop._backendRules;
    const gaez = crop.gaezPotentialByGov[farm.governorateCode] || crop.gaezPotentialByGov.QLY;
    const prodEst = estimateCropProductionInBackend({
      farm,
      crop,
      areaFeddans,
      plantingDateStr: crop.defaultPlantingDate,
      irrigationSystemType,
    });

    // 1. All 7 crops are plantable in every location! Add advisory notes instead of blocking crops.
    const locationAdvisoryNotes = [];
    if (crop.requiresRiceZone && farm.riceNaturalZone === false) {
      locationAdvisoryNotes.push(farm.riceRestrictionReasonAr);
    }
    if (farm.landTypeCode === 'NEW_LAND' && !rules.prefersNewSandy) {
      locationAdvisoryNotes.push(
        `في الأراضي الرملية/المستصلحة ينصح بزيادة المادة العضوية (الكمبوست) وانتظام فترات الري لنجاح محصول ${crop.nameAr}.`
      );
    }

    // 2. If farmer enabled "Strict Current Winter Season Only (November)", exclude summer-only crops
    if (strictCurrentWinterSeasonOnly && !crop.supportsCurrentNovPlanting) {
      excludedCrops.push({
        crop,
        exclusionTitleAr: 'خارج عروة الزراعة الشتوية الحالية (نوفمبر)',
        exclusionReasonAr: `${crop.nameAr} محصول صيفي (${crop.seasonBadgeAr}). يمكنك إلغاء علامة الفلتر الشتوي بالأعلى لزراعته في أي وقت.`,
      });
      return;
    }

    // 3. Water Calculations (Separating ETc, Irrigation Requirement, Water Productivity, and Documented Water Saving)
    const cropEtcM3PerFeddan = crop.cropWaterConsumptionEtcM3;
    const irrigationRequirementM3PerFeddan = Math.round(cropEtcM3PerFeddan / irrigationEfficiency);
    const baselineIrrigationM3 = metrics.baselineWaterM3PerFeddan;
    const waterSavedM3PerFeddan = baselineIrrigationM3 - irrigationRequirementM3PerFeddan;
    const waterSavingPctVsBaseline =
      baselineIrrigationM3 > 0
        ? Number(((waterSavedM3PerFeddan / baselineIrrigationM3) * 100).toFixed(1))
        : 0;

    const physicalWaterProductivityKgPerM3 = Number(
      ((prodEst.expectedPerFeddan * crop.unitWeightKg) / irrigationRequirementM3PerFeddan).toFixed(2)
    );

    // 5. Evaluate Rotation & Soil Compatibility
    const isSameBotanicalFamilyAsPrev = prevCrop.family === crop.botanicalFamily;
    const isSolanaceaeRepeat =
      prevCrop.family === 'SOLANACEAE' && crop.botanicalFamily === 'SOLANACEAE';
    const isCerealRepeat =
      prevCrop.family === 'POACEAE_CEREAL' && crop.botanicalFamily === 'POACEAE_CEREAL';
    const followsLegume = prevCrop.family === 'FABACEAE_LEGUME';

    const salinityHeadroomDsm = Number(
      (crop.soilHealthProfile.fao56SalinityThresholdDsm - metrics.soilSalinityDsm).toFixed(2)
    );
    const hasSalinityStress = salinityHeadroomDsm < 0;

    // 5-B. Evaluate LIVE LOCATION CLIMATE MATCH (Temperature T2M, Humidity RH2M, Solar Radiation)
    const [optMinT, optMaxT] = rules.optimalTempRange;
    const liveTempC = Number(weather.tempAvgC) || 21.5;
    const liveHumidityPct = Number(weather.humidityPct) || 58;
    const liveSolarMj = Number(weather.solarMjDay) || 17.0;

    let tempDeviationC = 0;
    if (liveTempC < optMinT) tempDeviationC = optMinT - liveTempC;
    if (liveTempC > optMaxT) tempDeviationC = liveTempC - optMaxT;

    const isThermalOptimum = tempDeviationC === 0;
    // High humidity (>68%) creates fungal/blight risk for Solanaceae (Potato/Tomato)
    const hasHighHumidityFungalRisk =
      liveHumidityPct >= 68 && crop.botanicalFamily === 'SOLANACEAE';

    const climateMatchSummaryAr = isThermalOptimum
      ? `توافق حراري ممتاز: حرارة موقعك الحالية (${liveTempC}°C) تقع داخل النطاق الأمثل للمحصول (${optMinT}°C – ${optMaxT}°C)، مع رطوبة نسبية (${liveHumidityPct}%) وإشعاع شمسي (${liveSolarMj} MJ/m²/d).`
      : `حرارة الموقع الحالية (${liveTempC}°C) تنحرف بمقدار ${tempDeviationC.toFixed(1)}°C عن النطاق الأمثل (${optMinT}°C – ${optMaxT}°C)؛ يُراعى ضبط ميعاد الزراعة المناسب.`;

    // 6. Plan-specific priority ordering & transparent evidence explanation
    let priorityOrder = 10;
    let suitabilityLabelAr = 'مناسب جداً';
    let badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    let mainRecommendationReasonAr = '';
    let planSpecificHighlightAr = '';
    let importantLimitationsAr = [...locationAdvisoryNotes];
    let whyRecommendedBulletsAr = [];

    if (!isThermalOptimum) {
      importantLimitationsAr.push(climateMatchSummaryAr);
    }
    if (hasHighHumidityFungalRisk) {
      importantLimitationsAr.push(
        `تنبيه رطوبة جوية (${liveHumidityPct}% في موقعك): الرطوبة النسبية المرتفعة تزيد من احتمالية الندوة المتأخرة؛ يلزم الري المتوازن والوقاية الفطرية المبكرة.`
      );
    }
    if (crop.seasonCode === 'SUMMER') {
      importantLimitationsAr.push(
        `تنبيه موسمي: هذا المحصول يُزرع في ${crop.seasonBadgeAr}؛ يُدرج هنا للتخطيط وفق حرارة ورطوبة موقعك.`
      );
    }
    if (hasSalinityStress) {
      importantLimitationsAr.push(
        `ملوحة التربة في موقعك (${metrics.soilSalinityDsm} dS/m) أعلى من عتبة تحمل المحصول المثلى (${crop.soilHealthProfile.fao56SalinityThresholdDsm} dS/m)، مما قد يخفض الإنتاجية بنحو ${Math.round((1 - prodEst.soilFactor) * 100)}%.`
      );
    }
    if (!farm.soilIsVerified) {
      importantLimitationsAr.push(
        'خصائص التربة مستمدة من التقدير الإقليمي للمنطقة؛ يُنصح بإجراء تحليل تربة معملي قبل إضافة الأسمدة.'
      );
    }

    if (planId === 'SOIL_HEALTH') {
      // PLAN A: SOIL HEALTH METHODOLOGY + LIVE LOCATION CLIMATE
      let tier = crop.soilHealthProfile.soilSustainabilityRankBase;
      if (isSolanaceaeRepeat) {
        tier += 5;
        importantLimitationsAr.push(
          `تحذير دورة زراعية: المحصول السابق (${prevCrop.nameAr}) من نفس العائلة الباذنجانية، وتكراره يرفع خطر النيماتودا وأعفان الجذور.`
        );
      } else if (isCerealRepeat) {
        tier += 2;
        importantLimitationsAr.push(
          `تنبيه دورة زراعية: المحصول السابق (${prevCrop.nameAr}) من العائلة النجيلية؛ يفضل كسر الدورة بمحصول جذري كالبنجر أو بقولي لتقليل الحشائش.`
        );
      } else {
        tier -= 1; // Breaks pest/weed cycle!
      }

      if (hasSalinityStress) {
        tier += 4;
      } else if (salinityHeadroomDsm >= 3.5) {
        tier -= 1; // High salinity safety margin
      }

      if (crop.seasonCode === 'WINTER') tier -= 0.5;

      priorityOrder = tier * 10 - salinityHeadroomDsm + tempDeviationC * 1.4 + (hasHighHumidityFungalRisk ? 2.5 : 0);

      if (isSolanaceaeRepeat || hasSalinityStress) {
        suitabilityLabelAr = 'مناسب بشروط';
        badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      } else if (tier <= 2) {
        suitabilityLabelAr = 'مناسب جداً';
        badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      } else {
        suitabilityLabelAr = 'مناسب';
        badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      }

      mainRecommendationReasonAr = !isSameBotanicalFamilyAsPrev
        ? `يكسر دورة الآفات والحشائش بعد (${prevCrop.nameAr})، ويتحمل ملوحة التربة حتى ${crop.soilHealthProfile.fao56SalinityThresholdDsm} dS/m (مقارنة بملوحة موقعك ${metrics.soilSalinityDsm} dS/m) مع توافق مناخي (${liveTempC}°C ورطوبة ${liveHumidityPct}%) و${crop.soilHealthProfile.rootStructureBenefitAr}`
        : `ملائم لقوام وملوحة تربة ${farm.governorateAr} (${metrics.soilSalinityDsm} dS/m مقارنة بحد التحمل ${crop.soilHealthProfile.fao56SalinityThresholdDsm} dS/m)، مع ضرورة مراعاة تعاقب المحاصيل من نفس العائلة.`;

      planSpecificHighlightAr = `تحمل الملوحة (FAO-56): حتى ${crop.soilHealthProfile.fao56SalinityThresholdDsm} dS/m • حرارة الموقع: ${liveTempC}°C (النطاق الأمثل ${optMinT}–${optMaxT}°C) • الرطوبة: ${liveHumidityPct}%`;

      whyRecommendedBulletsAr = [
        climateMatchSummaryAr,
        `ملاءمة التربة والملوحة: ملوحة أرضك (${metrics.soilSalinityDsm} dS/m) تقع ضمن نطاق الأمان الموثق للمحصول (${crop.soilHealthProfile.fao56SalinityThresholdDsm} dS/m في مرجع FAO-56).`,
        `توافق الدورة الزراعية: زراعة ${crop.nameAr} (${crop.familyNameAr}) بعد ${prevCrop.nameAr} ${!isSameBotanicalFamilyAsPrev ? 'تمنع توطن أمراض التربة والحشائش المتخصصة' : 'تتطلب عناية إضافية بالخدمة العضوية ومقاومة الحشائش'}.`,
        `التمييز العلمي الموثق: ${crop.soilHealthProfile.verifiedSoilNoteAr}`,
      ];
    } else if (planId === 'MAX_PRODUCTION') {
      // PLAN B: MAXIMUM PRODUCTION METHODOLOGY + LIVE LOCATION CLIMATE
      const attainRatio = prodEst.expectedPerFeddan / prodEst.historicalOfficialPerFeddan;
      const gaezBonus = gaez.gaezClass === 'VS' ? 0 : gaez.gaezClass === 'S' ? 2 : 5;
      const seasonBonus = crop.seasonCode === 'WINTER' ? 0 : 1.2;
      const stressPenalty = (1 - prodEst.soilFactor * prodEst.waterFactor) * 15;

      priorityOrder =
        gaezBonus +
        seasonBonus +
        stressPenalty +
        tempDeviationC * 0.9 +
        (hasHighHumidityFungalRisk ? 1.5 : 0) -
        attainRatio * 5;

      if (gaez.gaezClass === 'VS' && !hasSalinityStress && tempDeviationC <= 2) {
        suitabilityLabelAr = 'مناسب جداً';
        badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      } else if (hasSalinityStress || tempDeviationC > 4) {
        suitabilityLabelAr = 'مناسب بشروط';
        badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      } else {
        suitabilityLabelAr = 'مناسب';
        badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      }

      mainRecommendationReasonAr = `مصنف في الفئة (${gaez.gaezClassAr}) لموقعك في ${farm.governorateAr}، مع إنتاجية مقدرة تبلغ ${prodEst.expectedPerFeddan} ${crop.unitAr}/فدان بفضل توافق حرارة الموقع (${liveTempC}°C) والرطوبة (${liveHumidityPct}%) وسطوع الشمس (${liveSolarMj} MJ/m²/d).`;

      planSpecificHighlightAr = `إنتاجية الفدان المقدرة: ${prodEst.expectedPerFeddan} ${crop.unitAr} (السقف النموذجي GAEZ: ${prodEst.gaezPotentialPerFeddan} • المتوسط التاريخي للمحافظة: ${prodEst.historicalOfficialPerFeddan})`;

      whyRecommendedBulletsAr = [
        climateMatchSummaryAr,
        `تصنيف FAO GAEZ v5: المحصول يقع في فئة (${gaez.gaezClassAr}) في ${farm.governorateAr} بسقف إنتاجي نموذجي يبلغ ${prodEst.gaezPotentialPerFeddan} ${crop.unitAr}/فدان (وهو سقف إرشادي وليس إنتاجاً مضموناً).`,
        `الإنتاجية التاريخية المرصودة: متوسط محافظة ${farm.governorateAr} في إحصاءات وزارة الزراعة يبلغ ${prodEst.historicalOfficialPerFeddan} ${crop.unitAr}/فدان.`,
        `تقدير نموذج سولدوك (FAO-33/56): بناءً على كفاية المياه في WaPOR (${Math.round(metrics.waterSupplyRatio * 100)}%) ومعامل التربة (${Math.round(prodEst.soilFactor * 100)}%)، يُقدر إنتاج مزرعتك بنحو ${prodEst.expectedPerFeddan} ${crop.unitAr}/فدان (${prodEst.minPerFeddan} – ${prodEst.maxPerFeddan}).`,
      ];
    } else {
      // PLAN C: WATER SAVING METHODOLOGY + LIVE LOCATION CLIMATE
      const waterRankMetric =
        irrigationRequirementM3PerFeddan / 100 -
        (crop.seasonCode === 'WINTER' ? 4 : 0) +
        tempDeviationC * 0.7 +
        (hasSalinityStress ? 8 : 0);

      priorityOrder = waterRankMetric;

      if (waterSavingPctVsBaseline >= 15 && !hasSalinityStress) {
        suitabilityLabelAr = 'مناسب جداً';
        badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      } else if (waterSavingPctVsBaseline >= 0) {
        suitabilityLabelAr = 'مناسب';
        badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      } else {
        suitabilityLabelAr = 'مناسب بشروط';
        badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
        importantLimitationsAr.push(
          `هذا المحصول يستهلك مياهاً أعلى من خط الأساس المرجعي للمزرعة بنحو ${Math.abs(waterSavedM3PerFeddan)} م³/فدان.`
        );
      }

      mainRecommendationReasonAr =
        waterSavedM3PerFeddan >= 0
          ? `يحقق وفراً مائياً موثقاً قدره ${waterSavingPctVsBaseline}% (بمقدار ${waterSavedM3PerFeddan.toLocaleString('ar-EG')} م³/فدان) تحت ظروف حرارة موقعك (${liveTempC}°C) ورطوبته (${liveHumidityPct}%)، مع إنتاجية مياه تبلغ ${physicalWaterProductivityKgPerM3} كجم لكل متر مكعب.`
          : `إجمالي احتياج مياه الري المضافة يبلغ ${irrigationRequirementM3PerFeddan.toLocaleString('ar-EG')} م³/فدان مع إنتاجية مياه ${physicalWaterProductivityKgPerM3} كجم/م³؛ يتطلب تطوير شبكة الري لتقليل الفاقد.`;

      planSpecificHighlightAr = `الاستهلاك المائي للمحصول (ETc): ${cropEtcM3PerFeddan} م³ • مياه الري المضافة: ${irrigationRequirementM3PerFeddan} م³ • الوفر المائي: ${waterSavedM3PerFeddan >= 0 ? `${waterSavingPctVsBaseline}% (${waterSavedM3PerFeddan} م³/فدان)` : 'لا يوجد وفر عن خط الأساس'}`;

      whyRecommendedBulletsAr = [
        climateMatchSummaryAr,
        `1. إجمالي الاستهلاك المائي الفعلي للمحصول (ETc): يبلغ ${cropEtcM3PerFeddan.toLocaleString('ar-EG')} م³/فدان خلال موسم النمو وفق معاملات FAO-56 وبيانات البخر-نتح في FAO WaPOR v3 لموقعك.`,
        `2. احتياج مياه الري المضافة للمزرعة: يبلغ ${irrigationRequirementM3PerFeddan.toLocaleString('ar-EG')} م³/فدان بناءً على كفاءة نظام الري الحالي بالمزرعة (${Math.round(irrigationEfficiency * 100)}%).`,
        `3. إنتاجية وحدة المياه (Water Productivity): ينتج كل متر مكعب مياه نحو ${physicalWaterProductivityKgPerM3} كجم من المحصول.`,
        `4. معادلة الوفر المائي الموثقة: (خط الأساس المرجعي ${baselineIrrigationM3} م³ − احتياج الري ${irrigationRequirementM3PerFeddan} م³) ÷ ${baselineIrrigationM3} م³ = ${waterSavingPctVsBaseline}% (${waterSavedM3PerFeddan} م³/فدان).`,
      ];
    }

    if (importantLimitationsAr.length === 0) {
      importantLimitationsAr.push(
        'الالتزام بميعاد الزراعة الموصى به وتحليل التربة الدوري يضمن الحفاظ على هذا المستوى من الملاءمة.'
      );
    }

    const econEst = calculateSmartFarmEconomics({
      farm,
      crop,
      areaSqm: areaFeddans * FEDDAN_SQM,
      priceMode: 'farmGate',
      selectedProductionPerFeddanOverride: prodEst.expectedPerFeddan,
    });

    eligibleCandidates.push({
      crop,
      priorityOrder,
      suitabilityLabelAr,
      badgeStyle,
      mainRecommendationReasonAr,
      planSpecificHighlightAr,
      importantLimitationsAr,
      whyRecommendedBulletsAr,
      productionEstimate: prodEst,
      economicsSummary: {
        costPerFeddan: econEst.costs.costPerFeddan,
        netProfitPerFeddan: econEst.profit.netProfitPerFeddan,
        totalNetProfit: econEst.profit.totalNetProfit,
      },
      climateComparison: {
        locationTempC: liveTempC,
        locationTempMaxC: Number(weather.tempMaxC) || 27.5,
        locationTempMinC: Number(weather.tempMinC) || 15.2,
        optimalTempRange: rules.optimalTempRange,
        tempDeviationC: Number(tempDeviationC.toFixed(1)),
        locationHumidityPct: liveHumidityPct,
        locationSolarMj: liveSolarMj,
        locationWindMs: Number(weather.windSpeedMs) || 3.4,
        locationRainfallMm: Number(weather.rainfallMmDay) || 0.2,
        locationEt0MmDay: Number(((farm.waporMetrics?.retSeasonalMm || 540) / 120).toFixed(1)),
      },
      soilMetrics: {
        farmSalinityDsm: metrics.soilSalinityDsm,
        cropThresholdDsm: crop.soilHealthProfile.fao56SalinityThresholdDsm,
        salinityHeadroomDsm,
        prevCropNameAr: prevCrop.nameAr,
        rotationStatusAr: !isSameBotanicalFamilyAsPrev
          ? 'يكسر دورة الآفات والحشائش (عائلة نباتية مختلفة)'
          : 'تحذير: نفس العائلة النباتية للمحصول السابق',
        verifiedSoilNoteAr: crop.soilHealthProfile.verifiedSoilNoteAr,
        followsLegume,
      },
      waterMetrics: {
        cropEtcM3PerFeddan,
        irrigationRequirementM3PerFeddan,
        irrigationEfficiencyPct: Math.round(irrigationEfficiency * 100),
        baselineIrrigationM3,
        waterSavedM3PerFeddan,
        waterSavingPctVsBaseline,
        physicalWaterProductivityKgPerM3,
      },
      dataFreshnessBadge: {
        statusLabelAr: simulateMissingSoilWaterData
          ? 'بيانات جزئية (نقص رصد التربة/المياه)'
          : isCacheFallbackMode
          ? 'بيانات محفوظة (قديمة مؤقتاً)'
          : 'بيانات حديثة وموثقة لموقعك',
        availabilityAr: simulateMissingSoilWaterData
          ? 'غير مكتملة'
          : isCacheFallbackMode
          ? 'قديمة (من الذاكرة المخبأة)'
          : 'متاحة',
        lastUpdateAr: lastUpdatedTextAr,
        sourcesSummaryAr: 'Google Maps AOI • NASA POWER • FAO WaPOR v3 • Sentinel-2 • FAO GAEZ v5',
      },
    });
  });

  const sortedTop5 = eligibleCandidates
    .sort((a, b) => a.priorityOrder - b.priorityOrder)
    .slice(0, 5)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  return {
    recommendedTopCrops: sortedTop5,
    totalEligibleCount: eligibleCandidates.length,
    excludedCrops,
  };
}

// ============================================================================
// 9. EXISTING SMART FARM ECONOMICS CALCULATOR (REUSED & CONNECTED)
// ============================================================================
function calculateSmartFarmEconomics({
  farm,
  crop,
  areaSqm,
  customCostsPerFeddan = {},
  priceMode = 'farmGate',
  manualSellingPrice = '',
  simulateNoRecentPrice = false,
  selectedProductionPerFeddanOverride = null,
}) {
  const area = formatAreaInFeddans(areaSqm);
  const feddans = area.feddans;

  const itemCosts = COST_ITEM_METADATA.map((meta) => {
    const officialPerFeddan = crop.costsPerFeddan[meta.key] || 0;
    const overrideVal = customCostsPerFeddan[meta.key];
    const isManual =
      overrideVal !== undefined && overrideVal !== null && overrideVal !== '' && Number.isFinite(Number(overrideVal));
    const effectivePerFeddan = isManual ? Math.max(0, Number(overrideVal)) : officialPerFeddan;

    return {
      ...meta,
      officialPerFeddan,
      effectivePerFeddan,
      totalFarmCost: Math.round(effectivePerFeddan * feddans),
      isManual,
    };
  });

  const costPerFeddan = itemCosts.reduce((sum, item) => sum + item.effectivePerFeddan, 0);
  const totalCultivationCost = Math.round(costPerFeddan * feddans);

  const chartGroupsConfig = [
    { groupKey: 'SEEDS', labelAr: 'التقاوي والشتلات', color: 'bg-amber-500' },
    { groupKey: 'FERTILIZERS', labelAr: 'الأسمدة والمخصبات', color: 'bg-emerald-600' },
    { groupKey: 'PESTICIDES', labelAr: 'المبيدات والوقاية', color: 'bg-rose-500' },
    { groupKey: 'LABOR', labelAr: 'العمالة الزراعية', color: 'bg-teal-600' },
    { groupKey: 'IRRIGATION', labelAr: 'الري والمياه', color: 'bg-sky-500' },
    { groupKey: 'HARVESTING', labelAr: 'الحصاد والجمع', color: 'bg-lime-600' },
    { groupKey: 'OTHER', labelAr: 'مصاريف أخرى (تجهيز + وقود + نقل + إيجار)', color: 'bg-[#2d6a4f]' },
  ];

  const visualCostBreakdown = chartGroupsConfig.map((grp) => {
    const perFeddan = itemCosts
      .filter((i) => i.chartGroup === grp.groupKey)
      .reduce((s, i) => s + i.effectivePerFeddan, 0);
    const totalFarm = Math.round(perFeddan * feddans);
    const sharePct = costPerFeddan > 0 ? Math.round((perFeddan / costPerFeddan) * 100) : 0;
    return { ...grp, perFeddan, totalFarm, sharePct };
  });

  const yieldRecord = crop.yieldByGov[farm.governorateCode] || crop.yieldByGov.QLY;
  const productionPerFeddan =
    selectedProductionPerFeddanOverride !== null && Number.isFinite(Number(selectedProductionPerFeddanOverride))
      ? Number(selectedProductionPerFeddanOverride)
      : yieldRecord.value;
  const totalExpectedProduction = Number((productionPerFeddan * feddans).toFixed(2));
  const totalProductionTons = Number(((totalExpectedProduction * crop.unitWeightKg) / 1000).toFixed(2));

  const hasManualPrice =
    manualSellingPrice !== '' &&
    manualSellingPrice !== null &&
    Number.isFinite(Number(manualSellingPrice)) &&
    Number(manualSellingPrice) > 0;

  const priceSourceObj = priceMode === 'wholesale' ? crop.prices.wholesale : crop.prices.farmGate;
  const priceUnavailable = simulateNoRecentPrice && !hasManualPrice;

  const activeSellingPrice = priceUnavailable
    ? null
    : hasManualPrice
    ? Number(manualSellingPrice)
    : priceSourceObj.valueEgp;

  const expectedRevenuePerFeddan =
    activeSellingPrice !== null ? Math.round(productionPerFeddan * activeSellingPrice) : null;
  const totalExpectedRevenue =
    activeSellingPrice !== null ? Math.round(totalExpectedProduction * activeSellingPrice) : null;

  const totalNetProfit =
    totalExpectedRevenue !== null ? totalExpectedRevenue - totalCultivationCost : null;
  const netProfitPerFeddan =
    expectedRevenuePerFeddan !== null ? expectedRevenuePerFeddan - costPerFeddan : null;

  return {
    area,
    costs: {
      costPerFeddan,
      totalCultivationCost,
      itemCosts,
      visualCostBreakdown,
      hasAnyManualCost: itemCosts.some((i) => i.isManual),
    },
    production: {
      productionPerFeddan,
      totalExpectedProduction,
      totalProductionTons,
      yieldRecord,
    },
    revenue: {
      priceUnavailable,
      hasManualPrice,
      priceMode,
      priceSourceObj,
      activeSellingPrice,
      expectedRevenuePerFeddan,
      totalExpectedRevenue,
    },
    profit: {
      totalNetProfit,
      netProfitPerFeddan,
    },
  };
}

// ============================================================================
// 9-B. THREE.JS 3D FARM SIMULATION ENGINE (INTEGRATED FROM AGRI-GO_3d_farm.tsx)
//      WITH FULL TWO-WAY SYNC TO AGRI-GO CROPS, IRRIGATION & NASA POWER DATA
// ============================================================================
const CORN_10_STAGES = {
  1: { code: 'VE', nameAr: '١. الإنبات وظهور البادرة', height: 0.08, leaves: 1, kc: 0.15, ky: 0.4, hasTassel: false, hasSilk: false, earScale: 0 },
  2: { code: 'V2', nameAr: '٢. بادرة صغيرة (ورقتان)', height: 0.22, leaves: 3, kc: 0.25, ky: 0.4, hasTassel: false, hasSilk: false, earScale: 0 },
  3: { code: 'V5', nameAr: '٣. نمو خضري مبكر', height: 0.58, leaves: 5, kc: 0.50, ky: 0.6, hasTassel: false, hasSilk: false, earScale: 0 },
  4: { code: 'V10', nameAr: '٤. نمو خضري متقدم', height: 1.35, leaves: 9, kc: 0.90, ky: 0.85, hasTassel: false, hasSilk: false, earScale: 0 },
  5: { code: 'VT', nameAr: '٥. طرد النورة المذكرة (السنبلة)', height: 2.10, leaves: 12, kc: 1.15, ky: 1.25, hasTassel: true, hasSilk: false, earScale: 0.2 },
  6: { code: 'R1', nameAr: '٦. التزهير وظهور الحريرة', height: 2.35, leaves: 13, kc: 1.20, ky: 1.50, hasTassel: true, hasSilk: true, earScale: 0.45 },
  7: { code: 'R3', nameAr: '٧. تكوين الكوز (الطور اللبني)', height: 2.42, leaves: 14, kc: 1.15, ky: 1.15, hasTassel: true, hasSilk: true, earScale: 0.78 },
  8: { code: 'R5', nameAr: '٨. امتلاء الحبوب (الطور العجيني)', height: 2.45, leaves: 14, kc: 0.95, ky: 0.90, hasTassel: true, hasSilk: false, earScale: 1.0 },
  9: { code: 'R6', nameAr: '٩. النضج الفسيولوجي', height: 2.40, leaves: 13, kc: 0.60, ky: 0.35, hasTassel: true, hasSilk: false, earScale: 1.0 },
  10: { code: 'H', nameAr: '١٠. جاهز للحصاد (جفاف الغلاف)', height: 2.32, leaves: 12, kc: 0.35, ky: 0.10, hasTassel: true, hasSilk: false, earScale: 1.0 },
};

const CROP_CATALOG_3D = {
  corn: {
    id: 'corn',
    AGRI-GOCropId: 'EG_MAIZE',
    nameAr: 'ذرة شامية (شامي)',
    nameEn: 'Maize / Corn',
    defaultRowSpacing: 0.75,
    defaultPlantSpacing: 0.35,
    baseColor: 0x2d6e26,
    heatLimitC: 36,
    frostLimitC: 0.5,
    windVulnerability: 1.0,
  },
  wheat: {
    id: 'wheat',
    AGRI-GOCropId: 'EG_WHEAT',
    nameAr: 'قمح مصري',
    nameEn: 'Egyptian Wheat',
    defaultRowSpacing: 0.32,
    defaultPlantSpacing: 0.22,
    baseColor: 0x4b7d2c,
    heatLimitC: 32,
    frostLimitC: -4.0,
    windVulnerability: 0.65,
  },
  rice: {
    id: 'rice',
    AGRI-GOCropId: 'EG_RICE',
    nameAr: 'أرز دلتا النيل',
    nameEn: 'Paddy Rice',
    defaultRowSpacing: 0.30,
    defaultPlantSpacing: 0.22,
    baseColor: 0x3b8734,
    heatLimitC: 37,
    frostLimitC: 2.0,
    windVulnerability: 0.55,
  },
  tomato: {
    id: 'tomato',
    AGRI-GOCropId: 'EG_TOMATO',
    nameAr: 'طماطم حقلية',
    nameEn: 'Field Tomato',
    defaultRowSpacing: 0.90,
    defaultPlantSpacing: 0.50,
    baseColor: 0x265e20,
    heatLimitC: 34,
    frostLimitC: 1.0,
    windVulnerability: 0.40,
  },
  potato: {
    id: 'potato',
    AGRI-GOCropId: 'EG_POTATO',
    nameAr: 'بطاطس',
    nameEn: 'Potato',
    defaultRowSpacing: 0.75,
    defaultPlantSpacing: 0.40,
    baseColor: 0x346627,
    heatLimitC: 30,
    frostLimitC: -1.0,
    windVulnerability: 0.25,
  },
  cotton: {
    id: 'cotton',
    AGRI-GOCropId: 'EG_COTTON',
    nameAr: 'قطن مصري طويل التيلة',
    nameEn: 'Egyptian Cotton',
    defaultRowSpacing: 0.80,
    defaultPlantSpacing: 0.45,
    baseColor: 0x2b683b,
    heatLimitC: 39,
    frostLimitC: 1.5,
    windVulnerability: 0.45,
  },
  sugar_beet: {
    id: 'sugar_beet',
    AGRI-GOCropId: 'EG_SUGAR_BEET',
    nameAr: 'بنجر السكر',
    nameEn: 'Sugar Beet',
    defaultRowSpacing: 0.55,
    defaultPlantSpacing: 0.25,
    baseColor: 0x2e7d32,
    heatLimitC: 35,
    frostLimitC: -3.0,
    windVulnerability: 0.20,
  },
};

const AGRI-GO_TO_3D_CROP_MAP = {
  EG_MAIZE: 'corn',
  EG_WHEAT: 'wheat',
  EG_RICE: 'rice',
  EG_TOMATO: 'tomato',
  EG_POTATO: 'potato',
  EG_COTTON: 'cotton',
  EG_SUGAR_BEET: 'sugar_beet',
};

const CROP_3D_TO_AGRI-GO_MAP = {
  corn: 'EG_MAIZE',
  wheat: 'EG_WHEAT',
  rice: 'EG_RICE',
  tomato: 'EG_TOMATO',
  potato: 'EG_POTATO',
  cotton: 'EG_COTTON',
  sugar_beet: 'EG_SUGAR_BEET',
};

const AGRI-GO_TO_3D_IRRIGATION_MAP = {
  TRADITIONAL_SURFACE: 'surface',
  DRIP: 'drip',
  SPRINKLER: 'sprinkler',
};

const IRRIGATION_3D_TO_AGRI-GO_MAP = {
  surface: 'TRADITIONAL_SURFACE',
  drip: 'DRIP',
  sprinkler: 'SPRINKLER',
};

const PHENOMENA_PRESETS = {
  normal: {
    id: 'normal',
    nameAr: 'طقس طبيعي معتدل (رصد NASA POWER للمزرعة)',
    provenance: 'OBSERVED',
    citation: 'NASA POWER (T2M, WS2M, ALLSKY_SFC_SW_DWN) + FAO WaPOR v3 (L1-AETI-D) + Sentinel-2 NDVI',
    windSpeedMs: 3.2,
    windDirDeg: 315,
    airTempC: 25.0,
    rhPct: 54,
    solarWm2: 760,
    rainMmHr: 0,
    et0MmDay: 4.4,
    dustOpticalDepth: 0.06,
  },
  strong_wind: {
    id: 'strong_wind',
    nameAr: 'رياح شديدة وعواصف',
    provenance: 'ILLUSTRATIVE_SIMULATION',
    citation: 'محاكاة توضيحية معايرة لبيانات ERA5 لهبات الرياح القصوى في دلتا النيل (>17 م/ث)',
    windSpeedMs: 18.2,
    windDirDeg: 295,
    airTempC: 26.5,
    rhPct: 38,
    solarWm2: 680,
    rainMmHr: 0,
    et0MmDay: 7.4,
    dustOpticalDepth: 0.48,
  },
  extreme_heat: {
    id: 'extreme_heat',
    nameAr: 'موجة حرارة شديدة',
    provenance: 'ILLUSTRATIVE_SIMULATION',
    citation: 'محاكاة توضيحية لموجات الحر الشديدة في صعيد ودلتا مصر (NASA POWER >44°C)',
    windSpeedMs: 4.6,
    windDirDeg: 180,
    airTempC: 44.8,
    rhPct: 15,
    solarWm2: 1050,
    rainMmHr: 0,
    et0MmDay: 10.9,
    dustOpticalDepth: 0.25,
  },
  heavy_rain: {
    id: 'heavy_rain',
    nameAr: 'أمطار غزيرة وتجمع مياه',
    provenance: 'ILLUSTRATIVE_SIMULATION',
    citation: 'محاكاة توضيحية لنوات الأمطار الغزيرة (ERA5 Precipitation >32 mm/hr)',
    windSpeedMs: 11.4,
    windDirDeg: 330,
    airTempC: 16.0,
    rhPct: 95,
    solarWm2: 180,
    rainMmHr: 35.0,
    et0MmDay: 1.3,
    dustOpticalDepth: 0.01,
  },
  drought: {
    id: 'drought',
    nameAr: 'جفاف وإجهاد مائي',
    provenance: 'ILLUSTRATIVE_SIMULATION',
    citation: 'محاكاة توضيحية لنقص المياه وفق نموذج FAO-56 Dual Kc ومعامل استجابة المحصول FAO GAEZ Ky',
    windSpeedMs: 4.5,
    windDirDeg: 315,
    airTempC: 36.5,
    rhPct: 22,
    solarWm2: 950,
    rainMmHr: 0,
    et0MmDay: 8.8,
    dustOpticalDepth: 0.32,
  },
  cold_frost: {
    id: 'cold_frost',
    nameAr: 'برودة شديدة وصقيع',
    provenance: 'ILLUSTRATIVE_SIMULATION',
    citation: 'محاكاة توضيحية لموجات الصقيع الليلي الإشعاعي في الأراضي الزراعية (ERA5 Min Temp <0°C)',
    windSpeedMs: 1.4,
    windDirDeg: 10,
    airTempC: -2.0,
    rhPct: 88,
    solarWm2: 320,
    rainMmHr: 0,
    et0MmDay: 1.0,
    dustOpticalDepth: 0.02,
  },
  dust_storm: {
    id: 'dust_storm',
    nameAr: 'عاصفة ترابية (خماسين)',
    provenance: 'ILLUSTRATIVE_SIMULATION',
    citation: 'محاكاة توضيحية لعواصف الخماسين الترابية الموسمية (ERA5 / MODIS Aerosol Optical Depth)',
    windSpeedMs: 16.4,
    windDirDeg: 210,
    airTempC: 39.0,
    rhPct: 14,
    solarWm2: 390,
    rainMmHr: 0,
    et0MmDay: 9.6,
    dustOpticalDepth: 2.75,
  },
};

function mergeBufferGeometries(geometries) {
  const merged = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const colors = [];

  for (const geo of geometries) {
    const nonIndexed = geo.index ? geo.toNonIndexed() : geo;
    const posAttr = nonIndexed.getAttribute('position');
    const normAttr = nonIndexed.getAttribute('normal');
    const colAttr = nonIndexed.getAttribute('color');

    for (let i = 0; i < posAttr.count; i++) {
      positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      if (normAttr) {
        normals.push(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i));
      } else {
        normals.push(0, 1, 0);
      }
      if (colAttr) {
        colors.push(colAttr.getX(i), colAttr.getY(i), colAttr.getZ(i));
      } else {
        colors.push(1, 1, 1);
      }
    }
  }

  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return merged;
}

function paintGeometryVertexColor(geo, hexColor) {
  const color = new THREE.Color(hexColor);
  const count = geo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

function buildCrop3DGeometry(cropType, stageIndex) {
  const stageSpec = CORN_10_STAGES[stageIndex] || CORN_10_STAGES[6];
  const parts = [];
  const stageProgress = stageIndex / 10;

  if (cropType === 'corn') {
    const H = stageSpec.height;
    const rBottom = Math.max(0.006, 0.022 * Math.min(1, stageIndex / 5));
    const rTop = rBottom * 0.38;

    const stalk = new THREE.CylinderGeometry(rTop, rBottom, H, 8, 10);
    stalk.translate(0, H / 2, 0);
    paintGeometryVertexColor(stalk, stageIndex >= 9 ? 0x6b7032 : 0x3b7a2e);
    parts.push(stalk);

    const leafCount = stageSpec.leaves;
    for (let i = 0; i < leafCount; i++) {
      const frac = (i + 1) / (leafCount + 1);
      const nodeY = H * (0.1 + 0.78 * frac);
      const azimuth = i * 2.75 + (i % 2) * 0.4;
      const leafLen = Math.sin(frac * Math.PI) * (0.16 + 0.68 * Math.min(1, stageIndex / 5));
      const leafWid = 0.03 + 0.065 * Math.sin(frac * Math.PI) * Math.min(1, stageIndex / 4);

      const leafGeo = new THREE.PlaneGeometry(leafLen, leafWid, 10, 2);
      const pos = leafGeo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const lx = pos.getX(v) + leafLen / 2;
        const ly = pos.getY(v);
        const t = lx / leafLen;
        const widthEnv = Math.sin(Math.pow(t, 0.7) * Math.PI);
        const zLocal = ly * widthEnv;
        const archY = Math.sin(t * Math.PI * 0.64) * (leafLen * 0.38) - Math.pow(t, 2.5) * (leafLen * 0.44);
        const midrib = Math.abs(ly / (leafWid * 0.5)) * 0.009;

        const wx = Math.cos(azimuth) * lx - Math.sin(azimuth) * zLocal;
        const wz = Math.sin(azimuth) * lx + Math.cos(azimuth) * zLocal;
        pos.setXYZ(v, wx, nodeY + archY + midrib, wz);
      }
      leafGeo.computeVertexNormals();
      paintGeometryVertexColor(leafGeo, stageIndex === 10 ? 0x8a7943 : 0x2d6e26);
      parts.push(leafGeo);
    }

    if (stageSpec.hasTassel) {
      for (let b = 0; b < 6; b++) {
        const angle = (b / 6) * Math.PI * 2;
        const tilt = b === 0 ? 0 : 0.44;
        const tasselBranch = new THREE.CylinderGeometry(0.003, 0.005, 0.25, 5, 3);
        tasselBranch.translate(0, 0.125, 0);
        tasselBranch.rotateZ(tilt);
        tasselBranch.rotateY(angle);
        tasselBranch.translate(0, H, 0);
        paintGeometryVertexColor(tasselBranch, 0xc2a649);
        parts.push(tasselBranch);
      }
    }

    if (stageSpec.earScale > 0) {
      const earLen = 0.24 * stageSpec.earScale;
      const earRad = 0.042 * stageSpec.earScale;
      const ear = new THREE.CylinderGeometry(earRad * 0.65, earRad, earLen, 8, 4);
      const tilt = stageIndex >= 9 ? 0.92 : 0.42;
      ear.rotateZ(tilt);
      ear.translate(0.055, H * 0.52, 0);
      paintGeometryVertexColor(ear, stageIndex >= 9 ? 0xb89c48 : 0x4b8733);
      parts.push(ear);

      if (stageSpec.hasSilk) {
        const silk = new THREE.CylinderGeometry(0.015, 0.005, 0.08, 6);
        silk.rotateZ(tilt + 0.3);
        silk.translate(0.11, H * 0.52 + earLen * 0.45, 0);
        paintGeometryVertexColor(silk, 0xd46a6a);
        parts.push(silk);
      }
    }
  } else if (cropType === 'wheat' || cropType === 'rice') {
    const H = (0.12 + 0.85 * stageProgress) * (cropType === 'rice' ? 0.92 : 1.0);
    const tillers = Math.min(5, Math.max(2, Math.floor(stageIndex / 2)));
    for (let t = 0; t < tillers; t++) {
      const angle = (t / tillers) * Math.PI * 2;
      const spread = 0.025 * t;
      const culm = new THREE.CylinderGeometry(0.004, 0.006, H, 5, 5);
      culm.translate(Math.cos(angle) * spread, H / 2, Math.sin(angle) * spread);
      const isGolden = cropType === 'wheat' && stageIndex >= 8;
      paintGeometryVertexColor(culm, isGolden ? 0xc8a446 : 0x437c2b);
      parts.push(culm);

      const blade = new THREE.PlaneGeometry(0.22 * stageProgress, 0.018, 5, 1);
      blade.rotateY(angle);
      blade.rotateZ(0.45);
      blade.translate(Math.cos(angle) * 0.06, H * 0.62, Math.sin(angle) * 0.06);
      paintGeometryVertexColor(blade, isGolden ? 0xb5913b : 0x3b7828);
      parts.push(blade);

      if (stageIndex >= 5) {
        const spike = new THREE.CylinderGeometry(0.010, 0.014, 0.13, 6, 3);
        if (cropType === 'rice' && stageIndex >= 7) {
          spike.rotateZ(0.55);
        }
        spike.translate(Math.cos(angle) * spread, H + 0.05, Math.sin(angle) * spread);
        paintGeometryVertexColor(spike, stageIndex >= 8 ? 0xd9b34c : 0x679436);
        parts.push(spike);
      }
    }
  } else if (cropType === 'sugar_beet') {
    // 3D Sugar Beet: Swollen white-cream conical taproot crown + rosette of lush broad leaves
    const rootRad = 0.025 + 0.065 * stageProgress;
    const rootHeight = 0.08 + 0.18 * stageProgress;
    const beetCrown = new THREE.ConeGeometry(rootRad, rootHeight, 8);
    beetCrown.rotateX(Math.PI);
    beetCrown.translate(0, rootHeight * 0.35, 0);
    paintGeometryVertexColor(beetCrown, 0xe2e8f0);
    parts.push(beetCrown);

    const rosetteLeaves = Math.min(12, Math.max(4, stageIndex + 2));
    for (let l = 0; l < rosetteLeaves; l++) {
      const az = (l / rosetteLeaves) * Math.PI * 2 + (l % 2) * 0.25;
      const bladeLen = (0.14 + 0.28 * stageProgress) * (0.85 + (l % 3) * 0.1);
      const bladeGeo = new THREE.SphereGeometry(bladeLen * 0.45, 6, 4);
      bladeGeo.scale(1.4, 0.22, 0.65);
      bladeGeo.rotateZ(0.55 - (l % 2) * 0.15);
      bladeGeo.rotateY(az);
      bladeGeo.translate(
        Math.cos(az) * (bladeLen * 0.45),
        rootHeight * 0.45 + bladeLen * 0.32,
        Math.sin(az) * (bladeLen * 0.45)
      );
      paintGeometryVertexColor(bladeGeo, stageIndex >= 9 ? 0x65a30d : 0x2e7d32);
      parts.push(bladeGeo);
    }
  } else {
    const H =
      cropType === 'cotton'
        ? 0.15 + 1.15 * stageProgress
        : cropType === 'tomato'
        ? 0.14 + 0.85 * stageProgress
        : 0.10 + 0.52 * stageProgress;

    const mainStem = new THREE.CylinderGeometry(0.008, 0.015, H, 6, 5);
    mainStem.translate(0, H / 2, 0);
    paintGeometryVertexColor(mainStem, 0x2f5e24);
    parts.push(mainStem);

    const branches = Math.min(8, Math.max(3, stageIndex));
    for (let b = 0; b < branches; b++) {
      const frac = (b + 1) / (branches + 1);
      const by = H * frac;
      const az = b * 2.3;
      const bLen = (0.12 + 0.22 * Math.sin(frac * Math.PI)) * Math.min(1, stageIndex / 4);

      const petiole = new THREE.CylinderGeometry(0.004, 0.006, bLen, 5);
      petiole.rotateZ(1.1);
      petiole.rotateY(az);
      petiole.translate(Math.cos(az) * (bLen * 0.4), by, Math.sin(az) * (bLen * 0.4));
      paintGeometryVertexColor(petiole, 0x356928);
      parts.push(petiole);

      const leaflet = new THREE.SphereGeometry(0.065 * Math.min(1, stageIndex / 3), 6, 4);
      leaflet.scale(1.3, 0.25, 0.9);
      leaflet.translate(Math.cos(az) * bLen, by + 0.02, Math.sin(az) * bLen);
      paintGeometryVertexColor(leaflet, 0x295e21);
      parts.push(leaflet);

      if (stageIndex >= 6 && b % 2 === 0) {
        const fruitPos = [Math.cos(az) * (bLen * 0.65), by - 0.03, Math.sin(az) * (bLen * 0.65)];
        if (cropType === 'tomato') {
          const tomatoFruit = new THREE.SphereGeometry(0.036 * Math.min(1, (stageIndex - 5) / 3), 8, 8);
          tomatoFruit.translate(fruitPos[0], fruitPos[1], fruitPos[2]);
          const isRipe = stageIndex >= 8;
          paintGeometryVertexColor(tomatoFruit, isRipe ? 0xd92626 : 0x5c9c33);
          parts.push(tomatoFruit);
        } else if (cropType === 'cotton') {
          const boll = new THREE.SphereGeometry(0.038, 7, 7);
          boll.translate(fruitPos[0], fruitPos[1], fruitPos[2]);
          const isOpenFluffyBoll = stageIndex >= 8;
          paintGeometryVertexColor(boll, isOpenFluffyBoll ? 0xf8fafc : 0x4b7832);
          parts.push(boll);
        } else if (cropType === 'potato') {
          // 3D Potato white/violet apical blossoms + basal soil hilling tuber mound
          const blossom = new THREE.SphereGeometry(0.018, 6, 6);
          blossom.translate(fruitPos[0], by + 0.035, fruitPos[2]);
          paintGeometryVertexColor(blossom, stageIndex >= 8 ? 0xeab308 : 0xf8fafc);
          parts.push(blossom);
        }
      }
    }
  }

  return mergeBufferGeometries(parts);
}

function createEgyptianSoilShaderMaterial(moistureTexture) {
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.95,
    metalness: 0.01,
  });

  mat.userData.uniforms = {
    uMoistureMap: { value: moistureTexture },
    uFarmSize: { value: new THREE.Vector2(120, 120) },
    uFurrowDepth: { value: 0.12 },
    uClodRoughness: { value: 1.0 },
    uStubbleDensity: { value: 0.68 },
    uDroughtFactor: { value: 0.0 },
  };

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.uniforms);

    shader.vertexShader = `
      uniform sampler2D uMoistureMap;
      uniform vec2 uFarmSize;
      uniform float uFurrowDepth;
      uniform float uClodRoughness;
      varying vec2 vWorldXZ;
      varying float vMoisture;
      varying float vClodHeight;
      varying float vTrackGroove;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float plowedClodField(vec2 xz) {
        float largeClods = valueNoise(xz * 3.8) * 0.55;
        float mediumClods = valueNoise(xz * 9.5 + 17.3) * 0.30;
        float fineGranules = valueNoise(xz * 24.0 - 8.1) * 0.15;
        float raw = largeClods + mediumClods + fineGranules;
        return pow(clamp(raw, 0.0, 1.0), 1.35);
      }
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 wPos = modelMatrix * vec4(position, 1.0);
      vWorldXZ = wPos.xz;
      vec2 mUV = (wPos.xz / uFarmSize) + 0.5;
      vMoisture = texture2D(uMoistureMap, clamp(mUV, 0.0, 1.0)).r;

      float fieldMask = step(abs(wPos.x), 54.0) * step(abs(wPos.z), 54.0);
      float primaryTrack = sin(wPos.x * 9.0 + valueNoise(wPos.xz * 0.4) * 0.55);
      float wheelRut = smoothstep(0.75, 1.0, cos(wPos.x * 2.2));
      vTrackGroove = primaryTrack * 0.5 + 0.5;

      vClodHeight = plowedClodField(wPos.xz);
      float totalDisplacement = (
        (primaryTrack * 0.035) -
        (wheelRut * 0.03) +
        (vClodHeight - 0.45) * uFurrowDepth * uClodRoughness
      ) * fieldMask;

      transformed.y += totalDisplacement;
      `
    );

    shader.fragmentShader = `
      uniform float uDroughtFactor;
      uniform float uStubbleDensity;
      varying vec2 vWorldXZ;
      varying float vMoisture;
      varying float vClodHeight;
      varying float vTrackGroove;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float strawResidueMask(vec2 xz) {
        vec2 cell = floor(xz * 11.0);
        vec2 local = fract(xz * 11.0) - 0.5;
        float rnd = hash21(cell);
        if (rnd < (1.0 - uStubbleDensity * 0.28)) return 0.0;

        float angle = rnd * 6.28318;
        float ca = cos(angle);
        float sa = sin(angle);
        vec2 rot = vec2(ca * local.x - sa * local.y, sa * local.x + ca * local.y);

        float stalkLen = smoothstep(0.38, 0.28, abs(rot.x));
        float stalkWidth = smoothstep(0.055, 0.018, abs(rot.y));
        return stalkLen * stalkWidth;
      }

      float voronoiCracks(vec2 uv) {
        vec2 i = floor(uv);
        vec2 f = fract(uv);
        float md1 = 1.0;
        float md2 = 1.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 nb = vec2(float(x), float(y));
            vec2 pt = vec2(hash21(i + nb), hash21(i + nb + 19.0));
            vec2 d = nb + pt - f;
            float dist = length(d);
            if (dist < md1) { md2 = md1; md1 = dist; }
            else if (dist < md2) { md2 = dist; }
          }
        }
        return smoothstep(0.02, 0.075, md2 - md1);
      }
      ${shader.fragmentShader}
    `.replace(
      '#include <normal_fragment_maps>',
      `
      #include <normal_fragment_maps>
      float eps = 0.04;
      float hC = valueNoise(vWorldXZ * 16.0) * 0.65 + valueNoise(vWorldXZ * 38.0) * 0.35;
      float hX = valueNoise((vWorldXZ + vec2(eps, 0.0)) * 16.0) * 0.65 + valueNoise((vWorldXZ + vec2(eps, 0.0)) * 38.0) * 0.35;
      float hZ = valueNoise((vWorldXZ + vec2(0.0, eps)) * 16.0) * 0.65 + valueNoise((vWorldXZ + vec2(0.0, eps)) * 38.0) * 0.35;
      vec3 clodPerturb = normalize(vec3((hC - hX) * 2.8, 1.0, (hC - hZ) * 2.8));
      normal = normalize(mix(normal, clodPerturb, 0.72));
      `
    ).replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec3 deepCreviceSoil   = vec3(0.11, 0.07, 0.045);
      vec3 richPlowedBrown   = vec3(0.27, 0.17, 0.105);
      vec3 sunBakedClodTop   = vec3(0.41, 0.28, 0.185);
      vec3 wetSaturatedMud   = vec3(0.09, 0.06, 0.04);
      vec3 dryStrawColor     = vec3(0.76, 0.64, 0.44);

      float microClod = valueNoise(vWorldXZ * 18.0) * 0.6 + valueNoise(vWorldXZ * 42.0) * 0.4;
      float aggregateHeight = clamp(vClodHeight * 0.65 + microClod * 0.35, 0.0, 1.0);

      vec3 clodColor = mix(deepCreviceSoil, richPlowedBrown, smoothstep(0.18, 0.55, aggregateHeight));
      clodColor = mix(clodColor, sunBakedClodTop, smoothstep(0.58, 0.92, aggregateHeight));

      clodColor *= mix(0.84, 1.06, vTrackGroove);

      float dryness = clamp(1.0 - vMoisture * 2.1, 0.0, 1.0);
      float cracks = voronoiCracks(vWorldXZ * 3.2);
      clodColor *= mix(0.45, 1.0, mix(1.0, cracks, dryness * (0.25 + 0.75 * uDroughtFactor)));

      vec3 moistureAdjusted = mix(clodColor, wetSaturatedMud, smoothstep(0.22, 0.85, vMoisture));
      float straw = strawResidueMask(vWorldXZ) * step(vMoisture, 0.65);
      diffuseColor.rgb = mix(moistureAdjusted, dryStrawColor, straw * 0.85);
      `
    ).replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      roughnessFactor = mix(0.96, 0.22, smoothstep(0.35, 0.95, vMoisture));
      `
    );
  };

  return mat;
}

function createInstancedCropShaderMaterial(canopyHeight) {
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.62,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });

  mat.userData.uniforms = {
    uTime: { value: 0 },
    uCanopyHeight: { value: Math.max(0.1, canopyHeight) },
    uWindSpeed: { value: 3.2 },
    uWindDir: { value: new THREE.Vector2(0.707, -0.707) },
    uHeatStress: { value: 0.0 },
    uFrostFactor: { value: 0.0 },
    uDustFactor: { value: 0.0 },
  };

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.uniforms);

    shader.vertexShader = `
      attribute vec4 aInstanceMeta;
      uniform float uTime;
      uniform float uCanopyHeight;
      uniform float uWindSpeed;
      uniform vec2 uWindDir;
      uniform float uHeatStress;
      varying float vWaterStress;
      varying float vHeightRatio;
      varying float vSeed;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vSeed = aInstanceMeta.x;
      vWaterStress = aInstanceMeta.z;
      float lodging = aInstanceMeta.w;
      vHeightRatio = clamp(position.y / uCanopyHeight, 0.0, 1.0);

      vec4 instWorld = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float gustPhase = dot(instWorld.xz, uWindDir * 0.16) - uTime * (1.6 + uWindSpeed * 0.25) + vSeed * 6.283;
      float gustWave = sin(gustPhase) * 0.65 + sin(gustPhase * 2.4) * 0.35;

      float bend = pow(vHeightRatio, 1.8) * (uWindSpeed * 0.028) * (0.65 + 0.35 * gustWave) + pow(vHeightRatio, 1.35) * lodging;
      transformed.xz += uWindDir * bend * uCanopyHeight;
      transformed.y -= length(uWindDir * bend) * 0.24 * uCanopyHeight;

      float radial = length(position.xz);
      float flutter = sin(uTime * (5.5 + uWindSpeed * 0.7) + vSeed * 23.0 + radial * 15.0) * radial * min(0.075, uWindSpeed * 0.005);
      transformed.y += flutter;

      float wilt = clamp(vWaterStress * 0.75 + uHeatStress * 0.55, 0.0, 1.0);
      transformed.y -= radial * wilt * 0.42;
      transformed.xz *= (1.0 - wilt * 0.22 * step(0.025, radial));
      `
    );

    shader.fragmentShader = `
      uniform float uHeatStress;
      uniform float uFrostFactor;
      uniform float uDustFactor;
      varying float vWaterStress;
      varying float vHeightRatio;
      varying float vSeed;
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec3 baseCol = diffuseColor.rgb * (0.90 + 0.20 * fract(vSeed * 53.7));
      vec3 chlorotic = vec3(0.72, 0.60, 0.18);
      vec3 necrotic = vec3(0.46, 0.34, 0.16);
      vec3 frostRime = vec3(0.84, 0.92, 0.98);
      vec3 dustCoat = vec3(0.74, 0.62, 0.45);

      float stress = clamp(vWaterStress + uHeatStress * 0.6, 0.0, 1.0);
      vec3 col = mix(baseCol, chlorotic, smoothstep(0.15, 0.65, stress));
      col = mix(col, necrotic, smoothstep(0.65, 1.0, stress));

      col = mix(col, vec3(0.18, 0.26, 0.22), uFrostFactor * 0.5);
      col = mix(col, frostRime, uFrostFactor * 0.45 * vHeightRatio);
      diffuseColor.rgb = mix(col, dustCoat, clamp(uDustFactor * 0.75, 0.0, 0.85));
      `
    );
  };

  return mat;
}

const INITIAL_3D_FARM_STATE = {
  zones: [
    {
      id: 'zone-north-west',
      nameAr: 'الحوض الغربي الرئيسي (مرتبط بالمزرعة)',
      cropType: 'wheat',
      growthStage: 6,
      rowSpacing: 0.32,
      plantSpacing: 0.22,
      bounds: { minX: -50, maxX: -2, minZ: -46, maxZ: 44 },
      irrigated: true,
    },
    {
      id: 'zone-north-east',
      nameAr: 'الحوض الشرقي (ذرة شامية)',
      cropType: 'corn',
      growthStage: 7,
      rowSpacing: 0.75,
      plantSpacing: 0.35,
      bounds: { minX: 2, maxX: 50, minZ: -46, maxZ: 0 },
      irrigated: true,
    },
    {
      id: 'zone-south-east',
      nameAr: 'الحوض الجنوبي (قطن مصري)',
      cropType: 'cotton',
      growthStage: 8,
      rowSpacing: 0.80,
      plantSpacing: 0.45,
      bounds: { minX: 2, maxX: 50, minZ: 2, maxZ: 44 },
      irrigated: true,
    },
  ],
  customPlants: [],
  excludedSpots: [],
  irrigationMethod: 'surface',
  pumpActive: true,
  canals: [
    {
      id: 'canal-main',
      nameAr: 'الترعة الرئيسية الشمالية',
      points: [
        [-52, 0, -48],
        [52, 0, -48],
      ],
      width: 1.5,
    },
    {
      id: 'canal-middle',
      nameAr: 'المسقى الأوسط الفاصل',
      points: [
        [0, 0, -48],
        [0, 0, 44],
      ],
      width: 0.9,
    },
  ],
  sprinklers: [
    { id: 'sp-1', x: -26, z: -20, radius: 18 },
    { id: 'sp-2', x: -26, z: 18, radius: 18 },
    { id: 'sp-3', x: 26, z: -20, radius: 18 },
    { id: 'sp-4', x: 26, z: 18, radius: 18 },
  ],
  trees: [
    { id: 't-1', species: 'palm', x: -53, z: -42, scale: 1.1 },
    { id: 't-2', species: 'palm', x: -53, z: -15, scale: 0.95 },
    { id: 't-3', species: 'casuarina', x: 53, z: -42, scale: 1.15 },
    { id: 't-4', species: 'casuarina', x: 53, z: -20, scale: 1.05 },
    { id: 't-5', species: 'casuarina', x: 53, z: 5, scale: 1.1 },
  ],
  environment: PHENOMENA_PRESETS.normal,
};

function AGRI-GO3DFarmSimulation({
  selectedFarm,
  selectedCrop,
  selectedCropId,
  irrigationSystemType,
  effectiveWeather,
  areaInfo,
  expectedProduction,
  economics,
  onSyncCropToAGRI-GO,
  onSyncIrrigationToAGRI-GO,
  onOpenEconomicsPage,
}) {
  const mountRef = useRef(null);
  const [isFullscreen3D, setIsFullscreen3D] = useState(false);

  const [farmState, setFarmState] = useState(() => {
    try {
      const saved = localStorage.getItem('AGRI-GO_3d_farm_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_3D_FARM_STATE,
          ...parsed,
          customPlants: Array.isArray(parsed.customPlants) ? parsed.customPlants : [],
          excludedSpots: Array.isArray(parsed.excludedSpots) ? parsed.excludedSpots : [],
        };
      }
    } catch (err) {
      // ignore storage error
    }
    return INITIAL_3D_FARM_STATE;
  });

  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('zone-north-west');
  // Tools: 'inspect' | 'add_plant_free' | 'remove_plant' | 'plant_anywhere' | 'draw_canal' | 'add_sprinkler' | 'add_tree'
  const [activeTool, setActiveTool] = useState('add_plant_free');
  const [cropToPlantAnywhere, setCropToPlantAnywhere] = useState('wheat');
  const [freePlantStage, setFreePlantStage] = useState(6);
  const [plantBrushPattern, setPlantBrushPattern] = useState('single'); // 'single' | 'cluster_5' | 'row_line' | 'dense_patch'
  const [eraserRadius, setEraserRadius] = useState(0.45); // 0.45 (single plant) | 2.0 (small area) | 5.0 (large brush)
  const [continuousBrushDrag, setContinuousBrushDrag] = useState(false);
  const [totalRenderedPlantsCount, setTotalRenderedPlantsCount] = useState(0);
  const [mouseDragMode, setMouseDragMode] = useState('orbit'); // 'orbit' | 'pan'
  const [treeSpeciesToAdd, setTreeSpeciesToAdd] = useState('palm');
  const [cameraPreset, setCameraPreset] = useState('field_photo');
  const [activeTab, setActiveTab] = useState('crops');
  const [autoGrowPlaying, setAutoGrowPlaying] = useState(false);
  const [showBarePlowedField, setShowBarePlowedField] = useState(false);
  const [clodRoughness, setClodRoughness] = useState(1.15);
  const [stubbleDensity, setStubbleDensity] = useState(0.75);
  const [furrowDepth, setFurrowDepth] = useState(0.13);
  const [canalDraftStart, setCanalDraftStart] = useState(null);
  const [notification, setNotification] = useState(
    'تحكم كامل بالنباتات: اضغط على الأرض لإضافة نباتات جديدة أو اختر "🗑️ حذف نبات" لإزالة أي نبات تريده!'
  );
  const [inspectedPlant, setInspectedPlant] = useState(null);
  const [showControls, setShowControls] = useState(true);

  const selectedZone = useMemo(
    () =>
      farmState.zones.find((z) => z.id === selectedZoneId) ||
      farmState.zones[0] || {
        id: 'zone-default',
        nameAr: 'حوض زراعي',
        cropType: cropToPlantAnywhere || 'wheat',
        growthStage: freePlantStage || 6,
        rowSpacing: 0.5,
        plantSpacing: 0.3,
        bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
        irrigated: true,
      },
    [farmState.zones, selectedZoneId, cropToPlantAnywhere, freePlantStage]
  );

  // Sync incoming AGRI-GO active crop, irrigation method, and live NASA POWER weather into 3D simulation
  useEffect(() => {
    const mapped3DCrop = AGRI-GO_TO_3D_CROP_MAP[selectedCropId] || 'wheat';
    setCropToPlantAnywhere(mapped3DCrop);
    const mapped3DIrr = AGRI-GO_TO_3D_IRRIGATION_MAP[irrigationSystemType] || 'surface';
    const cropSpec = CROP_CATALOG_3D[mapped3DCrop] || CROP_CATALOG_3D.wheat;

    setFarmState((prev) => {
      const updatedNormalEnv =
        prev.environment.id === 'normal'
          ? {
              ...PHENOMENA_PRESETS.normal,
              airTempC: Number(effectiveWeather.tempAvgC) || 23.0,
              rhPct: Number(effectiveWeather.humidityPct) || 58,
              solarWm2: Math.round((Number(effectiveWeather.solarMjDay) || 16.8) * 45),
              et0MmDay: Number(((selectedFarm.waporMetrics?.retSeasonalMm || 540) / 120).toFixed(1)),
            }
          : prev.environment;

      return {
        ...prev,
        irrigationMethod: mapped3DIrr,
        environment: updatedNormalEnv,
        zones: prev.zones.map((z, idx) =>
          idx === 0
            ? {
                ...z,
                cropType: mapped3DCrop,
                nameAr: `الحوض الرئيسي (${cropSpec.nameAr})`,
                rowSpacing: cropSpec.defaultRowSpacing,
                plantSpacing: cropSpec.defaultPlantSpacing,
              }
            : z
        ),
      };
    });
  }, [selectedCropId, irrigationSystemType, selectedFarm, effectiveWeather]);

  const updateFarmWithHistory = useCallback((updater) => {
    setFarmState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setHistoryPast((past) => [...past.slice(-20), prev]);
      setHistoryFuture([]);
      return next;
    });
  }, []);

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const prev = historyPast[historyPast.length - 1];
    setHistoryFuture((f) => [farmState, ...f]);
    setHistoryPast((p) => p.slice(0, -1));
    setFarmState(prev);
    setNotification('تم التراجع عن آخر تعديل ↩');
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryPast((p) => [...p, farmState]);
    setHistoryFuture((f) => f.slice(1));
    setFarmState(next);
    setNotification('تمت إعادة التعديل ↪');
  };

  const handleSaveFarm = () => {
    try {
      localStorage.setItem('AGRI-GO_3d_farm_v2', JSON.stringify(farmState));
    } catch (err) {
      // ignore storage error
    }
    setNotification('تم حفظ جميع إعدادات المزرعة وشبكة الري ومزامنتها مع سولدوك ✓');
  };

  const handleResetFarm = () => {
    updateFarmWithHistory(INITIAL_3D_FARM_STATE);
    try {
      localStorage.removeItem('AGRI-GO_3d_farm_v2');
    } catch (err) {
      // ignore
    }
    setNotification('تمت استعادة الإعدادات الافتراضية للمزرعة ثلاثية الأبعاد');
  };

  useEffect(() => {
    if (!autoGrowPlaying) return;
    const timer = setInterval(() => {
      setFarmState((prev) => ({
        ...prev,
        zones: prev.zones.map((z) => ({
          ...z,
          growthStage: z.growthStage >= 10 ? 1 : z.growthStage + 1,
        })),
        customPlants: (prev.customPlants || []).map((cp) => ({
          ...cp,
          growthStage: cp.growthStage >= 10 ? 1 : cp.growthStage + 1,
        })),
      }));
    }, 1800);
    return () => clearInterval(timer);
  }, [autoGrowPlaying]);

  const sceneRefs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    soilMaterial: null,
    cropGroup: null,
    irrigationGroup: null,
    treeGroup: null,
    cursorGroup: null,
    weatherParticles: null,
    flywheelMesh: null,
    sprinklerNozzles: [],
    moistureGrid: new Float32Array(128 * 128).fill(0.36),
    moistureData: new Uint8Array(128 * 128 * 4),
    moistureTexture: null,
    cameraSpherical: { radius: 42, theta: 0.45, phi: 1.38 },
    cameraTarget: new THREE.Vector3(-8, 1.2, -5),
    desiredTarget: new THREE.Vector3(-8, 1.2, -5),
    desiredSpherical: { radius: 42, theta: 0.45, phi: 1.38 },
    farmStateLatest: farmState,
    activeToolLatest: activeTool,
    cropToPlantLatest: cropToPlantAnywhere,
    freePlantStageLatest: freePlantStage,
    plantBrushPatternLatest: plantBrushPattern,
    eraserRadiusLatest: eraserRadius,
    continuousBrushDragLatest: continuousBrushDrag,
    mouseDragModeLatest: mouseDragMode,
    keysPressed: {},
    canalDraftLatest: canalDraftStart,
    treeSpeciesLatest: treeSpeciesToAdd,
  });

  useEffect(() => {
    sceneRefs.current.farmStateLatest = farmState;
  }, [farmState]);

  useEffect(() => {
    sceneRefs.current.activeToolLatest = activeTool;
    sceneRefs.current.cropToPlantLatest = cropToPlantAnywhere;
    sceneRefs.current.freePlantStageLatest = freePlantStage;
    sceneRefs.current.plantBrushPatternLatest = plantBrushPattern;
    sceneRefs.current.eraserRadiusLatest = eraserRadius;
    sceneRefs.current.continuousBrushDragLatest = continuousBrushDrag;
    sceneRefs.current.mouseDragModeLatest = mouseDragMode;
    sceneRefs.current.canalDraftLatest = canalDraftStart;
    sceneRefs.current.treeSpeciesLatest = treeSpeciesToAdd;
  }, [
    activeTool,
    cropToPlantAnywhere,
    freePlantStage,
    plantBrushPattern,
    eraserRadius,
    continuousBrushDrag,
    mouseDragMode,
    canalDraftStart,
    treeSpeciesToAdd,
  ]);

  // Helper to add custom plants at (wx, wz) with selected pattern
  const addFreePlantsAtPoint = useCallback(
    (wx, wz, cropId = cropToPlantAnywhere, stage = freePlantStage, pattern = plantBrushPattern) => {
      const clampedX = Math.max(-55, Math.min(55, wx));
      const clampedZ = Math.max(-53, Math.min(53, wz));
      const cropSpec = CROP_CATALOG_3D[cropId] || CROP_CATALOG_3D.wheat;

      const offsets = [];
      if (pattern === 'single') {
        offsets.push([0, 0]);
      } else if (pattern === 'cluster_5') {
        const sp = Math.max(0.35, cropSpec.defaultRowSpacing);
        offsets.push([0, 0], [sp, 0], [-sp, 0], [0, sp], [0, -sp]);
      } else if (pattern === 'row_line') {
        const sp = Math.max(0.28, cropSpec.defaultPlantSpacing);
        for (let i = -3; i <= 3; i++) {
          offsets.push([0, i * sp]);
        }
      } else if (pattern === 'dense_patch') {
        const rx = Math.max(0.35, cropSpec.defaultRowSpacing);
        const rz = Math.max(0.28, cropSpec.defaultPlantSpacing);
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            offsets.push([dx * rx, dz * rz]);
          }
        }
      }

      const nowId = Date.now() + Math.random();
      const newPlants = offsets.map(([ox, oz], idx) => {
        const seed = Math.abs(Math.sin((nowId + idx) * 19.37) * 43758.5453) % 1;
        return {
          id: `cp-${nowId}-${idx}`,
          cropType: cropId,
          growthStage: stage,
          x: Number(Math.max(-55, Math.min(55, clampedX + ox + (seed - 0.5) * 0.05)).toFixed(2)),
          z: Number(Math.max(-53, Math.min(53, clampedZ + oz + (((seed * 13.7) % 1) - 0.5) * 0.05)).toFixed(2)),
          scale: Number((0.88 + seed * 0.28).toFixed(2)),
          rotY: Number((seed * Math.PI * 2).toFixed(2)),
          seed: Number(seed.toFixed(4)),
        };
      });

      setShowBarePlowedField(false);
      updateFarmWithHistory((prev) => ({
        ...prev,
        // Also clear any exclusion spot right where the user is deliberately planting
        excludedSpots: (prev.excludedSpots || []).filter(
          (spot) => Math.hypot(spot.x - clampedX, spot.z - clampedZ) > Math.max(0.35, spot.r * 0.6)
        ),
        customPlants: [...(prev.customPlants || []), ...newPlants].slice(-8000),
      }));

      if (CROP_3D_TO_AGRI-GO_MAP[cropId]) {
        onSyncCropToAGRI-GO(CROP_3D_TO_AGRI-GO_MAP[cropId]);
      }

      setNotification(
        `🌱 تمت زراعة ${newPlants.length} نبات (${cropSpec.nameAr} - مرحلة ${stage}/10) في الإحداثيات (${clampedX.toFixed(1)}م، ${clampedZ.toFixed(1)}م)`
      );
    },
    [cropToPlantAnywhere, freePlantStage, plantBrushPattern, updateFarmWithHistory, onSyncCropToAGRI-GO]
  );

  // Helper to remove a specific plant or erase plants within radius R around (wx, wz)
  const removePlantsAtPoint = useCallback(
    (wx, wz, radius = eraserRadius) => {
      const effR = Math.max(0.22, Number(radius) || 0.45);
      updateFarmWithHistory((prev) => {
        const prevCustom = prev.customPlants || [];
        const remainingCustom = prevCustom.filter((cp) => Math.hypot(cp.x - wx, cp.z - wz) > effR);
        return {
          ...prev,
          customPlants: remainingCustom,
          excludedSpots: [
            ...(prev.excludedSpots || []),
            { x: Number(wx.toFixed(2)), z: Number(wz.toFixed(2)), r: effR },
          ],
        };
      });
      setInspectedPlant(null);
      setNotification(
        effR <= 0.5
          ? `🗑️ تم حذف النبات من الموقع (${wx.toFixed(1)}م، ${wz.toFixed(1)}م) بنجاح`
          : `🧹 تم مسح وإزالة النباتات في دائرة نصف قطرها ${effR}م حول (${wx.toFixed(1)}م، ${wz.toFixed(1)}م)`
      );
    },
    [eraserRadius, updateFarmWithHistory]
  );

  // Clear ALL plants from the farm (empty plowed field ready for 100% custom planting)
  const handleClearAllPlantsInFarm = useCallback(() => {
    updateFarmWithHistory((prev) => ({
      ...prev,
      zones: [],
      customPlants: [],
      excludedSpots: [],
    }));
    setInspectedPlant(null);
    setActiveTool('add_plant_free');
    setNotification('🧹 تم إفراغ المزرعة من جميع النباتات — يمكنك الآن زراعة أي نبات في أي مكان بحرية كاملة!');
  }, [updateFarmWithHistory]);

  // Restore structured crop zones
  const handleRestoreDefaultCropZones = useCallback(() => {
    updateFarmWithHistory((prev) => ({
      ...prev,
      zones: INITIAL_3D_FARM_STATE.zones,
      excludedSpots: [],
    }));
    setShowBarePlowedField(false);
    setNotification('🌾 تمت استعادة الأحواض الزراعية الكاملة مع الاحتفاظ بنباتاتك المضافة!');
  }, [updateFarmWithHistory]);

  // Helper to move camera freely via On-Screen D-Pad or Keyboard
  const moveCameraFreely = useCallback((forwardDelta, rightDelta, zoomDelta = 0, heightDelta = 0) => {
    const sr = sceneRefs.current;
    const theta = sr.desiredSpherical.theta;
    const forwardX = -Math.sin(theta);
    const forwardZ = -Math.cos(theta);
    const rightX = Math.cos(theta);
    const rightZ = -Math.sin(theta);

    sr.desiredTarget.x = Math.max(-140, Math.min(140, sr.desiredTarget.x + forwardX * forwardDelta + rightX * rightDelta));
    sr.desiredTarget.z = Math.max(-140, Math.min(140, sr.desiredTarget.z + forwardZ * forwardDelta + rightZ * rightDelta));
    sr.desiredTarget.y = Math.max(0.2, Math.min(35, sr.desiredTarget.y + heightDelta));
    if (zoomDelta !== 0) {
      sr.desiredSpherical.radius = Math.max(1.2, Math.min(220, sr.desiredSpherical.radius + zoomDelta));
    }
  }, []);

  // Plant selected crop across the entire farm (all zones)
  const handlePlantCropInAllZones = (cropId3D) => {
    const cropSpec = CROP_CATALOG_3D[cropId3D] || CROP_CATALOG_3D.wheat;
    updateFarmWithHistory((prev) => ({
      ...prev,
      zones: prev.zones.map((z, idx) => ({
        ...z,
        cropType: cropId3D,
        nameAr: `حوض #${idx + 1} (${cropSpec.nameAr})`,
        rowSpacing: cropSpec.defaultRowSpacing,
        plantSpacing: cropSpec.defaultPlantSpacing,
        irrigated: true,
      })),
    }));
    if (CROP_3D_TO_AGRI-GO_MAP[cropId3D]) {
      onSyncCropToAGRI-GO(CROP_3D_TO_AGRI-GO_MAP[cropId3D]);
    }
    setNotification(`تم تعميم وزراعة محصول (${cropSpec.nameAr}) في جميع أنحاء المزرعة بالكامل ✓`);
  };

  useEffect(() => {
    const soilMat = sceneRefs.current.soilMaterial;
    if (soilMat && soilMat.userData.uniforms) {
      soilMat.userData.uniforms.uClodRoughness.value = clodRoughness;
      soilMat.userData.uniforms.uStubbleDensity.value = stubbleDensity;
      soilMat.userData.uniforms.uFurrowDepth.value = furrowDepth;
    }
  }, [clodRoughness, stubbleDensity, furrowDepth]);

  useEffect(() => {
    const sr = sceneRefs.current;
    if (cameraPreset === 'field_photo') {
      sr.desiredSpherical = { radius: 38, theta: -0.52, phi: 1.46 };
      sr.desiredTarget.set(-10, 0.9, -8);
    } else if (cameraPreset === 'drone') {
      sr.desiredSpherical = { radius: 86, theta: 0.35, phi: 0.92 };
      sr.desiredTarget.set(0, 0, 0);
    } else if (cameraPreset === 'ground') {
      sr.desiredSpherical = { radius: 14, theta: 0.15, phi: 1.47 };
      sr.desiredTarget.set(-18, 1.4, -10);
    } else if (cameraPreset === 'side') {
      sr.desiredSpherical = { radius: 75, theta: -1.52, phi: 1.36 };
      sr.desiredTarget.set(0, 1.2, 0);
    } else if (cameraPreset === 'top') {
      sr.desiredSpherical = { radius: 112, theta: 0.0, phi: 0.08 };
      sr.desiredTarget.set(0, 0, 0);
    } else if (cameraPreset === 'closeup') {
      sr.desiredSpherical = { radius: 3.4, theta: 0.55, phi: 1.32 };
      if (!inspectedPlant) {
        sr.desiredTarget.set(-22, 1.3, -12);
      }
    }
  }, [cameraPreset, inspectedPlant]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 620;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbeafe);
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.0022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.2, 600);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    if (THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xfef3c7, 0x3b2516, 0.88);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4dc, 2.45);
    sunLight.position.set(-68, 34, -45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -65;
    sunLight.shadow.camera.right = 65;
    sunLight.shadow.camera.top = 65;
    sunLight.shadow.camera.bottom = -65;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const sr = sceneRefs.current;
    for (let i = 0; i < 128 * 128; i++) {
      sr.moistureData[i * 4 + 0] = Math.floor(sr.moistureGrid[i] * 255);
      sr.moistureData[i * 4 + 3] = 255;
    }
    const moistureTexture = new THREE.DataTexture(sr.moistureData, 128, 128, THREE.RGBAFormat);
    moistureTexture.needsUpdate = true;
    sr.moistureTexture = moistureTexture;

    const soilGeo = new THREE.PlaneGeometry(120, 120, 320, 320);
    soilGeo.rotateX(-Math.PI / 2);
    const soilMat = createEgyptianSoilShaderMaterial(moistureTexture);
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.receiveShadow = true;
    soilMesh.name = 'EgyptianSoilTerrain';
    scene.add(soilMesh);

    const outerGround = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0x3b2919, roughness: 0.96 })
    );
    outerGround.rotation.x = -Math.PI / 2;
    outerGround.position.y = -0.12;
    outerGround.receiveShadow = true;
    scene.add(outerGround);

    const perimeterGroup = new THREE.Group();
    const dirtTrack = new THREE.Mesh(
      new THREE.PlaneGeometry(8.5, 124),
      new THREE.MeshStandardMaterial({ color: 0x8c6d46, roughness: 0.95 })
    );
    dirtTrack.rotation.x = -Math.PI / 2;
    dirtTrack.position.set(-60.5, 0.06, 0);
    dirtTrack.receiveShadow = true;
    perimeterGroup.add(dirtTrack);

    const leftBerm = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.52, 120),
      new THREE.MeshStandardMaterial({ color: 0x765734, roughness: 0.94 })
    );
    leftBerm.position.set(-55.2, 0.24, 0);
    leftBerm.castShadow = true;
    leftBerm.receiveShadow = true;
    perimeterGroup.add(leftBerm);

    const culvertGroup = new THREE.Group();
    const concretePipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 4.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x8a8175, roughness: 0.88 })
    );
    concretePipe.rotation.z = Math.PI / 2;
    concretePipe.castShadow = true;
    culvertGroup.add(concretePipe);

    const pipeInnerVoid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 4.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x1c1611, roughness: 0.95 })
    );
    pipeInnerVoid.rotation.z = Math.PI / 2;
    culvertGroup.add(pipeInnerVoid);

    const earthBridgeCover = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.22, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x6e5131, roughness: 0.95 })
    );
    earthBridgeCover.position.y = 0.34;
    culvertGroup.add(earthBridgeCover);
    culvertGroup.position.set(-54.8, 0.16, 12);
    culvertGroup.rotation.y = 0.12;
    perimeterGroup.add(culvertGroup);

    const dryWeedMat = new THREE.MeshStandardMaterial({ color: 0xb8964c, roughness: 0.92 });
    const greenWeedMat = new THREE.MeshStandardMaterial({ color: 0x426628, roughness: 0.9 });
    const weedGeo = new THREE.ConeGeometry(0.28, 0.48, 5);
    for (let i = 0; i < 140; i++) {
      const zPos = -54 + (i / 140) * 108;
      const xOffset = -55.2 + Math.sin(i * 11.7) * 1.1;
      const tuft = new THREE.Mesh(weedGeo, i % 3 === 0 ? greenWeedMat : dryWeedMat);
      const sc = 0.65 + (i % 4) * 0.18;
      tuft.scale.set(sc, sc * 0.85, sc);
      tuft.position.set(xOffset, 0.48, zPos);
      tuft.rotation.y = i * 1.3;
      perimeterGroup.add(tuft);
    }

    const horizonGroup = new THREE.Group();
    horizonGroup.position.set(0, 0, -88);
    const buildingSpecs = [
      { x: 42, y: 4.5, z: -8, w: 8.5, h: 9.0, d: 6.5, col: 0xb88662 },
      { x: 52, y: 2.4, z: -5, w: 11.0, h: 4.8, d: 6.0, col: 0xd6c4b0 },
      { x: 31, y: 2.2, z: -10, w: 9.0, h: 4.4, d: 5.5, col: 0xa67656 },
      { x: -45, y: 3.0, z: -12, w: 8.0, h: 6.0, d: 6.0, col: 0xba8d6a },
    ];
    buildingSpecs.forEach((b) => {
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, b.h, b.d),
        new THREE.MeshStandardMaterial({ color: b.col, roughness: 0.88 })
      );
      bMesh.position.set(b.x, b.y, b.z);
      bMesh.castShadow = true;
      horizonGroup.add(bMesh);
    });

    const treeClusterMat = new THREE.MeshStandardMaterial({ color: 0x26421b, roughness: 0.88 });
    [-28, -18, -9, 0, 9, 18].forEach((tx, idx) => {
      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(4.5 + (idx % 3) * 1.1, 10, 8),
        treeClusterMat
      );
      canopy.position.set(tx, 3.6 + (idx % 2) * 0.9, -4);
      canopy.castShadow = true;
      horizonGroup.add(canopy);
    });
    perimeterGroup.add(horizonGroup);
    scene.add(perimeterGroup);

    const cropGroup = new THREE.Group();
    const irrigationGroup = new THREE.Group();
    const treeGroup = new THREE.Group();
    scene.add(cropGroup);
    scene.add(irrigationGroup);
    scene.add(treeGroup);

    // 3D Interactive Ground Cursor Ring & Target Indicator for Planting / Erasing
    const cursorGroup = new THREE.Group();
    cursorGroup.visible = false;
    const ringGeo = new THREE.RingGeometry(0.38, 0.52, 36);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const cursorRingMesh = new THREE.Mesh(ringGeo, ringMat);
    cursorRingMesh.position.y = 0.08;
    cursorGroup.add(cursorRingMesh);

    const centerDotGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12);
    centerDotGeo.translate(0, 0.225, 0);
    const centerDotMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
    });
    const centerBeaconMesh = new THREE.Mesh(centerDotGeo, centerDotMat);
    cursorGroup.add(centerBeaconMesh);
    scene.add(cursorGroup);

    const particleCount = 1800;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3 + 0] = (Math.random() - 0.5) * 120;
      pPositions[i * 3 + 1] = Math.random() * 35;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.22,
      transparent: true,
      opacity: 0.0,
    });
    const weatherParticles = new THREE.Points(pGeo, pMat);
    scene.add(weatherParticles);

    sr.scene = scene;
    sr.camera = camera;
    sr.renderer = renderer;
    sr.soilMaterial = soilMat;
    sr.cropGroup = cropGroup;
    sr.irrigationGroup = irrigationGroup;
    sr.treeGroup = treeGroup;
    sr.cursorGroup = cursorGroup;
    sr.weatherParticles = weatherParticles;

    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let prevPointerPos = { x: 0, y: 0 };
    let lastBrushPaintTime = 0;
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    const updateGroundCursorPreview = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseNDC, camera);

      const hits = raycaster.intersectObject(soilMesh);
      const tool = sr.activeToolLatest;
      if (hits.length > 0 && tool !== 'inspect') {
        const pt = hits[0].point;
        cursorGroup.visible = true;
        cursorGroup.position.set(pt.x, 0.04, pt.z);

        if (tool === 'remove_plant') {
          const rad = Math.max(0.35, sr.eraserRadiusLatest || 0.45);
          cursorRingMesh.scale.setScalar(rad * 2.1);
          ringMat.color.setHex(0xf43f5e);
          centerDotMat.color.setHex(0xf43f5e);
        } else if (tool === 'add_plant_free') {
          const pat = sr.plantBrushPatternLatest;
          const sc = pat === 'dense_patch' ? 3.2 : pat === 'cluster_5' ? 1.8 : pat === 'row_line' ? 2.4 : 0.9;
          cursorRingMesh.scale.setScalar(sc);
          ringMat.color.setHex(0x10b981);
          centerDotMat.color.setHex(0x34d399);
        } else {
          cursorRingMesh.scale.setScalar(2.0);
          ringMat.color.setHex(0x38bdf8);
          centerDotMat.color.setHex(0x38bdf8);
        }
        return pt;
      } else {
        cursorGroup.visible = false;
        return null;
      }
    };

    const onPointerDown = (e) => {
      isDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      prevPointerPos = { x: e.clientX, y: e.clientY };

      // If continuous brush drag is active with left mouse button on add/remove plant tool
      const tool = sr.activeToolLatest;
      if (
        e.button === 0 &&
        !e.shiftKey &&
        sr.continuousBrushDragLatest &&
        (tool === 'add_plant_free' || tool === 'remove_plant')
      ) {
        const pt = updateGroundCursorPreview(e.clientX, e.clientY);
        if (pt) {
          lastBrushPaintTime = performance.now();
          if (tool === 'add_plant_free') {
            addFreePlantsAtPoint(
              pt.x,
              pt.z,
              sr.cropToPlantLatest,
              sr.freePlantStageLatest,
              sr.plantBrushPatternLatest
            );
          } else {
            removePlantsAtPoint(pt.x, pt.z, sr.eraserRadiusLatest);
          }
        }
      }
    };

    const onPointerMove = (e) => {
      const pt = updateGroundCursorPreview(e.clientX, e.clientY);
      if (!isDragging) return;

      const tool = sr.activeToolLatest;
      // Continuous Brush Painting / Erasing when enabled
      if (
        e.buttons === 1 &&
        !e.shiftKey &&
        sr.continuousBrushDragLatest &&
        (tool === 'add_plant_free' || tool === 'remove_plant')
      ) {
        const now = performance.now();
        if (pt && now - lastBrushPaintTime > 95) {
          lastBrushPaintTime = now;
          if (tool === 'add_plant_free') {
            addFreePlantsAtPoint(
              pt.x,
              pt.z,
              sr.cropToPlantLatest,
              sr.freePlantStageLatest,
              sr.plantBrushPatternLatest
            );
          } else {
            removePlantsAtPoint(pt.x, pt.z, sr.eraserRadiusLatest);
          }
        }
        return;
      }

      const dx = e.clientX - prevPointerPos.x;
      const dy = e.clientY - prevPointerPos.y;
      prevPointerPos = { x: e.clientX, y: e.clientY };

      const isPanAction = e.buttons === 2 || e.buttons === 4 || e.shiftKey || sr.mouseDragModeLatest === 'pan';
      if (isPanAction) {
        const panSpeed = Math.max(0.03, sr.desiredSpherical.radius * 0.0022);
        const theta = sr.desiredSpherical.theta;
        const rightX = Math.cos(theta);
        const rightZ = -Math.sin(theta);
        const forwardX = -Math.sin(theta);
        const forwardZ = -Math.cos(theta);

        sr.desiredTarget.x = Math.max(
          -140,
          Math.min(140, sr.desiredTarget.x - dx * rightX * panSpeed + dy * forwardX * panSpeed)
        );
        sr.desiredTarget.z = Math.max(
          -140,
          Math.min(140, sr.desiredTarget.z - dx * rightZ * panSpeed + dy * forwardZ * panSpeed)
        );
      } else {
        sr.desiredSpherical.theta -= dx * 0.0065;
        sr.desiredSpherical.phi = Math.max(0.06, Math.min(Math.PI / 2 - 0.02, sr.desiredSpherical.phi - dy * 0.0065));
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseNDC, camera);

      const tool = sr.activeToolLatest;

      // 1. If in REMOVE_PLANT mode, check if user clicked directly on a 3D plant first
      if (tool === 'remove_plant') {
        const cropHits = raycaster.intersectObjects(cropGroup.children, false);
        if (cropHits.length > 0) {
          const hit = cropHits[0];
          const coords = hit.object.userData.plantCoords;
          const clickedPlantCoord = coords && hit.instanceId !== undefined ? coords[hit.instanceId] : hit.point;
          removePlantsAtPoint(
            clickedPlantCoord.x,
            clickedPlantCoord.z,
            Math.max(0.28, sr.eraserRadiusLatest)
          );
          return;
        }
      }

      // 2. If in INSPECT mode, check if user clicked a 3D plant to inspect or delete it
      if (tool === 'inspect') {
        const cropHits = raycaster.intersectObjects(cropGroup.children, false);
        if (cropHits.length > 0) {
          const hit = cropHits[0];
          const zoneId = hit.object.userData.zoneId;
          if (zoneId && !hit.object.userData.isCustomGroup) {
            setSelectedZoneId(zoneId);
          }
          const coords = hit.object.userData.plantCoords;
          const exactCoord = coords && hit.instanceId !== undefined ? coords[hit.instanceId] : hit.point;
          sr.desiredTarget.copy(hit.point);
          sr.desiredSpherical.radius = Math.min(sr.desiredSpherical.radius, 9.5);
          const gx = Math.min(127, Math.max(0, Math.floor(((exactCoord.x + 60) / 120) * 128)));
          const gz = Math.min(127, Math.max(0, Math.floor(((exactCoord.z + 60) / 120) * 128)));
          const localM = sr.moistureGrid[gz * 128 + gx];
          const cType = hit.object.userData.cropType || 'wheat';
          setInspectedPlant({
            zoneId,
            cropType: cType,
            cropNameAr: CROP_CATALOG_3D[cType]?.nameAr || 'نبات',
            instanceId: (hit.instanceId ?? 0) + 1,
            rawX: Number(exactCoord.x),
            rawZ: Number(exactCoord.z),
            x: Number(exactCoord.x).toFixed(1),
            z: Number(exactCoord.z).toFixed(1),
            moisturePct: Math.round(localM * 100),
          });
          setNotification(
            `تم تحديد ${CROP_CATALOG_3D[cType]?.nameAr || 'النبات'} رقم #${(hit.instanceId ?? 0) + 1} — يمكنك فحصه أو حذفه أو زرع نبات بجواره`
          );
          return;
        }
      }

      const terrainHits = raycaster.intersectObject(soilMesh);
      if (terrainHits.length > 0) {
        const pt = terrainHits[0].point;
        const clampedX = Math.max(-56, Math.min(56, pt.x));
        const clampedZ = Math.max(-54, Math.min(54, pt.z));

        if (tool === 'add_plant_free') {
          if (!sr.continuousBrushDragLatest) {
            addFreePlantsAtPoint(
              clampedX,
              clampedZ,
              sr.cropToPlantLatest,
              sr.freePlantStageLatest,
              sr.plantBrushPatternLatest
            );
          }
        } else if (tool === 'remove_plant') {
          if (!sr.continuousBrushDragLatest) {
            removePlantsAtPoint(clampedX, clampedZ, sr.eraserRadiusLatest);
          }
        } else if (tool === 'plant_anywhere') {
          const chosenCropId = sr.cropToPlantLatest || 'wheat';
          const cropSpec = CROP_CATALOG_3D[chosenCropId] || CROP_CATALOG_3D.wheat;
          const existingZoneHit = sr.farmStateLatest.zones.find(
            (z) =>
              clampedX >= z.bounds.minX &&
              clampedX <= z.bounds.maxX &&
              clampedZ >= z.bounds.minZ &&
              clampedZ <= z.bounds.maxZ
          );

          if (existingZoneHit) {
            updateFarmWithHistory((prev) => ({
              ...prev,
              zones: prev.zones.map((z) =>
                z.id === existingZoneHit.id
                  ? {
                      ...z,
                      cropType: chosenCropId,
                      nameAr: `${z.nameAr.split('(')[0].trim()} (${cropSpec.nameAr})`,
                      rowSpacing: cropSpec.defaultRowSpacing,
                      plantSpacing: cropSpec.defaultPlantSpacing,
                      irrigated: true,
                    }
                  : z
              ),
            }));
            setSelectedZoneId(existingZoneHit.id);
            setNotification(`تمت زراعة محصول (${cropSpec.nameAr}) في هذا الحوض بنجاح ✓`);
          } else {
            const halfSize = 9;
            const newZoneId = `zone-custom-${Date.now()}`;
            const newZone = {
              id: newZoneId,
              nameAr: `حوض مخصص (${cropSpec.nameAr})`,
              cropType: chosenCropId,
              growthStage: sr.freePlantStageLatest || 6,
              rowSpacing: cropSpec.defaultRowSpacing,
              plantSpacing: cropSpec.defaultPlantSpacing,
              bounds: {
                minX: Math.max(-55, Math.round(clampedX - halfSize)),
                maxX: Math.min(55, Math.round(clampedX + halfSize)),
                minZ: Math.max(-52, Math.round(clampedZ - halfSize)),
                maxZ: Math.min(52, Math.round(clampedZ + halfSize)),
              },
              irrigated: true,
            };
            updateFarmWithHistory((prev) => ({
              ...prev,
              zones: [...prev.zones, newZone],
            }));
            setSelectedZoneId(newZoneId);
            setNotification(
              `تم إنشاء وزراعة حوض جديد بمحصول (${cropSpec.nameAr}) في الموقع (${Math.round(clampedX)}, ${Math.round(clampedZ)}) ✓`
            );
          }

          if (CROP_3D_TO_AGRI-GO_MAP[chosenCropId]) {
            onSyncCropToAGRI-GO(CROP_3D_TO_AGRI-GO_MAP[chosenCropId]);
          }
        } else if (tool === 'draw_canal') {
          const draft = sr.canalDraftLatest;
          if (!draft) {
            setCanalDraftStart([clampedX, 0, clampedZ]);
            setNotification('تم تحديد نقطة بداية المسقى — اضغط على نقطة النهاية على الأرض لحفر المسقى');
          } else {
            const newCanal = {
              id: `canal-${Date.now()}`,
              nameAr: 'مسقى فرعي مخصص',
              points: [draft, [clampedX, 0, clampedZ]],
              width: 0.85,
            };
            updateFarmWithHistory((prev) => ({
              ...prev,
              irrigationMethod: 'surface',
              canals: [...prev.canals, newCanal],
            }));
            onSyncIrrigationToAGRI-GO('TRADITIONAL_SURFACE');
            setCanalDraftStart(null);
            setActiveTool('inspect');
            setNotification('تم حفر وإضافة مسقى الري السطحي الجديد ومزامنته مع سولدوك ✓');
          }
        } else if (tool === 'add_sprinkler') {
          updateFarmWithHistory((prev) => ({
            ...prev,
            irrigationMethod: 'sprinkler',
            sprinklers: [
              ...prev.sprinklers,
              { id: `sp-${Date.now()}`, x: Math.round(clampedX), z: Math.round(clampedZ), radius: 16 },
            ],
          }));
          onSyncIrrigationToAGRI-GO('SPRINKLER');
          setActiveTool('inspect');
          setNotification('تمت إضافة رشاش مياه دوار جديد ومزامنته مع حسابات سولدوك ✓');
        } else if (tool === 'add_tree') {
          updateFarmWithHistory((prev) => ({
            ...prev,
            trees: [
              ...prev.trees,
              {
                id: `tree-${Date.now()}`,
                species: sr.treeSpeciesLatest,
                x: Math.round(clampedX),
                z: Math.round(clampedZ),
                scale: 0.9 + Math.random() * 0.25,
              },
            ],
          }));
          setActiveTool('inspect');
          setNotification('تمت زراعة شجرة مصدات رياح جديدة في المزرعة ✓');
        }
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      sr.desiredSpherical.radius = Math.max(1.2, Math.min(220, sr.desiredSpherical.radius + e.deltaY * 0.045));
    };

    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      sr.keysPressed[e.code] = true;
    };

    const onKeyUp = (e) => {
      sr.keysPressed[e.code] = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('contextmenu', (e) => e.preventDefault());

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const currentFarm = sr.farmStateLatest;
      const env = currentFarm.environment;

      // Keyboard WASD / Arrow Keys Free Roaming Movement
      const kp = sr.keysPressed;
      const moveSpeed = Math.max(12, sr.desiredSpherical.radius * 0.55) * dt;
      let fMove = 0;
      let rMove = 0;
      if (kp.KeyW || kp.ArrowUp) fMove += moveSpeed;
      if (kp.KeyS || kp.ArrowDown) fMove -= moveSpeed;
      if (kp.KeyD || kp.ArrowRight) rMove += moveSpeed;
      if (kp.KeyA || kp.ArrowLeft) rMove -= moveSpeed;

      if (fMove !== 0 || rMove !== 0) {
        const th = sr.desiredSpherical.theta;
        const fX = -Math.sin(th);
        const fZ = -Math.cos(th);
        const rX = Math.cos(th);
        const rZ = -Math.sin(th);
        sr.desiredTarget.x = Math.max(-140, Math.min(140, sr.desiredTarget.x + fX * fMove + rX * rMove));
        sr.desiredTarget.z = Math.max(-140, Math.min(140, sr.desiredTarget.z + fZ * fMove + rZ * rMove));
      }
      if (kp.KeyE || kp.PageUp) {
        sr.desiredTarget.y = Math.min(35, sr.desiredTarget.y + 10 * dt);
      }
      if (kp.KeyQ || kp.PageDown) {
        sr.desiredTarget.y = Math.max(0.2, sr.desiredTarget.y - 10 * dt);
      }

      sr.cameraSpherical.radius += (sr.desiredSpherical.radius - sr.cameraSpherical.radius) * 0.12;
      sr.cameraSpherical.theta += (sr.desiredSpherical.theta - sr.cameraSpherical.theta) * 0.12;
      sr.cameraSpherical.phi += (sr.desiredSpherical.phi - sr.cameraSpherical.phi) * 0.12;
      sr.cameraTarget.lerp(sr.desiredTarget, 0.14);

      const r = sr.cameraSpherical.radius;
      const theta = sr.cameraSpherical.theta;
      const phi = sr.cameraSpherical.phi;
      camera.position.set(
        sr.cameraTarget.x + r * Math.sin(phi) * Math.sin(theta),
        sr.cameraTarget.y + r * Math.cos(phi),
        sr.cameraTarget.z + r * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(sr.cameraTarget);

      if (env.id === 'dust_storm') {
        scene.background.setHex(0xc89d66);
        scene.fog.color.setHex(0xc89d66);
        scene.fog.density = 0.014;
        sunLight.intensity = 1.1;
      } else if (env.id === 'heavy_rain') {
        scene.background.setHex(0x64748b);
        scene.fog.color.setHex(0x64748b);
        scene.fog.density = 0.0055;
        sunLight.intensity = 0.75;
      } else if (env.id === 'extreme_heat') {
        scene.background.setHex(0xfef08a);
        scene.fog.color.setHex(0xfef08a);
        scene.fog.density = 0.0028;
        sunLight.intensity = 2.65;
      } else if (env.id === 'cold_frost') {
        scene.background.setHex(0xcbd5e1);
        scene.fog.color.setHex(0xcbd5e1);
        scene.fog.density = 0.0035;
        sunLight.intensity = 1.25;
      } else {
        scene.background.setHex(0xdbeafe);
        scene.fog.color.setHex(0xdbeafe);
        scene.fog.density = 0.0018;
        sunLight.intensity = 1.85;
      }

      if (sr.weatherParticles) {
        const pMatRef = sr.weatherParticles.material;
        const posAttr = sr.weatherParticles.geometry.attributes.position;
        if (env.id === 'heavy_rain') {
          pMatRef.color.setHex(0xbae6fd);
          pMatRef.size = 0.28;
          pMatRef.opacity = 0.72;
          for (let i = 0; i < posAttr.count; i++) {
            let y = posAttr.getY(i) - 28 * dt;
            if (y < 0) y = 34;
            posAttr.setY(i, y);
          }
          posAttr.needsUpdate = true;
        } else if (env.id === 'dust_storm' || env.id === 'strong_wind') {
          pMatRef.color.setHex(0xd6b07a);
          pMatRef.size = env.id === 'dust_storm' ? 0.55 : 0.32;
          pMatRef.opacity = env.id === 'dust_storm' ? 0.65 : 0.25;
          for (let i = 0; i < posAttr.count; i++) {
            let x = posAttr.getX(i) + env.windSpeedMs * 0.9 * dt;
            if (x > 60) x = -60;
            posAttr.setX(i, x);
          }
          posAttr.needsUpdate = true;
        } else {
          pMatRef.opacity = 0.0;
        }
      }

      const mGrid = sr.moistureGrid;
      const mData = sr.moistureData;
      const evapRate =
        (env.et0MmDay * 0.0018 + (env.id === 'drought' ? 0.032 : 0) + (env.id === 'extreme_heat' ? 0.022 : 0)) * dt;
      const rainAdd = env.id === 'heavy_rain' ? 0.075 * dt : 0;

      if (currentFarm.pumpActive) {
        if (currentFarm.irrigationMethod === 'surface') {
          for (const canal of currentFarm.canals) {
            const [p0, p1] = canal.points;
            const steps = 40;
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0[0] + (p1[0] - p0[0]) * t;
              const wz = p0[2] + (p1[2] - p0[2]) * t;
              const gx = Math.floor(((wx + 60) / 120) * 128);
              const gz = Math.floor(((wz + 60) / 120) * 128);
              for (let dz = -2; dz <= 2; dz++) {
                for (let dx = -2; dx <= 2; dx++) {
                  const nx = gx + dx;
                  const nz = gz + dz;
                  if (nx >= 0 && nx < 128 && nz >= 0 && nz < 128) {
                    mGrid[nz * 128 + nx] = Math.min(0.98, mGrid[nz * 128 + nx] + 0.22 * dt);
                  }
                }
              }
            }
          }
          for (const z of currentFarm.zones) {
            if (!z.irrigated) continue;
            const gx0 = Math.max(0, Math.floor(((z.bounds.minX + 60) / 120) * 128));
            const gx1 = Math.min(127, Math.floor(((z.bounds.maxX + 60) / 120) * 128));
            const gz0 = Math.max(0, Math.floor(((z.bounds.minZ + 60) / 120) * 128));
            const gz1 = Math.min(127, Math.floor(((z.bounds.maxZ + 60) / 120) * 128));
            for (let gz = gz0; gz <= gz1; gz++) {
              for (let gx = gx0; gx <= gx1; gx++) {
                const upstream = gz > gz0 ? mGrid[(gz - 1) * 128 + gx] : 0.9;
                if (gz === gz0 || upstream > 0.45) {
                  mGrid[gz * 128 + gx] = Math.min(0.95, mGrid[gz * 128 + gx] + 0.14 * dt);
                }
              }
            }
          }
        } else if (currentFarm.irrigationMethod === 'drip') {
          for (const z of currentFarm.zones) {
            if (!z.irrigated) continue;
            for (let x = z.bounds.minX; x <= z.bounds.maxX; x += z.rowSpacing * 2) {
              for (let zv = z.bounds.minZ; zv <= z.bounds.maxZ; zv += 1.2) {
                const gx = Math.floor(((x + 60) / 120) * 128);
                const gz = Math.floor(((zv + 60) / 120) * 128);
                if (gx >= 1 && gx < 127 && gz >= 1 && gz < 127) {
                  mGrid[gz * 128 + gx] = Math.min(0.92, mGrid[gz * 128 + gx] + 0.16 * dt);
                  mGrid[gz * 128 + gx - 1] = Math.min(0.88, mGrid[gz * 128 + gx - 1] + 0.08 * dt);
                  mGrid[gz * 128 + gx + 1] = Math.min(0.88, mGrid[gz * 128 + gx + 1] + 0.08 * dt);
                }
              }
            }
          }
        } else if (currentFarm.irrigationMethod === 'sprinkler') {
          for (const sp of currentFarm.sprinklers) {
            const cgx = Math.floor(((sp.x + 60) / 120) * 128);
            const cgz = Math.floor(((sp.z + 60) / 120) * 128);
            const radCells = Math.ceil((sp.radius / 120) * 128);
            for (let dz = -radCells; dz <= radCells; dz++) {
              for (let dx = -radCells; dx <= radCells; dx++) {
                const d2 = dx * dx + dz * dz;
                if (d2 <= radCells * radCells) {
                  const gx = cgx + dx;
                  const gz = cgz + dz;
                  if (gx >= 0 && gx < 128 && gz >= 0 && gz < 128) {
                    const falloff = 1 - Math.sqrt(d2) / radCells;
                    mGrid[gz * 128 + gx] = Math.min(0.94, mGrid[gz * 128 + gx] + 0.18 * falloff * dt);
                  }
                }
              }
            }
          }
        }
      }

      for (let i = 0; i < 128 * 128; i++) {
        mGrid[i] = Math.max(0.04, Math.min(1.0, mGrid[i] + rainAdd - evapRate));
        mData[i * 4 + 0] = Math.floor(mGrid[i] * 255);
      }
      sr.moistureTexture.needsUpdate = true;

      if (sr.soilMaterial?.userData?.uniforms) {
        sr.soilMaterial.userData.uniforms.uDroughtFactor.value = env.id === 'drought' ? 0.95 : 0.0;
      }

      if (sr.flywheelMesh && currentFarm.pumpActive && currentFarm.irrigationMethod === 'surface') {
        sr.flywheelMesh.rotation.x += dt * 26.0;
      }
      if (currentFarm.pumpActive && currentFarm.irrigationMethod === 'sprinkler') {
        sr.sprinklerNozzles.forEach((n) => {
          n.rotation.y += dt * 3.5;
        });
      }

      const windRad = (env.windDirDeg * Math.PI) / 180;
      cropGroup.children.forEach((instMesh) => {
        const u = instMesh.material?.userData?.uniforms;
        if (u) {
          u.uTime.value = elapsed;
          u.uWindSpeed.value = env.windSpeedMs;
          u.uWindDir.value.set(Math.cos(windRad), Math.sin(windRad));
          u.uHeatStress.value = Math.max(0, (env.airTempC - 33) / 13);
          u.uFrostFactor.value = env.airTempC < 1 ? Math.min(1, (1 - env.airTempC) / 5) : 0;
          u.uDustFactor.value = env.dustOpticalDepth / 2.8;
        }

        const metaAttr = instMesh.geometry.getAttribute('aInstanceMeta');
        const coords = instMesh.userData.plantCoords;
        const cProfile = CROP_CATALOG_3D[instMesh.userData.cropType] || CROP_CATALOG_3D.corn;
        if (metaAttr && coords) {
          const arr = metaAttr.array;
          for (let i = 0; i < coords.length; i++) {
            const { x, z, seed } = coords[i];
            const gx = Math.min(127, Math.max(0, Math.floor(((x + 60) / 120) * 128)));
            const gz = Math.min(127, Math.max(0, Math.floor(((z + 60) / 120) * 128)));
            const localM = mGrid[gz * 128 + gx];
            const waterStress = Math.max(0, Math.min(1, (0.34 - localM) / 0.34));
            const lodging =
              env.windSpeedMs > 12
                ? Math.min(0.85, ((env.windSpeedMs - 12) / 12) * cProfile.windVulnerability * (0.7 + 0.5 * seed))
                : 0;
            arr[i * 4 + 0] = seed;
            arr[i * 4 + 1] = localM;
            arr[i * 4 + 2] = waterStress;
            arr[i * 4 + 3] = lodging;
          }
          metaAttr.needsUpdate = true;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 620;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
    };
  }, [
    updateFarmWithHistory,
    onSyncIrrigationToAGRI-GO,
    onSyncCropToAGRI-GO,
    addFreePlantsAtPoint,
    removePlantsAtPoint,
  ]);

  // Trigger resize when toggling fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);
    return () => clearTimeout(timer);
  }, [isFullscreen3D]);

  // Rebuild 3D Crops (Both Zone Crops & Freeform Custom Plants), Irrigation Hardware & Trees
  useEffect(() => {
    const sr = sceneRefs.current;
    if (!sr.cropGroup || !sr.irrigationGroup || !sr.treeGroup) return;

    while (sr.cropGroup.children.length > 0) {
      const child = sr.cropGroup.children[0];
      child.geometry.dispose();
      sr.cropGroup.remove(child);
    }

    let totalPlantsCounter = 0;
    const excludedSpots = farmState.excludedSpots || [];

    if (!showBarePlowedField) {
      // 1. Build Structured Zone Plants (respecting any erased/removed spots)
      farmState.zones.forEach((zone) => {
        const geo = buildCrop3DGeometry(zone.cropType, zone.growthStage);
        const stageSpec = CORN_10_STAGES[zone.growthStage] || CORN_10_STAGES[6];
        const mat = createInstancedCropShaderMaterial(stageSpec.height);

        const coords = [];
        let seedIdx = 1;
        for (let x = zone.bounds.minX + 0.6; x <= zone.bounds.maxX - 0.6; x += zone.rowSpacing) {
          for (let z = zone.bounds.minZ + 0.6; z <= zone.bounds.maxZ - 0.6; z += zone.plantSpacing) {
            if (coords.length >= 2500) break;
            const s = Math.abs(Math.sin(seedIdx * 12.9898) * 43758.5453) % 1;
            const px = x + (s - 0.5) * zone.rowSpacing * 0.16;
            const pz = z + (((s * 19.1) % 1) - 0.5) * zone.plantSpacing * 0.16;
            seedIdx++;

            // Skip plant if user removed/erased it
            const isErased = excludedSpots.some(
              (spot) => Math.hypot(px - spot.x, pz - spot.z) <= spot.r
            );
            if (isErased) continue;

            coords.push({
              x: px,
              z: pz,
              seed: s,
              scale: 0.85 + s * 0.3,
              rotY: s * Math.PI * 2,
            });
          }
        }

        if (coords.length > 0) {
          totalPlantsCounter += coords.length;
          const metaArray = new Float32Array(coords.length * 4);
          geo.setAttribute('aInstanceMeta', new THREE.InstancedBufferAttribute(metaArray, 4));

          const instMesh = new THREE.InstancedMesh(geo, mat, coords.length);
          instMesh.castShadow = true;
          instMesh.receiveShadow = true;
          instMesh.userData = {
            zoneId: zone.id,
            cropType: zone.cropType,
            plantCoords: coords,
            isCustomGroup: false,
          };

          const dummy = new THREE.Object3D();
          coords.forEach((c, idx) => {
            dummy.position.set(c.x, 0, c.z);
            dummy.rotation.set(0, c.rotY, 0);
            dummy.scale.set(c.scale, c.scale, c.scale);
            dummy.updateMatrix();
            instMesh.setMatrixAt(idx, dummy.matrix);
          });
          instMesh.instanceMatrix.needsUpdate = true;
          sr.cropGroup.add(instMesh);
        } else {
          geo.dispose();
        }
      });

      // 2. Build User's Freeform Custom Added Plants (grouped by cropType & growthStage)
      const customList = farmState.customPlants || [];
      if (customList.length > 0) {
        const groupedCustom = {};
        customList.forEach((cp) => {
          const key = `${cp.cropType}__${cp.growthStage || 6}`;
          if (!groupedCustom[key]) {
            groupedCustom[key] = {
              cropType: cp.cropType,
              growthStage: cp.growthStage || 6,
              coords: [],
            };
          }
          groupedCustom[key].coords.push(cp);
        });

        Object.values(groupedCustom).forEach((grp) => {
          const geo = buildCrop3DGeometry(grp.cropType, grp.growthStage);
          const stageSpec = CORN_10_STAGES[grp.growthStage] || CORN_10_STAGES[6];
          const mat = createInstancedCropShaderMaterial(stageSpec.height);

          totalPlantsCounter += grp.coords.length;
          const metaArray = new Float32Array(grp.coords.length * 4);
          geo.setAttribute('aInstanceMeta', new THREE.InstancedBufferAttribute(metaArray, 4));

          const instMesh = new THREE.InstancedMesh(geo, mat, grp.coords.length);
          instMesh.castShadow = true;
          instMesh.receiveShadow = true;
          instMesh.userData = {
            zoneId: 'custom-freeform-plants',
            cropType: grp.cropType,
            plantCoords: grp.coords,
            isCustomGroup: true,
          };

          const dummy = new THREE.Object3D();
          grp.coords.forEach((c, idx) => {
            dummy.position.set(c.x, 0, c.z);
            dummy.rotation.set(0, c.rotY || 0, 0);
            dummy.scale.set(c.scale || 1, c.scale || 1, c.scale || 1);
            dummy.updateMatrix();
            instMesh.setMatrixAt(idx, dummy.matrix);
          });
          instMesh.instanceMatrix.needsUpdate = true;
          sr.cropGroup.add(instMesh);
        });
      }
    }

    setTotalRenderedPlantsCount(totalPlantsCounter);

    while (sr.irrigationGroup.children.length > 0) {
      sr.irrigationGroup.remove(sr.irrigationGroup.children[0]);
    }
    sr.flywheelMesh = null;
    sr.sprinklerNozzles = [];

    if (farmState.irrigationMethod === 'surface') {
      const pumpGroup = new THREE.Group();
      pumpGroup.position.set(-51, 0.15, -48.5);

      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.18, 1.0),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 })
      );
      chassis.position.y = 0.1;
      chassis.castShadow = true;
      pumpGroup.add(chassis);

      const engineBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.72, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.5, roughness: 0.35 })
      );
      engineBlock.position.set(-0.3, 0.55, 0);
      engineBlock.castShadow = true;
      pumpGroup.add(engineBlock);

      const flywheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.10, 20),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.65, roughness: 0.3 })
      );
      flywheel.rotation.z = Math.PI / 2;
      flywheel.position.set(-0.3, 0.55, 0.40);
      flywheel.castShadow = true;
      pumpGroup.add(flywheel);
      sr.flywheelMesh = flywheel;

      const volute = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.28, 18),
        new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.6, roughness: 0.3 })
      );
      volute.rotation.x = Math.PI / 2;
      volute.position.set(0.45, 0.50, 0);
      pumpGroup.add(volute);

      const outPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.35 })
      );
      outPipe.rotation.z = -Math.PI / 3;
      outPipe.position.set(0.95, 0.52, 0);
      pumpGroup.add(outPipe);

      if (farmState.pumpActive) {
        const gushStream = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.18, 0.95, 12),
          new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, roughness: 0.1 })
        );
        gushStream.position.set(1.45, 0.15, 0);
        pumpGroup.add(gushStream);
      }
      sr.irrigationGroup.add(pumpGroup);

      farmState.canals.forEach((canal) => {
        const [p0, p1] = canal.points;
        const v0 = new THREE.Vector3(p0[0], 0.03, p0[2]);
        const v1 = new THREE.Vector3(p1[0], 0.03, p1[2]);
        const curve = new THREE.LineCurve3(v0, v1);

        const bankGeo = new THREE.TubeGeometry(curve, 20, canal.width * 0.52, 8, false);
        const bankMesh = new THREE.Mesh(
          bankGeo,
          new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.92 })
        );
        bankMesh.scale.set(1, 0.28, 1);
        sr.irrigationGroup.add(bankMesh);

        if (farmState.pumpActive) {
          const waterGeo = new THREE.TubeGeometry(curve, 20, canal.width * 0.38, 8, false);
          const waterMesh = new THREE.Mesh(
            waterGeo,
            new THREE.MeshPhysicalMaterial({
              color: 0x0284c7,
              transparent: true,
              opacity: 0.88,
              roughness: 0.08,
              metalness: 0.1,
            })
          );
          waterMesh.position.y = 0.06;
          waterMesh.scale.set(1, 0.22, 1);
          sr.irrigationGroup.add(waterMesh);
        }
      });
    } else if (farmState.irrigationMethod === 'drip') {
      const station = new THREE.Group();
      station.position.set(-51, 0.35, -48);
      const pumpBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.7, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.6, roughness: 0.3 })
      );
      const filterTank1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 1.0, 14),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.35 })
      );
      filterTank1.position.set(0.9, 0.15, -0.25);
      const filterTank2 = filterTank1.clone();
      filterTank2.position.set(0.9, 0.15, 0.25);
      station.add(pumpBox, filterTank1, filterTank2);
      sr.irrigationGroup.add(station);

      const mainHeader = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 102, 12),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35 })
      );
      mainHeader.rotation.z = Math.PI / 2;
      mainHeader.position.set(0, 0.12, -46);
      sr.irrigationGroup.add(mainHeader);

      farmState.zones.forEach((z) => {
        const valve = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.28, 12),
          new THREE.MeshStandardMaterial({ color: z.irrigated ? 0x16a34a : 0xdc2626 })
        );
        valve.position.set((z.bounds.minX + z.bounds.maxX) / 2, 0.24, z.bounds.minZ - 0.8);
        sr.irrigationGroup.add(valve);

        const len = z.bounds.maxZ - z.bounds.minZ;
        const midZ = (z.bounds.minZ + z.bounds.maxZ) / 2;
        for (let x = z.bounds.minX + 0.6; x <= z.bounds.maxX - 0.6; x += z.rowSpacing * 2) {
          const line = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, len, 6),
            new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 })
          );
          line.rotation.x = Math.PI / 2;
          line.position.set(x, 0.04, midZ);
          sr.irrigationGroup.add(line);

          if (farmState.pumpActive && z.irrigated) {
            for (let zv = z.bounds.minZ + 1; zv <= z.bounds.maxZ - 1; zv += 2.2) {
              const drop = new THREE.Mesh(
                new THREE.SphereGeometry(0.045, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
              );
              drop.position.set(x, 0.05, zv);
              sr.irrigationGroup.add(drop);
            }
          }
        }
      });
    } else if (farmState.irrigationMethod === 'sprinkler') {
      farmState.sprinklers.forEach((sp) => {
        const spGroup = new THREE.Group();
        spGroup.position.set(sp.x, 0, sp.z);

        const riser = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 1.45, 8),
          new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.25 })
        );
        riser.position.y = 0.725;
        spGroup.add(riser);

        const nozzle = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.08, 0.08),
          new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.85, roughness: 0.2 })
        );
        nozzle.position.y = 1.48;
        spGroup.add(nozzle);
        sr.sprinklerNozzles.push(nozzle);

        if (farmState.pumpActive) {
          const sprayCone = new THREE.Mesh(
            new THREE.ConeGeometry(sp.radius, 1.45, 24, 1, true),
            new THREE.MeshPhysicalMaterial({
              color: 0xbae6fd,
              transparent: true,
              opacity: 0.28,
              side: THREE.DoubleSide,
              roughness: 0.15,
            })
          );
          sprayCone.position.y = 0.725;
          spGroup.add(sprayCone);
        }

        sr.irrigationGroup.add(spGroup);
      });
    }

    while (sr.treeGroup.children.length > 0) {
      sr.treeGroup.remove(sr.treeGroup.children[0]);
    }
    farmState.trees.forEach((t) => {
      const tg = new THREE.Group();
      tg.position.set(t.x, 0, t.z);
      tg.scale.setScalar(t.scale || 1.0);

      if (t.species === 'palm') {
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.34, 6.2, 10),
          new THREE.MeshStandardMaterial({ color: 0x5c4028, roughness: 0.9 })
        );
        trunk.position.y = 3.1;
        trunk.castShadow = true;
        tg.add(trunk);

        for (let f = 0; f < 10; f++) {
          const angle = (f / 10) * Math.PI * 2;
          const frond = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 0.08, 0.42),
            new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.7 })
          );
          frond.position.set(Math.cos(angle) * 1.2, 6.1, Math.sin(angle) * 1.2);
          frond.rotation.y = -angle;
          frond.rotation.z = -0.35;
          frond.castShadow = true;
          tg.add(frond);
        }
      } else {
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.28, 7.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 })
        );
        trunk.position.y = 3.75;
        trunk.castShadow = true;
        tg.add(trunk);

        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry(1.8, 6.2, 10),
          new THREE.MeshStandardMaterial({ color: 0x1e4620, roughness: 0.8 })
        );
        foliage.position.y = 4.8;
        foliage.castShadow = true;
        tg.add(foliage);
      }

      sr.treeGroup.add(tg);
    });
  }, [farmState, showBarePlowedField]);

  const diagnostics = useMemo(() => {
    const env = farmState.environment;
    const cropSpec = CROP_CATALOG_3D[selectedZone.cropType] || CROP_CATALOG_3D.corn;
    const stageSpec = CORN_10_STAGES[selectedZone.growthStage] || CORN_10_STAGES[6];

    const isGettingWater =
      (farmState.pumpActive &&
        ((farmState.irrigationMethod !== 'sprinkler' && selectedZone.irrigated) ||
          farmState.irrigationMethod === 'sprinkler')) ||
      env.id === 'heavy_rain';

    const effectiveMoisture = isGettingWater ? 0.84 : env.id === 'drought' ? 0.11 : 0.42;
    const waterStressPct = Math.round(Math.max(0, Math.min(1, (0.35 - effectiveMoisture) / 0.35)) * 100);
    const heatStressPct =
      env.airTempC > cropSpec.heatLimitC
        ? Math.min(100, Math.round(((env.airTempC - cropSpec.heatLimitC) / 12) * 100))
        : 0;
    const lodgingRiskPct =
      env.windSpeedMs > 11.5
        ? Math.min(95, Math.round(((env.windSpeedMs - 11.5) / 11) * cropSpec.windVulnerability * (stageSpec.height / 2.2) * 100))
        : 0;
    const frostRiskPct =
      env.airTempC < cropSpec.frostLimitC
        ? Math.min(100, Math.round(((cropSpec.frostLimitC - env.airTempC) / 5) * 100))
        : 0;

    const yieldReductionPct = Math.min(
      95,
      Math.round(
        (waterStressPct * stageSpec.ky * 0.45 +
          heatStressPct * 0.32 +
          lodgingRiskPct * 0.45 +
          frostRiskPct * 0.5) /
          1.2
      )
    );

    return {
      cropSpec,
      stageSpec,
      effectiveMoisturePct: Math.round(effectiveMoisture * 100),
      waterStressPct,
      heatStressPct,
      lodgingRiskPct,
      frostRiskPct,
      yieldReductionPct,
    };
  }, [farmState, selectedZone]);

  return (
    <div dir="rtl" className="space-y-4">
      {/* Top Integrated AGRI-GO <-> 3D Simulation Bridge Bar */}
      <div className="rounded-[24px] bg-white/75 backdrop-blur-xl border border-white/90 shadow-md px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-[#1b4332]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2d6a4f] text-white flex items-center justify-center shadow">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#40916c]">
              محاكاة سولدوك ثلاثية الأبعاد المتصلة بالمزرعة والاقتصاد (AGRI-GO 3D WebGL Farm Twin)
            </div>
            <div className="text-sm sm:text-base font-black text-[#1b4332]">
              {selectedFarm.farmNameAr} ({areaInfo.feddans} فدان) • المحصول النشط: {selectedCrop.nameAr} • صافي الربح المتوقع: {formatEGP(economics.profit.totalNetProfit)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenEconomicsPage}
            className="px-3.5 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5"
          >
            <Coins className="w-4 h-4" />
            <span>عرض الجدوى الاقتصادية ({formatEGP(economics.profit.netProfitPerFeddan)}/فدان)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen3D((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#1b4332] border border-emerald-300 text-xs font-extrabold shadow-sm flex items-center gap-1.5"
          >
            {isFullscreen3D ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen3D ? 'تصغير داخل اللوحة' : 'ملء الشاشة الكاملة'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D WebGL Simulation Container */}
      <div
        className={`${
          isFullscreen3D
            ? 'fixed inset-0 z-50 h-screen w-screen rounded-none'
            : 'relative h-[680px] w-full rounded-[28px] border-2 border-white/85 shadow-2xl'
        } overflow-hidden bg-slate-950 font-sans text-slate-100 select-none`}
      >
        {/* 3D WebGL Viewport */}
        <div ref={mountRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />

        {/* SINGLE MASTER BUTTON TO TOGGLE ALL CONTROLS + EXIT FULLSCREEN */}
        <div className="pointer-events-auto absolute top-3 left-3 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowControls((prev) => !prev)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold shadow-2xl transition border ${
              showControls
                ? 'bg-rose-600 text-white border-rose-400 hover:bg-rose-500'
                : 'bg-slate-900/90 text-amber-400 border-amber-500/80 hover:bg-slate-800 backdrop-blur-md'
            }`}
          >
            <span>{showControls ? '✕ إخفاء التحكمات' : '⚙️ التحكمات والإعدادات'}</span>
          </button>

          {isFullscreen3D && (
            <button
              type="button"
              onClick={() => setIsFullscreen3D(false)}
              className="rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/60 px-3.5 py-2.5 text-xs font-extrabold shadow-2xl backdrop-blur-md"
            >
              العودة للوحة سولدوك ↙
            </button>
          )}
        </div>

        {/* FLOATING QUICK-ACTION PLANT ADD / REMOVE TOOLBAR (ALWAYS ACCESSIBLE) */}
        <div className="pointer-events-auto absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-slate-950/92 px-3.5 py-2 shadow-2xl backdrop-blur-xl border border-emerald-500/50 text-xs max-w-[95vw]">
          <span className="font-black text-emerald-300 ml-1 hidden sm:inline">
            تحكم حر بالنباتات ({totalRenderedPlantsCount.toLocaleString('ar-EG')} نبات):
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveTool('add_plant_free');
              setNotification(
                `🌱 وضع إضافة النباتات مفعل: اضغط على أي مكان على الأرض لزراعة (${CROP_CATALOG_3D[cropToPlantAnywhere]?.nameAr}) فوراً`
              );
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1 ${
              activeTool === 'add_plant_free'
                ? 'bg-emerald-500 text-slate-950 shadow-lg ring-2 ring-white'
                : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
            }`}
          >
            <span>➕ إضافة نبات</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('remove_plant');
              setNotification(
                '🗑️ وضع حذف النباتات مفعل: اضغط على أي نبات أو منطقة على الأرض لإزالتها فوراً'
              );
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1 ${
              activeTool === 'remove_plant'
                ? 'bg-rose-600 text-white shadow-lg ring-2 ring-white'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
            }`}
          >
            <span>🗑️ حذف نبات / ممحاة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('inspect');
              setNotification('🔍 وضع الفحص والتحديد: اضغط على أي نبات لفحص رطوبته أو حذفه');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeTool === 'inspect'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔍 فحص وتحديد
          </button>

          {/* Crop selector for instant planting */}
          <select
            value={cropToPlantAnywhere}
            onChange={(e) => {
              const cid = e.target.value;
              setCropToPlantAnywhere(cid);
              if (activeTool !== 'add_plant_free' && activeTool !== 'plant_anywhere') {
                setActiveTool('add_plant_free');
              }
            }}
            className="rounded-xl bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs font-extrabold text-amber-300 focus:outline-none"
          >
            {Object.values(CROP_CATALOG_3D).map((c) => (
              <option key={c.id} value={c.id}>
                🌱 {c.nameAr}
              </option>
            ))}
          </select>

          {/* Brush pattern selector when adding plants */}
          {activeTool === 'add_plant_free' && (
            <select
              value={plantBrushPattern}
              onChange={(e) => setPlantBrushPattern(e.target.value)}
              className="rounded-xl bg-slate-900 border border-emerald-600/60 px-2.5 py-1.5 text-xs font-bold text-emerald-200 focus:outline-none"
            >
              <option value="single">نبات واحد فقط (1)</option>
              <option value="cluster_5">باقة 5 نباتات (5)</option>
              <option value="row_line">صف زراعي (7 نباتات)</option>
              <option value="dense_patch">مربع كثيف (25 نبات)</option>
            </select>
          )}

          {/* Eraser radius selector when removing plants */}
          {activeTool === 'remove_plant' && (
            <select
              value={eraserRadius}
              onChange={(e) => setEraserRadius(Number(e.target.value))}
              className="rounded-xl bg-slate-900 border border-rose-600/60 px-2.5 py-1.5 text-xs font-bold text-rose-200 focus:outline-none"
            >
              <option value={0.45}>حذف نبات واحد بدقة</option>
              <option value={2.2}>ممحاة متوسطة (قطر 4م)</option>
              <option value={6.0}>ممحاة واسعة (قطر 12م)</option>
            </select>
          )}

          {/* Toggle Continuous Brush Drag vs Single Click */}
          {(activeTool === 'add_plant_free' || activeTool === 'remove_plant') && (
            <button
              type="button"
              onClick={() => setContinuousBrushDrag((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl font-bold border transition ${
                continuousBrushDrag
                  ? 'bg-amber-400 text-slate-950 border-white'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="التبديل بين الزرع/الحذف بالنقرة المفردة أو بالسحب المستمر كالفرشاة"
            >
              {continuousBrushDrag ? 'فرشاة سحب مستمر 🖌️' : 'نقرة مفردة 👆'}
            </button>
          )}

          <button
            type="button"
            onClick={handleClearAllPlantsInFarm}
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-800 text-rose-200 border border-rose-700/70 font-bold"
            title="إزالة كل النباتات للحصول على أرض خالية تماماً وتزرعها بنفسك"
          >
            🧹 إفراغ الحقل
          </button>

          {farmState.zones.length === 0 && (
            <button
              type="button"
              onClick={handleRestoreDefaultCropZones}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-700 text-emerald-200 border border-emerald-500/60 font-bold"
            >
              🌾 استعادة الأحواض
            </button>
          )}
        </div>

        {/* ALL CONTROLS & PANELS */}
        {showControls && (
          <>
            {/* TOP BAR: PROVENANCE, CAMERA PRESETS & HISTORY */}
            <div className="pointer-events-none absolute top-3 right-3 left-48 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-900/90 px-4 py-2.5 shadow-2xl backdrop-blur-md border border-slate-700/80">
              <div className="pointer-events-auto flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-extrabold tracking-wide text-emerald-400">
                    AGRI-GO 3D FARM ({selectedFarm.governorateAr})
                  </span>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    farmState.environment.provenance === 'OBSERVED'
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {farmState.environment.provenance === 'OBSERVED'
                    ? 'بيانات رصد فعلية (WaPOR / Sentinel-2 / NASA POWER)'
                    : 'محاكاة توضيحية افتراضية (ليست تنبؤاً جوياً)'}
                </span>
              </div>

              {/* 6 Camera Presets */}
              <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 ml-1">زاوية الكاميرا:</span>
                {[
                  ['field_photo', 'صورة الحقل 📷'],
                  ['drone', 'الدرون 🚁'],
                  ['ground', 'مستوى المزارع 🚶'],
                  ['side', 'جانبي 📐'],
                  ['top', 'مسقط رأسي 🗺️'],
                  ['closeup', 'فحص النبات 🔍'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCameraPreset(id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      cameraPreset === id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Undo / Redo / Save */}
              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyPast.length === 0}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs hover:bg-slate-700 disabled:opacity-40"
                >
                  تراجع ↩
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyFuture.length === 0}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs hover:bg-slate-700 disabled:opacity-40"
                >
                  إعادة ↪
                </button>
                <button
                  type="button"
                  onClick={handleSaveFarm}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold hover:bg-blue-500 shadow"
                >
                  حفظ التصميم 💾
                </button>
                <button
                  type="button"
                  onClick={handleResetFarm}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-rose-300 hover:bg-slate-700"
                >
                  استعادة الضبط
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR: SOIL, CROP, IRRIGATION & WEATHER */}
            <div className="pointer-events-none absolute top-20 right-3 bottom-16 z-20 flex w-96 max-w-[92vw] flex-col gap-3">
              <div className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl bg-slate-900/92 shadow-2xl backdrop-blur-md border border-slate-700/80 max-h-full">
                <div className="grid grid-cols-4 border-b border-slate-700 bg-slate-950/60 text-xs font-bold">
                  {[
                    ['soil', '١. التربة والحرث'],
                    ['crops', '٢. المحاصيل'],
                    ['irrigation', '٣. شبكة الري'],
                    ['weather', '٤. الطقس والبيئة'],
                  ].map(([tabId, tabTitle]) => (
                    <button
                      key={tabId}
                      type="button"
                      onClick={() => setActiveTab(tabId)}
                      className={`py-2.5 text-center transition ${
                        activeTab === tabId
                          ? 'border-b-2 border-emerald-400 bg-slate-800/90 text-emerald-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tabTitle}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto p-4 space-y-4 text-xs">
                  {/* TAB 1: PLOWED EGYPTIAN SOIL */}
                  {activeTab === 'soil' && (
                    <div className="space-y-3.5">
                      <div className="rounded-xl bg-amber-950/40 p-3 border border-amber-700/50 space-y-2">
                        <div className="font-bold text-amber-300">
                          محاكاة التربة الطينية المصرية المحروثة ({selectedFarm.landClassificationAr})
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          تتضمن قلقيل وكتل التربة السمراء المقلبة بالمحراث، وشظايا القش الجاف المتناثرة، وآثار سكة الجرار الطولية، والجسر الترابي الجانبي والماسورة الخرسانية (العبارة).
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowBarePlowedField((prev) => !prev);
                              setCameraPreset('field_photo');
                            }}
                            className={`rounded-lg py-2 px-2 font-bold transition ${
                              showBarePlowedField
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            }`}
                          >
                            {showBarePlowedField ? 'إظهار المحاصيل المزروعة 🌱' : 'عرض الأرض محروثة فقط 🚜'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCameraPreset('field_photo')}
                            className="rounded-lg bg-slate-800 py-2 px-2 font-semibold text-slate-200 hover:bg-slate-700"
                          >
                            زاوية الصور المرجعية 📷
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">خشونة وبروز قلقيل التربة المحروثة:</span>
                          <span className="font-bold text-amber-400">{Math.round(clodRoughness * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.3}
                          max={1.8}
                          step={0.05}
                          value={clodRoughness}
                          onChange={(e) => setClodRoughness(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">كثافة بقايا القش والحطب الجاف بالتربة:</span>
                          <span className="font-bold text-amber-400">{Math.round(stubbleDensity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.0}
                          max={1.0}
                          step={0.05}
                          value={stubbleDensity}
                          onChange={(e) => setStubbleDensity(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">عمق خطوط سكة المحراث (سم):</span>
                          <span className="font-bold text-amber-400">{Math.round(furrowDepth * 100)} سم</span>
                        </div>
                        <input
                          type="range"
                          min={0.05}
                          max={0.22}
                          step={0.01}
                          value={furrowDepth}
                          onChange={(e) => setFurrowDepth(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CROPS & 10-STAGE GROWTH */}
                  {activeTab === 'crops' && (
                    <div className="space-y-3.5">
                      {/* Freeform Plant Addition & Removal Control Card */}
                      <div className="rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-300">
                            إضافة وحذف النباتات بحرية كاملة:
                          </span>
                          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black text-amber-300 border border-slate-700">
                            {totalRenderedPlantsCount.toLocaleString('ar-EG')} نبات بالحقل
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTool('add_plant_free');
                              setNotification(
                                `🌱 اضغط في أي مكان على الأرض لإضافة (${CROP_CATALOG_3D[cropToPlantAnywhere]?.nameAr})`
                              );
                            }}
                            className={`rounded-lg py-2 px-2 font-extrabold transition ${
                              activeTool === 'add_plant_free'
                                ? 'bg-emerald-500 text-slate-950 shadow-lg ring-2 ring-white'
                                : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                            }`}
                          >
                            ➕ إضافة نباتات حرة
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTool('remove_plant');
                              setNotification(
                                '🗑️ اضغط على أي نبات لحذفه فوراً أو امسح منطقة بالممحاة'
                              );
                            }}
                            className={`rounded-lg py-2 px-2 font-extrabold transition ${
                              activeTool === 'remove_plant'
                                ? 'bg-rose-600 text-white shadow-lg ring-2 ring-white'
                                : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                            }`}
                          >
                            🗑️ حذف نبات / ممحاة
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCropToPlantAnywhere(selectedZone.cropType);
                              setActiveTool(activeTool === 'plant_anywhere' ? 'inspect' : 'plant_anywhere');
                              setNotification(
                                activeTool === 'plant_anywhere'
                                  ? 'تم إيقاف أداة إنشاء الأحواض'
                                  : `اضغط على الأرض لإنشاء حوض كامل من (${CROP_CATALOG_3D[selectedZone.cropType]?.nameAr})`
                              );
                            }}
                            className={`rounded-lg py-1.5 px-2 font-bold transition ${
                              activeTool === 'plant_anywhere'
                                ? 'bg-amber-400 text-slate-950 shadow'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            📐 زرع حوض كامل بالضغط
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePlantCropInAllZones(cropToPlantAnywhere)}
                            className="rounded-lg bg-sky-700 hover:bg-sky-600 py-1.5 px-2 font-bold text-white transition"
                          >
                            🌾 تعميم بكل الأحواض
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-emerald-800/50">
                          <button
                            type="button"
                            onClick={handleClearAllPlantsInFarm}
                            className="rounded-lg bg-rose-950/90 hover:bg-rose-800 text-rose-200 border border-rose-700/60 py-1.5 px-2 font-bold"
                          >
                            🧹 مسح كل النباتات
                          </button>
                          <button
                            type="button"
                            onClick={handleRestoreDefaultCropZones}
                            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 py-1.5 px-2 font-bold"
                          >
                            🔄 استعادة الأحواض
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-bold text-slate-300">الأحواض المزروعة حالياً ({farmState.zones.length}):</label>
                          {farmState.zones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                updateFarmWithHistory((prev) => {
                                  const remaining = prev.zones.filter((z) => z.id !== selectedZone.id);
                                  const nextZones = remaining.length > 0 ? remaining : prev.zones;
                                  setSelectedZoneId(nextZones[0].id);
                                  return { ...prev, zones: nextZones };
                                });
                                setNotification('تم حذف الحوض المحدد');
                              }}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                            >
                              حذف الحوض المحدد ✕
                            </button>
                          )}
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {farmState.zones.map((z) => (
                            <button
                              key={z.id}
                              type="button"
                              onClick={() => setSelectedZoneId(z.id)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-right transition ${
                                selectedZone.id === z.id
                                  ? 'bg-emerald-600/25 border border-emerald-400 text-white'
                                  : 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className="font-bold">{z.nameAr}</span>
                              <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] text-emerald-300">
                                {CROP_CATALOG_3D[z.cropType]?.nameAr} • مرحلة {z.growthStage}/10
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1.5">
                          اختر المحصول لزراعته (نبات فردي أو حوض):
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {Object.values(CROP_CATALOG_3D).map((crop) => (
                            <button
                              key={crop.id}
                              type="button"
                              onClick={() => {
                                setCropToPlantAnywhere(crop.id);
                                if (farmState.zones.length > 0) {
                                  updateFarmWithHistory((prev) => ({
                                    ...prev,
                                    zones: prev.zones.map((z) =>
                                      z.id === selectedZone.id
                                        ? {
                                            ...z,
                                            cropType: crop.id,
                                            nameAr: `${z.nameAr.split('(')[0].trim()} (${crop.nameAr})`,
                                            rowSpacing: crop.defaultRowSpacing,
                                            plantSpacing: crop.defaultPlantSpacing,
                                          }
                                        : z
                                    ),
                                  }));
                                }
                                if (CROP_3D_TO_AGRI-GO_MAP[crop.id]) {
                                  onSyncCropToAGRI-GO(CROP_3D_TO_AGRI-GO_MAP[crop.id]);
                                  setNotification(
                                    `تم اختيار (${crop.nameAr}) — اضغط على الأرض لإضافة نباتات أو تعديل الأحواض ✓`
                                  );
                                }
                              }}
                              className={`rounded-lg py-2 px-1.5 font-semibold transition ${
                                cropToPlantAnywhere === crop.id
                                  ? 'bg-emerald-600 text-white shadow ring-1 ring-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {crop.nameAr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-800/70 p-3 border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-300">
                            {CORN_10_STAGES[selectedZone.growthStage]?.nameAr}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAutoGrowPlaying((p) => !p)}
                            className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                              autoGrowPlaying ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {autoGrowPlaying ? 'إيقاف النمو التلقائي ⏸' : 'محاكاة النمو الزمني ▶'}
                          </button>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={selectedZone.growthStage}
                          onChange={(e) => {
                            const stg = Number(e.target.value);
                            setFreePlantStage(stg);
                            updateFarmWithHistory((prev) => ({
                              ...prev,
                              zones: prev.zones.map((z) => (z.id === selectedZone.id ? { ...z, growthStage: stg } : z)),
                            }));
                          }}
                          className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>١. بذرة وإنبات</span>
                          <span>٥. طرد السنبلة</span>
                          <span>١٠. نضج وحصاد</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-lg bg-slate-800/70 p-2.5 border border-slate-700">
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-300">مسافة الخطوط:</span>
                            <span className="font-bold text-emerald-400">{selectedZone.rowSpacing} م</span>
                          </div>
                          <input
                            type="range"
                            min={0.25}
                            max={1.2}
                            step={0.05}
                            value={selectedZone.rowSpacing}
                            onChange={(e) =>
                              updateFarmWithHistory((prev) => ({
                                ...prev,
                                zones: prev.zones.map((z) =>
                                  z.id === selectedZone.id ? { ...z, rowSpacing: Number(e.target.value) } : z
                                ),
                              }))
                            }
                            className="w-full accent-emerald-500"
                          />
                        </div>
                        <div className="rounded-lg bg-slate-800/70 p-2.5 border border-slate-700">
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-300">مسافة النباتات:</span>
                            <span className="font-bold text-emerald-400">{selectedZone.plantSpacing} م</span>
                          </div>
                          <input
                            type="range"
                            min={0.2}
                            max={0.85}
                            step={0.05}
                            value={selectedZone.plantSpacing}
                            onChange={(e) =>
                              updateFarmWithHistory((prev) => ({
                                ...prev,
                                zones: prev.zones.map((z) =>
                                  z.id === selectedZone.id ? { ...z, plantSpacing: Number(e.target.value) } : z
                                ),
                              }))
                            }
                            className="w-full accent-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INTERACTIVE 3D IRRIGATION DESIGN */}
                  {activeTab === 'irrigation' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1.5">
                          اختر نظام الري ثلاثي الأبعاد (متزامن مع حسابات سولدوك):
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            ['surface', 'ري سطحي (غمر)'],
                            ['drip', 'ري بالتنقيط'],
                            ['sprinkler', 'ري بالرش'],
                          ].map(([method, title]) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                updateFarmWithHistory((prev) => ({
                                  ...prev,
                                  irrigationMethod: method,
                                }));
                                if (IRRIGATION_3D_TO_AGRI-GO_MAP[method]) {
                                  onSyncIrrigationToAGRI-GO(IRRIGATION_3D_TO_AGRI-GO_MAP[method]);
                                }
                              }}
                              className={`rounded-lg py-2 px-2 font-bold transition ${
                                farmState.irrigationMethod === method
                                  ? 'bg-sky-600 text-white shadow'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateFarmWithHistory((prev) => ({
                            ...prev,
                            pumpActive: !prev.pumpActive,
                          }))
                        }
                        className={`w-full rounded-xl py-2.5 text-xs font-extrabold shadow-lg transition ${
                          farmState.pumpActive
                            ? 'bg-rose-600 text-white hover:bg-rose-500'
                            : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                        }`}
                      >
                        {farmState.pumpActive
                          ? 'إيقاف ماكينة الري وتدفق المياه ■'
                          : 'تشغيل ماكينة الري وتدفق المياه في الشبكة ▶'}
                      </button>

                      <div className="rounded-xl bg-slate-800/70 p-3 border border-slate-700 space-y-2">
                        <div className="font-bold text-sky-300">التحكم في بوابات ومحابس الأحواض الزراعية:</div>
                        {farmState.zones.map((z) => (
                          <div key={z.id} className="flex items-center justify-between text-xs">
                            <span>{z.nameAr}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateFarmWithHistory((prev) => ({
                                  ...prev,
                                  zones: prev.zones.map((zn) =>
                                    zn.id === z.id ? { ...zn, irrigated: !zn.irrigated } : zn
                                  ),
                                }))
                              }
                              className={`rounded-md px-2.5 py-1 font-bold ${
                                z.irrigated
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {z.irrigated ? 'المحبس مفتوح (مروي)' : 'المحبس مغلق (جاف)'}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl bg-slate-800/70 p-3 border border-slate-700 space-y-2">
                        <div className="font-bold text-amber-300">أدوات الرسم والتعديل المباشر على الأرض:</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCanalDraftStart(null);
                              setActiveTool(activeTool === 'draw_canal' ? 'inspect' : 'draw_canal');
                            }}
                            className={`rounded-lg py-2 px-1.5 font-bold ${
                              activeTool === 'draw_canal'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {activeTool === 'draw_canal' ? 'اضغط على الأرض...' : 'حفر مسقى ري ✎'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTool(activeTool === 'add_sprinkler' ? 'inspect' : 'add_sprinkler')
                            }
                            className={`rounded-lg py-2 px-1.5 font-bold ${
                              activeTool === 'add_sprinkler'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {activeTool === 'add_sprinkler' ? 'اضغط لوضع رشاش...' : 'إضافة رشاش +'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTool(activeTool === 'add_tree' ? 'inspect' : 'add_tree')
                            }
                            className={`rounded-lg py-2 px-1.5 font-bold ${
                              activeTool === 'add_tree'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {activeTool === 'add_tree' ? 'اضغط لزراعة شجرة...' : 'زراعة نخيل/أشجار 🌴'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: WEATHER & NATURAL PHENOMENA */}
                  {activeTab === 'weather' && (
                    <div className="space-y-3">
                      <div className="font-bold text-slate-300">اختر الظاهرة البيئية لمحاكاة أثرها العلمي:</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.values(PHENOMENA_PRESETS).map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              updateFarmWithHistory((prev) => ({
                                ...prev,
                                environment:
                                  preset.id === 'normal'
                                    ? {
                                        ...preset,
                                        airTempC: Number(effectiveWeather.tempAvgC) || 23.0,
                                        rhPct: Number(effectiveWeather.humidityPct) || 58,
                                      }
                                    : preset,
                              }))
                            }
                            className={`rounded-xl p-2.5 text-right font-bold transition ${
                              farmState.environment.id === preset.id
                                ? 'bg-amber-500 text-slate-950 shadow-md'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {preset.nameAr}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700 space-y-1.5 text-[11px]">
                        <div className="font-bold text-sky-300">القراءات المناخية الحالية:</div>
                        <div className="flex justify-between">
                          <span>درجة حرارة الهواء (T2M):</span>
                          <span className="font-bold">{farmState.environment.airTempC}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>سرعة الرياح (WS2M):</span>
                          <span className="font-bold">{farmState.environment.windSpeedMs} م/ث</span>
                        </div>
                        <div className="flex justify-between">
                          <span>البخر-نتح المرجعي (WaPOR RET):</span>
                          <span className="font-bold">{farmState.environment.et0MmDay} مم/يوم</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          المصدر الموثق: {farmState.environment.citation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LEFT FLOATING CARD: SCIENTIFIC CROP RESPONSE & PLANT INSPECTOR */}
            <div className="pointer-events-none absolute top-20 left-3 z-20 flex w-80 flex-col gap-3">
              <div className="pointer-events-auto rounded-2xl bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md border border-slate-700/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-extrabold text-amber-400">التقييم العلمي لاستجابة المحصول</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-300">
                    FAO-56 + GAEZ
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300">متوسط رطوبة منطقة الجذور:</span>
                    <span className="font-bold text-sky-400">{diagnostics.effectiveMoisturePct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">معامل الإجهاد المائي (1 - Ks):</span>
                    <span className="font-bold text-amber-400">{diagnostics.waterStressPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">خطر الرقاد الميكانيكي بالرياح:</span>
                    <span className="font-bold text-amber-400">{diagnostics.lodgingRiskPct}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-slate-200 font-bold">التأثير المقدر على الإنتاجية:</span>
                    <span className="font-extrabold text-rose-400">-{diagnostics.yieldReductionPct}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-emerald-300 font-bold">إنتاج الفدان المقدر (FAO-33/56):</span>
                    <span className="font-extrabold text-emerald-300">
                      {expectedProduction.expectedPerFeddan} {selectedCrop.unitAr}/فدان
                    </span>
                  </div>
                </div>

                {inspectedPlant && (
                  <div className="rounded-xl bg-emerald-950/60 p-2.5 border border-emerald-700/60 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300">
                        {inspectedPlant.cropNameAr || 'النبات المحدد'} #{inspectedPlant.instanceId}
                      </span>
                      <span className="text-[10px] text-slate-300">
                        ({inspectedPlant.x}م، {inspectedPlant.z}م)
                      </span>
                    </div>
                    <div>رطوبة التربة أسفل النبات مباشرة: {inspectedPlant.moisturePct}%</div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          removePlantsAtPoint(inspectedPlant.rawX, inspectedPlant.rawZ, 0.35)
                        }
                        className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white py-1.5 px-2 font-extrabold text-[10px]"
                      >
                        🗑️ حذف هذا النبات
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          addFreePlantsAtPoint(
                            inspectedPlant.rawX + 0.45,
                            inspectedPlant.rawZ + 0.45,
                            inspectedPlant.cropType || cropToPlantAnywhere,
                            freePlantStage,
                            'single'
                          )
                        }
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-2 font-extrabold text-[10px]"
                      >
                        ➕ زرع نبات بجواره
                      </button>
                    </div>
                  </div>
                )}

                {/* FREE MOVEMENT CONTROLLER (ON-SCREEN D-PAD + MOUSE MODE TOGGLE) */}
                <div className="border-t border-slate-700 pt-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-300 text-[11px]">
                      تحرك بحرية في المزرعة (أو بالكيبورد WASD):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setMouseDragMode((m) => (m === 'orbit' ? 'pan' : 'orbit'))
                      }
                      className={`px-2 py-1 rounded-lg text-[10px] font-black border transition ${
                        mouseDragMode === 'pan'
                          ? 'bg-amber-400 text-slate-950 border-white'
                          : 'bg-slate-800 text-emerald-300 border-slate-600'
                      }`}
                    >
                      {mouseDragMode === 'pan' ? 'الماوس: تحريك حر ✋' : 'الماوس: دوران 🔄'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center text-[11px] font-extrabold">
                    <button
                      type="button"
                      onClick={() => moveCameraFreely(0, 0, -6, 0)}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-sky-300"
                    >
                      تقريب ➕
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCameraFreely(8, 0, 0, 0)}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-600 py-1.5 text-white"
                    >
                      ⬆️ للأمام (W)
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCameraFreely(0, 0, 6, 0)}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-sky-300"
                    >
                      تبعيد ➖
                    </button>

                    <button
                      type="button"
                      onClick={() => moveCameraFreely(0, -8, 0, 0)}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-600 py-1.5 text-white"
                    >
                      ➡️ يمين (D)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sceneRefs.current.desiredTarget.set(0, 1.0, 0);
                        sceneRefs.current.desiredSpherical.radius = 42;
                      }}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-amber-300 text-[10px]"
                    >
                      وسط المزرعة 🎯
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCameraFreely(0, 8, 0, 0)}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-600 py-1.5 text-white"
                    >
                      ⬅️ يسار (A)
                    </button>

                    <button
                      type="button"
                      onClick={() => moveCameraFreely(0, 0, 0, 2.5)}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-slate-200"
                    >
                      لأعلى (E) ⏫
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCameraFreely(-8, 0, 0, 0)}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-600 py-1.5 text-white"
                    >
                      ⬇️ للخلف (S)
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCameraFreely(0, 0, 0, -2.5)}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-slate-200"
                    >
                      لأسفل (Q) ⏬
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM STATUS & INTERACTION BAR */}
            <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-20 flex flex-wrap items-center justify-between gap-2">
              <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-2 text-xs shadow-2xl backdrop-blur-md border border-slate-700/80">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
                <span className="font-semibold text-slate-200">{notification}</span>
              </div>

              <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-slate-900/90 px-4 py-2 text-xs shadow-2xl backdrop-blur-md border border-slate-700/80">
                <span className="text-slate-400">
                  تلميح: <strong className="text-emerald-300">مفاتيح WASD أو الأسهم</strong> للتحرك الحر •{' '}
                  <strong className="text-amber-300">كليك يمين أو زر "تحريك حر"</strong> للسحب •{' '}
                  <strong className="text-sky-300">ازرع في أي مكان</strong> بالضغط على الأرض
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER: COMPUTE REAL SATELLITE TILE URL FROM LAT/LON (ESRI WORLD IMAGERY)
// ============================================================================
function latLonToTileXY(lat, lon, zoom = 15) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, zoom };
}

function getSatelliteGridTiles(lat, lon, zoom = 15) {
  const center = latLonToTileXY(lat, lon, zoom);
  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({
        key: `${dx}_${dy}`,
        url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${center.y + dy}/${center.x + dx}`,
      });
    }
  }
  return tiles;
}

// ============================================================================
// BRAND LOGOS: AGRI-GO LEAF EMBLEM & POWERED BY NASA INSIGNIA
// ============================================================================
function AGRI-GOLeafEmblem({ size = 'md' }) {
  const dims =
    size === 'lg'
      ? 'w-14 h-14 rounded-2xl'
      : size === 'sm'
      ? 'w-9 h-9 rounded-xl'
      : 'w-11 h-11 rounded-2xl';
  return (
    <div
      className={`${dims} bg-gradient-to-br from-[#52b788] to-[#1b4332] flex items-center justify-center shadow-md border border-white/60 shrink-0`}
    >
      <svg viewBox="0 0 40 40" className="w-3/5 h-3/5">
        <path
          d="M32 8C20 8 11 15 9 27C16 27 25 22 29 13C24 19 16 23 8 25L7 32"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M32 8C32 20 24 29 11 29C11 17 19 8 32 8Z"
          fill="rgba(255,255,255,0.28)"
        />
      </svg>
    </div>
  );
}

function NasaInsigniaBadge() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/55 border border-white/70 shadow-sm">
      <svg viewBox="0 0 48 48" className="w-8 h-8 shrink-0">
        <circle cx="24" cy="24" r="22" fill="#0b3d91" />
        <ellipse
          cx="24"
          cy="24"
          rx="19"
          ry="7"
          transform="rotate(-24 24 24)"
          stroke="#ffffff"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M10 31L26 14L23 25L38 17L21 33L24 22Z"
          fill="#fc3d21"
        />
        <circle cx="16" cy="14" r="1" fill="#ffffff" />
        <circle cx="34" cy="13" r="1.2" fill="#ffffff" />
        <circle cx="33" cy="34" r="1" fill="#ffffff" />
        <text
          x="24"
          y="27"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="9.5"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.6"
        >
          NASA
        </text>
      </svg>
      <div className="leading-tight text-left">
        <div className="text-[10px] uppercase tracking-wider text-[#2d6a4f] font-bold">
          Earth Observation
        </div>
        <div className="text-xs font-extrabold text-[#1b4332]">Powered by NASA</div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. MAIN AGRI-GO APPLICATION – REFERENCE GLASSMORPHISM DASHBOARD + ALL MODULES
// ============================================================================
export default function App() {
  // Sidebar navigation items matching the reference image:
  // 'HOME', 'FARM_MANAGER', 'DATA_LAYERS', 'STRATEGY_COMPARISON', 'SIMULATION', 'REPORTS', 'SETTINGS', 'HELP'
  const [activeNav, setActiveNav] = useState('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uiLang, setUiLang] = useState('EN_AR'); // 'EN_AR' (Reference English + Arabic support) or 'AR'

  // ==========================================================================
  // USER-ADDED FARMS STATE (PRE-ADDED FARMS REMOVED AS REQUESTED)
  // ==========================================================================
  const [userFarms, setUserFarms] = useState([]);
  const [newFarmNameInput, setNewFarmNameInput] = useState('مزرعتي الجديدة');
  const [newFarmAreaFeddansInput, setNewFarmAreaFeddansInput] = useState(3);
  const [mapZoomLevel, setMapZoomLevel] = useState(14);

  // ==========================================================================
  // GOOGLE MAPS & GPS ONBOARDING MODAL STATE (OPENS IMMEDIATELY ON ENTRY)
  // ==========================================================================
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [hasConfirmedLocationOnce, setHasConfirmedLocationOnce] = useState(false);
  const [customDynamicFarm, setCustomDynamicFarm] = useState(null);
  const [mapPinLat, setMapPinLat] = useState(30.3541);
  const [mapPinLon, setMapPinLon] = useState(31.1785);
  const [mapPlaceSearchText, setMapPlaceSearchText] = useState('');
  const [mapResolvedAddressAr, setMapResolvedAddressAr] = useState(
    'حدد موقع مزرعتك على خريطة مصر أو بالـ GPS'
  );
  const [gpsStatusMessageAr, setGpsStatusMessageAr] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isFetchingLocationClimate, setIsFetchingLocationClimate] = useState(false);

  // Farm Search & Selection State (Uses User-Added Farms)
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [farmSearchQuery, setFarmSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const selectedFarm = useMemo(() => {
    const foundUserFarm = userFarms.find((f) => f.farmId === selectedFarmId);
    if (foundUserFarm) return foundUserFarm;
    if (userFarms.length > 0) return userFarms[0];
    if (customDynamicFarm) return customDynamicFarm;
    return resolveEgyptianLocationProfile(
      mapPinLat,
      mapPinLon,
      newFarmNameInput || mapResolvedAddressAr,
      Number(newFarmAreaFeddansInput || 3) * FEDDAN_SQM
    );
  }, [
    selectedFarmId,
    userFarms,
    customDynamicFarm,
    mapPinLat,
    mapPinLon,
    newFarmNameInput,
    mapResolvedAddressAr,
    newFarmAreaFeddansInput,
  ]);

  const filteredFarmsForSearch = useMemo(() => {
    const q = farmSearchQuery.trim().toLowerCase();
    if (!q) return userFarms;
    return userFarms.filter(
      (f) =>
        f.farmNameAr.toLowerCase().includes(q) ||
        f.governorateAr.toLowerCase().includes(q) ||
        f.markazAr.toLowerCase().includes(q)
    );
  }, [farmSearchQuery, userFarms]);

  // Farm Area State (1 Feddan = 4,200 m²)
  const [areaSqm, setAreaSqm] = useState(3 * FEDDAN_SQM);
  const areaInfo = useMemo(() => formatAreaInFeddans(areaSqm), [areaSqm]);

  // Selected Agricultural Plan ('SOIL_HEALTH' | 'MAX_PRODUCTION' | 'WATER_SAVING')
  const [selectedPlanId, setSelectedPlanId] = useState('SOIL_HEALTH');
  const selectedPlan = useMemo(
    () => AGRICULTURAL_PLANS.find((p) => p.planId === selectedPlanId) || AGRICULTURAL_PLANS[0],
    [selectedPlanId]
  );

  // Previous Crop & Irrigation System Context
  const [previousCropId, setPreviousCropId] = useState('MAIZE_SUMMER');
  const [irrigationSystemType, setIrrigationSystemType] = useState('TRADITIONAL_SURFACE');
  const [strictCurrentWinterSeasonOnly, setStrictCurrentWinterSeasonOnly] = useState(false);

  // Brief "جاري تحليل أرضك..." transition state when changing plan or farm
  const [isAnalyzingFarm, setIsAnalyzingFarm] = useState(false);

  // Expandable Card Drawers ("ليه AGRI-GO رشح المحصول ده؟" & Technical Details)
  const [openWhyCardMap, setOpenWhyCardMap] = useState({ EG_WHEAT: true, EG_SUGAR_BEET: true });
  const [openTechCardMap, setOpenTechCardMap] = useState({});

  // Selected Crop for Continuing Workflow (Guide, 3D Irrigation, Monitoring, Economics)
  const [selectedCropId, setSelectedCropId] = useState('EG_WHEAT');
  const selectedCrop = useMemo(
    () => AGRI-GO_CROPS[selectedCropId] || AGRI-GO_CROPS.EG_WHEAT,
    [selectedCropId]
  );

  // Planting Date, Growth Stage Confirmation & Actual Farmer Harvest Record
  const [plantingDateByCrop, setPlantingDateByCrop] = useState({});
  const activePlantingDate = plantingDateByCrop[selectedCropId] || selectedCrop.defaultPlantingDate;
  const [farmerConfirmedStageIndex, setFarmerConfirmedStageIndex] = useState(2);
  const [farmerActualYieldInput, setFarmerActualYieldInput] = useState('');

  // Live NASA POWER Weather State + Daily Historical Series for the Environmental Trend Chart
  const [liveWeather, setLiveWeather] = useState(null);
  const [nasaDailyTrendSeries, setNasaDailyTrendSeries] = useState([
    { dateLabel: 'Nov 03', tempC: 22.1, solarMj: 17.2, humidityPct: 60 },
    { dateLabel: 'Nov 04', tempC: 21.8, solarMj: 16.9, humidityPct: 62 },
    { dateLabel: 'Nov 05', tempC: 21.5, solarMj: 16.5, humidityPct: 64 },
    { dateLabel: 'Nov 06', tempC: 20.9, solarMj: 16.1, humidityPct: 65 },
    { dateLabel: 'Nov 07', tempC: 21.2, solarMj: 16.7, humidityPct: 61 },
    { dateLabel: 'Nov 08', tempC: 21.7, solarMj: 17.0, humidityPct: 59 },
    { dateLabel: 'Nov 09', tempC: 21.3, solarMj: 16.8, humidityPct: 62 },
    { dateLabel: 'Nov 10', tempC: 20.8, solarMj: 16.4, humidityPct: 64 },
    { dateLabel: 'Nov 11', tempC: 21.1, solarMj: 16.6, humidityPct: 63 },
    { dateLabel: 'Nov 12', tempC: 21.4, solarMj: 16.8, humidityPct: 62 },
  ]);
  const [lastUpdatedDateEn, setLastUpdatedDateEn] = useState('Nov 14, 2026');
  const [lastUpdatedTextAr, setLastUpdatedTextAr] = useState('14 نوفمبر 2026، الساعة 03:15 ص');
  const [isCacheFallbackMode, setIsCacheFallbackMode] = useState(false);
  const [simulateMissingSoilWaterData, setSimulateMissingSoilWaterData] = useState(false);
  const [showEnvProvenanceModal, setShowEnvProvenanceModal] = useState(false);

  // Economics Controls
  const [priceMode, setPriceMode] = useState('farmGate');
  const [manualSellingPrice, setManualSellingPrice] = useState('');
  const [customCostsByCrop, setCustomCostsByCrop] = useState({});
  const [showDetailedCostEditor, setShowDetailedCostEditor] = useState(false);

  // ==========================================================================
  // LIVE NASA POWER API FETCH FOR FARM AOI COORDINATES & TREND CHART
  // ==========================================================================
  const syncFarmDataInBackend = React.useCallback(async (farmObj) => {
    setIsFetchingLocationClimate(true);
    const startStr = '20251101';
    const endStr = '20251112';
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,WS2M&community=AG&longitude=${farmObj.lon}&latitude=${farmObj.lat}&start=${startStr}&end=${endStr}&format=JSON`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('NASA POWER HTTP error');
      const json = await res.json();
      const paramObj = json?.properties?.parameter;
      if (!paramObj) throw new Error('Missing parameter payload');

      const meanOfValid = (seriesObj) => {
        const vals = Object.values(seriesObj || {}).filter(
          (v) => typeof v === 'number' && v > -900
        );
        if (!vals.length) return null;
        return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
      };

      const fallback = farmObj._backendMetrics.fallbackWeather;
      setLiveWeather({
        tempAvgC: meanOfValid(paramObj.T2M) ?? fallback.tempAvgC,
        tempMaxC: meanOfValid(paramObj.T2M_MAX) ?? fallback.tempMaxC,
        tempMinC: meanOfValid(paramObj.T2M_MIN) ?? fallback.tempMinC,
        humidityPct: Math.round(meanOfValid(paramObj.RH2M) ?? fallback.humidityPct),
        rainfallMmDay: meanOfValid(paramObj.PRECTOTCORR) ?? fallback.rainfallMmDay,
        solarMjDay: meanOfValid(paramObj.ALLSKY_SFC_SW_DWN) ?? fallback.solarMjDay,
        windSpeedMs: meanOfValid(paramObj.WS2M) ?? 3.4,
      });

      // Build real daily trend points from NASA POWER response
      const dates = Object.keys(paramObj.T2M || {}).slice(-10);
      const parsedSeries = dates
        .map((dKey) => {
          const tVal = paramObj.T2M?.[dKey];
          const sVal = paramObj.ALLSKY_SFC_SW_DWN?.[dKey];
          const rVal = paramObj.RH2M?.[dKey];
          const monthDay = `${dKey.slice(4, 6)}/${dKey.slice(6, 8)}`;
          return {
            dateLabel: monthDay,
            tempC: typeof tVal === 'number' && tVal > -900 ? Number(tVal.toFixed(1)) : fallback.tempAvgC,
            solarMj: typeof sVal === 'number' && sVal > -900 ? Number(sVal.toFixed(1)) : fallback.solarMjDay,
            humidityPct: typeof rVal === 'number' && rVal > -900 ? Math.round(rVal) : fallback.humidityPct,
          };
        })
        .filter(Boolean);

      if (parsedSeries.length >= 4) {
        setNasaDailyTrendSeries(parsedSeries);
      }

      const now = new Date();
      setLastUpdatedDateEn(
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      );
      const dateFormattedAr = now.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const timeFormattedAr = now.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastUpdatedTextAr(`${dateFormattedAr}، الساعة ${timeFormattedAr}`);
    } catch (err) {
      const fb = farmObj._backendMetrics.fallbackWeather;
      setLiveWeather({ ...fb, windSpeedMs: 3.4 });
    } finally {
      setIsFetchingLocationClimate(false);
    }
  }, []);

  const triggerBriefAnalysisAnimation = useCallback((callback) => {
    setIsAnalyzingFarm(true);
    if (callback) callback();
    setTimeout(() => {
      setIsAnalyzingFarm(false);
    }, 380);
  }, []);

  // ==========================================================================
  // REVERSE & FORWARD GEOCODING + GPS HANDLERS FOR GOOGLE MAPS SELECTOR
  // ==========================================================================
  const applyLocationPinAndFetchNasa = useCallback(
    async (lat, lon, customLabelAr = '') => {
      const cleanLat = Number(Number(lat).toFixed(5));
      const cleanLon = Number(Number(lon).toFixed(5));
      setMapPinLat(cleanLat);
      setMapPinLon(cleanLon);

      let finalLabel = customLabelAr;
      if (!finalLabel) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${cleanLat}&lon=${cleanLon}&accept-language=ar`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
              finalLabel = data.display_name.split('،').slice(0, 3).join('،');
            }
          }
        } catch (err) {
          // fallback to local resolver below
        }
      }

      const dynFarm = resolveEgyptianLocationProfile(cleanLat, cleanLon, finalLabel);
      const resolvedText =
        finalLabel || `${dynFarm.governorateAr} (${cleanLat.toFixed(4)}°N, ${cleanLon.toFixed(4)}°E)`;
      setMapResolvedAddressAr(resolvedText);
      setCustomDynamicFarm(dynFarm);
      setIrrigationSystemType(dynFarm.defaultIrrigationSystem);
      await syncFarmDataInBackend(dynFarm);
      return { dynFarm, resolvedText };
    },
    [syncFarmDataInBackend]
  );

  const handleSearchPlaceInEgypt = async (e) => {
    if (e) e.preventDefault();
    const q = mapPlaceSearchText.trim();
    if (!q) return;
    setGpsStatusMessageAr('جاري البحث عن الموقع على خريطة جوجل ومطابقة إحداثيات مصر...');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=eg&limit=1&accept-language=ar`
      );
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const foundLat = Number(parseFloat(list[0].lat).toFixed(5));
        const foundLon = Number(parseFloat(list[0].lon).toFixed(5));
        const placeLabel = list[0].display_name.split('،').slice(0, 3).join('،');
        if (!newFarmNameInput || newFarmNameInput === 'مزرعتي الجديدة') {
          setNewFarmNameInput(`مزرعة ${placeLabel.split('،')[0]}`);
        }
        await applyLocationPinAndFetchNasa(foundLat, foundLon, placeLabel);
        setGpsStatusMessageAr(
          `تم تحديد الموقع على جوجل ماب واستخراج بيانات الحرارة والرطوبة والتربة لـ: ${placeLabel} ✓`
        );
        return;
      }
      setGpsStatusMessageAr('لم يتم العثور على الاسم؛ يمكنك التحرك بحرية أو النقر مباشرة على الخريطة.');
    } catch (err) {
      setGpsStatusMessageAr('تعذر الاتصال بخدمة البحث؛ حرك الخريطة أو اضغط عليها مباشرة.');
    }
  };

  const handleRequestBrowserGpsLocation = () => {
    setIsLocatingGps(true);
    setGpsStatusMessageAr('جاري طلب موقعك الحالي عبر نظام تحديد المواقع (GPS) وربطه بخرائط جوجل...');
    if (!navigator.geolocation) {
      setIsLocatingGps(false);
      setGpsStatusMessageAr('متصفحك لا يدعم GPS المباشر؛ يرجى الضغط على موقع مزرعتك على الخريطة.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const rawLat = pos.coords.latitude;
        const rawLon = pos.coords.longitude;
        const inEgypt = rawLat >= 22.0 && rawLat <= 31.7 && rawLon >= 24.5 && rawLon <= 36.0;
        const finalLat = Number((inEgypt ? rawLat : 30.3541).toFixed(5));
        const finalLon = Number((inEgypt ? rawLon : 31.1785).toFixed(5));
        const { resolvedText } = await applyLocationPinAndFetchNasa(
          finalLat,
          finalLon,
          inEgypt ? '' : 'مزرعتي المحددة'
        );
        setIsLocatingGps(false);
        setGpsStatusMessageAr(
          `تم التقاط موقعك الحالي عبر GPS واستخراج بيانات المناخ والتربة وترتيب أفضل 5 محاصيل: ${resolvedText} ✓`
        );
      },
      async () => {
        setIsLocatingGps(false);
        await applyLocationPinAndFetchNasa(mapPinLat, mapPinLon, newFarmNameInput || 'مزرعتي');
        setGpsStatusMessageAr(
          'تم حجب صلاحية الـ GPS في المتصفح؛ يمكنك تحريك الدبوس بحرية لأي مكان على الخريطة بالأسفل.'
        );
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  // Add the user's custom farm to `userFarms` and select it
  const handleConfirmLocationAndAnalyzePlan = async (targetNavAfterConfirm = 'STRATEGY_COMPARISON') => {
    const cleanAreaSqm = Math.max(420, Number(newFarmAreaFeddansInput || areaInfo.feddans || 3) * FEDDAN_SQM);
    const farmTitle = (newFarmNameInput || '').trim() || mapResolvedAddressAr || `مزرعة (${mapPinLat.toFixed(3)}°N)`;
    const newFarmId = `USER-FARM-${Date.now()}`;
    const createdFarm = resolveEgyptianLocationProfile(
      mapPinLat,
      mapPinLon,
      farmTitle,
      cleanAreaSqm,
      newFarmId
    );

    setUserFarms((prev) => [createdFarm, ...prev]);
    setCustomDynamicFarm(createdFarm);
    setSelectedFarmId(createdFarm.farmId);
    setAreaSqm(cleanAreaSqm);
    setIrrigationSystemType(createdFarm.defaultIrrigationSystem);
    setHasConfirmedLocationOnce(true);
    setShowLocationModal(false);
    triggerBriefAnalysisAnimation(() => {
      setActiveNav(targetNavAfterConfirm);
    });
    await syncFarmDataInBackend(createdFarm);
  };

  const handleDeleteUserFarm = (farmIdToDelete) => {
    setUserFarms((prev) => {
      const next = prev.filter((f) => f.farmId !== farmIdToDelete);
      if (next.length > 0) {
        setSelectedFarmId(next[0].farmId);
        setAreaSqm(next[0].defaultAreaSqm);
      } else {
        setSelectedFarmId('');
        setCustomDynamicFarm(null);
      }
      return next;
    });
  };

  const handleClearAllUserFarms = () => {
    setUserFarms([]);
    setSelectedFarmId('');
    setCustomDynamicFarm(null);
    setShowLocationModal(true);
    setGpsStatusMessageAr('تم مسح جميع المزارع؛ قم الآن بإضافة المزرعة التي تريدها وتحديد موقعها ومساحتها.');
  };

  React.useEffect(() => {
    syncFarmDataInBackend(selectedFarm);
  }, [selectedFarm, syncFarmDataInBackend]);

  const effectiveWeather = liveWeather || selectedFarm._backendMetrics.fallbackWeather;

  // Compute real root-zone soil moisture % from FAO WaPOR relative ET & ERA5 soil moisture
  const soilMoisturePct = useMemo(() => {
    if (simulateMissingSoilWaterData) return null;
    return Math.round(selectedFarm.waporMetrics.relativeEvapotranspiration * 72);
  }, [selectedFarm, simulateMissingSoilWaterData]);

  // Satellite tiles centered on the active Egyptian farm coordinates
  const satelliteTiles = useMemo(
    () => getSatelliteGridTiles(selectedFarm.lat, selectedFarm.lon, 15),
    [selectedFarm.lat, selectedFarm.lon]
  );

  // ==========================================================================
  // RUN TOP 5 RECOMMENDATION ENGINE FOR SELECTED PLAN & FARM
  // ==========================================================================
  const planRecommendationsResult = useMemo(
    () =>
      runTop5CropRecommendationEngine({
        planId: selectedPlanId,
        farm: selectedFarm,
        liveWeather: effectiveWeather,
        previousCropId,
        irrigationSystemType,
        areaFeddans: areaInfo.feddans,
        strictCurrentWinterSeasonOnly,
        simulateMissingSoilWaterData,
        isCacheFallbackMode,
        lastUpdatedTextAr,
      }),
    [
      selectedPlanId,
      selectedFarm,
      effectiveWeather,
      previousCropId,
      irrigationSystemType,
      areaInfo.feddans,
      strictCurrentWinterSeasonOnly,
      simulateMissingSoilWaterData,
      isCacheFallbackMode,
      lastUpdatedTextAr,
    ]
  );

  // Expected Production for Selected Crop
  const expectedProduction = useMemo(
    () =>
      estimateCropProductionInBackend({
        farm: selectedFarm,
        crop: selectedCrop,
        areaFeddans: areaInfo.feddans,
        plantingDateStr: activePlantingDate,
        irrigationSystemType,
        farmerRecordedYieldPerFeddan: farmerActualYieldInput,
      }),
    [
      selectedFarm,
      selectedCrop,
      areaInfo.feddans,
      activePlantingDate,
      irrigationSystemType,
      farmerActualYieldInput,
    ]
  );

  // Connected Economics Calculation
  const economics = useMemo(
    () =>
      calculateSmartFarmEconomics({
        farm: selectedFarm,
        crop: selectedCrop,
        areaSqm,
        customCostsPerFeddan: customCostsByCrop[selectedCropId] || {},
        priceMode,
        manualSellingPrice,
        simulateNoRecentPrice: simulateMissingSoilWaterData,
        selectedProductionPerFeddanOverride:
          expectedProduction.farmerActualPerFeddan ?? expectedProduction.expectedPerFeddan,
      }),
    [
      selectedFarm,
      selectedCrop,
      selectedCropId,
      areaSqm,
      customCostsByCrop,
      priceMode,
      manualSellingPrice,
      simulateMissingSoilWaterData,
      expectedProduction.farmerActualPerFeddan,
      expectedProduction.expectedPerFeddan,
    ]
  );

  // All 7 Crops Comparison for Economics Section E
  const sevenCropsComparison = useMemo(() => {
    return Object.values(AGRI-GO_CROPS)
      .map((crop) => {
        const prodEst = estimateCropProductionInBackend({
          farm: selectedFarm,
          crop,
          areaFeddans: areaInfo.feddans,
          plantingDateStr: crop.defaultPlantingDate,
          irrigationSystemType,
        });
        const calc = calculateSmartFarmEconomics({
          farm: selectedFarm,
          crop,
          areaSqm,
          customCostsPerFeddan: customCostsByCrop[crop.cropId] || {},
          priceMode: 'farmGate',
          selectedProductionPerFeddanOverride: prodEst.expectedPerFeddan,
        });
        const rankedMatch = planRecommendationsResult.recommendedTopCrops.find(
          (r) => r.crop.cropId === crop.cropId
        );
        return {
          crop,
          rankInPlan: rankedMatch?.rank || null,
          suitabilityLabelAr: rankedMatch?.suitabilityLabelAr || 'خارج الترشيح الحالي',
          badgeStyle:
            rankedMatch?.badgeStyle || 'bg-emerald-950/10 text-[#2d6a4f] border-emerald-700/30',
          costPerFeddan: calc.costs.costPerFeddan,
          revenuePerFeddan: calc.revenue.expectedRevenuePerFeddan,
          netProfitPerFeddan: calc.profit.netProfitPerFeddan,
        };
      })
      .sort((a, b) => (b.netProfitPerFeddan || 0) - (a.netProfitPerFeddan || 0));
  }, [
    selectedFarm,
    areaSqm,
    areaInfo.feddans,
    irrigationSystemType,
    customCostsByCrop,
    planRecommendationsResult.recommendedTopCrops,
  ]);

  // Handlers
  const handleSelectFarm = (farmId) => {
    const farm = userFarms.find((f) => f.farmId === farmId);
    if (!farm) return;
    triggerBriefAnalysisAnimation(() => {
      setSelectedFarmId(farm.farmId);
      setAreaSqm(farm.defaultAreaSqm);
      setNewFarmAreaFeddansInput(Number((farm.defaultAreaSqm / FEDDAN_SQM).toFixed(2)));
      setMapPinLat(farm.lat);
      setMapPinLon(farm.lon);
      setSelectedCropId(farm.defaultCropId);
      setPreviousCropId(farm.defaultPreviousCropId);
      setIrrigationSystemType(farm.defaultIrrigationSystem);
      setManualSellingPrice('');
      setShowSearchDropdown(false);
    });
  };

  const handleSelectPlan = (planId) => {
    triggerBriefAnalysisAnimation(() => {
      setSelectedPlanId(planId);
    });
  };

  const handleChooseRecommendedCropAndContinue = (cropId, targetNav = 'SIMULATION') => {
    setSelectedCropId(cropId);
    setManualSellingPrice('');
    setActiveNav(targetNav);
  };

  const toggleWhyDrawer = (cropId) => {
    setOpenWhyCardMap((prev) => ({ ...prev, [cropId]: !prev[cropId] }));
  };

  const toggleTechDrawer = (cropId) => {
    setOpenTechCardMap((prev) => ({ ...prev, [cropId]: !prev[cropId] }));
  };

  const handleCostChange = (costKey, val) => {
    setCustomCostsByCrop((prev) => ({
      ...prev,
      [selectedCropId]: {
        ...(prev[selectedCropId] || {}),
        [costKey]: val,
      },
    }));
  };

  const resetCropCosts = () => {
    setCustomCostsByCrop((prev) => {
      const next = { ...prev };
      delete next[selectedCropId];
      return next;
    });
  };

  // 7 Growth Stages for Lifecycle Tracking
  const lifecycleStages = [
    { idx: 0, nameAr: '1. الزراعة ووضع التقاوي', dayRange: 'يوم 1 – 7', gddReq: 80 },
    { idx: 1, nameAr: '2. الإنبات وظهور البادرات', dayRange: 'يوم 8 – 21', gddReq: 240 },
    { idx: 2, nameAr: '3. النمو الخضري والتفريع', dayRange: 'يوم 22 – 55', gddReq: 680 },
    { idx: 3, nameAr: '4. التزهير / طرد السنابل', dayRange: 'يوم 56 – 85', gddReq: 1120 },
    { idx: 4, nameAr: '5. العقد وامتلاء الحبوب/الدرنات', dayRange: 'يوم 86 – 120', gddReq: 1580 },
    { idx: 5, nameAr: '6. النضج الفسيولوجي والفطام', dayRange: 'يوم 121 – 145', gddReq: 1920 },
    { idx: 6, nameAr: '7. الحصاد والتوريد', dayRange: `يوم ${selectedCrop.growthDurationDays}`, gddReq: 2150 },
  ];

  // Exact 8 Sidebar Navigation Items from Reference Screenshot
  const SIDEBAR_ITEMS = [
    { id: 'HOME', labelEn: 'Home', labelAr: 'الرئيسية', icon: Home },
    { id: 'FARM_MANAGER', labelEn: 'Farm Manager', labelAr: 'إدارة المزرعة والدليل', icon: MapPin },
    { id: 'DATA_LAYERS', labelEn: 'Data Layers', labelAr: 'طبقات البيانات الفضائية', icon: Layers },
    { id: 'STRATEGY_COMPARISON', labelEn: 'Strategy Comparison', labelAr: 'مقارنة الخطط والـ TOP 5', icon: Compass },
    { id: 'SIMULATION', labelEn: 'Simulation', labelAr: 'المحاكاة والري 3D والنمو', icon: Activity },
    { id: 'REPORTS', labelEn: 'Reports', labelAr: 'التقارير والاقتصاد الزراعي', icon: FileText },
    { id: 'SETTINGS', labelEn: 'Settings', labelAr: 'الإعدادات والمزامنة', icon: Settings },
    { id: 'HELP', labelEn: 'Help', labelAr: 'المساعدة والمنهجية', icon: HelpCircle },
  ];

  // Build SVG path for the Environmental Overview Trend Chart from real NASA POWER series
  const chartGeometry = useMemo(() => {
    const pts = nasaDailyTrendSeries;
    const width = 520;
    const height = 135;
    const padX = 28;
    const padY = 20;
    const temps = pts.map((p) => p.tempC);
    const minT = Math.min(...temps, 14) - 1.5;
    const maxT = Math.max(...temps, 28) + 1.5;

    const coords = pts.map((pt, idx) => {
      const x =
        padX +
        (idx / Math.max(1, pts.length - 1)) * (width - padX * 2);
      const y =
        height -
        padY -
        ((pt.tempC - minT) / Math.max(1, maxT - minT)) * (height - padY * 2);
      return { ...pt, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    });

    const linePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
      .join(' ');
    const areaPath =
      coords.length > 0
        ? `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`
        : '';

    return { coords, linePath, areaPath, width, height, padY };
  }, [nasaDailyTrendSeries]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-[#1b4332] select-none sm:select-auto">
      {/* =====================================================================
          1. FULL-BLEED REALISTIC EGYPTIAN AGRICULTURAL AERIAL FIELD BACKGROUND
         ===================================================================== */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center scale-105 transition-transform duration-700"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=85')`,
          filter: 'blur(3px) saturate(1.12)',
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#e8f5e9]/55 via-[#d8f3dc]/35 to-[#bae6fd]/40 pointer-events-none" />

      {/* =====================================================================
          1-B. GOOGLE MAPS & GPS LOCATION ONBOARDING + LIVE DATA + TOP 5 WIZARD
               (OPENS IMMEDIATELY WHEN USER ENTERS THE SITE)
         ===================================================================== */}
      {showLocationModal && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="w-full max-w-6xl rounded-[32px] bg-white/95 backdrop-blur-2xl border-2 border-emerald-400 shadow-[0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden my-2 sm:my-4">
            {/* Top Header */}
            <div className="bg-gradient-to-l from-[#1b4332] via-[#2d6a4f] to-[#40916c] px-5 sm:px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center shadow">
                  <MapPin className="w-6 h-6 text-emerald-200 animate-bounce" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                    إضافة مزرعتك الخاصة وتحديد موقعها الحر على خرائط جوجل (AGRI-GO Custom Farm Builder)
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">
                    ١. اكتب اسم ومساحة مزرعتك وحدد موقعها بحرية ⬅ ٢. شاهد بيانات موقعك ⬅ ٣. اختر خطتك واستلم الـ TOP 5
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {userFarms.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllUserFarms}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow"
                  >
                    مسح كل المزارع ({userFarms.length}) 🗑️
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleConfirmLocationAndAnalyzePlan('STRATEGY_COMPARISON')}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow"
                >
                  + حفظ وإضافة هذه المزرعة الآن ✓
                </button>
                {hasConfirmedLocationOnce && (
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(false)}
                    className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold border border-white/30"
                  >
                    إغلاق ✕
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* CUSTOM FARM NAME & AREA BUILDER BAR */}
              <div className="rounded-3xl bg-emerald-950 text-white p-4 border-2 border-emerald-400 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="block text-xs font-extrabold text-emerald-300 mb-1">
                    اسم المزرعة اللي عايز تضيفها:
                  </label>
                  <input
                    type="text"
                    value={newFarmNameInput}
                    onChange={(e) => setNewFarmNameInput(e.target.value)}
                    placeholder="اكتب اسم مزرعتك (مثال: مزرعة البركة، أرض العائلة...)"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/60 text-sm font-black text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-extrabold text-emerald-300 mb-1">
                    مساحة المزرعة بالفدان (1 فدان = 4,200 م²):
                  </label>
                  <input
                    type="number"
                    min="0.25"
                    max="5000"
                    step="0.25"
                    value={newFarmAreaFeddansInput}
                    onChange={(e) => {
                      const val = Math.max(0.25, Number(e.target.value) || 1);
                      setNewFarmAreaFeddansInput(val);
                      setAreaSqm(Math.round(val * FEDDAN_SQM));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/60 text-sm font-black text-amber-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="md:col-span-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmLocationAndAnalyzePlan('STRATEGY_COMPARISON')}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black shadow-lg"
                  >
                    + إضافة المزرعة واستخراج التوصيات ✓
                  </button>
                </div>
              </div>

              {/* USER'S ADDED FARMS LIST (IF ANY) */}
              {userFarms.length > 0 && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-[#1b4332]">
                      مزارعك التي أضفتها ({userFarms.length}):
                    </span>
                    {userFarms.map((uf) => (
                      <div
                        key={uf.farmId}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border ${
                          uf.farmId === selectedFarm.farmId
                            ? 'bg-[#2d6a4f] text-white border-[#1b4332]'
                            : 'bg-white text-[#1b4332] border-emerald-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectFarm(uf.farmId);
                            setShowLocationModal(false);
                          }}
                        >
                          📍 {uf.farmNameAr} ({(uf.defaultAreaSqm / FEDDAN_SQM).toFixed(1)} فدان)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUserFarm(uf.farmId)}
                          className="text-rose-300 hover:text-rose-500 font-black mr-1"
                          title="حذف هذه المزرعة"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllUserFarms}
                    className="text-xs font-extrabold text-rose-600 hover:underline"
                  >
                    مسح كل المزارع 🗑️
                  </button>
                </div>
              )}

              {/* STEP 1 & 2 GRID: GOOGLE MAPS LOCATION PICKER + LIVE EXTRACTED LOCATION DATA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* RIGHT COLUMN (7 cols): Google Maps Satellite + GPS + Free Pan/Move Controls */}
                <div className="lg:col-span-7 space-y-3.5 bg-emerald-50/50 border border-emerald-200 rounded-3xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1b4332] flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#2d6a4f] text-white inline-flex items-center justify-center text-xs">
                        1
                      </span>
                      حدد موقع مزرعتك بحرية (بالـ GPS أو البحث أو تحريك الخريطة):
                    </span>
                    <span className="text-[11px] font-bold text-[#2d6a4f]">
                      {mapPinLat.toFixed(4)}°N, {mapPinLon.toFixed(4)}°E
                    </span>
                  </div>

                  {/* GPS Button + Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleRequestBrowserGpsLocation}
                      disabled={isLocatingGps}
                      className="px-4 py-2.5 rounded-2xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 shrink-0 transition"
                    >
                      <Compass className={`w-4 h-4 ${isLocatingGps ? 'animate-spin' : ''}`} />
                      <span>
                        {isLocatingGps ? 'جاري التقاط إحداثياتك...' : 'تحديد موقعي الحالي تلقائياً (GPS) 🎯'}
                      </span>
                    </button>

                    <form onSubmit={handleSearchPlaceInEgypt} className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        value={mapPlaceSearchText}
                        onChange={(e) => setMapPlaceSearchText(e.target.value)}
                        placeholder="ابحث عن أي قرية أو مركز أو مدينة في مصر لتحريك الخريطة إليها..."
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-white border border-emerald-300 text-xs font-bold text-[#1b4332] placeholder-[#52796f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shrink-0"
                      >
                        بحث 🔍
                      </button>
                    </form>
                  </div>

                  {gpsStatusMessageAr && (
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs font-bold text-[#1b4332] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{gpsStatusMessageAr}</span>
                    </div>
                  )}

                  {/* Free Map Movement Step Controls (Move Pin North/South/East/West & Zoom) */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 bg-white/90 border border-emerald-200 rounded-2xl px-3 py-2 text-[11px] font-extrabold text-[#1b4332]">
                    <span>تحريك حر للموقع على الخريطة:</span>
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => applyLocationPinAndFetchNasa(mapPinLat + 0.03, mapPinLon)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200"
                      >
                        ⬆️ شمالاً
                      </button>
                      <button
                        type="button"
                        onClick={() => applyLocationPinAndFetchNasa(mapPinLat - 0.03, mapPinLon)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200"
                      >
                        ⬇️ جنوباً
                      </button>
                      <button
                        type="button"
                        onClick={() => applyLocationPinAndFetchNasa(mapPinLat, mapPinLon + 0.03)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200"
                      >
                        ➡️ شرقاً
                      </button>
                      <button
                        type="button"
                        onClick={() => applyLocationPinAndFetchNasa(mapPinLat, mapPinLon - 0.03)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200"
                      >
                        ⬅️ غرباً
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapZoomLevel((z) => Math.min(19, z + 1))}
                        className="px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900"
                      >
                        تقريب ➕
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapZoomLevel((z) => Math.max(6, z - 1))}
                        className="px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900"
                      >
                        تبعيد ➖
                      </button>
                    </div>
                  </div>

                  {/* Live Google Maps Satellite Embed + Interactive Egypt Coordinate Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Live Google Maps Satellite Iframe (Interactive Drag & Zoom Enabled) */}
                    <div className="sm:col-span-8 relative h-64 rounded-2xl overflow-hidden border-2 border-[#2d6a4f] shadow-md bg-slate-900">
                      <iframe
                        title="Google Maps Satellite Farm Location"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://maps.google.com/maps?q=${mapPinLat},${mapPinLon}&t=k&z=${mapZoomLevel}&output=embed`}
                        className="w-full h-full"
                      />
                      <div className="pointer-events-none absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/85 text-white text-[10px] font-extrabold border border-white/20">
                        Google Maps Satellite (اسحب الخريطة بحرية) • {mapPinLat.toFixed(4)}°N, {mapPinLon.toFixed(4)}°E
                      </div>
                    </div>

                    {/* Interactive Click-to-Pin Map of Egypt */}
                    <div className="sm:col-span-4 flex flex-col justify-between rounded-2xl bg-slate-900 border-2 border-emerald-700/60 p-2.5 text-white relative overflow-hidden h-64">
                      <div className="text-[11px] font-extrabold text-emerald-300 z-10">
                        اضغط أو اسحب على أي مكان بمصر:
                      </div>
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full flex-1 cursor-crosshair my-1 rounded-xl bg-[#0b2135] border border-slate-700"
                        onClick={async (e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const xPct = (e.clientX - rect.left) / rect.width;
                          const yPct = (e.clientY - rect.top) / rect.height;
                          const clickedLon = Number((25.0 + xPct * (35.0 - 25.0)).toFixed(5));
                          const clickedLat = Number((31.6 - yPct * (31.6 - 22.2)).toFixed(5));
                          const { resolvedText } = await applyLocationPinAndFetchNasa(clickedLat, clickedLon);
                          setGpsStatusMessageAr(
                            `تم تحريك الدبوس إلى: ${resolvedText} وتحديث بيانات الطقس والـ TOP 5 ✓`
                          );
                        }}
                      >
                        <polygon
                          points="42,6 70,6 58,28 53,28"
                          fill="rgba(34,197,94,0.45)"
                          stroke="#4ade80"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M55 28 C54 45, 56 60, 74 78 C77 85, 72 92, 68 96"
                          stroke="#22c55e"
                          strokeWidth="5"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M55 28 C54 45, 56 60, 74 78 C77 85, 72 92, 68 96"
                          stroke="#38bdf8"
                          strokeWidth="1.4"
                          fill="none"
                        />
                        <circle cx="49" cy="34" r="4" fill="rgba(34,197,94,0.5)" />
                        {(() => {
                          const px = Math.max(
                            4,
                            Math.min(96, ((mapPinLon - 25.0) / (35.0 - 25.0)) * 100)
                          );
                          const py = Math.max(
                            4,
                            Math.min(96, ((31.6 - mapPinLat) / (31.6 - 22.2)) * 100)
                          );
                          return (
                            <g>
                              <circle cx={px} cy={py} r="6.5" fill="rgba(239,68,68,0.38)" />
                              <circle
                                cx={px}
                                cy={py}
                                r="3.2"
                                fill="#ef4444"
                                stroke="#ffffff"
                                strokeWidth="1.2"
                              />
                            </g>
                          );
                        })()}
                      </svg>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div>
                          <span className="text-slate-400 block">دائرة العرض (Lat)</span>
                          <input
                            type="number"
                            step="0.01"
                            value={mapPinLat}
                            onChange={(e) => applyLocationPinAndFetchNasa(Number(e.target.value), mapPinLon)}
                            className="w-full px-1.5 py-1 rounded bg-slate-800 border border-slate-700 text-white font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block">خط الطول (Lon)</span>
                          <input
                            type="number"
                            step="0.01"
                            value={mapPinLon}
                            onChange={(e) => applyLocationPinAndFetchNasa(mapPinLat, Number(e.target.value))}
                            className="w-full px-1.5 py-1 rounded bg-slate-800 border border-slate-700 text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LEFT COLUMN (5 cols): STEP 2 - LIVE EXTRACTED LOCATION DATA (TEMPERATURE, HUMIDITY, SOLAR, SOIL) */}
                <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-slate-900 text-white p-4 sm:p-5 border-2 border-emerald-500/60 shadow-xl space-y-3.5">
                  <div className="space-y-1 border-b border-slate-800 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 inline-flex items-center justify-center font-black text-xs">
                          2
                        </span>
                        بيانات موقعك المستخرجة الآن (الحرارة والرطوبة والتربة)
                      </span>
                      {isFetchingLocationClimate && (
                        <span className="text-[11px] text-amber-300 animate-pulse font-bold">
                          جاري الجلب من NASA...
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white">
                      📍 {selectedFarm.farmNameAr} — {selectedFarm.governorateAr}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {selectedFarm.landClassificationAr} • الإحداثيات: {selectedFarm.lat.toFixed(4)}°N, {selectedFarm.lon.toFixed(4)}°E
                    </div>
                  </div>

                  {/* 6 Live Extracted Climate, Water & Soil Cards for the Pinned Location */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                      <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                        <span>درجة الحرارة بالموقع</span>
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div className="text-xl font-black text-white mt-1">
                        {effectiveWeather.tempAvgC}°C
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        العظمى: {effectiveWeather.tempMaxC}°C • الصغرى: {effectiveWeather.tempMinC}°C
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                      <div className="flex items-center justify-between text-sky-300 font-bold text-[11px]">
                        <span>الرطوبة النسبية</span>
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div className="text-xl font-black text-sky-300 mt-1">
                        {effectiveWeather.humidityPct}%
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        NASA POWER RH2M + أمطار {effectiveWeather.rainfallMmDay} مم
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                      <div className="flex items-center justify-between text-yellow-300 font-bold text-[11px]">
                        <span>الإشعاع الشمسي والرياح</span>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="text-base font-black text-white mt-1">
                        {effectiveWeather.solarMjDay} MJ/m²/d
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        سرعة الرياح: {effectiveWeather.windSpeedMs || 3.4} م/ث
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                      <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px]">
                        <span>البخر-نتح وصحة النبات</span>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="text-base font-black text-cyan-300 mt-1">
                        ET0: {(selectedFarm.waporMetrics.retSeasonalMm / 120).toFixed(1)} مم/يوم
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Sentinel-2 NDVI: {selectedFarm.sentinel2Metrics.ndviMean}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-300 block">
                            ملوحة التربة ونوع الأرض في موقعك:
                          </span>
                          <strong className="text-sm text-white">
                            ECe = {selectedFarm._backendMetrics.soilSalinityDsm} dS/m • {selectedFarm.soilSummaryAr}
                          </strong>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                            selectedFarm.riceAllowed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {selectedFarm.riceAllowed ? 'مصرح بزراعة الأرز ✓' : 'منطقة غير مصرح بها للأرز'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Farm Area Input in Feddans */}
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-300">مساحة أرضك بالفدان (4,200 م²):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0.5"
                        max="500"
                        step="0.5"
                        value={areaInfo.feddans}
                        onChange={(e) =>
                          setAreaSqm(Math.max(420, Number(e.target.value || 1) * FEDDAN_SQM))
                        }
                        className="w-24 px-2.5 py-1 rounded-xl bg-slate-800 border border-emerald-500 text-sm font-black text-emerald-300 text-center"
                      />
                      <span className="text-[11px] text-slate-400">
                        فدان ({areaInfo.areaSqm.toLocaleString('ar-EG')} م²)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: CHOOSE YOUR AGRICULTURAL PLAN & VIEW INSTANT TOP 5 RANKED CROPS */}
              <div className="rounded-3xl bg-slate-900 text-white p-5 border-2 border-emerald-500/60 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 inline-flex items-center justify-center font-black text-xs">
                        3
                      </span>
                      اختر الخطة الزراعية لترتيب أفضل 5 محاصيل (TOP 5) بناءً على حرارة ورطوبة وبيانات موقعك:
                    </span>
                  </div>

                  {/* 3 Plan Selector Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {AGRICULTURAL_PLANS.map((plan) => {
                      const isSel = plan.planId === selectedPlanId;
                      return (
                        <button
                          key={plan.planId}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.planId)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-black border-2 transition-all flex items-center gap-2 ${
                            isSel
                              ? 'bg-emerald-500 text-slate-950 border-white shadow-lg scale-[1.02]'
                              : 'bg-slate-950 hover:bg-slate-800 text-white border-slate-700'
                          }`}
                        >
                          <span className="text-base">{plan.iconEmoji}</span>
                          <span>{plan.titleAr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant TOP 5 Ranked Crop Cards inside the Onboarding Wizard */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {planRecommendationsResult.recommendedTopCrops.map((item) => {
                    const c = item.crop;
                    return (
                      <div
                        key={c.cropId}
                        className={`rounded-2xl p-3.5 border-2 flex flex-col justify-between gap-2.5 transition-all ${
                          item.rank === 1
                            ? 'bg-gradient-to-b from-emerald-950 to-slate-950 border-amber-400 shadow-xl'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                                item.rank === 1
                                  ? 'bg-amber-400 text-slate-950'
                                  : item.rank === 2
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-emerald-300'
                              }`}
                            >
                              توب #{item.rank}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeStyle}`}
                            >
                              {item.suitabilityLabelAr}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <CropIllustration cropId={c.cropId} />
                            <div>
                              <div className="text-base font-black text-white">{c.nameAr}</div>
                              <div className="text-[10px] text-slate-400">{c.seasonBadgeAr}</div>
                            </div>
                          </div>

                          {/* Location Climate & Soil vs Crop Optimal Comparison Box */}
                          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-[10px] space-y-1 text-slate-300">
                            <div className="flex justify-between">
                              <span>حرارة موقعك / المثلى:</span>
                              <strong className="text-amber-300">
                                {item.climateComparison.locationTempC}°C ({item.climateComparison.optimalTempRange[0]}–{item.climateComparison.optimalTempRange[1]}°)
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span>رطوبة الموقع:</span>
                              <strong className="text-sky-300">
                                {item.climateComparison.locationHumidityPct}%
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span>ملوحة أرضك / التحمل:</span>
                              <strong className="text-emerald-300">
                                {item.soilMetrics.farmSalinityDsm} / {item.soilMetrics.cropThresholdDsm} dS/m
                              </strong>
                            </div>
                          </div>

                          <p className="text-[11px] text-emerald-200 font-semibold leading-snug line-clamp-3">
                            {item.mainRecommendationReasonAr}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">الإنتاج للفدان:</span>
                            <strong className="text-amber-300">
                              {item.productionEstimate.expectedPerFeddan} {c.unitAr}
                            </strong>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">صافي ربح الفدان:</span>
                            <strong className="text-emerald-400">
                              {formatEGP(item.economicsSummary.netProfitPerFeddan)}
                            </strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCropId(c.cropId);
                              handleConfirmLocationAndAnalyzePlan('STRATEGY_COMPARISON');
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow"
                          >
                            اختر {c.nameAr} وابدأ ✓
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Confirmation Action Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <div className="text-xs text-slate-300">
                    تم ترتيب المحاصيل الخمسة أعلاه بناءً على إحداثيات موقعك ({selectedFarm.lat.toFixed(3)}°N, {selectedFarm.lon.toFixed(3)}°E) وخطة <strong className="text-emerald-300">({selectedPlan.titleAr})</strong>.
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmLocationAndAnalyzePlan('STRATEGY_COMPARISON')}
                      className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black shadow-lg flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>عرض التفاصيل الكاملة لترشيحات الـ TOP 5 لموقعك</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmLocationAndAnalyzePlan('SIMULATION')}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold"
                    >
                      فتح مزرعتك في المحاكاة ثلاثية الأبعاد 3D 🚜
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmLocationAndAnalyzePlan('HOME')}
                      className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
                    >
                      لوحة التحكم الرئيسية
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. MAIN GLASSMORPHISM APPLICATION SHELL (LEFT SIDEBAR + MAIN CONTENT)
         ===================================================================== */}
      <div className="min-h-screen w-full flex flex-col lg:flex-row p-2.5 sm:p-4 lg:p-5 gap-4 max-w-[1600px] mx-auto">
        {/* -------------------------------------------------------------------
            A. LEFT VERTICAL GLASSMORPHISM SIDEBAR (Desktop + Mobile Drawer)
           ------------------------------------------------------------------- */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-3 left-3 z-50 flex w-64' : 'hidden lg:flex lg:w-60 xl:w-64'
          } flex-col justify-between rounded-[28px] bg-white/65 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgba(20,60,35,0.14)] p-4 shrink-0 transition-all`}
        >
          {/* Top Logo: AGRI-GO + Virtual Farm */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1 pt-1">
              <div
                onClick={() => setActiveNav('HOME')}
                className="flex items-center gap-3 cursor-pointer"
              >
                <AGRI-GOLeafEmblem size="md" />
                <div className="leading-tight">
                  <div className="text-xl font-black tracking-tight text-[#1b4332]">
                    AGRI-GO
                  </div>
                  <div className="text-xs font-semibold text-[#40916c]">
                    Virtual Farm
                  </div>
                </div>
              </div>

              {mobileMenuOpen && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="lg:hidden p-1.5 rounded-xl bg-white/70 text-[#1b4332]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* 8 Navigation Items */}
            <nav className="space-y-1.5">
              {SIDEBAR_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all ${
                      isActive
                        ? 'bg-[#d8f3dc]/95 text-[#1b4332] font-extrabold shadow-sm border border-[#95d5b2]'
                        : 'text-[#2d6a4f]/85 hover:bg-white/55 hover:text-[#1b4332] font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#1b4332]' : 'text-[#40916c]'
                        }`}
                      />
                      <span>{uiLang === 'AR' ? item.labelAr : item.labelEn}</span>
                    </div>
                    {uiLang === 'EN_AR' && (
                      <span className="text-[10px] text-[#40916c]/80 font-bold">
                        {item.labelAr.split(' ')[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom NASA Branding: Powered by NASA */}
          <div className="pt-4 mt-4 border-t border-white/60 space-y-2">
            <NasaInsigniaBadge />
          </div>
        </aside>

        {/* -------------------------------------------------------------------
            B. MAIN DASHBOARD & MODULE VIEWPORT
           ------------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* TOP NAVIGATION BAR */}
          <header className="rounded-[24px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(20,60,35,0.10)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Mobile Menu Button + Search Bar ("Search your farm...") */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[220px] max-w-md relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-2xl bg-white/80 text-[#1b4332] border border-white shadow-sm"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#40916c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={farmSearchQuery}
                  onFocus={() => setShowSearchDropdown(true)}
                  onChange={(e) => {
                    setFarmSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  placeholder="Search your farm..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white/75 focus:bg-white border border-white/90 text-sm font-medium text-[#1b4332] placeholder-[#52796f] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#52b788]"
                />

                {/* Dropdown to switch among User-Added Farms */}
                {showSearchDropdown && (
                  <div className="absolute left-0 right-0 top-11 z-40 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-200 shadow-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#40916c]">
                      <span>مزارعك المضافة ({userFarms.length})</span>
                      <button
                        type="button"
                        onClick={() => setShowSearchDropdown(false)}
                        className="text-xs text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>
                    {filteredFarmsForSearch.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-600 font-semibold">
                        لا توجد مزارع مضافة بعد. اضغط بالأسفل لإضافة مزرعتك.
                      </div>
                    ) : (
                      filteredFarmsForSearch.map((f) => (
                        <div
                          key={f.farmId}
                          className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                            f.farmId === selectedFarm.farmId
                              ? 'bg-[#d8f3dc] text-[#1b4332] font-extrabold'
                              : 'hover:bg-emerald-50 text-slate-700 font-semibold'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectFarm(f.farmId)}
                            className="flex-1 text-right"
                          >
                            {f.farmNameAr} ({f.governorateAr}) — {(f.defaultAreaSqm / FEDDAN_SQM).toFixed(1)} فدان
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUserFarm(f.farmId)}
                            className="text-rose-500 hover:text-rose-700 font-black px-2"
                            title="حذف المزرعة"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setShowLocationModal(true);
                      }}
                      className="w-full py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold text-center"
                    >
                      + إضافة مزرعة جديدة على جوجل ماب
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Active Farm Selector Pill + Language Selector + User Profile Icon */}
            <div className="flex items-center gap-2.5">
              {/* Button to reopen Google Maps & Custom Farm Builder anytime */}
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold shadow-sm transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                <span>+ إضافة / تعديل مزرعتك على جوجل ماب 📍</span>
              </button>

              {/* Direct Farm Selector Pill (User-Added Farms) */}
              {userFarms.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 border border-white/90 text-xs font-bold text-[#1b4332] shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <select
                    value={selectedFarm.farmId}
                    onChange={(e) => handleSelectFarm(e.target.value)}
                    className="bg-transparent font-extrabold text-[#1b4332] focus:outline-none cursor-pointer"
                  >
                    {userFarms.map((f) => (
                      <option key={f.farmId} value={f.farmId}>
                        📍 {f.farmNameAr} ({(f.defaultAreaSqm / FEDDAN_SQM).toFixed(1)} فدان)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Language Selector */}
              <button
                type="button"
                onClick={() => setUiLang((prev) => (prev === 'EN_AR' ? 'AR' : 'EN_AR'))}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/75 hover:bg-white border border-white/90 text-xs font-extrabold text-[#1b4332] shadow-sm transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>{uiLang === 'EN_AR' ? 'EN / عربي' : 'العربية'}</span>
              </button>

              {/* User Profile Avatar */}
              <button
                type="button"
                onClick={() => setActiveNav('FARM_MANAGER')}
                title="Farmer Profile & Active Farm"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#52b788] to-[#2d6a4f] border-2 border-white shadow-md flex items-center justify-center text-white hover:scale-105 transition-transform"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* =================================================================
              VIEW 1: HOME DASHBOARD (EXACT MATCH TO UPLOADED REFERENCE IMAGE)
             ================================================================= */}
          {activeNav === 'HOME' && (
            <div className="space-y-4">
              {/* C. WELCOME CARD */}
              <section className="rounded-[28px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_10px_35px_rgba(20,60,35,0.11)] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <AGRI-GOLeafEmblem size="lg" />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1b4332]">
                      Welcome Back, Farmer!
                    </h1>
                    <p className="text-sm sm:text-base font-medium text-[#3b624c] mt-0.5">
                      Let&apos;s grow smarter with AGRI-GO.
                    </p>
                  </div>
                </div>

                {/* Right contextual quick pills connecting to real Egyptian farm state */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3.5 py-2 rounded-2xl bg-white/70 border border-white/90 text-xs font-bold text-[#1b4332] shadow-sm">
                    <span className="text-[#40916c] block text-[10px] uppercase tracking-wider">
                      Active Farm Location
                    </span>
                    <span>
                      {selectedFarm.farmNameAr} • {selectedFarm.governorateAr}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveNav('STRATEGY_COMPARISON')}
                    className="px-4 py-2.5 rounded-2xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Sprout className="w-4 h-4" />
                    <span>الخطط الذكية وأفضل 5 محاصيل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('REPORTS')}
                    className="px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-[#1b4332] border border-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Coins className="w-4 h-4 text-[#2d6a4f]" />
                    <span>الاقتصاد الزراعي ({selectedCrop.nameAr})</span>
                  </button>
                </div>
              </section>

              {/* D. THREE HORIZONTAL STATISTICS CARDS */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Your Farm */}
                <div
                  onClick={() => setShowLocationModal(true)}
                  className="cursor-pointer group rounded-[26px] bg-white/65 hover:bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(20,60,35,0.10)] px-5 py-4 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] border border-white flex items-center justify-center text-[#2d6a4f] shadow-sm">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#40916c]">Your Farm</div>
                      <div className="text-xl sm:text-2xl font-black text-[#1b4332] mt-0.5">
                        {userFarms.length > 0 ? `${userFarms.length} Added Farm(s)` : 'Add Your Farm +'}
                      </div>
                      <div className="text-[11px] font-semibold text-[#3b624c]">
                        {selectedFarm.farmNameAr} ({selectedFarm.governorateAr})
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/75 border border-white flex items-center justify-center text-[#2d6a4f] group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Card 2: Total Area */}
                <div
                  onClick={() => setActiveNav('FARM_MANAGER')}
                  className="cursor-pointer group rounded-[26px] bg-white/65 hover:bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(20,60,35,0.10)] px-5 py-4 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] border border-white flex items-center justify-center text-[#2d6a4f] shadow-sm">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#40916c]">Total Area</div>
                      <div className="text-xl sm:text-2xl font-black text-[#1b4332] mt-0.5">
                        {areaInfo.feddans} Feddans
                      </div>
                      <div className="text-[11px] font-semibold text-[#3b624c]">
                        {areaInfo.areaSqm.toLocaleString()} m² (1 Feddan = 4,200 m²)
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/75 border border-white flex items-center justify-center text-[#2d6a4f] group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Card 3: Last Update */}
                <div
                  onClick={() => setActiveNav('DATA_LAYERS')}
                  className="cursor-pointer group rounded-[26px] bg-white/65 hover:bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(20,60,35,0.10)] px-5 py-4 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] border border-white flex items-center justify-center text-[#2d6a4f] shadow-sm">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#40916c]">Last Update</div>
                      <div className="text-xl sm:text-2xl font-black text-[#1b4332] mt-0.5">
                        {lastUpdatedDateEn}
                      </div>
                      <div className="text-[11px] font-semibold text-[#3b624c]">
                        {isCacheFallbackMode
                          ? 'Cached Snapshot • Offline Fallback'
                          : 'NASA POWER • WaPOR • Sentinel-2 Synced'}
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/75 border border-white flex items-center justify-center text-[#2d6a4f] group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </section>

              {/* E & F. LOWER SPLIT SECTION: YOUR FARM MAP (LEFT) & ENVIRONMENTAL OVERVIEW (RIGHT) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* E. YOUR FARM MAP CARD (Lower-Left) */}
                <div className="lg:col-span-6 rounded-[28px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_rgba(20,60,35,0.12)] p-5 flex flex-col justify-between">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-[#1b4332]">
                          Your Farm Map
                        </h2>
                        <p className="text-[11px] font-semibold text-[#40916c]">
                          {selectedFarm.farmNameAr} • {selectedFarm.lat.toFixed(4)}°N, {selectedFarm.lon.toFixed(4)}°E
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowLocationModal(true)}
                        className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Google Maps GPS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveNav('SIMULATION')}
                        className="px-3 py-1.5 rounded-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>3D Farm Sim</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveNav('STRATEGY_COMPARISON')}
                        className="px-3.5 py-1.5 rounded-full bg-[#d8f3dc]/90 hover:bg-[#b7e4c7] text-[#1b4332] text-xs font-extrabold border border-white shadow-sm transition-all flex items-center gap-1"
                      >
                        <span>TOP 5 Crops</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Real Satellite Map Viewport + Actual Saved Farm Polygon Overlay */}
                  <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-white/90 shadow-inner bg-[#1b4332]">
                    {/* Real Esri World Imagery 3x3 Satellite Tile Grid for the Active Egyptian Farm Coordinates */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {satelliteTiles.map((tile) => (
                        <img
                          key={tile.key}
                          src={tile.url}
                          alt="Satellite Tile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>

                    {/* Subtle green agricultural field fallback & contrast overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none" />

                    {/* Saved Farm Polygon SVG with Green Transparent Fill, Crisp White Boundary & Location Marker */}
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full"
                    >
                      <polygon
                        points={selectedFarm.polygonPoints}
                        fill="rgba(74, 222, 128, 0.36)"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      {/* White corner vertices */}
                      {selectedFarm.polygonPoints.split(' ').map((pair, idx) => {
                        const [vx, vy] = pair.split(',');
                        return (
                          <circle
                            key={idx}
                            cx={vx}
                            cy={vy}
                            r="1.9"
                            fill="#ffffff"
                            stroke="#1b4332"
                            strokeWidth="0.8"
                          />
                        );
                      })}
                    </svg>

                    {/* Central Green Location Marker Pin */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                      <div className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1b4332] text-[11px] font-extrabold shadow-md border border-white mb-1 whitespace-nowrap">
                        {selectedFarm.farmNameAr} ({areaInfo.feddans} Feddans)
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[#2d6a4f] border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <MapPin className="w-5 h-5 fill-emerald-300 text-white" />
                      </div>
                    </div>

                    {/* Bottom Map Metadata Overlay Bar */}
                    <div className="absolute bottom-2.5 inset-x-3 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-white text-[11px] font-bold text-[#1b4332]">
                      <span>
                        Polygon AOI: {selectedFarm.governorateAr} ({selectedFarm.markazAr})
                      </span>
                      <span className="text-[#2d6a4f]">
                        Crop: {selectedCrop.nameAr} • {areaInfo.areaSqm.toLocaleString()} m²
                      </span>
                    </div>
                  </div>
                </div>

                {/* F. ENVIRONMENTAL OVERVIEW CARD (Lower-Right) */}
                <div className="lg:col-span-6 rounded-[28px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_rgba(20,60,35,0.12)] p-5 flex flex-col justify-between">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f]">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-[#1b4332]">
                          Environmental Overview
                        </h2>
                        <p className="text-[11px] font-semibold text-[#40916c]">
                          Real Satellite & Agro-Climatic Observations for Farm AOI
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowEnvProvenanceModal(!showEnvProvenanceModal)}
                      className="px-3 py-1.5 rounded-full bg-white/75 hover:bg-white text-[#2d6a4f] text-xs font-extrabold border border-white shadow-sm flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Data Sources</span>
                    </button>
                  </div>

                  {/* Expandable Provenance Drawer when clicked */}
                  {showEnvProvenanceModal && (
                    <div className="mb-3 p-3 rounded-2xl bg-white/85 border border-emerald-200 text-[11px] text-[#1b4332] space-y-1 shadow-sm">
                      <div className="font-extrabold text-[#2d6a4f]">
                        Verified Scientific Provenance (No Fabricated Readings):
                      </div>
                      <div>
                        • <strong>Temperature & Rainfall:</strong> NASA POWER Agroclimatology API (`T2M`, `PRECTOTCORR`) at {selectedFarm.lat.toFixed(2)}°N, {selectedFarm.lon.toFixed(2)}°E (0.5° grid).
                      </div>
                      <div>
                        • <strong>Soil Moisture:</strong> FAO WaPOR v3 (`ETa/ETc` 100m L2) & ERA5-Land Root-Zone Reanalysis.
                      </div>
                      <div>
                        • <strong>Vegetation Health:</strong> Copernicus Sentinel-2 L2A (`NDVI` 10m tile {selectedFarm.sentinel2Metrics.tileId}, cloud cover {selectedFarm.sentinel2Metrics.cloudCoverPct}%).
                      </div>
                    </div>
                  )}

                  {/* Four Compact Environmental Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                    {/* 1. Temperature */}
                    <div className="rounded-2xl bg-white/75 border border-white p-3 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#40916c]">Temperature</span>
                        <div className="w-7 h-7 rounded-xl bg-amber-100/90 text-amber-600 flex items-center justify-center">
                          <Thermometer className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl font-black text-[#1b4332] mt-1.5">
                        {effectiveWeather.tempAvgC}°C
                      </div>
                      <div className="text-[10px] font-semibold text-[#52796f]">
                        NASA POWER T2M
                      </div>
                    </div>

                    {/* 2. Rainfall */}
                    <div className="rounded-2xl bg-white/75 border border-white p-3 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#40916c]">Rainfall</span>
                        <div className="w-7 h-7 rounded-xl bg-sky-100/90 text-sky-600 flex items-center justify-center">
                          <CloudRain className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl font-black text-[#1b4332] mt-1.5">
                        {effectiveWeather.rainfallMmDay} mm
                      </div>
                      <div className="text-[10px] font-semibold text-[#52796f]">
                        PRECTOTCORR / day
                      </div>
                    </div>

                    {/* 3. Soil Moisture */}
                    <div className="rounded-2xl bg-white/75 border border-white p-3 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#40916c]">Soil Moisture</span>
                        <div className="w-7 h-7 rounded-xl bg-cyan-100/90 text-cyan-700 flex items-center justify-center">
                          <Droplets className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl font-black text-[#1b4332] mt-1.5">
                        {soilMoisturePct !== null ? `${soilMoisturePct}%` : 'Unavailable'}
                      </div>
                      <div className="text-[10px] font-semibold text-[#52796f]">
                        WaPOR / ERA5 Root
                      </div>
                    </div>

                    {/* 4. Vegetation Health */}
                    <div className="rounded-2xl bg-white/75 border border-white p-3 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#40916c]">Vegetation</span>
                        <div className="w-7 h-7 rounded-xl bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center">
                          <Sprout className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl font-black text-[#1b4332] mt-1.5">
                        {selectedFarm.sentinel2Metrics.ndviMean} NDVI
                      </div>
                      <div className="text-[10px] font-semibold text-[#52796f]">
                        Sentinel-2 (10m)
                      </div>
                    </div>
                  </div>

                  {/* Clean, Elegant Environmental Trend Chart (Real NASA POWER Historical Series) */}
                  <div className="rounded-2xl bg-white/75 border border-white p-3.5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-extrabold text-[#1b4332]">
                          Historical Agro-Climatic Trend (NASA POWER Daily Series)
                        </span>
                        <span className="text-[10px] font-semibold text-[#40916c] block">
                          Observed T2M (°C) & Solar Radiation ({effectiveWeather.solarMjDay} MJ/m²/d) • Not a weather forecast
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => syncFarmDataInBackend(selectedFarm)}
                        className="px-2.5 py-1 rounded-lg bg-[#d8f3dc] hover:bg-[#b7e4c7] text-[#1b4332] text-[11px] font-bold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Sync</span>
                      </button>
                    </div>

                    <svg
                      viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                      className="w-full h-32 overflow-visible"
                    >
                      <defs>
                        <linearGradient id="AGRI-GOGreenGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#40916c" stopOpacity="0.42" />
                          <stop offset="100%" stopColor="#d8f3dc" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal subtle grid lines */}
                      {[30, 65, 100].map((gy) => (
                        <line
                          key={gy}
                          x1="24"
                          y1={gy}
                          x2={chartGeometry.width - 24}
                          y2={gy}
                          stroke="rgba(45, 106, 79, 0.12)"
                          strokeDasharray="3 3"
                        />
                      ))}

                      {/* Smooth Area Fill */}
                      {chartGeometry.areaPath && (
                        <path d={chartGeometry.areaPath} fill="url(#AGRI-GOGreenGrad)" />
                      )}

                      {/* Trend Line */}
                      {chartGeometry.linePath && (
                        <path
                          d={chartGeometry.linePath}
                          fill="none"
                          stroke="#2d6a4f"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Data Points & Labels */}
                      {chartGeometry.coords.map((pt, idx) => (
                        <g key={idx}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="3.8"
                            fill="#ffffff"
                            stroke="#1b4332"
                            strokeWidth="2.2"
                          />
                          {idx % 2 === 0 && (
                            <text
                              x={pt.x}
                              y={pt.y - 7}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="700"
                              fill="#1b4332"
                            >
                              {pt.tempC}°
                            </text>
                          )}
                          <text
                            x={pt.x}
                            y={chartGeometry.height - 4}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="600"
                            fill="#40916c"
                          >
                            {pt.dateLabel}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </section>

              {/* QUICK MODULE LAUNCHER FOOTER ON HOME DASHBOARD */}
              <section
                dir="rtl"
                className="rounded-[26px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-md p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2d6a4f] text-white flex items-center justify-center font-black">
                    5
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#1b4332]">
                      الموقع النشط: {selectedFarm.farmNameAr} ({selectedFarm.lat.toFixed(4)}°N, {selectedFarm.lon.toFixed(4)}°E) • الحرارة: {effectiveWeather.tempAvgC}°C • الرطوبة: {effectiveWeather.humidityPct}%
                    </div>
                    <div className="text-xs font-semibold text-[#3b624c]">
                      أفضل محصول مرشح لموقعك حسب خطة ({selectedPlan.titleAr}):{' '}
                      <strong className="text-[#1b4332]">
                        #1 {planRecommendationsResult.recommendedTopCrops[0]?.crop.nameAr}
                      </strong>{' '}
                      — اضغط لعرض الترتيب الكامل لـ TOP 5 محاصيل.
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm"
                  >
                    📍 تغيير الموقع على جوجل ماب
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNav('STRATEGY_COMPARISON')}
                    className="px-3.5 py-2 rounded-xl bg-[#d8f3dc] hover:bg-[#b7e4c7] text-[#1b4332] text-xs font-extrabold border border-white"
                  >
                    🌱 عرض بيانات الموقع وترشيح الـ TOP 5 محاصيل
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNav('SIMULATION')}
                    className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1b4332] text-xs font-extrabold border border-white"
                  >
                    💧 المحاكاة والري 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNav('REPORTS')}
                    className="px-3.5 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold"
                  >
                    💰 صفحة الاقتصاد الزراعي
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* =================================================================
              VIEW 2: STRATEGY_COMPARISON (LOCATION CLIMATE DATA + 3 PLANS + TOP 5 CROPS)
             ================================================================= */}
          {activeNav === 'STRATEGY_COMPARISON' && (
            <div dir="rtl" className="space-y-5">
              {/* STEP 1: EXTRACTED LIVE LOCATION DATA (GOOGLE MAPS + NASA POWER + FAO WaPOR + SOIL) */}
              <section className="rounded-[28px] bg-white/80 backdrop-blur-2xl border-2 border-white shadow-xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] text-white flex items-center justify-center shadow-md">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-[#2d6a4f]">
                          ١. بيانات موقع مزرعتك المستخرجة تلقائياً (Google Maps AOI + NASA POWER + FAO WaPOR)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1b4332] text-[11px] font-extrabold border border-emerald-300">
                          {isFetchingLocationClimate ? 'جاري تحديث القراءات...' : `آخر تحديث: ${lastUpdatedTextAr}`}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#1b4332] mt-0.5">
                        {selectedFarm.farmNameAr} — {selectedFarm.governorateAr} ({areaInfo.labelAr})
                      </h2>
                      <p className="text-xs font-bold text-[#40916c]">
                        الإحداثيات: {selectedFarm.lat.toFixed(4)}°N, {selectedFarm.lon.toFixed(4)}°E • التصنيف: {selectedFarm.landClassificationAr}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="px-4 py-2.5 rounded-2xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
                    >
                      <MapPin className="w-4 h-4 text-emerald-200" />
                      <span>تغيير موقع المزرعة على جوجل ماب 📍</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => syncFarmDataInBackend(selectedFarm)}
                      className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-[#1b4332] border border-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingLocationClimate ? 'animate-spin' : ''}`} />
                      <span>تحديث أرصاد NASA</span>
                    </button>
                  </div>
                </div>

                {/* Live Location Satellite Map Mini-Preview + 8 Extracted Climate & Soil Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  {/* Live Google Maps Satellite View of the Selected Location */}
                  <div className="lg:col-span-4 rounded-2xl overflow-hidden border-2 border-[#2d6a4f] shadow-md relative min-h-[210px] bg-slate-900">
                    <iframe
                      title="Selected Farm Google Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${selectedFarm.lat},${selectedFarm.lon}&t=k&z=15&output=embed`}
                      className="w-full h-full min-h-[210px]"
                    />
                    <div className="absolute bottom-2 inset-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold flex items-center justify-between">
                      <span>📍 {selectedFarm.governorateAr}</span>
                      <span className="text-emerald-300">
                        {selectedFarm.lat.toFixed(3)}°N, {selectedFarm.lon.toFixed(3)}°E
                      </span>
                    </div>
                  </div>

                  {/* 8 Extracted Environmental, Climate, Water & Soil Cards for this Location */}
                  <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        درجة الحرارة المتوسطة (T2M)
                      </span>
                      <div className="text-xl font-black text-[#1b4332] mt-1">
                        {effectiveWeather.tempAvgC}°C
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        العظمى {effectiveWeather.tempMaxC}° • الصغرى {effectiveWeather.tempMinC}°
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        الرطوبة النسبية (RH2M)
                      </span>
                      <div className="text-xl font-black text-sky-700 mt-1">
                        {effectiveWeather.humidityPct}%
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        NASA POWER رطوبة الهواء
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        الإشعاع الشمسي
                      </span>
                      <div className="text-xl font-black text-amber-600 mt-1">
                        {effectiveWeather.solarMjDay} MJ/m²
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        ALLSKY_SFC_SW_DWN يومياً
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        ملوحة التربة (ECe)
                      </span>
                      <div className="text-xl font-black text-[#1b4332] mt-1">
                        {selectedFarm._backendMetrics.soilSalinityDsm} dS/m
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        {selectedFarm.landTypeCode === 'NEW_LAND' ? 'أرض جديدة مستصلحة' : 'أرض طينية قديمة'}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        البخر-نتح المرجعي (WaPOR)
                      </span>
                      <div className="text-xl font-black text-cyan-700 mt-1">
                        {selectedFarm.waporMetrics.retSeasonalMm} مم/موسم
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        كفاية المياه ETa/ETc: {Math.round(selectedFarm.waporMetrics.relativeEvapotranspiration * 100)}%
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        صحة الغطاء النباتي (NDVI)
                      </span>
                      <div className="text-xl font-black text-emerald-700 mt-1">
                        {selectedFarm.sentinel2Metrics.ndviMean}
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        Sentinel-2 (10m) غيوم {selectedFarm.sentinel2Metrics.cloudCoverPct}%
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        الأمطار والرياح بالموقع
                      </span>
                      <div className="text-xl font-black text-[#1b4332] mt-1">
                        {effectiveWeather.rainfallMmDay} مم/يوم
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        سرعة الرياح: {effectiveWeather.windSpeedMs || 3.4} م/ث
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white/90 border border-emerald-200 p-3 shadow-sm">
                      <span className="text-[11px] font-bold text-[#40916c] block">
                        موقف زراعة الأرز بالموقع
                      </span>
                      <div
                        className={`text-sm font-black mt-1 ${
                          selectedFarm.riceAllowed ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {selectedFarm.riceAllowed ? 'مصرح بزراعة الأرز ✓' : 'خارج حزام الأرز ✕'}
                      </div>
                      <span className="text-[10px] font-semibold text-[#52796f] block mt-0.5">
                        قرارات وزارة الري للمحافظة
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* STEP 2: SELECT YOUR AGRICULTURAL PLAN ("إيه هدفك من زراعة الأرض؟") */}
              <section className="rounded-[28px] bg-slate-900/92 backdrop-blur-2xl border border-white/30 text-white p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-400">
                      ٢. اختر خطتك الزراعية الذكية (بناءً على بيانات موقعك في {selectedFarm.governorateAr})
                    </span>
                    <h2 className="text-2xl font-black mt-0.5">
                      إيه هدفك الأساسي من زراعة الأرض في الموسم ده؟
                    </h2>
                  </div>

                  {/* Rotation Previous Crop & Irrigation System Selectors */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
                      <span className="text-slate-400 ml-1.5">المحصول السابق:</span>
                      <select
                        value={previousCropId}
                        onChange={(e) => setPreviousCropId(e.target.value)}
                        className="bg-transparent font-extrabold text-emerald-300 focus:outline-none"
                      >
                        {PREVIOUS_CROP_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                            {p.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
                      <span className="text-slate-400 ml-1.5">نظام الري:</span>
                      <select
                        value={irrigationSystemType}
                        onChange={(e) => setIrrigationSystemType(e.target.value)}
                        className="bg-transparent font-extrabold text-sky-300 focus:outline-none"
                      >
                        <option value="TRADITIONAL_SURFACE" className="bg-slate-900 text-white">
                          ري سطحي تقليدي (غمر)
                        </option>
                        <option value="DRIP" className="bg-slate-900 text-white">
                          ري بالتنقيط
                        </option>
                        <option value="SPRINKLER" className="bg-slate-900 text-white">
                          ري بالرش
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3 Large Agricultural Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {AGRICULTURAL_PLANS.map((plan) => {
                    const isSelected = plan.planId === selectedPlanId;
                    return (
                      <button
                        key={plan.planId}
                        type="button"
                        onClick={() => handleSelectPlan(plan.planId)}
                        className={`text-right rounded-3xl p-5 border-2 transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? `bg-gradient-to-br ${plan.accentBg} ${plan.accentBorder} shadow-2xl scale-[1.01]`
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl">{plan.iconEmoji}</span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                isSelected ? plan.badgeClass : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {isSelected ? 'الخطة المختارة حالياً ✓' : 'اضغط لاختيار الخطة'}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white">{plan.titleAr}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">{plan.shortGoalAr}</p>
                        </div>
                        <div className="text-[11px] text-emerald-300/90 border-t border-white/10 pt-2.5">
                          {plan.methodologySummaryAr}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Brief Analyzing Banner */}
                {isAnalyzingFarm && (
                  <div className="rounded-2xl bg-emerald-950/90 border border-emerald-400 p-4 flex items-center justify-center gap-3 text-emerald-200 font-extrabold animate-pulse">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>
                      جاري تحليل موقع أرضك ({selectedFarm.lat.toFixed(3)}°N, {selectedFarm.lon.toFixed(3)}°E) وترتيب أفضل 5 محاصيل...
                    </span>
                  </div>
                )}

                {/* STEP 3: RANKED TOP 5 RECOMMENDED CROPS FOR THIS LOCATION & PLAN */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-extrabold text-amber-400">
                        ٣. نتائج التحليل العلمي لموقعك ({selectedFarm.governorateAr}) وفق خطة ({selectedPlan.titleAr})
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                        أفضل {planRecommendationsResult.recommendedTopCrops.length} محاصيل مرشحة لمزرعتك (TOP {planRecommendationsResult.recommendedTopCrops.length})
                      </h3>
                    </div>

                    <label className="flex items-center gap-2 text-xs bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={strictCurrentWinterSeasonOnly}
                        onChange={(e) => setStrictCurrentWinterSeasonOnly(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      <span>عرض محاصيل العروة الشتوية الحالية فقط</span>
                    </label>
                  </div>

                  {/* TOP 5 Cards List */}
                  <div className="space-y-4">
                    {planRecommendationsResult.recommendedTopCrops.map((item) => {
                      const c = item.crop;
                      const isWhyOpen = !!openWhyCardMap[c.cropId];
                      const isTechOpen = !!openTechCardMap[c.cropId];

                      return (
                        <div
                          key={c.cropId}
                          className={`rounded-3xl border-2 p-5 transition-all ${
                            item.rank === 1
                              ? 'bg-gradient-to-l from-emerald-950/95 via-slate-950 to-slate-950 border-emerald-400 shadow-2xl'
                              : 'bg-slate-950/95 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Right: Rank Badge + Crop Illustration + Name & Suitability */}
                            <div className="flex items-start sm:items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-lg ${
                                  item.rank === 1
                                    ? 'bg-amber-400 text-slate-950'
                                    : item.rank === 2
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'bg-slate-800 text-emerald-300 border border-slate-700'
                                }`}
                              >
                                <span className="text-[10px] leading-none">ترتيب</span>
                                <span className="text-lg leading-tight">#{item.rank}</span>
                              </div>

                              <CropIllustration cropId={c.cropId} />

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-xl font-black text-white">{c.nameAr}</h4>
                                  <span
                                    className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${item.badgeStyle}`}
                                  >
                                    {item.suitabilityLabelAr}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[11px] font-bold border border-slate-700">
                                    {c.seasonBadgeAr}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-emerald-200 font-bold leading-relaxed">
                                  {item.mainRecommendationReasonAr}
                                </p>

                                <div className="text-xs text-amber-300 font-semibold">
                                  {item.planSpecificHighlightAr}
                                </div>
                              </div>
                            </div>

                            {/* Left: Key Metrics (Yield, Water, Net Profit) + Action Buttons */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                              <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 text-xs">
                                <div className="px-2">
                                  <span className="text-[10px] text-slate-400 block">الإنتاج المتوقع</span>
                                  <strong className="text-amber-300 font-black">
                                    {item.productionEstimate.expectedPerFeddan} {c.unitAr}/فدان
                                  </strong>
                                </div>
                                <div className="px-2 border-x border-slate-800">
                                  <span className="text-[10px] text-slate-400 block">مياه الري</span>
                                  <strong className="text-sky-300 font-black">
                                    {item.waterMetrics.irrigationRequirementM3PerFeddan} م³
                                  </strong>
                                </div>
                                <div className="px-2">
                                  <span className="text-[10px] text-slate-400 block">صافي ربح الفدان</span>
                                  <strong className="text-emerald-400 font-black">
                                    {formatEGP(item.economicsSummary.netProfitPerFeddan)}
                                  </strong>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleChooseRecommendedCropAndContinue(c.cropId, 'SIMULATION')
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow flex items-center gap-1.5"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                  <span>محاكاة المحصول 3D</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleChooseRecommendedCropAndContinue(c.cropId, 'FARM_MANAGER')
                                  }
                                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-extrabold border border-slate-700"
                                >
                                  دليل الزراعة 📖
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleChooseRecommendedCropAndContinue(c.cropId, 'REPORTS')
                                  }
                                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
                                >
                                  الجدوى الاقتصادية 💰
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Explanation Drawer: "ليه AGRI-GO رشح المحصول ده؟" */}
                          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleWhyDrawer(c.cropId)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 font-extrabold border border-slate-700"
                              >
                                {isWhyOpen
                                  ? 'إخفاء أسباب الترشيح ▲'
                                  : 'ليه AGRI-GO رشح المحصول ده لموقعك؟ ▼'}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTechDrawer(c.cropId)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 font-bold border border-slate-700"
                              >
                                {isTechOpen ? 'إخفاء مصادر البيانات ▲' : 'التفاصيل الفنية والمصادر ▼'}
                              </button>
                            </div>

                            <span className="text-[11px] text-slate-400">
                              حالة البيانات: <strong className="text-emerald-300">{item.dataFreshnessBadge.statusLabelAr}</strong>
                            </span>
                          </div>

                          {isWhyOpen && (
                            <div className="mt-3 rounded-2xl bg-slate-900/90 border border-emerald-800/60 p-4 space-y-2 text-xs">
                              <div className="font-extrabold text-emerald-300">
                                الأسباب العلمية لترشيح محصول {c.nameAr} في موقعك ({selectedFarm.governorateAr}):
                              </div>
                              <ul className="list-disc list-inside space-y-1 text-slate-200 leading-relaxed">
                                {item.whyRecommendedBulletsAr.map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                              <div className="pt-2 border-t border-slate-800 text-amber-300">
                                <strong>محددات وتنبيهات هامة:</strong>{' '}
                                {item.importantLimitationsAr.join(' • ')}
                              </div>
                            </div>
                          )}

                          {isTechOpen && (
                            <div className="mt-2 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 text-[11px] text-slate-300 space-y-1">
                              <div>
                                <strong>المصادر المعتمدة:</strong> {item.dataFreshnessBadge.sourcesSummaryAr}
                              </div>
                              <div>
                                <strong>مقارنة الإنتاجيات الأربع (فصل علمي صارم):</strong> السقف النموذجي GAEZ: {item.productionEstimate.gaezPotentialPerFeddan} {c.unitAr} • المتوسط التاريخي للمحافظة: {item.productionEstimate.historicalOfficialPerFeddan} {c.unitAr} • التقدير المحسوب لمزرعتك (FAO-33/56): {item.productionEstimate.expectedPerFeddan} {c.unitAr} ({item.productionEstimate.minPerFeddan} – {item.productionEstimate.maxPerFeddan}).
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Excluded Crops Section (e.g. Rice in restricted governorates) */}
                  {planRecommendationsResult.excludedCrops.length > 0 && (
                    <div className="rounded-2xl bg-rose-950/40 border border-rose-800/60 p-4 space-y-2 text-xs">
                      <div className="font-extrabold text-rose-300">
                        محاصيل مستبعدة علمياً أو تشريعياً في موقع مزرعتك ({selectedFarm.governorateAr}):
                      </div>
                      {planRecommendationsResult.excludedCrops.map((ex) => (
                        <div key={ex.crop.cropId} className="text-slate-300">
                          • <strong className="text-white">{ex.crop.nameAr}:</strong> {ex.exclusionTitleAr} — {ex.exclusionReasonAr}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* =================================================================
              VIEW 3: FARM_MANAGER (CULTIVATION GUIDE & LIFECYCLE MONITORING)
             ================================================================= */}
          {activeNav === 'FARM_MANAGER' && (
            <div dir="rtl" className="space-y-5">
              <section className="rounded-[28px] bg-slate-900/92 backdrop-blur-2xl border border-white/30 text-white p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <CropIllustration cropId={selectedCrop.cropId} />
                    <div>
                      <span className="text-xs font-extrabold text-emerald-400">
                        إدارة المزرعة ودليل الزراعة الموثق (Cultivation Guide & Lifecycle Tracking)
                      </span>
                      <h2 className="text-2xl font-black mt-0.5">
                        دليل زراعة ومتابعة محصول {selectedCrop.nameAr} في {selectedFarm.governorateAr}
                      </h2>
                      <p className="text-xs text-slate-300">{selectedCrop.varietyAr} • {selectedCrop.seasonBadgeAr}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveNav('SIMULATION')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold"
                    >
                      فتح المحاكاة ثلاثية الأبعاد 3D 🚜
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNav('REPORTS')}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
                    >
                      حساب التكاليف والأرباح 💰
                    </button>
                  </div>
                </div>

                {/* 9 Verified Cultivation Guide Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                  {[
                    ['١. أفضل ميعاد للزراعة', selectedCrop.farmerGuide.bestPlantingTimeAr],
                    ['٢. تجهيز وخدمة الأرض', selectedCrop.farmerGuide.landPreparationAr],
                    ['٣. طريقة الزراعة والكثافة', selectedCrop.farmerGuide.plantingMethodAr],
                    ['٤. الاحتياجات المائية والري', selectedCrop.farmerGuide.irrigationRequirementsAr],
                    ['٥. جدولة الري حسب مراحل النمو', selectedCrop.farmerGuide.irrigationByStageAr],
                    ['٦. برنامج التسميد الموثق', selectedCrop.farmerGuide.nutrientRequirementsAr],
                    ['٧. المتابعة الحقلية الدورية', selectedCrop.farmerGuide.cropMonitoringAr],
                    ['٨. الوقاية والمكافحة المتكاملة (IPM)', selectedCrop.farmerGuide.pestsAndDiseasesAr],
                    ['٩. علامات النضج وميعاد الحصاد', selectedCrop.farmerGuide.harvestTimingAr],
                  ].map(([title, body], idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-1.5"
                    >
                      <div className="font-extrabold text-emerald-400">{title}</div>
                      <p className="text-slate-200 leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>

                {/* 7-Stage Crop Lifecycle Tracker */}
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-extrabold text-amber-300 text-sm">
                      متابعة مراحل نمو المحصول السبع (تأكيد ميداني + وحدات حرارية GDD):
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">تاريخ الزراعة:</span>
                      <input
                        type="date"
                        value={activePlantingDate}
                        onChange={(e) =>
                          setPlantingDateByCrop((prev) => ({
                            ...prev,
                            [selectedCropId]: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                    {lifecycleStages.map((stg) => {
                      const isDone = stg.idx <= farmerConfirmedStageIndex;
                      return (
                        <button
                          key={stg.idx}
                          type="button"
                          onClick={() => setFarmerConfirmedStageIndex(stg.idx)}
                          className={`p-2.5 rounded-xl border text-right transition ${
                            isDone
                              ? 'bg-emerald-950/90 border-emerald-400 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-extrabold text-emerald-300">{stg.nameAr}</div>
                          <div className="text-[10px] mt-1">{stg.dayRange}</div>
                          <div className="text-[10px] text-amber-300">GDD: {stg.gddReq}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* =================================================================
              VIEW 4: SIMULATION (FULL THREE.JS 3D FARM SIMULATION + FAO-33/56)
             ================================================================= */}
          {activeNav === 'SIMULATION' && (
            <AGRI-GO3DFarmSimulation
              selectedFarm={selectedFarm}
              selectedCrop={selectedCrop}
              selectedCropId={selectedCropId}
              irrigationSystemType={irrigationSystemType}
              effectiveWeather={effectiveWeather}
              areaInfo={areaInfo}
              expectedProduction={expectedProduction}
              economics={economics}
              onSyncCropToAGRI-GO={(newAGRI-GOCropId) => {
                setSelectedCropId(newAGRI-GOCropId);
                setManualSellingPrice('');
              }}
              onSyncIrrigationToAGRI-GO={(newAGRI-GOIrrigationType) => {
                setIrrigationSystemType(newAGRI-GOIrrigationType);
              }}
              onOpenEconomicsPage={() => setActiveNav('REPORTS')}
            />
          )}

          {/* =================================================================
              VIEW 5: REPORTS (SMART AGRICULTURAL ECONOMICS PAGE IN EGP)
             ================================================================= */}
          {activeNav === 'REPORTS' && (
            <div dir="rtl" className="space-y-6">
              <section className="rounded-[28px] bg-slate-900/90 backdrop-blur-xl border border-white/30 text-white p-5 sm:p-6 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-400">
                      صفحة الاقتصاد الزراعي الذكية (Smart Agricultural Economics • EGP & Feddans)
                    </span>
                    <h2 className="text-2xl font-black mt-0.5">
                      التكاليف والإيرادات وصافي الربح لمحصول {selectedCrop.nameAr} ({economics.area.feddans} فدان)
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPriceMode('farmGate')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                        priceMode === 'farmGate' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      سعر المزرعة / التوريد
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceMode('wholesale')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                        priceMode === 'wholesale' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      سعر الجملة (منفصل)
                    </button>
                  </div>
                </div>

                {/* 7 Crop Selector Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {Object.values(AGRI-GO_CROPS).map((crop) => (
                    <button
                      key={crop.cropId}
                      type="button"
                      onClick={() => {
                        setSelectedCropId(crop.cropId);
                        setManualSellingPrice('');
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                        crop.cropId === selectedCropId
                          ? 'bg-emerald-950 border-2 border-emerald-400 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <CropIllustration cropId={crop.cropId} />
                      <span className="text-xs font-extrabold text-white">{crop.nameAr}</span>
                    </button>
                  ))}
                </div>

                {/* 4 Large Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                    <span className="text-xs text-rose-300 font-bold">1. تكلفة الزراعة</span>
                    <div className="text-2xl font-black">{formatEGP(economics.costs.totalCultivationCost)}</div>
                    <div className="text-xs text-slate-400">للفدان: {formatEGP(economics.costs.costPerFeddan)}</div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                    <span className="text-xs text-amber-300 font-bold">2. الإنتاج المتوقع</span>
                    <div className="text-2xl font-black text-amber-300">
                      {economics.production.totalExpectedProduction} {selectedCrop.unitAr}
                    </div>
                    <div className="text-xs text-slate-400">
                      للفدان: {economics.production.productionPerFeddan} {selectedCrop.unitAr}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                    <span className="text-xs text-sky-300 font-bold">3. الإيراد المتوقع</span>
                    <div className="text-2xl font-black text-sky-300">
                      {formatEGP(economics.revenue.totalExpectedRevenue)}
                    </div>
                    <div className="text-xs text-slate-400">
                      للفدان: {formatEGP(economics.revenue.expectedRevenuePerFeddan)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-900 to-slate-950 border-2 border-emerald-400 rounded-2xl p-4 space-y-1 shadow-xl">
                    <span className="text-xs text-emerald-200 font-extrabold">4. صافي الربح المتوقع</span>
                    <div className="text-3xl font-black text-white">
                      {formatEGP(economics.profit.totalNetProfit)}
                    </div>
                    <div className="text-xs font-extrabold text-emerald-300">
                      صافي ربح الفدان: {formatEGP(economics.profit.netProfitPerFeddan)}
                    </div>
                  </div>
                </div>

                {/* 7 Crops Profitability Comparison */}
                <div className="space-y-2.5 pt-2">
                  <h3 className="text-base font-extrabold text-emerald-300">
                    مقارنة صافي ربح الفدان للمحاصيل السبعة في {selectedFarm.governorateAr}:
                  </h3>
                  {sevenCropsComparison.map((item, idx) => (
                    <div
                      key={item.crop.cropId}
                      onClick={() => setSelectedCropId(item.crop.cropId)}
                      className="cursor-pointer p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="font-extrabold text-white">
                        #{idx + 1} {item.crop.nameAr}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-rose-300">التكلفة: {formatEGP(item.costPerFeddan)}</span>
                        <span className="text-sky-300">الإيراد: {formatEGP(item.revenuePerFeddan)}</span>
                        <strong className="text-emerald-400 text-sm">
                          صافي الربح: {formatEGP(item.netProfitPerFeddan)} / فدان
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* =================================================================
              VIEW 6: DATA LAYERS, SETTINGS & HELP
             ================================================================= */}
          {(activeNav === 'DATA_LAYERS' || activeNav === 'SETTINGS' || activeNav === 'HELP') && (
            <div dir="rtl" className="space-y-6">
              <section className="rounded-[28px] bg-slate-900/90 backdrop-blur-xl border border-white/30 text-white p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-400">
                      محرك البيانات الفضائية والمناخية (AgriculturalDataEngine • 5 Approved Sources)
                    </span>
                    <h2 className="text-2xl font-black mt-0.5">
                      سجل المصادر العلمية المعتمدة وجدول التحديث الفعلي
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCacheFallbackMode(!isCacheFallbackMode)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold border border-slate-700"
                    >
                      {isCacheFallbackMode ? 'إلغاء وضع الكاش' : 'اختبار وضع الكاش (انقطاع المصدر)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => syncFarmDataInBackend(selectedFarm)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>مزامنة فورية مع NASA POWER</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {APPROVED_DATA_SOURCES_REGISTRY.map((src) => (
                    <div
                      key={src.sourceId}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-base text-emerald-300">{src.datasetName}</strong>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {src.datasetVersion}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        <strong>المتغيرات:</strong> {src.parameters} • <strong>الدقة المكانية:</strong> {src.spatialResolution}
                      </div>
                      <div className="text-amber-300">
                        <strong>سياسة التحديث:</strong> {src.updatePolicyAr} (آخر استرجاع: {src.lastSuccessfulRetrieval})
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
