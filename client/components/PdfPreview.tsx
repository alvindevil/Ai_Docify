interface PdfPreviewProps {
  pdfUrl: string;
}

export default function PdfPreview({ pdfUrl }: PdfPreviewProps) {
  return (
    <div className="w-full h-[80vh] border rounded overflow-hidden">
      <iframe
        src={pdfUrl}
        title="PDF Viewer"
        width="100%"
        height="100%"
        className="border-none"
      />
    </div>
  );
}
