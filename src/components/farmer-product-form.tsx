"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function FarmerProductForm() {
  const [submitted, setSubmitted] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
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
          onClick={() => setSubmitted(false)}
        >
          Submit another product
        </Button>
      </div>
    )
  }

  return (
    <form
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
        </div>
      </fieldset>

      <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold sm:w-auto sm:min-w-56">
        Submit for review
      </Button>
    </form>
  )
}
