# Realtime Mini Chat Application 💬

เว็บแอปพลิเคชันระบบแชทแบบเรียลไทม์ (End-to-End) ที่พัฒนาขึ้นเพื่อเป็นส่วนหนึ่งของ Final Project โดยเน้นการทำงานที่รวดเร็ว ลื่นไหล และดีไซน์ที่ทันสมัย

🔗 **Live Demo:** [https://mini-chat-demo.vercel.app/](https://mini-chat-demo.vercel.app/)

---

## 🚀 ฟีเจอร์เด่นของระบบ (Features)

*   **Authentication System:** ระบบลงชื่อเข้าใช้งานและรักษาความปลอดภัยข้อมูลผู้ใช้ผ่าน Firebase Authentication
*   **Realtime Chat History:** บันทึกประวัติการสนทนาและอัปเดตข้อความทันทีด้วย Cloud Firestore
*   **Message Read Status (`isRead`):** ระบบตรวจสอบสถานะการอ่านข้อความ (อ่านแล้ว/ยังไม่อ่าน) แบบเรียลไทม์
*   **User Presence Presence:** ระบบแสดงสถานะการออนไลน์ (Online/Offline Status) ของเพื่อนร่วมระบบในวินาทีนั้นๆ ด้วย Firebase Realtime Database
*   **Responsive & Modern UI:** หน้าต่างโปรแกรมรองรับการใช้งานทุกขนาดหน้าจอ สะอาดตา และยืดหยุ่น

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend**
*   **React** ร่วมกับ **TypeScript** (พัฒนาบน **Vite**) เพื่อเสริมความเสถียรและความรวดเร็วในการคอมไพล์
*   **Tailwind CSS** และ **DaisyUI** สำหรับการจัด Layout และออกแบบส่วนติดต่อผู้ใช้ (UI/UX)

### **Backend & Database (Firebase Services)**
*   **Firebase Authentication:** ระบบจัดการบัญชีผู้ใช้งาน
*   **Cloud Firestore:** ฐานข้อมูล NoSQL สำหรับเก็บประวัติแชทและโครงสร้างผู้ใช้
*   **Firebase Realtime Database:** ระบบฐานข้อมูลความเร็วสูงเพื่อตรวจเช็คสถานะการออนไลน์

---

## 💻 การติดตั้งและเปิดใช้งานโปรแกรม (Getting Started)

ทำตามขั้นตอนด้านล่างนี้เพื่อรันโปรเจกต์บนเครื่องของคุณ (Local Environment):

### 1. โคลนโปรเจกต์ (Clone Project)
```bash
git clone [https://github.com/jxmmie.git](https://github.com/jxmmie.git)
cd [ชื่อโฟลเดอร์โปรเจกต์ของคุณ]
