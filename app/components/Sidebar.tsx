import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { Button } from "../components/ui/button"

export function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <div className="flex flex-col h-full p-3 w-60 bg-gray-800 text-gray-100">
      <div className="space-y-3">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <div className="flex-1">
          <ul className="pt-2 pb-4 space-y-1 text-sm">
            <li className="rounded-sm">
              <Link href="/dashboard" className="flex items-center p-2 space-x-3 rounded-md">
                <span>Tickets</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center p-2 mt-12 space-x-4 justify-self-end">
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>
    </div>
  )
}

