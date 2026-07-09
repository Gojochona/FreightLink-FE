"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  X,
} from "lucide-react"
import { authApi, DocumentType } from "@/lib/api"
import { useFetch } from "@/hooks/useApi"

const documentTypeOptions: { value: DocumentType; label: string }[] = [
  { value: DocumentType.NATIONAL_ID, label: "National ID Card (NIN)" },
  { value: DocumentType.PASSPORT, label: "International Passport" },
  { value: DocumentType.DRIVERS_LICENSE, label: "Driver's License" },
]

function formatDocType(type: DocumentType | null) {
  return documentTypeOptions.find((o) => o.value === type)?.label || type || "—"
}

export default function KYCPage() {
  const { data: kycStatus, loading: kycLoading, refetch: refetchKycStatus } = useFetch(() => authApi.getKycStatus(), [])

  // Quick verify via NIN/BVN (Dojah) — instant path.
  const [quickVerifyType, setQuickVerifyType] = useState<"nin" | "bvn">("nin")
  const [quickVerifyNumber, setQuickVerifyNumber] = useState("")
  const [quickVerifyLoading, setQuickVerifyLoading] = useState(false)
  const [quickVerifyResult, setQuickVerifyResult] = useState<{ verified: boolean; detail: string } | null>(null)

  // Document upload — the fallback path, reviewed by a human.
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [documentType, setDocumentType] = useState<DocumentType | "">("")
  const [documentFront, setDocumentFront] = useState<File | null>(null)
  const [documentBack, setDocumentBack] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState("")

  const handleQuickVerify = async () => {
    if (!quickVerifyNumber.trim()) {
      setQuickVerifyResult({ verified: false, detail: `Please enter your ${quickVerifyType.toUpperCase()}.` })
      return
    }
    setQuickVerifyLoading(true)
    setQuickVerifyResult(null)
    try {
      const result = await authApi.verifyId(quickVerifyType, quickVerifyNumber.trim())
      setQuickVerifyResult({ verified: result.verified, detail: result.detail })
      refetchKycStatus()
    } catch (err) {
      setQuickVerifyResult({
        verified: false,
        detail: err instanceof Error ? err.message : "Verification failed. Please try again.",
      })
    } finally {
      setQuickVerifyLoading(false)
    }
  }

  const resetUploadForm = () => {
    setDocumentType("")
    setDocumentFront(null)
    setDocumentBack(null)
    setSelfie(null)
    setUploadError("")
  }

  const handleUploadSubmit = async () => {
    if (!documentType) {
      setUploadError("Please select a document type.")
      return
    }
    if (!documentFront) {
      setUploadError("Please upload the front of your document.")
      return
    }
    setUploadLoading(true)
    setUploadError("")
    try {
      await authApi.uploadKycDocuments({
        document_type: documentType,
        document_front: documentFront,
        document_back: documentBack || undefined,
        selfie: selfie || undefined,
      })
      setUploadSuccess("Document submitted! We'll review it within 1-2 business days.")
      setShowUploadForm(false)
      resetUploadForm()
      refetchKycStatus()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploadLoading(false)
    }
  }

  const status = kycStatus?.kyc_status

  const statusBadge = {
    unverified: { label: "Not Started", className: "bg-muted text-muted-foreground", icon: Clock },
    pending: { label: "Under Review", className: "bg-warning/20 text-warning", icon: Clock },
    verified: { label: "Verified", className: "bg-success/20 text-success", icon: CheckCircle2 },
    rejected: { label: "Rejected", className: "bg-destructive/20 text-destructive", icon: AlertTriangle },
  }[status || "unverified"]

  const StatusIcon = statusBadge.icon

  return (
    <>
      <Header title="KYC Verification" subtitle="Verify your identity to unlock full platform access" />
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Status Overview */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground">Verification Status</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.className}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {kycLoading ? "Loading..." : kycStatus?.message}
              </p>
            </div>
          </div>

          {/* Details for pending/rejected/verified states — real data, not placeholders */}
          {!kycLoading && status === "pending" && kycStatus?.document_type && (
            <div className="mt-4 p-4 rounded-xl bg-secondary/30 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Document Submitted</p>
                <p className="font-medium text-foreground">{formatDocType(kycStatus.document_type)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="font-medium text-foreground">
                  {kycStatus.submitted_at ? new Date(kycStatus.submitted_at).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          )}

          {!kycLoading && status === "rejected" && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm">
              <p className="text-destructive font-medium mb-1">Why it was rejected</p>
              <p className="text-muted-foreground">
                {kycStatus?.rejection_reason || "No specific reason was given — please try resubmitting with clearer documents."}
              </p>
            </div>
          )}

          {!kycLoading && status === "verified" && (
            <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/20 text-sm text-muted-foreground">
              Verified via{" "}
              <span className="font-medium text-foreground">
                {kycStatus?.id_verification_method
                  ? `${kycStatus.id_verification_method.toUpperCase()} lookup`
                  : "document review"}
              </span>
              {kycStatus?.id_verified_at && (
                <> on {new Date(kycStatus.id_verified_at).toLocaleDateString()}</>
              )}
              . You have full platform access.
            </div>
          )}
        </div>

        {status !== "verified" && (
          <>
            {/* Quick Verify via NIN/BVN — the fast path */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Quick Verify with NIN or BVN</h3>
                  <p className="text-sm text-muted-foreground">
                    Skip the wait — if your details match, you're verified instantly.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <select
                  value={quickVerifyType}
                  onChange={(e) => {
                    setQuickVerifyType(e.target.value as "nin" | "bvn")
                    setQuickVerifyResult(null)
                  }}
                  className="px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="nin">NIN</option>
                  <option value="bvn">BVN</option>
                </select>
                <Input
                  placeholder={`Enter your ${quickVerifyType.toUpperCase()}`}
                  value={quickVerifyNumber}
                  onChange={(e) => setQuickVerifyNumber(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground flex-1"
                />
                <Button
                  onClick={handleQuickVerify}
                  disabled={quickVerifyLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {quickVerifyLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>

              {quickVerifyResult && (
                <div
                  className={`mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${
                    quickVerifyResult.verified
                      ? "bg-success/10 border border-success/20 text-success"
                      : "bg-warning/10 border border-warning/20 text-warning"
                  }`}
                >
                  {quickVerifyResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  {quickVerifyResult.detail}
                </div>
              )}
            </div>

            {/* Document Upload — the fallback path, reviewed by a human */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {status === "pending" ? "Update Submitted Document" : "Upload Identity Document"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {status === "pending"
                        ? "Already under review — you can resubmit if you made a mistake."
                        : "Don't have your NIN/BVN handy? Upload a document instead — a real person reviews it, usually within 1-2 business days."}
                    </p>
                  </div>
                </div>
                {!showUploadForm && (
                  <Button
                    onClick={() => setShowUploadForm(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {status === "rejected" ? "Resubmit" : "Start Upload"}
                  </Button>
                )}
              </div>

              {uploadSuccess && !showUploadForm && (
                <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20 text-sm text-success flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {uploadSuccess}
                </div>
              )}

              {showUploadForm && (
                <div className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Document Type</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select document type</option>
                      {documentTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <FileDropField
                    label="Document — Front"
                    required
                    file={documentFront}
                    onChange={setDocumentFront}
                  />
                  <FileDropField
                    label="Document — Back (if applicable)"
                    file={documentBack}
                    onChange={setDocumentBack}
                  />
                  <FileDropField
                    label="Selfie (optional, speeds up review)"
                    accept="image/*"
                    file={selfie}
                    onChange={setSelfie}
                  />

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      {uploadError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => { setShowUploadForm(false); resetUploadForm() }}
                      disabled={uploadLoading}
                      className="flex-1 border-border text-foreground hover:bg-secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUploadSubmit}
                      disabled={uploadLoading || !documentType || !documentFront}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      {uploadLoading ? "Uploading..." : "Submit for Review"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function FileDropField({
  label,
  file,
  onChange,
  required = false,
  accept = ".pdf,.jpg,.jpeg,.png",
}: {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  required?: boolean
  accept?: string
}) {
  const inputId = `file-${label.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {file ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border">
          <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-3">PDF, JPG, or PNG — max 5MB</p>
          <input
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="hidden"
            id={inputId}
          />
          <label htmlFor={inputId}>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
        </div>
      )}
    </div>
  )
}
