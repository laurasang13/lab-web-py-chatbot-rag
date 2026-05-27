import { useParams } from "react-router-dom"
import { moods } from "../context/Moods.js"
import { useEffect, useState, useRef } from "react"
import { analyzeMood } from "../services/Api.js"
import { moodDataFallback } from "../context/FallBackMoodsData.js"


export function useFetch(moodName, moodId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const hasFetched = useRef(false) 

  useEffect(() => {
    if (hasFetched.current) return // evita doble llamada
    hasFetched.current = true

    async function fetchData() {
      console.log("useFetch called with:", moodName, moodId)

      if (!moodName) {
        setLoading(false)
        return
      }

      try {
        const result = await analyzeMood(moodName)

        if (!result) {
          throw new Error("Something is wrong")
        }

        setData(result)
      } catch (err) {
        console.error(err)
        setError(true)

        const fallback = moodDataFallback.find(m => m.id === moodId)
        setData(fallback)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [moodName, moodId])

  return { data, loading, error }
}