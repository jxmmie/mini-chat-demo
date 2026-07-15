
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'


const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
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