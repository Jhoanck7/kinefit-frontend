import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: {
    default: 'Kinefit - Centro de Kinesiología y Masoterapia',
    template: '%s | Kinefit'
  },
  description: 'Centro de rehabilitación kinésica y masoterapia.',
  keywords: ['kinesiología', 'masoterapia', 'rehabilitación', 'kinefit', 'kinefitchile','KineFitChile', 'kinesiólogo', 'terapia física'],
  authors: [{ name: 'Kinefit' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  creator: 'Kinefit',
  publisher: 'Kinefit',
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Kinefit - Centro de Kinesiología y Masoterapia',
    description: 'Centro de rehabilitación kinésica, entrenamiento funcional y bienestar integral.',
    type: 'website',
    locale: 'es_CL',
    url: 'https://kinefitchile.com',
    siteName: 'Kinefit'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kinefit - Centro de Kinesiología y Masoterapia',
    description: 'Centro de rehabilitación kinésica, entrenamiento funcional y bienestar integral.'
  }
};
