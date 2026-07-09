import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Candidate Tracker',
  description: 'Full-stack monorepo pipeline tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}