"use client"

import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { useAssignmentStore } from "@/store/assignmentStore"
import type { QuestionPaper } from "@/lib/schemas"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

interface JobProgressEvent {
  jobId: string
  progress: number
  step: string
}

interface JobDoneEvent {
  jobId: string
  paper: QuestionPaper
}

interface JobFailedEvent {
  jobId: string
  message: string
}

/**
 * This hook connects to the backend Socket.IO server and listens for job events.
 */
export function useSocket(jobId: string | null) {
  const socketRef = useRef<Socket | null>(null)
  const { setJobProgress, addJobStep, setJobStatus, setPaper, setError } = useAssignmentStore()

  useEffect(() => {
    if (!jobId || !API_URL) return

    const socket = io(API_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("subscribe:job", { jobId })
    })

    socket.on("job:progress", ({ progress, step }: JobProgressEvent) => {
      setJobProgress(progress)
      addJobStep(step)
    })

    socket.on("job:done", ({ paper }: JobDoneEvent) => {
      setPaper(paper)
      setJobStatus("done")
    })

    socket.on("job:failed", ({ message }: JobFailedEvent) => {
      setError(message)
      setJobStatus("failed")
    })

    socket.on("connect_error", () => {
      // Silently fall back — mock simulation stays active
    })

    return () => {
      socket.disconnect()
    }
  }, [jobId, setJobProgress, addJobStep, setJobStatus, setPaper, setError])
}
