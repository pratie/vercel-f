import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock } from 'lucide-react';

interface KeywordStatsProps {
  keywords: string[];
  mentions: any[];
}

interface KeywordCardProps {
  keyword: string;
  stats: {
    lastMonth: number;
    last24h: number;
  };
}

const KeywordCard = ({ keyword, stats }: KeywordCardProps) => (
  <Card className="p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]/80 px-3 py-1">
          {keyword}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500">24h</span>
            <span className="text-sm font-semibold text-gray-900">{stats.last24h}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500">30d</span>
            <span className="text-sm font-semibold text-gray-900">{stats.lastMonth}</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export const KeywordStats = ({ keywords, mentions }: KeywordStatsProps) => {
  // Calculate stats for each keyword
  const getKeywordStats = (keyword: string) => {
    const now = Date.now() / 1000; // Convert to Unix timestamp
    const last24h = mentions.filter(m => 
      m.created_utc >= now - 24 * 60 * 60 && 
      m.matching_keywords?.includes(keyword)
    ).length;
    
    const lastMonth = mentions.filter(m => 
      m.created_utc >= now - 30 * 24 * 60 * 60 && 
      m.matching_keywords?.includes(keyword)
    ).length;

    return { last24h, lastMonth };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Keywords</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {keywords.map((keyword, index) => (
          <KeywordCard
            key={index}
            keyword={keyword}
            stats={getKeywordStats(keyword)}
          />
        ))}
      </div>
    </div>
  );
};

export default KeywordStats;
