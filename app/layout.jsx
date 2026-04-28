import './globals.css';

export const metadata = { title: 'Loyalr', description: 'Wallet-native loyalty platform' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
