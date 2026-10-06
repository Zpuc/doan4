import { Navigate, Route, Routes } from 'react-router-dom'

export default function AppRoutes({ home, login, product, admin }) {
  return <Routes>
    <Route path="/" element={home} />
    <Route path="/dang-nhap" element={login} />
    <Route path="/san-pham/:id" element={product} />
    <Route path="/admin" element={admin} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}