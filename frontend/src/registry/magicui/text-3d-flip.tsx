"use client"

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ElementType,
} from "react"
import { useAnimate } from "framer-motion"
import { cn } from "@/lib/utils"

const splitIntoCharacters = (text: string): string[] => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new (Intl as any).Segmenter("en", { granularity: "grapheme" })
    return Array.from(segmenter.segment(text), ({ segment }: any) => segment)
  }
  return Array.from(text)
}

const extractTextFromChildren = (children: React.ReactNode): string => {
  if (children == null) return ""
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("")
  }

  if (React.isValidElement(children)) {
    if (children.type === "br") return "\n"
    const props = children.props as Record<string, unknown>
    const childText = props?.children as React.ReactNode
    if (childText != null) {
      return extractTextFromChildren(childText)
    }
  }

  return ""
}

const ROTATION_MAP = {
  top: "rotateX(90deg)",
  right: "rotateY(90deg)",
  bottom: "rotateX(-90deg)",
  left: "rotateY(-90deg)",
} as const

const SECOND_FACE_TRANSFORMS = {
  top: "rotateX(-90deg) translateZ(0.5em)",
  right:
    "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)",
  bottom: "rotateX(90deg) translateZ(0.5em)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)",
} as const

const FRONT_FACE_TRANSFORMS = {
  top: "translateZ(0.5em)",
  bottom: "translateZ(0.5em)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
  right: "rotateY(-90deg) translateX(50%) rotateY(90deg)",
} as const

const CONTAINER_TRANSFORMS = {
  top: "translateZ(-0.5em)",
  bottom: "translateZ(-0.5em)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
  right: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
} as const

export interface Text3DFlipProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: ElementType
  className?: string
  textClassName?: string
  flipTextClassName?: string
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | number | "random"
  transition?: any
  rotateDirection?: "top" | "right" | "bottom" | "left"
  autoPlay?: boolean
  autoPlayDelay?: number
}

export const Text3DFlip = ({
  children,
  as: ElementTag = "p",
  className,
  textClassName,
  flipTextClassName,
  staggerDuration = 0.03,
  staggerFrom = "first",
  transition = { type: "spring", damping: 25, stiffness: 160 },
  rotateDirection = "top",
  autoPlay = true,
  autoPlayDelay = 500,
  ...props
}: Text3DFlipProps) => {
  const isAnimatingRef = useRef(false)
  const isMountedRef = useRef(false)
  const [scope, animate] = useAnimate()

  const rotationTransform = ROTATION_MAP[rotateDirection]

  const text = useMemo(() => {
    try {
      return extractTextFromChildren(children)
    } catch {
      return ""
    }
  }, [children])

  const lines = useMemo(() => {
    const rawLines = text.split("\n")
    return rawLines.map((lineText) => {
      const words = lineText.trim().split(/\s+/)
      return words.filter(Boolean).map((word, i, arr) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== arr.length - 1,
      }))
    })
  }, [text])

  const totalChars = useMemo(() => {
    let count = 0
    for (const line of lines) {
      for (const word of line) {
        count += word.characters.length
      }
    }
    return count
  }, [lines])

  const getStaggerDelay = useCallback(
    (index: number, count: number) => {
      if (staggerFrom === "first") return index * staggerDuration
      if (staggerFrom === "last")
        return (count - 1 - index) * staggerDuration
      if (staggerFrom === "center") {
        const center = Math.floor(count / 2)
        return Math.abs(center - index) * staggerDuration
      }
      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * count)
        return Math.abs(randomIndex - index) * staggerDuration
      }
      if (typeof staggerFrom === "number") {
        return Math.abs(staggerFrom - index) * staggerDuration
      }
      return index * staggerDuration
    },
    [staggerFrom, staggerDuration]
  )

  const triggerFlip = useCallback(async () => {
    if (isAnimatingRef.current || !scope.current || totalChars === 0) return
    isAnimatingRef.current = true

    try {
      const delays = Array.from({ length: totalChars }, (_, i) =>
        getStaggerDelay(i, totalChars)
      )

      await animate(
        ".text-3d-flip-char",
        { transform: rotationTransform },
        {
          ...transition,
          delay: (i: number) => delays[i] || 0,
        }
      )

      if (!isMountedRef.current) return

      await animate(
        ".text-3d-flip-char",
        { transform: "rotateX(0deg) rotateY(0deg)" },
        { duration: 0 }
      )
    } catch {
      // Ignore animation cancellation
    } finally {
      if (isMountedRef.current) {
        isAnimatingRef.current = false
      }
    }
  }, [totalChars, transition, getStaggerDelay, rotationTransform, animate, scope])

  useEffect(() => {
    isMountedRef.current = true

    let timer: ReturnType<typeof setTimeout> | null = null
    if (autoPlay) {
      timer = setTimeout(() => {
        if (isMountedRef.current) {
          triggerFlip()
        }
      }, autoPlayDelay)
    }

    return () => {
      isMountedRef.current = false
      isAnimatingRef.current = false
      if (timer) clearTimeout(timer)
    }
  }, [autoPlay, autoPlayDelay, triggerFlip])

  return (
    <ElementTag
      className={cn("relative flex flex-wrap cursor-pointer select-none [perspective:1000px]", className)}
      onMouseEnter={triggerFlip}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{text}</span>

      {lines.map((words, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {lineIndex > 0 && <span className="basis-full h-0 w-full block" />}
          {words.map((wordObj, wordIndex) => (
            <span key={wordIndex} className="inline-flex">
              {wordObj.characters.map((char, charIndex) => (
                <CharBox
                  key={`${lineIndex}-${wordIndex}-${charIndex}`}
                  char={char}
                  textClassName={textClassName}
                  flipTextClassName={flipTextClassName}
                  rotateDirection={rotateDirection}
                />
              ))}
              {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
            </span>
          ))}
        </React.Fragment>
      ))}
    </ElementTag>
  )
}

interface CharBoxProps {
  char: string
  textClassName?: string
  flipTextClassName?: string
  rotateDirection: "top" | "right" | "bottom" | "left"
}

const CharBox = memo(
  ({
    char,
    textClassName,
    flipTextClassName,
    rotateDirection,
  }: CharBoxProps) => (
    <span
      className="text-3d-flip-char inline-block"
      style={{
        transformStyle: "preserve-3d",
        transform: CONTAINER_TRANSFORMS[rotateDirection],
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        fontSize: "inherit",
        lineHeight: "inherit",
        fontFamily: "inherit",
        fontWeight: "inherit",
      }}
    >
      <span
        className={cn("relative inline-block", textClassName)}
        style={{
          transformStyle: "preserve-3d",
          transform: FRONT_FACE_TRANSFORMS[rotateDirection],
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          fontSize: "inherit",
          lineHeight: "inherit",
          fontFamily: "inherit",
          fontWeight: "inherit",
        }}
      >
        {char}
      </span>
      <span
        className={cn(
          "absolute top-0 left-0 inline-block",
          flipTextClassName
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: SECOND_FACE_TRANSFORMS[rotateDirection],
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          fontSize: "inherit",
          lineHeight: "inherit",
          fontFamily: "inherit",
          fontWeight: "inherit",
        }}
      >
        {char}
      </span>
    </span>
  )
)

CharBox.displayName = "CharBox"
Text3DFlip.displayName = "Text3DFlip"

export default Text3DFlip
