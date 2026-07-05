"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  User,
  CreditCard,
  FileText,
  Building2,
  ChevronRight,
  X
} from "lucide-react"
import { authApi, DocumentType } from "@/lib/api"
import { useFetch, useApi } from "@/hooks/useApi"

const kycSteps = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Basic identity details",
    icon: User,
    status: "completed",
    fields: ["Full Name", "Date of Birth", "Gender", "Address"],
  },
  {
    id: "identity",
    title: "Identity Verification",
    description: "Government-issued ID",
    icon: CreditCard,
    status: "pending",
    fields: ["ID Type", "ID Number", "ID Document Upload"],
  },
  {
    id: "business",
    title: "Business Information",
    description: "Company registration details",
    icon: Building2,
    status: "not_started",
    fields: ["Business Name", "RC Number", "Business Address"],
  },
  {
    id: "documents",
    title: "Supporting Documents",
    description: "Additional verification documents",
    icon: FileText,
    status: "not_started",
    fields: ["Utility Bill", "Bank Statement", "CAC Certificate"],
  },
]

const idTypes = ["National ID Card (NIN)", "International Passport", "Driver's License", "Voter's Card"]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-success/20 text-success"
    case "pending":
      return "bg-warning/20 text-warning"
    case "rejected":
      return "bg-destructive/20 text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle2
    case "pending":
      return Clock
    case "rejected":
      return AlertTriangle
    default:
      return Clock
  }
}

export default function KYCPage() {
  const { data: kycStatus, loading: kycLoading } = useFetch(() => authApi.getKycStatus(), [])
  const { execute: uploadDocuments, loading: uploadLoading } = useApi(authApi.uploadKycDocuments)
  const [activeStep, setActiveStep] = useState("identity")
  const [showModal, setShowModal] = useState(false)
  const [selectedIdType, setSelectedIdType] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const completedSteps = kycSteps.filter((s) => s.status === "completed").length
  const progress = (completedSteps / kycSteps.length) * 100

  return (
    <>
      <Header title="KYC Verification" subtitle="Complete your identity verification" />
      <div className="p-6 space-y-6">
        {/* Progress Overview */}
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Verification Status</h3>
                <p className="text-sm text-warning">In Progress</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{completedSteps}/{kycSteps.length}</p>
              <p className="text-sm text-muted-foreground">Steps completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-foreground font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="p-4 rounded-xl bg-info/10 border border-info/20">
            <p className="text-sm text-info font-medium mb-2">Benefits of completing KYC:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Increased transaction limits</li>
              <li>• Access to premium features</li>
              <li>• Priority customer support</li>
              <li>• Lower transaction fees</li>
            </ul>
          </div>
        </div>

        {/* KYC Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps List */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Verification Steps</h3>
            <div className="space-y-2">
              {kycSteps.map((step, index) => {
                const StatusIcon = getStatusIcon(step.status)
                const isActive = activeStep === step.id

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isActive
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        step.status === "completed"
                          ? "bg-success/20"
                          : step.status === "pending"
                          ? "bg-warning/20"
                          : "bg-muted"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                      {step.status === "completed" ? "Done" : step.status === "pending" ? "Pending" : "Start"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            {activeStep === "personal" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                    <p className="text-sm text-success">Completed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">John Doe</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium text-foreground">January 15, 1990</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground">Male</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">25 Marina Road, Lagos</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="mt-6 border-border text-foreground hover:bg-secondary"
                >
                  Edit Information
                </Button>
              </div>
            )}

            {activeStep === "identity" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Identity Verification</h3>
                    <p className="text-sm text-warning">Pending Review</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-6">
                  <p className="text-sm text-warning">
                    Your identity document is currently being reviewed. This usually takes 1-2 business days.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground">ID Type</p>
                    <p className="font-medium text-foreground">National ID Card (NIN)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground">ID Number</p>
                    <p className="font-medium text-foreground">12345678901</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Document</p>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <p className="font-medium text-foreground">NIN_Document.pdf</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeStep === "business" || activeStep === "documents") && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    {activeStep === "business" ? (
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {activeStep === "business" ? "Business Information" : "Supporting Documents"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Not started</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  {activeStep === "business"
                    ? "Provide your business registration details to unlock higher transaction limits and business features."
                    : "Upload supporting documents to complete your verification."}
                </p>

                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start Verification
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-lg glow-purple">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {activeStep === "business" ? "Business Information" : "Upload Document"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeStep === "business" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business Name</label>
                  <Input
                    placeholder="Enter business name"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">RC Number</label>
                  <Input
                    placeholder="Enter RC number"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business Address</label>
                  <Input
                    placeholder="Enter business address"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Document Type</label>
                  <select
                    value={selectedIdType}
                    onChange={(e) => setSelectedIdType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select document type</option>
                    <option value="utility">Utility Bill</option>
                    <option value="bank">Bank Statement</option>
                    <option value="cac">CAC Certificate</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Upload Document</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-foreground mb-1">
                      Drag and drop your file here
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      or click to browse (PDF, JPG, PNG - Max 5MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="border-border text-foreground hover:bg-secondary" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 border-border text-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                disabled={!uploadedFile || !selectedIdType || uploadLoading}
                onClick={async () => {
                  if (!uploadedFile) {
                    setError("Please select a file")
                    return
                  }
                  if (!selectedIdType) {
                    setError("Please select a document type")
                    return
                  }
                  try {
                    setError("")
                    setSuccess("")
                    const docTypeMap: { [key: string]: DocumentType } = {
                      'national': DocumentType.NATIONAL_ID,
                      'passport': DocumentType.PASSPORT,
                      'driver': DocumentType.DRIVERS_LICENSE,
                    }
                    const mappedType = docTypeMap['national'] // Default to national_id for demo
                    await uploadDocuments({
                      document_type: mappedType,
                      document_front: uploadedFile
                    })
                    setSuccess("Document uploaded successfully")
                    setShowModal(false)
                    setUploadedFile(null)
                    setSelectedIdType("")
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Upload failed")
                  }
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {uploadLoading ? "Uploading..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
