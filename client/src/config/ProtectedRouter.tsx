import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

type Props = {
  children?: React.ReactNode
}

function ProtectedRouter({ children }: Props) {
  const [loading, setLoading] = useState<Boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear();
      return navigate("/")
    } else {
      setLoading(true)
    }
  }, [])

  return (
    <>
      {loading ? children : null}
    </>
  )
}

export default ProtectedRouter;