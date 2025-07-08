import React from 'react'
import { LoginForm } from '@/components/login-form'
import Header from '@/components/Header'

function Login() {
  return (
    <>
      <Header burgerMenu={false} showLogout={false} />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 -mt-12 ">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              X Dental Center
            </h1>
            <p className="text-muted-foreground">
            Bright Smiles Start Here.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </>
  )
}

export default Login