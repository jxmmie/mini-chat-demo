// src/components/Card_Login.tsx
import React from 'react'
import { loginWithGoogle } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Card_Login: React.FC = () => {
  const navigate = useNavigate(); // ใช้ useNavigate จาก react-router-dom เพื่อเปลี่ยนหน้า
  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      alert(`ยินดีต้อนรับ! เข้าใช้งานในชื่อ: ${user.displayName}`);
      navigate('/chat'); // เปลี่ยนหน้าไปยังหน้าหลักของแอปหลังจากล็อกอินสำเร็จ
      
      // พอสำเร็จแล้ว ข้อมูลผู้ใช้คนนี้จะไปโผล่ใน Firebase Console ฝั่ง Firestore ทันที
    } catch (error) {
      alert("ล็อกอินล้มเหลว!");
    }
  };
  return (
    // 💡 การ์ดหลัก: ขอบโค้งมนพิเศษ (rounded-3xl), มีเงาฟุ้งนุ่มนวล (shadow-xl) 
    <div className="card w-full max-w-md bg-base-100 shadow-xl border border-gray-100 p-10 flex flex-col items-center">
      
  
      <div className="flex flex-col items-center gap-3 mb-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner animate-bounce">
          💬
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-2">
          Mini Realtime Chat
        </h1>
      
      </div>

  

   
      <button onClick={handleLogin} className="btn btn-outline border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-3 w-full h-12 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </button>

    
      <div className="mt-8 text-center">
        <span className="text-xs text-gray-400 flex items-center gap-1">
   
        </span>
      </div>

    </div>
  )
}

export default Card_Login