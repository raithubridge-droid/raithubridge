"use client"

import * as React from "react"
import { ImageIcon, Video, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MAX_PHOTOS = 6
const MAX_VIDEOS = 3

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function MediaList({
  files,
  type,
  onClear,
}: {
  files: File[]
  type: "photo" | "video"
  onClear: () => void
}) {
  if (!files.length) {
    return null
  }

  const Icon = type === "photo" ? ImageIcon : Video

  return (
    <div className="rounded-xl border border-border/70 bg-background/75 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {files.length} {type}
          {files.length === 1 ? "" : "s"} selected
        </p>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onClear}>
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {files.map((file) => (
          <li
            key={`${file.name}-${file.size}`}
            className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm"
          >
            <Icon className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{file.name}</span>
            <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FarmerProductForm() {
  const [submitted, setSubmitted] = React.useState(false)
  const [photos, setPhotos] = React.useState<File[]>([])
  const [videos, setVideos] = React.useState<File[]>([])
  const [message, setMessage] = React.useState<string | null>(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)
  const videoInputRef = React.useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    setMessage(null)
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (files.length > MAX_PHOTOS) {
      setMessage(`Select up to ${MAX_PHOTOS} product photos.`)
      event.target.value = ""
      return
    }

    setPhotos(files)
    setMessage(null)
  }

  function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (files.length > MAX_VIDEOS) {
      setMessage(`Select up to ${MAX_VIDEOS} product videos.`)
      event.target.value = ""
      return
    }

    setVideos(files)
    setMessage(null)
  }

  function clearPhotos() {
    setPhotos([])
    if (photoInputRef.current) {
      photoInputRef.current.value = ""
    }
  }

  function clearVideos() {
    setVideos([])
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-primary/25 bg-primary/5 px-6 py-10 text-center shadow-md"
        role="status"
      >
        <p className="text-2xl font-semibold text-foreground">
          Product submitted for review.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          This is a static preview. The submission will appear in My Submissions once live
          saving is connected.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-8 h-11 rounded-xl px-6 text-base"
          onClick={() => {
            setSubmitted(false)
            clearPhotos()
            clearVideos()
          }}
        >
          Submit another product
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-border/80 bg-card/95 p-6 shadow-lg ring-1 ring-primary/5 sm:p-10"
    >
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-foreground">Seller details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sellerName">Seller / farmer name</Label>
            <Input id="sellerName" name="sellerName" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+91" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input id="whatsapp" name="whatsapp" type="tel" required autoComplete="tel" placeholder="+91" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="villageCity">Village / city</Label>
            <Input id="villageCity" name="villageCity" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input id="district" name="district" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-foreground">Product details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="productName">Product name</Label>
            <Input id="productName" name="productName" required placeholder="e.g. Sona Masoori Rice" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required placeholder="e.g. Grains, Spices, Oils" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" required inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              name="unit"
              required
              className={cn(
                "h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            >
              <option value="">Select unit</option>
              <option value="kg">kg</option>
              <option value="quintal">Quintal</option>
              <option value="tonne">Tonne</option>
              <option value="bags">Bags</option>
              <option value="L">L (litres)</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" required placeholder="e.g. Rs. 95 / kg" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              required
              placeholder="Variety, quality, harvest date, packing, delivery or pickup details"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-foreground">Product media</legend>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="product-photos">Product photos</Label>
            <label
              htmlFor="product-photos"
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5 px-5 py-8 text-center transition-colors hover:bg-primary/10"
            >
              <ImageIcon className="size-9 text-primary" aria-hidden />
              <span className="mt-3 text-base font-semibold text-foreground">Add photos</span>
              <span className="mt-1 text-sm text-muted-foreground">
                JPG, PNG, WebP, or GIF. UI preview only.
              </span>
            </label>
            <Input
              ref={photoInputRef}
              id="product-photos"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
            <MediaList files={photos} type="photo" onClear={clearPhotos} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="product-videos">Product videos</Label>
            <label
              htmlFor="product-videos"
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/35 bg-amber-50/60 px-5 py-8 text-center transition-colors hover:bg-amber-50"
            >
              <Video className="size-9 text-amber-700" aria-hidden />
              <span className="mt-3 text-base font-semibold text-foreground">Add videos</span>
              <span className="mt-1 text-sm text-muted-foreground">
                MP4, WebM, or MOV. UI preview only.
              </span>
            </label>
            <Input
              ref={videoInputRef}
              id="product-videos"
              name="videos"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={handleVideoChange}
            />
            <MediaList files={videos} type="video" onClear={clearVideos} />
          </div>
        </div>
      </fieldset>

      {message ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold sm:w-auto sm:min-w-56">
        Submit for review
      </Button>
    </form>
  )
}
