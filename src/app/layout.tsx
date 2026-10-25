import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'LatencyLens — Network Intelligence',description:'Evidence-led network diagnostics powered by open-weight AI'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
