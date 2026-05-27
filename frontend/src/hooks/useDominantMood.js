import { useMemo } from "react";

export function useDominantMood(userMoods) {
  const dominantMood = useMemo(() => {
    if (!userMoods || userMoods.length === 0) return null;

    const count = {};

    userMoods.forEach((mood) => {
      count[mood.slug] = (count[mood.slug] || 0) + 1;
    });

    const mostFrequentSlug = Object.keys(count).reduce((a, b) =>
      count[a] > count[b] ? a : b
    );

    // devolvemos el objeto completo del mood
    return userMoods.find(m => m.slug === mostFrequentSlug);
  }, [userMoods]);

  return dominantMood;
}