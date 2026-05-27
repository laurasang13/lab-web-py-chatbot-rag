import { useState, useEffect } from "react";

export function useUserMoods() {
  const [savedMoods, setSavedMoods] = useState([]);
  
  // cargar desde LocalStorage
  useEffect(() => {
    const history = localStorage.getItem("userMoods");
    if (history) {
      setSavedMoods(JSON.parse(history));
    }
  }, []);

  // añadir nuevo mood
    const addMood = (newMood) => {
  setSavedMoods((prevMoods) => {
    const updatedHistory = [...prevMoods, newMood];
    localStorage.setItem("userMoods", JSON.stringify(updatedHistory));
    return updatedHistory;
  });
};
    // Borrar los moods
    const clearMoods = () => {
    setSavedMoods([]);
    localStorage.removeItem("userMoods");
  };


// solo se enseña lo q se almacena
return {
    savedMoods,
    addMood,
    clearMoods,
    };
}