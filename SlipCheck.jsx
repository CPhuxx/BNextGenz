import { useEffect, useState } from "react";
import axios from "axios";

const SlipCheck = () => {
  const [slips, setSlips] = useState([]);

  useEffect(() => {
    fetchSlips();
  }, []);

  const fetchSlips = async () => {
    try {
      const response = await axios.get("http://localhost:4001/api/topup/slipok");
      setSlips(response.data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงรายการสลิป:", error);
    }
  };

  const handleApprove = async (transactionId) => {
    await axios.put(`http://localhost:4001/api/topup/slipok/${transactionId}`, { status: "approved" });
    alert("อนุมัติสลิปสำเร็จ!");
    fetchSlips();
  };

  const handleReject = async (transactionId) => {
    await axios.put(`http://localhost:4001/api/topup/slipok/${transactionId}`, { status: "rejected" });
    alert("ปฏิเสธสลิปสำเร็จ!");
    fetchSlips();
  };

  return (
    <div>
      <h2>รายการสลิปที่รอตรวจสอบ</h2>
      {slips.length === 0 ? <p>ไม่มีสลิปรอตรวจสอบ</p> : (
        <ul>
          {slips.map((slip) => (
            <li key={slip.id}>
              <img src={`http://localhost:4001${slip.slip}`} alt="Slip" width="150" />
              <p>จำนวนเงิน: {slip.amount} บาท</p>
              <button onClick={() => handleApprove(slip.id)}>✅ อนุมัติ</button>
              <button onClick={() => handleReject(slip.id)}>❌ ปฏิเสธ</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SlipCheck;
