/** Imagen de voucher, con sus variantes de fondo sofá y fondo blanco */
export interface VoucherItem {
  alt: string;
  imagenSofa: string;
  anchoSofa: number;
  altoSofa: number;
  imagenBlanco: string;
  anchoBlanco: number;
  altoBlanco: number;
}

/** Imagen de la sección de embarazadas, con una variante secundaria opcional */
export interface EmbarazadaItem {
  alt: string;
  imagenUrl: string;
  ancho: number;
  alto: number;
  imagenSecundaria?: string;
  anchoSecundaria?: number;
  altoSecundaria?: number;
}

/** Imagen de la sección de nutrición */
export interface NutricionItem {
  alt: string;
  imagenUrl: string;
  ancho: number;
  alto: number;
}

/** Configuración editable de la landing pública */
export interface LandingConfigResponse {
  heroTagline: string;
  heroBrandName: string;
  heroDescription: string;
  heroCtaText: string;
  heroImageUrl?: string;
  heroImageUrl1?: string;
  heroImageUrl2?: string;
  heroImageUrl3?: string;

  clinicName: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicPhoneRaw: string;
  clinicAddress: string;
  locationAppleMapsUrl?: string;

  hoursWeekday: string;
  hoursSaturday: string;

  socialInstagram: string;
  socialFacebook: string;
  socialWhatsApp: string;
  socialTikTok: string;

  aboutVideoUrl?: string;

  googleReviewsUrl?: string;
  googlePlaceId?: string;
  googleApiKey?: string;
  reviewsJson?: string;

  heroBadgeText?: string;
  heroBulletsJson?: string;

  aboutBadgeText?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutFeaturesJson?: string;
  aboutCtaText?: string;

  processTitle?: string;
  processSubtitle?: string;
  processStepsJson?: string;

  teamTitle?: string;
  teamSubtitle?: string;

  testimonialsTitle?: string;
  testimonialsSubtitle?: string;

  locationTitle?: string;
  locationSubtitle?: string;
  footerText?: string;

  reservasHabilitadas: boolean;
  reservasUrlAlterna?: string;

  vouchersTitle?: string;
  vouchersSubtitle?: string;
  vouchersNota?: string;
  vouchersMostrarNota: boolean;
  vouchersJson?: string;

  embarazadasTitle?: string;
  embarazadasSubtitle?: string;
  embarazadasJson?: string;

  updatedAt?: string;

  nutricionTitle?: string;
  nutricionDescription?: string;
  nutricionJson?: string;
  nutricionReelUrl?: string;
  nutricionReel?: string;
}
