'use client';
import { QRCodeSVG } from 'qrcode.react';

export default function QRDisplay({ value }) {
  return (
    <div className="flex justify-center">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <QRCodeSVG value={value} size={200} />
      </div>
    </div>
  );
}
