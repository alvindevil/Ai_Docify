// Ai_Docify/client/components/SummaryPanel.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming you use shadcn Card

interface SummaryPanelProps {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function SummaryPanel({ summary, isLoading, error }: SummaryPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500 animate-pulse">Generating summary, please wait...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">Error Generating Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {/* This will now display the more detailed message from the server's JSON response */}
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500">Select a PDF and click Generate Summary to see the summary here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Preserve whitespace and newlines from the summary */}
        <pre className="text-sm whitespace-pre-wrap font-sans">{summary}</pre>
      </CardContent>
    </Card>
  );
}