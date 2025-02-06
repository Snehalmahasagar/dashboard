"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { auth,db } from "@/lib/firebase"
import { Sidebar } from "@/components/Sidebar"
import { TicketForm } from "@/components/TicketForm"
import { Button } from "@/components/ui/button"

type Ticket = {
  id: string
  title: string
  description: string
  priority: string
  status: string
  createdBy: string
  assignedTo?: string
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
        const q = query(collection(db, "tickets"), where("createdBy", "==", user.uid))
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const ticketsData: Ticket[] = []
          querySnapshot.forEach((doc) => {
            ticketsData.push({ id: doc.id, ...doc.data() } as Ticket)
          })
          setTickets(ticketsData)
        })
        return () => unsubscribeSnapshot()
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleCreateTicket = () => {
    setIsFormOpen(true)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h3 className="text-gray-700 text-3xl font-medium">Dashboard</h3>
            <div className="mt-8">
              <Button onClick={handleCreateTicket}>Create Ticket</Button>
            </div>
            {isFormOpen && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Ticket</h3>
                    <div className="mt-2 px-7 py-3">
                      <TicketForm userId={user.uid} onClose={() => setIsFormOpen(false)} />
                    </div>
                    <div className="items-center px-4 py-3">
                      <Button onClick={() => setIsFormOpen(false)}>Close</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col mt-8">
              <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            <div className="text-sm leading-5 font-medium text-gray-900">{ticket.title}</div>
                            <div className="text-sm leading-5 text-gray-500">{ticket.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                            {ticket.priority}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

