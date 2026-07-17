import React from 'react'
import { auth, db } from '../firebase.ts' // 💡 อย่าลืมเช็ก path ดึง auth กับ db ให้ถูกนะพี่
import { doc, updateDoc } from 'firebase/firestore'
import { getDatabase, ref, set } from "firebase/database"
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'

type Props = {}

function Header_component({}: Props) {
  const navigate = useNavigate()

  
  const handleLogout = async () => {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), { isOnline: false })
        const dbRT = getDatabase()
        await set(ref(dbRT, `/status/${currentUser.uid}`), {
          state: "offline",
          lastChanged: Date.now()
        })
      }
      await signOut(auth)
      navigate('/') // เปลี่ยนหน้าไปยังหน้าล็อกอินหลังจากออกจากระบบ
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      {/* 💡 ปรับ w-full เพื่อให้ยืดเต็มบอร์ด และใช้ justify-between จัดซ้าย-ขวา */}
      <div className="w-full h-16 bg-white items-center flex shadow-md border-b border-gray-100 flex flex-row justify-between px-6">
        
        {/* ฝั่งซ้าย: โลโก้และชื่อแอป */}
        <div className="flex items-center gap-2">
          <span className='italic text-2xl font-black text-slate-800'>Mini Chat</span>
          <span className='text-xl'>🌎</span>
        </div>

        {/* ฝั่งขวา: ปุ่ม Logout ไอคอนนิ่ง ๆ เรียบง่าย */}
        <div className="flex items-center">
          <button 
            onClick={handleLogout}
            title="Logout"
            className="italic text-gray-400 hover:text-red-500 text-xl p-2 rounded-lg hover:bg-red-50 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
          logout
          </button>
        </div>

      </div>
    </>
  )
}

export default Header_component