"use client";

import { motion } from "framer-motion";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { collabValidationRules } from "@/lib/collab-validation";
import type { CollabLogoUpload } from "@/types/collab";

type CollabUploadProps = {
  value?: CollabLogoUpload;
  onChange: (value?: CollabLogoUpload) => void;
  error?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

export function CollabUpload({ value, onChange, error }: CollabUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleFile(file?: File) {
    setLocalError("");

    if (!file) {
      return;
    }

    if (
      !collabValidationRules.allowedLogoTypes.includes(
        file.type as (typeof collabValidationRules.allowedLogoTypes)[number]
      )
    ) {
      setLocalError("Upload a PNG, SVG, or JPG logo.");
      return;
    }

    if (file.size > collabValidationRules.maxLogoSize) {
      setLocalError("Logo must be 5MB or smaller.");
      return;
    }

    const base64 = await readFileAsBase64(file);

    onChange({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      base64
    });
  }

  const visibleError = error ?? localError;

  return (
    <div>
      <p className="mb-2 font-pixel text-xs uppercase text-white/58">Project Logo</p>
      <motion.div
        animate={dragging ? { scale: 1.01 } : { scale: 1 }}
        className={`relative overflow-hidden rounded-2xl border border-dashed p-5 text-center transition ${
          visibleError
            ? "border-red-400/45 bg-red-500/10"
            : "border-lemon/35 bg-lemon/[0.055] hover:border-lemon/60"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lemon">
          {value ? <ImagePlus aria-hidden="true" size={22} /> : <UploadCloud aria-hidden="true" size={22} />}
        </div>

        {value ? (
          <div className="mt-4">
            <p className="break-all font-pixel text-sm text-white">{value.fileName}</p>
            <p className="mt-1 text-xs text-white/48">{formatBytes(value.size)}</p>
            <Button className="mt-4" size="sm" type="button" variant="secondary" onClick={() => onChange(undefined)}>
              <X aria-hidden="true" size={15} />
              Remove
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="font-pixel text-sm text-white">Drop logo here or tap to upload</p>
            <p className="mt-2 text-xs leading-5 text-white/50">PNG, SVG, or JPG. Maximum 5MB.</p>
            <Button className="mt-4" size="sm" type="button" onClick={() => inputRef.current?.click()}>
              Choose File
            </Button>
          </div>
        )}
      </motion.div>
      {visibleError ? <p className="mt-2 text-xs text-red-300">{visibleError}</p> : null}
    </div>
  );
}
