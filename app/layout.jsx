import './globals.css';

export const metadata = { title: 'Loopd', description: 'Wallet-native loyalty platform' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
