import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardText as ClipboardList,
  CreditCard,
  FolderOpen,
  GraduationCap,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Search,
  School,
  Ticket,
  Trophy,
  User,
  UserCircle,
  Users,
  Wallet,
  Wrench,
  type AppIcon,
} from "@/lib/icons/client";

export type PortalNavItem = {
  href: string;
  label: string;
  icon?: AppIcon;
  /** When set, any path under this prefix counts as active. */
  activePrefix?: string;
};

export type PortalNavGroup = {
  label: string;
  items: PortalNavItem[];
};

export type PortalNavConfig = {
  portalTitle: string;
  homeHref: string;
  footerLabel?: string;
  groups: PortalNavGroup[];
  /** Extra paths for dynamic header titles (not shown in sidebar). */
  titleExtras?: { href: string; label: string }[];
  maxContentWidth?: string;
  mainPadding?: string;
};

export function isNavItemActive(
  pathname: string,
  item: PortalNavItem,
): boolean {
  if (item.activePrefix) {
    return (
      pathname === item.activePrefix ||
      pathname.startsWith(`${item.activePrefix}/`)
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function flattenNavItems(config: PortalNavConfig): PortalNavItem[] {
  return config.groups.flatMap((g) => g.items);
}

export function navItemsForTitle(config: PortalNavConfig): {
  href: string;
  label: string;
}[] {
  const flat = flattenNavItems(config).map((item) => ({
    href: item.href,
    label: item.label,
  }));
  return [...flat, ...(config.titleExtras ?? [])];
}

export const studentPortalConfig: PortalNavConfig = {
  portalTitle: "Student",
  homeHref: "/student/dashboard",
  footerLabel: "Pharmacy Academy",
  maxContentWidth: "max-w-[1400px]",
  titleExtras: [
    { href: "/student/browse", label: "Browse" },
    { href: "/student/messages", label: "Messages" },
    { href: "/student/tutors", label: "Tutors" },
    { href: "/student/mentors", label: "Mentors" },
    { href: "/student/purchases", label: "Purchases" },
  ],
  groups: [
    {
      label: "Learning",
      items: [
        { href: "/student/dashboard", label: "My learning", icon: BookOpen },
        { href: "/student/courses", label: "My courses", icon: GraduationCap },
        {
          href: "/student/assignments",
          label: "Assignments",
          icon: ClipboardList,
        },
      ],
    },
    {
      label: "Discover",
      items: [
        { href: "/student/browse", label: "Browse", icon: Search },
        { href: "/student/wishlist", label: "Wishlist", icon: Heart },
      ],
    },
    {
      label: "Connect",
      items: [
        { href: "/student/messages", label: "Messages", icon: MessageSquare },
        { href: "/student/meetings", label: "Meetings", icon: Calendar },
        { href: "/student/tutors", label: "Tutors", icon: School },
        { href: "/student/mentors", label: "Mentors", icon: Users },
      ],
    },
    {
      label: "Progress",
      items: [
        { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/student/achievements", label: "Badges", icon: Award },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/student/purchases", label: "Purchases", icon: CreditCard },
        { href: "/student/profile", label: "Profile", icon: User },
      ],
    },
  ],
};

export const adminPortalConfig: PortalNavConfig = {
  portalTitle: "Admin",
  homeHref: "/admin/dashboard",
  footerLabel: "Pharm LMS Admin Console",
  maxContentWidth: "max-w-[1600px]",
  groups: [
    {
      label: "Main Menu",
      items: [
        {
          href: "/admin/dashboard",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/admin/course-approvals",
          label: "Course oversight",
          icon: ClipboardList,
        },
        { href: "/admin/students", label: "Students", icon: GraduationCap },
        { href: "/admin/tutors", label: "Tutors", icon: BookOpen },
        { href: "/admin/mentors", label: "Mentors", icon: Users },
        {
          href: "/admin/payments/transactions",
          label: "Payments",
          icon: CreditCard,
        },
        { href: "/admin/coupons", label: "Coupons", icon: Ticket },
        { href: "/admin/badges", label: "Badges", icon: Award },
        { href: "/admin/messages", label: "Messages", icon: MessageSquare },
      ],
    },
  ],
  titleExtras: [
    { href: "/admin/users", label: "All users" },
    { href: "/admin/mentor-applications", label: "Mentor applications" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/payments/withdrawals", label: "Payments" },
    { href: "/admin/payments/settings", label: "Payments" },
  ],
};

const TUTOR = "/tutor";

export const tutorPortalConfig: PortalNavConfig = {
  portalTitle: "Tutor",
  homeHref: `${TUTOR}/courses`,
  footerLabel: "Educator Hub",
  maxContentWidth: "max-w-[1600px]",
  groups: [
    {
      label: "Workspace",
      items: [
        { href: `${TUTOR}/courses`, label: "Courses", icon: BookOpen },
        {
          href: `${TUTOR}/communication/messages`,
          label: "Communication",
          icon: MessageSquare,
          activePrefix: `${TUTOR}/communication`,
        },
        {
          href: `${TUTOR}/performance/overview`,
          label: "Performance",
          icon: BarChart3,
          activePrefix: `${TUTOR}/performance`,
        },
        { href: `${TUTOR}/assignments`, label: "Tools", icon: Wrench },
      ],
    },
    {
      label: "Personal",
      items: [
        { href: `${TUTOR}/students`, label: "Resources", icon: FolderOpen },
        { href: `${TUTOR}/meetings`, label: "Meetings", icon: Calendar },
        { href: `${TUTOR}/payouts`, label: "Payouts", icon: Wallet },
        { href: `${TUTOR}/profile`, label: "Profile", icon: UserCircle },
      ],
    },
  ],
};

const MENTOR = "/mentor";

export const mentorPortalConfig: PortalNavConfig = {
  portalTitle: "Mentor",
  homeHref: `${MENTOR}/dashboard`,
  footerLabel: "Mentor Hub",
  maxContentWidth: "max-w-[1600px]",
  groups: [
    {
      label: "Mentor",
      items: [
        {
          href: `${MENTOR}/dashboard`,
          label: "Overview",
          icon: LayoutDashboard,
        },
        { href: `${MENTOR}/meetings`, label: "Meetings", icon: Calendar },
        { href: `${MENTOR}/profile`, label: "Profile", icon: User },
      ],
    },
  ],
  titleExtras: [{ href: `${MENTOR}/meetings/join`, label: "Meetings" }],
};
