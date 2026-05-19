/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { ImageIcon, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MAX_PHOTOS = 6
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

const sectionClassName =
  "rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm"
const labelClassName = "mb-1.5 block text-sm font-medium"
const inputClassName = "h-11 rounded-xl px-3 text-base"
const selectClassName = cn(
  inputClassName,
  "w-full border border-input bg-transparent py-2 outline-none",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
)

type PhotoPreview = {
  file: File
  url: string
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function requiredFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function parseNumber(value: string) {
  const match = value.match(/\d[\d,]*(?:\.\d+)?/)
  return match ? Number(match[0].replace(/,/g, "")) : Number.NaN
}

function validateSubmission(formData: FormData, photoCount: number) {
  const sellerName = requiredFormValue(formData, "sellerName")
  const sellerPhone = requiredFormValue(formData, "sellerPhone")
  const sellerVillageCity = requiredFormValue(formData, "sellerVillageCity")
  const sellerDistrict = requiredFormValue(formData, "sellerDistrict")
  const sellerState = requiredFormValue(formData, "sellerState")
  const productName = requiredFormValue(formData, "productName")
  const categoryId = requiredFormValue(formData, "categoryId")
  const quantityText = requiredFormValue(formData, "quantity")
  const unit = requiredFormValue(formData, "unit")
  const priceText = requiredFormValue(formData, "price")
  const description = requiredFormValue(formData, "description")

  if (!sellerName) return "Enter seller / farmer name."
  if (!sellerPhone) return "Enter phone number."
  if (!sellerVillageCity) return "Enter village / city."
  if (!sellerDistrict) return "Enter district."
  if (!sellerState) return "Enter state."
  if (!productName) return "Enter product name."
  if (!categoryId) return "Select a category."
  if (!quantityText) return "Enter quantity."
  if (!unit) return "Select a unit."
  if (!priceText) return "Enter price."
  if (!description) return "Enter product description."

  const quantity = parseNumber(quantityText)
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return "Enter a valid quantity."
  }

  const price = parseNumber(priceText)
  if (!Number.isFinite(price) || price <= 0) {
    return "Enter a valid price."
  }

  if (photoCount > MAX_PHOTOS) {
    return `Select up to ${MAX_PHOTOS} product photos.`
  }

  return null
}

function PhotoPreviewList({
  photos,
  onClear,
}: {
  photos: PhotoPreview[]
  onClear: () => void
}) {
  if (!photos.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background/75 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {photos.length} photo
          {photos.length === 1 ? "" : "s"} selected
        </p>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onClear}>
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      </div>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {photos.map(({ file, url }) => (
          <li
            key={`${file.name}-${file.size}`}
            className="overflow-hidden rounded-lg border border-border/60 bg-muted/60 text-sm"
          >
            <img src={url} alt={file.name} className="aspect-[4/3] w-full object-cover" />
            <div className="flex items-center gap-2 px-2 py-1.5">
              <ImageIcon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SubmitSuccessPanel({ onSubmitAnother }: { onSubmitAnother: () => void }) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center shadow-sm">
      <p className="text-lg font-semibold text-emerald-950">Product submitted for review.</p>
      <p className="mt-2 text-sm text-emerald-900/80">
        We will review your listing and show it to buyers after approval.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="h-12 rounded-xl bg-green-800 text-base font-semibold text-white hover:bg-green-900">
          <Link href="/my-submissions">View My Submissions</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl text-base font-semibold"
          onClick={onSubmitAnother}
        >
          Submit another product
        </Button>
      </div>
    </section>
  )
}

export function FarmerProductForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true)
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([])
  const [photos, setPhotos] = React.useState<PhotoPreview[]>([])
  const [message, setMessage] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const photoInputRef = React.useRef<HTMLInputElement>(null)
  const formKey = React.useRef(0)

  React.useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url))
    }
  }, [photos])

  React.useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      setIsLoadingCategories(true)

      try {
        const response = await fetch("/api/categories")
        const payload = (await response.json()) as {
          categories?: { id: string; name: string }[]
        }

        if (isMounted && payload.categories?.length) {
          setCategories(payload.categories)
        }
      } catch {
        if (isMounted) {
          setMessage("Categories could not be loaded. Refresh and try again.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false)
        }
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const validationError = validateSubmission(formData, photos.length)

    if (validationError) {
      setMessage(validationError)
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/product-submissions", {
        body: formData,
        method: "POST",
      })
      const responsePayload = (await response.json()) as {
        error?: string
        message?: string
      }

      if (!response.ok) {
        throw new Error(responsePayload.error ?? "Unable to submit product.")
      }

      form.reset()
      clearPhotos()
      setSubmitSuccess(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit product.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (files.length > MAX_PHOTOS) {
      setMessage(`Select up to ${MAX_PHOTOS} product photos.`)
      event.target.value = ""
      return
    }

    const invalidType = files.find((file) => !ALLOWED_PHOTO_TYPES.has(file.type))
    if (invalidType) {
      setMessage("Upload JPG, PNG, WebP, or GIF images only.")
      event.target.value = ""
      return
    }

    const oversized = files.find((file) => file.size > MAX_PHOTO_SIZE_BYTES)
    if (oversized) {
      setMessage(`Each photo must be ${formatFileSize(MAX_PHOTO_SIZE_BYTES)} or smaller.`)
      event.target.value = ""
      return
    }

    setPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url))
      return files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    })
    setMessage(null)
  }

  function clearPhotos() {
    setPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url))
      return []
    })
    if (photoInputRef.current) {
      photoInputRef.current.value = ""
    }
  }

  function handleSubmitAnother() {
    setSubmitSuccess(false)
    setMessage(null)
    formKey.current += 1
  }

  if (submitSuccess) {
    return <SubmitSuccessPanel onSubmitAnother={handleSubmitAnother} />
  }

  return (
    <form key={formKey.current} onSubmit={handleSubmit} className="space-y-4">
      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-bold">Seller details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sellerName" className={labelClassName}>
              Seller / farmer name
            </Label>
            <Input
              id="sellerName"
              name="sellerName"
              required
              autoComplete="name"
              className={inputClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sellerPhone" className={labelClassName}>
                Phone
              </Label>
              <Input
                id="sellerPhone"
                name="sellerPhone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+91"
                className={inputClassName}
              />
            </div>
            <div>
              <Label htmlFor="sellerVillageCity" className={labelClassName}>
                Village / city
              </Label>
              <Input
                id="sellerVillageCity"
                name="sellerVillageCity"
                required
                className={inputClassName}
              />
            </div>
            <div>
              <Label htmlFor="sellerDistrict" className={labelClassName}>
                District
              </Label>
              <Input id="sellerDistrict" name="sellerDistrict" required className={inputClassName} />
            </div>
            <div>
              <Label htmlFor="sellerState" className={labelClassName}>
                State
              </Label>
              <Input id="sellerState" name="sellerState" required className={inputClassName} />
            </div>
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-bold">Product details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="productName" className={labelClassName}>
              Product name
            </Label>
            <Input
              id="productName"
              name="productName"
              required
              placeholder="e.g. Sona Masoori Rice"
              className={inputClassName}
            />
          </div>
          <div>
            <Label htmlFor="category" className={labelClassName}>
              Category
            </Label>
            <select id="category" name="categoryId" required className={selectClassName}>
              <option value="">
                {isLoadingCategories
                  ? "Loading categories..."
                  : categories.length
                    ? "Select category"
                    : "Categories unavailable"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="quantity" className={labelClassName}>
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                required
                inputMode="decimal"
                className={inputClassName}
              />
            </div>
            <div>
              <Label htmlFor="unit" className={labelClassName}>
                Unit
              </Label>
              <select id="unit" name="unit" required className={selectClassName}>
                <option value="">Select unit</option>
                <option value="kg">kg</option>
                <option value="quintal">Quintal</option>
                <option value="tonne">Tonne</option>
                <option value="bags">Bags</option>
                <option value="L">L (litres)</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="price" className={labelClassName}>
              Price
            </Label>
            <Input
              id="price"
              name="price"
              required
              placeholder="e.g. Rs. 95 / kg"
              className={inputClassName}
            />
          </div>
          <div>
            <Label htmlFor="description" className={labelClassName}>
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              required
              placeholder="Variety, quality, packing, and other product details"
              className="min-h-24 rounded-xl px-3 py-3 text-base"
            />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-bold">Product photos</h2>
        <div className="space-y-3">
          <Label htmlFor="product-photos" className={labelClassName}>
            Upload photos <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <label
            htmlFor="product-photos"
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5 px-3 py-4 text-center transition-colors hover:bg-primary/10"
          >
            <ImageIcon className="size-7 text-primary" aria-hidden />
            <span className="mt-1.5 text-sm font-semibold text-foreground">Add photos</span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              JPG, PNG, WebP, or GIF. Up to {MAX_PHOTOS} photos, {formatFileSize(MAX_PHOTO_SIZE_BYTES)} each.
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
          <PhotoPreviewList photos={photos} onClear={clearPhotos} />
        </div>
      </section>

      {message ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-12 w-full rounded-xl bg-green-800 text-base font-semibold text-white hover:bg-green-900"
        disabled={isSubmitting || isLoadingCategories || !categories.length}
      >
        {isSubmitting ? "Submitting..." : "Submit for Review"}
      </Button>
    </form>
  )
}
