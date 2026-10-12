import type {Metadata} from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'NER-SAFE Disaster Early-Warning Platform',
  description: 'North Eastern Region disaster early-warning and landslide risk monitoring platform for operational district disaster-management officers.',
  openGraph: {
    title: 'NER-SAFE Disaster Early-Warning Platform',
    description: 'North Eastern Region disaster early-warning and landslide risk monitoring platform for operational district disaster-management officers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NER-SAFE Disaster Early-Warning Platform',
    description: 'North Eastern Region disaster early-warning and landslide risk monitoring platform for operational district disaster-management officers.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 antialiased font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
