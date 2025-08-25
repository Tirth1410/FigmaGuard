"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Loader2, User, Mail, Calendar } from "lucide-react"
import { toast } from "sonner"

interface ProfileModalProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileModal({ user, open, onOpenChange }: ProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
  })
  const [stats, setStats] = useState({
    testsCompleted: 0,
    srsDocuments: 0,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (open && user) {
      loadProfileData()
    }
  }, [open, user])

  const loadProfileData = async () => {
    setLoading(true)
    try {
      // Load profile data
      const { data: profileData } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          avatar_url: profileData.avatar_url || "",
        })
      }

      // Load statistics
      const { data: testRequests } = await supabase
        .from("test_requests")
        .select(`
          *,
          test_reports (*)
        `)
        .eq("user_id", user.id)

      if (testRequests) {
        const completedTests = testRequests.filter((req) =>
          req.test_reports?.some((report) => report.status === "completed"),
        ).length

        setStats({
          testsCompleted: completedTests,
          srsDocuments: testRequests.length,
        })
      }
    } catch (error) {
      console.error("Error loading profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success("Profile updated successfully!")
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const memberSince = new Date(user?.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader />

        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{profile.full_name || user?.email}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="text-sm">{user?.email}</div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <div className="text-sm">{memberSince}</div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-foreground" />
                </div>
                Account Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.testsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Tests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{stats.srsDocuments}</div>
                  <div className="text-sm text-muted-foreground">SRS Documents</div>
                </div>
              </div>
            </div>

            {/* Account Type */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Account Type</span>
              <span className="text-sm text-muted-foreground">Free</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
