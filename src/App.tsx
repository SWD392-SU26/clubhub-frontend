import { Navigate, Route, Routes } from "react-router-dom";
import {
  RequireClubAdmin,
  RequireGuest,
  RequireGuestLanding,
  RequireStudent,
  RequireUniversityAdmin,
} from "./authGuards";
import { AuthBootstrap } from "./AuthBootstrap";
import { AdminLayout, PublicLayout, StudentLayout } from "./components";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./pages/AuthPages";
import {
  ClubDetailPage,
  ClubsExplorePage,
  EventDetailPage,
  EventsExplorePage,
  HomePage,
  SharedStatesPage,
  StyleGuidePage,
} from "./pages/PublicPages";
import {
  AccountSecurityPage,
  ClubProposalDetailPage,
  ClubProposalsPage,
  EditProfilePage,
  JoinRequestsPage,
  MyClubsPage,
  MyEventsPage,
  NotificationsPage,
  PointsHistoryPage,
  ProfilePage,
  ProposalStepPage,
  StudentDashboard,
} from "./pages/StudentPages";
import {
  CancelEventPage,
  CheckInPage,
  ClubAdminDashboard,
  ClubAuditLogPage,
  ClubJoinRequestsAdminPage,
  ClubSettingsPage,
  ClubStatisticsPage,
  ClubStatusPage,
  CreateEventPage,
  EventAdminDetailPage,
  EventsManagementPage,
  FeedbackManagementPage,
  MemberDetailPage,
  MembersPage,
  OfficialClubCreatePage,
  PlatformStatisticsPage,
  PointsManagementPage,
  ProposalReviewPage,
  SystemAdminDashboard,
  SystemAuditLogPage,
  SystemClubDetailPage,
  SystemClubsPage,
  SystemProposalsPage,
  SystemSettingsPage,
  TransferOwnershipPage,
  UserSecurityDetailPage,
  UsersManagementPage,
} from "./pages/AdminPages";
export default function App() {
  return (
    <AuthBootstrap>
      <Routes>
        <Route element={<RequireGuestLanding />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="/style-guide" element={<StyleGuidePage />} />
          <Route path="/clubs" element={<ClubsExplorePage />} />
          <Route path="/clubs/:id" element={<ClubDetailPage />} />
          <Route path="/events" element={<EventsExplorePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/system-states" element={<SharedStatesPage />} />
        </Route>
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/compact" element={<LoginPage compact />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<RequireStudent />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/account/security" element={<AccountSecurityPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/my-clubs" element={<MyClubsPage />} />
            <Route path="/my-clubs/:id" element={<ClubDetailPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/my-events/:id" element={<EventDetailPage />} />
            <Route path="/join-requests" element={<JoinRequestsPage />} />
            <Route path="/club-proposals" element={<ClubProposalsPage />} />
            <Route
              path="/club-proposals/:id"
              element={<ClubProposalDetailPage />}
            />
            <Route
              path="/club-proposals/new/step-1"
              element={<ProposalStepPage step={1} />}
            />
            <Route
              path="/club-proposals/new/step-2"
              element={<ProposalStepPage step={2} />}
            />
            <Route
              path="/club-proposals/new/step-3"
              element={<ProposalStepPage step={3} />}
            />
            <Route
              path="/club-proposals/new/step-4"
              element={<ProposalStepPage step={4} />}
            />
            <Route
              path="/club-proposals/new/step-5"
              element={<ProposalStepPage step={5} />}
            />
            <Route path="/activity/points" element={<PointsHistoryPage />} />
          </Route>
        </Route>
        <Route element={<RequireClubAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/club-admin" element={<ClubAdminDashboard />} />
            <Route path="/club-admin/profile" element={<ProfilePage />} />
            <Route
              path="/club-admin/profile/edit"
              element={<EditProfilePage />}
            />
            <Route
              path="/club-admin/account/security"
              element={<AccountSecurityPage />}
            />
            <Route path="/club-admin/members" element={<MembersPage />} />
            <Route
              path="/club-admin/members/:id"
              element={<MemberDetailPage />}
            />
            <Route
              path="/club-admin/join-requests"
              element={<ClubJoinRequestsAdminPage />}
            />
            <Route
              path="/club-admin/events"
              element={<EventsManagementPage />}
            />
            <Route path="/club-admin/events/new" element={<CreateEventPage />} />
            <Route
              path="/club-admin/events/cancel"
              element={<CancelEventPage />}
            />
            <Route
              path="/club-admin/events/:id"
              element={<EventAdminDetailPage />}
            />
            <Route path="/club-admin/check-in" element={<CheckInPage />} />
            <Route
              path="/club-admin/feedback"
              element={<FeedbackManagementPage />}
            />
            <Route
              path="/club-admin/points"
              element={<PointsManagementPage />}
            />
            <Route
              path="/club-admin/statistics"
              element={<ClubStatisticsPage />}
            />
            <Route path="/club-admin/audit-log" element={<ClubAuditLogPage />} />
            <Route path="/club-admin/settings" element={<ClubSettingsPage />} />
            <Route
              path="/club-admin/transfer"
              element={<TransferOwnershipPage />}
            />
            <Route path="/club-admin/status" element={<ClubStatusPage />} />
          </Route>
        </Route>
        <Route element={<RequireUniversityAdmin />}>
          <Route element={<AdminLayout system />}>
            <Route path="/system-admin" element={<SystemAdminDashboard />} />
            <Route path="/system-admin/profile" element={<ProfilePage />} />
            <Route
              path="/system-admin/profile/edit"
              element={<EditProfilePage />}
            />
            <Route
              path="/system-admin/account/security"
              element={<AccountSecurityPage />}
            />
            <Route
              path="/system-admin/proposals"
              element={<SystemProposalsPage />}
            />
            <Route
              path="/system-admin/proposals/:id"
              element={<ProposalReviewPage />}
            />
            <Route path="/system-admin/clubs" element={<SystemClubsPage />} />
            <Route
              path="/system-admin/clubs/new"
              element={<OfficialClubCreatePage />}
            />
            <Route
              path="/system-admin/clubs/:id"
              element={<SystemClubDetailPage />}
            />
            <Route path="/system-admin/users" element={<UsersManagementPage />} />
            <Route
              path="/system-admin/users/:id"
              element={<UserSecurityDetailPage />}
            />
            <Route
              path="/system-admin/audit-log"
              element={<SystemAuditLogPage />}
            />
            <Route
              path="/system-admin/statistics"
              element={<PlatformStatisticsPage />}
            />
            <Route
              path="/system-admin/settings"
              element={<SystemSettingsPage />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthBootstrap>
  );
}
