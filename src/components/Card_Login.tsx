// src/components/Card_Login.tsx
import React from 'react'

const Card_Login: React.FC = () => {
  return (
    <div className="card w-120 bg-base-100 shadow-2xl border border-gray-100 p-8 text-center justify-center">
      
      {/* ส่วนหัวของการ์ด */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Login</h1>
        <label className="floating-label flex flex-col gap-4 mb-10 justify-center items-center">
      
        <input type="text" placeholder="mail@site.com" className="input input-md w-60" />
        <input type="password" placeholder="Password" className="input input-md w-60" />
        <button className="btn btn-primary w-60">Login</button>
        </label>

      {/* ปุ่ม Login ด้วย Google (แก้สี fill ซ้ำซ้อนเรียบร้อยแล้วพี่!) */}
      <button className="btn btn-outline btn-primary flex items-center justify-center gap-2 w-60 hover:scale-105 transition-all">
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

    </div>
  )
}

export default Card_Login