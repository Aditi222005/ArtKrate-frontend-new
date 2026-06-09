import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle,
  X,
  ScanLine,
  ShieldCheck,
  Clock,
  RefreshCw,
  Camera,
} from "lucide-react";
import axios from "axios";

interface VerificationFormProps {
  status: string;
  onStatusChange: (status: string) => void;
}

interface FilePreview {
  file: File;
  preview: string;
}

// ── Small helper: drag-n-drop file zone ──────────────────────────────────────
const DropZone = ({
  id,
  label,
  icon: Icon,
  accept,
  file,
  onFile,
  hint,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  accept: string;
  file: FilePreview | null;
  onFile: (fp: FilePreview | null) => void;
  hint?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const preview = URL.createObjectURL(f);
    onFile({ file: f, preview });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
      </Label>
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
          ${dragging ? "border-stone-500 bg-stone-50" : "border-stone-300 hover:border-stone-400 hover:bg-stone-50"}
          ${file ? "border-green-400 bg-green-50" : ""}
        `}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={file.preview}
              alt="preview"
              className="h-28 w-auto max-w-full rounded-lg object-cover shadow"
            />
            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
              <CheckCircle className="w-4 h-4" />
              {file.file.name}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFile(null); }}
              className="text-xs text-stone-500 hover:text-red-500 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Icon className="w-8 h-8 text-stone-400" />
            <span className="text-sm text-stone-500">
              Drag & drop or <span className="text-stone-700 font-medium underline">click to upload</span>
            </span>
            <span className="text-xs text-stone-400">JPG, PNG, WEBP · max 10 MB</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Step indicator ───────────────────────────────────────────────────────────
const steps = [
  { label: "Document Info",  icon: FileCheck },
  { label: "Upload Files",   icon: Upload    },
  { label: "Review & Submit",icon: ShieldCheck },
];

// ════════════════════════════════════════════════════════════════════════════
const VerificationForm = ({ status, onStatusChange }: VerificationFormProps) => {
  const [step, setStep]                     = useState(0);
  const [documentType, setDocumentType]     = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontFile, setFrontFile]           = useState<FilePreview | null>(null);
  const [backFile, setBackFile]             = useState<FilePreview | null>(null);
  const [selfieFile, setSelfieFile]         = useState<FilePreview | null>(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submitResult, setSubmitResult]     = useState<{
    ocrScore?: number;
    faceMatchScore?: number;
  } | null>(null);
  const [error, setError] = useState("");

  // Fetch real status on mount
  useEffect(() => {
    axios
      .get("/api/verify-seller-status", { withCredentials: true })
      .then((r) => {
        if (r.data?.status) onStatusChange(r.data.status);
      })
      .catch(() => {});
  }, []);

  // ── Step validation ────────────────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 0) return !!documentType && !!documentNumber.trim();
    if (step === 1) return !!frontFile && !!selfieFile;
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!frontFile || !selfieFile) return;
    setError("");
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("documentType",   documentType);
      fd.append("documentNumber", documentNumber);
      fd.append("documentFront",  frontFile.file);
      if (backFile) fd.append("documentBack", backFile.file);
      fd.append("selfiePhoto",    selfieFile.file);

      const res = await axios.post("/api/verify-seller", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitResult({
        ocrScore:       res.data.ocrScore,
        faceMatchScore: res.data.faceMatchScore,
      });
      onStatusChange("pending");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Status views (not_submitted is the form itself) ────────────────────────
  const StatusView = () => {
    if (status === "pending") {
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-4 bg-yellow-100 rounded-full">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-yellow-800">Under Review</h3>
          <p className="text-stone-600 max-w-sm">
            Your documents have been submitted and are being reviewed by our team.
            This typically takes <strong>2–3 business days</strong>.
          </p>
          {submitResult && (
            <div className="w-full max-w-sm space-y-3 text-left mt-2">
              {submitResult.ocrScore !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">OCR Score</span>
                    <span className="font-semibold">{submitResult.ocrScore}/100</span>
                  </div>
                  <Progress value={submitResult.ocrScore} className="h-2" />
                </div>
              )}
              {submitResult.faceMatchScore !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Face Match Score</span>
                    <span className="font-semibold">{submitResult.faceMatchScore}/100</span>
                  </div>
                  <Progress value={submitResult.faceMatchScore} className="h-2" />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (status === "verified") {
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-4 bg-green-100 rounded-full">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800">✅ Verified Seller</h3>
          <p className="text-stone-600 max-w-sm">
            Your identity has been verified. You can now list artworks and receive payments.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Verified Seller Badge Active
          </div>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="p-4 bg-red-100 rounded-full">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-red-800">Verification Rejected</h3>
          <p className="text-stone-600 max-w-sm">
            Your documents were not approved. Please check your documents and resubmit.
          </p>
          <Button
            onClick={() => { onStatusChange("not_submitted"); setStep(0); }}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Resubmit Documents
          </Button>
        </div>
      );
    }

    return null;
  };

  // Show status screen for non-form states (except not_submitted)
  if (status !== "not_submitted" && !submitResult) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-stone-800">Seller Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusView />
        </CardContent>
      </Card>
    );
  }

  // If just submitted, also show status
  if (submitResult) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-stone-800">Seller Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusView />
        </CardContent>
      </Card>
    );
  }

  // ── Multi-step form ────────────────────────────────────────────────────────
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-stone-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-stone-600" />
          Become a Verified Seller
        </CardTitle>
        <p className="text-stone-500 text-sm">
          Complete identity verification to start selling on the platform.
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mt-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active   = i === step;
            const complete = i < step;
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors
                      ${complete ? "bg-green-500 border-green-500 text-white"
                        : active  ? "bg-stone-800 border-stone-800 text-white"
                        : "bg-white border-stone-300 text-stone-400"}`}
                  >
                    {complete ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${active ? "text-stone-800 font-medium" : "text-stone-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < step ? "bg-green-400" : "bg-stone-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Step 0: Document Info ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhar">🪪 Aadhar Card</SelectItem>
                  <SelectItem value="pan">📋 PAN Card</SelectItem>
                  <SelectItem value="passport">🛂 Passport</SelectItem>
                  <SelectItem value="driving_license">🚗 Driving License</SelectItem>
                  <SelectItem value="voter_id">🗳️ Voter ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document Number *</Label>
              <Input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value.toUpperCase())}
                placeholder="Enter your document number"
              />
              <p className="text-xs text-stone-500">
                This must match exactly what's printed on your document.
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 space-y-1">
              <p className="font-semibold">🔒 Your data is secure</p>
              <p>Documents are encrypted, stored securely, and only viewed by authorised admins for KYC purposes.</p>
            </div>
          </div>
        )}

        {/* ── Step 1: Upload Files ── */}
        {step === 1 && (
          <div className="space-y-5">
            <DropZone
              id="front"
              label="Document Front (Required)"
              icon={ScanLine}
              accept="image/jpeg,image/png,image/webp"
              file={frontFile}
              onFile={setFrontFile}
              hint="Clear photo of the front side of your ID"
            />
            <DropZone
              id="back"
              label="Document Back (Optional)"
              icon={ScanLine}
              accept="image/jpeg,image/png,image/webp"
              file={backFile}
              onFile={setBackFile}
              hint="Required for Aadhar/Driving License"
            />
            <DropZone
              id="selfie"
              label="Selfie Photo (Required)"
              icon={Camera}
              accept="image/jpeg,image/png,image/webp"
              file={selfieFile}
              onFile={setSelfieFile}
              hint="Clear selfie of your face — must match your document photo"
            />
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 space-y-1">
              <p className="font-semibold">📸 Photo tips for better verification</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Ensure good lighting — no shadows or glare</li>
                <li>Document should be fully visible, not cropped</li>
                <li>Selfie should clearly show your face</li>
                <li>No sunglasses or heavy filters</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Step 2: Review & Submit ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h4 className="font-semibold text-stone-700">Review your submission</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-stone-50 rounded-lg">
                <p className="text-stone-500 text-xs mb-1">Document Type</p>
                <p className="font-medium capitalize">{documentType.replace("_", " ")}</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <p className="text-stone-500 text-xs mb-1">Document Number</p>
                <p className="font-medium">{documentNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Front", fp: frontFile, required: true },
                { label: "Back",  fp: backFile,  required: false },
                { label: "Selfie",fp: selfieFile, required: true },
              ].map(({ label, fp, required }) => (
                <div key={label} className="space-y-1">
                  <p className="text-xs text-stone-500 text-center">
                    {label} {required ? "*" : "(optional)"}
                  </p>
                  {fp ? (
                    <img src={fp.preview} alt={label} className="w-full h-24 object-cover rounded-lg border" />
                  ) : (
                    <div className="w-full h-24 bg-stone-100 rounded-lg border flex items-center justify-center text-stone-400 text-xs">
                      Not uploaded
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
              By submitting, you confirm that the documents provided are genuine and belong to you.
              False submissions may result in a permanent ban.
            </div>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div className="flex justify-between gap-3 pt-2">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext()}>
              Continue →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !frontFile || !selfieFile}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing KYC…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Submit for Verification
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationForm;
