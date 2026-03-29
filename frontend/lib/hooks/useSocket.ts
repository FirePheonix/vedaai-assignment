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
        retrieving: 5,
        generating: 10,
        validating: 90,
        saving: 95,
      }
      setJobProgress(progressMap[step] ?? 50)
    })

    socket.on("job:stream:start", ({ totalQuestions }: { totalQuestions: number }) => {
      useAssignmentStore.getState().setTotalQuestions(totalQuestions)
    })

    socket.on("job:stream:text", ({ text }: { text: string; progress: number }) => {
      useAssignmentStore.getState().setCurrentStreamText(text)
    })

    socket.on(
      "job:stream:question",
      ({
        question,
        sectionId,
        sectionTitle,
        questionType,
      }: {
        question: {
          id: string
          text: string
          difficulty: "Easy" | "Moderate" | "Challenging"
          marks: number
          options?: string[]
        }
        sectionId: string
        sectionTitle: string
        questionType: string
      }) => {
        useAssignmentStore.getState().addStreamedQuestion({
          ...question,
          sectionId,
          sectionTitle,
          questionType,
        })
      }
    )

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
