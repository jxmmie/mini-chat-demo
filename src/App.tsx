
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login_page'
import Chat_page from './pages/Chat_page'


const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/chat',
    element: <Chat_page />
  },
  //ถ้าพิมพ์ path อื่นที่ไม่ใช่ /login จะไปหน้า login
  {
    path: '*',
    element: <Login />
  }
])


function App() {
  return <RouterProvider router={router} />
}

export default App