"use client"

import * as React from "react"
import { ImageIcon, UploadCloud, Video, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Json } from "@/types/database"

const MEDIA_BUCKET = "product-media"
const MAX_MEDIA_FILES = 6
const MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024
const ACCEPTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]

type ProductMediaAsset = {
  url: string
  path: string
  type: "image" | "video"
  mimeType: string
  name: string
  size: number
}

function readFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? ""
}

function normalizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function FarmerProductForm() {
  const [submitted, setSubmitted] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const formRef = React.useRef<HTMLFormElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function validateFiles(files: File[]) {
    if (files.length > MAX_MEDIA_FILES) {
      return `Upload up to ${MAX_MEDIA_FILES} photos or videos.`
    }

    const unsupported = files.find((file) => !ACCEPTED_MEDIA_TYPES.includes(file.type))
    if (unsupported) {
      return `${unsupported.name} is not a supported image or video format.`
    }

    const oversized = files.find((file) => file.size > MAX_MEDIA_FILE_SIZE)
    if (oversized) {
      return `${oversized.name} is larger than 50 MB.`
    }

    return null
  }

  function handleMediaChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const validationMessage = validateFiles(files)

    if (validationMessage) {
      setMessage(validationMessage)
      setSelectedFiles([])
      event.target.value = ""
      return
    }

    setMessage(null)
    setSelectedFiles(files)
  }

  function clearMedia() {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function uploadMedia(userId: string) {
    const supabase = createClient()
    const uploadedAssets: ProductMediaAsset[] = []

    for (const file of selectedFiles) {
      const fileName = normalizeFileName(file.name) || "product-media"
      const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${fileName}`
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)

      uploadedAssets.push({
        url: publicUrl,
        path,
        type: file.type.startsWith("video/") ? "video" : "image",
        mimeType: file.type,
        name: file.name,
        size: file.size,
      })
    }

    return uploadedAssets
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const formData = new FormData(e.currentTarget)
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Sign in as a farmer before uploading a product.")
      }

      const mediaAssets = await uploadMedia(user.id)
      const { error: insertError } = await supabase.from("farmer_submissions").insert({
        user_id: user.id,
        farmer_name: readFormValue(formData, "farmerName"),
        phone: readFormValue(formData, "phone"),
        whatsapp: readFormValue(formData, "whatsapp"),
        village: readFormValue(formData, "village"),
        district: readFormValue(formData, "district"),
        state: readFormValue(formData, "state"),
        product_name: readFormValue(formData, "productName"),
        category: readFormValue(formData, "category"),
        quantity_available: readFormValue(formData, "quantity"),
        unit: readFormValue(formData, "unit"),
        price: readFormValue(formData, "price"),
        description: readFormValue(formData, "description"),
        media_assets: mediaAssets as unknown as Json,
      })

      if (insertError) {
        throw new Error(insertError.message)
      }

      formRef.current?.reset()
      clearMedia()
      setSubmitted(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product upload failed. Try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl border border-primary/25 bg-primary/5 px-6 py-10 text-center"
        role="status"
      >
        <p className="text-lg font-medium text-foreground">
          Your product has been submitted for review.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          Our team will reach out on WhatsApp or phone after verification.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-8 h-11 rounded-xl px-6 text-base"
          onClick={() => {
            setSubmitted(false)
            setMessage(null)
          }}
        >
          Submit another product
        </Button>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-border/80 bg-card/90 p-7 shadow-md ring-1 ring-primary/5 sm:p-10"
    >
      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-foreground">Farmer details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="farmerName">Farmer name</Label>
            <Input id="farmerName" name="farmerName" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+91 …"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+91 …"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="village">Village</Label>
            <Input id="village" name="village" required />
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
        <legend className="text-base font-semibold text-foreground">Product details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="productName">Product name</Label>
            <Input id="productName" name="productName" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required placeholder="e.g. Pulses, Spices" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity available</Label>
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
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "dark:bg-input/30"
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
            <Input id="price" name="price" required placeholder="e.g. ₹95 / kg" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              required
              placeholder="Variety, grade, harvest window, packing…"
            />
          </div>
          <div className="space-y-3 sm:col-span-2">
            <Label htmlFor="product-media">Product photos or videos</Label>
            <label
              htmlFor="product-media"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5 px-5 py-8 text-center transition-colors hover:bg-primary/10"
            >
              <UploadCloud className="size-8 text-primary" aria-hidden />
              <span className="mt-3 text-base font-medium text-foreground">
                Upload product media
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                Up to {MAX_MEDIA_FILES} files, 50 MB each. Images and MP4/WebM/MOV videos.
              </span>
            </label>
            <Input
              ref={fileInputRef}
              id="product-media"
              name="media"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              multiple
              className="sr-only"
              onChange={handleMediaChange}
            />
            {selectedFiles.length > 0 ? (
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-sm"
                    onClick={clearMedia}
                  >
                    <X className="size-4" aria-hidden />
                    Clear
                  </Button>
                </div>
                <ul className="mt-3 space-y-2">
                  {selectedFiles.map((file) => {
                    const Icon = file.type.startsWith("video/") ? Video : ImageIcon

                    return (
                      <li
                        key={`${file.name}-${file.size}`}
                        className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{file.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>

      {message ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl text-base font-semibold sm:w-auto sm:min-w-56"
      >
        {isSubmitting ? "Uploading..." : "Submit for review"}
      </Button>
    </form>
  )
}
