"use client"

import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { useAssignmentStore } from "@/store/assignmentStore"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export function useSocket(assignmentId: string | null) {
  const socketRef = useRef<Socket | null>(null)
  const { setJobProgress, addJobStep, setJobStatus, setError } = useAssignmentStore()

  useEffect(() => {
    if (!assignmentId) return

    const socket = io(API_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("join:job", assignmentId)
    })

    socket.on("job:progress", ({ step, message }: { step: string; message: string }) => {
      addJobStep(message)
      const progressMap: Record<string, number> = {
        generating: 30,
        validating: 70,
        saving: 90,
      }
      setJobProgress(progressMap[step] ?? 50)
    })

    socket.on("job:done", ({ paperId }: { paperId: string }) => {
      setJobProgress(100)
      setJobStatus("done")
      useAssignmentStore.getState().setPaperId(paperId)
    })

    socket.on("job:error", ({ message }: { message: string }) => {
      setError(message)
      setJobStatus("failed")
    })

    return () => {
      socket.disconnect()
    }
  }, [assignmentId, addJobStep, setJobProgress, setJobStatus, setError])
}
