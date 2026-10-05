"use client";

import { useMutation } from "@tanstack/react-query";
import { ImagePlus, LoaderCircle, RotateCcw } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useId } from "react";
import { ApiError, api } from "@/lib/api";

type UploadScope = "products" | "services" | "opportunities";

export function AdminImageUpload({ token, scope, value, required = false, onChange }: {
  token: string;
  scope: UploadScope;
  value?: string | null;
  required?: boolean;
  onChange: (url: string) => void;
}) {
  const inputId = useId();
  const upload = useMutation({
    mutationFn: (file: File) => api.uploadAdminImage(token, scope, file),
    onSuccess: ({ url }) => onChange(url)
  });

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) upload.mutate(file);
  }

  return <div>
    <span className="block text-sm font-bold text-forest-950">Image{required ? " *" : ""}</span>
    {value ? <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-md border border-slate-200 bg-slate-50"><Image src={value} alt="Selected listing image" fill sizes="390px" className="object-cover" /></div> : <div className="mt-2 grid aspect-[16/9] place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500"><div><ImagePlus className="mx-auto" size={28} aria-hidden="true" /><p className="mt-2 text-sm font-bold">No image uploaded</p></div></div>}
    <div className="mt-3 flex items-center gap-2">
      <label htmlFor={inputId} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-forest-600 px-4 text-sm font-black text-white ${upload.isPending ? "pointer-events-none opacity-50" : ""}`}>
        {upload.isPending ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : value ? <RotateCcw size={17} aria-hidden="true" /> : <ImagePlus size={17} aria-hidden="true" />}
        {upload.isPending ? "Uploading..." : value ? "Replace image" : "Upload image"}
      </label>
      <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={selectImage} disabled={upload.isPending} className="sr-only" />
      <span className="text-xs font-bold text-slate-500">JPEG, PNG, WebP or AVIF · 5 MB max</span>
    </div>
    {required && !value ? <p className="mt-2 text-xs font-bold text-amber-800">Upload an image before saving.</p> : null}
    {upload.isError ? <p role="alert" className="mt-2 text-sm font-bold text-red-700">{upload.error instanceof ApiError ? upload.error.message : "Could not upload this image."}</p> : null}
  </div>;
}
