import React from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface InsightsProps {
  insights: string[];
}

const Insights: React.FC<InsightsProps> = ({ insights }) => {
  return (
    <Card className="p-6 text-foreground flex flex-col h-[710px]">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold">Financial Insights</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-base text-gray-700 dark:text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Insights;