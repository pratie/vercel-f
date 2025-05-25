import React from 'react';

interface HighlightedTextProps {
  text: string;
  keywords: string[];
}

export function HighlightedText({ text, keywords }: HighlightedTextProps) {
  if (!text || !keywords.length) return <>{text}</>;

  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return <>{text}</>;
}
