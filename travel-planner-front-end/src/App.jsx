import { useState, useContext } from 'react'
import { Route, Routes } from 'react-router'
import './App.css'
import NavBar from './components/NavBar/NavBar'
import SignUpForm from './components/SignUpForm/SignUpForm'
import SignInForm from './components/SignInForm/SignInForm'
import Landing from './components/Landing/Landing'
import Dashboard from './components/Dashboard/Dashboard'
import UsersList from './components/Users/UserList'
import UserProfile from './components/Users/UserProfile'
import { UserContext } from './context/UserContext'

function App() {
  const { user } = useContext(UserContext)

  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={user ? <Dashboard /> : <Landing />} />
        <Route path='/sign-up' element={<SignUpForm />} />
        <Route path='/sign-in' element={<SignInForm />} />
        <Route path='/users' element={<UsersList />} />
        <Route path='/users/:userId' element={<UserProfile />} />
      </Routes>
    </>
  )
}

export default App