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

  hoursWeekday: string;
  hoursSaturday: string;

  socialInstagram: string;
  socialFacebook: string;
  socialWhatsApp: string;
  socialTikTok: string;

  galleryJson?: string;

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

  galleryTitle?: string;
  gallerySubtitle?: string;

  testimonialsTitle?: string;
  testimonialsSubtitle?: string;

  locationTitle?: string;
  locationSubtitle?: string;
  footerText?: string;

  updatedAt?: string;
}
