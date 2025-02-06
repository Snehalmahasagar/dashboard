"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { db, storage } from "@/lib/firebase" // Import Firebase Storage
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TicketFormData = {
  title: string
  description: string
  priority: string
  category: string
  contactEmail: string
  contactPhone: string
  attachment: FileList
}

export function TicketForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TicketFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true)
    try {
      // If there's an attachment, upload the file to Firebase Storage
      let attachmentUrl = null
      if (data.attachment && data.attachment[0]) {
        const file = data.attachment[0]
        const fileRef = ref(storage, `tickets/attachments/${file.name}`)
        await uploadBytes(fileRef, file)
        attachmentUrl = await getDownloadURL(fileRef)
      }

      // Add ticket data to Firestore with or without attachment URL
      await addDoc(collection(db, "tickets"), {
        ...data,
        attachment: attachmentUrl, // Store the file URL in Firestore if it exists
        createdBy: userId,
        status: "Open",
        createdAt: new Date(),
      })
      onClose()
    } catch (error) {
      console.error("Error submitting ticket:", error)
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title", { required: "Title is required" })} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description", { required: "Description is required" })} />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select onValueChange={(value) => setValue("priority", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value) => setValue("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-500">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          {...register("contactEmail", { required: "Contact email is required" })}
        />
        {errors.contactEmail && <p className="text-red-500">{errors.contactEmail.message}</p>}
      </div>

      <div>
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input id="contactPhone" {...register("contactPhone")} />
      </div>

      <div>
        <Label htmlFor="attachment">Attachment</Label>
        <Input id="attachment" type="file" {...register("attachment")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Ticket"}
      </Button>
    </form>
  )
}
