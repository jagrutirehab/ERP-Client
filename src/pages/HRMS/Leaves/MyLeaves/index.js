import React from 'react'
import { getMyLeavesHistory } from '../../../../helpers/backend_helper'
import { useEffect } from 'react'
import { useState } from 'react'

const MyLeaves = () => {

  const [leavesData, setLeavesData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMyLeavesHistory();
      setLeavesData(res);
    }
    fetchData();
  },[]);

  console.log("leavesData", leavesData)
  return (
    <div>MyLeaves</div>
  )
}

export default MyLeaves