// src/pages/Login.tsx
import React from 'react'
import Card_Login from '../components/Card_Login' // 1. ตรวจสอบว่านำเข้าการ์ดเข้ามาแล้ว

type Props = {}

function Login({}: Props) {
  return (
  
    <div className="flex justify-center items-center min-h-screen w-screen bg-gray-200">
        <Card_Login /> {/* 2. ใช้การ์ดที่นำเข้ามา */}
     
    </div>
  )
}

export default Login