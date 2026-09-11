import { useGetProfileQuery } from "@/store/Api/UserApi/UserApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Globe,
  Shield,
  User,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
} from "lucide-react";

// ─── Inline skeleton primitives (per user rules — no full-screen overlays) ─────
const Sk = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700/60 ${className ?? ""}`}
  />
);

// ─── Info row ─────────────────────────────────────────────────────────────────
interface InfoRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  children: React.ReactNode;
  isLoading?: boolean;
  skeletonW?: string;
}

function InfoRow({ icon, iconBg, label, children, isLoading, skeletonW = "w-44" }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 group">
      <div className={`p-2.5 rounded-xl shrink-0 transition-transform duration-150 group-hover:scale-110 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
          {label}
        </p>
        {isLoading ? <Sk className={`h-5 ${skeletonW}`} /> : children}
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden  flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border dark:border-slate-800">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">{icon}</div>
        <h2 className="text-base font-semibold text-gray-700 dark:text-slate-200 tracking-tight">
          {title}
        </h2>
      </div>
      <div className="flex-1 p-3 space-y-0.5">{children}</div>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  isLoading,
}: {
  label: string;
  value?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 border-r border-border dark:border-slate-800 last:border-r-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
        {label}
      </span>
      {isLoading ? (
        <Sk className="h-5 w-28" />
      ) : (
        <span className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: profileData, isLoading, error } = useGetProfileQuery({});
  const user = profileData?.data;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Failed to load profile. Please refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500">

      {/* ── Hero banner — full width ─────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-xl">

        {/* Decorative background blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-blue-100/60 to-violet-100/40 dark:from-blue-900/20 dark:to-violet-900/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/3 w-64 h-32 rounded-full bg-gradient-to-r from-indigo-100/40 to-transparent dark:from-indigo-900/10 blur-2xl pointer-events-none" />

        {/* Hero content */}
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 px-6 pt-8 pb-5">
          {/* Avatar */}
          {isLoading ? (
            <Sk className="h-24 w-24 rounded-full shrink-0" />
          ) : (
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-800">
                <AvatarImage src={user?.profileImage || ""} alt={user?.name} />
                <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Live status dot */}
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${user?.userStatus === "ACTIVE" ? "bg-green-500" : "bg-red-400"
                  }`}
              />
            </div>
          )}

          {/* Identity */}
          <div className="flex-1 text-center sm:text-left">
            {isLoading ? (
              <div className="space-y-2">
                <Sk className="h-8 w-52 mx-auto sm:mx-0" />
                <Sk className="h-4 w-40 mx-auto sm:mx-0" />
                <div className="flex gap-2 justify-center sm:justify-start pt-1">
                  <Sk className="h-6 w-20 rounded-full" />
                  <Sk className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-slate-50 leading-tight tracking-tight">
                  {user?.name}
                </h1>
                {user?.email && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                    {user.email}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border rounded-sm border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                    {user?.role}
                  </Badge>
                  <Badge
                    className={`px-3 py-1 text-xs font-semibold border rounded-sm text-white ${user?.userStatus === "ACTIVE"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                      }`}
                  >
                    {user?.userStatus === "ACTIVE" ? (
                      <CheckCircle2 className="w-3 h-3 mr-1.5" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1.5" />
                    )}
                    {user?.userStatus}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Stat row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border dark:border-slate-800 divide-x divide-gray-100 dark:divide-slate-800">
          <StatChip label="Role" value={user?.role} isLoading={isLoading} />
          <StatChip
            label="Status"
            value={user?.userStatus}
            isLoading={isLoading}
          />
          <StatChip
            label="Member since"
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })
                : undefined
            }
            isLoading={isLoading}
          />
          <StatChip
            label="2FA Security"
            value={user?.verification2FA ? "Enabled" : "Disabled"}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Detail cards — full width, 2 cols ────────────────────────────── */}
      <div className="grid w-full gap-5 grid-cols-1 md:grid-cols-2">

        {/* Contact Information */}
        <SectionCard
          icon={<User className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
          title="Contact Information"
        >
          <InfoRow
            icon={<Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-950/50"
            label="Email Address"
            isLoading={isLoading}
            skeletonW="w-56"
          >
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">
              {user?.email}
            </p>
          </InfoRow>

          <InfoRow
            icon={<Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-100 dark:bg-emerald-950/50"
            label="Phone Number"
            isLoading={isLoading}
            skeletonW="w-36"
          >
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
              {user?.phoneNumber ?? (
                <span className="text-gray-400 dark:text-slate-500 italic font-normal">
                  Not provided
                </span>
              )}
            </p>
          </InfoRow>

          <InfoRow
            icon={<Globe className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
            iconBg="bg-violet-100 dark:bg-violet-950/50"
            label="Language & Timezone"
            isLoading={isLoading}
            skeletonW="w-48"
          >
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {user?.language && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                  {user.language}
                </span>
              )}
              {user?.timezone && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                  {user.timezone}
                </span>
              )}
            </div>
          </InfoRow>
        </SectionCard>

        {/* Account Details */}
        <SectionCard
          icon={<Shield className="h-4 w-4 text-violet-500 dark:text-violet-400" />}
          title="Account Details"
        >
          <InfoRow
            icon={<Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
            iconBg="bg-orange-100 dark:bg-orange-950/50"
            label="Joined Date"
            isLoading={isLoading}
            skeletonW="w-52"
          >
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
              {formatDate(user?.createdAt)}
            </p>
          </InfoRow>

          <InfoRow
            icon={<Clock className="h-4 w-4 text-pink-600 dark:text-pink-400" />}
            iconBg="bg-pink-100 dark:bg-pink-950/50"
            label="Last Active"
            isLoading={isLoading}
            skeletonW="w-52"
          >
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
              {formatDate(user?.lastActive)}
            </p>
          </InfoRow>

          <InfoRow
            icon={<Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
            iconBg="bg-teal-100 dark:bg-teal-950/50"
            label="Two-Factor Authentication"
            isLoading={isLoading}
            skeletonW="w-32"
          >
            <div className="flex items-center gap-2 mt-0.5">
              {user?.verification2FA ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                  <Lock className="w-3 h-3" />
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                  <Unlock className="w-3 h-3" />
                  Disabled
                </span>
              )}
            </div>
          </InfoRow>
        </SectionCard>
      </div>
    </div>
  );
}
