import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryPanelProps {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function SummaryPanel({ summary, isLoading, error }: SummaryPanelProps) {
  const [clientTime, setClientTime] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client-side after hydration
    if (summary && !isLoading && !error) {
      setClientTime(new Date().toLocaleTimeString());
    }
    // Reset time if summary disappears or there's an error/loading state change
    // This ensures the timestamp only shows with a valid, current summary
    return () => {
      setClientTime(null); 
    };
  }, [summary, isLoading, error]); // Rerun if these props change

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center p-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-700 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-blue-700 dark:text-blue-300 font-medium text-center">
              Generating summary, please wait...
            </p>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70 text-center">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 dark:text-red-300 text-lg flex items-center gap-2">
              ❌ Error Generating Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                {error}
              </p>
            </div>
            <div className="mt-3 text-xs text-red-600 dark:text-red-400">
              <p>Try selecting a different PDF or check your connection.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center p-8 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Select a PDF and click Generate Summary to see the summary here.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a document from the sidebar to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50/30 to-blue-50/30 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-700 dark:text-green-300 text-lg flex items-center gap-2">
            ✅ Summary Generated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white/70 dark:bg-gray-900/50 border border-green-200/50 dark:border-green-800/50 rounded-lg p-4 shadow-sm">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {/* Using a div for the summary text with pre-wrap for potentially better control with prose if needed */}
              <div className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed text-sm overflow-x-auto">
                {summary}
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center text-xs text-green-600 dark:text-green-400">
            <span>Summary completed successfully</span>
            {/* Render clientTime only if it's set (i.e., on the client after mount) */}
            {clientTime && <span>{clientTime}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}