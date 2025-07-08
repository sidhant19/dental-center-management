import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthContext } from "@/contexts/AuthContext"
import { useContext, useState } from "react"
import { Navigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}) {
  const [error, setError] = useState(null)
  const { userLogin } = useContext(AuthContext)

  function handleSubmit(event) {
    event.preventDefault()
    const email = event.target.email.value
    const password = event.target.password.value
    const result = userLogin(email, password)
    if (result.success) {
      if (result.user.role === "Admin") return <Navigate to="/admin" />
      else if (result.user.role === "Patient") return <Navigate to="/patient" />
      setError(null) 
    } else setError(result.message)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email & password below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
              {error?<div className="text-red-500 text-sm text-center">
                  {error}
                </div>: null}
              <div className="flex flex-col gap-1">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
