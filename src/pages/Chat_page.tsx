import React, { useState, useEffect, useRef } from 'react'
import Header_component from '../components/Header_component'
import { auth, db } from '../firebase.ts' 
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, where, addDoc, orderBy, serverTimestamp, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore'
import { getDatabase, ref, onValue, set, onDisconnect } from "firebase/database"

type Props = {}

function Chat_page({}: Props) {
  const navigate = useNavigate()
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true)
  
  const [usersList, setUsersList] = useState<any[]>([])
  const [onlineStatusMap, setOnlineStatusMap] = useState<Record<string, { state: string, lastChanged: number }>>({})
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // ใช้ติดตามว่าผู้ใช้อยู่ใกล้ล่างสุดของแชทหรือไม่ (เพื่อตัดสินใจว่าจะ auto-scroll หรือไม่)
  const isNearBottomRef = useRef<boolean>(true)
  // ใช้บอกว่านี่คือการโหลดข้อความครั้งแรกของห้องนี้หรือไม่ (เพิ่งเปิดห้อง)
  const isInitialLoadRef = useRef<boolean>(true)
  
  // เก็บคะแนนแจ้งเตือนแยกตาม UID ของเพื่อน (ดึงมาจาก Firestore โดยตรง)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  //  ตรวจสอบ Login
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/')
      } else {
        setLoadingAuth(false)
      }
    })
    return () => unsubscribeAuth()
  }, [navigate])

  //  จัดการสถานะออนไลน์ของตัวเอง (Realtime DB)
  useEffect(() => {
    if (loadingAuth || !auth.currentUser) return
    const currentUser = auth.currentUser
    const dbRT = getDatabase()
    const connectedRef = ref(dbRT, ".info/connected")
    const userStatusRef = ref(dbRT, `/status/${currentUser.uid}`)

    const unsubscribeConnected = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return
      onDisconnect(userStatusRef).set({ state: "offline", lastChanged: Date.now() }).then(() => {
        set(userStatusRef, { state: "online", lastChanged: Date.now() })
      })
    })
    return () => unsubscribeConnected()
  }, [loadingAuth])

  //  ดึงรายชื่อเพื่อนทุกคนจาก Firestore
  useEffect(() => {
    if (loadingAuth || !auth.currentUser) return
    const currentUser = auth.currentUser
    const usersCollection = collection(db, "users")
    const q = query(usersCollection, where("uid", "!=", currentUser.uid))

    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const users: any[] = []
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })
      setUsersList(users)
    })
    return () => unsubscribeUsers()
  }, [loadingAuth])

  //  ดึงสถานะการออนไลน์จาก Realtime DB
  useEffect(() => {
    if (loadingAuth) return
    const dbRT = getDatabase()
    const allStatusRef = ref(dbRT, "/status")

    const unsubscribeStatus = onValue(allStatusRef, (snapshot) => {
      setOnlineStatusMap(snapshot.val() || {})
    })
    return () => unsubscribeStatus()
  }, [loadingAuth])

  // ตรวจสอบโครงสร้างลิงก์รูปโปรไฟล์
  const displayUsers = usersList.map(user => {
    const statusInfo = onlineStatusMap[user.uid]
    const hasValidPhoto = user.photoURL && user.photoURL.trim() !== "" && user.photoURL.startsWith('http')
    
    return {
      ...user,
      photoURL: hasValidPhoto ? user.photoURL : null,
      isOnline: statusInfo?.state === "online",
      lastChanged: statusInfo?.lastChanged || null
    }
  })

  const selectedUser = displayUsers.find(u => u.uid === selectedUserId)

  // ฟังก์ชันช่วยเลื่อนไปล่างสุด
  const scrollToBottom = (smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  // ติดตามตำแหน่ง scroll ของผู้ใช้ เพื่อรู้ว่ากำลังอยู่ใกล้ล่างสุดหรือเลื่อนขึ้นไปอ่านข้อความเก่า
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    const threshold = 80 // px จากขอบล่าง ถือว่า "อยู่ล่างสุด"
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottomRef.current = distanceFromBottom < threshold
  }

  // เลือกห้องแชท: เคลียร์ notification ทันทีแบบ optimistic
  const handleSelectUser = (uid: string) => {
    setSelectedUserId(uid)
    setUnreadCounts(prev => ({ ...prev, [uid]: 0 }))
  }

  //  ดึงข้อความแชท และ อัปเดตข้อความที่ยังไม่ได้อ่านให้เป็น `isRead: true`
  useEffect(() => {
    const currentUser = auth.currentUser
    if (!currentUser || !selectedUserId) {
      setMessages([])
      return
    }

    // ห้องใหม่ -> รีเซ็ตสถานะ initial load / ตำแหน่ง scroll
    isInitialLoadRef.current = true
    isNearBottomRef.current = true

    const chatRoomId = currentUser.uid < selectedUserId 
      ? `${currentUser.uid}_${selectedUserId}`
      : `${selectedUserId}_${currentUser.uid}`

    const messagesRef = collection(db, "chats", chatRoomId, "messages")
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"))

    // ฟังก์ชันสำหรับเคลียร์ข้อความฝั่งเพื่อนส่งมาให้เป็น อ่านแล้ว
    const markAsRead = async () => {
      const unreadQuery = query(
        messagesRef,
        where("senderId", "==", selectedUserId),
        where("isRead", "==", false)
      )
      const querySnapshot = await getDocs(unreadQuery)
      if (querySnapshot.empty) return

      const batch = writeBatch(db)
      querySnapshot.forEach((messageDoc) => {
        batch.update(messageDoc.ref, { isRead: true })
      })
      await batch.commit()
    }

    // เรียกทำงานครั้งแรกที่เปิดห้อง
    markAsRead()

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: any[] = []
      let hasNewUnread = false
      let shouldScroll = false

      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        msgs.push({ id: docSnap.id, ...data })

        if (data.senderId === selectedUserId && data.isRead === false) {
          hasNewUnread = true
        }
      })
      setMessages(msgs)

      if (isInitialLoadRef.current) {
        // เปิดห้องครั้งแรก -> เลื่อนลงล่างสุดเสมอ
        shouldScroll = true
        isInitialLoadRef.current = false
      } else {
        // ไม่ใช่การโหลดครั้งแรก -> เช็คเฉพาะ "ข้อความที่เพิ่มใหม่จริงๆ"
        const addedChanges = snapshot.docChanges().filter(change => change.type === 'added')

        addedChanges.forEach((change) => {
          const msgData: any = change.doc.data()
          const isMyOwnMessage = msgData.senderId === currentUser.uid

          // เลื่อนลงล่างสุดเมื่อ: เราเป็นคนส่งข้อความเอง หรือผู้ใช้อยู่ใกล้ล่างสุดอยู่แล้ว
          if (isMyOwnMessage || isNearBottomRef.current) {
            shouldScroll = true
          }
        })
      }

      if (hasNewUnread) {
        markAsRead()
      }

      if (shouldScroll) {
        setTimeout(() => scrollToBottom(true), 100)
      }
    })

    return () => unsubscribeMessages()
  }, [selectedUserId])

  //  ระบบนับจำนวนแจ้งเตือนที่แท้จริงแบบ Realtime ด้วยเงื่อนไข isRead === false
  useEffect(() => {
    const currentUser = auth.currentUser
    if (loadingAuth || !currentUser || usersList.length === 0) return

    const unsubscribes = usersList.map((user) => {
      const chatRoomId = currentUser.uid < user.uid 
        ? `${currentUser.uid}_${user.uid}`
        : `${user.uid}_${currentUser.uid}`

      const unreadQuery = query(
        collection(db, "chats", chatRoomId, "messages"),
        where("senderId", "==", user.uid),
        where("isRead", "==", false)
      )

      return onSnapshot(unreadQuery, (snapshot) => {
        setUnreadCounts(prev => ({
          ...prev,
          [user.uid]: snapshot.size
        }))
      })
    })

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [usersList, loadingAuth])

  // 7. ส่งข้อความ
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentUser = auth.currentUser
    if (!messageText.trim() || !selectedUserId || !currentUser) return

    const chatRoomId = currentUser.uid < selectedUserId 
      ? `${currentUser.uid}_${selectedUserId}`
      : `${selectedUserId}_${currentUser.uid}`

    try {
      await addDoc(collection(db, "chats", chatRoomId, "messages"), {
        text: messageText,
        senderId: currentUser.uid,
        receiverId: selectedUserId,
        senderName: currentUser.displayName || "Unknown",
        createdAt: serverTimestamp(),
        isRead: false
      })
      setMessageText('')
      // ผู้ส่งข้อความเองควรถูกเลื่อนลงล่างสุดเสมอ
      isNearBottomRef.current = true
    } catch (err) {
      console.error("ส่งข้อความล้มเหลว: ", err)
    }
  }

  const renderAvatar = (user: any) => {
    if (user.photoURL) {
      return <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
    }
    const firstLetter = user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'
    return (
      <div className="w-full h-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
        {firstLetter}
      </div>
    )
  }

  if (loadingAuth) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-slate-50 text-gray-500 font-bold">
        <span className="loading loading-spinner loading-lg text-purple-600"></span>
      </div>
    )
  }

  return (
    <div className="w-screen min-h-screen justify-center items-center flex bg-slate-50 relative overflow-hidden animate-fade-in">
      {/* ล็อคขนาดกล่องใหญ่ และซ่อนส่วนที่เกินออก */}
      <div className="w-[950px] h-[800px] bg-white/40 backdrop-blur-xl shadow-2xl border border-white/40 flex flex-col rounded-none z-10 overflow-hidden">
        <Header_component />


        <div className="flex-1 w-full flex flex-row p-2 bg-transparent gap-1 overflow-hidden">

          <div className="w-[320px] h-full bg-gray-100 border border-gray-100 flex flex-col overflow-hidden">
            <div className="w-full h-20 bg-white border-b border-gray-100 flex items-center justify-between p-4 flex-shrink-0">
              <span className="text-gray-800 font-bold text-sm truncate">{auth.currentUser?.displayName || "Me"}</span>
              <div className="avatar">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-600 text-white flex items-center justify-center font-bold">
                  {auth.currentUser?.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="me" />
                  ) : (
                    (auth.currentUser?.displayName || "M").charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>

          
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
              {displayUsers.map((user) => {
                const count = unreadCounts[user.uid] || 0
                return (
                  <div 
                    key={user.id}
                    onClick={() => handleSelectUser(user.uid)}
                    className={`w-full h-20 rounded-xl flex flex-row items-center p-3 cursor-pointer border transition-all flex-shrink-0 ${
                      selectedUserId === user.uid ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-gray-800 hover:bg-slate-950 hover:text-white border-gray-100'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {renderAvatar(user)}
                      {user.isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>}
                    </div>
                    <div className="flex-1 ml-3 truncate pr-2">
                      <span className="font-bold text-sm block truncate">{user.displayName}</span>
                      <span className="text-xs opacity-60">{user.isOnline ? "Online" : "Offline"}</span>
                    </div>

                    {count > 0 && (
                      <div className="flex-shrink-0 bg-red-500 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                        {count}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        
          <div className="flex-1 h-full bg-white border border-gray-100 flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <div className="h-20 border-b border-gray-200 flex items-center gap-4 px-6 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {renderAvatar(selectedUser)}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedUser.displayName}</h2>
                    <p className="text-xs text-gray-400">{selectedUser.isOnline ? "Online" : "Offline"}</p>
                  </div>
                </div>

                {/* กล่องข้อความแชท (จะขึ้น Scrollbar อัตโนมัติเมื่อข้อความล้น) */}
                <div
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-3"
                >
                  {messages.map((msg) => {
                    const isMe = msg.senderId === auth.currentUser?.uid
                    return (
                      <div key={msg.id} className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
                        <div className={`chat-bubble max-w-md ${isMe ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          {msg.text}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="h-20 border-t border-gray-200 flex items-center gap-3 px-5 bg-white flex-shrink-0">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-11 rounded-full border border-gray-200 px-5 outline-none focus:border-purple-500 text-gray-800"
                  />
                  <button type="submit" className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center text-white">➤</button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                💬 <p className="text-sm font-medium mt-2">กรุณาเลือกเพื่อนเพื่อเริ่มต้นแชท</p>
              </div>
            )}
          </div> 

        </div>
      </div>
    </div>
  )
}

export default Chat_page