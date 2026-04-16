import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";
import "./Scan.css";

const Scan = ({ onScanResult }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        disableFlip: true,
        rememberLastUsedCamera: true,
        videoConstraints: {
          facingMode: { ideal: "environment" }
        },
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        onScanResult(decodedText);
      },
      (error) => {},
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .then(() => {
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error("Failed to clear scanner:", err);
          });
      }
    };
  }, [onScanResult]);

  return (
    <div className="scan-container">
      <div id="reader"></div>
    </div>
  );
};

export default Scan;
