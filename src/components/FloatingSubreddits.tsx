'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface FloatingSubreddit {
  id: number;
  name: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  direction: number;
}

const POPULAR_SUBREDDITS = [
  'r/news', 'r/technology', 'r/science', 'r/worldnews', 'r/politics',
  'r/gaming', 'r/movies', 'r/music', 'r/books', 'r/art',
  'r/photography', 'r/food', 'r/cooking', 'r/fitness', 'r/health',
  'r/programming', 'r/webdev', 'r/javascript', 'r/python', 'r/react',
  'r/entrepreneur', 'r/startups', 'r/business', 'r/marketing', 'r/sales',
  'r/investing', 'r/personalfinance', 'r/stocks', 'r/cryptocurrency', 'r/economy',
  'r/DIY', 'r/lifeprotips', 'r/productivity', 'r/getmotivated', 'r/selfimprovement',
  'r/travel', 'r/earthporn', 'r/cityporn', 'r/spaceporn', 'r/natureporn',
  'r/askreddit', 'r/explainlikeimfive', 'r/todayilearned', 'r/showerthoughts', 'r/unpopularopinion',
  'r/mildlyinteresting', 'r/oddlysatisfying', 'r/dataisbeautiful', 'r/coolguides', 'r/lifehacks',
  'r/sports', 'r/nba', 'r/nfl', 'r/soccer', 'r/baseball',
  'r/android', 'r/apple', 'r/tesla', 'r/spacex', 'r/futurology'
];

interface FloatingSubredditsProps {
  mousePosition?: { x: number; y: number };
  count?: number;
}

export default function FloatingSubreddits({ mousePosition, count = 35 }: FloatingSubredditsProps) {
  const [subreddits, setSubreddits] = useState<FloatingSubreddit[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize subreddits
  useEffect(() => {
    if (dimensions.width === 0) return;

    const newSubreddits: FloatingSubreddit[] = [];
    const shuffled = [...POPULAR_SUBREDDITS].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      newSubreddits.push({
        id: i,
        name: shuffled[i],
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
        speed: Math.random() * 0.5 + 0.2, // 0.2 to 0.7
        direction: Math.random() * Math.PI * 2
      });
    }
    
    setSubreddits(newSubreddits);
  }, [dimensions, count]);

  // Animation loop
  useEffect(() => {
    if (!subreddits.length) return;

    const animate = () => {
      setSubreddits(prev => prev.map(subreddit => {
        let newX = subreddit.x + Math.cos(subreddit.direction) * subreddit.speed;
        let newY = subreddit.y + Math.sin(subreddit.direction) * subreddit.speed;
        let newDirection = subreddit.direction;

        // Bounce off edges
        if (newX <= 0 || newX >= dimensions.width) {
          newDirection = Math.PI - subreddit.direction;
          newX = Math.max(0, Math.min(dimensions.width, newX));
        }
        if (newY <= 0 || newY >= dimensions.height) {
          newDirection = -subreddit.direction;
          newY = Math.max(0, Math.min(dimensions.height, newY));
        }

        return {
          ...subreddit,
          x: newX,
          y: newY,
          direction: newDirection
        };
      }));
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [subreddits.length, dimensions]);

  // Mouse interaction effect
  const getMouseInfluence = useCallback((subreddit: FloatingSubreddit) => {
    if (!mousePosition) return { x: 0, y: 0, scale: 1, opacity: subreddit.opacity };

    const distance = Math.sqrt(
      Math.pow(mousePosition.x - subreddit.x, 2) + 
      Math.pow(mousePosition.y - subreddit.y, 2)
    );
    
    const maxDistance = 150;
    const influence = Math.max(0, 1 - distance / maxDistance);
    
    const pushX = (subreddit.x - mousePosition.x) * influence * 0.1;
    const pushY = (subreddit.y - mousePosition.y) * influence * 0.1;
    
    return {
      x: pushX,
      y: pushY,
      scale: 1 + influence * 0.3,
      opacity: Math.min(0.8, subreddit.opacity + influence * 0.4)
    };
  }, [mousePosition]);

  if (!dimensions.width || !subreddits.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {subreddits.map((subreddit) => {
        const mouseEffect = getMouseInfluence(subreddit);
        
        return (
          <motion.div
            key={subreddit.id}
            className="absolute select-none font-mono text-gray-400/50 whitespace-nowrap"
            style={{
              left: subreddit.x + mouseEffect.x,
              top: subreddit.y + mouseEffect.y,
              fontSize: `${0.75 + subreddit.size * 0.5}rem`,
              opacity: mouseEffect.opacity,
              transform: `scale(${mouseEffect.scale * subreddit.size})`,
              filter: 'blur(0.5px)',
              fontWeight: 400,
              textShadow: '0 0 8px rgba(156, 163, 175, 0.2)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: mouseEffect.opacity }}
            transition={{ duration: 0.3 }}
          >
            {subreddit.name}
          </motion.div>
        );
      })}
    </div>
  );
}